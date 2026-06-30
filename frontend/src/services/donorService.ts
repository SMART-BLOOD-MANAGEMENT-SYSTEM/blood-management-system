import { mockDonors } from "../data/mockDonors";
import type { DonorProfile, DonorSearchFilters, NewDonorBloodRequest } from "../types/request";

const viteEnv = (import.meta as ImportMeta & { env?: Record<string, string | undefined> }).env;
const API_BASE_URL = viteEnv?.VITE_API_BASE_URL ?? "/api";
const USE_REAL_API = viteEnv?.VITE_USE_REAL_API === "true";

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    const message =
      typeof body === "object" && body !== null && "message" in body
        ? String((body as { message: string }).message)
        : `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  return response.json() as Promise<T>;
}

export async function fetchDonors(filters: DonorSearchFilters): Promise<DonorProfile[]> {
  if (USE_REAL_API) {
    const params = new URLSearchParams();
    if (filters.blood_type) params.set("blood_type", filters.blood_type);
    if (filters.city.trim()) params.set("city", filters.city.trim());
    if (filters.last_donation_within_months !== "any") {
      params.set("last_donation_within_months", filters.last_donation_within_months);
    }

    const query = params.toString();
    const response = await fetch(`${API_BASE_URL}/donors/search${query ? `?${query}` : ""}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    return handleResponse<DonorProfile[]>(response);
  }

  return new Promise((resolve) => {
    window.setTimeout(() => {
      resolve(
        mockDonors.filter((donor) => {
          const matchesBloodType = !filters.blood_type || donor.blood_type === filters.blood_type;
          const matchesCity = !filters.city || donor.city === filters.city;
          const matchesLastDonation =
            filters.last_donation_within_months === "any" ||
            donor.last_donation_months <= Number.parseInt(filters.last_donation_within_months, 10);

          return matchesBloodType && matchesCity && matchesLastDonation;
        }),
      );
    }, 300);
  });
}

export async function createDonorBloodRequest(request: NewDonorBloodRequest): Promise<NewDonorBloodRequest> {
  if (USE_REAL_API) {
    const response = await fetch(`${API_BASE_URL}/donor-requests`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...request,
        patient_name: request.patient_name.trim(),
        city: request.city.trim(),
        hospital_name: request.hospital_name.trim(),
        notes: request.notes?.trim() || undefined,
      }),
    });

    return handleResponse<NewDonorBloodRequest>(response);
  }

  return new Promise((resolve) => {
    window.setTimeout(() => resolve(request), 250);
  });
}
