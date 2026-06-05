# SBMS Frontend Team Backend Handoff

This file documents the frontend variables, data contracts, mock data, and backend API needs for the combined frontend work from Person 3, Person 4, and Person 5.

Unified frontend project:

- Path: `apps/web`
- Runtime: React + TypeScript + Vite
- Local dev command: `npm run dev -- --host 127.0.0.1 --port 5175`
- Current verified URL in this session: `http://127.0.0.1:5179/` because 5175-5178 were already busy.
- Main composition file: `apps/web/src/App.tsx`

Frontend ownership map:

| Person | Current integrated surface | Main files |
| --- | --- | --- |
| Person 3 | Home hero, quick search, about section, steps, home urgent preview, contact form, footer, terms/privacy pages | `src/App.tsx`, `src/styles/global.css`, `public/home-hero-bg.png`, `public/about-main.png` |
| Person 4 | Find Facilities search, facility cards, facility details, appointment booking, donor appointments/profile/notifications | `src/App.tsx`, `src/services/donorService.ts`, `src/services/authService.ts` |
| Person 5 | Urgent requests, admin blood requests, inventory, appointments, slots, profile update, request/inventory service layer | `src/App.tsx`, `src/services/requestService.ts`, `src/services/authService.ts` |

Latest frontend QA/update notes:

- Public `Find Centers` and quick search now route to the donor facility search page instead of a dead/login-only action.
- Footer `Terms & Conditions` and `Privacy Policy` now open real public pages.
- Footer contact form now validates visible fields and shows a success/error state; backend can wire it to `POST /api/contact-messages`.
- Donor/facility profile select fields now update React state before save.
- Admin donation slot creation now saves the actual date, start time, end time, and capacity entered by the user.
- Admin blood request `notes` field is now included in the `NewBloodRequest` payload.
- `donorService.ts` and `authService.ts` now honor `VITE_USE_REAL_API=true` and `VITE_API_BASE_URL`.

Important integration rule:

- The combined app must keep one shared `Header` and one shared `Footer` from `App.tsx`.
- Person 3, 4, and 5 screens are sections inside the same app, not separate pages with repeated navigation/footer.
- Current UI assets were aligned to `UI UX _Smart blood managment system`, including `SBMS Logos copy-01.svg` copied to `apps/web/public/sbms-logo.svg`.
- The `AddRequestForm` component is connected to the Requests screen through the `Add New Request` button. Submitting the form prepends the mock-created request to the visible request list, and the same payload is ready for the Sprint 2 `POST /api/blood-requests` integration.

## Shared Enum Values

These values must match backend validation exactly.

### `BloodType`

```ts
"A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-"
```

Database enum suggestion: `blood_type_enum`.

### `UrgencyLevel`

```ts
"low" | "normal" | "urgent" | "critical"
```

Used by:

- Blood request creation.
- Request cards.
- Donor request modal.

### `RequestStatus`

```ts
"pending" | "fulfilled" | "cancelled"
```

Used by:

- `BloodRequest.status`
- Filtering urgent vs all requests.

Frontend urgent request condition:

```ts
status === "pending" && (urgency_level === "critical" || urgency_level === "urgent")
```

### `AppointmentStatus`

```ts
"pending" | "confirmed" | "cancelled" | "completed"
```

Used by admin appointments.

### `AvailabilityStatus`

```ts
"available" | "temporarily_unavailable"
```

Used by donor cards.

Frontend disables the `Request` button when:

```ts
availability_status !== "available"
```

### `LastDonationFilter`

```ts
"any" | "1" | "3" | "6" | "12"
```

Used by donor search filter `last_donation_within_months`.

## Shared Data Contracts

Source file:

`apps/web/src/types/request.ts`

### `BloodBankSummary`

Returned inside requests and used by bank selectors.

```ts
interface BloodBankSummary {
  id: number;
  name: string;
  city?: string;
  address?: string;
  contact_number?: string;
}
```

Backend table mapping:

| Frontend field | Backend table | Backend field |
| --- | --- | --- |
| `id` | `blood_banks` | `id` |
| `name` | `blood_banks` | `name` |
| `city` | `blood_banks` | `city` |
| `address` | `blood_banks` | `address` |
| `contact_number` | `blood_banks` | `contact_number` |

### `BloodRequest`

Used by Person 5 request cards and admin requests.

