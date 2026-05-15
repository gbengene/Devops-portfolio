/**
 * Easy Drive — Supabase Database Type Definitions
 *
 * Maps to schema in:
 *   supabase/migrations/0001_initial_schema.sql  (v1.0 fleet model)
 *   supabase/migrations/0002_marketplace_schema.sql  (v2.0 marketplace)
 *
 * Usage:
 *   import type { Database, Tables, Enums } from '@/types/supabase'
 */

// ── Enum types ─────────────────────────────────────────────────────────────────

export type UserRole              = 'admin' | 'host' | 'renter'
export type VehicleStatus         = 'available' | 'rented' | 'maintenance' | 'inactive'
export type ListingStatus         = 'draft' | 'pending_review' | 'approved' | 'active' | 'paused' | 'delisted'
export type ApplicationStatus     = 'pending' | 'approved' | 'rejected' | 'cancelled'
export type BookingStatus         = 'requested' | 'confirmed' | 'declined' | 'active' | 'completed' | 'cancelled' | 'disputed'
export type HostStatus            = 'pending' | 'approved' | 'suspended' | 'rejected'
export type RenterStatus          = 'pending' | 'approved' | 'suspended' | 'rejected'
export type RentalStatus          = 'pending_payment' | 'pending_signature' | 'active' | 'ended' | 'terminated'
export type PaymentType           = 'weekly_rent' | 'deposit_capture' | 'deposit_refund' | 'late_fee' | 'damage_fee'
export type PaymentStatus         = 'pending' | 'paid' | 'failed' | 'refunded'
export type PayoutStatus          = 'pending' | 'in_transit' | 'paid' | 'failed'
export type InspectionType        = 'intake' | 'return' | 'spot_check'
export type AlertType             =
  | 'geofence_breach'
  | 'payment_failed'
  | 'kill_switch_activated'
  | 'kill_switch_deactivated'
  | 'vehicle_speeding'
  | 'rental_overdue'
  | 'safety_cert_expiring'
  | 'plate_renewal_due'
export type AlertSeverity         = 'info' | 'warning' | 'critical'
export type ReviewDirection       = 'host_to_renter' | 'renter_to_host' | 'renter_to_vehicle'
export type KillSwitchAction      = 'disable' | 'enable'
export type StripeConnectStatus   = 'not_started' | 'onboarding' | 'onboarded' | 'restricted'

// ── Profile ───────────────────────────────────────────────────────────────────

export interface ProfileRow {
  id:                           string
  auth_user_id:                 string
  role:                         UserRole
  full_name:                    string
  phone:                        string | null
  email:                        string
  ontario_licence_number:       string | null
  licence_class:                string | null
  at_fault_accidents:           number
  licence_suspended:            boolean
  gig_platform:                 string | null
  gig_account_screenshot_url:   string | null
  id_document_url:              string | null
  driver_abstract_url:          string | null
  // v2.0 host fields
  host_status:                  HostStatus | null
  renter_status:                RenterStatus | null
  stripe_connect_account_id:    string | null
  stripe_connect_status:        StripeConnectStatus | null
  stripe_customer_id:           string | null
  avg_rating_as_host:           number | null
  avg_rating_as_renter:         number | null
  rentals_completed_as_host:    number
  rentals_completed_as_renter:  number
  created_at:                   string
}

// ── Vehicle ───────────────────────────────────────────────────────────────────

export interface VehicleRow {
  id:                         string
  make:                       string
  model:                      string
  year:                       number
  vin:                        string
  plate_number:               string
  colour:                     string | null
  purchase_price_cad:         number | null
  odometer_km:                number
  status:                     VehicleStatus
  bouncie_device_id:          string | null
  passtime_device_id:         string | null
  kill_switch_enabled:        boolean
  safety_cert_expires:        string | null
  plate_renewal_date:         string | null
  notes:                      string | null
  // v2.0 marketplace fields
  host_id:                    string | null
  weekly_rate_cad:            number | null
  listing_status:             ListingStatus | null
  auto_accept_bookings:       boolean
  insurance_cert_url:         string | null
  insurance_cert_expires:     string | null
  insurance_covers_delivery:  boolean
  safety_cert_url:            string | null
  avg_rating:                 number | null
  rejection_reason:           string | null
  city:                       string | null
  pickup_postal_code:         string | null
  transmission:               string | null
  fuel_type:                  string | null
  seats:                      number | null
  trim:                       string | null
  created_at:                 string
  updated_at:                 string
}

