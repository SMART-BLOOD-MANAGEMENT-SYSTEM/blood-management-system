import { mockBloodBanks } from "../data/mockBloodBanks";
import { mockRequests } from "../data/mockRequests";
import type { BloodRequest, NewBloodRequest } from "../types/request";

export async function fetchBloodRequests(): Promise<BloodRequest[]> {
  // TODO: Replace mock response with GET /api/blood-requests in Sprint 2.
  return new Promise((resolve) => {
    window.setTimeout(() => resolve(mockRequests), 350);
  });
}

export async function createBloodRequest(request: NewBloodRequest): Promise<BloodRequest> {
  // TODO: Replace mock response with POST /api/blood-requests in Sprint 2.
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
