-- ============================================================
-- Easy Drive — Initial Database Schema
-- Migration: 0001_initial_schema.sql
-- ============================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── ENUMS ─────────────────────────────────────────────────────────────────────

CREATE TYPE user_role AS ENUM ('admin', 'renter');

CREATE TYPE vehicle_status AS ENUM (
  'available',      -- ready to rent
  'rented',         -- currently out with a renter
  'maintenance',    -- in for service
  'inactive'        -- retired from fleet
);

CREATE TYPE application_status AS ENUM (
  'pending',        -- submitted, awaiting admin review
  'approved',       -- approved, rental being set up
  'rejected',       -- rejected with reason
  'cancelled'       -- applicant withdrew
);

CREATE TYPE rental_status AS ENUM (
  'pending_payment',    -- approved, waiting for Stripe setup
  'pending_signature',  -- Stripe set up, awaiting signed agreement
  'active',             -- vehicle out, payments running
  'ended',              -- returned normally
  'terminated'          -- ended early (breach, non-payment, etc.)
);

CREATE TYPE payment_type AS ENUM (
  'weekly_rent',
  'deposit_capture',
  'deposit_refund',
  'late_fee',
  'damage_fee'
);

CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'failed', 'refunded');

CREATE TYPE inspection_type AS ENUM ('intake', 'return', 'spot_check');

CREATE TYPE alert_type AS ENUM (
  'geofence_breach',
  'payment_failed',
  'kill_switch_activated',
  'kill_switch_deactivated',
  'vehicle_speeding',
  'rental_overdue',
  'safety_cert_expiring',
  'plate_renewal_due'
);

CREATE TYPE alert_severity AS ENUM ('info', 'warning', 'critical');

-- ── PROFILES ──────────────────────────────────────────────────────────────────

CREATE TABLE profiles (
  id                        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_user_id              UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  role                      user_role NOT NULL DEFAULT 'renter',
  full_name                 TEXT NOT NULL,
  phone                     TEXT,
  email                     TEXT NOT NULL,
  ontario_licence_number    TEXT,
  licence_class             TEXT,                     -- G, G2
  at_fault_accidents        INT DEFAULT 0,
  licence_suspended         BOOLEAN DEFAULT FALSE,
  gig_platform              TEXT,                     -- 'uber_eats' | 'doordash' | 'skip' | 'instacart'
  gig_account_screenshot_url TEXT,
  id_document_url           TEXT,                     -- Supabase Storage path
  driver_abstract_url       TEXT,
  created_at                TIMESTAMPTZ DEFAULT NOW()
);

-- ── VEHICLES ──────────────────────────────────────────────────────────────────

CREATE TABLE vehicles (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  make                  TEXT NOT NULL,
  model                 TEXT NOT NULL,
  year                  INT NOT NULL,
  vin                   TEXT UNIQUE NOT NULL,
  plate_number          TEXT UNIQUE NOT NULL,
  colour                TEXT,
  purchase_price_cad    INT,                          -- cents avoided; store as dollars
  odometer_km           INT NOT NULL DEFAULT 0,
  status                vehicle_status NOT NULL DEFAULT 'available',
  bouncie_device_id     TEXT,                         -- from Bouncie dashboard
  passtime_device_id    TEXT,                         -- kill switch device ID
  kill_switch_enabled   BOOLEAN DEFAULT FALSE,
  safety_cert_expires   DATE,
  plate_renewal_date    DATE,
  notes                 TEXT,
  created_at            TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW()
);

-- ── APPLICATIONS ──────────────────────────────────────────────────────────────

CREATE TABLE applications (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  applicant_id      UUID NOT NULL REFERENCES profiles(id),
  status            application_status NOT NULL DEFAULT 'pending',
  rejection_reason  TEXT,
  reviewed_by       UUID REFERENCES profiles(id),
  submitted_at      TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at       TIMESTAMPTZ
);