// ── Legacy tables (v1.0 — kept for backward compat) ───────────────────────────

export interface ApplicationRow {
  id:               string
  applicant_id:     string
  status:           ApplicationStatus
  rejection_reason: string | null
  reviewed_by:      string | null
  submitted_at:     string
  reviewed_at:      string | null
}

export interface RentalRow {
  id:                         string
  renter_id:                  string
  vehicle_id:                 string
  application_id:             string
  status:                     RentalStatus
  weekly_rate_cad:            number
  deposit_cad:                number
  stripe_customer_id:         string | null
  stripe_subscription_id:     string | null
  stripe_deposit_intent_id:   string | null
  pandadoc_document_id:       string | null
  pandadoc_status:            string | null
  start_date:                 string | null
  end_date:                   string | null
  notes:                      string | null
  created_at:                 string
  updated_at:                 string
}

export interface PaymentRow {
  id:                       string
  rental_id:                string | null
  booking_id:               string | null
  type:                     PaymentType
  amount_cad:               number
  amount_total_cad:         number | null
  amount_host_cad:          number | null
  amount_platform_cad:      number | null
  stripe_fee_cad:           number | null
  stripe_transfer_id:       string | null
  status:                   PaymentStatus
  stripe_payment_intent_id: string | null
  stripe_invoice_id:        string | null
  failure_reason:           string | null
  paid_at:                  string | null
  created_at:               string
}

// ── v2.0 tables ───────────────────────────────────────────────────────────────

export interface ListingPhotoRow {
  id:           string
  vehicle_id:   string
  storage_path: string
  sort_order:   number
  is_primary:   boolean
  created_at:   string
}

export interface ListingApplicationRow {
  id:           string
  vehicle_id:   string
  host_id:      string
  status:       ApplicationStatus
  admin_notes:  string | null
  reviewed_by:  string | null
  submitted_at: string
  reviewed_at:  string | null
}

export interface AvailabilityBlockRow {
  id:         string
  vehicle_id: string
  start_date: string
  end_date:   string
  reason:     string | null
  booking_id: string | null
  created_at: string
}

export interface RenterApplicationRow {
  id:               string
  renter_id:        string
  status:           RenterStatus
  rejection_reason: string | null
  reviewed_by:      string | null
  submitted_at:     string
  reviewed_at:      string | null
}

export interface BookingRow {
  id:                        string
  renter_id:                 string
  host_id:                   string
  vehicle_id:                string
  status:                    BookingStatus
  start_date:                string
  end_date:                  string | null
  weekly_rate_cad:           number
  platform_fee_cad:          number
  deposit_cad:               number
  stripe_payment_intent_id:  string | null
  stripe_subscription_id:    string | null
  pandadoc_document_id:      string | null
  notes:                     string | null
  created_at:                string
  updated_at:                string
}

export interface PayoutRow {
  id:               string
  host_id:          string
  stripe_payout_id: string | null
  amount_cad:       number
  status:           PayoutStatus
  period_start:     string | null
  period_end:       string | null
  arrival_date:     string | null
  created_at:       string
}

export interface DamageClaimRow {
  id:                  string
  booking_id:          string
  submitted_by:        string
  description:         string
  photo_urls:          string[]
  estimated_cost_cad:  number | null
  status:              string
  deposit_applied_cad: number
  resolved_by:         string | null
  created_at:          string
  resolved_at:         string | null
}

export interface ReviewRow {
  id:         string
  booking_id: string
  author_id:  string
  subject_id: string | null
  vehicle_id: string | null
  direction:  ReviewDirection
  rating:     number
  comment:    string | null
  is_public:  boolean
  created_at: string
}

