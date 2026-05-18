import { mockRequests } from "../data/mockRequests";
import { AdminAppointments } from "./admin/AdminAppointments";
import { AdminInventory } from "./admin/AdminInventory";
import { AdminRequests } from "./admin/AdminRequests";

export function AdminDashboard() {
  return (
    <main className="page-shell page-shell--admin">
      <section className="admin-workspace" aria-labelledby="admin-title">
        <aside className="admin-sidebar" aria-label="Admin navigation">
          <img src="/sbms-logo.svg" alt="SBMS" />
          <nav>
            <a href="#admin-requests">Requests</a>
            <a href="#admin-inventory">Inventory</a>
            <a href="#admin-appointments">Appointments</a>
          </nav>
        </aside>

        <div className="admin-main">
          <header className="admin-header">
            <div>
              <p className="eyebrow">Facility Admin</p>
              <h2 id="admin-title">Admin Dashboard</h2>
            </div>
            <div className="admin-profile">
              <span>Palestine Medical Complex</span>
              <button className="secondary-button" type="button">
                Logout
              </button>
            </div>
          </header>

          <div className="admin-layout">
            <AdminRequests requests={mockRequests} />
            <AdminInventory />
            <AdminAppointments />
          </div>
        </div>
      </section>
    </main>
  );
}
