import { useCallback, useEffect, useRef, useState } from "react";
import type { InputHTMLAttributes, MouseEvent, ReactNode, ChangeEvent, DragEvent, FormEvent } from "react";
import { updateDonorProfile, updateFacilityProfile, uploadHealthReport, validateDonorProfile, validateFacilityProfile } from "./services/authService";
import type { DonorProfileData, FacilityProfileData, HealthReport } from "./services/authService";
import {
  createBloodRequest,
  createInventoryRecord,
  deleteBloodRequest,
  deleteInventoryRecord,
  fetchBloodRequests,
  fetchBloodRequestsByBank,
  fetchInventoryByBank,
  updateBloodRequest,
  updateBloodRequestStatus,
  updateInventoryRecord,
} from "./services/requestService";
import type { InventoryRecord } from "./services/requestService";
import type {
  BloodRequest as ApiBloodRequest,
  NewBloodRequest as ApiNewBloodRequest,
  RequestStatus as ApiRequestStatus,
  UrgencyLevel as ApiUrgencyLevel,
} from "./types/request";

type View =
  | "public"
  | "login"
  | "register"
  | "forgot"
  | "donor"
  | "donor-profile"
  | "donor-search"
  | "facility-details"
  | "book-appointment"
  | "donor-appointments"
  | "donor-requests"
  | "donor-notifications"
  | "admin"
  | "admin-profile"
  | "admin-slots"
  | "admin-appointments"
  | "admin-inventory"
  | "admin-requests"
  | "admin-notifications";

type BadgeTone = "urgent" | "pending" | "accepted" | "rejected" | "low" | "normal" | "completed" | "cancelled";
type IconName =
  | "heart"
  | "search"
  | "calendar"
  | "bell"
  | "pulse"
  | "grid"
  | "user"
  | "map"
  | "warning"
  | "drop"
  | "file"
  | "logout"
  | "plus"
  | "building"
  | "clock"
  | "box"
  | "chevron"
  | "upload"
  | "check"
  | "x"
  | "shield"
  | "edit";

type NavItem = {
  href: View;
  icon: IconName;
  label: string;
};

const bloodTypeOptions = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"] as const;
type BloodType = typeof bloodTypeOptions[number];

const ADMIN_BANK_ID = 1;
const requestUrgencyOptions: Array<{ value: ApiUrgencyLevel; label: string }> = [
  { value: "critical", label: "Critical (Immediate)" },
  { value: "urgent", label: "Urgent (Within 24h)" },
  { value: "normal", label: "Normal" },
  { value: "low", label: "Low" },
];

type RequestCardData = {
  id: number;
  patient: string;
  bloodType: BloodType;
  units: number;
  facility: string;
  city: string;
  status: BadgeTone;
  reqStatus?: ApiRequestStatus;
  requestedAt?: string;
  bankId?: number;
  urgencyLevel?: ApiUrgencyLevel;
};

type InventoryItem = {
  id: number;
  bankId: number;
  type: BloodType;
  units: number;
  expires: string;
  status: BadgeTone;
  lastUpdated?: string;
};

type FacilitySlot = {
  id: string;
  day: string;
  date: number;
  dateLabel: string;
  dateValue: string;
  time: string;
  seats: number;
  capacity: number;
  booked: number;
  status: BadgeTone;
};

type Facility = {
  id: number;
  name: string;
  city: string;
  type: "Hospital" | "Blood Bank";
  hours: string;
  slots: number;
  distance: string;
  address: string;
  phone: string;
  contact: string;
  blood: BloodType[];
  slotSchedule: FacilitySlot[];
};

const facilities: Facility[] = [
  {
    id: 1,
    name: "Al-Shifa Hospital",
    city: "Gaza City",
    type: "Hospital",
    hours: "8:00 AM - 8:00 PM",
    slots: 8,
    distance: "2.4 km",
    address: "Omar Al-Mukhtar Street, Gaza City",
    phone: "+970-8-2677700",
    contact: "Dr. Khaled Nasser",
    blood: ["A+", "O-", "B+"],
    slotSchedule: [
      { id: "shifa-1", day: "MON", date: 1, dateLabel: "Jun 1, 2026", dateValue: "2026-06-01", time: "09:00 AM", seats: 4, capacity: 8, booked: 4, status: "normal" as BadgeTone },
      { id: "shifa-2", day: "MON", date: 1, dateLabel: "Jun 1, 2026", dateValue: "2026-06-01", time: "11:00 AM", seats: 2, capacity: 8, booked: 6, status: "pending" as BadgeTone },
      { id: "shifa-3", day: "TUE", date: 2, dateLabel: "Jun 2, 2026", dateValue: "2026-06-02", time: "02:00 PM", seats: 2, capacity: 8, booked: 6, status: "pending" as BadgeTone },
    ],
  },
  {
    id: 2,
    name: "European Gaza Hospital",
    city: "Khan Younis",
    type: "Hospital",
    hours: "7:00 AM - 10:00 PM",
    slots: 11,
    distance: "14 km",
    address: "European Hospital Road, Khan Younis",
    phone: "+970-8-2051800",
    contact: "Nursing Donation Desk",
    blood: ["B-", "O-", "AB-"],
    slotSchedule: [
      { id: "european-1", day: "MON", date: 1, dateLabel: "Jun 1, 2026", dateValue: "2026-06-01", time: "10:00 AM", seats: 5, capacity: 10, booked: 5, status: "normal" as BadgeTone },
      { id: "european-2", day: "WED", date: 3, dateLabel: "Jun 3, 2026", dateValue: "2026-06-03", time: "01:00 PM", seats: 6, capacity: 10, booked: 4, status: "normal" as BadgeTone },
    ],
  },
  {
    id: 3,
    name: "Palestinian Blood Bank",
    city: "Gaza City",
    type: "Blood Bank",
    hours: "8:00 AM - 4:00 PM",
    slots: 5,
    distance: "3.1 km",
    address: "Al-Wehda Street, Gaza City",
    phone: "+970-8-2824012",
    contact: "Blood Bank Reception",
    blood: ["AB+", "O+", "A-"],
    slotSchedule: [
      { id: "pbb-1", day: "TUE", date: 2, dateLabel: "Jun 2, 2026", dateValue: "2026-06-02", time: "09:00 AM", seats: 3, capacity: 6, booked: 3, status: "normal" as BadgeTone },
      { id: "pbb-2", day: "THU", date: 4, dateLabel: "Jun 4, 2026", dateValue: "2026-06-04", time: "12:00 PM", seats: 2, capacity: 6, booked: 4, status: "pending" as BadgeTone },
    ],
  },
  {
    id: 4,
    name: "Nasser Medical Complex",
    city: "Khan Younis",
    type: "Hospital",
    hours: "24/7",
    slots: 12,
    distance: "16 km",
    address: "Jamal Abdul Nasser Street, Khan Younis",
    phone: "+970-8-2051234",
    contact: "Donation Coordination Unit",
    blood: ["A+", "B+", "O+"],
    slotSchedule: [
      { id: "nasser-1", day: "MON", date: 1, dateLabel: "Jun 1, 2026", dateValue: "2026-06-01", time: "08:30 AM", seats: 4, capacity: 8, booked: 4, status: "normal" as BadgeTone },
      { id: "nasser-2", day: "TUE", date: 2, dateLabel: "Jun 2, 2026", dateValue: "2026-06-02", time: "10:30 AM", seats: 5, capacity: 8, booked: 3, status: "normal" as BadgeTone },
      { id: "nasser-3", day: "WED", date: 3, dateLabel: "Jun 3, 2026", dateValue: "2026-06-03", time: "03:00 PM", seats: 3, capacity: 8, booked: 5, status: "pending" as BadgeTone },
    ],
  },
];

const urgentRequests: RequestCardData[] = [
  { id: 1, patient: "Mohammed A.", bloodType: "O-", units: 3, facility: "Al-Noor Hospital", city: "Gaza City", status: "urgent" as BadgeTone },
  { id: 2, patient: "Fatima K.", bloodType: "AB+", units: 2, facility: "Al-Noor Hospital", city: "Beit Lahia", status: "urgent" as BadgeTone },
  { id: 3, patient: "Ahmed S.", bloodType: "A+", units: 4, facility: "Al-Noor Hospital", city: "Khan Younis", status: "urgent" as BadgeTone },
  { id: 4, patient: "Sara H.", bloodType: "B+", units: 1, facility: "Al-Noor Hospital", city: "Gaza City", status: "urgent" as BadgeTone },
  { id: 5, patient: "Omar L.", bloodType: "O+", units: 2, facility: "Al-Noor Hospital", city: "Rafah", status: "urgent" as BadgeTone },
  { id: 6, patient: "Layla M.", bloodType: "A-", units: 3, facility: "Al-Noor Hospital", city: "Gaza City", status: "urgent" as BadgeTone },
];

const normalRequests: RequestCardData[] = [
  { id: 7, patient: "Yusuf T.", bloodType: "A+", units: 1, facility: "Al-Noor Hospital", city: "Gaza City", status: "normal" as BadgeTone },
  { id: 8, patient: "Mariam D.", bloodType: "B-", units: 2, facility: "Al-Noor Hospital", city: "Beit Lahia", status: "normal" as BadgeTone },
  { id: 9, patient: "Khalil N.", bloodType: "O+", units: 1, facility: "Al-Noor Hospital", city: "Khan Younis", status: "normal" as BadgeTone },
  { id: 10, patient: "Nour S.", bloodType: "AB-", units: 3, facility: "Al-Noor Hospital", city: "Gaza City", status: "normal" as BadgeTone },
  { id: 11, patient: "Ibrahim F.", bloodType: "A-", units: 2, facility: "Al-Noor Hospital", city: "Rafah", status: "normal" as BadgeTone },
  { id: 12, patient: "Huda R.", bloodType: "B+", units: 1, facility: "Al-Noor Hospital", city: "Gaza City", status: "normal" as BadgeTone },
  { id: 13, patient: "Ali W.", bloodType: "O-", units: 4, facility: "Al-Noor Hospital", city: "Beit Lahia", status: "normal" as BadgeTone },
  { id: 14, patient: "Rania J.", bloodType: "AB+", units: 2, facility: "Al-Noor Hospital", city: "Khan Younis", status: "normal" as BadgeTone },
  { id: 15, patient: "Sami Q.", bloodType: "A+", units: 1, facility: "Al-Noor Hospital", city: "Gaza City", status: "normal" as BadgeTone },
];

const appointments = [
  { id: 1, donor: "Ahmed Mohammed", facility: "Al-Shifa Hospital", bloodType: "A+", date: "2026-05-22", time: "10:00 AM", status: "accepted" as BadgeTone, phone: "+970-59-1234567", pastDonations: 5 },
  { id: 2, donor: "Sara Hassan", facility: "Indonesian Hospital", bloodType: "O-", date: "2026-05-22", time: "11:00 AM", status: "pending" as BadgeTone, phone: "+970-59-2345678", pastDonations: 2 },
  { id: 3, donor: "Omar Ali", facility: "European Hospital", bloodType: "B+", date: "2026-05-23", time: "09:00 AM", status: "pending" as BadgeTone, phone: "+970-59-3456789", pastDonations: 0 },
  { id: 5, donor: "Khaled Nasser", facility: "Al-Shifa Hospital", bloodType: "AB+", date: "2026-05-18", time: "02:00 PM", status: "completed" as BadgeTone, phone: "+970-59-4567890", pastDonations: 8 },
  { id: 6, donor: "Hana Youssef", facility: "Al-Shifa Hospital", bloodType: "A-", date: "2026-05-10", time: "10:00 AM", status: "completed" as BadgeTone, phone: "+970-59-5678901", pastDonations: 3 },
  { id: 7, donor: "Layla Mahmoud", facility: "Al-Shifa Hospital", bloodType: "O+", date: "2026-05-20", time: "11:30 AM", status: "cancelled" as BadgeTone, phone: "+970-59-6789012", pastDonations: 1 },
  { id: 8, donor: "Ibrahim Saleh", facility: "Al-Shifa Hospital", bloodType: "B-", date: "2026-05-19", time: "03:00 PM", status: "cancelled" as BadgeTone, phone: "+970-59-7890123", pastDonations: 4 },
];

const inventory: InventoryItem[] = [
  { id: 1, bankId: ADMIN_BANK_ID, type: "O-", units: 2, expires: "2026-06-10", status: "low" as BadgeTone },
  { id: 2, bankId: ADMIN_BANK_ID, type: "A+", units: 22, expires: "2026-06-15", status: "normal" as BadgeTone },
  { id: 3, bankId: ADMIN_BANK_ID, type: "B-", units: 3, expires: "2026-06-18", status: "low" as BadgeTone },
  { id: 4, bankId: ADMIN_BANK_ID, type: "AB+", units: 15, expires: "2026-06-20", status: "normal" as BadgeTone },
];

const adminLinks: NavItem[] = [
  { href: "admin", icon: "grid", label: "Overview" },
  { href: "admin-profile", icon: "map", label: "Facility Profile" },
  { href: "admin-slots", icon: "clock", label: "Donation Slots" },
  { href: "admin-appointments", icon: "calendar", label: "Appointments" },
  { href: "admin-inventory", icon: "drop", label: "Blood Inventory" },
  { href: "admin-requests", icon: "file", label: "Blood Requests" },
  { href: "admin-notifications", icon: "bell", label: "Notifications" },
];

const donorLinks: NavItem[] = [
  { href: "donor", icon: "grid", label: "Dashboard" },
  { href: "donor-profile", icon: "user", label: "My Profile" },
  { href: "donor-search", icon: "map", label: "Find Facilities" },
  { href: "donor-appointments", icon: "calendar", label: "My Appointments" },
  { href: "donor-requests", icon: "warning", label: "Urgent Requests" },
  { href: "donor-notifications", icon: "bell", label: "Notifications" },
];

