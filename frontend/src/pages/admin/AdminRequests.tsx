import type { BloodRequest } from "../../types/request";

interface AdminRequestsProps {
  requests: BloodRequest[];
}

export function AdminRequests({ requests }: AdminRequestsProps) {
  return (
    <section className="admin-screen" id="admin-requests">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Admin</p>
          <h2>Admin Requests</h2>
        </div>
        <span>{requests.length} records</span>
      </div>

      <div className="admin-table" role="table" aria-label="Admin blood requests">
        <div className="admin-table__row admin-table__row--head" role="row">
          <span role="columnheader">Blood</span>
          <span role="columnheader">Blood Bank</span>
          <span role="columnheader">City</span>
          <span role="columnheader">Units</span>
          <span role="columnheader">Urgency</span>
          <span role="columnheader">Action</span>
        </div>
        {requests.map((request) => (
          <div className="admin-table__row" role="row" key={request.id}>
            <span role="cell">{request.blood_type}</span>
            <span role="cell">{request.blood_bank?.name ?? `Bank #${request.bank_id}`}</span>
            <span role="cell">{request.blood_bank?.city ?? "-"}</span>
            <span role="cell">{request.required_units}</span>
            <span role="cell">{request.urgency_level}</span>
            <span className="table-actions" role="cell">
              <button type="button">Review</button>
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
