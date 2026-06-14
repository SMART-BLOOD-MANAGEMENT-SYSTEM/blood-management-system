import { useMemo, useState } from "react";
import { mockDonors } from "../data/mockDonors";
import { createDonorBloodRequest, fetchDonors } from "../services/donorService";
import type {
  BloodType,
  DonorProfile,
  DonorSearchFilters,
  LastDonationFilter,
  NewDonorBloodRequest,
  UrgencyLevel,
} from "../types/request";

type RequestDraft = Omit<NewDonorBloodRequest, "donor_id" | "blood_type" | "urgency_level"> & {
  blood_type: BloodType | "";
  urgency_level: UrgencyLevel | "";
};
type SelectOption = { label: string; value: string };

const bloodTypes: BloodType[] = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const urgencyLevels: UrgencyLevel[] = ["critical", "urgent", "normal", "low"];
const initialFilters: DonorSearchFilters = {
  blood_type: "",
  city: "",
  last_donation_within_months: "any",
};

const lastDonationOptions: SelectOption[] = [
  { label: "Last Donation", value: "any" },
  { label: "1 month", value: "1" },
  { label: "3 months", value: "3" },
  { label: "6 months", value: "6" },
  { label: "1 year", value: "12" },
];

const emptyDraft: RequestDraft = {
  patient_name: "",
  blood_type: "",
  city: "",
  hospital_name: "",
  urgency_level: "",
  notes: "",
};

