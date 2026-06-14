import { useState } from "react";
import type { BloodRequest } from "../types/request";
import { getTimeSince } from "../utils/time";

interface RequestCardProps {
  request: BloodRequest;
  variant?: "urgent" | "normal";
  isFirst?: boolean;
}

export function RequestCard({ request, variant = "normal", isFirst = false }: RequestCardProps) {
  const [hasOfferedHelp, setHasOfferedHelp] = useState(false);
  const isUrgent = variant === "urgent" || request.urgency_level === "critical" || request.urgency_level === "urgent";
  const statusLabel = isUrgent ? "URGENT" : "Normal";
  const bankName = (request.blood_bank?.name ?? `Blood bank #${request.bank_id}`).replace("Blood Bank", "Hospital");

  const isFilled = isFirst && !hasOfferedHelp;

  return (
    <article className={`request-card ${isUrgent ? "request-card--urgent" : "request-card--normal"}`}>
      <span className="request-card__blood">{request.blood_type}</span>

      <div className="request-card__topline">
        <span className="request-card__time">{getTimeSince(request.request_date)}</span>
        <span className={`status-pill ${isUrgent ? "status-pill--urgent" : "status-pill--normal"}`}>
          {statusLabel}
        </span>
      </div>

      <div className="request-card__body">
        <p className="request-card__location">
          <svg className="location-icon" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
          {bankName}
        </p>
      </div>

      <div className="request-card__footer">
        <button
          className={`help-button ${isUrgent ? "help-button--urgent" : "help-button--normal"} ${isFilled ? "help-button--filled" : ""}`}
          type="button"
          onClick={() => setHasOfferedHelp(true)}
        >
          {hasOfferedHelp ? "Ready to help" : "I Can Help"}
        </button>
      </div>
    </article>
  );
}
