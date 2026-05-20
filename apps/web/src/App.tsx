import { useEffect, useState } from "react";
import type { InputHTMLAttributes, MouseEvent, ReactNode } from "react";

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

type BadgeTone = "urgent" | "pending" | "accepted" | "rejected" | "low" | "normal" | "completed";
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
  | "chevron";

type NavItem = {
  href: View;
  icon: IconName;
  label: string;
};

const facilities = [
  { id: 1, name: "Al-Shifa Hospital", city: "Gaza City", type: "Hospital", hours: "8:00 AM - 8:00 PM", slots: 8, distance: "2.4 km", blood: ["A+", "O-", "B+"] },
  { id: 2, name: "European Gaza Hospital", city: "Khan Younis", type: "Hospital", hours: "7:00 AM - 10:00 PM", slots: 11, distance: "14 km", blood: ["B-", "O-", "AB-"] },
  { id: 3, name: "Palestinian Blood Bank", city: "Gaza City", type: "Blood Bank", hours: "8:00 AM - 4:00 PM", slots: 5, distance: "3.1 km", blood: ["AB+", "O+", "A-"] },
  { id: 4, name: "Nasser Medical Complex", city: "Khan Younis", type: "Hospital", hours: "24/7", slots: 12, distance: "16 km", blood: ["A+", "B+", "O+"] },
  { id: 5, name: "Nicholas Pickett", city: "Nulla officia sed la", type: "Hospital", hours: "Contact for hours", slots: 0, distance: "", blood: [] },
  { id: 6, name: "Vladimir Luna", city: "Accusamus veniam ip", type: "Hospital", hours: "Contact for hours", slots: 0, distance: "", blood: [] },
];

const urgentRequests = [
  { id: 1, patient: "Mohammed A.", bloodType: "O-", units: 3, facility: "Al-Noor Hospital", city: "Gaza City", status: "urgent" as BadgeTone },
  { id: 2, patient: "Fatima K.", bloodType: "AB+", units: 2, facility: "Al-Noor Hospital", city: "Beit Lahia", status: "urgent" as BadgeTone },
  { id: 3, patient: "Ahmed S.", bloodType: "A+", units: 4, facility: "Al-Noor Hospital", city: "Khan Younis", status: "urgent" as BadgeTone },
  { id: 4, patient: "Sara H.", bloodType: "B+", units: 1, facility: "Al-Noor Hospital", city: "Gaza City", status: "urgent" as BadgeTone },
  { id: 5, patient: "Omar L.", bloodType: "O+", units: 2, facility: "Al-Noor Hospital", city: "Rafah", status: "urgent" as BadgeTone },
  { id: 6, patient: "Layla M.", bloodType: "A-", units: 3, facility: "Al-Noor Hospital", city: "Gaza City", status: "urgent" as BadgeTone },
];

const normalRequests = [
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
  { id: 1, donor: "Ahmed Mohammed", facility: "Al-Shifa Hospital", bloodType: "A+", date: "2026-05-22", time: "10:00 AM", status: "accepted" as BadgeTone },
  { id: 2, donor: "Sara Hassan", facility: "Indonesian Hospital", bloodType: "O-", date: "2026-05-22", time: "11:00 AM", status: "pending" as BadgeTone },
  { id: 3, donor: "Omar Ali", facility: "European Hospital", bloodType: "B+", date: "2026-05-23", time: "09:00 AM", status: "pending" as BadgeTone },
];

const inventory = [
  { type: "O-", units: 2, expires: "2026-06-10", status: "low" as BadgeTone },
  { type: "A+", units: 22, expires: "2026-06-15", status: "normal" as BadgeTone },
  { type: "B-", units: 3, expires: "2026-06-18", status: "low" as BadgeTone },
  { type: "AB+", units: 15, expires: "2026-06-20", status: "normal" as BadgeTone },
];

