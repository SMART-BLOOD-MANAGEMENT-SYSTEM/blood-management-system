import { mockBloodBanks } from "../data/mockBloodBanks";
import { mockRequests } from "../data/mockRequests";
import type { BloodBankSummary, BloodRequest, NewBloodRequest } from "../types/request";

// ── API Configuration ───────────────────────────────────────────
// Base URL for the backend API. Update this when the backend is deployed.
// In Sprint 3, this will point to the real backend server.
const API_BASE_URL = "/api";

// Set to true once the backend is deployed and ready for integration.
// When false, all functions fall back to mock data.
const USE_REAL_API = false;

// ── Error Handling ──────────────────────────────────────────────

/**
 * Standardized API error class for request service functions.
 * Carries the HTTP status code and a user-friendly message.
 */
export class ApiError extends Error {
  public readonly status: number;
  public readonly body: unknown;

  constructor(status: number, message: string, body?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

/**
 * Shared response handler. Throws an ApiError if the response is not OK.
 */
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorBody: unknown;
    try {
      errorBody = await response.json();
    } catch {
      errorBody = await response.text();
    }

    const message =
      typeof errorBody === "object" && errorBody !== null && "message" in errorBody
        ? String((errorBody as { message: string }).message)
        : `Request failed with status ${response.status}`;

    throw new ApiError(response.status, message, errorBody);
  }

  return response.json() as Promise<T>;
}

// ── Blood Requests API ──────────────────────────────────────────

/**
 * Fetch all blood requests.
 *
 * Backend endpoint: GET /api/blood-requests
 *
 * Expected response shape:
 * ```json
 * [
 *   {
 *     "id": 1001,
 *     "bank_id": 1,
 *     "patient_name": "Mariam Saleh",
 *     "blood_type": "A+",
 *     "required_units": 3,
 *     "urgency_level": "critical",
 *     "status": "pending",
 *     "request_date": "2026-05-15T14:30:00.000Z",
 *     "blood_bank": {
 *       "id": 1,
 *       "name": "Al-Noor Blood Bank",
 *       "city": "Gaza",
 *       "address": "Al-Rimal, Gaza",
 *       "contact_number": "+970-59-100-0001"
 *     }
 *   }
 * ]
 * ```
 */
export async function fetchBloodRequests(): Promise<BloodRequest[]> {
  if (!USE_REAL_API) {
    // Fallback: return mock data with simulated network delay.
    return new Promise((resolve) => {
      window.setTimeout(() => resolve(mockRequests), 350);
    });
  }

  const response = await fetch(`${API_BASE_URL}/blood-requests`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  return handleResponse<BloodRequest[]>(response);
}

/**
 * Fetch blood requests filtered by blood bank ID.
 * Used by Admin Requests screen.
 *
 * Backend endpoint: GET /api/blood-requests?bank_id=:bankId
 *
 * Expected response shape: same as fetchBloodRequests(), filtered by bank_id.
 */
export async function fetchBloodRequestsByBank(bankId: number): Promise<BloodRequest[]> {
  if (!USE_REAL_API) {
    return new Promise((resolve) => {
      window.setTimeout(() => {
        const filtered = mockRequests.filter((r) => r.bank_id === bankId);
        resolve(filtered);
      }, 300);
    });
  }

  const response = await fetch(`${API_BASE_URL}/blood-requests?bank_id=${bankId}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  return handleResponse<BloodRequest[]>(response);
}

/**
 * Create a new blood request.
 *
 * Backend endpoint: POST /api/blood-requests
 *
 * Expected request payload (NewBloodRequest):
 * ```json
 * {
 *   "bank_id": 1,
 *   "patient_name": "Mariam Saleh",
 *   "blood_type": "O+",
 *   "required_units": 1,
 *   "urgency_level": "critical",
 *   "notes": "Optional note"
 * }
 * ```
 *
 * Expected response shape:
 * ```json
 * {
 *   "id": 1700000000000,
 *   "bank_id": 1,
 *   "patient_name": "Mariam Saleh",
 *   "blood_type": "O+",
 *   "required_units": 1,
 *   "urgency_level": "critical",
 *   "status": "pending",
 *   "request_date": "2026-05-15T14:30:00.000Z",
 *   "blood_bank": {
 *     "id": 1,
 *     "name": "Al-Noor Blood Bank",
 *     "city": "Gaza",
 *     "address": "Al-Rimal, Gaza",
 *     "contact_number": "+970-59-100-0001"
 *   }
 * }
 * ```
 */
export async function createBloodRequest(request: NewBloodRequest): Promise<BloodRequest> {
  if (!USE_REAL_API) {
    return new Promise((resolve) => {
      window.setTimeout(() => {
        resolve({
          ...request,
          id: Date.now(),
          patient_name: request.patient_name?.trim() || null,
          status: "pending",
          request_date: new Date().toISOString(),
          blood_bank: mockBloodBanks.find((bank) => bank.id === request.bank_id),
        });
      }, 250);
    });
  }

  const response = await fetch(`${API_BASE_URL}/blood-requests`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...request,
      patient_name: request.patient_name?.trim(),
    }),
  });

  return handleResponse<BloodRequest>(response);
}

/**
 * Update the status of a blood request.
 * Used by Admin Requests screen for approve/reject/cancel actions.
 *
 * Backend endpoint: PATCH /api/blood-requests/:id/status
 *
 * Expected request payload:
 * ```json
 * { "status": "fulfilled" }
 * ```
 *
 * Expected response shape: updated BloodRequest object.
 */
export async function updateBloodRequestStatus(
  requestId: number,
  status: "pending" | "fulfilled" | "cancelled",
): Promise<BloodRequest> {
  if (!USE_REAL_API) {
    return new Promise((resolve) => {
      window.setTimeout(() => {
        const found = mockRequests.find((r) => r.id === requestId);
        resolve({
          ...(found ?? {
            id: requestId,
            bank_id: 1,
            blood_type: "O+",
            required_units: 1,
            urgency_level: "normal",
            request_date: new Date().toISOString(),
          }),
          status,
        } as BloodRequest);
      }, 200);
    });
  }

  const response = await fetch(`${API_BASE_URL}/blood-requests/${requestId}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });

  return handleResponse<BloodRequest>(response);
}

