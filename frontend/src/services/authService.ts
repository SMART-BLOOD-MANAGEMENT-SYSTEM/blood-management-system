// ── Auth & Profile Service ──────────────────────────────────────
// Sprint 2: Mock data implementations ready for Sprint 3 API integration.
// All functions follow the same pattern as requestService.ts

const viteEnv = (import.meta as ImportMeta & { env?: Record<string, string | undefined> }).env;
const API_BASE_URL = viteEnv?.VITE_API_BASE_URL ?? "/api";
const USE_REAL_API = viteEnv?.VITE_USE_REAL_API === "true";

// ── Types ───────────────────────────────────────────────────────

export interface DonorProfileData {
  full_name: string;
  email: string;
  phone: string;
  blood_type: string;
  gender: string;
  birth_date: string;
  city: string;
  is_eligible: boolean;
  notification_preference: string;
}

export interface FacilityProfileData {
  facility_name: string;
  facility_type: string;
  city: string;
  phone: string;
  address: string;
  contact_person: string;
  working_hours: string;
  operational_status: string;
}

export interface HealthReport {
  id: number;
  file_name: string;
  file_size: number;
  file_type: string;
  uploaded_at: string;
  status: "pending" | "approved" | "rejected";
}

export interface ProfileUpdateResult {
  success: boolean;
  message: string;
  errors?: Record<string, string>;
}

export interface HealthReportUploadResult {
  success: boolean;
  message: string;
  report?: HealthReport;
}

// ── Validation ──────────────────────────────────────────────────

export function validateDonorProfile(data: DonorProfileData): Record<string, string> {
  const errors: Record<string, string> = {};

  if (!data.full_name.trim()) {
    errors.full_name = "Full name is required.";
  } else if (data.full_name.trim().length < 3) {
    errors.full_name = "Name must be at least 3 characters.";
  }

  if (!data.phone.trim()) {
    errors.phone = "Phone number is required.";
  } else if (!/^\+?[0-9\s-]{8,}$/.test(data.phone.trim())) {
    errors.phone = "Enter a valid phone number.";
  }

  if (!data.city.trim()) {
    errors.city = "City is required.";
  }

  if (!data.blood_type || data.blood_type === "Select type") {
    errors.blood_type = "Blood type is required.";
  }

  if (!data.gender || data.gender === "Select gender") {
    errors.gender = "Gender is required.";
  }

  return errors;
}

export function validateFacilityProfile(data: FacilityProfileData): Record<string, string> {
  const errors: Record<string, string> = {};

  if (!data.facility_name.trim()) {
    errors.facility_name = "Facility name is required.";
  }

  if (!data.city.trim()) {
    errors.city = "City is required.";
  }

  if (!data.phone.trim()) {
    errors.phone = "Phone number is required.";
  } else if (!/^\+?[0-9\s-]{8,}$/.test(data.phone.trim())) {
    errors.phone = "Enter a valid phone number.";
  }

  if (!data.address.trim()) {
    errors.address = "Address is required.";
  }

  if (!data.working_hours.trim()) {
    errors.working_hours = "Working hours are required.";
  }

  return errors;
}

// ── API Functions ───────────────────────────────────────────────

/**
 * Update donor profile.
 * Backend endpoint: PATCH /api/me
 */
export async function updateDonorProfile(data: DonorProfileData): Promise<ProfileUpdateResult> {
  if (!USE_REAL_API) {
    return new Promise((resolve) => {
      window.setTimeout(() => {
        const errors = validateDonorProfile(data);
        if (Object.keys(errors).length > 0) {
          resolve({ success: false, message: "Please fix the errors below.", errors });
        } else {
          resolve({ success: true, message: "Profile updated successfully!" });
        }
      }, 600);
    });
  }

  const response = await fetch(`${API_BASE_URL}/me`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    return {
      success: false,
      message: (body as { message?: string }).message ?? "Update failed.",
      errors: (body as { errors?: Record<string, string> }).errors,
    };
  }

  return { success: true, message: "Profile updated successfully!" };
}

/**
 * Update facility profile.
 * Backend endpoint: PATCH /api/me
 */
