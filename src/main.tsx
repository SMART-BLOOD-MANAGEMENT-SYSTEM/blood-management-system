import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ArrowDown, ChevronDown, Clock3, MapPin, Search, X } from "lucide-react";
import "./styles.css";

type BloodType = "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-";
type AvailabilityStatus = "available" | "temporarily_unavailable";
type UrgencyLevel = "low" | "normal" | "urgent" | "critical";
type LastDonationFilter = "any" | "1" | "3" | "6" | "12";

type DonorProfile = {
  id: number;
  full_name: string;
  blood_type: BloodType;
  city: string;
  phone: string;
  last_donation_date: string;
  last_donation_months: number;
  availability_status: AvailabilityStatus;
  notes?: string;
};

type DonorSearchFilters = {
  blood_type: BloodType | "";
  city: string;
  last_donation_within_months: LastDonationFilter;
};

type NewBloodRequestPayload = {
  donor_id: number;
  patient_name: string;
  blood_type: BloodType;
  city: string;
  hospital_name: string;
  urgency_level: UrgencyLevel;
  notes?: string;
};

type RequestDraft = Omit<NewBloodRequestPayload, "donor_id">;

type SelectOption = {
  label: string;
  value: string;
};

const donorProfiles: DonorProfile[] = [
  {
    id: 401,
    full_name: "Asmaa Alali",
    blood_type: "A+",
    city: "Gaza",
    phone: "+970-59-400-0001",
    last_donation_date: "2026-02-15",
    last_donation_months: 3,
    availability_status: "available",
  },
  {
    id: 402,
    full_name: "Mohammed Salem",
    blood_type: "O+",
    city: "Gaza",
    phone: "+970-59-400-0002",
    last_donation_date: "2026-03-10",
    last_donation_months: 2,
    availability_status: "available",
  },
  {
    id: 403,
    full_name: "Heba Ahmed",
    blood_type: "B+",
    city: "Rafah",
    phone: "+970-59-400-0003",
    last_donation_date: "2025-11-18",
    last_donation_months: 6,
    availability_status: "available",
  },
  {
    id: 404,
    full_name: "Sara Nabil",
    blood_type: "AB+",
    city: "Khan Younis",
    phone: "+970-59-400-0004",
    last_donation_date: "2026-01-22",
    last_donation_months: 4,
    availability_status: "available",
  },
  {
    id: 405,
    full_name: "Omar Khaled",
    blood_type: "A-",
    city: "Ramallah",
    phone: "+970-59-400-0005",
    last_donation_date: "2026-04-08",
    last_donation_months: 1,
    availability_status: "available",
  },
  {
    id: 406,
    full_name: "Mona Ali",
    blood_type: "O-",
    city: "Hebron",
    phone: "+970-59-400-0006",
    last_donation_date: "2025-09-12",
    last_donation_months: 8,
    availability_status: "temporarily_unavailable",
    notes: "Temporarily unavailable until the next eligibility check.",
  },
  {
    id: 407,
    full_name: "Yousef Adel",
    blood_type: "A+",
    city: "Nablus",
    phone: "+970-59-400-0007",
    last_donation_date: "2026-02-20",
    last_donation_months: 3,
    availability_status: "available",
  },
  {
    id: 408,
    full_name: "Lina Samir",
    blood_type: "B-",
    city: "Bethlehem",
    phone: "+970-59-400-0008",
    last_donation_date: "2025-12-12",
    last_donation_months: 5,
    availability_status: "available",
  },
  {
    id: 409,
    full_name: "Nour Hassan",
    blood_type: "AB-",
    city: "Jericho",
    phone: "+970-59-400-0009",
    last_donation_date: "2025-10-05",
    last_donation_months: 7,
    availability_status: "available",
  },
];

const bloodTypeOptions: SelectOption[] = [
  { label: "Select Blood type", value: "" },
  ...(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"] as BloodType[]).map((bloodType) => ({
    label: bloodType,
    value: bloodType,
  })),
];

const cityOptions: SelectOption[] = [
  { label: "Select City", value: "" },
  ...Array.from(new Set(donorProfiles.map((donor) => donor.city))).map((city) => ({ label: city, value: city })),
];

const lastDonationOptions: SelectOption[] = [
  { label: "Last Donation", value: "any" },
  { label: "1 month", value: "1" },
  { label: "3 months", value: "3" },
  { label: "6 months", value: "6" },
  { label: "1 year", value: "12" },
];

