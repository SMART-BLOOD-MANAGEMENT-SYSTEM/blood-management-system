import type { AppointmentStatus } from "../../types/request";

const appointmentRows = [
  { id: 1, user_id: 11, slot_id: 101, donor_name: "Nour Hassan", bank_name: "Palestine Medical Complex Blood Bank", slot_label: "Today, 11:30", appointment_status: "pending" as AppointmentStatus },
  { id: 2, user_id: 12, slot_id: 102, donor_name: "Samir Omar", bank_name: "Alia Governmental Hospital Blood Bank", slot_label: "Tomorrow, 09:00", appointment_status: "confirmed" as AppointmentStatus },
  { id: 3, user_id: 13, slot_id: 103, donor_name: "Dana Qasem", bank_name: "Rafidia Surgical Hospital Blood Bank", slot_label: "May 12, 13:00", appointment_status: "pending" as AppointmentStatus },
];

export function AdminAppointments() {
  return (
    <section className="admin-screen" id="admin-appointments">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Admin</p>
          <h2>Admin Appointments</h2>
        </div>
        <span>Skeleton</span>
      </div>

      <div className="admin-table" role="table" aria-label="Admin appointments">
        <div className="admin-table__row admin-table__row--head" role="row">
          <span role="columnheader">Donor</span>
          <span role="columnheader">Blood Bank</span>
          <span role="columnheader">Slot</span>
          <span role="columnheader">Status</span>
          <span role="columnheader">Action</span>
        </div>
        {appointmentRows.map((appointment) => (
          <div className="admin-table__row" role="row" key={appointment.id}>
            <span role="cell">{appointment.donor_name}</span>
            <span role="cell">{appointment.bank_name}</span>
            <span role="cell">{appointment.slot_label}</span>
            <span role="cell">{appointment.appointment_status}</span>
            <span className="table-actions" role="cell">
              <button type="button">Confirm</button>
              <button type="button">Cancel</button>
              <button type="button">Complete</button>
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
