# Smart Blood Management System (SBMS), Gaza MVP

A centralized, responsive web platform built to bridge the critical gap between blood donors, hospitals, and blood banks in Gaza. By replacing manual paperwork and fragmented social media coordination, SBMS provides real-time tracking for blood inventory, organized appointment scheduling, and rapid deployment of urgent blood requests.

Developed as a final project for the **Advanced Software Engineering** course at the **Islamic University of Gaza (Faculty of Engineering)**.

---

## ♦️ Key Features & System Modules

### 🔴 1. Public Portal (Visitors)
* ▪️ **Quick Search:** Allows anyone to look up available blood banks or active urgent blood requests by city and blood type without needing an account.
* ▪️ **Contact & About Pages:** Clear introductory sections outlining the platform's core purpose and a direct form to message the team.

### 🔴 2. Donor Subsystem
* ▪️ **Profile Management:** Secure registration and onboarding where donors can set their city, blood type, and track eligibility status.
* ▪️ **Appointment Booking:** Seamless scheduling flow where donors view available time slots at specific facilities and book their donation.
* ▪️ **Notification Feed:** A dedicated dashboard space to receive confirmations and updates on booking statuses.

### 🔴 3. Facility Admin Portal
* ▪️ **Slot Coordinator:** Complete control over creating, editing, and managing specific time slots based on daily hospital capacity.
* ▪️ **Appointment Manager:** A live review panel to either accept, reject, or mark donor bookings as completed.
* ▪️ **Real-time Inventory:** A strict blood unit dashboard sorted by type ($A+, A-, B+, B-, AB+, AB-, O+, O-$) with manual expiration logs.
* ▪️ **Urgent Bulletins:** Direct creation tools to push immediate public requests for critical blood shortages.

---

## ♦️ Architecture & Tech Stack

The system is built on a standard **Three-Tier Architecture** to keep the interface, business logic, and database decoupled and highly maintainable:

* ▪️ **Presentation Layer:** Built using **React.js**, **TypeScript**, and **Vite** for a fast, responsive frontend environment that fits both desktop and mobile views. Tailwind CSS is used for UI styling.
* ▪️ **Application Layer:** Powering the backend with **Node.js** and **Express.js** written in **TypeScript**. Secured using **JWT (JSON Web Tokens)** for role-based access control.
* ▪️ **Data Layer:** Utilizes a relational **PostgreSQL** database managed cleanly through **Prisma ORM** for safe queries and migration control.

---

## ♦️ Scrum Team Roles & Responsibilities

To mimic a real-world software engineering environment, our team operated under a structured **Scrum Framework**, with each of the 10 members owning a vital part of the development lifecycle:

* 🔴 **Person 1 ( Scrum Master / Analyst ):** Facilitated Sprint planning, managed the Jira board, and translated the Gaza MVP clinical needs into technical user stories.
* 🔴 **Person 2 ( UI/UX Designer ):** Crafted the system's visual identity, wireframes, and responsive user journeys for both desktop and mobile users.
* 🔴 **Person 3 ( Frontend Public Pages ):** Developed the landing experience, facility search filters, and static information portals using React.js.
* 🔴 **Person 4 ( Frontend Donor Flow ):** Built the interactive donor dashboard, onboarding forms, and the step-by-step appointment booking interface.
* 🔴 **Person 5 ( Frontend Requests & Admin UI ):** Engineered the complex dashboard views for facility admins to manage slots, view inventory, and issue urgent blood alerts.
* 🔴 **Person 6 ( Backend Auth & Users ):** Implemented the Node.js authentication middleware, JWT token handling, and role-based route guarding.
* 🔴 **Person 7 ( Backend Blood Banks & Appointments ):** Developed the core business logic and API endpoints for managing facility timetables and booking status mutations.
* 🔴 **Person 8 ( Backend DB, Inventory & Requests ):** Designed the PostgreSQL schemas via Prisma, handled blood unit ledger logic, and coded the urgent bulletin dispatch system.
* 🔴 **Person 9 ( QA / Testing / Deployment ):** Created the Postman API testing suites, documented manual test matrices, and managed version control tagging and final build staging.
* 🔴 **Person 10 ( Project Owner / Technical Supervisor ):** Maintained the overall system architecture integrity, supervised integration milestones, and aligned the project deliverables with engineering standards.

---

## ♦️ Agile Development & Delivery Workflow

Our project was built incrementally across a structured **3-Sprint Plan** tracked via **Jira** workflows (Epics ➔ Stories ➔ Sub-tasks):

* ▪️ **Sprint 1 (Foundation):** Designed the data schema, created the unified API contract, and coded the static public layout structures.
* ▪️ **Sprint 2 (Core Development):** Built individual donor/admin screens, linked dynamic forms, and finalized core backend REST endpoints.
* ▪️ **Sprint 3 (Integration & QA):** Connected the frontend services to the backend API, handled token persistence, ran regression tests, and polished responsive UI breakdowns.

### ⚫ Quality Assurance (QA) & Integration Focus
Instead of rushing code to production, our workflow prioritized rigorous verification. The backend was fully mapped out and validated using **Postman API collections** alongside strict manual UI test matrices (`TC-AUTH`, `TC-BKG`, `TC-INV`) to ensure edge cases (such as unauthorized page routing) were cleanly caught, tracked via Jira, and mitigated before the final release.

---

## ♦️ Future Enhancements
* ▪️ Integrating automated SMS and Email alerts for critical requests.
* ▪️ Interactive Map-based search layouts for localized facility lookups.
* ▪️ Adding interactive dashboard analytics charts and automated PDF reports.
* ▪️ Full English and Arabic bilingual localization support.
