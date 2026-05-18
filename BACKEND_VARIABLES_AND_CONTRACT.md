# Person 4 Backend Handoff - Find Donor Flow

This file documents the variable names, DTO shapes, validation rules, and API expectations used by the Person 4 frontend after aligning it with Person 3 public UI and Person 5 request/admin UI.

## Frontend Scope

Person 4 owns the donor search flow:

- Find donors by `blood_type`, `city`, and `last_donation_within_months`.
- Display donor cards with request/profile actions.
- Open a request modal and prepare a `NewBloodRequestPayload`.
- Open a lightweight donor profile modal.

## Shared Types

Use these values exactly so the frontend and backend stay consistent.

```ts
type BloodType = "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-";

type AvailabilityStatus = "available" | "temporarily_unavailable";

type UrgencyLevel = "low" | "normal" | "urgent" | "critical";

type LastDonationFilter = "any" | "1" | "3" | "6" | "12";
```

## Donor DTO

The donor cards expect this backend response shape.

```ts
type DonorProfile = {
  id: number;
  full_name: string;
  blood_type: BloodType;
  city: string;
  phone: string;
  last_donation_date: string; // ISO date, example: "2026-02-15"
  last_donation_months: number; // backend can compute this, frontend uses it for display/filtering
  availability_status: AvailabilityStatus;
  notes?: string;
};
```

## Search Query

Frontend state variable: `filters`

```ts
type DonorSearchFilters = {
  blood_type: BloodType | "";
  city: string;
  last_donation_within_months: LastDonationFilter;
};
```

Recommended endpoint:

```http
GET /api/donors/search?blood_type=A%2B&city=Gaza&last_donation_within_months=3
```

Expected response:

```ts
{
  donors: DonorProfile[];
}
```

Filter rules:

- Empty `blood_type` means all blood types.
- Empty `city` means all cities.
- `last_donation_within_months=any` means no last-donation filter.
- Numeric values `1`, `3`, `6`, `12` mean donors whose `last_donation_months <= value`.

## Create Blood Request Payload

Frontend state variables:

- `requestDonor`: selected donor card.
- `requestDraft`: controlled modal form data.
- `requestErrors`: frontend validation messages.
- `submittedRequest`: final payload preview after validation.

Payload sent to backend:

```ts
type NewBloodRequestPayload = {
  donor_id: number;
  patient_name: string;
  blood_type: BloodType;
  city: string;
  hospital_name: string;
  urgency_level: UrgencyLevel;
  notes?: string;
};
```

Recommended endpoint:

```http
POST /api/blood-requests
Content-Type: application/json
```

Example request:

```json
{
  "donor_id": 401,
  "patient_name": "Mariam Saleh",
  "blood_type": "A+",
  "city": "Gaza",
  "hospital_name": "Al-Noor Hospital",
  "urgency_level": "critical",
  "notes": "Needed for emergency surgery preparation."
}
```

Expected response:

```ts
{
  id: number;
  donor_id: number;
  patient_name: string;
  blood_type: BloodType;
  city: string;
  hospital_name: string;
  urgency_level: UrgencyLevel;
  status: "pending" | "fulfilled" | "cancelled";
  request_date: string;
}
```

Validation rules:

- `patient_name` is required.
- `blood_type` is required.
- `city` is required.
- `hospital_name` is required.
- `urgency_level` is required.
- `notes` is optional.
- Disable or reject requests when donor `availability_status !== "available"`.

## Optional Donor Profile Endpoint

Recommended endpoint:

```http
GET /api/donors/:id
```

Expected response:

```ts
{
  donor: DonorProfile;
}
```

## UI Field Mapping

| UI Label | Frontend variable | Backend field |
| --- | --- | --- |
| Select Blood type | `filters.blood_type` | `blood_type` query param |
| Select City | `filters.city` | `city` query param |
| Last Donation | `filters.last_donation_within_months` | `last_donation_within_months` query param |
| Donor name | `donor.full_name` | `full_name` |
| Donor city | `donor.city` | `city` |
| Donor last donation | `donor.last_donation_months` | `last_donation_months` |
| Patient Name | `requestDraft.patient_name` | `patient_name` |
| Blood Type | `requestDraft.blood_type` | `blood_type` |
| Hospital Name | `requestDraft.hospital_name` | `hospital_name` |
| Urgency Level | `requestDraft.urgency_level` | `urgency_level` |
| Notes | `requestDraft.notes` | `notes` |

## Current Mock Data Notes

Mock donor IDs are `401` through `409`. They are frontend-only placeholders. Backend can replace them with database IDs as long as the response keeps the DTO names above.

The frontend uses snake_case field names to match the existing Person 5/backend-facing request types in `apps/web/src/types/request.ts`.
