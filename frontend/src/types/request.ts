export type BloodType = "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-";

export type UrgencyLevel = "low" | "normal" | "urgent" | "critical";

export type RequestStatus = "pending" | "fulfilled" | "cancelled";

export type AppointmentStatus = "pending" | "confirmed" | "cancelled" | "completed";

export type AvailabilityStatus = "available" | "temporarily_unavailable";

export type LastDonationFilter = "any" | "1" | "3" | "6" | "12";

export interface BloodBankSummary {
  id: number;
  name: string;
  city?: string;
  address?: string;
  contact_number?: string;
}

export interface BloodRequest {
  id: number;
  bank_id: number;
  patient_name?: string | null;
  blood_type: BloodType;
  required_units: number;
  urgency_level: UrgencyLevel;
  status: RequestStatus;
  request_date: string;
  notes?: string | null;
  blood_bank?: BloodBankSummary;
}

export interface NewBloodRequest {
  bank_id: number;
  patient_name?: string;
  blood_type: BloodType;
  required_units: number;
  urgency_level: UrgencyLevel;
  notes?: string;
}

export interface DonorProfile {
  id: number;
  full_name: string;
  blood_type: BloodType;
  city: string;
  phone: string;
  last_donation_date: string;
  last_donation_months: number;
  availability_status: AvailabilityStatus;
  notes?: string;
}

export interface DonorSearchFilters {
  blood_type: BloodType | "";
  city: string;
  last_donation_within_months: LastDonationFilter;
}

export interface NewDonorBloodRequest {
  donor_id: number;
  patient_name: string;
  blood_type: BloodType;
  city: string;
  hospital_name: string;
  urgency_level: UrgencyLevel;
  notes?: string;
}