function viewFromHash(hash: string): View {
  const key = hash.replace("#", "").split("?")[0];
  const normalizedKey = key === "notifications" || key === "notification" ? "donor-notifications" : key;
  if (
    [
      "login",
      "register",
      "forgot",
      "donor",
      "donor-profile",
      "donor-search",
      "facility-details",
      "book-appointment",
      "donor-appointments",
      "donor-requests",
      "donor-notifications",
      "admin",
      "admin-profile",
      "admin-slots",
      "admin-appointments",
      "admin-inventory",
      "admin-requests",
      "admin-notifications",
    ].includes(normalizedKey)
  ) {
    return normalizedKey as View;
  }
  return "public";
}

function getHashParams() {
  const query = window.location.hash.split("?")[1] ?? "";
  return new URLSearchParams(query);
}

function buildHash(view: View, params: Record<string, string | number | undefined> = {}) {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && String(value).trim() !== "") {
      searchParams.set(key, String(value));
    }
  });
  const query = searchParams.toString();
  return `#${view}${query ? `?${query}` : ""}`;
}

function isBloodType(value: string | null): value is BloodType {
  return bloodTypeOptions.includes(value as BloodType);
}

function getInventoryStatus(units: number): BadgeTone {
  if (units < 5) return "low";
  if (units < 12) return "pending";
  return "normal";
}

function getInventoryStatusLabel(units: number): string {
  if (units < 5) return "Low Stock";
  if (units < 12) return "Watch";
  return "Stable";
}

function getRequestTone(urgencyLevel: ApiUrgencyLevel): BadgeTone {
  return urgencyLevel === "critical" || urgencyLevel === "urgent" ? "urgent" : "normal";
}

function getRequestUrgencyLabel(urgencyLevel: ApiUrgencyLevel): string {
  if (urgencyLevel === "critical") return "Critical";
  if (urgencyLevel === "urgent") return "Urgent";
  if (urgencyLevel === "low") return "Low";
  return "Normal";
}

function mapBloodRequestToCard(request: ApiBloodRequest): RequestCardData {
  return {
    id: request.id,
    patient: request.patient_name?.trim() || `Case #${request.id}`,
    bloodType: request.blood_type,
    units: request.required_units,
    facility: request.blood_bank?.name ?? `Blood bank #${request.bank_id}`,
    city: request.blood_bank?.city ?? "Unknown city",
    status: getRequestTone(request.urgency_level),
    reqStatus: request.status,
    requestedAt: request.request_date,
    bankId: request.bank_id,
    urgencyLevel: request.urgency_level,
  };
}

function mapInventoryRecordToItem(record: InventoryRecord): InventoryItem {
  return {
    id: record.id,
    bankId: record.bank_id,
    type: record.blood_type as BloodType,
    units: record.quantity_units,
    expires: record.expiration_date,
    status: getInventoryStatus(record.quantity_units),
    lastUpdated: record.last_updated,
  };
}

function getSelectedFacility() {
  const params = getHashParams();
  const selectedId = Number(params.get("facilityId") ?? params.get("id"));
  return facilities.find((facility) => facility.id === selectedId) ?? facilities[0];
}

