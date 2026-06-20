import api from "./api"; // بنستدعي الجسر اللي عملناه
import type { DonorProfile, DonorSearchFilters, NewDonorBloodRequest } from "../types/request";

export async function fetchDonors(filters: DonorSearchFilters): Promise<DonorProfile[]> {
  // بدلنا الـ Mock بالطلب الحقيقي للـ API
  const response = await api.get('/donors', { params: filters });
  return response.data;
}

export async function createDonorBloodRequest(request: NewDonorBloodRequest): Promise<NewDonorBloodRequest> {
  // طلب الـ POST الحقيقي
  const response = await api.post('/donor-requests', request);
  return response.data;
}
export const registerDonor = async (userData: any) => {
  return await api.post('/register', userData);
};