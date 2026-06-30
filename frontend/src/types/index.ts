/* ═══════════════════════════════════════════════════════════════
   SBMS – Complete Type Definitions
   Smart Blood Management System – Gaza MVP
   ═══════════════════════════════════════════════════════════════ */

// ── Enums & Unions ──────────────────────────────────────────────

export type BloodType = "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-";

export type UrgencyLevel = "critical" | "urgent" | "normal" | "low";

export type RequestStatus = "pending" | "fulfilled" | "cancelled";

export type AppointmentStatus = "pending" | "confirmed" | "cancelled" | "completed";

export type AvailabilityStatus = "available" | "temporarily_unavailable";

export type UserRole = "donor" | "admin" | "doctor";

export type Gender = "male" | "female";

export type LastDonationFilter = "any" | "1" | "3" | "6" | "12";

export type InventoryStatus = "stable" | "watch" | "low" | "critical" | "expired";

export type NotificationType = "emergency" | "reminder" | "confirmation" | "general";

// ── User / Auth ─────────────────────────────────────────────────

export interface User {
  id: number;
  email: string;
  role: UserRole;
  full_name: string;
  phone: string;
  city: string;
  avatar_url?: string;
  created_at: string;
  is_active: boolean;
}

export interface DonorUser extends User {
  role: "donor";
  blood_type: BloodType;
  gender: Gender;
  birth_date: string;
  last_donation_date?: string;
  availability_status: AvailabilityStatus;
  total_donations: number;
}

export interface FacilityAdminUser extends User {
  role: "admin";
  bank_id: number;
}

export interface SystemAdminUser extends User {
  role: "doctor";
}

// ── Registration Forms ──────────────────────────────────────────

export interface DonorRegistration {
  full_name: string;
  email: string;
  password: string;
  phone: string;
  city: string;
  blood_type: BloodType | "";
  gender: Gender | "";
  birth_date: string;
}

export interface FacilityRegistration {
  facility_name: string;
  email: string;
  password: string;
  phone: string;
  city: string;
  address: string;
  contact_person: string;
}

// ── Blood Bank / Facility ───────────────────────────────────────

export interface BloodBankSummary {
  id: number;
  name: string;
  city?: string;
  address?: string;
  contact_number?: string;
}

export interface Facility {
  id: number;
  name: string;
  city: string;
  address: string;
  phone: string;
  contact_person: string;
  type: "hospital" | "blood_bank";
  is_active: boolean;
  created_at: string;
  available_slots_count: number;
  total_donations: number;
}

// ── Donation Slots ──────────────────────────────────────────────

export interface DonationSlot {
  id: number;
  bank_id: number;
  slot_date: string;
  start_time: string;
  end_time: string;
  max_capacity: number;
  booked: number;
  is_available: boolean;
}

// ── Appointments ────────────────────────────────────────────────

export interface Appointment {
  id: number;
  user_id: number;
  slot_id: number;
  donor_name: string;
  donor_blood_type: BloodType;
  donor_phone: string;
  bank_name: string;
  slot_label: string;
  appointment_status: AppointmentStatus;
  created_at: string;
  notes?: string;
}

// ── Blood Requests ──────────────────────────────────────────────

export interface BloodRequest {
  id: number;
  bank_id: number;
  patient_name?: string | null;
  blood_type: BloodType;
  required_units: number;
  urgency_level: UrgencyLevel;
  status: RequestStatus;
  request_date: string;
  blood_bank?: BloodBankSummary;
}

export interface NewBloodRequest {
  bank_id: number;
  patient_name?: string;
  blood_type: BloodType;
  required_units: number;
  urgency_level: UrgencyLevel;
}

// ── Blood Inventory ─────────────────────────────────────────────

export interface InventoryRecord {
  id: number;
  bank_id: number;
  appointment_id?: number | null;
  blood_type: BloodType;
  quantity_units: number;
  expiration_date: string;
  last_updated: string;
}

// ── Donor Profile (public search) ───────────────────────────────

export interface DonorProfile {
  id: number;
  full_name: string;
  blood_type: BloodType;
  city: string;
  phone: string;
  gender: Gender;
  last_donation_date: string;
  last_donation_months: number;
  availability_status: AvailabilityStatus;
  total_donations: number;
  notes?: string;
}

export interface DonorSearchFilters {
  blood_type: BloodType | "";
  city: string;
  last_donation_within_months: LastDonationFilter;
}

// ── Notifications ───────────────────────────────────────────────

export interface AppNotification {
  id: number;
  type: NotificationType;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  link?: string;
}

// ── Dashboard Stats ─────────────────────────────────────────────

export interface FacilityDashboardStats {
  pending_appointments: number;
  available_slots: number;
  low_stock_types: number;
  urgent_requests: number;
  total_donations_this_month: number;
  total_requests_this_month: number;
}

export interface SystemDashboardStats {
  total_donors: number;
  total_facilities: number;
  total_appointments: number;
  total_requests: number;
  pending_appointments: number;
  urgent_requests: number;
  low_stock_facilities: number;
  active_donors: number;
  fulfilled_requests_this_month: number;
  donations_this_month: number;
}

export interface DonorDashboardStats {
  total_donations: number;
  upcoming_appointments: number;
  pending_requests: number;
  last_donation_date: string;
  days_until_eligible: number;
}

// ── Utility / Routing ───────────────────────────────────────────

export type AppView =
  | "home"
  | "about"
  | "login"
  | "register"
  | "register-donor"
  | "register-facility"
  | "forgot-password"
  | "donor-dashboard"
  | "donor-profile"
  | "donor-search"
  | "donor-appointments"
  | "donor-urgent"
  | "donor-notifications"
  | "facility-details"
  | "requests"
  | "create-request"
  | "admin-dashboard"
  | "admin-profile"
  | "admin-slots"
  | "admin-appointments"
  | "admin-inventory"
  | "admin-requests"
  | "admin-notifications"
  | "sysadmin-dashboard"
  | "sysadmin-users"
  | "sysadmin-facilities"
  | "sysadmin-requests"
  | "sysadmin-inventory"
  | "sysadmin-settings";

export type SelectOption = { label: string; value: string };