export async function updateFacilityProfile(data: FacilityProfileData): Promise<ProfileUpdateResult> {
  if (!USE_REAL_API) {
    return new Promise((resolve) => {
      window.setTimeout(() => {
        const errors = validateFacilityProfile(data);
        if (Object.keys(errors).length > 0) {
          resolve({ success: false, message: "Please fix the errors below.", errors });
        } else {
          resolve({ success: true, message: "Facility profile updated successfully!" });
        }
      }, 600);
    });
  }

  const response = await fetch(`${API_BASE_URL}/me`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    return {
      success: false,
      message: (body as { message?: string }).message ?? "Update failed.",
      errors: (body as { errors?: Record<string, string> }).errors,
    };
  }

  return { success: true, message: "Facility profile updated successfully!" };
}

/**
 * Upload health clearance report.
 * Backend endpoint: POST /api/me/health-report
 */
export async function uploadHealthReport(file: File): Promise<HealthReportUploadResult> {
  // Validate file type
  const allowedTypes = ["application/pdf", "image/jpeg", "image/png", "image/jpg"];
  if (!allowedTypes.includes(file.type)) {
    return {
      success: false,
      message: "Only PDF, JPG, and PNG files are allowed.",
    };
  }

  // Validate file size (max 5MB)
  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    return {
      success: false,
      message: "File size must be less than 5MB.",
    };
  }

  if (!USE_REAL_API) {
    return new Promise((resolve) => {
      window.setTimeout(() => {
        resolve({
          success: true,
          message: "Health report uploaded successfully! Awaiting review.",
          report: {
            id: Date.now(),
            file_name: file.name,
            file_size: file.size,
            file_type: file.type,
            uploaded_at: new Date().toISOString(),
            status: "pending",
          },
        });
      }, 1200);
    });
  }

  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_BASE_URL}/me/health-report`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    return {
      success: false,
      message: (body as { message?: string }).message ?? "Upload failed.",
    };
  }

  const report = await response.json();
  return { success: true, message: "Health report uploaded successfully!", report: report as HealthReport };
}

/**
 * Fetch existing health reports.
 * Backend endpoint: GET /api/me/health-reports
 */
export async function fetchHealthReports(): Promise<HealthReport[]> {
  if (!USE_REAL_API) {
    return new Promise((resolve) => {
      window.setTimeout(() => {
        resolve([]);
      }, 300);
    });
  }

  const response = await fetch(`${API_BASE_URL}/me/health-reports`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) return [];
  return response.json() as Promise<HealthReport[]>;
}

// ── Auth Types ──────────────────────────────────────────────────

export interface AuthUser {
  id: number;
  full_name: string;
  email: string;
  role: string;
  [key: string]: unknown;
}

export interface AuthResult {
  success: boolean;
  message: string;
  user?: AuthUser;
  token?: string;
  errors?: Record<string, string>;
}

// ── Login ───────────────────────────────────────────────────────

export async function loginUser(email: string, password: string): Promise<AuthResult> {
  try {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const body = await response.json().catch(() => ({}));

    if (!response.ok) {
      return {
        success: false,
        message: (body as { message?: string }).message ?? "Invalid email or password.",
      };
    }

    const data = body as { token: string; user: AuthUser; role: string };
    localStorage.setItem("auth_token", data.token);
    localStorage.setItem("auth_user", JSON.stringify(data.user));

    return { success: true, message: "Login successful", user: data.user, token: data.token };
  } catch {
    return { success: false, message: "Unable to reach the server. Please try again." };
  }
}

// ── Register ────────────────────────────────────────────────────

export interface RegisterPayload {
  full_name: string;
  email: string;
  password: string;
  phone: string;
  city?: string;
  blood_type?: string;
  gender?: string;
  birth_date?: string;
}

export async function registerUser(payload: RegisterPayload): Promise<AuthResult> {
  try {
    const response = await fetch(`${API_BASE_URL}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(payload),
    });

    const body = await response.json().catch(() => ({}));

    if (!response.ok) {
      return {
        success: false,
        message: (body as { message?: string }).message ?? "Registration failed.",
        errors: (body as { errors?: Record<string, string> }).errors,
      };
    }

    const data = body as { token: string; user: AuthUser };
    localStorage.setItem("auth_token", data.token);
    localStorage.setItem("auth_user", JSON.stringify(data.user));

    return { success: true, message: "Account created successfully", user: data.user, token: data.token };
  } catch {
    return { success: false, message: "Unable to reach the server. Please try again." };
  }
}

// ── Current user helpers ───────────────────────────────────────

export function getCurrentUser(): AuthUser | null {
  const raw = localStorage.getItem("auth_user");
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function logoutUser(): void {
  localStorage.removeItem("auth_token");
  localStorage.removeItem("auth_user");
}