```ts
interface BloodRequest {
  id: number;
  bank_id: number;
  patient_name?: string | null;
  blood_type: BloodType;
  required_units: number;
  urgency_level: UrgencyLevel;
  status: RequestStatus;
  request_date: string;
  blood_bank?: BloodBankSummary;
}
```

Backend table mapping:

| Frontend field | Backend table | Backend field |
| --- | --- | --- |
| `id` | `blood_requests` | `id` |
| `bank_id` | `blood_requests` | `bank_id` |
| `patient_name` | `blood_requests` | `patient_name` |
| `blood_type` | `blood_requests` | `blood_type` |
| `required_units` | `blood_requests` | `required_units` |
| `urgency_level` | `blood_requests` | `urgency_level` |
| `status` | `blood_requests` | `status` |
| `request_date` | `blood_requests` | `request_date` |
| `blood_bank` | joined relation | `blood_banks` summary object |

Date format:

- `request_date` should be ISO 8601 string.
- Example: `"2026-05-15T14:30:00.000Z"`

### `NewBloodRequest`

Payload sent by Person 5 add request form.

```ts
interface NewBloodRequest {
  bank_id: number;
  patient_name?: string;
  blood_type: BloodType;
  required_units: number;
  urgency_level: UrgencyLevel;
  notes?: string;
}
```

Validation expected by frontend:

| Field | Rule |
| --- | --- |
| `bank_id` | required, must exist in `blood_banks.id` |
| `blood_type` | required, must be valid `BloodType` |
| `required_units` | required integer greater than `0` |
| `urgency_level` | required, must be valid `UrgencyLevel` |
| `patient_name` | optional, trim whitespace |
| `notes` | **NEW** optional, trim whitespace |

### `DonorProfile`

Used by Person 4 Find Donor cards and profile modal.

```ts
interface DonorProfile {
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
```

Backend source suggestion:

- Use `users` table where `role = "donor"`.
- Add/derive donor availability fields from eligibility and donation history.

Backend mapping suggestion:

| Frontend field | Backend source |
| --- | --- |
| `id` | `users.id` |
| `full_name` | `users.full_name` |
| `blood_type` | `users.blood_type` |
| `city` | `users.city` |
| `phone` | `users.phone` |
| `last_donation_date` | latest completed appointment or donation record |
| `last_donation_months` | backend-calculated number for filtering/display |
| `availability_status` | derived from `users.is_eligible` and last donation interval |
| `notes` | optional backend/admin note |

### `DonorSearchFilters`

Query object used by Person 4 donor search.

```ts
interface DonorSearchFilters {
  blood_type: BloodType | "";
  city: string;
  last_donation_within_months: LastDonationFilter;
}
```

Query params:

| Param | Example | Notes |
| --- | --- | --- |
| `blood_type` | `O+` | optional; empty means all |
| `city` | `Gaza` | optional; empty means all |
| `last_donation_within_months` | `3` | `"any"` means no date filter |

### `NewDonorBloodRequest`

Payload sent from Person 4 donor request modal.

```ts
interface NewDonorBloodRequest {
  donor_id: number;
  patient_name: string;
  blood_type: BloodType;
  city: string;
  hospital_name: string;
  urgency_level: UrgencyLevel;
  notes?: string;
}
```

Validation expected by frontend:

| Field | Rule |
| --- | --- |
| `donor_id` | required, must exist in donor list |
| `patient_name` | required, trim whitespace |
| `blood_type` | required, valid `BloodType` |
| `city` | required, trim whitespace |
| `hospital_name` | required, trim whitespace |
| `urgency_level` | required, valid `UrgencyLevel` |
| `notes` | optional, trim whitespace |

Backend note:

- This payload does not perfectly match the current `blood_requests` SQL table because it includes `donor_id`, `city`, and `hospital_name`.
- Recommended backend options:
  - Create a dedicated `donor_requests` table.
  - Or map `hospital_name/city` to a `blood_bank` first, then create a `blood_requests` row and notify `donor_id`.

## Frontend Variables By Surface

These are the important frontend variables and state names the backend team may see while integrating APIs.

### Person 3: Home and Shared Contact

Files:

- `apps/web/src/components/HomeHero.tsx`
- `apps/web/src/App.tsx`

Backend-relevant UI fields:

| UI field | Suggested backend variable | Notes |
| --- | --- | --- |
| `Enter Name` | `name` | footer contact form |
| `Interested` | `interest` | currently a free text input |
| `Enter your message` | `message` | footer contact form |