export interface KillSwitchLogRow {
  id:               string
  vehicle_id:       string
  booking_id:       string | null
  initiated_by:     string
  initiator_role:   UserRole
  action:           KillSwitchAction
  reason:           string
  bouncie_response: Record<string, unknown> | null
  created_at:       string
}

export interface MessageRow {
  id:                 string
  booking_id:         string
  sender_id:          string
  body:               string
  read_by_recipient:  boolean
  created_at:         string
}

export interface AlertRow {
  id:              string
  vehicle_id:      string | null
  rental_id:       string | null
  host_id:         string | null
  type:            AlertType
  severity:        AlertSeverity
  message:         string
  metadata:        Record<string, unknown> | null
  acknowledged:    boolean
  acknowledged_by: string | null
  acknowledged_at: string | null
  audience:        string | null
  created_at:      string
}

export interface InspectionRow {
  id:           string
  vehicle_id:   string
  rental_id:    string | null
  conducted_by: string
  type:         InspectionType
  odometer_km:  number | null
  notes:        string | null
  photo_urls:   string[]
  conducted_at: string
}

export interface MaintenanceRow {
  id:                  string
  vehicle_id:          string
  type:                string
  cost_cad:            number | null
  odometer_at_service: number | null
  shop_name:           string | null
  notes:               string | null
  receipt_url:         string | null
  serviced_at:         string
}

export interface GpsEventRow {
  id:              string
  vehicle_id:      string
  event_type:      string
  lat:             number | null
  lng:             number | null
  speed_kmh:       number | null
  geofence_breach: boolean
  raw_payload:     Record<string, unknown> | null
  occurred_at:     string
}

