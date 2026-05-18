import { FormEvent, useState } from "react";
import { mockBloodBanks } from "../data/mockBloodBanks";
import type { BloodType, NewBloodRequest, UrgencyLevel } from "../types/request";

const bloodTypes: BloodType[] = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const urgencyLevels: UrgencyLevel[] = ["critical", "urgent", "normal", "low"];

type FormErrors = Partial<Record<keyof NewBloodRequest, string>>;

interface AddRequestFormProps {
  onSubmit: (request: NewBloodRequest) => Promise<void>;
}

const initialForm: NewBloodRequest = {
  bank_id: mockBloodBanks[0]?.id ?? 1,
  patient_name: "",
  blood_type: "O+",
  required_units: 1,
  urgency_level: "critical",
};

export function AddRequestForm({ onSubmit }: AddRequestFormProps) {
  const [form, setForm] = useState<NewBloodRequest>(initialForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  function updateField<K extends keyof NewBloodRequest>(field: K, value: NewBloodRequest[K]) {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: "" }));
    setSuccessMessage("");
  }

  function validate(): FormErrors {
    const nextErrors: FormErrors = {};

    if (!form.bank_id) {
      nextErrors.bank_id = "Blood bank is required.";
    }

    if (!form.blood_type) {
      nextErrors.blood_type = "Blood type is required.";
    }

    if (!Number.isInteger(form.required_units) || form.required_units <= 0) {
      nextErrors.required_units = "Required units must be greater than 0.";
    }

    if (!form.urgency_level) {
      nextErrors.urgency_level = "Urgency level is required.";
    }

    return nextErrors;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validate();
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);
    await onSubmit({
      ...form,
      patient_name: form.patient_name?.trim(),
    });
    setIsSubmitting(false);
    setForm(initialForm);
    setSuccessMessage("Request submitted and added to the list.");
  }

  return (
    <form className="request-form" onSubmit={handleSubmit} noValidate>
      <div className="form-grid">
        <label>
          <span>Blood Type</span>
          <select
            value={form.blood_type}
            onChange={(event) => updateField("blood_type", event.target.value as BloodType)}
            aria-invalid={Boolean(errors.blood_type)}
          >
            {bloodTypes.map((bloodType) => (
              <option key={bloodType} value={bloodType}>
                {bloodType}
              </option>
            ))}
          </select>
          {errors.blood_type ? <small>{errors.blood_type}</small> : null}
        </label>

        <label>
          <span>Blood Bank</span>
          <select
            value={form.bank_id}
            onChange={(event) => updateField("bank_id", Number(event.target.value))}
            aria-invalid={Boolean(errors.bank_id)}
          >
            {mockBloodBanks.map((bank) => (
              <option key={bank.id} value={bank.id}>
                {bank.name}
              </option>
            ))}
          </select>
          {errors.bank_id ? <small>{errors.bank_id}</small> : null}
        </label>

        <label>
          <span>Patient Name</span>
          <input
            value={form.patient_name}
            onChange={(event) => updateField("patient_name", event.target.value)}
            aria-invalid={Boolean(errors.patient_name)}
            placeholder="Optional patient name"
          />
          {errors.patient_name ? <small>{errors.patient_name}</small> : null}
        </label>

        <label>
          <span>Urgency Level</span>
          <select
            value={form.urgency_level}
            onChange={(event) => updateField("urgency_level", event.target.value as UrgencyLevel)}
            aria-invalid={Boolean(errors.urgency_level)}
          >
            {urgencyLevels.map((urgencyLevel) => (
              <option key={urgencyLevel} value={urgencyLevel}>
                {urgencyLevel.charAt(0).toUpperCase() + urgencyLevel.slice(1)}
              </option>
            ))}
          </select>
          {errors.urgency_level ? <small>{errors.urgency_level}</small> : null}
        </label>

        <label>
          <span>Required Units</span>
          <input
            value={form.required_units}
            onChange={(event) => updateField("required_units", Number(event.target.value))}
            aria-invalid={Boolean(errors.required_units)}
            min="1"
            type="number"
          />
          {errors.required_units ? <small>{errors.required_units}</small> : null}
        </label>
      </div>

      <div className="form-actions">
        {successMessage ? <p className="success-message">{successMessage}</p> : null}
        <button className="primary-button" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : "Submit Request"}
        </button>
      </div>
    </form>
  );
}
