import type { BloodBankSummary } from "../types/request";

export const mockBloodBanks: BloodBankSummary[] = [
  {
    id: 1,
    name: "Al-Noor Blood Bank",
    city: "Gaza",
    address: "Al-Rimal, Gaza",
    contact_number: "+970-59-100-0001",
  },
  {
    id: 2,
    name: "Palestine Medical Complex Blood Bank",
    city: "Ramallah",
    address: "Al-Irsal Street, Ramallah",
    contact_number: "+970-59-100-0002",
  },
  {
    id: 3,
    name: "Alia Governmental Hospital Blood Bank",
    city: "Hebron",
    address: "Ein Sarah, Hebron",
    contact_number: "+970-59-100-0003",
  },
  {
    id: 4,
    name: "Rafidia Surgical Hospital Blood Bank",
    city: "Nablus",
    address: "Rafidia, Nablus",
    contact_number: "+970-59-100-0004",
  },
];
