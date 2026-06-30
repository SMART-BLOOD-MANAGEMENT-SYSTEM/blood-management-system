import { mockBloodBanks } from "../data/mockBloodBanks";
import { mockRequests } from "../data/mockRequests";
import type { BloodBankSummary, BloodRequest, NewBloodRequest } from "../types/request";

// ── API Configuration ───────────────────────────────────────────
// Configure these from Vite when the backend is available.
const viteEnv = (import.meta as ImportMeta & { env?: Record<string, string | undefined> }).env;
const API_BASE_URL = viteEnv?.VITE_API_BASE_URL ?? "/api";
const USE_REAL_API = viteEnv?.VITE_USE_REAL_API === "true";

let mockRequestStore: BloodRequest[] = [...mockRequests];

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
    return new Promise((resolve) => {
      window.setTimeout(() => resolve([...mockRequestStore]), 350);
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
        const filtered = mockRequestStore.filter((r) => r.bank_id === bankId);
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
        const createdRequest: BloodRequest = {
          ...request,
          id: Date.now(),
          patient_name: request.patient_name?.trim() || null,
          status: "pending",
          request_date: new Date().toISOString(),
          blood_bank: mockBloodBanks.find((bank) => bank.id === request.bank_id),
        };
        mockRequestStore = [createdRequest, ...mockRequestStore];
        resolve(createdRequest);
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
        const found = mockRequestStore.find((r) => r.id === requestId);
        const updatedRequest = {
          ...(found ?? {
            id: requestId,
            bank_id: 1,
            blood_type: "O+",
            required_units: 1,
            urgency_level: "normal",
            request_date: new Date().toISOString(),
          }),
          status,
        } as BloodRequest;
        mockRequestStore = mockRequestStore.map((request) =>
          request.id === requestId ? updatedRequest : request,
        );
        resolve(updatedRequest);
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

export type BloodRequestUpdate = Partial<
  Pick<BloodRequest, "patient_name" | "blood_type" | "required_units" | "urgency_level" | "status">
>;

export async function updateBloodRequest(
  requestId: number,
  updates: BloodRequestUpdate,
): Promise<BloodRequest> {
  if (!USE_REAL_API) {
    return new Promise((resolve, reject) => {
      window.setTimeout(() => {
        const currentRequest = mockRequestStore.find((request) => request.id === requestId);
        if (!currentRequest) {
          reject(new ApiError(404, `Blood request with ID ${requestId} not found.`));
          return;
        }

        const updatedRequest: BloodRequest = {
          ...currentRequest,
          ...updates,
          patient_name:
            typeof updates.patient_name === "string"
              ? updates.patient_name.trim() || null
              : currentRequest.patient_name,
        };
        mockRequestStore = mockRequestStore.map((request) =>
          request.id === requestId ? updatedRequest : request,
        );
        resolve(updatedRequest);
      }, 220);
    });
  }

  const response = await fetch(`${API_BASE_URL}/blood-requests/${requestId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  });

  return handleResponse<BloodRequest>(response);
}

export async function deleteBloodRequest(requestId: number): Promise<void> {
  if (!USE_REAL_API) {
    return new Promise((resolve) => {
      window.setTimeout(() => {
        mockRequestStore = mockRequestStore.filter((request) => request.id !== requestId);
        resolve();
      }, 180);
    });
  }

  const response = await fetch(`${API_BASE_URL}/blood-requests/${requestId}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    await handleResponse<unknown>(response);
  }
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

export interface NewInventoryRecord {
  bank_id: number;
  blood_type: string;
  quantity_units: number;
  expiration_date: string;
}

export type InventoryRecordUpdate = Partial<
  Pick<InventoryRecord, "blood_type" | "quantity_units" | "expiration_date">
>;

let mockInventoryStore: InventoryRecord[] = [
  { id: 1, bank_id: 1, blood_type: "O-", quantity_units: 7, expiration_date: "2026-06-10" },
  { id: 2, bank_id: 1, blood_type: "A+", quantity_units: 22, expiration_date: "2026-06-15" },
  { id: 3, bank_id: 1, blood_type: "B-", quantity_units: 9, expiration_date: "2026-06-18" },
  { id: 4, bank_id: 1, blood_type: "AB+", quantity_units: 15, expiration_date: "2026-06-20" },
];

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
        resolve(mockInventoryStore.filter((record) => record.bank_id === bankId));
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
  updates: number | InventoryRecordUpdate,
): Promise<InventoryRecord> {
  const normalizedUpdates: InventoryRecordUpdate =
    typeof updates === "number" ? { quantity_units: updates } : updates;

  if (!USE_REAL_API) {
    return new Promise((resolve, reject) => {
      window.setTimeout(() => {
        const currentRecord = mockInventoryStore.find((record) => record.id === recordId);
        if (!currentRecord) {
          reject(new ApiError(404, `Inventory record with ID ${recordId} not found.`));
          return;
        }

        const updatedRecord: InventoryRecord = {
          ...currentRecord,
          ...normalizedUpdates,
          last_updated: new Date().toISOString(),
        };
        mockInventoryStore = mockInventoryStore.map((record) =>
          record.id === recordId ? updatedRecord : record,
        );
        resolve(updatedRecord);
      }, 200);
    });
  }

  const response = await fetch(`${API_BASE_URL}/inventory/${recordId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(normalizedUpdates),
  });

  return handleResponse<InventoryRecord>(response);
}

export async function createInventoryRecord(record: NewInventoryRecord): Promise<InventoryRecord> {
  if (!USE_REAL_API) {
    return new Promise((resolve) => {
      window.setTimeout(() => {
        const createdRecord: InventoryRecord = {
          ...record,
          id: Date.now(),
          last_updated: new Date().toISOString(),
        };
        mockInventoryStore = [createdRecord, ...mockInventoryStore];
        resolve(createdRecord);
      }, 220);
    });
  }

  const response = await fetch(`${API_BASE_URL}/inventory`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(record),
  });

  return handleResponse<InventoryRecord>(response);
}

export async function deleteInventoryRecord(recordId: number): Promise<void> {
  if (!USE_REAL_API) {
    return new Promise((resolve) => {
      window.setTimeout(() => {
        mockInventoryStore = mockInventoryStore.filter((record) => record.id !== recordId);
        resolve();
      }, 180);
    });
  }

  const response = await fetch(`${API_BASE_URL}/inventory/${recordId}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    await handleResponse<unknown>(response);
  }
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
