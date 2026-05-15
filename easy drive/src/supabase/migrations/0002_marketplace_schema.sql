-- ============================================================
-- Easy Drive — Marketplace Migration
-- Migration: 0002_marketplace_schema.sql
-- Migrates from v1.0 (fleet model) to v2.0 (P2P marketplace)
-- ============================================================

-- ── NEW ENUMS ─────────────────────────────────────────────────────────────────

-- Extend user_role to include host
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'host';

-- Listing lifecycle
CREATE TYPE listing_status AS ENUM (
  'draft',           -- created by host, not yet submitted
  'pending_review',  -- submitted for admin review
  'approved',        -- admin approved but host hasn't activated
  'active',          -- live on marketplace
  'paused',          -- host temporarily hidden it
  'delisted'         -- permanently removed
);

-- Booking lifecycle
CREATE TYPE booking_status AS ENUM (
  'requested',   -- renter requested, awaiting host confirmation
  'confirmed',   -- host accepted
  'declined',    -- host declined
  'active',      -- vehicle handed over, rental in progress
  'completed',   -- returned normally
  'cancelled',   -- cancelled before activation
  'disputed'     -- damage or payment dispute open
);

-- Host onboarding / standing
CREATE TYPE host_status AS ENUM (
  'pending',
  'approved',
  'suspended',
  'rejected'
);

-- Renter application standing
CREATE TYPE renter_status AS ENUM (
  'pending',
  'approved',
  'suspended',
  'rejected'
);

-- Review direction
CREATE TYPE review_direction AS ENUM (
  'host_to_renter',
  'renter_to_host',
  'renter_to_vehicle'
);

-- Kill switch action
CREATE TYPE kill_switch_action AS ENUM (
  'disable',
  'enable'
);

-- Payout lifecycle
CREATE TYPE payout_status AS ENUM (
  'pending',
  'in_transit',
  'paid',
  'failed'
);

-- Stripe Connect account standing
CREATE TYPE stripe_connect_status AS ENUM (
  'not_started',
  'onboarding',
  'onboarded',
  'restricted'
);

-- ── PROFILES — ADD MARKETPLACE COLUMNS ────────────────────────────────────────

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS host_status            host_status,
  ADD COLUMN IF NOT EXISTS renter_status          renter_status,
  ADD COLUMN IF NOT EXISTS stripe_connect_account_id TEXT,
  ADD COLUMN IF NOT EXISTS stripe_connect_status  stripe_connect_status DEFAULT 'not_started',
  ADD COLUMN IF NOT EXISTS stripe_customer_id     TEXT,
  ADD COLUMN IF NOT EXISTS avg_rating_as_host     NUMERIC(3,2),
  ADD COLUMN IF NOT EXISTS avg_rating_as_renter   NUMERIC(3,2),
  ADD COLUMN IF NOT EXISTS rentals_completed_as_host   INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS rentals_completed_as_renter INT DEFAULT 0;

-- ── VEHICLES — ADD MARKETPLACE COLUMNS ────────────────────────────────────────

ALTER TABLE vehicles
  ADD COLUMN IF NOT EXISTS host_id                    UUID REFERENCES profiles(id),
  ADD COLUMN IF NOT EXISTS weekly_rate_cad            INT,
  ADD COLUMN IF NOT EXISTS listing_status             listing_status DEFAULT 'draft',
  ADD COLUMN IF NOT EXISTS auto_accept_bookings       BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS insurance_cert_url         TEXT,
  ADD COLUMN IF NOT EXISTS insurance_cert_expires     DATE,
  ADD COLUMN IF NOT EXISTS insurance_covers_delivery  BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS safety_cert_url            TEXT,
  ADD COLUMN IF NOT EXISTS avg_rating                 NUMERIC(3,2),
  ADD COLUMN IF NOT EXISTS rejection_reason           TEXT,
  ADD COLUMN IF NOT EXISTS city                       TEXT,
  ADD COLUMN IF NOT EXISTS pickup_postal_code         TEXT,
  ADD COLUMN IF NOT EXISTS transmission               TEXT,   -- 'automatic' | 'manual'
  ADD COLUMN IF NOT EXISTS fuel_type                  TEXT,   -- 'gasoline' | 'hybrid' | 'electric'
  ADD COLUMN IF NOT EXISTS seats                      INT,
  ADD COLUMN IF NOT EXISTS trim                       TEXT;