const donationSlots = [
  { date: "May 22, 2026", time: "09:00 AM", capacity: "4 / 8", status: "normal" as BadgeTone },
  { date: "May 22, 2026", time: "11:00 AM", capacity: "8 / 8", status: "completed" as BadgeTone },
  { date: "May 23, 2026", time: "01:00 PM", capacity: "2 / 8", status: "normal" as BadgeTone },
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
  const key = hash.replace("#", "");
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
  const activeLabel = links.find((item) => item.href === active)?.label ?? (isAdmin ? "Overview" : "Dashboard");
  const shellTitle = isAdmin ? (active === "admin" ? "Overview" : activeLabel) : "Dashboard";
  const notificationHref = isAdmin ? "#admin-notifications" : "#donor-notifications";

  return (
    <div className="dashboard-shell">
      <aside className="dashboard-sidebar">
        <BrandMark href="#top" label="BloodConnect" compact />
        <nav aria-label={`${title} navigation`}>
          {links.map((item) => (
            <a className={active === item.href ? "active" : ""} href={`#${item.href}`} key={item.href}>
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
  return (
    <>
      <PageTitle title="Welcome back" subtitle="Here is your donation summary." />
      <StatGrid
        stats={[
          ["Total Donations", "0", "", "teal", "heart"],
          ["Upcoming Appointments", "0", "", "blue", "calendar"],
          ["Urgent Requests Match", "1", "", "red", "warning"],
          ["Nearby Facilities", "0", "", "teal", "map"],
        ]}
      />
      <div className="split-grid">
        <Panel title="Next Appointment" subtitle="Your upcoming blood donation appointment">
          <EmptyState icon="calendar" title="No upcoming appointments" actionHref="#donor-search" actionLabel="Book an Appointment" />
        </Panel>
        <Panel title="Urgent Needs" subtitle="Facilities needing your blood type immediately">
          <EmptyState icon="warning" title="Check for urgent requests matching your blood type." actionHref="#donor-requests" actionLabel="View Urgent Requests" />
        </Panel>
      </div>
    </>
  );
}

function DonorProfile() {
  return (
    <>
      <PageTitle title="My Profile" subtitle="Manage your personal information and preferences." />
      <div className="form-card">
        <div className="form-card-header">
          <h2>Personal Information</h2>
          <p>Keep your details up to date to receive relevant blood requests.</p>
        </div>
        <div className="form-two">
          <Input label="Full Name" placeholder="" />
          <SelectField label="Blood Type" options={["Select type", "A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]} />
        </div>
        <div className="form-two">
          <Input label="Phone Number" placeholder="" />
          <Input label="City" placeholder="" />
        </div>
        <div className="form-two">
          <SelectField label="Gender" options={["Select gender", "Male", "Female"]} />
          <Input label="Date of Birth" placeholder="" type="date" />
        </div>
        <SelectField label="Notification Preference" options={["Select preference", "Email", "SMS", "Both"]} />
        <button className="button button-primary" type="button">Save Changes</button>
      </div>
    </>
  );
}

function SearchFacilities() {
  return (
    <>
      <PageTitle title="Find Facilities" subtitle="Search for hospitals and blood banks to book an appointment." />
      <div className="search-panel compact">
        <div className="search-input-wrap">
          <svg className="search-input-icon" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7" /><path d="m16 16 5 5" /></svg>
          <input type="text" placeholder="Search by city..." />
        </div>
        <label className="search-select-wrap">
          <select defaultValue="">
            <option value="">Any Blood Type</option>
            <option value="A+">A+</option>
            <option value="A-">A-</option>
            <option value="B+">B+</option>
            <option value="B-">B-</option>
            <option value="AB+">AB+</option>
            <option value="AB-">AB-</option>
            <option value="O+">O+</option>
            <option value="O-">O-</option>
          </select>
        </label>
        <button className="button button-primary search-bar-btn" type="button"><Icon name="search" />Search</button>
      </div>
      <div className="card-grid">
        {facilities.map((facility) => (
          <article className="facility-card" key={facility.id}>
            <div className="facility-type-badge">
              <Icon name="building" />
              <span>{facility.type}</span>
            </div>
            <h3>{facility.name}</h3>
            <div className="facility-meta">
              <p><svg viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>{facility.city}</p>
              <p><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>{facility.hours}</p>
            </div>
            <div className="facility-actions">
              <a className="button button-light full-width" href="#facility-details">Details</a>
              <a className="button button-primary full-width" href="#book-appointment">Book <Icon name="chevron" /></a>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}

function FacilityDetails() {
  const detailSlots = [
    { day: "MON", date: 25, time: "09:00 AM", seats: 4 },
    { day: "MON", date: 25, time: "11:00 AM", seats: 5 },
    { day: "TUE", date: 26, time: "10:00 AM", seats: 4 },
    { day: "WED", date: 27, time: "09:00 AM", seats: 6 },
  ];

  return (
    <>
      <nav className="detail-breadcrumb" aria-label="Breadcrumb">
        <a href="#donor-search">Facilities</a>
        <span aria-hidden="true">&gt;</span>
        <span>Al-Shifa Hospital</span>
      </nav>

      <div className="detail-info-card">
        <div className="detail-info-top">
          <div className="facility-type-badge">
            <Icon name="building" />
            <span>Hospital</span>
          </div>
          <StatusBadge tone="normal">Accepting Donors</StatusBadge>
        </div>
        <h2 className="detail-facility-name">Al-Shifa Hospital</h2>

        <div className="detail-contact-grid">
          <div className="detail-contact-item">
            <div className="detail-contact-icon">
              <svg viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
            </div>
            <div>
              <strong>Address</strong>
              <p>Omar Al-Mukhtar Street, Gaza City</p>
              <p>Gaza City</p>
            </div>
          </div>
          <div className="detail-contact-item">
            <div className="detail-contact-icon">
              <svg viewBox="0 0 24 24"><path d="M22 16.9v3a2 2 0 0 1-2.2 2A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.6a2 2 0 0 1-.4 2.1L8 9.7a16 16 0 0 0 6.3 6.3l1.3-1.3a2 2 0 0 1 2.1-.4c.8.3 1.7.5 2.6.7a2 2 0 0 1 1.7 2z" /></svg>
            </div>
            <div>
              <strong>Contact</strong>
              <p>+970-8-2677700</p>
              <p>Dr. Khaled Nasser</p>
            </div>
          </div>
        </div>

        <div className="detail-contact-item detail-hours-row">
          <div className="detail-contact-icon">
            <Icon name="clock" />
          </div>
          <div>
            <strong>Working Hours</strong>
            <p>8:00 AM - 8:00 PM</p>
          </div>
        </div>

        <div className="detail-blood-needs">
          <p className="detail-blood-label"><span className="red-dot" aria-hidden="true"></span>Urgently Needed Blood Types</p>
          <div className="detail-blood-badges">
            <span className="blood-badge">O+</span>
            <span className="blood-badge">A+</span>
            <span className="blood-badge">B+</span>
            <span className="blood-badge">AB-</span>
          </div>
        </div>
      </div>

      <div className="detail-slots-card">
        <div className="detail-slots-header">
          <Icon name="calendar" />
          <h2>Available Donation Slots</h2>
        </div>
        {detailSlots.map((slot, index) => (
          <div className="detail-slot-row" key={index}>
            <div className="detail-slot-date-box">
              <span className="detail-slot-day">{slot.day}</span>
              <span className="detail-slot-num">{slot.date}</span>
            </div>
            <div className="detail-slot-time">
              <strong>{slot.time}</strong>
              <span>{slot.seats} seats available</span>
            </div>
            <a className="button button-primary small" href="#book-appointment">Book</a>
          </div>
        ))}
        <a className="button button-primary full-width detail-book-main" href="#book-appointment">Book Appointment</a>
      </div>
    </>
  );
}

function BookAppointment() {
  return (
    <>
      <PageTitle title="Book Appointment" subtitle="Select a date and time to schedule your blood donation." />
      <div className="search-panel compact booking-filter">
        <Input label="Date" type="date" />
        <SelectField label="Time" options={["Select time", "09:00 AM", "10:00 AM", "11:00 AM", "01:00 PM", "02:00 PM", "03:00 PM"]} />
        <SelectField label="Blood Type" options={["Select type", "A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]} />
        <button className="button button-primary search-bar-btn" type="button"><Icon name="search" />Search</button>
      </div>
      <div className="booking-facility-info">
        <div className="booking-facility-badge">
          <Icon name="building" />
          <span>Al-Shifa Hospital</span>
          <StatusBadge tone="normal">Verified</StatusBadge>
        </div>
        <p>Al-Wehda Street, Gaza City · 8:00 AM - 8:00 PM</p>
      </div>
      <div className="booking-slots-grid">
        {donationSlots.filter((s) => s.status !== "completed").map((slot) => (
          <article className="booking-slot-card" key={`${slot.date}-${slot.time}`}>
            <div className="booking-slot-top">
              <div className="booking-slot-date">
                <Icon name="calendar" />
                <strong>{slot.date}</strong>
              </div>
              <StatusBadge tone="normal">Available</StatusBadge>
            </div>
            <div className="booking-slot-meta">
              <p><Icon name="clock" />{slot.time}</p>
              <p><Icon name="user" />Capacity: {slot.capacity}</p>
            </div>
            <button className="button button-primary full-width" type="button">Confirm Booking</button>
          </article>
        ))}
      </div>
      <EmptyState icon="calendar" title="More slots coming soon" text="Check back later for additional availability." />
    </>
  );
}

function MyAppointments() {
  return (
    <>
      <div className="page-title-row">
        <PageTitle title="My Appointments" subtitle="Manage your past and upcoming donation appointments." />
        <label className="appointments-filter">
          <select defaultValue="all">
            <option value="all">All Appointments</option>
            <option value="pending">Pending</option>
            <option value="accepted">Accepted</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </label>
      </div>
      <EmptyState icon="calendar" title="No appointments found" text="You haven't made any appointments yet." />
    </>
  );
}

function DonorUrgentRequests() {
  return (
    <>
      <PageTitle title="Urgent Requests" subtitle="Critical blood shortages that match your blood type." />
      <div className="request-grid-legacy dashboard-requests">
        {urgentRequests.map((request, index) => (
          <RequestCard key={request.id} request={request} index={index} />
        ))}
      </div>
    </>
  );
}

function AdminDashboard() {
  return (
    <>
      <PageTitle title="Facility Overview" subtitle="Monitor inventory and appointments." />
      <StatGrid
        stats={[
          ["Pending Apps.", "0", "", "yellow", "calendar"],
          ["Accepted Apps.", "0", "", "green", "calendar"],
          ["Available Slots", "0", "", "teal", "user"],
          ["Total Units", "0", "", "blue", "grid"],
          ["Urgent Requests", "6", "", "red", "warning"],
          ["Low Stock Types", "0", "", "yellow", "drop"],
        ]}
      />
      <div className="split-grid">
        <Panel title="Recent Appointments">
          <EmptyState title="No recent appointments found." />
        </Panel>
        <Panel title="Low Stock Alerts">
          <EmptyState icon="drop" title="All blood types are adequately stocked." />
        </Panel>
      </div>
    </>
  );
}

function AdminProfile() {
  return (
    <>
      <PageTitle title="Facility Profile" subtitle="Manage your facility's public information." />
      <div className="form-card">
        <div className="form-card-header">
          <h2>Facility Details</h2>
          <p>This information is visible to donors searching for locations.</p>
        </div>
        <div className="form-two">
          <Input label="Facility Name" placeholder="" />
          <SelectField label="Facility Type" options={["Hospital", "Blood Bank", "Clinic"]} />
        </div>
        <div className="form-two">
          <Input label="City" placeholder="" />
          <Input label="Public Phone" placeholder="" />
        </div>
        <Input label="Full Address" placeholder="" />
        <div className="form-two">
          <Input label="Contact Person (Internal)" placeholder="" />
          <Input label="Working Hours" placeholder="e.g. Mon-Fri 8AM-4PM" />
        </div>
        <SelectField label="Operational Status" options={["Active (Accepting Donors)", "Inactive", "Maintenance"]} />
        <p className="form-hint">Inactive facilities will not appear in donor searches.</p>
        <button className="button button-primary" type="button">Save Changes</button>
      </div>
    </>
  );
}

function ManageSlots() {
  const [showModal, setShowModal] = useState(false);
  return (
    <>
      <div className="page-title-row">
        <PageTitle title="Donation Slots" subtitle="Manage your facility's available appointment times." />
        <button className="button button-primary" type="button" onClick={() => setShowModal(true)}><Icon name="plus" />Create Slot</button>
      </div>
      <EmptyState icon="calendar" title="No slots configured." />
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-card" onClick={(e: MouseEvent) => e.stopPropagation()}>
            <div className="modal-header">
              <Icon name="calendar" />
              <h3>Create New Donation Slot</h3>
              <button className="modal-close" type="button" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <Input label="Date" type="date" />
            <Input label="Time" type="time" />
            <Input label="Capacity (Number of donors)" placeholder="5" />
            <button className="button button-primary full-width" type="button" onClick={() => setShowModal(false)}>Save</button>
          </div>
        </div>
      )}
    </>
  );
}

function ManageAppointments() {
  return (
    <>
      <div className="page-title-row">
        <PageTitle title="Appointments" subtitle="Manage incoming donor appointments." />
        <label className="appointments-filter">
          <select defaultValue="all">
            <option value="all">All Appointments</option>
            <option value="pending">Pending</option>
            <option value="accepted">Accepted</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </label>
      </div>
      <EmptyState icon="calendar" title="No appointments found." />
    </>
  );
}

function ManageInventory() {
  const [showModal, setShowModal] = useState(false);
  return (
    <>
      <div className="page-title-row">
        <PageTitle title="Blood Inventory" subtitle="Manage your facility's current blood stock." />
        <button className="button button-primary" type="button" onClick={() => setShowModal(true)}><Icon name="plus" />Add Stock</button>
      </div>
      <Panel title="Inventory Items">
        <EmptyState icon="drop" title="No inventory items found." />
      </Panel>
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-card" onClick={(e: MouseEvent) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add Inventory Item</h3>
              <button className="modal-close" type="button" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <SelectField label="Blood Type" options={["Select type", "A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]} />
            <Input label="Quantity (Units)" placeholder="0" />
            <Input label="Expiration Date" type="date" />
            <button className="button button-primary full-width" type="button" onClick={() => setShowModal(false)}>Save</button>
          </div>
        </div>
      )}
    </>
  );
}

function ManageRequests() {
  const [showModal, setShowModal] = useState(false);
  return (
    <>
      <div className="page-title-row">
        <PageTitle title="Blood Requests" subtitle="Manage your facility's active blood requests." />
        <button className="button button-primary" type="button" onClick={() => setShowModal(true)}><Icon name="plus" />New Request</button>
      </div>
      <EmptyState icon="file" title="No blood requests created." />
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-card" onClick={(e: MouseEvent) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Create Blood Request</h3>
              <button className="modal-close" type="button" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <Input label="Patient/Case Name" placeholder="Internal Ref or Name" />
            <div className="form-two">
              <SelectField label="Blood Type" options={["Select type", "A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]} />
              <Input label="Units Needed" placeholder="1" />
            </div>
            <SelectField label="Urgency Level" options={["Urgent (Within 24h)", "High (Within 48h)", "Normal"]} />
            <div className="form-field">
              <label className="form-label">Notes (Optional)</label>
              <textarea className="form-textarea" rows={3}></textarea>
            </div>
            <button className="button button-primary full-width" type="button" onClick={() => setShowModal(false)}>Publish Request</button>
          </div>
        </div>
      )}
    </>
  );
}

function NotificationsPage() {
  return (
    <section className="notifications-page">
      <PageTitle title="Notifications" subtitle="Stay updated on your account activity." />
      <EmptyState icon="bell" title="No notifications" text="You're all caught up!" />
    </section>
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

function RequestCard({ request, admin = false, index = 0 }: { request: typeof urgentRequests[number]; admin?: boolean; index?: number }) {
  const typeChar = request.bloodType.replace(/[+-]/g, '');
  const typeSign = request.bloodType.includes('+') ? '+' : '−';
  const isUrgent = request.status === 'urgent';

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
      <a href={admin ? "#admin-requests" : "#login"} className={`legacy-help-btn ${index === 0 ? 'legacy-btn-filled' : 'legacy-btn-outline'}`}>
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

function AppointmentMini({ item, admin = false }: { item: typeof appointments[number]; admin?: boolean }) {
  return (
    <div className="appointment-mini">
      <div>
        <strong>{admin ? item.donor : item.facility}</strong>
        <span>{item.date} at {item.time}</span>
      </div>
      <div className="appointment-actions">
        <BloodTypeBadge type={item.bloodType} />
        {admin ? <button type="button">Review</button> : <StatusBadge tone={item.status}>{item.status}</StatusBadge>}
      </div>
    </div>
  );
}

function RequestMini({ request }: { request: typeof urgentRequests[number] }) {
  return (
    <div className="request-mini">
      <BloodTypeBadge type={request.bloodType} size="large" />
      <div>
        <strong>{request.facility}</strong>
        <span>{request.units} units needed - {request.city}</span>
      </div>
      <a href="#donor-requests">Respond</a>
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

function SelectField({ label, options }: { label: string; options: string[] }) {
  return (
    <label className="field">
      <span>{label}</span>
      <select>
        {options.map((option) => <option key={option}>{option}</option>)}
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
  return <svg viewBox="0 0 24 24"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 1 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z" /></svg>;
}

export default App;