// ── Database interface ────────────────────────────────────────────────────────

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row:    ProfileRow
        Insert: Omit<ProfileRow, 'id' | 'created_at'> & { id?: string; created_at?: string }
        Update: Partial<Omit<ProfileRow, 'id'>>
      }
      vehicles: {
        Row:    VehicleRow
        Insert: Omit<VehicleRow, 'id' | 'created_at' | 'updated_at'> & { id?: string }
        Update: Partial<Omit<VehicleRow, 'id'>>
      }
      applications: {
        Row:    ApplicationRow
        Insert: Omit<ApplicationRow, 'id' | 'submitted_at'> & { id?: string; submitted_at?: string }
        Update: Partial<Omit<ApplicationRow, 'id'>>
      }
      rentals: {
        Row:    RentalRow
        Insert: Omit<RentalRow, 'id' | 'created_at' | 'updated_at'> & { id?: string }
        Update: Partial<Omit<RentalRow, 'id'>>
      }
      payments: {
        Row:    PaymentRow
        Insert: Omit<PaymentRow, 'id' | 'created_at'> & { id?: string }
        Update: Partial<Omit<PaymentRow, 'id'>>
      }
      inspections: {
        Row:    InspectionRow
        Insert: Omit<InspectionRow, 'id' | 'conducted_at'> & { id?: string; conducted_at?: string }
        Update: Partial<Omit<InspectionRow, 'id'>>
      }
      maintenance: {
        Row:    MaintenanceRow
        Insert: Omit<MaintenanceRow, 'id' | 'serviced_at'> & { id?: string; serviced_at?: string }
        Update: Partial<Omit<MaintenanceRow, 'id'>>
      }
      gps_events: {
        Row:    GpsEventRow
        Insert: Omit<GpsEventRow, 'id'> & { id?: string }
        Update: never
      }
      alerts: {
        Row:    AlertRow
        Insert: Omit<AlertRow, 'id' | 'created_at'> & { id?: string; created_at?: string }
        Update: Partial<Pick<AlertRow, 'acknowledged' | 'acknowledged_by' | 'acknowledged_at'>>
      }
      // v2.0
      listing_photos: {
        Row:    ListingPhotoRow
        Insert: Omit<ListingPhotoRow, 'id' | 'created_at'> & { id?: string; created_at?: string }
        Update: Partial<Omit<ListingPhotoRow, 'id'>>
      }
      listing_applications: {
        Row:    ListingApplicationRow
        Insert: Omit<ListingApplicationRow, 'id' | 'submitted_at'> & { id?: string; submitted_at?: string }
        Update: Partial<Omit<ListingApplicationRow, 'id'>>
      }
      availability_blocks: {
        Row:    AvailabilityBlockRow
        Insert: Omit<AvailabilityBlockRow, 'id' | 'created_at'> & { id?: string; created_at?: string }
        Update: never
      }
      renter_applications: {
        Row:    RenterApplicationRow
        Insert: Omit<RenterApplicationRow, 'id' | 'submitted_at'> & { id?: string; submitted_at?: string }
        Update: Partial<Omit<RenterApplicationRow, 'id'>>
      }
      bookings: {
        Row:    BookingRow
        Insert: Omit<BookingRow, 'id' | 'created_at' | 'updated_at'> & { id?: string }
        Update: Partial<Omit<BookingRow, 'id'>>
      }
      payouts: {
        Row:    PayoutRow
        Insert: Omit<PayoutRow, 'id' | 'created_at'> & { id?: string; created_at?: string }
        Update: Partial<Omit<PayoutRow, 'id'>>
      }
      damage_claims: {
        Row:    DamageClaimRow
        Insert: Omit<DamageClaimRow, 'id' | 'created_at'> & { id?: string; created_at?: string }
        Update: Partial<Omit<DamageClaimRow, 'id'>>
      }
      reviews: {
        Row:    ReviewRow
        Insert: Omit<ReviewRow, 'id' | 'created_at'> & { id?: string; created_at?: string }
        Update: never
      }
      kill_switch_logs: {
        Row:    KillSwitchLogRow
        Insert: Omit<KillSwitchLogRow, 'id' | 'created_at'> & { id?: string; created_at?: string }
        Update: Partial<Pick<KillSwitchLogRow, 'bouncie_response'>>
      }
      messages: {
        Row:    MessageRow
        Insert: Omit<MessageRow, 'id' | 'created_at'> & { id?: string; created_at?: string }
        Update: Partial<Pick<MessageRow, 'read_by_recipient'>>
      }
    }
    Views: Record<string, never>
    Functions: {
      is_admin:           { Args: Record<string, never>; Returns: boolean }
      is_host:            { Args: Record<string, never>; Returns: boolean }
      is_approved_host:   { Args: Record<string, never>; Returns: boolean }
      is_approved_renter: { Args: Record<string, never>; Returns: boolean }
      my_profile_id:      { Args: Record<string, never>; Returns: string }
      owns_vehicle:       { Args: { p_vehicle_id: string }; Returns: boolean }
      bound_by_booking:   { Args: { other_profile_id: string }; Returns: boolean }
    }
    Enums: {
      user_role:            UserRole
      vehicle_status:       VehicleStatus
      listing_status:       ListingStatus
      application_status:   ApplicationStatus
      booking_status:       BookingStatus
      host_status:          HostStatus
      renter_status:        RenterStatus
      rental_status:        RentalStatus
      payment_type:         PaymentType
      payment_status:       PaymentStatus
      payout_status:        PayoutStatus
      inspection_type:      InspectionType
      alert_type:           AlertType
      alert_severity:       AlertSeverity
      review_direction:     ReviewDirection
      kill_switch_action:   KillSwitchAction
      stripe_connect_status: StripeConnectStatus
    }
  }
}

// ── Convenience shorthands ────────────────────────────────────────────────────

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row']

export type Enums<T extends keyof Database['public']['Enums']> =
  Database['public']['Enums'][T]

// ── Joined query result types ──────────────────────────────────────────────────

export interface ApplicationWithProfile extends ApplicationRow {
  applicant: ProfileRow
}

export interface RentalWithDetails extends RentalRow {
  vehicles: VehicleRow
  profiles: ProfileRow
}

export interface AlertWithVehicle extends AlertRow {
  vehicles: Pick<VehicleRow, 'plate_number'> | null
}

export interface BookingWithDetails extends BookingRow {
  vehicles:  VehicleRow
  renter:    ProfileRow
  host:      ProfileRow
}

export interface ListingWithPhotos extends VehicleRow {
  photos:    ListingPhotoRow[]
  host:      ProfileRow
}