const urgencyOptions: SelectOption[] = [
  { label: "Critical", value: "critical" },
  { label: "Urgent", value: "urgent" },
  { label: "Normal", value: "normal" },
  { label: "Low", value: "low" },
];

const initialFilters: DonorSearchFilters = {
  blood_type: "",
  city: "",
  last_donation_within_months: "any",
};

function App() {
  const [filters, setFilters] = React.useState<DonorSearchFilters>(initialFilters);
  const [isLoading, setIsLoading] = React.useState(false);
  const [requestDonor, setRequestDonor] = React.useState<DonorProfile | null>(null);
  const [profileDonor, setProfileDonor] = React.useState<DonorProfile | null>(null);
  const [requestDraft, setRequestDraft] = React.useState<RequestDraft>(createEmptyDraft());
  const [requestErrors, setRequestErrors] = React.useState<Partial<Record<keyof RequestDraft, string>>>({});
  const [submittedRequest, setSubmittedRequest] = React.useState<NewBloodRequestPayload | null>(null);

  const filteredDonors = React.useMemo(() => {
    return donorProfiles.filter((donor) => {
      const matchesBloodType = !filters.blood_type || donor.blood_type === filters.blood_type;
      const matchesCity = !filters.city || donor.city === filters.city;
      const matchesDonation =
        filters.last_donation_within_months === "any" ||
        donor.last_donation_months <= Number.parseInt(filters.last_donation_within_months, 10);

      return matchesBloodType && matchesCity && matchesDonation;
    });
  }, [filters]);

  function updateFilter<K extends keyof DonorSearchFilters>(field: K, value: DonorSearchFilters[K]) {
    setFilters((current) => ({ ...current, [field]: value }));
  }

  function handleSearch() {
    setIsLoading(true);
    window.setTimeout(() => setIsLoading(false), 450);
  }

  function openRequestModal(donor: DonorProfile) {
    setRequestDonor(donor);
    setSubmittedRequest(null);
    setRequestErrors({});
    setRequestDraft({
      patient_name: "",
      blood_type: donor.blood_type,
      city: donor.city,
      hospital_name: "",
      urgency_level: "critical",
      notes: "",
    });
  }

  function updateRequestDraft<K extends keyof RequestDraft>(field: K, value: RequestDraft[K]) {
    setRequestDraft((current) => ({ ...current, [field]: value }));
    setRequestErrors((current) => ({ ...current, [field]: "" }));
  }

  function submitRequest() {
    if (!requestDonor) {
      return;
    }

    const nextErrors = validateRequestDraft(requestDraft);
    setRequestErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setSubmittedRequest({
      donor_id: requestDonor.id,
      patient_name: requestDraft.patient_name.trim(),
      blood_type: requestDraft.blood_type,
      city: requestDraft.city.trim(),
      hospital_name: requestDraft.hospital_name.trim(),
      urgency_level: requestDraft.urgency_level,
      notes: requestDraft.notes?.trim() || undefined,
    });
  }

  return (
    <main className="find-donor-app">
      <Header />

      <section className="find-donor-shell" id="find-donor">
        <div className="page-shell">
          <h1>Find Blood Donors Near You</h1>

          <div className="filter-bar" aria-label="Donor search filters">
            <FilterSelect
              label="Blood type filter"
              options={bloodTypeOptions}
              value={filters.blood_type}
              onChange={(value) => updateFilter("blood_type", value as BloodType | "")}
            />
            <FilterSelect
              label="City filter"
              options={cityOptions}
              value={filters.city}
              onChange={(value) => updateFilter("city", value)}
            />
            <FilterSelect
              label="Last donation filter"
              options={lastDonationOptions}
              value={filters.last_donation_within_months}
              onChange={(value) => updateFilter("last_donation_within_months", value as LastDonationFilter)}
            />
            <button className="search-btn" type="button" onClick={handleSearch}>
              <Search aria-hidden="true" size={22} />
              Search
            </button>
          </div>

          {isLoading ? (
            <StatePanel title="Loading donors..." />
          ) : filteredDonors.length === 0 ? (
            <StatePanel title="No donors match your selected filters." />
          ) : (
            <div className="donor-grid">
              {filteredDonors.map((donor) => (
                <DonorCard
                  donor={donor}
                  key={donor.id}
                  onRequest={() => openRequestModal(donor)}
                  onVisitProfile={() => setProfileDonor(donor)}
                />
              ))}
            </div>
          )}

          <button className="load-more" aria-label="Load more donors" type="button">
            <ArrowDown aria-hidden="true" size={34} />
          </button>
        </div>
      </section>

      <Footer />

      {requestDonor ? (
        <RequestModal
          donor={requestDonor}
          draft={requestDraft}
          errors={requestErrors}
          submittedRequest={submittedRequest}
          onClose={() => setRequestDonor(null)}
          onSubmit={submitRequest}
          onUpdate={updateRequestDraft}
        />
      ) : null}

      {profileDonor ? <ProfileModal donor={profileDonor} onClose={() => setProfileDonor(null)} /> : null}
    </main>
  );
}

