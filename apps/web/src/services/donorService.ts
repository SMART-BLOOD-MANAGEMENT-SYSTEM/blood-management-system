import { mockDonors } from "../data/mockDonors";
import type { DonorProfile, DonorSearchFilters, NewDonorBloodRequest } from "../types/request";

export async function fetchDonors(filters: DonorSearchFilters): Promise<DonorProfile[]> {
  // TODO: Replace mock response with GET /api/donors/search in Sprint 2.
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
  // TODO: Replace mock response with POST /api/donor-requests or the backend-approved endpoint.
  return new Promise((resolve) => {
    window.setTimeout(() => resolve(request), 250);
  });
}