-- ── RENTALS ───────────────────────────────────────────────────────────────────

CREATE TABLE rentals (
  id                          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  renter_id                   UUID NOT NULL REFERENCES profiles(id),
  vehicle_id                  UUID NOT NULL REFERENCES vehicles(id),
  application_id              UUID NOT NULL REFERENCES applications(id),
  status                      rental_status NOT NULL DEFAULT 'pending_payment',
  weekly_rate_cad             INT NOT NULL,            -- e.g. 300, 350, 400
  deposit_cad                 INT NOT NULL DEFAULT 500,
  stripe_customer_id          TEXT,
  stripe_subscription_id      TEXT,
  stripe_deposit_intent_id    TEXT,
  pandadoc_document_id        TEXT,
  pandadoc_status             TEXT,                    -- 'sent' | 'viewed' | 'completed'
  start_date                  DATE,
  end_date                    DATE,
  notes                       TEXT,
  created_at                  TIMESTAMPTZ DEFAULT NOW(),
  updated_at                  TIMESTAMPTZ DEFAULT NOW()
);

-- Prevent double-renting a vehicle
CREATE UNIQUE INDEX rentals_active_vehicle_idx
  ON rentals(vehicle_id)
  WHERE status IN ('pending_payment', 'pending_signature', 'active');

-- ── PAYMENTS ──────────────────────────────────────────────────────────────────

CREATE TABLE payments (
  id                        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  rental_id                 UUID NOT NULL REFERENCES rentals(id),
  type                      payment_type NOT NULL,
  amount_cad                INT NOT NULL,
  status                    payment_status NOT NULL DEFAULT 'pending',
  stripe_payment_intent_id  TEXT,
  stripe_invoice_id         TEXT,
  failure_reason            TEXT,
  paid_at                   TIMESTAMPTZ,
  created_at                TIMESTAMPTZ DEFAULT NOW()
);

-- ── INSPECTIONS ───────────────────────────────────────────────────────────────