function createEmptyDraft(): RequestDraft {
  return {
    patient_name: "",
    blood_type: "A+",
    city: "",
    hospital_name: "",
    urgency_level: "critical",
    notes: "",
  };
}

function validateRequestDraft(draft: RequestDraft) {
  const errors: Partial<Record<keyof RequestDraft, string>> = {};

  if (!draft.patient_name.trim()) {
    errors.patient_name = "Patient name is required.";
  }

  if (!draft.blood_type) {
    errors.blood_type = "Blood type is required.";
  }

  if (!draft.city.trim()) {
    errors.city = "City is required.";
  }

  if (!draft.hospital_name.trim()) {
    errors.hospital_name = "Hospital name is required.";
  }

  if (!draft.urgency_level) {
    errors.urgency_level = "Urgency level is required.";
  }

  return errors;
}

function Header() {
  return (
    <header className="site-header">
      <div className="header-inner">
        <a className="brand" href="#find-donor" aria-label="Smart Blood Management System home">
          <img src="/sbms-logo.svg" alt="SBMS logo" />
          <span className="sr-only">Smart Blood Management System</span>
        </a>

        <nav aria-label="Main navigation">
          <a href="#find-donor">Home</a>
          <a href="#footer">About Us</a>
          <a className="is-active" href="#find-donor">Find Donor</a>
          <a href="#find-donor">Urgent Requests</a>
          <a href="#contact">Contact</a>
        </nav>

        <a className="nav-cta" href="#find-donor">
          Become a Donor
        </a>
      </div>
    </header>
  );
}

function FilterSelect({
  label,
  onChange,
  options,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  value: string;
}) {
  return (
    <div className="select-wrap">
      <span className="sr-only">{label}</span>
      <select aria-label={label} value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => (
          <option key={option.value || option.label} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown aria-hidden="true" className="select-icon" size={28} />
    </div>
  );
}

function DonorCard({
  donor,
  onRequest,
  onVisitProfile,
}: {
  donor: DonorProfile;
  onRequest: () => void;
  onVisitProfile: () => void;
}) {
  return (
    <article className="donor-card">
      <span className="blood-badge">{formatBloodBadge(donor.blood_type)}</span>
      <h2>{donor.full_name}</h2>
      <p>
        <MapPin aria-hidden="true" size={22} />
        City: {donor.city}
      </p>
      <p>
        <Clock3 aria-hidden="true" size={22} />
        Last Donation: {donor.last_donation_months} months
      </p>
      <div className="card-actions">
        <button className="primary" disabled={donor.availability_status !== "available"} type="button" onClick={onRequest}>
          Request
        </button>
        <button className="secondary" type="button" onClick={onVisitProfile}>
          Visit Profile
        </button>
      </div>
    </article>
  );
}

function RequestModal({
  donor,
  draft,
  errors,
  onClose,
  onSubmit,
  onUpdate,
  submittedRequest,
}: {
  donor: DonorProfile;
  draft: RequestDraft;
  errors: Partial<Record<keyof RequestDraft, string>>;
  onClose: () => void;
  onSubmit: () => void;
  onUpdate: <K extends keyof RequestDraft>(field: K, value: RequestDraft[K]) => void;
  submittedRequest: NewBloodRequestPayload | null;
}) {
  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <section
        aria-labelledby="request-modal-title"
        aria-modal="true"
        className="modal-card request-modal"
        onMouseDown={(event) => event.stopPropagation()}
        role="dialog"
      >
        <button className="modal-close" type="button" aria-label="Close request form" onClick={onClose}>
          <X aria-hidden="true" size={22} />
        </button>

        <div className="modal-heading">
          <p>Donor request</p>
          <h2 id="request-modal-title">Request {donor.blood_type} from {donor.full_name}</h2>
        </div>

        <label>
          <span>Patient Name</span>
          <input
            aria-invalid={Boolean(errors.patient_name)}
            placeholder="Patient Name"
            value={draft.patient_name}
            onChange={(event) => onUpdate("patient_name", event.target.value)}
          />
          {errors.patient_name ? <small>{errors.patient_name}</small> : null}
        </label>

        <label>
          <span>Blood Type</span>
          <FilterSelect
            label="Request blood type"
            options={bloodTypeOptions.slice(1)}
            value={draft.blood_type}
            onChange={(value) => onUpdate("blood_type", value as BloodType)}
          />
          {errors.blood_type ? <small>{errors.blood_type}</small> : null}
        </label>

        <label>
          <span>City</span>
          <input
            aria-invalid={Boolean(errors.city)}
            placeholder="City"
            value={draft.city}
            onChange={(event) => onUpdate("city", event.target.value)}
          />
          {errors.city ? <small>{errors.city}</small> : null}
        </label>

        <label>
          <span>Hospital Name</span>
          <input
            aria-invalid={Boolean(errors.hospital_name)}
            placeholder="Hospital or blood bank"
            value={draft.hospital_name}
            onChange={(event) => onUpdate("hospital_name", event.target.value)}
          />
          {errors.hospital_name ? <small>{errors.hospital_name}</small> : null}
        </label>

        <label>
          <span>Urgency Level</span>
          <FilterSelect
            label="Urgency level"
            options={urgencyOptions}
            value={draft.urgency_level}
            onChange={(value) => onUpdate("urgency_level", value as UrgencyLevel)}
          />
          {errors.urgency_level ? <small>{errors.urgency_level}</small> : null}
        </label>

        <label className="wide-field">
          <span>Notes</span>
          <textarea
            placeholder="Add details donors should know"
            rows={4}
            value={draft.notes}
            onChange={(event) => onUpdate("notes", event.target.value)}
          />
        </label>

        {submittedRequest ? (
          <p className="success-message">Request payload is ready for backend submission.</p>
        ) : null}

        <button className="send-btn" type="button" onClick={onSubmit}>
          Send Request
        </button>
      </section>
    </div>
  );
}