Recommended optional payload:

```ts
interface ContactMessagePayload {
  name: string;
  interest?: string;
  message: string;
}
```

Recommended endpoint:

```txt
POST /api/contact-messages
```

Person 3 CTA behavior:

| Button/link text | Current target | Backend needed now |
| --- | --- | --- |
| `Become a Donor` | `#register` | auth/register endpoint when real auth is enabled |
| `View Urgent Requests` | `#requests` section on public home | no |
| `Find Centers` | `#donor-search` | donor/facility search API when real API is enabled |
| public quick search `Search` | `#donor-search?blood=...&city=...` | `GET /api/donors/search` or facility search endpoint |
| footer `Terms & Conditions` | `#terms` | no |
| footer `Privacy Policy` | `#privacy` | no |

### Person 4: Find Donor

File:

- `apps/web/src/pages/DonorSearchPage.tsx`

State variables:

| Variable | Type | Purpose |
| --- | --- | --- |
| `filters` | `DonorSearchFilters` | selected donor search filters |
| `setFilters` | React setter | updates `filters` |
| `donors` | `DonorProfile[]` | currently displayed donor cards |
| `setDonors` | React setter | replaces donor cards after search |
| `isLoading` | `boolean` | donor search loading state |
| `setIsLoading` | React setter | controls loading state |
| `requestDonor` | `DonorProfile | null` | selected donor for request modal |
| `setRequestDonor` | React setter | opens/closes request modal |
| `profileDonor` | `DonorProfile | null` | selected donor for profile modal |
| `setProfileDonor` | React setter | opens/closes profile modal |
| `requestDraft` | `RequestDraft` | request form data before submit |
| `setRequestDraft` | React setter | updates request form data |
| `requestErrors` | `Partial<Record<keyof RequestDraft, string>>` | validation messages |
| `setRequestErrors` | React setter | updates validation messages |
| `successMessage` | `string` | modal success text after submit |
| `setSuccessMessage` | React setter | updates success text |

Constants and option variables:

| Variable | Value / type |
| --- | --- |
| `bloodTypes` | `BloodType[]` |
| `urgencyLevels` | `UrgencyLevel[]` |
| `initialFilters` | default `DonorSearchFilters` |
| `lastDonationOptions` | dropdown options for `last_donation_within_months` |
| `emptyDraft` | default request modal form |
| `bloodTypeOptions` | dropdown options generated from `bloodTypes` |
| `cityOptions` | dropdown options generated from `mockDonors.city` |

Functions:

| Function | Backend relevance |
| --- | --- |
| `handleSearch()` | should call `GET /api/donors/search` |
| `openRequestModal(donor)` | no API; prepares form |
| `updateFilter(field, value)` | no API; UI state |
| `updateRequestDraft(field, value)` | no API; UI state |
| `submitRequest()` | should call `POST /api/donor-requests` or mapped backend endpoint |
| `validateRequestDraft(draft)` | frontend validation; backend must repeat validation |
| `formatBloodBadge(bloodType)` | UI formatting only |

Current service functions:

File: `apps/web/src/services/donorService.ts`

| Function | Current behavior | Backend replacement |
| --- | --- | --- |
| `fetchDonors(filters)` | filters `mockDonors` locally unless `VITE_USE_REAL_API=true` | `GET /api/donors/search` |
| `createDonorBloodRequest(request)` | returns payload after mock delay unless `VITE_USE_REAL_API=true` | `POST /api/donor-requests` |

Recommended endpoints:

```txt
GET /api/donors/search?blood_type=O%2B&city=Gaza&last_donation_within_months=3
GET /api/donors/:id
POST /api/donor-requests
```

Recommended donor search response:

```json
[
  {
    "id": 402,
    "full_name": "Mohammed Salem",
    "blood_type": "O+",
    "city": "Gaza",
    "phone": "+970-59-400-0002",
    "last_donation_date": "2026-03-10",
    "last_donation_months": 2,
    "availability_status": "available"
  }
]
```

Recommended donor request payload:

```json
{
  "donor_id": 402,
  "patient_name": "Mariam Saleh",
  "blood_type": "O+",
  "city": "Gaza",
  "hospital_name": "Al-Noor Hospital",
  "urgency_level": "critical",
  "notes": "Optional note"
}
```

### Person 5: Urgent Requests and Add Request

Files:

- `apps/web/src/pages/RequestsPage.tsx`
- `apps/web/src/components/RequestCard.tsx`
- `apps/web/src/components/AddRequestForm.tsx`
- `apps/web/src/services/requestService.ts`

Requests page state variables:

| Variable | Type | Purpose |
| --- | --- | --- |
| `requests` | `BloodRequest[]` | all loaded blood requests |
| `setRequests` | React setter | updates request list |
| `isLoading` | `boolean` | loading state for requests |
| `setIsLoading` | React setter | controls loading state |
| `error` | `string` | error message when request loading fails |
| `setError` | React setter | updates error message |
| `urgentRequests` | `BloodRequest[]` | computed urgent/critical pending requests |
| `allRequests` | `BloodRequest[]` | computed non-urgent non-cancelled requests |

Requests page functions:

| Function | Backend relevance |
| --- | --- |
| `loadRequests()` | should call `GET /api/blood-requests` |
| `handleCreateRequest(request)` | should call `POST /api/blood-requests` then prepend response |

Request card variables:

| Variable | Type | Purpose |
| --- | --- | --- |
| `hasOfferedHelp` | `boolean` | UI-only state after clicking `I Can Help` |
| `isUrgent` | `boolean` | derived from `variant` or `urgency_level` |
| `statusLabel` | `string` | display `urgency_level.toUpperCase()` |
| `bankName` | `string` | `blood_bank.name` fallback to `Blood bank #bank_id` |
| `bankCity` | `string` | optional city display |
| `isFilled` | `boolean` | styles first button before click |

Add request form state variables:

| Variable | Type | Purpose |
| --- | --- | --- |
| `form` | `NewBloodRequest` | form payload before submit |
| `setForm` | React setter | updates form |
| `errors` | `FormErrors` | validation messages |
| `setErrors` | React setter | updates validation messages |
| `isSubmitting` | `boolean` | submit loading state |
| `setIsSubmitting` | React setter | controls submit loading |
| `successMessage` | `string` | success text after submit |
| `setSuccessMessage` | React setter | updates success text |

Add request form constants:

| Variable | Value / type |
| --- | --- |
| `bloodTypes` | `BloodType[]` |
| `urgencyLevels` | `UrgencyLevel[]` |
| `initialForm` | default `NewBloodRequest` |
| `FormErrors` | `Partial<Record<keyof NewBloodRequest, string>>` |

Current service functions:

File: `apps/web/src/services/requestService.ts`

| Function | Current behavior | Backend replacement |
| --- | --- | --- |
| `fetchBloodRequests()` | returns mock store when `VITE_USE_REAL_API` is not `"true"` | `GET /api/blood-requests` |
| `fetchBloodRequestsByBank(bankId)` | filters mock store by `bank_id` | `GET /api/blood-requests?bank_id=:bankId` |
| `createBloodRequest(request)` | creates mock `BloodRequest` with `Date.now()` id and prepends it to the store | `POST /api/blood-requests` |
| `updateBloodRequest(requestId, updates)` | patches a mock request in the store | `PATCH /api/blood-requests/:id` |
| `updateBloodRequestStatus(requestId, status)` | patches status in the mock store | `PATCH /api/blood-requests/:id/status` |
| `deleteBloodRequest(requestId)` | removes a mock request from the store | `DELETE /api/blood-requests/:id` |

Recommended endpoints:

```txt
GET /api/blood-requests
GET /api/blood-requests?bank_id=:bankId
POST /api/blood-requests
PATCH /api/blood-requests/:id
PATCH /api/blood-requests/:id/status
DELETE /api/blood-requests/:id
GET /api/blood-banks/search
GET /api/blood-banks/:id
```

Recommended create request payload:

```json
{
  "bank_id": 1,
  "patient_name": "Mariam Saleh",
  "blood_type": "O+",
  "required_units": 1,
  "urgency_level": "critical",
  "notes": "Optional note"
}
```

Recommended create request response:

```json
{
  "id": 1700000000000,
  "bank_id": 1,
  "patient_name": "Mariam Saleh",
  "blood_type": "O+",
  "required_units": 1,
  "urgency_level": "critical",
  "status": "pending",
  "request_date": "2026-05-15T14:30:00.000Z",
  "notes": "Optional note",
  "blood_bank": {
    "id": 1,
    "name": "Al-Noor Blood Bank",
    "city": "Gaza",
    "address": "Al-Rimal, Gaza",
    "contact_number": "+970-59-100-0001"
  }
}
```