CREATE TABLE inspections (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vehicle_id      UUID NOT NULL REFERENCES vehicles(id),
  rental_id       UUID REFERENCES rentals(id),
  conducted_by    UUID NOT NULL REFERENCES profiles(id),
  type            inspection_type NOT NULL,
  odometer_km     INT,
  notes           TEXT,
  photo_urls      JSONB DEFAULT '[]'::JSONB,           -- array of Supabase Storage paths
  conducted_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ── MAINTENANCE ───────────────────────────────────────────────────────────────

CREATE TABLE maintenance (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vehicle_id        UUID NOT NULL REFERENCES vehicles(id),
  type              TEXT NOT NULL,                     -- 'oil_change' | 'tires' | 'brakes' | 'other'
  cost_cad          INT,
  odometer_at_service INT,
  shop_name         TEXT,
  notes             TEXT,
  receipt_url       TEXT,
  serviced_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ── GPS EVENTS ────────────────────────────────────────────────────────────────

CREATE TABLE gps_events (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vehicle_id        UUID NOT NULL REFERENCES vehicles(id),
  event_type        TEXT NOT NULL,                     -- 'location_update' | 'geofence_exit' | 'ignition_on' | 'ignition_off'
  lat               DECIMAL(10, 7),
  lng               DECIMAL(10, 7),
  speed_kmh         INT,
  geofence_breach   BOOLEAN DEFAULT FALSE,
  raw_payload       JSONB,
  occurred_at       TIMESTAMPTZ NOT NULL
);

-- Partition candidate at scale; for now simple index on time + vehicle
CREATE INDEX gps_events_vehicle_time_idx ON gps_events(vehicle_id, occurred_at DESC);

-- ── ALERTS ────────────────────────────────────────────────────────────────────

CREATE TABLE alerts (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vehicle_id        UUID REFERENCES vehicles(id),
  rental_id         UUID REFERENCES rentals(id),
  type              alert_type NOT NULL,
  severity          alert_severity NOT NULL DEFAULT 'info',
  message           TEXT NOT NULL,
  metadata          JSONB,                             -- flexible extra context
  acknowledged      BOOLEAN DEFAULT FALSE,
  acknowledged_by   UUID REFERENCES profiles(id),
  acknowledged_at   TIMESTAMPTZ,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX alerts_unacknowledged_idx ON alerts(created_at DESC) WHERE acknowledged = FALSE;

-- ── UPDATED_AT TRIGGERS ───────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER vehicles_updated_at
  BEFORE UPDATE ON vehicles
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER rentals_updated_at
  BEFORE UPDATE ON rentals
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ── ROW LEVEL SECURITY ────────────────────────────────────────────────────────

ALTER TABLE profiles     ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles     ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE rentals      ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments     ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspections  ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance  ENABLE ROW LEVEL SECURITY;
ALTER TABLE gps_events   ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts       ENABLE ROW LEVEL SECURITY;

-- Helper: is the current user an admin?
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE auth_user_id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Helper: get current user's profile id
CREATE OR REPLACE FUNCTION my_profile_id()
RETURNS UUID AS $$
  SELECT id FROM profiles WHERE auth_user_id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

-- PROFILES
CREATE POLICY "own_profile_read"   ON profiles FOR SELECT USING (auth_user_id = auth.uid() OR is_admin());
CREATE POLICY "own_profile_update" ON profiles FOR UPDATE USING (auth_user_id = auth.uid());
CREATE POLICY "admin_all_profiles" ON profiles FOR ALL    USING (is_admin());

-- VEHICLES — renters see available vehicles; admins see all
CREATE POLICY "renter_see_available" ON vehicles FOR SELECT USING (status = 'available' OR is_admin());
CREATE POLICY "admin_manage_vehicles" ON vehicles FOR ALL  USING (is_admin());

-- APPLICATIONS
CREATE POLICY "own_application"       ON applications FOR SELECT USING (applicant_id = my_profile_id() OR is_admin());
CREATE POLICY "renter_submit"         ON applications FOR INSERT WITH CHECK (applicant_id = my_profile_id());
CREATE POLICY "admin_manage_apps"     ON applications FOR ALL USING (is_admin());

-- RENTALS
CREATE POLICY "own_rental_read"       ON rentals FOR SELECT USING (renter_id = my_profile_id() OR is_admin());
CREATE POLICY "admin_manage_rentals"  ON rentals FOR ALL    USING (is_admin());

-- PAYMENTS
CREATE POLICY "own_payments_read"     ON payments FOR SELECT
  USING (rental_id IN (SELECT id FROM rentals WHERE renter_id = my_profile_id()) OR is_admin());
CREATE POLICY "admin_manage_payments" ON payments FOR ALL USING (is_admin());

-- INSPECTIONS
CREATE POLICY "own_inspections_read"  ON inspections FOR SELECT
  USING (rental_id IN (SELECT id FROM rentals WHERE renter_id = my_profile_id()) OR is_admin());
CREATE POLICY "admin_manage_inspections" ON inspections FOR ALL USING (is_admin());

-- MAINTENANCE, GPS, ALERTS — admin only
CREATE POLICY "admin_maintenance" ON maintenance FOR ALL USING (is_admin());
CREATE POLICY "admin_gps"         ON gps_events  FOR ALL USING (is_admin());
CREATE POLICY "admin_alerts"      ON alerts      FOR ALL USING (is_admin());

-- ── STORAGE BUCKETS ───────────────────────────────────────────────────────────
-- Run these via Supabase dashboard or CLI:
--
-- INSERT INTO storage.buckets (id, name, public) VALUES ('documents', 'documents', false);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('inspections', 'inspections', false);
--
-- Storage RLS: only admins and the owning renter can access their own files.
-- Use signed URLs (1-hour expiry) for all file delivery — never public URLs.