// ── Blood Banks API ─────────────────────────────────────────────

/**
 * Fetch all blood banks (for the Add Request form bank selector).
 *
 * Backend endpoint: GET /api/blood-banks/search
 *
 * Expected response shape:
 * ```json
 * [
 *   {
 *     "id": 1,
 *     "name": "Al-Noor Blood Bank",
 *     "city": "Gaza",
 *     "address": "Al-Rimal, Gaza",
 *     "contact_number": "+970-59-100-0001"
 *   }
 * ]
 * ```
 */
export async function fetchBloodBanks(): Promise<BloodBankSummary[]> {
  if (!USE_REAL_API) {
    return new Promise((resolve) => {
      window.setTimeout(() => resolve(mockBloodBanks), 200);
    });
  }

  const response = await fetch(`${API_BASE_URL}/blood-banks/search`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  return handleResponse<BloodBankSummary[]>(response);
}

/**
 * Fetch a single blood bank by ID.
 *
 * Backend endpoint: GET /api/blood-banks/:id
 *
 * Expected response shape: single BloodBankSummary object.
 */
export async function fetchBloodBankById(bankId: number): Promise<BloodBankSummary> {
  if (!USE_REAL_API) {
    return new Promise((resolve, reject) => {
      window.setTimeout(() => {
        const found = mockBloodBanks.find((b) => b.id === bankId);
        if (found) {
          resolve(found);
        } else {
          reject(new ApiError(404, `Blood bank with ID ${bankId} not found.`));
        }
      }, 200);
    });
  }

  const response = await fetch(`${API_BASE_URL}/blood-banks/${bankId}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  return handleResponse<BloodBankSummary>(response);
}

// ── Inventory API (Admin) ───────────────────────────────────────

/** Inventory record shape expected from the backend. */
export interface InventoryRecord {
  id: number;
  bank_id: number;
  blood_type: string;
  quantity_units: number;
  expiration_date: string;
  last_updated?: string;
}

/**
 * Fetch inventory records for a given blood bank.
 *
 * Backend endpoint: GET /api/inventory?bank_id=:bankId
 *
 * Expected response shape:
 * ```json
 * [
 *   {
 *     "id": 1,
 *     "bank_id": 1,
 *     "blood_type": "O-",
 *     "quantity_units": 7,
 *     "expiration_date": "2026-06-10",
 *     "last_updated": "2026-05-15T14:30:00.000Z"
 *   }
 * ]
 * ```
 */
export async function fetchInventoryByBank(bankId: number): Promise<InventoryRecord[]> {
  if (!USE_REAL_API) {
    return new Promise((resolve) => {
      window.setTimeout(() => {
        resolve([
          { id: 1, bank_id: bankId, blood_type: "O-", quantity_units: 7, expiration_date: "2026-06-10" },
          { id: 2, bank_id: bankId, blood_type: "A+", quantity_units: 22, expiration_date: "2026-06-15" },
          { id: 3, bank_id: bankId, blood_type: "B-", quantity_units: 9, expiration_date: "2026-06-18" },
          { id: 4, bank_id: bankId, blood_type: "AB+", quantity_units: 15, expiration_date: "2026-06-20" },
        ]);
      }, 300);
    });
  }

  const response = await fetch(`${API_BASE_URL}/inventory?bank_id=${bankId}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  return handleResponse<InventoryRecord[]>(response);
}

/**
 * Update an inventory record (admin stock adjustment).
 *
 * Backend endpoint: PATCH /api/inventory/:id
 *
 * Expected request payload:
 * ```json
 * { "quantity_units": 15 }
 * ```
 *
 * Expected response: updated InventoryRecord object.
 */
export async function updateInventoryRecord(
  recordId: number,
  quantityUnits: number,
): Promise<InventoryRecord> {
  if (!USE_REAL_API) {
    return new Promise((resolve) => {
      window.setTimeout(() => {
        resolve({
          id: recordId,
          bank_id: 1,
          blood_type: "O-",
          quantity_units: quantityUnits,
          expiration_date: "2026-06-10",
        });
      }, 200);
    });
  }

  const response = await fetch(`${API_BASE_URL}/inventory/${recordId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ quantity_units: quantityUnits }),
  });

  return handleResponse<InventoryRecord>(response);
}

// ── Appointments API (Admin) ────────────────────────────────────

/** Appointment record shape expected from the backend. */
export interface AppointmentRecord {
  id: number;
  user_id: number;
  slot_id: number;
  donor_name: string;
  bank_name: string;
  slot_label: string;
  appointment_status: "pending" | "confirmed" | "cancelled" | "completed";
}

/**
 * Fetch appointments for a given blood bank.
 *
 * Backend endpoint: GET /api/appointments/bank/:bankId
 *
 * Expected response shape:
 * ```json
 * [
 *   {
 *     "id": 1,
 *     "user_id": 11,
 *     "slot_id": 101,
 *     "donor_name": "Nour Hassan",
 *     "bank_name": "Palestine Medical Complex Blood Bank",
 *     "slot_label": "Today, 11:30",
 *     "appointment_status": "pending"
 *   }
 * ]
 * ```
 */
export async function fetchAppointmentsByBank(bankId: number): Promise<AppointmentRecord[]> {
  if (!USE_REAL_API) {
    return new Promise((resolve) => {
      window.setTimeout(() => {
        resolve([
          { id: 1, user_id: 11, slot_id: 101, donor_name: "Nour Hassan", bank_name: "Palestine Medical Complex Blood Bank", slot_label: "Today, 11:30", appointment_status: "pending" as const },
          { id: 2, user_id: 12, slot_id: 102, donor_name: "Samir Omar", bank_name: "Alia Governmental Hospital Blood Bank", slot_label: "Tomorrow, 09:00", appointment_status: "confirmed" as const },
          { id: 3, user_id: 13, slot_id: 103, donor_name: "Dana Qasem", bank_name: "Rafidia Surgical Hospital Blood Bank", slot_label: "May 12, 13:00", appointment_status: "pending" as const },
        ]);
      }, 300);
    });
  }

  const response = await fetch(`${API_BASE_URL}/appointments/bank/${bankId}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  return handleResponse<AppointmentRecord[]>(response);
}

/**
 * Update appointment status (confirm / cancel / complete).
 *
 * Backend endpoint: PATCH /api/appointments/:id/status
 *
 * Expected request payload:
 * ```json
 * { "appointment_status": "confirmed" }
 * ```
 *
 * Expected response: updated AppointmentRecord object.
 */
export async function updateAppointmentStatus(
  appointmentId: number,
  appointmentStatus: "pending" | "confirmed" | "cancelled" | "completed",
): Promise<AppointmentRecord> {
  if (!USE_REAL_API) {
    return new Promise((resolve) => {
      window.setTimeout(() => {
        resolve({
          id: appointmentId,
          user_id: 0,
          slot_id: 0,
          donor_name: "",
          bank_name: "",
          slot_label: "",
          appointment_status: appointmentStatus,
        });
      }, 200);
    });
  }

  const response = await fetch(`${API_BASE_URL}/appointments/${appointmentId}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ appointment_status: appointmentStatus }),
  });

  return handleResponse<AppointmentRecord>(response);
}
