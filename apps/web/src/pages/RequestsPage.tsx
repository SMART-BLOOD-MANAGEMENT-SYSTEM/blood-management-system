import { useEffect, useMemo, useState } from "react";
import { EmptyState } from "../components/EmptyState";
import { ErrorState } from "../components/ErrorState";
import { LoadingState } from "../components/LoadingState";
import { RequestCard } from "../components/RequestCard";
import { fetchBloodRequests } from "../services/requestService";
import type { BloodRequest } from "../types/request";

export function RequestsPage() {
  const [requests, setRequests] = useState<BloodRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

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
          <button className="nav-cta page-cta" type="button">
            Add New Request
          </button>
        </div>
      </section>

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