-- ── LISTING PHOTOS ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS listing_photos (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vehicle_id   UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  sort_order   INT  NOT NULL DEFAULT 0,
  is_primary   BOOLEAN NOT NULL DEFAULT FALSE,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX listing_photos_vehicle_idx ON listing_photos(vehicle_id, sort_order);

-- ── LISTING APPLICATIONS ───────────────────────────────────────────────────────
-- Host submits a vehicle for admin approval before it goes live.

CREATE TABLE IF NOT EXISTS listing_applications (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vehicle_id   UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  host_id      UUID NOT NULL REFERENCES profiles(id),
  status       application_status NOT NULL DEFAULT 'pending',
  admin_notes  TEXT,
  reviewed_by  UUID REFERENCES profiles(id),
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at  TIMESTAMPTZ
);

CREATE INDEX listing_applications_host_idx    ON listing_applications(host_id);
CREATE INDEX listing_applications_status_idx  ON listing_applications(status);

-- ── AVAILABILITY BLOCKS ────────────────────────────────────────────────────────
-- Hosts block dates; bookings also create blocks. GiST exclusion prevents overlap.

CREATE EXTENSION IF NOT EXISTS btree_gist;

CREATE TABLE IF NOT EXISTS availability_blocks (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vehicle_id  UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  start_date  DATE NOT NULL,
  end_date    DATE NOT NULL,
  reason      TEXT,             -- 'booked' | 'maintenance' | 'personal' | 'blocked'
  booking_id  UUID,             -- FK set after bookings table is created
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT no_overlap EXCLUDE USING gist (
    vehicle_id WITH =,
    daterange(start_date, end_date, '[]') WITH &&
  )
);

CREATE INDEX availability_blocks_vehicle_idx ON availability_blocks(vehicle_id, start_date);

-- ── RENTER APPLICATIONS ────────────────────────────────────────────────────────
-- Separate from host applications; replaces the old 'applications' table concept
-- for the marketplace. Old 'applications' table kept for backward compat.

CREATE TABLE IF NOT EXISTS renter_applications (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  renter_id        UUID NOT NULL REFERENCES profiles(id),
  status           renter_status NOT NULL DEFAULT 'pending',
  rejection_reason TEXT,
  reviewed_by      UUID REFERENCES profiles(id),
  submitted_at     TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at      TIMESTAMPTZ
);

CREATE INDEX renter_applications_renter_idx  ON renter_applications(renter_id);
CREATE INDEX renter_applications_status_idx  ON renter_applications(status);

-- ── BOOKINGS ──────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS bookings (
  id                        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  renter_id                 UUID NOT NULL REFERENCES profiles(id),
  host_id                   UUID NOT NULL REFERENCES profiles(id),  -- denormalized from vehicle
  vehicle_id                UUID NOT NULL REFERENCES vehicles(id),
  status                    booking_status NOT NULL DEFAULT 'requested',
  start_date                DATE NOT NULL,
  end_date                  DATE,                                    -- nullable for open-ended weekly
  weekly_rate_cad           INT NOT NULL,
  platform_fee_cad          INT NOT NULL,                           -- 20% of weekly_rate_cad
  deposit_cad               INT NOT NULL DEFAULT 500,
  stripe_payment_intent_id  TEXT,
  stripe_subscription_id    TEXT,
  pandadoc_document_id      TEXT,
  notes                     TEXT,
  created_at                TIMESTAMPTZ DEFAULT NOW(),
  updated_at                TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX bookings_renter_idx  ON bookings(renter_id);
CREATE INDEX bookings_host_idx    ON bookings(host_id);
CREATE INDEX bookings_vehicle_idx ON bookings(vehicle_id, status);

-- Add FK from availability_blocks to bookings now that bookings table exists
ALTER TABLE availability_blocks
  ADD CONSTRAINT availability_blocks_booking_fk
  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE SET NULL;

-- ── PAYOUTS ───────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS payouts (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  host_id          UUID NOT NULL REFERENCES profiles(id),
  stripe_payout_id TEXT,
  amount_cad       INT NOT NULL,
  status           payout_status NOT NULL DEFAULT 'pending',
  period_start     DATE,
  period_end       DATE,
  arrival_date     DATE,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX payouts_host_idx ON payouts(host_id, created_at DESC);

-- ── DAMAGE CLAIMS ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS damage_claims (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id          UUID NOT NULL REFERENCES bookings(id),
  submitted_by        UUID NOT NULL REFERENCES profiles(id),
  description         TEXT NOT NULL,
  photo_urls          JSONB DEFAULT '[]'::JSONB,
  estimated_cost_cad  INT,
  status              TEXT NOT NULL DEFAULT 'open',    -- 'open' | 'under_review' | 'resolved' | 'closed'
  deposit_applied_cad INT DEFAULT 0,
  resolved_by         UUID REFERENCES profiles(id),
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  resolved_at         TIMESTAMPTZ
);

CREATE INDEX damage_claims_booking_idx ON damage_claims(booking_id);

-- ── REVIEWS ───────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS reviews (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id  UUID NOT NULL REFERENCES bookings(id),
  author_id   UUID NOT NULL REFERENCES profiles(id),
  subject_id  UUID REFERENCES profiles(id),           -- null if vehicle review
  vehicle_id  UUID REFERENCES vehicles(id),           -- null if person review
  direction   review_direction NOT NULL,
  rating      INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment     TEXT,
  is_public   BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT one_review_per_direction UNIQUE (booking_id, author_id, direction)
);

CREATE INDEX reviews_subject_idx ON reviews(subject_id) WHERE subject_id IS NOT NULL;
CREATE INDEX reviews_vehicle_idx ON reviews(vehicle_id) WHERE vehicle_id IS NOT NULL;

-- ── KILL SWITCH LOGS ──────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS kill_switch_logs (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vehicle_id        UUID NOT NULL REFERENCES vehicles(id),
  booking_id        UUID REFERENCES bookings(id),
  initiated_by      UUID NOT NULL REFERENCES profiles(id),
  initiator_role    user_role NOT NULL,
  action            kill_switch_action NOT NULL,
  reason            TEXT NOT NULL,
  bouncie_response  JSONB,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX kill_switch_logs_vehicle_idx ON kill_switch_logs(vehicle_id, created_at DESC);

-- ── MESSAGES (Phase 2 scaffold) ───────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS messages (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id          UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  sender_id           UUID NOT NULL REFERENCES profiles(id),
  body                TEXT NOT NULL,
  read_by_recipient   BOOLEAN DEFAULT FALSE,
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX messages_booking_idx ON messages(booking_id, created_at ASC);

-- ── UPDATE ALERTS TABLE ────────────────────────────────────────────────────────

ALTER TABLE alerts
  ADD COLUMN IF NOT EXISTS host_id   UUID REFERENCES profiles(id),
  ADD COLUMN IF NOT EXISTS audience  TEXT DEFAULT 'admin';  -- 'admin' | 'host' | 'renter' | 'all'

-- ── UPDATE PAYMENTS TABLE ─────────────────────────────────────────────────────

ALTER TABLE payments
  ADD COLUMN IF NOT EXISTS booking_id          UUID REFERENCES bookings(id),
  ADD COLUMN IF NOT EXISTS amount_total_cad    INT,
  ADD COLUMN IF NOT EXISTS amount_host_cad     INT,
  ADD COLUMN IF NOT EXISTS amount_platform_cad INT,
  ADD COLUMN IF NOT EXISTS stripe_fee_cad      INT,
  ADD COLUMN IF NOT EXISTS stripe_transfer_id  TEXT;

-- ── BOOKINGS UPDATED_AT TRIGGER ───────────────────────────────────────────────

CREATE TRIGGER bookings_updated_at
  BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ── HELPER FUNCTIONS ──────────────────────────────────────────────────────────

-- Is current user a host?
CREATE OR REPLACE FUNCTION is_host()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE auth_user_id = auth.uid() AND role = 'host'
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Is current user an approved host?
CREATE OR REPLACE FUNCTION is_approved_host()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE auth_user_id = auth.uid()
      AND role = 'host'
      AND host_status = 'approved'
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Is current user an approved renter?
CREATE OR REPLACE FUNCTION is_approved_renter()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE auth_user_id = auth.uid()
      AND role = 'renter'
      AND renter_status = 'approved'
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Is host the owner of a given vehicle?
CREATE OR REPLACE FUNCTION owns_vehicle(p_vehicle_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM vehicles v
    JOIN profiles p ON p.id = v.host_id
    WHERE v.id = p_vehicle_id AND p.auth_user_id = auth.uid()
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Are renter and host bound by a recent/active booking?
CREATE OR REPLACE FUNCTION bound_by_booking(other_profile_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM bookings b
    JOIN profiles p ON p.auth_user_id = auth.uid()
    WHERE
      (b.renter_id = p.id AND b.host_id = other_profile_id)
      OR (b.host_id = p.id AND b.renter_id = other_profile_id)
      AND b.status IN ('confirmed', 'active', 'completed')
      AND b.created_at > NOW() - INTERVAL '90 days'
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- ── ROW LEVEL SECURITY — NEW TABLES ──────────────────────────────────────────

ALTER TABLE listing_photos      ENABLE ROW LEVEL SECURITY;
ALTER TABLE listing_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE availability_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE renter_applications  ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings             ENABLE ROW LEVEL SECURITY;
ALTER TABLE payouts              ENABLE ROW LEVEL SECURITY;
ALTER TABLE damage_claims        ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews              ENABLE ROW LEVEL SECURITY;
ALTER TABLE kill_switch_logs     ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages             ENABLE ROW LEVEL SECURITY;

-- PROFILES — extend existing policies
-- Hosts and renters can read each other's profiles when bound by a booking
CREATE POLICY "booking_bound_profile_read"
  ON profiles FOR SELECT
  USING (bound_by_booking(id));

-- VEHICLES
-- Drop old v1.0 policies and replace with marketplace policies
DROP POLICY IF EXISTS "renter_see_available"  ON vehicles;
DROP POLICY IF EXISTS "admin_manage_vehicles" ON vehicles;

CREATE POLICY "public_see_active_listings"
  ON vehicles FOR SELECT
  USING (listing_status = 'active');

CREATE POLICY "host_see_own_vehicles"
  ON vehicles FOR SELECT
  USING (owns_vehicle(id));

CREATE POLICY "host_manage_own_vehicles"
  ON vehicles FOR ALL
  USING (owns_vehicle(id));

CREATE POLICY "admin_all_vehicles"
  ON vehicles FOR ALL
  USING (is_admin());

-- LISTING PHOTOS
CREATE POLICY "anyone_see_photos_of_active"
  ON listing_photos FOR SELECT
  USING (
    vehicle_id IN (SELECT id FROM vehicles WHERE listing_status = 'active')
    OR is_admin()
    OR owns_vehicle(vehicle_id)
  );

CREATE POLICY "host_manage_own_photos"
  ON listing_photos FOR ALL
  USING (owns_vehicle(vehicle_id));

CREATE POLICY "admin_all_photos"
  ON listing_photos FOR ALL
  USING (is_admin());

-- LISTING APPLICATIONS
CREATE POLICY "host_own_listing_applications"
  ON listing_applications FOR SELECT
  USING (host_id = my_profile_id() OR is_admin());

CREATE POLICY "host_submit_listing_application"
  ON listing_applications FOR INSERT
  WITH CHECK (host_id = my_profile_id());

CREATE POLICY "admin_all_listing_applications"
  ON listing_applications FOR ALL
  USING (is_admin());

-- AVAILABILITY BLOCKS
CREATE POLICY "anyone_see_availability"
  ON availability_blocks FOR SELECT
  USING (TRUE);  -- public for browsing; no sensitive data

CREATE POLICY "host_manage_own_availability"
  ON availability_blocks FOR ALL
  USING (owns_vehicle(vehicle_id));

CREATE POLICY "admin_all_availability"
  ON availability_blocks FOR ALL
  USING (is_admin());

-- RENTER APPLICATIONS
CREATE POLICY "own_renter_application"
  ON renter_applications FOR SELECT
  USING (renter_id = my_profile_id() OR is_admin());

CREATE POLICY "renter_submit_application"
  ON renter_applications FOR INSERT
  WITH CHECK (renter_id = my_profile_id());

CREATE POLICY "admin_all_renter_applications"
  ON renter_applications FOR ALL
  USING (is_admin());

-- BOOKINGS
CREATE POLICY "renter_own_bookings"
  ON bookings FOR SELECT
  USING (renter_id = my_profile_id());

CREATE POLICY "host_own_bookings"
  ON bookings FOR SELECT
  USING (host_id = my_profile_id());

CREATE POLICY "renter_create_booking"
  ON bookings FOR INSERT
  WITH CHECK (renter_id = my_profile_id() AND is_approved_renter());

CREATE POLICY "host_update_own_bookings"
  ON bookings FOR UPDATE
  USING (host_id = my_profile_id());

CREATE POLICY "admin_all_bookings"
  ON bookings FOR ALL
  USING (is_admin());

-- PAYOUTS
CREATE POLICY "host_own_payouts"
  ON payouts FOR SELECT
  USING (host_id = my_profile_id());

CREATE POLICY "admin_all_payouts"
  ON payouts FOR ALL
  USING (is_admin());

-- DAMAGE CLAIMS
CREATE POLICY "booking_party_damage_claims"
  ON damage_claims FOR SELECT
  USING (
    submitted_by = my_profile_id()
    OR booking_id IN (SELECT id FROM bookings WHERE host_id = my_profile_id())
    OR booking_id IN (SELECT id FROM bookings WHERE renter_id = my_profile_id())
    OR is_admin()
  );

CREATE POLICY "booking_party_submit_damage"
  ON damage_claims FOR INSERT
  WITH CHECK (
    submitted_by = my_profile_id()
    AND booking_id IN (
      SELECT id FROM bookings
      WHERE (renter_id = my_profile_id() OR host_id = my_profile_id())
        AND status IN ('active', 'completed', 'disputed')
    )
  );

CREATE POLICY "admin_all_damage_claims"
  ON damage_claims FOR ALL
  USING (is_admin());

-- REVIEWS
CREATE POLICY "public_read_reviews"
  ON reviews FOR SELECT
  USING (is_public = TRUE OR author_id = my_profile_id() OR is_admin());

CREATE POLICY "author_write_review"
  ON reviews FOR INSERT
  WITH CHECK (author_id = my_profile_id());

CREATE POLICY "admin_all_reviews"
  ON reviews FOR ALL
  USING (is_admin());

-- KILL SWITCH LOGS
-- Hosts can read logs for their own vehicles; admins can see everything
CREATE POLICY "host_own_kill_switch_logs"
  ON kill_switch_logs FOR SELECT
  USING (owns_vehicle(vehicle_id) OR is_admin());

CREATE POLICY "admin_all_kill_switch_logs"
  ON kill_switch_logs FOR ALL
  USING (is_admin());

-- MESSAGES
CREATE POLICY "booking_party_messages"
  ON messages FOR ALL
  USING (
    booking_id IN (
      SELECT id FROM bookings
      WHERE renter_id = my_profile_id() OR host_id = my_profile_id()
    )
    OR is_admin()
  );

-- ── STORAGE BUCKETS (run via Supabase CLI / dashboard) ────────────────────────
-- INSERT INTO storage.buckets (id, name, public) VALUES ('listing-photos', 'listing-photos', true);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('insurance-certs', 'insurance-certs', false);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('damage-photos', 'damage-photos', false);