function ProfileModal({ donor, onClose }: { donor: DonorProfile; onClose: () => void }) {
  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <section
        aria-labelledby="profile-modal-title"
        aria-modal="true"
        className="modal-card profile-modal"
        onMouseDown={(event) => event.stopPropagation()}
        role="dialog"
      >
        <button className="modal-close" type="button" aria-label="Close donor profile" onClick={onClose}>
          <X aria-hidden="true" size={22} />
        </button>
        <span className="blood-badge profile-badge">{formatBloodBadge(donor.blood_type)}</span>
        <h2 id="profile-modal-title">{donor.full_name}</h2>
        <p>Blood Type: {donor.blood_type}</p>
        <p>City: {donor.city}</p>
        <p>Phone: {donor.phone}</p>
        <p>Last Donation: {donor.last_donation_date}</p>
        <p>Status: {donor.availability_status === "available" ? "Available" : "Temporarily unavailable"}</p>
        {donor.notes ? <p>{donor.notes}</p> : null}
      </section>
    </div>
  );
}

function StatePanel({ title }: { title: string }) {
  return <div className="state-panel">{title}</div>;
}

function Footer() {
  return (
    <footer className="site-footer" id="footer">
      <div className="footer-inner">
        <div className="footer-info">
          <img src="/sbms-logo.svg" alt="SBMS logo" />
          <h3>Smart Blood Management System</h3>
          <p>
            Smart Blood Bank is a digital platform dedicated to solving the blood shortage crisis. We connect voluntary
            donors with those in urgent need through a smart, fast, and secure management system.
          </p>
        </div>

        <form className="contact-card" id="contact">
          <h3>Contact Us</h3>
          <input placeholder="Enter Name" />
          <input placeholder="Enter Email" type="email" />
          <textarea placeholder="Enter your message" rows={4} />
          <button type="button">Send</button>
        </form>
      </div>

      <nav className="footer-links" aria-label="Footer navigation">
        <a href="#find-donor">Home</a>
        <a href="#footer">About Us</a>
        <a href="#find-donor">Find Donors</a>
        <a href="#find-donor">Urgent Requests</a>
        <a href="#footer">Terms & Conditions</a>
        <a href="#footer">Privacy Policy</a>
      </nav>
      <p className="copyright">Copyright @ 2026 Heba H. Almuzeny</p>
    </footer>
  );
}

function formatBloodBadge(bloodType: BloodType) {
  const group = bloodType.replace("+", "").replace("-", "");
  return bloodType.endsWith("+") ? `+${group}` : `-${group}`;
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
