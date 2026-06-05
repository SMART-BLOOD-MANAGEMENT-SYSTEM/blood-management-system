# Smart Blood Management System - MVP

This repository contains the MVP source and project documentation for the Smart Blood Management System (SBMS). The current database contract is defined in `سكيما.sql` and should be treated as the source of truth for table names, enum values, and field names.

## MVP Goal

Build a simple web application that helps donors, admins, doctors, hospitals, and blood banks manage the core donation flow:

- Register and authenticate users.
- Search donors and blood banks by city and blood type.
- Show blood bank details and available donation slots.
- Book donation appointments.
- Allow admins to manage appointments, blood inventory, and blood requests.
- Keep mock frontend data aligned with the SQL schema before backend integration.

## Schema v2 Source of Truth

The schema file creates these enum types:

| Enum | Values |
| --- | --- |
| `blood_type_enum` | `A+`, `A-`, `B+`, `B-`, `AB+`, `AB-`, `O+`, `O-` |
| `role_enum` | `donor`, `admin`, `doctor` |
| `gender_enum` | `male`, `female` |

## Database Tables

| Table | Key fields |
| --- | --- |
| `users` | `id`, `full_name`, `email`, `password_hash`, `phone`, `role`, `blood_type`, `gender`, `birth_date`, `city`, `is_eligible`, `created_at`, `updated_at` |
| `blood_banks` | `id`, `name`, `city`, `address`, `latitude`, `longitude`, `contact_number`, `email`, `created_at`, `updated_at` |
| `donation_slots` | `id`, `bank_id`, `slot_date`, `start_time`, `end_time`, `max_capacity` |
| `appointments` | `id`, `user_id`, `slot_id`, `appointment_status`, `notes`, `created_at`, `updated_at` |
| `blood_inventory` | `id`, `bank_id`, `appointment_id`, `blood_type`, `quantity_units`, `expiration_date`, `last_updated` |
| `blood_requests` | `id`, `bank_id`, `patient_name`, `blood_type`, `required_units`, `urgency_level`, `status`, `request_date` |
| `blood_disbursements` | `id`, `request_id`, `inventory_id`, `units_used`, `dispatched_at` |
| `notifications` | `id`, `user_id`, `title`, `message`, `type`, `is_read`, `created_at` |

## Main Relationships

- `donation_slots.bank_id` references `blood_banks.id`.
- `appointments.user_id` references `users.id`.
- `appointments.slot_id` references `donation_slots.id`.
- `blood_inventory.bank_id` references `blood_banks.id`.
- `blood_inventory.appointment_id` references `appointments.id`.
- `blood_requests.bank_id` references `blood_banks.id`.
- `blood_disbursements.request_id` references `blood_requests.id`.
- `blood_disbursements.inventory_id` references `blood_inventory.id`.
- `notifications.user_id` references `users.id`.

## Frontend Schema Alignment

The current frontend mock data uses schema-aligned names:

- Blood requests use `bank_id`, `patient_name`, `blood_type`, `required_units`, `urgency_level`, `status`, and `request_date`.
- Blood banks use `id`, `name`, `city`, `address`, and `contact_number`.
- Inventory mock rows use `bank_id`, `blood_type`, `quantity_units`, and `expiration_date`.
- Appointment mock rows use `user_id`, `slot_id`, and `appointment_status`.

## Recommended API Shape

The backend API can use these route groups while keeping request and response bodies aligned with the SQL schema:

### Auth and Users

- `POST /api/auth/register/donor`
- `POST /api/auth/register/admin`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/me`
- `PATCH /api/me`

### Blood Banks and Donation Slots

- `GET /api/blood-banks/search`
- `GET /api/blood-banks/:id`
- `GET /api/donation-slots`
- `POST /api/donation-slots`
- `PATCH /api/donation-slots/:id`

### Appointments

- `POST /api/appointments`
- `GET /api/appointments/my`
- `GET /api/appointments/bank/:bankId`
- `PATCH /api/appointments/:id/status`

### Inventory and Requests

- `GET /api/inventory`
- `POST /api/inventory`
- `PATCH /api/inventory/:id`
- `GET /api/blood-requests`
- `POST /api/blood-requests`
- `POST /api/blood-disbursements`
- `GET /api/notifications`

## Development Stack

- Frontend: React + TypeScript + Vite
- Backend target: Node.js + Express + TypeScript
- Database: PostgreSQL
- ORM target: Prisma
- Auth target: JWT

## Frontend App

```bash
cd apps/web
npm install
npm run build
npm run dev
```

## Notes

Compiled files such as PDFs, LaTeX auxiliary files, and Vite `dist` output may need regeneration after source documentation or frontend changes.