export function DonorSearchPage() {
  const [filters, setFilters] = useState<DonorSearchFilters>(initialFilters);
  const [donors, setDonors] = useState<DonorProfile[]>(mockDonors);
  const [isLoading, setIsLoading] = useState(false);
  const [requestDonor, setRequestDonor] = useState<DonorProfile | null>(null);
  const [profileDonor, setProfileDonor] = useState<DonorProfile | null>(null);
  const [requestDraft, setRequestDraft] = useState<RequestDraft>(emptyDraft);
  const [requestErrors, setRequestErrors] = useState<Partial<Record<keyof RequestDraft, string>>>({});
  const [successMessage, setSuccessMessage] = useState("");

  const bloodTypeOptions = useMemo<SelectOption[]>(
    () => [{ label: "Select Blood type", value: "" }, ...bloodTypes.map((bloodType) => ({ label: bloodType, value: bloodType }))],
    [],
  );
  const cityOptions = useMemo<SelectOption[]>(
    () => [{ label: "Select City", value: "" }, ...Array.from(new Set(mockDonors.map((donor) => donor.city))).map((city) => ({ label: city, value: city }))],
    [],
  );

  function updateFilter<K extends keyof DonorSearchFilters>(field: K, value: DonorSearchFilters[K]) {
    setFilters((current) => ({ ...current, [field]: value }));
  }

  async function handleSearch() {
    setIsLoading(true);
    const nextDonors = await fetchDonors(filters);
    setDonors(nextDonors);
    setIsLoading(false);
  }

  function openRequestModal(donor: DonorProfile) {
    setRequestDonor(donor);
    setRequestErrors({});
    setSuccessMessage("");
    setRequestDraft({
      patient_name: "",
      blood_type: "",
      city: "",
      hospital_name: "",
      urgency_level: "",
      notes: "",
    });
  }

  function updateRequestDraft<K extends keyof RequestDraft>(field: K, value: RequestDraft[K]) {
    setRequestDraft((current) => ({ ...current, [field]: value }));
    setRequestErrors((current) => ({ ...current, [field]: "" }));
    setSuccessMessage("");
  }

  async function submitRequest() {
    if (!requestDonor) {
      return;
    }

    const nextErrors = validateRequestDraft(requestDraft);
    setRequestErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    await createDonorBloodRequest({
      donor_id: requestDonor.id,
      patient_name: requestDraft.patient_name.trim(),
      blood_type: requestDraft.blood_type as BloodType,
      city: requestDraft.city.trim(),
      hospital_name: requestDraft.hospital_name.trim(),
      urgency_level: requestDraft.urgency_level as UrgencyLevel,
      notes: requestDraft.notes?.trim() || undefined,
    });
    setSuccessMessage("Request payload is ready for backend submission.");
  }

  return (
    <section className="donor-search-page page-shell" id="find-donor" aria-labelledby="find-donor-title">
      <h2 id="find-donor-title">Find Blood Donors Near You</h2>

      <div className="donor-filter-bar" aria-label="Donor search filters">
        <FilterSelect
          label="Blood type filter"
          options={bloodTypeOptions}
          value={filters.blood_type}
          onChange={(value) => updateFilter("blood_type", value as BloodType | "")}
        />
        <FilterSelect label="City filter" options={cityOptions} value={filters.city} onChange={(value) => updateFilter("city", value)} />
        <FilterSelect
          label="Last donation filter"
          options={lastDonationOptions}
          value={filters.last_donation_within_months}
          onChange={(value) => updateFilter("last_donation_within_months", value as LastDonationFilter)}
        />
        <button className="donor-search-btn" type="button" onClick={handleSearch}>
          Search
        </button>
      </div>

      {isLoading ? (
        <div className="state-panel state-panel--loading">Loading donors...</div>
      ) : donors.length === 0 ? (
        <div className="state-panel">No donors match your selected filters.</div>
      ) : (
        <div className="donor-grid">
          {donors.map((donor) => (
            <DonorCard donor={donor} key={donor.id} onRequest={() => openRequestModal(donor)} onVisitProfile={() => setProfileDonor(donor)} />
          ))}
        </div>
      )}

      <button className="donor-load-more" aria-label="Load more donors" type="button">
        <ArrowDownIcon />
      </button>

      {requestDonor ? (
        <RequestModal
          donor={requestDonor}
          draft={requestDraft}
          errors={requestErrors}
          successMessage={successMessage}
          onClose={() => setRequestDonor(null)}
          onSubmit={submitRequest}
          onUpdate={updateRequestDraft}
        />
      ) : null}

      {profileDonor ? <ProfileModal donor={profileDonor} onClose={() => setProfileDonor(null)} /> : null}
    </section>
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
    <div className="donor-select-wrap">
      <span className="sr-only">{label}</span>
      <select aria-label={label} value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => (
          <option key={option.value || option.label} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <span className="donor-select-icon" aria-hidden="true">
        <ChevronDownIcon />
      </span>
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
      <span className="donor-blood-badge">{formatBloodBadge(donor.blood_type)}</span>
      <h3>{donor.full_name}</h3>
      <p>
        <MapPinIcon />
        City: {donor.city}
      </p>
      <p>
        <MapPinIcon />
        Last Donation: {donor.last_donation_months} months
      </p>
      <div className="donor-card-actions">
        <button className="primary-button" disabled={donor.availability_status !== "available"} type="button" onClick={onRequest}>
          Request
        </button>
        <button className="donor-secondary-button" type="button" onClick={onVisitProfile}>
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
  successMessage,
}: {
  donor: DonorProfile;
  draft: RequestDraft;
  errors: Partial<Record<keyof RequestDraft, string>>;
  onClose: () => void;
  onSubmit: () => void;
  onUpdate: <K extends keyof RequestDraft>(field: K, value: RequestDraft[K]) => void;
  successMessage: string;
}) {
  return (
    <div className="donor-modal-backdrop" onMouseDown={onClose}>
      <section
        aria-labelledby="donor-request-modal-title"
        aria-modal="true"
        className="donor-modal-card donor-request-modal"
        onMouseDown={(event) => event.stopPropagation()}
        role="dialog"
      >
        <button className="donor-modal-close" type="button" aria-label="Close request form" onClick={onClose}>
          <CloseIcon />
        </button>

        <div className="donor-modal-heading">
          <h3 id="donor-request-modal-title">
            Request for {donor.full_name}
          </h3>
        </div>

        <TextField
          error={errors.patient_name}
          label="Patient Name"
          placeholder="Patient Name"
          value={draft.patient_name}
          onChange={(value) => onUpdate("patient_name", value)}
        />

        <label>
          <span>Blood Type</span>
          <FilterSelect
            label="Request blood type"
            options={[{ label: "Blood Type", value: "" }, ...bloodTypes.map((bloodType) => ({ label: bloodType, value: bloodType }))]}
            value={draft.blood_type}
            onChange={(value) => onUpdate("blood_type", value as BloodType)}
          />
          {errors.blood_type ? <small>{errors.blood_type}</small> : null}
        </label>

        <label>
          <span>Select City</span>
          <FilterSelect
            label="Select city"
            options={[
              { label: "Select City", value: "" },
              { label: "Gaza", value: "Gaza" },
              { label: "Hebron", value: "Hebron" },
              { label: "Ramallah", value: "Ramallah" },
              { label: "Nablus", value: "Nablus" },
            ]}
            value={draft.city}
            onChange={(value) => onUpdate("city", value)}
          />
          {errors.city ? <small>{errors.city}</small> : null}
        </label>
        <TextField
          error={errors.hospital_name}
          label="Hospital Name"
          placeholder="Hospital Name"
          value={draft.hospital_name}
          onChange={(value) => onUpdate("hospital_name", value)}
        />

        <label>
          <span>Request Type</span>
          <FilterSelect
            label="Request type"
            options={[{ label: "Request Type", value: "" }, ...urgencyLevels.map((level) => ({ label: level.charAt(0).toUpperCase() + level.slice(1), value: level }))]}
            value={draft.urgency_level}
            onChange={(value) => onUpdate("urgency_level", value as UrgencyLevel)}
          />
          {errors.urgency_level ? <small>{errors.urgency_level}</small> : null}
        </label>

        <label>
          <span>Notes</span>
          <textarea placeholder="Notes" rows={1} value={draft.notes} onChange={(event) => onUpdate("notes", event.target.value)} />
        </label>

        {successMessage ? <p className="success-message">{successMessage}</p> : null}

        <button className="primary-button donor-send-btn" type="button" onClick={onSubmit}>
          Send
        </button>
      </section>
    </div>
  );
}

function TextField({
  error,
  label,
  onChange,
  placeholder,
  value,
}: {
  error?: string;
  label: string;
  onChange: (value: string) => void;
  placeholder: string;
  value: string;
}) {
  return (
    <label>
      <span>{label}</span>
      <input aria-invalid={Boolean(error)} placeholder={placeholder} value={value} onChange={(event) => onChange(event.target.value)} />
      {error ? <small>{error}</small> : null}
    </label>
  );
}

function ProfileModal({ donor, onClose }: { donor: DonorProfile; onClose: () => void }) {
  return (
    <div className="donor-modal-backdrop" onMouseDown={onClose}>
      <section
        aria-labelledby="donor-profile-modal-title"
        aria-modal="true"
        className="donor-modal-card donor-profile-modal"
        onMouseDown={(event) => event.stopPropagation()}
        role="dialog"
      >
        <button className="donor-modal-close" type="button" aria-label="Close donor profile" onClick={onClose}>
          <CloseIcon />
        </button>
        <span className="donor-blood-badge donor-profile-badge">{formatBloodBadge(donor.blood_type)}</span>
        <h3 id="donor-profile-modal-title">{donor.full_name}</h3>
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

function formatBloodBadge(bloodType: BloodType) {
  const group = bloodType.replace("+", "").replace("-", "");
  return bloodType.endsWith("+") ? `+${group}` : `-${group}`;
}

function MapPinIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 1 1 18 0Z"></path>
      <circle cx="12" cy="10" r="3"></circle>
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M18 6 6 18"></path>
      <path d="m6 6 12 12"></path>
    </svg>
  );
}

function ChevronDownIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 3.5v10"></path>
      <path d="m5.5 10 3.5 3.5 3.5-3.5"></path>
    </svg>
  );
}

function ArrowDownIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" width="34" height="34" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M12 5v14"></path>
      <path d="m19 12-7 7-7-7"></path>
    </svg>
  );
}