## Admin Screen Variables

These screens are currently skeletons but already show the backend contract direction.

### Admin Facility Profile

File: `apps/web/src/pages/admin/AdminProfile.tsx` (Integrated in App.tsx)

**High-Fidelity UI Update Note:** The following fields have been added to the frontend to match the professional design and require backend DB Schema updates (Migrations) to the `blood_banks` table:

```ts
interface FacilityProfileUpdate {
  facility_name: string;
  facility_type: "Hospital" | "Blood Bank" | "Clinic";
  city: string;
  public_phone: string;
  full_address: string;
  contact_person: string;
  working_hours: string;
  operational_status: "Active (Accepting Donors)" | "Inactive" | "Maintenance";
}
```

| Frontend field | Backend field | Notes |
| --- | --- | --- |
| `facility_name` | `name` | |
| `city` | `city` | |
| `public_phone` | `contact_number` | |
| `full_address` | `address` | |
| `facility_type` | **NEW** `type` | Requires DB migration |
| `working_hours` | **NEW** `working_hours` | Requires DB migration |
| `contact_person` | **NEW** `contact_person` | Requires DB migration |
| `operational_status` | **NEW** `operational_status` | Requires DB migration |

Recommended endpoint:

```txt
PATCH /api/blood-banks/:id
```

### Admin Requests

File: `apps/web/src/pages/admin/AdminRequests.tsx`

Props:

```ts
interface AdminRequestsProps {
  requests: BloodRequest[];
}
```

Fields displayed:

- `request.blood_type`
- `request.blood_bank?.name`
- `request.bank_id`
- `request.blood_bank?.city`
- `request.required_units`
- `request.urgency_level`

Recommended endpoint:

```txt
GET /api/blood-requests?bank_id=:bankId
PATCH /api/blood-requests/:id
PATCH /api/blood-requests/:id/status
DELETE /api/blood-requests/:id
```

### Admin Inventory

File: `apps/web/src/pages/admin/AdminInventory.tsx`

Current row shape:

```ts
{
  id: number;
  bank_id: number;
  blood_type: BloodType;
  quantity_units: number;
  expiration_date: string;
}
```

Frontend display logic:

```ts
quantity_units < 8  => "Low stock"
quantity_units < 12 => "Watch"
otherwise           => "Stable"
```

Recommended endpoints:

```txt
GET /api/inventory?bank_id=:bankId
POST /api/inventory
PATCH /api/inventory/:id
DELETE /api/inventory/:id
```

### Admin Appointments

File: `apps/web/src/pages/admin/AdminAppointments.tsx`

Current row shape:

```ts
{
  id: number;
  user_id: number;
  slot_id: number;
  donor_name: string;
  bank_name: string;
  slot_label: string;
  appointment_status: AppointmentStatus;
}
```

Recommended response should preferably include both raw IDs and display names:

```json
{
  "id": 1,
  "user_id": 11,
  "slot_id": 101,
  "donor_name": "Nour Hassan",
  "bank_name": "Palestine Medical Complex Blood Bank",
  "slot_label": "Today, 11:30",
  "appointment_status": "pending"
}
```

Recommended endpoints:

```txt
GET /api/appointments/bank/:bankId
PATCH /api/appointments/:id/status
```

Allowed status update payload:

```json
{
  "appointment_status": "confirmed"
}
```

## Mock Data Files

These files are frontend placeholders and should be replaced by API calls.

| File | Export | Backend replacement |
| --- | --- | --- |
| `src/data/mockBloodBanks.ts` | `mockBloodBanks` | `GET /api/blood-banks/search` |
| `src/data/mockRequests.ts` | `mockRequests` | `GET /api/blood-requests` |
| `src/data/mockDonors.ts` | `mockDonors` | `GET /api/donors/search` |

## Current Mock IDs

Blood bank IDs:

| id | name | city |
| --- | --- | --- |
| `1` | `Al-Noor Blood Bank` | `Gaza` |
| `2` | `Palestine Medical Complex Blood Bank` | `Ramallah` |
| `3` | `Alia Governmental Hospital Blood Bank` | `Hebron` |
| `4` | `Rafidia Surgical Hospital Blood Bank` | `Nablus` |

Donor IDs:

| id | full_name | blood_type | city |
| --- | --- | --- | --- |
| `401` | `Asmaa Alali` | `A+` | `Gaza` |
| `402` | `Mohammed Salem` | `O+` | `Gaza` |
| `403` | `Heba Ahmed` | `B+` | `Rafah` |
| `404` | `Sara Nabil` | `AB+` | `Khan Younis` |
| `405` | `Omar Khaled` | `A-` | `Ramallah` |
| `406` | `Mona Ali` | `O-` | `Hebron` |
| `407` | `Yousef Adel` | `A+` | `Nablus` |
| `408` | `Lina Samir` | `B-` | `Bethlehem` |
| `409` | `Nour Hassan` | `AB-` | `Jericho` |

Request IDs:

| id | bank_id | patient_name | blood_type | urgency_level | status |
| --- | --- | --- | --- | --- | --- |
| `1001` | `1` | `Mariam Saleh` | `A+` | `critical` | `pending` |
| `1002` | `3` | `Yousef Darwish` | `O-` | `critical` | `pending` |
| `1003` | `4` | `Lina Nassar` | `B+` | `urgent` | `pending` |
| `1004` | `2` | `Hiba Barakat` | `AB+` | `normal` | `pending` |
| `1005` | `1` | `Omar Saleh` | `O+` | `low` | `fulfilled` |
| `1006` | `3` | `Layan Daraghmeh` | `AB-` | `normal` | `pending` |

## Recommended Backend API Summary

Minimum endpoints needed for the current frontend:

```txt
GET    /api/blood-banks/search
GET    /api/blood-requests
GET    /api/blood-requests?bank_id=:bankId
POST   /api/blood-requests
PATCH  /api/blood-requests/:id
PATCH  /api/blood-requests/:id/status
DELETE /api/blood-requests/:id
GET    /api/donors/search
GET    /api/donors/:id
POST   /api/donor-requests
GET    /api/inventory?bank_id=:bankId
POST   /api/inventory
PATCH  /api/inventory/:id
DELETE /api/inventory/:id
GET    /api/appointments/bank/:bankId
PATCH  /api/appointments/:id/status
POST   /api/contact-messages
```

Nice-to-have endpoints:

```txt
POST   /api/auth/register/donor
POST   /api/auth/register/admin
POST   /api/auth/login
POST   /api/auth/logout
GET    /api/me
PATCH  /api/me
GET    /api/notifications
```

## Backend Integration Notes

- Use `snake_case` field names in API responses because the frontend types already use schema-aligned names.
- IDs are numbers, not strings.
- Dates should be ISO strings.
- Backend must repeat all validation even when frontend validates.
- Return useful joined summaries such as `blood_bank` to avoid extra frontend calls for request cards.
- Preserve exact enum values; frontend comparisons are string-based.
- If backend changes an enum value, update `apps/web/src/types/request.ts` first.
- Current frontend services have TODO comments showing where to replace mock data with real fetch calls:
  - `src/services/requestService.ts`
  - `src/services/donorService.ts`
- Sprint 3 request/admin integration can be switched to real APIs with:
  - `VITE_USE_REAL_API=true`
  - optional `VITE_API_BASE_URL=/api` override when the backend is not served from the same origin.
- Donor search/request and auth/profile service calls now use the same environment switch:
  - `apps/web/src/services/donorService.ts`
  - `apps/web/src/services/authService.ts`

## Backend Readiness Checklist

- [ ] Confirm final database table for donor-targeted requests.
- [ ] Confirm whether `hospital_name` maps to `blood_banks.name` or a separate hospital entity.
- [ ] **DB MIGRATION:** Add `notes` (string/nullable) to `blood_requests` table.
- [ ] **DB MIGRATION:** Add `type`, `working_hours`, `contact_person`, and `operational_status` to `blood_banks` table.
- [ ] Implement `GET /api/blood-requests` with optional joined `blood_bank`.
- [ ] Implement `POST /api/blood-requests`.
- [ ] Implement `PATCH /api/blood-requests/:id`, `PATCH /api/blood-requests/:id/status`, and `DELETE /api/blood-requests/:id`.
- [ ] Implement `GET /api/donors/search`.
- [ ] Implement admin inventory endpoints: `GET`, `POST`, `PATCH`, and `DELETE /api/inventory`.
- [ ] Implement admin appointment endpoints.
- [ ] Implement `PATCH /api/blood-banks/:id` to support facility profile updates.
- [ ] Confirm auth/session plan before protecting admin endpoints.
- [ ] Keep response field names aligned with this document.
