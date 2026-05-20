import { useEffect, useMemo, useState } from "react";
import { AddRequestForm } from "../components/AddRequestForm";
import { EmptyState } from "../components/EmptyState";
import { ErrorState } from "../components/ErrorState";
import { LoadingState } from "../components/LoadingState";
import { RequestCard } from "../components/RequestCard";
import { createBloodRequest, fetchBloodRequests } from "../services/requestService";
import type { BloodRequest, NewBloodRequest } from "../types/request";

export function RequestsPage() {
  const [requests, setRequests] = useState<BloodRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isAddRequestOpen, setIsAddRequestOpen] = useState(false);

  async function loadRequests() {
    setIsLoading(true);
    setError("");

    try {
      const nextRequests = await fetchBloodRequests();
      setRequests(nextRequests);
    } catch {
      setError("Unable to load request data right now.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadRequests();
  }, []);

  async function handleCreateRequest(request: NewBloodRequest) {
    const createdRequest = await createBloodRequest(request);
    setRequests((currentRequests) => [createdRequest, ...currentRequests]);
  }

  const urgentRequests = useMemo(
    () => requests.filter((request) => request.status === "pending" && (request.urgency_level === "critical" || request.urgency_level === "urgent")),
    [requests],
  );
  const allRequests = useMemo(
    () => requests.filter((request) => !(request.status === "pending" && (request.urgency_level === "critical" || request.urgency_level === "urgent")) && request.status !== "cancelled"),
    [requests],
  );

  return (
    <section className="page-shell requests-page" id="urgent-requests" aria-labelledby="requests-title">
      <section className="requests-hero" aria-labelledby="requests-title">
        <div>
          <p className="page-kicker">Requests</p>
          <h1 id="requests-title">Urgent Requests</h1>
        </div>
        <div className="hero-right">
          <div className="hero-circle"></div>
          <button
            aria-controls="add-request"
            aria-expanded={isAddRequestOpen}
            className="nav-cta page-cta"
            type="button"
            onClick={() => setIsAddRequestOpen((isOpen) => !isOpen)}
          >
            {isAddRequestOpen ? "Close Request Form" : "Add New Request"}
          </button>
        </div>
      </section>

      {isAddRequestOpen ? (
        <section className="add-request-panel" id="add-request" aria-labelledby="add-request-title">
          <div className="add-request-panel__header">
            <div>
              <p className="page-kicker">Facility Admin</p>
              <h2 id="add-request-title">Create Blood Request</h2>
            </div>
            <button className="secondary-button" type="button" onClick={() => setIsAddRequestOpen(false)}>
              Close
            </button>
          </div>
          <AddRequestForm onCancel={() => setIsAddRequestOpen(false)} onSubmit={handleCreateRequest} />
        </section>
      ) : null}

      {isLoading ? <LoadingState /> : null}
      {error ? <ErrorState message={error} onRetry={loadRequests} /> : null}

      {!isLoading && !error ? (
        <>
          <section className="requests-section requests-section--urgent">
            {urgentRequests.length > 0 ? (
              <div className="request-grid request-grid--urgent">
                {urgentRequests.map((request, index) => (
                  <RequestCard key={request.id} request={request} variant="urgent" isFirst={index === 0} />
                ))}
              </div>
            ) : (
              <EmptyState title="No urgent requests" message="Emergency requests will appear here first." />
            )}
          </section>

          <section className="requests-section" id="all-requests">
            <div className="section-heading">
              <div>
                <h2>All Requests</h2>
              </div>
            </div>

            {allRequests.length > 0 ? (
              <div className="request-grid">
                {allRequests.map((request, index) => (
                  <RequestCard
                    key={request.id}
                    request={request}
                    variant="normal"
                    isFirst={index === 0}
                  />
                ))}
              </div>
            ) : (
              <EmptyState title="No requests yet" message="Submitted requests will appear in this section." />
            )}

            <div className="load-more-arrow">
              <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <polyline points="19 12 12 19 5 12"></polyline>
              </svg>
            </div>
          </section>
        </>
      ) : null}
    </section>
  );
}