function App() {
  const [view, setView] = useState<View>(() => viewFromHash(window.location.hash));

  useEffect(() => {
    const sync = () => setView(viewFromHash(window.location.hash));
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);

  const shellType = view.startsWith("admin") ? "admin" : view.startsWith("donor") || view === "facility-details" || view === "book-appointment" ? "donor" : "public";

  return (
    <div className="app-shell">
      {shellType === "public" ? (
        <>
          {view === "login" || view === "register" || view === "forgot" ? null : <PublicNav />}
          <main>{renderPublicView(view)}</main>
        </>
      ) : shellType === "donor" ? (
        <DashboardShell title="Donor Portal" subtitle="Donation activity, appointments, and urgent requests" links={donorLinks} active={view}>
          {renderDonorView(view)}
        </DashboardShell>
      ) : (
        <DashboardShell title="Facility Admin" subtitle="Al-Shifa Hospital - Gaza City" links={adminLinks} active={view}>
          {renderAdminView(view)}
        </DashboardShell>
      )}
    </div>
  );
}

function renderPublicView(view: View) {
  if (view === "login") return <Login />;
  if (view === "register") return <Register />;
  if (view === "forgot") return <ForgotPassword />;
  return <PublicWebsite />;
}

function renderDonorView(view: View) {
  if (view === "donor-profile") return <DonorProfile />;
  if (view === "donor-search") return <SearchFacilities />;
  if (view === "facility-details") return <FacilityDetails />;
  if (view === "book-appointment") return <BookAppointment />;
  if (view === "donor-appointments") return <MyAppointments />;
  if (view === "donor-requests") return <DonorUrgentRequests />;
  if (view === "donor-notifications") return <NotificationsPage />;
  return <DonorDashboard />;
}

function renderAdminView(view: View) {
  if (view === "admin-profile") return <AdminProfile />;
  if (view === "admin-slots") return <ManageSlots />;
  if (view === "admin-appointments") return <ManageAppointments />;
  if (view === "admin-inventory") return <ManageInventory />;
  if (view === "admin-requests") return <ManageRequests />;
  if (view === "admin-notifications") return <NotificationsPage />;
  return <AdminDashboard />;
}

function redirectToLogin(event: MouseEvent<HTMLAnchorElement>) {
  event.preventDefault();
  window.location.hash = "login";
  window.dispatchEvent(new HashChangeEvent("hashchange"));
}

function PublicNav() {
  const [open, setOpen] = useState(false);
  return (
    <header className="site-nav">
      <BrandMark href="#top" label="BloodConnect Gaza" />
      <button className="mobile-menu-button" type="button" onClick={() => setOpen((value) => !value)}>
        {open ? "Close" : "Menu"}
      </button>
      <nav className={open ? "nav-links nav-links--open" : "nav-links"} aria-label="Main navigation">
        <a href="#top" onClick={(e) => { e.preventDefault(); setOpen(false); document.getElementById('top')?.scrollIntoView({ behavior: 'smooth' }); }}>Home</a>
        <a href="#requests" onClick={(e) => { e.preventDefault(); setOpen(false); document.getElementById('requests')?.scrollIntoView({ behavior: 'smooth' }); }}>Blood Requests</a>
        <a href="#login" onClick={(event) => { setOpen(false); redirectToLogin(event); }}>Find Centers</a>
        <a href="#about" onClick={(e) => { e.preventDefault(); setOpen(false); document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' }); }}>About Us</a>
        <a href="#contact" onClick={(e) => { e.preventDefault(); setOpen(false); document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' }); }}>Contact</a>
      </nav>
      <div className={open ? "nav-actions nav-actions--open" : "nav-actions"}>
        <a href="#login" onClick={() => setOpen(false)}>Log in</a>
        <a className="nav-register-button" href="#register" onClick={() => setOpen(false)}>Register</a>
      </div>
    </header>
  );
}

function PublicWebsite() {
  return (
    <>
      <section className="hero-section" id="top">
        <div className="hero-content">
          <StatusBadge tone="normal">Gaza Healthcare Initiative</StatusBadge>
          <h1>
            <span>Every Drop Counts.</span>
            <strong>Save Lives Today.</strong>
          </h1>
          <p>
            A precise, trustworthy medical platform connecting donors, hospitals, and blood banks in Gaza. Immediate response, coordinated distribution.
          </p>
          <div className="hero-actions">
            <a className="button button-primary" href="#register"><Icon name="heart" />Become a Donor</a>
            <a className="button button-light" href="#requests">View Urgent Requests</a>
          </div>
        </div>
        <div className="hero-visual" aria-hidden="true">
          <div className="hero-bg-drops">
            <svg className="hero-bg-drop drop-1" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>
            <svg className="hero-bg-drop drop-2" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>
            <svg className="hero-bg-drop drop-3" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>
            <svg className="hero-bg-drop drop-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>
          </div>
          <div className="hero-character-glow"></div>
          <img className="hero-character" src="/character-removebg-preview.png" alt="" />
        </div>
      </section>

      <section className="section about-section" id="about">
        <div className="about-layout">
          <div className="about-copy">
            <span>About Us</span>
            <h2>Built to make blood donation coordination faster and clearer</h2>
            <p>
              SBMS is a Gaza-focused platform that connects donors with verified hospitals and blood banks, helping teams manage urgent requests, appointments, and inventory from one place.
            </p>
            <div className="about-points">
              <div>
                <strong>For donors</strong>
                <p>Find nearby facilities, respond to urgent needs, and keep donation details ready.</p>
              </div>
              <div>
                <strong>For facilities</strong>
                <p>Organize blood requests, donation slots, and stock updates with less manual follow-up.</p>
              </div>
              <div>
                <strong>For patients</strong>
                <p>Reduce delays by matching the right blood type with the right facility faster.</p>
              </div>
            </div>
          </div>
          <div className="about-media">
            <img src="/about-main.png" alt="SBMS platform overview" />
          </div>
        </div>
      </section>

      <section className="section" id="how-it-works">
        <SectionIntro eyebrow="How It Works" title="A simple flow for donors and facilities" />
        <div className="steps-grid">
          <FeatureCard icon="heart" title="Register as Donor" text="Create a profile with your blood type, city, and contact information." />
          <FeatureCard icon="search" title="Find Facilities" text="Search hospitals and blood banks using city, blood type, and availability filters." />
          <FeatureCard icon="calendar" title="Book Appointment" text="Choose an available donation slot and send a booking request." />
          <FeatureCard icon="bell" title="Get Notified" text="Receive in-app alerts when urgent blood requests match your profile." />
        </div>
      </section>

      <section className="section section-muted">
        <SectionIntro eyebrow="Quick Search" title="Find a suitable donation place faster" />
        <form className="search-panel" onSubmit={(event) => event.preventDefault()}>
          <SelectField label="Blood Type" options={["Select Blood Type", "A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]} />
          <SelectField label="City" options={["Select City", "Gaza City", "Beit Lahia", "Khan Younis", "Rafah"]} />
          <SelectField label="Last Donation" options={["Any date", "3 months or more", "6 months or more"]} />
          <a className="button button-primary" href="#login" onClick={redirectToLogin}>Search</a>
        </form>
      </section>

      <section className="section requests-section" id="requests">
        <div className="requests-decor" aria-hidden="true">
          <img src="/character-removebg-preview.png" alt="" />
        </div>
        <div className="blood-drop-decor blood-drop-decor--red blood-drop-decor--1" aria-hidden="true"></div>
        <div className="blood-drop-decor blood-drop-decor--red blood-drop-decor--2" aria-hidden="true"></div>
        <div className="blood-drop-decor blood-drop-decor--teal blood-drop-decor--3" aria-hidden="true"></div>
        <div className="blood-drop-decor blood-drop-decor--teal blood-drop-decor--4" aria-hidden="true"></div>
        <span className="section-breadcrumb">Requests</span>
        <div className="section-header-row">
          <SectionIntro eyebrow="Urgent Requests" title="Be The Hero Someone Is Waiting For" />
          <a className="button button-primary" href="#register">Add New Request</a>
        </div>
        <div className="request-grid-legacy">
          {urgentRequests.map((request, index) => (
            <RequestCard key={request.id} request={request} index={index} />
          ))}
        </div>
        <div className="section-header-row" style={{ marginTop: '64px' }}>
          <SectionIntro eyebrow="" title="All Requests" />
        </div>
        <div className="request-grid-legacy">
          {normalRequests.map((request, index) => (
            <RequestCard key={request.id} request={request} index={index} />
          ))}
        </div>
      </section>

      <section className="cta-band">
        <div className="cta-grid" aria-hidden="true"></div>
        <div className="blood-drop-decor blood-drop-decor--white cta-drop-1" aria-hidden="true"></div>
        <div className="blood-drop-decor blood-drop-decor--white cta-drop-2" aria-hidden="true"></div>
        <div className="cta-content">
          <h2>Ready to save a life? join our community of heroes today.</h2>
          <div className="hero-actions">
            <a className="button button-light" href="#register">Request Blood Now</a>
          </div>
        </div>
      </section>

      <footer className="site-footer-new">
        <div className="footer-top">
          <div className="footer-info">
            <div className="footer-logo">
              <img src="/sbms-brand-logo.svg" alt="SBMS Logo" />
            </div>
            <h4>Smart Blood Management System</h4>
            <p>
              Smart Blood Bank is a digital platform dedicated to solving the blood shortage crisis. We connect voluntary donors with those in urgent need through a smart, fast, and secure management system.
            </p>
          </div>
          
          <div className="footer-contact-card" id="contact">
            <h4>Contact Us</h4>
            <form className="contact-form" onSubmit={(e) => e.preventDefault()}>
              <div className="contact-inputs">
                <input type="text" placeholder="Enter Name" />
                <input type="email" placeholder="Enter Email" />
              </div>
              <textarea placeholder="Enter your message"></textarea>
              <button type="submit" className="button button-primary">Send</button>
            </form>
          </div>
        </div>

        <div className="footer-links">
          <a href="#home">Home</a>
          <a href="#about">About Us</a>
          <a href="#donors">Find Donors</a>
          <a href="#requests">Urgent Requests</a>
          <a href="#terms">Terms & Conditions</a>
          <a href="#privacy">Privacy Policy</a>
        </div>

        <div className="footer-bottom">
          <p>Copyright © 2026 team #9</p>
        </div>
      </footer>
    </>
  );
}

function Login() {
  return (
    <AuthPage
      eyebrow="Welcome back"
      title="Login to SBMS"
      subtitle="Access donor pages or the facility admin dashboard."
      footer={<p>New to SBMS? <a href="#register">Create an account</a></p>}
    >
      <Input label="Email" placeholder="name@example.com" type="email" />
      <Input label="Password" placeholder="Enter password" type="password" />
      <div className="form-row-between">
        <label className="check-row"><input type="checkbox" /> Remember me</label>
        <a href="#forgot">Forgot password?</a>
      </div>
      <a className="button button-primary full-width" href="#donor">Login as Donor</a>
      <a className="button button-secondary full-width" href="#admin">Login as Admin</a>
    </AuthPage>
  );
}

function Register() {
  const [role, setRole] = useState<"donor" | "facility">("donor");

  return (
    <AuthPage
      eyebrow="Create account"
      title="Create an Account"
      subtitle="Join the network to help save lives"
      footer={<p>Already have an account? <a href="#login">Login</a></p>}
    >
      <div className="role-grid">
        <button className={role === "donor" ? "role-card active" : "role-card"} onClick={() => setRole("donor")} type="button">I am a Donor</button>
        <button className={role === "facility" ? "role-card active" : "role-card"} onClick={() => setRole("facility")} type="button">I represent a Facility</button>
      </div>
      {role === "donor" ? (
        <>
          <div className="form-two">
            <Input label="Full Name" placeholder="John Doe" />
            <Input label="Email" placeholder="john@example.com" type="email" />
          </div>
          <div className="form-two">
            <Input label="Password" placeholder="********" type="password" />
            <Input label="Confirm Password" placeholder="********" type="password" />
          </div>
          <div className="form-two">
            <Input label="Phone" placeholder="+970..." />
            <Input label="City" placeholder="Gaza City" />
          </div>
          <div className="form-two">
            <SelectField label="Blood Type" options={["Select type", "A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]} />
            <SelectField label="Gender (Optional)" options={["Select gender", "Male", "Female"]} />
          </div>
          <a className="button button-primary full-width" href="#donor">Create Donor Account</a>
        </>
      ) : (
        <>
          <div className="form-two">
            <Input label="Facility Name" placeholder="Al-Shifa Hospital" />
            <Input label="City" placeholder="Gaza City" />
          </div>
          <Input label="Full Address" placeholder="Street, Neighborhood" />
          <div className="form-two">
            <Input label="Admin Full Name" placeholder="Jane Doe" />
            <Input label="Admin Email" placeholder="admin@hospital.com" type="email" />
          </div>
          <div className="form-two">
            <Input label="Password" placeholder="********" type="password" />
            <Input label="Confirm Password" placeholder="********" type="password" />
          </div>
          <div className="form-two">
            <Input label="Contact Phone" placeholder="+970..." />
            <Input label="Contact Person (Optional)" placeholder="Jane Doe" />
          </div>
          <a className="button button-primary full-width" href="#admin">Register Facility</a>
        </>
      )}
    </AuthPage>
  );
}

function ForgotPassword() {
  return (
    <AuthPage
      eyebrow="Password recovery"
      title="Reset your password"
      subtitle="Enter your email and SBMS will show a reset confirmation state."
      footer={<p>Remembered it? <a href="#login">Back to login</a></p>}
    >
      <Input label="Email" placeholder="name@example.com" type="email" />
      <div className="success-panel">Demo state: reset instructions are ready to send.</div>
      <a className="button button-primary full-width" href="#login">Continue</a>
    </AuthPage>
  );
}

function AuthPage({ eyebrow, title, subtitle, children, footer }: { eyebrow: string; title: string; subtitle: string; children: ReactNode; footer: ReactNode }) {
  return (
    <section className="auth-screen">
      <BrandMark href="#top" label="BloodConnect Gaza" />
      <div className="auth-card">
        <h1>{title}</h1>
        <p>{subtitle}</p>
        <span className="auth-eyebrow">{eyebrow}</span>
        <form onSubmit={(event) => event.preventDefault()}>{children}</form>
        <div className="auth-footer">{footer}</div>
      </div>
    </section>
  );
}

function DashboardShell({ title, subtitle, links, active, children }: { title: string; subtitle: string; links: NavItem[]; active: View; children: ReactNode }) {
  const isAdmin = title.includes("Admin");
  const navActive = !isAdmin && (active === "facility-details" || active === "book-appointment") ? "donor-search" : active;
  const activeLabel = links.find((item) => item.href === navActive)?.label ?? (isAdmin ? "Overview" : "Dashboard");
  const donorChildTitle = active === "facility-details" ? "Facility Details" : active === "book-appointment" ? "Book Appointment" : activeLabel;
  const shellTitle = isAdmin ? (active === "admin" ? "Overview" : activeLabel) : donorChildTitle;
  const notificationHref = isAdmin ? "#admin-notifications" : "#donor-notifications";

  return (
    <div className="dashboard-shell">
      <aside className="dashboard-sidebar">
        <BrandMark href="#top" label="BloodConnect" compact />
        <nav aria-label={`${title} navigation`}>
          {links.map((item) => (
            <a className={navActive === item.href ? "active" : ""} href={`#${item.href}`} key={item.href}>
              <Icon name={item.icon} />
              <span>{item.label}</span>
            </a>
          ))}
        </nav>
        <a className="sidebar-exit" href="#top"><Icon name="logout" />Logout</a>
      </aside>
      <div className="dashboard-main">
        <header className="dashboard-topbar">
          <h1>{shellTitle}</h1>
          <div className="dashboard-user-area">
            <a className="topbar-notification-link" href={notificationHref} aria-label="Open notifications">
              <Icon name="bell" />
            </a>
            <span className="topbar-divider"></span>
            <div className="dashboard-user-copy">
              <strong>{isAdmin ? "Nourhan Muneer Elmassry" : "Nourhan Muneer Elmassry"}</strong>
              <span>{isAdmin ? "Facility Admin" : "Donor"}</span>
            </div>
            <span className="avatar">{isAdmin ? "N" : "N"}</span>
          </div>
        </header>
        <main className="dashboard-content" aria-label={subtitle}>{children}</main>
      </div>
    </div>
  );
}

function DonorDashboard() {
  const [apptCancelled, setApptCancelled] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  function handleCancelAppt() {
    setApptCancelled(true);
    setToast({ message: "Appointment cancelled successfully.", type: "success" });
  }

  return (
    <>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <PageTitle title="Welcome back, Nourhan" subtitle="Here is your donation summary and recent activity." />
      <StatGrid
        stats={[
          ["Total Donations", "3", "Last: 2 months ago", "teal", "heart"],
          ["Upcoming Appointments", apptCancelled ? "0" : "1", apptCancelled ? "No upcoming" : "May 28, 2026", "blue", "calendar"],
          ["Urgent Requests Match", "4", "Matching O+ blood type", "red", "warning"],
          ["Nearby Facilities", "6", "Within Gaza area", "teal", "map"],
        ]}
      />
      <div className="split-grid">
        <Panel title="Next Appointment" subtitle="Your upcoming blood donation appointment">
          {apptCancelled ? (
            <EmptyState icon="calendar" title="No upcoming appointments" actionHref="#donor-search" actionLabel="Book an Appointment" />
          ) : (
            <div className="appointment-mini">
              <div className="mini-content">
                <strong>Al-Shifa Hospital</strong>
                <span>May 28, 2026 at 10:00 AM</span>
              </div>
              <div className="appointment-actions">
                <BloodTypeBadge type="O+" />
                <StatusBadge tone="pending">Pending</StatusBadge>
                <button className="btn-icon btn-icon-danger" type="button" title="Cancel Appointment" onClick={handleCancelAppt}><Icon name="x" /></button>
              </div>
            </div>
          )}
        </Panel>
        <Panel title="Urgent Needs" subtitle="Facilities needing your blood type immediately">
          <RequestMini request={urgentRequests[0]} />
          <RequestMini request={urgentRequests[4]} />
        </Panel>
      </div>
      <Panel title="Donation Eligibility" subtitle="Your current donation status">
        <div className="eligibility-status">
          <div className="eligibility-badge eligibility-eligible">
            <Icon name="shield" />
            <div>
              <strong>Eligible to Donate</strong>
              <span>Your last donation was more than 3 months ago. You are cleared to donate.</span>
            </div>
          </div>
        </div>
      </Panel>
    </>
  );
}

function DonorProfile() {
  const [profile, setProfile] = useState<DonorProfileData>({
    full_name: "Nourhan Muneer Elmassry",
    email: "nourhan@example.com",
    phone: "+970-59-123-4567",
    blood_type: "O+",
    gender: "Female",
    birth_date: "1998-03-15",
    city: "Gaza City",
    is_eligible: true,
    notification_preference: "Both",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Health report state
  const [uploadingReport, setUploadingReport] = useState(false);
  const [healthReports, setHealthReports] = useState<HealthReport[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function updateField(field: keyof DonorProfileData, value: string | boolean) {
    setProfile((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  }

  async function handleSave() {
    const validationErrors = validateDonorProfile(profile);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      setToast({ message: "Please fix the errors below.", type: "error" });
      return;
    }
    setSaving(true);
    const result = await updateDonorProfile(profile);
    setSaving(false);
    if (result.success) {
      setToast({ message: result.message, type: "success" });
    } else {
      setErrors(result.errors ?? {});
      setToast({ message: result.message, type: "error" });
    }
  }

  async function handleFileUpload(file: File) {
    setUploadingReport(true);
    const result = await uploadHealthReport(file);
    setUploadingReport(false);
    if (result.success && result.report) {
      setHealthReports((prev) => [result.report!, ...prev]);
      setToast({ message: result.message, type: "success" });
    } else {
      setToast({ message: result.message, type: "error" });
    }
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileUpload(file);
  }

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFileUpload(file);
    e.target.value = "";
  }

  return (
    <>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <PageTitle title="My Profile" subtitle="Manage your personal information and preferences." />

      {/* Eligibility Status Banner */}
      <div className="eligibility-banner">
        <div className={`eligibility-badge ${profile.is_eligible ? 'eligibility-eligible' : 'eligibility-ineligible'}`}>
          <Icon name="shield" />
          <div>
            <strong>{profile.is_eligible ? 'Eligible to Donate' : 'Not Eligible to Donate'}</strong>
            <span>{profile.is_eligible ? 'You meet all requirements for blood donation.' : 'Please consult your doctor for eligibility.'}</span>
          </div>
        </div>
      </div>

      <div className="form-card">
        <div className="form-card-header">
          <h2>Personal Information</h2>
          <p>Keep your details up to date to receive relevant blood requests.</p>
        </div>
        <div className="form-two">
          <div className="field-group">
            <Input label="Full Name" value={profile.full_name} onChange={(e) => updateField('full_name', (e.target as HTMLInputElement).value)} />
            {errors.full_name && <span className="field-error">{errors.full_name}</span>}
          </div>
          <div className="field-group">
            <SelectField label="Blood Type" options={["Select type", "A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]} />
            {errors.blood_type && <span className="field-error">{errors.blood_type}</span>}
          </div>
        </div>
        <div className="form-two">
          <div className="field-group">
            <Input label="Phone Number" value={profile.phone} onChange={(e) => updateField('phone', (e.target as HTMLInputElement).value)} />
            {errors.phone && <span className="field-error">{errors.phone}</span>}
          </div>
          <div className="field-group">
            <Input label="City" value={profile.city} onChange={(e) => updateField('city', (e.target as HTMLInputElement).value)} />
            {errors.city && <span className="field-error">{errors.city}</span>}
          </div>
        </div>
        <div className="form-two">
          <div className="field-group">
            <SelectField label="Gender" options={["Select gender", "Male", "Female"]} />
            {errors.gender && <span className="field-error">{errors.gender}</span>}
          </div>
          <Input label="Date of Birth" value={profile.birth_date} type="date" onChange={(e) => updateField('birth_date', (e.target as HTMLInputElement).value)} />
        </div>
        <SelectField label="Notification Preference" options={["Select preference", "Email", "SMS", "Both"]} />
        <div className="profile-actions">
          <button className={`button button-primary ${saving ? 'button-loading' : ''}`} type="button" onClick={handleSave} disabled={saving}>
            <Icon name="edit" />{saving ? 'Updating...' : 'Update Profile'}
          </button>
        </div>
      </div>

      {/* Health Report Upload Section */}
      <div className="form-card" style={{ marginTop: '24px' }}>
        <div className="form-card-header">
          <h2>Health Clearance Report</h2>
          <p>Upload your disease-free health report to verify your eligibility for donation.</p>
        </div>

        <div
          className={`file-upload-zone ${dragOver ? 'file-upload-zone--active' : ''} ${uploadingReport ? 'file-upload-zone--uploading' : ''}`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />
          <div className="file-upload-icon">
            <Icon name="upload" />
          </div>
          {uploadingReport ? (
            <>
              <h3>Uploading...</h3>
              <div className="upload-progress">
                <div className="upload-progress-bar"></div>
              </div>
            </>
          ) : (
            <>
              <h3>Upload Health Report</h3>
              <p>Drag & drop your file here, or click to browse</p>
              <span className="file-upload-hint">Accepted: PDF, JPG, PNG (Max 5MB)</span>
            </>
          )}
        </div>

        {healthReports.length > 0 && (
          <div className="health-reports-list">
            <h3>Uploaded Reports</h3>
            {healthReports.map((report) => (
              <div className="health-report-card" key={report.id}>
                <div className="health-report-icon">
                  <Icon name="file" />
                </div>
                <div className="health-report-info">
                  <strong>{report.file_name}</strong>
                  <span>{(report.file_size / 1024).toFixed(1)} KB · {new Date(report.uploaded_at).toLocaleDateString()}</span>
                </div>
                <StatusBadge tone={report.status === 'approved' ? 'accepted' : report.status === 'rejected' ? 'rejected' : 'pending'}>
                  {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                </StatusBadge>
                <button
                  className="btn-icon btn-icon-danger"
                  type="button"
                  title="Delete Report"
                  onClick={() => {
                    setHealthReports((prev) => prev.filter((r) => r.id !== report.id));
                    setToast({ message: "Report deleted successfully.", type: "success" });
                  }}
                >
                  <Icon name="x" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

function SearchFacilities() {
  const params = getHashParams();
  const initialBlood = params.get("blood");
  const [cityQuery, setCityQuery] = useState(params.get("city") ?? "");
  const [bloodType, setBloodType] = useState<BloodType | "">(isBloodType(initialBlood) ? initialBlood : "");

  const normalizedCity = cityQuery.trim().toLowerCase();
  const filteredFacilities = facilities.filter((facility) => {
    const hasAppointments = facility.slots > 0 && facility.slotSchedule.some((slot) => slot.seats > 0);
    const matchesCity = normalizedCity.length === 0 || facility.city.toLowerCase().includes(normalizedCity);
    const matchesBlood = bloodType === "" || facility.blood.includes(bloodType);
    return hasAppointments && matchesCity && matchesBlood;
  });

  function handleSearch(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    window.location.hash = buildHash("donor-search", { city: cityQuery.trim(), blood: bloodType });
  }

  function clearFilters() {
    setCityQuery("");
    setBloodType("");
    window.location.hash = "#donor-search";
  }

  return (
    <>
      <PageTitle title="Find Facilities" subtitle="Search for hospitals and blood banks to book an appointment." />
      <form className="search-panel compact" onSubmit={handleSearch}>
        <div className="search-input-wrap">
          <svg className="search-input-icon" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7" /><path d="m16 16 5 5" /></svg>
          <input
            aria-label="Search by city"
            type="text"
            placeholder="Search by city..."
            value={cityQuery}
            onChange={(event) => setCityQuery((event.target as HTMLInputElement).value)}
          />
        </div>
        <label className="search-select-wrap">
          <select
            aria-label="Blood type filter"
            value={bloodType}
            onChange={(event) => setBloodType((event.target as HTMLSelectElement).value as BloodType | "")}
          >
            <option value="">Any Blood Type</option>
            {bloodTypeOptions.map((type) => <option value={type} key={type}>{type}</option>)}
          </select>
        </label>
        <button className="button button-primary search-bar-btn" type="submit"><Icon name="search" />Search</button>
      </form>
      <div className="facility-results-summary">
        <div>
          <strong>{filteredFacilities.length} facilities found</strong>
          <span>
            {bloodType
              ? `Showing centers with open ${bloodType} donation appointments.`
              : "Showing centers with open donation appointments."}
          </span>
        </div>
        {(cityQuery || bloodType) && (
          <button className="btn-action" type="button" onClick={clearFilters}>Clear filters</button>
        )}
      </div>
      {filteredFacilities.length === 0 ? (
        <EmptyState
          icon="search"
          title="No matching facilities"
          text="Try another city or blood type. Only facilities with open appointment slots are shown."
        />
      ) : (
        <div className="card-grid">
          {filteredFacilities.map((facility) => (
            <article className="facility-card" key={facility.id}>
              <div className="facility-card-head">
                <div className="facility-type-badge">
                  <Icon name="building" />
                  <span>{facility.type}</span>
                </div>
                <StatusBadge tone="normal">{facility.slots} Slots</StatusBadge>
              </div>
              <h3>{facility.name}</h3>
              <div className="facility-meta">
                <p><svg viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>{facility.city}</p>
                <p><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>{facility.hours}</p>
                <p><Icon name="map" />{facility.distance} away</p>
              </div>
              <div className="facility-blood-list" aria-label={`${facility.name} supported blood types`}>
                {facility.blood.map((type) => (
                  <span className={type === bloodType ? "blood-badge blood-badge-selected" : "blood-badge"} key={type}>{type}</span>
                ))}
              </div>
              <div className="facility-actions">
                <a className="button button-light full-width" href={buildHash("facility-details", { facilityId: facility.id, blood: bloodType, city: cityQuery.trim() })}>Details</a>
                <a className="button button-primary full-width" href={buildHash("book-appointment", { facilityId: facility.id, blood: bloodType })}>Book <Icon name="chevron" /></a>
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  );
}

function FacilityDetails() {
  const facility = getSelectedFacility();
  const params = getHashParams();
  const requestedBlood = params.get("blood");
  const activeBlood = isBloodType(requestedBlood) && facility.blood.includes(requestedBlood) ? requestedBlood : "";
  const detailSlots = facility.slotSchedule.filter((slot) => slot.seats > 0);

  return (
    <>
      <nav className="detail-breadcrumb" aria-label="Breadcrumb">
        <a href="#donor-search">Facilities</a>
        <span aria-hidden="true">&gt;</span>
        <span>{facility.name}</span>
      </nav>

      <div className="detail-info-card">
        <div className="detail-info-top">
          <div className="facility-type-badge">
            <Icon name="building" />
            <span>{facility.type}</span>
          </div>
          <StatusBadge tone="normal">Accepting Donors</StatusBadge>
        </div>
        <h2 className="detail-facility-name">{facility.name}</h2>

        <div className="detail-contact-grid">
          <div className="detail-contact-item">
            <div className="detail-contact-icon">
              <svg viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
            </div>
            <div>
              <strong>Address</strong>
              <p>{facility.address}</p>
              <p>{facility.city}</p>
            </div>
          </div>
          <div className="detail-contact-item">
            <div className="detail-contact-icon">
              <svg viewBox="0 0 24 24"><path d="M22 16.9v3a2 2 0 0 1-2.2 2A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.6a2 2 0 0 1-.4 2.1L8 9.7a16 16 0 0 0 6.3 6.3l1.3-1.3a2 2 0 0 1 2.1-.4c.8.3 1.7.5 2.6.7a2 2 0 0 1 1.7 2z" /></svg>
            </div>
            <div>
              <strong>Contact</strong>
              <p>{facility.phone}</p>
              <p>{facility.contact}</p>
            </div>
          </div>
        </div>

        <div className="detail-contact-item detail-hours-row">
          <div className="detail-contact-icon">
            <Icon name="clock" />
          </div>
          <div>
            <strong>Working Hours</strong>
            <p>{facility.hours}</p>
          </div>
        </div>

        <div className="detail-blood-needs">
          <p className="detail-blood-label"><span className="red-dot" aria-hidden="true"></span>Available Blood Types</p>
          <div className="detail-blood-badges">
            {facility.blood.map((type) => (
              <span className={type === activeBlood ? "blood-badge blood-badge-selected" : "blood-badge"} key={type}>{type}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="detail-slots-card">
        <div className="detail-slots-header">
          <Icon name="calendar" />
          <h2>Available Donation Slots</h2>
        </div>
        {detailSlots.length === 0 ? (
          <EmptyState icon="calendar" title="No open slots" text="This facility is not accepting bookings right now." />
        ) : (
          detailSlots.map((slot) => (
            <div className="detail-slot-row" key={slot.id}>
              <div className="detail-slot-date-box">
                <span className="detail-slot-day">{slot.day}</span>
                <span className="detail-slot-num">{slot.date}</span>
              </div>
              <div className="detail-slot-time">
                <strong>{slot.time}</strong>
                <span>{slot.dateLabel} - {slot.seats} seats available</span>
              </div>
              <a className="button button-primary small" href={buildHash("book-appointment", { facilityId: facility.id, date: slot.dateValue, time: slot.time, blood: activeBlood })}>Book</a>
            </div>
          ))
        )}
        <a className="button button-primary full-width detail-book-main" href={buildHash("book-appointment", { facilityId: facility.id, blood: activeBlood })}>Book Appointment</a>
      </div>
    </>
  );
}

function BookAppointment() {
  const facility = getSelectedFacility();
  const params = getHashParams();
  const initialBlood = params.get("blood");
  const [dateFilter, setDateFilter] = useState(params.get("date") ?? "");
  const [timeFilter, setTimeFilter] = useState(params.get("time") ?? "");
  const [bloodType, setBloodType] = useState<BloodType | "">(isBloodType(initialBlood) ? initialBlood : "");
  const [confirmedSlot, setConfirmedSlot] = useState<FacilitySlot | null>(null);

  const timeOptions = Array.from(new Set(facility.slotSchedule.map((slot) => slot.time)));
  const bloodTypeSupported = bloodType === "" || facility.blood.includes(bloodType);
  const visibleSlots = bloodTypeSupported
    ? facility.slotSchedule.filter((slot) => {
        const matchesDate = dateFilter === "" || slot.dateValue === dateFilter;
        const matchesTime = timeFilter === "" || slot.time === timeFilter;
        return slot.seats > 0 && matchesDate && matchesTime;
      })
    : [];

  function handleSearch(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    const formData = event?.currentTarget ? new FormData(event.currentTarget) : null;
    const nextDate = formData ? String(formData.get("appointmentDate") ?? "") : dateFilter;
    const nextTime = formData ? String(formData.get("appointmentTime") ?? "") : timeFilter;
    const nextBloodType = formData ? String(formData.get("appointmentBloodType") ?? "") : bloodType;
    setDateFilter(nextDate);
    setTimeFilter(nextTime);
    setBloodType(isBloodType(nextBloodType) ? nextBloodType : "");
    setConfirmedSlot(null);
    window.location.hash = buildHash("book-appointment", {
      facilityId: facility.id,
      date: nextDate,
      time: nextTime,
      blood: nextBloodType,
    });
  }

  return (
    <>
      <PageTitle title="Book Appointment" subtitle="Select a date and time to schedule your blood donation." />
      <form className="search-panel compact booking-filter" onSubmit={handleSearch}>
        <Input
          label="Date"
          name="appointmentDate"
          type="date"
          value={dateFilter}
          onChange={(event) => setDateFilter((event.target as HTMLInputElement).value)}
          onInput={(event) => setDateFilter((event.target as HTMLInputElement).value)}
        />
        <SelectField label="Time" name="appointmentTime" options={["Any time", ...timeOptions]} value={timeFilter} onChange={setTimeFilter} />
        <SelectField label="Blood Type" name="appointmentBloodType" options={["Select type", ...bloodTypeOptions]} value={bloodType} onChange={(value) => setBloodType(value === "" ? "" : value as BloodType)} />
        <button className="button button-primary search-bar-btn" type="submit"><Icon name="search" />Search</button>
      </form>
      <div className="booking-facility-info">
        <div className="booking-facility-badge">
          <Icon name="building" />
          <span>{facility.name}</span>
          <StatusBadge tone="normal">Verified</StatusBadge>
        </div>
        <p>{facility.address} - {facility.hours}</p>
        <div className="facility-blood-list booking-blood-list">
          {facility.blood.map((type) => (
            <span className={type === bloodType ? "blood-badge blood-badge-selected" : "blood-badge"} key={type}>{type}</span>
          ))}
        </div>
      </div>
      {!bloodTypeSupported && (
        <EmptyState
          icon="drop"
          title={`${facility.name} has no ${bloodType} appointments`}
          text="Choose another blood type or return to the facilities search."
          actionHref="#donor-search"
          actionLabel="Find another facility"
        />
      )}
      {bloodTypeSupported && visibleSlots.length === 0 && (
        <EmptyState
          icon="calendar"
          title="No slots match these filters"
          text="Try a different date or time for this facility."
        />
      )}
      {bloodTypeSupported && visibleSlots.length > 0 && (
        <div className="booking-slots-grid">
          {visibleSlots.map((slot) => (
            <article className="booking-slot-card" key={`${slot.dateValue}-${slot.time}`}>
              <div className="booking-slot-top">
                <div className="booking-slot-date">
                  <Icon name="calendar" />
                  <strong>{slot.dateLabel}</strong>
                </div>
                <StatusBadge tone={slot.status}>Available</StatusBadge>
              </div>
              <div className="booking-slot-meta">
                <p><Icon name="clock" />{slot.time}</p>
                <p><Icon name="user" />Capacity: {slot.booked} / {slot.capacity}</p>
                <p><Icon name="drop" />{bloodType || facility.blood.join(", ")}</p>
              </div>
              <button
                className="button button-primary full-width"
                type="button"
                onClick={() => setConfirmedSlot(slot)}
                disabled={confirmedSlot?.id === slot.id}
              >
                {confirmedSlot?.id === slot.id ? <><Icon name="check" />Booked</> : "Confirm Booking"}
              </button>
            </article>
          ))}
        </div>
      )}
      {confirmedSlot && (
        <div className="booking-confirmation">
          <div className="icon-circle"><Icon name="check" /></div>
          <div>
            <strong>Booking request sent</strong>
            <p>{facility.name} received your request for {confirmedSlot.dateLabel} at {confirmedSlot.time}. The facility will confirm it from the appointments dashboard.</p>
          </div>
          <a className="button button-light" href="#donor-appointments">View My Appointments</a>
        </div>
      )}
    </>
  );
}

function MyAppointments() {
  const [myAppts, setMyAppts] = useState([
    { id: 101, facility: "Al-Shifa Hospital", bloodType: "O+", date: "2026-05-28", time: "10:00 AM", status: "pending" as BadgeTone },
    { id: 102, facility: "Nasser Medical Complex", bloodType: "O+", date: "2026-06-02", time: "09:00 AM", status: "pending" as BadgeTone },
    { id: 103, facility: "European Gaza Hospital", bloodType: "O+", date: "2026-05-20", time: "11:00 AM", status: "accepted" as BadgeTone },
    { id: 104, facility: "Palestinian Blood Bank", bloodType: "O+", date: "2026-05-10", time: "02:00 PM", status: "accepted" as BadgeTone },
    { id: 105, facility: "European Gaza Hospital", bloodType: "O+", date: "2026-04-15", time: "11:00 AM", status: "completed" as BadgeTone },
    { id: 106, facility: "Palestinian Blood Bank", bloodType: "O+", date: "2026-03-20", time: "09:00 AM", status: "completed" as BadgeTone },
    { id: 107, facility: "Al-Shifa Hospital", bloodType: "O+", date: "2026-04-05", time: "10:00 AM", status: "cancelled" as BadgeTone },
    { id: 108, facility: "Nasser Medical Complex", bloodType: "O+", date: "2026-03-25", time: "01:00 PM", status: "cancelled" as BadgeTone },
  ]);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [filter, setFilter] = useState("all");
  const [viewItem, setViewItem] = useState<typeof myAppts[number] | null>(null);

  function cancelAppt(id: number) {
    setMyAppts((prev) => prev.map((a) => a.id === id ? { ...a, status: "cancelled" as BadgeTone } : a));
    setViewItem(null);
    setToast({ message: "Appointment cancelled.", type: "success" });
  }

  function deleteAppt(id: number) {
    setMyAppts((prev) => prev.filter((a) => a.id !== id));
    setViewItem(null);
    setToast({ message: "Appointment removed.", type: "success" });
  }

  const filtered = filter === "all" ? myAppts : myAppts.filter((a) => a.status === filter);

  return (
    <>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <div className="page-title-row">
        <PageTitle title="My Appointments" subtitle="Manage your past and upcoming donation appointments." />
        <label className="appointments-filter">
          <select value={filter} onChange={(e) => setFilter((e.target as HTMLSelectElement).value)}>
            <option value="all">All Appointments</option>
            <option value="pending">Pending</option>
            <option value="accepted">Accepted</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </label>
      </div>
      {filtered.length === 0 ? (
        <EmptyState icon="calendar" title="No appointments found" text={`No ${filter} appointments to display.`} />
      ) : (
        <DataTable
          columns={["Facility", "Blood Type", "Date", "Time", "Status", "Actions"]}
          rows={filtered.map((a) => [
            a.facility,
            <BloodTypeBadge type={a.bloodType} key={`bt-${a.id}`} />,
            a.date,
            a.time,
            <StatusBadge tone={a.status} key={`st-${a.id}`}>{a.status}</StatusBadge>,
            <div className="table-actions" key={`ac-${a.id}`}>
              <button type="button" className="btn-action" onClick={() => setViewItem(a)}>View</button>
              {(a.status === "pending" || a.status === "accepted") && (
                <button type="button" className="btn-action btn-action-danger" onClick={() => cancelAppt(a.id)}>Cancel</button>
              )}
              {(a.status === "completed" || a.status === "cancelled") && (
                <button type="button" className="btn-action btn-action-danger" onClick={() => deleteAppt(a.id)}>Delete</button>
              )}
            </div>,
          ])}
        />
      )}

      {viewItem && (
        <div className="modal-overlay" onClick={() => setViewItem(null)}>
          <div className="modal-card review-modal" onClick={(e: MouseEvent) => e.stopPropagation()}>
            <div className="modal-header">
              <Icon name="calendar" />
              <h3>Appointment Details</h3>
              <button className="modal-close" type="button" onClick={() => setViewItem(null)}>&times;</button>
            </div>

            <div className="review-donor-header">
              <div className="review-avatar">{viewItem.facility.split(' ').map(n => n[0]).join('').slice(0, 2)}</div>
              <div>
                <h4>{viewItem.facility}</h4>
                <StatusBadge tone={viewItem.status}>{viewItem.status}</StatusBadge>
              </div>
            </div>

            <div className="review-details-grid">
              <div className="review-detail-item">
                <Icon name="drop" />
                <div>
                  <span className="review-detail-label">Blood Type</span>
                  <strong><BloodTypeBadge type={viewItem.bloodType} /></strong>
                </div>
              </div>
              <div className="review-detail-item">
                <Icon name="calendar" />
                <div>
                  <span className="review-detail-label">Date & Time</span>
                  <strong>{viewItem.date} at {viewItem.time}</strong>
                </div>
              </div>
            </div>

            {viewItem.status === "pending" && (
              <>
                <div className="review-status-note">
                  <Icon name="warning" />
                  <span>Your appointment is <strong>awaiting confirmation</strong> from the facility.</span>
                </div>
                <div className="review-actions">
                  <button type="button" className="button button-danger" onClick={() => cancelAppt(viewItem.id)}>
                    <Icon name="x" /> Cancel Appointment
                  </button>
                </div>
              </>
            )}

            {viewItem.status === "accepted" && (
              <>
                <div className="review-status-note" style={{ borderColor: 'rgba(15,119,131,0.2)', background: 'rgba(15,119,131,0.04)' }}>
                  <Icon name="shield" />
                  <span>Your appointment has been <strong>confirmed</strong>. Please arrive on time.</span>
                </div>
                <div className="review-actions">
                  <button type="button" className="button button-danger" onClick={() => cancelAppt(viewItem.id)}>
                    <Icon name="x" /> Cancel Appointment
                  </button>
                </div>
              </>
            )}

            {viewItem.status === "completed" && (
              <>
                <div className="review-status-note" style={{ borderColor: 'rgba(15,119,131,0.2)', background: 'rgba(15,119,131,0.04)' }}>
                  <Icon name="heart" />
                  <span>Thank you for your donation! Your contribution saves lives. 🎉</span>
                </div>
                <div className="review-actions">
                  <a href="#donor-search" className="button button-primary" style={{ textDecoration: 'none', textAlign: 'center' }} onClick={() => setViewItem(null)}>
                    <Icon name="calendar" /> Book Another Appointment
                  </a>
                  <button type="button" className="button button-danger" onClick={() => deleteAppt(viewItem.id)}>
                    <Icon name="x" /> Remove
                  </button>
                </div>
              </>
            )}

            {viewItem.status === "cancelled" && (
              <>
                <div className="review-status-note" style={{ borderColor: 'rgba(239,68,68,0.15)', background: 'rgba(239,68,68,0.04)' }}>
                  <Icon name="x" />
                  <span>This appointment was <strong>cancelled</strong>.</span>
                </div>
                <div className="review-actions">
                  <a href="#donor-search" className="button button-primary" style={{ textDecoration: 'none', textAlign: 'center' }} onClick={() => setViewItem(null)}>
                    <Icon name="calendar" /> Rebook Appointment
                  </a>
                  <button type="button" className="button button-danger" onClick={() => deleteAppt(viewItem.id)}>
                    <Icon name="x" /> Remove
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}

function DonorUrgentRequests() {
  const [requests, setRequests] = useState<RequestCardData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const loadRequests = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const loadedRequests = await fetchBloodRequests();
      setRequests(
        loadedRequests
          .filter((request) => request.status === "pending" && (request.urgency_level === "critical" || request.urgency_level === "urgent"))
          .map(mapBloodRequestToCard),
      );
    } catch {
      setError("Unable to load urgent requests right now.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadRequests();
  }, [loadRequests]);

  return (
    <>
      <PageTitle title="Urgent Requests" subtitle="Critical blood shortages that match your blood type." />
      {isLoading ? <InlineFeedback icon="warning" text="Loading urgent requests..." /> : null}
      {error ? (
        <InlineFeedback icon="warning" text={error} actionLabel="Retry" onAction={loadRequests} tone="error" />
      ) : null}
      {!isLoading && !error && requests.length === 0 ? (
        <EmptyState icon="warning" title="No urgent requests" text="Critical requests will appear here when hospitals publish them." />
      ) : null}
      {!isLoading && !error && requests.length > 0 ? (
        <div className="request-grid-legacy dashboard-requests">
          {requests.map((request, index) => (
            <RequestCard key={request.id} request={request} index={index} actionHref={buildHash("donor-search", { blood: request.bloodType })} />
          ))}
        </div>
      ) : null}
    </>
  );
}

function AdminDashboard() {
  const [dashAppts, setDashAppts] = useState([...appointments]);
  const [reviewItem, setReviewItem] = useState<typeof appointments[number] | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  function handleAccept(id: number) {
    const appt = dashAppts.find((a) => a.id === id);
    setDashAppts((prev) => prev.map((a) => a.id === id ? { ...a, status: "accepted" as BadgeTone } : a));
    setReviewItem(null);
    setToast({ message: `Appointment for ${appt?.donor} accepted.`, type: "success" });
  }

  function handleReject(id: number) {
    const appt = dashAppts.find((a) => a.id === id);
    setDashAppts((prev) => prev.map((a) => a.id === id ? { ...a, status: "cancelled" as BadgeTone } : a));
    setReviewItem(null);
    setToast({ message: `Appointment for ${appt?.donor} rejected.`, type: "success" });
  }

  const pendingCount = dashAppts.filter((a) => a.status === "pending").length;
  const acceptedCount = dashAppts.filter((a) => a.status === "accepted").length;

  return (
    <>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <PageTitle title="Facility Overview" subtitle="Monitor inventory, appointments, and blood requests." />
      <StatGrid
        stats={[
          ["Pending Apps.", String(pendingCount), "Awaiting review", "yellow", "calendar"],
          ["Accepted Apps.", String(acceptedCount), "Confirmed today", "green", "calendar"],
          ["Available Slots", "3", "This week", "teal", "user"],
          ["Total Units", "53", "Across all types", "blue", "grid"],
          ["Urgent Requests", "6", "4 critical", "red", "warning"],
          ["Low Stock Types", "2", "O- and B-", "yellow", "drop"],
        ]}
      />
      <div className="split-grid">
        <Panel title="Recent Appointments" action="#admin-appointments">
          {dashAppts.slice(0, 4).map((item) => (
            <AppointmentMini key={item.id} item={item} admin onReview={() => setReviewItem(item)} />
          ))}
        </Panel>
        <Panel title="Low Stock Alerts">
          {inventory.filter((i) => i.status === "low").map((item) => (
            <div className="inventory-alert" key={item.type}>
              <div>
                <strong>{item.type}</strong>
                <span>Only {item.units} units · Expires {item.expires}</span>
              </div>
              <StatusBadge tone="low">Low Stock</StatusBadge>
            </div>
          ))}
        </Panel>
      </div>

      {reviewItem && (
        <div className="modal-overlay" onClick={() => setReviewItem(null)}>
          <div className="modal-card review-modal" onClick={(e: MouseEvent) => e.stopPropagation()}>
            <div className="modal-header">
              <Icon name="calendar" />
              <h3>Review Appointment</h3>
              <button className="modal-close" type="button" onClick={() => setReviewItem(null)}>&times;</button>
            </div>

            <div className="review-donor-header">
              <div className="review-avatar">{reviewItem.donor.split(' ').map(n => n[0]).join('')}</div>
              <div>
                <h4>{reviewItem.donor}</h4>
                <StatusBadge tone={reviewItem.status}>{reviewItem.status}</StatusBadge>
              </div>
            </div>

            <div className="review-details-grid">
              <div className="review-detail-item">
                <Icon name="drop" />
                <div>
                  <span className="review-detail-label">Blood Type</span>
                  <strong><BloodTypeBadge type={reviewItem.bloodType} /></strong>
                </div>
              </div>
              <div className="review-detail-item">
                <Icon name="calendar" />
                <div>
                  <span className="review-detail-label">Date & Time</span>
                  <strong>{reviewItem.date} at {reviewItem.time}</strong>
                </div>
              </div>
              <div className="review-detail-item">
                <Icon name="map" />
                <div>
                  <span className="review-detail-label">Phone</span>
                  <strong>{reviewItem.phone}</strong>
                </div>
              </div>
              <div className="review-detail-item">
                <Icon name="heart" />
                <div>
                  <span className="review-detail-label">Past Donations</span>
                  <strong>{reviewItem.pastDonations} donation{reviewItem.pastDonations !== 1 ? 's' : ''}</strong>
                </div>
              </div>
            </div>

            {reviewItem.status === "pending" && (
              <div className="review-actions">
                <button type="button" className="button button-primary" onClick={() => handleAccept(reviewItem.id)}>
                  <Icon name="shield" /> Accept Appointment
                </button>
                <button type="button" className="button button-danger" onClick={() => handleReject(reviewItem.id)}>
                  <Icon name="x" /> Reject Appointment
                </button>
              </div>
            )}

            {reviewItem.status !== "pending" && (
              <div className="review-status-note">
                <Icon name={reviewItem.status === "accepted" ? "shield" : reviewItem.status === "completed" ? "heart" : "x"} />
                <span>This appointment has been <strong>{reviewItem.status}</strong>.</span>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

function AdminProfile() {
  const [profile, setProfile] = useState<FacilityProfileData>({
    facility_name: "Al-Shifa Hospital",
    facility_type: "Hospital",
    city: "Gaza City",
    phone: "+970-8-2677700",
    address: "Omar Al-Mukhtar Street, Gaza City",
    contact_person: "Dr. Khaled Nasser",
    working_hours: "8:00 AM - 8:00 PM",
    operational_status: "Active (Accepting Donors)",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  function updateField(field: keyof FacilityProfileData, value: string) {
    setProfile((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  }

  async function handleSave() {
    const validationErrors = validateFacilityProfile(profile);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      setToast({ message: "Please fix the errors below.", type: "error" });
      return;
    }
    setSaving(true);
    const result = await updateFacilityProfile(profile);
    setSaving(false);
    if (result.success) {
      setToast({ message: result.message, type: "success" });
    } else {
      setErrors(result.errors ?? {});
      setToast({ message: result.message, type: "error" });
    }
  }

  return (
    <>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <PageTitle title="Facility Profile" subtitle="Manage your facility's public information." />
      <div className="form-card">
        <div className="form-card-header">
          <h2>Facility Details</h2>
          <p>This information is visible to donors searching for locations.</p>
        </div>
        <div className="form-two">
          <div className="field-group">
            <Input label="Facility Name" value={profile.facility_name} onChange={(e) => updateField('facility_name', (e.target as HTMLInputElement).value)} />
            {errors.facility_name && <span className="field-error">{errors.facility_name}</span>}
          </div>
          <SelectField label="Facility Type" options={["Hospital", "Blood Bank", "Clinic"]} />
        </div>
        <div className="form-two">
          <div className="field-group">
            <Input label="City" value={profile.city} onChange={(e) => updateField('city', (e.target as HTMLInputElement).value)} />
            {errors.city && <span className="field-error">{errors.city}</span>}
          </div>
          <div className="field-group">
            <Input label="Public Phone" value={profile.phone} onChange={(e) => updateField('phone', (e.target as HTMLInputElement).value)} />
            {errors.phone && <span className="field-error">{errors.phone}</span>}
          </div>
        </div>
        <div className="field-group">
          <Input label="Full Address" value={profile.address} onChange={(e) => updateField('address', (e.target as HTMLInputElement).value)} />
          {errors.address && <span className="field-error">{errors.address}</span>}
        </div>
        <div className="form-two">
          <Input label="Contact Person (Internal)" value={profile.contact_person} onChange={(e) => updateField('contact_person', (e.target as HTMLInputElement).value)} />
          <div className="field-group">
            <Input label="Working Hours" value={profile.working_hours} onChange={(e) => updateField('working_hours', (e.target as HTMLInputElement).value)} placeholder="e.g. Mon-Fri 8AM-4PM" />
            {errors.working_hours && <span className="field-error">{errors.working_hours}</span>}
          </div>
        </div>
        <SelectField label="Operational Status" options={["Active (Accepting Donors)", "Inactive", "Maintenance"]} />
        <p className="form-hint">Inactive facilities will not appear in donor searches.</p>
        <div className="profile-actions">
          <button className={`button button-primary ${saving ? 'button-loading' : ''}`} type="button" onClick={handleSave} disabled={saving}>
            <Icon name="edit" />{saving ? 'Updating...' : 'Update Facility Profile'}
          </button>
        </div>
      </div>
    </>
  );
}

function ManageSlots() {
  const [showModal, setShowModal] = useState(false);
  const [slotList, setSlotList] = useState([
    { id: 1, date: "2026-06-01", startTime: "09:00 AM", endTime: "12:00 PM", capacity: 8, booked: 3 },
    { id: 2, date: "2026-06-01", startTime: "01:00 PM", endTime: "04:00 PM", capacity: 8, booked: 8 },
    { id: 3, date: "2026-06-02", startTime: "09:00 AM", endTime: "12:00 PM", capacity: 6, booked: 1 },
    { id: 4, date: "2026-06-03", startTime: "10:00 AM", endTime: "02:00 PM", capacity: 10, booked: 0 },
  ]);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [editSlot, setEditSlot] = useState<typeof slotList[number] | null>(null);
  const [editDate, setEditDate] = useState("");
  const [editStart, setEditStart] = useState("");
  const [editEnd, setEditEnd] = useState("");
  const [editCapacity, setEditCapacity] = useState("");

  function deleteSlot(id: number) {
    setSlotList((prev) => prev.filter((s) => s.id !== id));
    setToast({ message: "Slot deleted successfully.", type: "success" });
  }

  function addSlot() {
    const newId = Date.now();
    setSlotList((prev) => [...prev, { id: newId, date: "2026-06-05", startTime: "09:00 AM", endTime: "12:00 PM", capacity: 8, booked: 0 }]);
    setShowModal(false);
    setToast({ message: "New slot created successfully!", type: "success" });
  }

  function openEditSlot(slot: typeof slotList[number]) {
    setEditSlot(slot);
    setEditDate(slot.date);
    setEditStart(slot.startTime);
    setEditEnd(slot.endTime);
    setEditCapacity(String(slot.capacity));
  }

  function saveSlotEdit() {
    if (!editSlot) return;
    const capacity = Number.parseInt(editCapacity, 10);
    if (!editDate || !editStart.trim() || !editEnd.trim() || Number.isNaN(capacity) || capacity < editSlot.booked) {
      setToast({ message: "Please enter valid slot details. Capacity cannot be less than booked appointments.", type: "error" });
      return;
    }
    setSlotList((prev) => prev.map((slot) => (
      slot.id === editSlot.id
        ? { ...slot, date: editDate, startTime: editStart.trim(), endTime: editEnd.trim(), capacity }
        : slot
    )));
    setEditSlot(null);
    setToast({ message: "Slot updated successfully.", type: "success" });
  }

  return (
    <>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <div className="page-title-row">
        <PageTitle title="Donation Slots" subtitle="Manage your facility's available appointment times." />
        <button className="button button-primary" type="button" onClick={() => setShowModal(true)}><Icon name="plus" />Create Slot</button>
      </div>
      <DataTable
        columns={["Date", "Start Time", "End Time", "Capacity", "Booked", "Status", "Actions"]}
        rows={slotList.map((s) => [
          s.date,
          s.startTime,
          s.endTime,
          <strong key={`c-${s.id}`}>{s.capacity}</strong>,
          <span key={`b-${s.id}`}>{s.booked} / {s.capacity}</span>,
          <StatusBadge tone={s.booked >= s.capacity ? 'urgent' : s.booked > s.capacity / 2 ? 'pending' : 'accepted'} key={`st-${s.id}`}>
            {s.booked >= s.capacity ? 'Full' : s.booked > s.capacity / 2 ? 'Filling Up' : 'Available'}
          </StatusBadge>,
          <div className="table-actions" key={`ac-${s.id}`}>
            <button type="button" className="btn-action" onClick={() => openEditSlot(s)}>Edit</button>
            <button type="button" className="btn-action btn-action-danger" onClick={() => deleteSlot(s.id)}>Delete</button>
          </div>,
        ])}
      />
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-card" onClick={(e: MouseEvent) => e.stopPropagation()}>
            <div className="modal-header">
              <Icon name="calendar" />
              <h3>Create New Donation Slot</h3>
              <button className="modal-close" type="button" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <Input label="Date" type="date" />
            <div className="form-two">
              <Input label="Start Time" type="time" />
              <Input label="End Time" type="time" />
            </div>
            <Input label="Max Capacity" placeholder="8" type="number" />
            <button className="button button-primary full-width" type="button" onClick={addSlot}>Save Slot</button>
          </div>
        </div>
      )}
      {editSlot && (
        <div className="modal-overlay" onClick={() => setEditSlot(null)}>
          <div className="modal-card" onClick={(e: MouseEvent) => e.stopPropagation()}>
            <div className="modal-header">
              <Icon name="edit" />
              <h3>Edit Donation Slot</h3>
              <button className="modal-close" type="button" onClick={() => setEditSlot(null)}>&times;</button>
            </div>
            <Input label="Date" type="date" value={editDate} onChange={(event) => setEditDate((event.target as HTMLInputElement).value)} />
            <div className="form-two">
              <Input label="Start Time" value={editStart} onChange={(event) => setEditStart((event.target as HTMLInputElement).value)} />
              <Input label="End Time" value={editEnd} onChange={(event) => setEditEnd((event.target as HTMLInputElement).value)} />
            </div>
            <Input label="Max Capacity" type="number" min={editSlot.booked} value={editCapacity} onChange={(event) => setEditCapacity((event.target as HTMLInputElement).value)} />
            <button className="button button-primary full-width" type="button" onClick={saveSlotEdit}>Save Changes</button>
          </div>
        </div>
      )}
    </>
  );
}

function ManageAppointments() {
  const [apptList, setApptList] = useState([
    ...appointments,
    { id: 4, donor: "Nourhan Elmassry", facility: "Al-Shifa Hospital", bloodType: "O+", date: "2026-05-28", time: "10:00 AM", status: "pending" as BadgeTone },
  ]);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [filter, setFilter] = useState("all");

  function updateStatus(id: number, newStatus: BadgeTone, msg: string) {
    setApptList((prev) => prev.map((a) => a.id === id ? { ...a, status: newStatus } : a));
    setToast({ message: msg, type: "success" });
  }

  function deleteAppt(id: number) {
    setApptList((prev) => prev.filter((a) => a.id !== id));
    setToast({ message: "Appointment deleted.", type: "success" });
  }

  const filtered = filter === "all" ? apptList : apptList.filter((a) => a.status === filter);

  return (
    <>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <div className="page-title-row">
        <PageTitle title="Appointments" subtitle="Manage incoming donor appointments." />
        <label className="appointments-filter">
          <select value={filter} onChange={(e) => setFilter((e.target as HTMLSelectElement).value)}>
            <option value="all">All Appointments</option>
            <option value="pending">Pending</option>
            <option value="accepted">Accepted</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </label>
      </div>
      {filtered.length === 0 ? (
        <EmptyState icon="calendar" title="No appointments found" text={`No ${filter} appointments to display.`} />
      ) : (
        <DataTable
          columns={["Donor", "Blood Type", "Date", "Time", "Status", "Actions"]}
          rows={filtered.map((a) => [
            a.donor,
            <BloodTypeBadge type={a.bloodType} key={`bt-${a.id}`} />,
            a.date,
            a.time,
            <StatusBadge tone={a.status} key={`st-${a.id}`}>{a.status}</StatusBadge>,
            <div className="table-actions" key={`ac-${a.id}`}>
              {a.status === "pending" && (
                <>
                  <button type="button" className="btn-action btn-action-success" onClick={() => updateStatus(a.id, "accepted" as BadgeTone, `Appointment for ${a.donor} accepted.`)}>Accept</button>
                  <button type="button" className="btn-action btn-action-danger" onClick={() => updateStatus(a.id, "cancelled" as BadgeTone, `Appointment for ${a.donor} rejected.`)}>Reject</button>
                </>
              )}
              {a.status === "accepted" && (
                <button type="button" className="btn-action btn-action-success" onClick={() => updateStatus(a.id, "completed" as BadgeTone, `Appointment for ${a.donor} marked as completed.`)}>Complete</button>
              )}
              {(a.status === "completed" || a.status === "cancelled") && (
                <button type="button" className="btn-action btn-action-danger" onClick={() => deleteAppt(a.id)}>Delete</button>
              )}
            </div>,
          ])}
        />
      )}
    </>
  );
}

function ManageInventory() {
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<InventoryItem | null>(null);
  const [modalErrors, setModalErrors] = useState<Record<string, string>>({});
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [invList, setInvList] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const [addType, setAddType] = useState("");
  const [addUnits, setAddUnits] = useState("");
  const [addExpires, setAddExpires] = useState("");

  const [editUnits, setEditUnits] = useState("");
  const [editExpires, setEditExpires] = useState("");

  const loadInventory = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const records = await fetchInventoryByBank(ADMIN_BANK_ID);
      setInvList(records.map(mapInventoryRecordToItem));
    } catch {
      setError("Unable to load inventory data right now.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadInventory();
  }, [loadInventory]);

  function resetAddForm() {
    setAddType("");
    setAddUnits("");
    setAddExpires("");
    setModalErrors({});
  }

  async function handleAddStock() {
    const errors: Record<string, string> = {};
    const quantity = Number.parseInt(addUnits, 10);
    if (!isBloodType(addType)) errors.blood_type = "Please select a blood type.";
    if (!addUnits || quantity <= 0) errors.quantity = "Units must be greater than 0.";
    if (!addExpires) errors.expires = "Expiration date is required.";
    setModalErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setIsSaving(true);
    try {
      const exists = invList.find((i) => i.type === addType);
      if (exists) {
        const updatedRecord = await updateInventoryRecord(exists.id, {
          quantity_units: exists.units + quantity,
          expiration_date: addExpires,
        });
        const updatedItem = mapInventoryRecordToItem(updatedRecord);
        setInvList((prev) => prev.map((i) => i.id === exists.id ? updatedItem : i));
        setToast({ message: `Added ${quantity} units to ${addType}. Total: ${updatedItem.units} units.`, type: "success" });
      } else {
        const createdRecord = await createInventoryRecord({
          bank_id: ADMIN_BANK_ID,
          blood_type: addType,
          quantity_units: quantity,
          expiration_date: addExpires,
        });
        setInvList((prev) => [mapInventoryRecordToItem(createdRecord), ...prev]);
        setToast({ message: `${addType} added to inventory with ${quantity} units.`, type: "success" });
      }
      setShowModal(false);
      resetAddForm();
    } catch {
      setToast({ message: "Unable to save inventory changes.", type: "error" });
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(item: InventoryItem) {
    setIsSaving(true);
    try {
      await deleteInventoryRecord(item.id);
      setInvList((prev) => prev.filter((i) => i.id !== item.id));
      setToast({ message: `${item.type} removed from inventory.`, type: "success" });
    } catch {
      setToast({ message: "Unable to delete inventory item.", type: "error" });
    } finally {
      setIsSaving(false);
    }
  }

  function openEdit(item: InventoryItem) {
    setEditItem(item);
    setEditUnits(String(item.units));
    setEditExpires(item.expires);
    setModalErrors({});
  }

  async function handleSaveEdit() {
    if (!editItem) return;
    const errors: Record<string, string> = {};
    const newUnits = Number.parseInt(editUnits, 10);
    if (!editUnits || newUnits <= 0) errors.quantity = "Units must be greater than 0.";
    if (!editExpires) errors.expires = "Expiration date is required.";
    setModalErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setIsSaving(true);
    try {
      const updatedRecord = await updateInventoryRecord(editItem.id, {
        quantity_units: newUnits,
        expiration_date: editExpires,
      });
      const updatedItem = mapInventoryRecordToItem(updatedRecord);
      setInvList((prev) => prev.map((i) => i.id === editItem.id ? updatedItem : i));
      setEditItem(null);
      setToast({ message: `${editItem.type} inventory updated to ${newUnits} units.`, type: "success" });
    } catch {
      setToast({ message: "Unable to update inventory item.", type: "error" });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <div className="page-title-row">
        <PageTitle title="Blood Inventory" subtitle="Manage your facility's current blood stock." />
        <button className="button button-primary" type="button" onClick={() => setShowModal(true)}><Icon name="plus" />Add Stock</button>
      </div>
      {isLoading ? <InlineFeedback icon="drop" text="Loading inventory..." /> : null}
      {error ? <InlineFeedback icon="warning" text={error} actionLabel="Retry" onAction={loadInventory} tone="error" /> : null}
      {!isLoading && !error && invList.length === 0 ? (
        <EmptyState icon="drop" title="No inventory items" text="Add blood stock to get started." />
      ) : null}
      {!isLoading && !error && invList.length > 0 ? (
        <DataTable
          columns={["Blood Type", "Units", "Expiration", "Status", "Actions"]}
          rows={invList.map((item) => [
            <BloodTypeBadge type={item.type} key={`bt-${item.type}`} />,
            <strong key={`u-${item.type}`}>{item.units}</strong>,
            item.expires,
            <StatusBadge tone={getInventoryStatus(item.units)} key={`st-${item.type}`}>{getInventoryStatusLabel(item.units)}</StatusBadge>,
            <div className="table-actions" key={`ac-${item.type}`}>
              <button type="button" className="btn-action" onClick={() => openEdit(item)}>Edit</button>
              <button type="button" className="btn-action btn-action-danger" disabled={isSaving} onClick={() => void handleDelete(item)}>Delete</button>
            </div>,
          ])}
        />
      ) : null}

      {/* Add Stock Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => { setShowModal(false); resetAddForm(); }}>
          <div className="modal-card" onClick={(e: MouseEvent) => e.stopPropagation()}>
            <div className="modal-header">
              <Icon name="drop" />
              <h3>Add Inventory Item</h3>
              <button className="modal-close" type="button" onClick={() => { setShowModal(false); resetAddForm(); }}>&times;</button>
            </div>
            <div className="field-group">
              <label className="form-label">Blood Type</label>
              <select className="form-select" value={addType} onChange={(e) => { setAddType((e.target as HTMLSelectElement).value); setModalErrors((p) => ({ ...p, blood_type: '' })); }}>
                <option value="">Select type</option>
                <option value="A+">A+</option><option value="A-">A-</option>
                <option value="B+">B+</option><option value="B-">B-</option>
                <option value="AB+">AB+</option><option value="AB-">AB-</option>
                <option value="O+">O+</option><option value="O-">O-</option>
              </select>
              {modalErrors.blood_type && <span className="field-error">{modalErrors.blood_type}</span>}
            </div>
            <div className="field-group">
              <Input label="Quantity (Units)" placeholder="0" type="number" value={addUnits} onChange={(e) => { setAddUnits((e.target as HTMLInputElement).value); setModalErrors((p) => ({ ...p, quantity: '' })); }} />
              {modalErrors.quantity && <span className="field-error">{modalErrors.quantity}</span>}
            </div>
            <div className="field-group">
              <Input label="Expiration Date" type="date" value={addExpires} onChange={(e) => setAddExpires((e.target as HTMLInputElement).value)} />
              {modalErrors.expires && <span className="field-error">{modalErrors.expires}</span>}
            </div>
            <button className={`button button-primary full-width ${isSaving ? "button-loading" : ""}`} type="button" disabled={isSaving} onClick={() => void handleAddStock()}>Save</button>
          </div>
        </div>
      )}

      {/* Edit Stock Modal */}
      {editItem && (
        <div className="modal-overlay" onClick={() => setEditItem(null)}>
          <div className="modal-card" onClick={(e: MouseEvent) => e.stopPropagation()}>
            <div className="modal-header">
              <Icon name="drop" />
              <h3>Edit {editItem.type} Stock</h3>
              <button className="modal-close" type="button" onClick={() => setEditItem(null)}>&times;</button>
            </div>
            <div className="review-donor-header">
              <div className="review-avatar">{editItem.type}</div>
              <StatusBadge tone={getInventoryStatus(editItem.units)}>{getInventoryStatusLabel(editItem.units)}</StatusBadge>
            </div>
            <div className="field-group">
              <Input label="Quantity (Units)" type="number" value={editUnits} onChange={(e) => { setEditUnits((e.target as HTMLInputElement).value); setModalErrors((p) => ({ ...p, quantity: '' })); }} />
              {modalErrors.quantity && <span className="field-error">{modalErrors.quantity}</span>}
            </div>
            <div className="field-group">
              <Input label="Expiration Date" type="date" value={editExpires} onChange={(e) => setEditExpires((e.target as HTMLInputElement).value)} />
              {modalErrors.expires && <span className="field-error">{modalErrors.expires}</span>}
            </div>
            <div className="review-actions">
              <button className={`button button-primary ${isSaving ? "button-loading" : ""}`} type="button" disabled={isSaving} onClick={() => void handleSaveEdit()}><Icon name="check" /> Save Changes</button>
              <button className="button button-danger" type="button" onClick={() => setEditItem(null)}><Icon name="x" /> Cancel</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function ManageRequests() {
  const [showModal, setShowModal] = useState(false);
  const [editModal, setEditModal] = useState<RequestCardData | null>(null);
  const [modalErrors, setModalErrors] = useState<Record<string, string>>({});
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [patientName, setPatientName] = useState("");
  const [requestBloodType, setRequestBloodType] = useState<BloodType | "">("");
  const [requestUrgency, setRequestUrgency] = useState<ApiUrgencyLevel>("urgent");
  const [units, setUnits] = useState("");
  const [reqList, setReqList] = useState<RequestCardData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const [editPatient, setEditPatient] = useState("");
  const [editUnits, setEditUnits] = useState("");
  const [editBloodType, setEditBloodType] = useState<BloodType>("O+");
  const [editUrgency, setEditUrgency] = useState<ApiUrgencyLevel>("urgent");

  const loadRequests = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const loadedRequests = await fetchBloodRequestsByBank(ADMIN_BANK_ID);
      setReqList(loadedRequests.map(mapBloodRequestToCard));
    } catch {
      setError("Unable to load blood requests right now.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadRequests();
  }, [loadRequests]);

  function resetRequestForm() {
    setPatientName("");
    setRequestBloodType("");
    setRequestUrgency("urgent");
    setUnits("");
    setModalErrors({});
  }

  async function handlePublish() {
    const errors: Record<string, string> = {};
    const selectedBloodType = isBloodType(requestBloodType) ? requestBloodType : null;
    const requiredUnits = Number.parseInt(units, 10);
    if (!selectedBloodType) errors.blood_type = "Please select a blood type.";
    if (!units || requiredUnits <= 0) errors.units = "Units must be greater than 0.";
    setModalErrors(errors);
    if (Object.keys(errors).length > 0) return;
    if (!selectedBloodType) return;

    const payload: ApiNewBloodRequest = {
      bank_id: ADMIN_BANK_ID,
      patient_name: patientName,
      blood_type: selectedBloodType,
      required_units: requiredUnits,
      urgency_level: requestUrgency,
    };

    setIsSaving(true);
    try {
      const createdRequest = await createBloodRequest(payload);
      setReqList((prev) => [mapBloodRequestToCard(createdRequest), ...prev]);
      setShowModal(false);
      resetRequestForm();
      setToast({ message: "Blood request published successfully!", type: "success" });
    } catch {
      setToast({ message: "Unable to publish blood request.", type: "error" });
    } finally {
      setIsSaving(false);
    }
  }

  async function handleFulfill(id: number) {
    const req = reqList.find((r) => r.id === id);
    setIsSaving(true);
    try {
      const updatedRequest = await updateBloodRequestStatus(id, "fulfilled");
      setReqList((prev) => prev.map((r) => r.id === id ? mapBloodRequestToCard(updatedRequest) : r));
      setToast({ message: `Request for ${req?.patient} marked as fulfilled.`, type: "success" });
    } catch {
      setToast({ message: "Unable to update request status.", type: "error" });
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(id: number) {
    const req = reqList.find((r) => r.id === id);
    setIsSaving(true);
    try {
      await deleteBloodRequest(id);
      setReqList((prev) => prev.filter((r) => r.id !== id));
      setToast({ message: `Request for ${req?.patient} deleted.`, type: "success" });
    } catch {
      setToast({ message: "Unable to delete request.", type: "error" });
    } finally {
      setIsSaving(false);
    }
  }

  function openEdit(req: RequestCardData) {
    setEditModal(req);
    setEditPatient(req.patient);
    setEditUnits(String(req.units));
    setEditBloodType(req.bloodType);
    setEditUrgency(req.urgencyLevel ?? (req.status === "urgent" ? "urgent" : "normal"));
    setModalErrors({});
  }

  async function handleSaveEdit() {
    if (!editModal) return;
    const errors: Record<string, string> = {};
    const nextUnits = Number.parseInt(editUnits, 10);
    if (!editUnits || nextUnits <= 0) errors.units = "Units must be greater than 0.";
    if (!editPatient.trim()) errors.patient = "Patient name is required.";
    setModalErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setIsSaving(true);
    try {
      const updatedRequest = await updateBloodRequest(editModal.id, {
        patient_name: editPatient,
        blood_type: editBloodType,
        required_units: nextUnits,
        urgency_level: editUrgency,
      });
      setReqList((prev) => prev.map((r) => r.id === editModal.id ? mapBloodRequestToCard(updatedRequest) : r));
      setEditModal(null);
      setToast({ message: "Request updated successfully.", type: "success" });
    } catch {
      setToast({ message: "Unable to update request.", type: "error" });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <div className="page-title-row">
        <PageTitle title="Blood Requests" subtitle="Manage your facility's active blood requests." />
        <button className="button button-primary" type="button" onClick={() => setShowModal(true)}><Icon name="plus" />New Request</button>
      </div>
      {isLoading ? <InlineFeedback icon="file" text="Loading blood requests..." /> : null}
      {error ? <InlineFeedback icon="warning" text={error} actionLabel="Retry" onAction={loadRequests} tone="error" /> : null}
      {!isLoading && !error && reqList.length === 0 ? (
        <EmptyState icon="file" title="No blood requests" text="Create a request to notify matching donors." />
      ) : null}
      {!isLoading && !error && reqList.length > 0 ? (
        <DataTable
          columns={["Patient", "Blood Type", "Units", "Urgency", "Status", "Actions"]}
          rows={reqList.map((r) => [
            r.patient,
            <BloodTypeBadge type={r.bloodType} key={`bt-${r.id}`} />,
            <strong key={`u-${r.id}`}>{r.units}</strong>,
            <StatusBadge tone={r.status} key={`st-${r.id}`}>{getRequestUrgencyLabel(r.urgencyLevel ?? "normal")}</StatusBadge>,
            <StatusBadge
              tone={r.reqStatus === "fulfilled" ? "completed" : r.reqStatus === "cancelled" ? "cancelled" : "pending"}
              key={`sp-${r.id}`}
            >
              {r.reqStatus === "fulfilled" ? "Fulfilled" : r.reqStatus === "cancelled" ? "Cancelled" : "Pending"}
            </StatusBadge>,
            <div className="table-actions" key={`ac-${r.id}`}>
              {r.reqStatus === "pending" && (
                <>
                  <button type="button" className="btn-action btn-action-success" disabled={isSaving} onClick={() => void handleFulfill(r.id)}>Fulfill</button>
                  <button type="button" className="btn-action" disabled={isSaving} onClick={() => openEdit(r)}>Edit</button>
                </>
              )}
              <button type="button" className="btn-action btn-action-danger" disabled={isSaving} onClick={() => void handleDelete(r.id)}>Delete</button>
            </div>,
          ])}
        />
      ) : null}

      {/* New Request Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => { setShowModal(false); resetRequestForm(); }}>
          <div className="modal-card" onClick={(e: MouseEvent) => e.stopPropagation()}>
            <div className="modal-header">
              <Icon name="warning" />
              <h3>Create Blood Request</h3>
              <button className="modal-close" type="button" onClick={() => { setShowModal(false); resetRequestForm(); }}>&times;</button>
            </div>
            <Input label="Patient/Case Name" placeholder="Internal Ref or Name" value={patientName} onChange={(e) => setPatientName((e.target as HTMLInputElement).value)} />
            <div className="form-two">
              <div className="field-group">
                <SelectField label="Blood Type" options={["Select type", ...bloodTypeOptions]} value={requestBloodType} onChange={(value) => { setRequestBloodType(isBloodType(value) ? value : ""); setModalErrors((prev) => ({ ...prev, blood_type: "" })); }} />
                {modalErrors.blood_type && <span className="field-error">{modalErrors.blood_type}</span>}
              </div>
              <div className="field-group">
                <Input label="Units Needed" placeholder="1" type="number" value={units} onChange={(e) => { setUnits((e.target as HTMLInputElement).value); setModalErrors((prev) => ({ ...prev, units: '' })); }} />
                {modalErrors.units && <span className="field-error">{modalErrors.units}</span>}
              </div>
            </div>
            <label className="field">
              <span>Urgency Level</span>
              <select value={requestUrgency} onChange={(event) => setRequestUrgency((event.target as HTMLSelectElement).value as ApiUrgencyLevel)}>
                {requestUrgencyOptions.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </label>
            <div className="form-field">
              <label className="form-label">Notes (Optional)</label>
              <textarea className="form-textarea" rows={3}></textarea>
            </div>
            <button className={`button button-primary full-width ${isSaving ? "button-loading" : ""}`} type="button" disabled={isSaving} onClick={() => void handlePublish()}>Publish Request</button>
          </div>
        </div>
      )}

      {/* Edit Request Modal */}
      {editModal && (
        <div className="modal-overlay" onClick={() => setEditModal(null)}>
          <div className="modal-card" onClick={(e: MouseEvent) => e.stopPropagation()}>
            <div className="modal-header">
              <Icon name="grid" />
              <h3>Edit Blood Request</h3>
              <button className="modal-close" type="button" onClick={() => setEditModal(null)}>&times;</button>
            </div>
            <div className="field-group">
              <Input label="Patient/Case Name" value={editPatient} onChange={(e) => { setEditPatient((e.target as HTMLInputElement).value); setModalErrors((prev) => ({ ...prev, patient: '' })); }} />
              {modalErrors.patient && <span className="field-error">{modalErrors.patient}</span>}
            </div>
            <div className="form-two">
              <SelectField label="Blood Type" options={bloodTypeOptions} value={editBloodType} onChange={(value) => { if (isBloodType(value)) setEditBloodType(value); }} />
              <div className="field-group">
                <Input label="Units Needed" type="number" value={editUnits} onChange={(e) => { setEditUnits((e.target as HTMLInputElement).value); setModalErrors((prev) => ({ ...prev, units: '' })); }} />
                {modalErrors.units && <span className="field-error">{modalErrors.units}</span>}
              </div>
            </div>
            <label className="field">
              <span>Urgency Level</span>
              <select value={editUrgency} onChange={(event) => setEditUrgency((event.target as HTMLSelectElement).value as ApiUrgencyLevel)}>
                {requestUrgencyOptions.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </label>
            <div className="review-actions">
              <button className={`button button-primary ${isSaving ? "button-loading" : ""}`} type="button" disabled={isSaving} onClick={() => void handleSaveEdit()}><Icon name="check" /> Save Changes</button>
              <button className="button button-danger" type="button" onClick={() => setEditModal(null)}><Icon name="x" /> Cancel</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function NotificationsPage() {
  const [notifications, setNotifications] = useState([
    { id: 1, title: "Urgent Blood Request: O-", message: "Al-Shifa Hospital urgently needs 3 units of O- blood. You are a matching donor.", type: "emergency" as const, is_read: false, created_at: "2026-05-31T10:00:00Z" },
    { id: 2, title: "Appointment Confirmed", message: "Your appointment at Al-Shifa Hospital on May 28 at 10:00 AM has been confirmed.", type: "confirmation" as const, is_read: false, created_at: "2026-05-30T14:30:00Z" },
    { id: 3, title: "Donation Reminder", message: "You are eligible to donate again. It has been 3 months since your last donation.", type: "reminder" as const, is_read: true, created_at: "2026-05-28T09:00:00Z" },
    { id: 4, title: "Welcome to SBMS", message: "Thank you for registering as a blood donor. Complete your profile to get matched with requests.", type: "general" as const, is_read: true, created_at: "2026-05-20T12:00:00Z" },
    { id: 5, title: "New Urgent Request Near You", message: "Palestinian Blood Bank needs 2 units of A+ blood urgently.", type: "emergency" as const, is_read: false, created_at: "2026-05-31T08:15:00Z" },
  ]);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  function markAsRead(id: number) {
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, is_read: true } : n));
  }

  function markAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setToast({ message: "All notifications marked as read.", type: "success" });
  }

  function deleteNotification(id: number) {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    setToast({ message: "Notification deleted.", type: "success" });
  }

  const typeIcon = (type: string): IconName => {
    if (type === 'emergency') return 'warning';
    if (type === 'reminder') return 'clock';
    if (type === 'confirmation') return 'check';
    return 'bell';
  };

  const typeColor = (type: string): string => {
    if (type === 'emergency') return 'notif-emergency';
    if (type === 'reminder') return 'notif-reminder';
    if (type === 'confirmation') return 'notif-confirmation';
    return 'notif-general';
  };

  return (
    <section className="notifications-page">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <div className="page-title-row">
        <PageTitle title="Notifications" subtitle={`You have ${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}.`} />
        {unreadCount > 0 && (
          <button className="button button-primary" type="button" onClick={markAllRead}>
            <Icon name="check" />Mark All Read
          </button>
        )}
      </div>
      <div className="notif-list">
        {notifications.length === 0 ? (
          <EmptyState icon="bell" title="No notifications" text="You're all caught up!" />
        ) : (
          notifications.map((n) => (
            <div className={`notif-card ${n.is_read ? 'notif-read' : 'notif-unread'}`} key={n.id} onClick={() => markAsRead(n.id)}>
              <div className={`notif-icon-circle ${typeColor(n.type)}`}>
                <Icon name={typeIcon(n.type)} />
              </div>
              <div className="notif-content">
                <div className="notif-title-row">
                  <strong>{n.title}</strong>
                  {!n.is_read && <span className="notif-dot"></span>}
                </div>
                <p>{n.message}</p>
                <span className="notif-time">{new Date(n.created_at).toLocaleDateString()} · {n.type}</span>
              </div>
              <button className="btn-icon btn-icon-danger" type="button" title="Delete" onClick={(e) => { e.stopPropagation(); deleteNotification(n.id); }}>
                <Icon name="x" />
              </button>
            </div>
          ))
        )}
      </div>
    </section>
  );
}

/* ── Toast Notification Component ── */
function Toast({ message, type, onClose }: { message: string; type: "success" | "error"; onClose: () => void }) {
  useEffect(() => {
    const timer = window.setTimeout(onClose, 4000);
    return () => window.clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`toast-container`}>
      <div className={`toast toast-${type}`}>
        <Icon name={type === 'success' ? 'check' : 'warning'} />
        <span>{message}</span>
        <button className="toast-close" type="button" onClick={onClose}>&times;</button>
      </div>
    </div>
  );
}


function BrandMark({ href, label, compact = false }: { href: string; label: string; compact?: boolean }) {
  return (
    <a className={compact ? "brand-lockup brand-lockup-compact" : "brand-lockup"} href={href} aria-label={label}>
      <img className="brand-logo-image" src="/sbms-logo.svg" alt="" />
    </a>
  );
}

function SectionIntro({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="section-intro">
      <span>{eyebrow}</span>
      <h2>{title}</h2>
    </div>
  );
}

function FeatureCard({ icon, title, text }: { icon: IconName; title: string; text: string }) {
  return (
    <article className="feature-card">
      <div className="icon-circle"><Icon name={icon} /></div>
      <h3>{title}</h3>
      <p>{text}</p>
    </article>
  );
}

function RequestCard({ request, admin = false, index = 0, actionHref }: { request: typeof urgentRequests[number]; admin?: boolean; index?: number; actionHref?: string }) {
  const typeChar = request.bloodType.replace(/[+-]/g, '');
  const typeSign = request.bloodType.includes('+') ? '+' : '-';
  const isUrgent = request.status === 'urgent';
  const helpHref = actionHref ?? (admin ? "#admin-requests" : "#login");

  return (
    <article className={`request-card-legacy ${isUrgent ? 'request-card-legacy--urgent' : 'request-card-legacy--normal'}`}>
      <div className="legacy-blood-circle">
        {typeSign}{typeChar}
      </div>
      <div className="legacy-meta-row">
        <span className="legacy-time">2 hours ago</span>
        {isUrgent && <span className="legacy-urgency legacy-urgency-red">URGENT</span>}
      </div>
      <div className="legacy-location">
        <svg viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
        {request.facility}
      </div>
      <a href={helpHref} className={`legacy-help-btn ${index === 0 ? 'legacy-btn-filled' : 'legacy-btn-outline'}`}>
        I Can Help
      </a>
    </article>
  );
}

function StatGrid({ stats }: { stats: string[][] }) {
  return (
    <div className="stat-grid">
      {stats.map(([title, value, subtitle, tone, icon]) => (
        <article className={`stat-card stat-card-${tone}`} key={title}>
          <div className="stat-card-header">
            <span>{title}</span>
            {icon ? <div className="stat-card-icon"><Icon name={icon as IconName} /></div> : null}
          </div>
          <strong>{value}</strong>
          {subtitle ? <p>{subtitle}</p> : null}
        </article>
      ))}
    </div>
  );
}

function Panel({ title, subtitle, action, children }: { title: string; subtitle?: string; action?: string; children: ReactNode }) {
  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <h2>{title}</h2>
          {subtitle ? <p>{subtitle}</p> : null}
        </div>
        {action ? <a href={action}>View All</a> : null}
      </div>
      <div className="panel-body">{children}</div>
    </section>
  );
}

function EmptyState({ icon = "calendar", title, text, actionHref, actionLabel }: { icon?: IconName; title: string; text?: string; actionHref?: string; actionLabel?: string }) {
  return (
    <div className="empty-state">
      <Icon name={icon} />
      <h3>{title}</h3>
      {text ? <p>{text}</p> : null}
      {actionHref && actionLabel ? <a className="button button-primary" href={actionHref}>{actionLabel}</a> : null}
    </div>
  );
}

function InlineFeedback({
  icon,
  text,
  actionLabel,
  onAction,
  tone = "normal",
}: {
  icon: IconName;
  text: string;
  actionLabel?: string;
  onAction?: () => void | Promise<void>;
  tone?: "normal" | "error";
}) {
  return (
    <div className={`inline-feedback ${tone === "error" ? "inline-feedback-error" : ""}`}>
      <Icon name={icon} />
      <span>{text}</span>
      {actionLabel && onAction ? (
        <button type="button" className="btn-action" onClick={() => void onAction()}>
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}

function AppointmentMini({ item, admin = false, onReview }: { item: typeof appointments[number]; admin?: boolean; onReview?: () => void }) {
  return (
    <div className="appointment-mini">
      <div className="mini-content">
        <strong>{admin ? item.donor : item.facility}</strong>
        <span>{item.date} at {item.time}</span>
      </div>
      <div className="appointment-actions">
        <BloodTypeBadge type={item.bloodType} />
        {admin ? <button type="button" className="btn-action" onClick={onReview}>Review</button> : <StatusBadge tone={item.status}>{item.status}</StatusBadge>}
      </div>
    </div>
  );
}

function RequestMini({ request }: { request: typeof urgentRequests[number] }) {
  return (
    <div className="request-mini">
      <BloodTypeBadge type={request.bloodType} size="large" />
      <div className="mini-content">
        <strong>{request.facility}</strong>
        <span>{request.units} units needed - {request.city}</span>
      </div>
      <a href="#donor-requests" className="btn-action" style={{ textDecoration: 'none' }}>Respond</a>
    </div>
  );
}

function DataTable({ columns, rows }: { columns: string[]; rows: ReactNode[][] }) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>{columns.map((column) => <th key={column}>{column}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index}>{row.map((cell, cellIndex) => <td key={cellIndex}>{cell}</td>)}</tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ActionCard({ href, title, text }: { href: string; title: string; text: string }) {
  return (
    <a className="action-card" href={href}>
      <h3>{title}</h3>
      <p>{text}</p>
    </a>
  );
}

function InfoList({ rows }: { rows: string[][] }) {
  return (
    <dl className="info-list">
      {rows.map(([key, value]) => (
        <div key={key}>
          <dt>{key}</dt>
          <dd>{value}</dd>
        </div>
      ))}
    </dl>
  );
}

function PageTitle({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="page-title">
      <h1>{title}</h1>
      <p>{subtitle}</p>
    </div>
  );
}

function Input({ label, ...props }: InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className="field">
      <span>{label}</span>
      <input {...props} />
    </label>
  );
}

function SelectField({ label, options, value, onChange, name }: { label: string; options: readonly string[]; value?: string; onChange?: (value: string) => void; name?: string }) {
  return (
    <label className="field">
      <span>{label}</span>
      <select name={name} value={value} onChange={(event) => onChange?.((event.target as HTMLSelectElement).value)}>
        {options.map((option) => <option value={option === "Any time" || option === "Select type" ? "" : option} key={option}>{option}</option>)}
      </select>
    </label>
  );
}

function BloodTypeBadge({ type, size = "default" }: { type: string; size?: "default" | "large" }) {
  return <span className={size === "large" ? "blood-badge blood-badge-large" : "blood-badge"}>{type}</span>;
}

function StatusBadge({ tone, children }: { tone: BadgeTone; children: ReactNode }) {
  return <span className={`status-badge status-${tone}`}>{children}</span>;
}

function Icon({ name }: { name: IconName }) {
  if (name === "search") {
    return <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7" /><path d="m16 16 5 5" /></svg>;
  }
  if (name === "calendar") {
    return <svg viewBox="0 0 24 24"><path d="M7 3v4M17 3v4M4 9h16M5 5h14v16H5z" /></svg>;
  }
  if (name === "bell") {
    return <svg viewBox="0 0 24 24"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 7h18s-3 0-3-7" /><path d="M10 19a2 2 0 0 0 4 0" /></svg>;
  }
  if (name === "pulse") {
    return <svg viewBox="0 0 24 24"><path d="M3 12h4l2-6 4 12 2-6h6" /></svg>;
  }
  if (name === "grid") {
    return <svg viewBox="0 0 24 24"><path d="M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z" /></svg>;
  }
  if (name === "user") {
    return <svg viewBox="0 0 24 24"><path d="M20 21a8 8 0 0 0-16 0" /><circle cx="12" cy="7" r="4" /></svg>;
  }
  if (name === "map") {
    return <svg viewBox="0 0 24 24"><path d="M9 18 3 21V6l6-3 6 3 6-3v15l-6 3-6-3zM9 3v15M15 6v15" /></svg>;
  }
  if (name === "warning") {
    return <svg viewBox="0 0 24 24"><path d="M12 3 2 21h20L12 3z" /><path d="M12 9v5M12 17h.01" /></svg>;
  }
  if (name === "drop") {
    return <svg viewBox="0 0 24 24"><path d="M12 2s7 7.2 7 13a7 7 0 0 1-14 0c0-5.8 7-13 7-13z" /></svg>;
  }
  if (name === "file") {
    return <svg viewBox="0 0 24 24"><path d="M14 2H6v20h12V8z" /><path d="M14 2v6h6" /></svg>;
  }
  if (name === "logout") {
    return <svg viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="M16 17l5-5-5-5M21 12H9" /></svg>;
  }
  if (name === "plus") {
    return <svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" /></svg>;
  }
  if (name === "building") {
    return <svg viewBox="0 0 24 24"><path d="M4 21V5a2 2 0 0 1 2-2h9v18M15 8h3a2 2 0 0 1 2 2v11M8 7h3M8 11h3M8 15h3M3 21h18" /></svg>;
  }
  if (name === "clock") {
    return <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>;
  }
  if (name === "box") {
    return <svg viewBox="0 0 24 24"><path d="M21 8 12 3 3 8l9 5 9-5zM3 8v8l9 5 9-5V8M12 13v8" /></svg>;
  }
  if (name === "chevron") {
    return <svg viewBox="0 0 24 24"><path d="m9 18 6-6-6-6" /></svg>;
  }
  if (name === "upload") {
    return <svg viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><path d="M17 8l-5-5-5 5" /><path d="M12 3v12" /></svg>;
  }
  if (name === "check") {
    return <svg viewBox="0 0 24 24"><path d="M20 6 9 17l-5-5" /></svg>;
  }
  if (name === "x") {
    return <svg viewBox="0 0 24 24"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>;
  }
  if (name === "shield") {
    return <svg viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>;
  }
  if (name === "edit") {
    return <svg viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.1 2.1 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>;
  }
  return <svg viewBox="0 0 24 24"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 1 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z" /></svg>;
}

export default App;
