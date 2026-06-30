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
  const [requests, setRequests] = useState<any[]>([]);
  const [banks, setBanks] = useState<any[]>([]);
  const [searchBloodType, setSearchBloodType] = useState("");
  const [searchCity, setSearchCity] = useState("");

  useEffect(() => {
    Promise.all([
      fetch("/api/blood-requests").then((res) => res.json()),
      fetch("/api/blood-banks").then((res) => res.json()),
    ])
      .then(([requestsData, banksData]) => {
        setRequests(requestsData);
        setBanks(banksData);
      })
      .catch(() => console.error("Failed to fetch"));
  }, []);

  function getBankName(bankId: number) {
    const bank = banks.find((b: any) => b.id === bankId);
    return bank ? bank.name : "—";
  }

  function handleSearch() {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.hash = "#login";
    } else {
      const params = new URLSearchParams();
      if (searchBloodType && searchBloodType !== "Select Blood Type") {
        params.set("blood_type", searchBloodType);
      }
      if (searchCity && searchCity !== "Select City") {
        params.set("city", searchCity);
      }
      window.location.hash = `#donor-search`;
      localStorage.setItem("searchParams", JSON.stringify({ bloodType: searchBloodType, city: searchCity }));
    }
  }

  const urgentReqs = requests.filter((r) => r.urgency_level === "urgent");
  const normalReqs = requests.filter((r) => r.urgency_level !== "urgent");

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
        <form className="search-panel" onSubmit={(e) => { e.preventDefault(); handleSearch(); }}>
          <SelectField
            label="Blood Type"
            options={["Select Blood Type", "A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]}
            onChange={(e) => setSearchBloodType(e.target.value)}
          />
          <SelectField
            label="City"
            options={["Select City", "Gaza City", "Beit Lahia", "Khan Younis", "Rafah"]}
            onChange={(e) => setSearchCity(e.target.value)}
          />
          <SelectField
            label="Last Donation"
            options={["Any date", "3 months or more", "6 months or more"]}
          />
          <button className="button button-primary" type="submit">Search</button>
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
        {urgentReqs.length === 0 ? (
          <p style={{textAlign: 'center', color: '#888'}}>No urgent requests at the moment.</p>
        ) : (
          <div className="request-grid-legacy">
            {urgentReqs.map((request, index) => (
              <RequestCard key={request.id} request={{
                ...request,
                bloodType: request.blood_type,
                facility: getBankName(request.bank_id),
                status: "urgent"
              }} index={index} />
            ))}
          </div>
        )}
        <div className="section-header-row" style={{ marginTop: '64px' }}>
          <SectionIntro eyebrow="" title="All Requests" />
        </div>
        {normalReqs.length === 0 ? (
          <p style={{textAlign: 'center', color: '#888'}}>No requests at the moment.</p>
        ) : (
          <div className="request-grid-legacy">
            {normalReqs.map((request, index) => (
              <RequestCard key={request.id} request={{
                ...request,
                bloodType: request.blood_type,
                facility: getBankName(request.bank_id),
                status: "normal"
              }} index={index} />
            ))}
          </div>
        )}
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
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!email || !password) {
      alert("Please enter email and password");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("role", data.role);
        localStorage.setItem("user", JSON.stringify(data.user));
       const searchParams = localStorage.getItem("searchParams");
if (data.role === "admin") {
  window.location.hash = "admin";
} else if (searchParams) {
  window.location.hash = "donor-search";
} else {
  window.location.hash = "donor";
}
        window.dispatchEvent(new HashChangeEvent("hashchange"));
      } else {
        alert(data.message || "Login failed");
      }
    } catch {
      alert("Cannot connect to server");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthPage
      eyebrow="Welcome back"
      title="Login to SBMS"
      subtitle="Access donor pages or the facility admin dashboard."
      footer={<p>New to SBMS? <a href="#register">Create an account</a></p>}
    >
      <Input
        label="Email"
        placeholder="name@example.com"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <Input
        label="Password"
        placeholder="Enter password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <div className="form-row-between">
        <label className="check-row"><input type="checkbox" /> Remember me</label>
        <a href="#forgot">Forgot password?</a>
      </div>
      <button
        className="button button-primary full-width"
        type="button"
        onClick={handleLogin}
        disabled={loading}
      >
        {loading ? "Logging in..." : "Login"}
      </button>
    </AuthPage>
  );
}

function Register() {
  const [role, setRole] = useState<"donor" | "facility">("donor");
  const [loading, setLoading] = useState(false);

  // Donor fields
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [bloodType, setBloodType] = useState("");
  const [gender, setGender] = useState("");
  const [birthDate, setBirthDate] = useState("");

  async function handleRegisterDonor() {
    if (!fullName || !email || !password || !phone) {
      alert("Please fill all required fields");
      return;
    }
    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
        const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ full_name: fullName, email, password, phone, city, blood_type: bloodType, gender, birth_date: birthDate, role: "donor" }),
      });
      const data = await response.json();
      if (data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("role", "donor");
        localStorage.setItem("user", JSON.stringify(data.user));
        window.location.hash = "donor";
        window.dispatchEvent(new HashChangeEvent("hashchange"));
      } else {
        alert(data.message || "Registration failed");
      }
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  }

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
            <Input label="Full Name" placeholder="John Doe" value={fullName} onChange={(e) => setFullName(e.target.value)} />
            <Input label="Email" placeholder="john@example.com" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="form-two">
            <Input label="Password" placeholder="********" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            <Input label="Confirm Password" placeholder="********" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
          </div>
          <div className="form-two">
            <Input label="Phone" placeholder="+970..." value={phone} onChange={(e) => setPhone(e.target.value)} />
           <SelectField label="City" options={["Select City", "Gaza City", "Khan Younis", "Rafah", "Beit Lahia", "Jabalia", "Deir al-Balah"]} value={city} onChange={(e) => setCity(e.target.value)} />
          </div>
          <div className="form-two">
            <SelectField label="Blood Type" options={["Select type", "A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]} onChange={(e) => setBloodType(e.target.value)} />
            <SelectField label="Gender (Optional)" options={["Select gender", "Male", "Female"]} onChange={(e) => setGender(e.target.value)} />
          </div>
            <div className="form-two">
            <Input label="Date of Birth" type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} />
          </div>
          
          <button className="button button-primary full-width" type="button" onClick={handleRegisterDonor} disabled={loading}>
            {loading ? "Creating account..." : "Create Donor Account"}
          </button>
        </>
      ) : (
        <>
          <div className="form-two">
            <Input label="Facility Name" placeholder="Al-Shifa Hospital" />
            <SelectField label="City" options={["Select City", "Gaza City", "Khan Younis", "Rafah", "Beit Lahia", "Jabalia", "Deir al-Balah"]} />
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
 const shellTitle = activeLabel;
  const notificationHref = isAdmin ? "#admin-notifications" : "#donor-notifications";

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userName = user?.full_name || "User";
  const userInitial = userName.charAt(0).toUpperCase();

  const [unreadCount, setUnreadCount] = useState(0);

 useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 3000);
    window.addEventListener("notificationsUpdated", fetchUnreadCount);
    return () => {
      clearInterval(interval);
      window.removeEventListener("notificationsUpdated", fetchUnreadCount);
    };
  }, []);

  async function fetchUnreadCount() {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/notifications", {
        headers: { "Authorization": `Bearer ${token}` },
      });
      const data = await response.json();
      const unread = data.filter((n: any) => !n.is_read).length;
      setUnreadCount(unread);
    } catch {
      console.error("Failed to fetch notifications");
    }
  }

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("user");
    window.location.hash = "";
    window.dispatchEvent(new HashChangeEvent("hashchange"));
  }

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
        <button className="sidebar-exit" type="button" onClick={handleLogout}>
          <Icon name="logout" />Logout
        </button>
      </aside>
      <div className="dashboard-main">
        <header className="dashboard-topbar">
          <h1>{shellTitle}</h1>
          <div className="dashboard-user-area">
            <a className="topbar-notification-link" href={notificationHref} aria-label="Open notifications" style={{ position: "relative" }}>
              <Icon name="bell" />
              {unreadCount > 0 && (
                <span style={{
                  position: "absolute",
                  top: "-6px",
                  right: "-6px",
                  background: "red",
                  color: "white",
                  borderRadius: "50%",
                  width: "18px",
                  height: "18px",
                  fontSize: "11px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}>
                  {unreadCount}
                </span>
              )}
            </a>
            <span className="topbar-divider"></span>
            <div className="dashboard-user-copy">
              <strong>{userName}</strong>
              <span>{isAdmin ? "Facility Admin" : "Donor"}</span>
            </div>
            <span className="avatar">{userInitial}</span>
          </div>
        </header>
        <main className="dashboard-content" aria-label={subtitle}>{children}</main>
      </div>
    </div>
  );
}

function DonorDashboard() {
  const [stats, setStats] = useState({
    totalDonations: 0,
    upcomingAppointments: 0,
    urgentRequests: 0,
    nearbyFacilities: 0,
  });
  const [nextAppointment, setNextAppointment] = useState<any>(null);
  const [urgentNeeds, setUrgentNeeds] = useState<any[]>([]);

  useEffect(() => {
    fetchDonorStats();
  }, []);

  async function fetchDonorStats() {
    try {
      const token = localStorage.getItem("token");

      const [appointmentsRes, requestsRes, banksRes] = await Promise.all([
        fetch("/api/my-appointments", {
          headers: { "Authorization": `Bearer ${token}` },
        }),
        fetch("/api/blood-requests"),
        fetch("/api/blood-banks"),
      ]);

      const appointments = await appointmentsRes.json();
      const requests = await requestsRes.json();
      const banks = await banksRes.json();

      const upcoming = appointments.filter((a: any) => a.status === "accepted" || a.status === "pending");
      const completed = appointments.filter((a: any) => a.status === "completed");
      const urgent = requests.filter((r: any) => r.urgency_level === "urgent");

      setStats({
        totalDonations: completed.length,
        upcomingAppointments: upcoming.length,
        urgentRequests: urgent.length,
        nearbyFacilities: banks.length,
      });

      setNextAppointment(upcoming[0] || null);
      setUrgentNeeds(urgent.slice(0, 3));
    } catch {
      console.error("Failed to fetch donor stats");
    }
  }

  return (
    <>
      <PageTitle title="Welcome back" subtitle="Here is your donation summary." />
      <StatGrid
        stats={[
          ["Total Donations", String(stats.totalDonations), "", "teal", "heart"],
          ["Upcoming Appointments", String(stats.upcomingAppointments), "", "blue", "calendar"],
          ["Urgent Requests Match", String(stats.urgentRequests), "", "red", "warning"],
          ["Nearby Facilities", String(stats.nearbyFacilities), "", "teal", "map"],
        ]}
      />
      <div className="split-grid">
        <Panel title="Next Appointment" subtitle="Your upcoming blood donation appointment">
          {nextAppointment ? (
            <div className="appointment-mini">
              <div>
                <strong>Appointment</strong>
                <span>{nextAppointment.appointment_time?.split("T")[0]}</span>
              </div>
              <div>
                <span className={`status-badge status-${nextAppointment.status}`}>
                  {nextAppointment.status}
                </span>
              </div>
            </div>
          ) : (
            <EmptyState icon="calendar" title="No upcoming appointments" actionHref="#donor-search" actionLabel="Book an Appointment" />
          )}
        </Panel>
        <Panel title="Urgent Needs" subtitle="Facilities needing your blood type immediately">
          {urgentNeeds.length === 0 ? (
            <EmptyState icon="warning" title="No urgent requests at the moment." actionHref="#donor-requests" actionLabel="View Urgent Requests" />
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Blood Type</th>
                    <th>Units</th>
                    <th>Urgency</th>
                  </tr>
                </thead>
                <tbody>
                  {urgentNeeds.map((req: any) => (
                    <tr key={req.id}>
                      <td>{req.blood_type}</td>
                      <td>{req.units_needed}</td>
                      <td>{req.urgency_level}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel>
      </div>
    </>
  );
}
function DonorProfile() {
  const [fullName, setFullName] = useState("");
  const [bloodType, setBloodType] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [gender, setGender] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch("/api/profile", {
      headers: { "Authorization": `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setFullName(data.full_name || "");
        setBloodType(data.blood_type || "");
        setPhone(data.phone || "");
        setCity(data.city || "");
        setGender(data.gender || "");
        setBirthDate(data.birth_date || "");
      })
      .catch(() => console.error("Failed to fetch profile"));
  }, []);

  async function handleSave() {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          full_name: fullName,
          blood_type: bloodType,
          phone: phone,
          city: city,
          gender: gender,
          birth_date: birthDate,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem("user", JSON.stringify(data.user));
        alert("Profile updated successfully!");
      } else {
        alert(data.message || "Failed to update profile");
      }
    } catch {
      alert("Cannot connect to server");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <PageTitle title="My Profile" subtitle="Manage your personal information and preferences." />
      <div className="form-card">
        <div className="form-card-header">
          <h2>Personal Information</h2>
          <p>Keep your details up to date to receive relevant blood requests.</p>
        </div>
        <div className="form-two">
          <Input label="Full Name" placeholder="" value={fullName} onChange={(e) => setFullName(e.target.value)} />
          <SelectField label="Blood Type" options={["Select type", "A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]} value={bloodType} onChange={(e) => setBloodType(e.target.value)} />
        </div>
        <div className="form-two">
          <Input label="Phone Number" placeholder="" value={phone} onChange={(e) => setPhone(e.target.value)} />
          <SelectField label="City" options={["Select City", "Gaza City", "Khan Younis", "Rafah", "Beit Lahia", "Jabalia", "Deir al-Balah"]} value={city} onChange={(e) => setCity(e.target.value)} />
        </div>
        <div className="form-two">
          <SelectField label="Gender" options={["Select gender", "Male", "Female"]} value={gender} onChange={(e) => setGender(e.target.value)} />
          <Input label="Date of Birth" placeholder="" type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} />
        </div>
        <button className="button button-primary" type="button" onClick={handleSave} disabled={loading}>
          {loading ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </>
  );
}function SearchFacilities() {
  const [facilities, setFacilities] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [searchText, setSearchText] = useState("");
  const [bloodType, setBloodType] = useState("");

  useEffect(() => {
    // استقبل بيانات البحث من الهوم
    const savedParams = localStorage.getItem("searchParams");
    if (savedParams) {
      const params = JSON.parse(savedParams);
      if (params.bloodType && params.bloodType !== "Select Blood Type") {
        setBloodType(params.bloodType);
      }
      if (params.city && params.city !== "Select City") {
        setSearchText(params.city);
      }
      localStorage.removeItem("searchParams");
    }

    fetch("/api/blood-banks")
      .then((res) => res.json())
      .then((data) => {
        setFacilities(data);
        setFiltered(data);
      })
      .catch(() => console.error("Failed to fetch facilities"));
  }, []);

  useEffect(() => {
    let results = facilities;
    if (searchText) {
      results = results.filter((f: any) =>
        f.city?.toLowerCase().includes(searchText.toLowerCase()) ||
       f.city?.toLowerCase().includes(searchText.toLowerCase())
      );
    }
    setFiltered(results);
  }, [searchText, bloodType, facilities]);

  return (
    <>
      <PageTitle title="Find Facilities" subtitle="Search for hospitals and blood banks to book an appointment." />
      <div className="search-panel compact">
        <div className="search-input-wrap">
          <svg className="search-input-icon" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7" /><path d="m16 16 5 5" /></svg>
          <input
            type="text"
            placeholder="Search by city or name..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>
        
        <button 
  className="button button-primary search-bar-btn" 
  type="button"
  onClick={() => {
    let results = facilities;
    if (searchText) {
      results = results.filter((f: any) =>
        f.city?.toLowerCase().includes(searchText.toLowerCase()) ||
       f.city?.toLowerCase().includes(searchText.toLowerCase())
      );
    }
    if (bloodType) {
      results = results.filter((f: any) => f.blood_type === bloodType);
    }
    setFiltered(results);
  }}
>
          <Icon name="search" />Search
        </button>
      </div>
      <div className="card-grid">
        {filtered.length === 0 ? (
          <EmptyState icon="building" title="No facilities found." />
        ) : (
          filtered.map((facility: any) => (
            <article className="facility-card" key={facility.id}>
              <div className="facility-type-badge">
                <Icon name="building" />
                <span>{facility.facility_type || "Blood Bank"}</span>
              </div>
              <h3>{facility.name}</h3>
              <div className="facility-meta">
                <p><svg viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>{facility.city}</p>
                <p><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>{facility.phone}</p>
              </div>
              <div className="facility-actions">
                <a 
  className="button button-light full-width" 
  href="#facility-details"
  onClick={() => localStorage.setItem("selectedBankId", facility.id)}
>
  Details
</a>
                <a className="button button-primary full-width" href="#book-appointment">Book <Icon name="chevron" /></a>
              </div>
            </article>
          ))
        )}
      </div>
    </>
  );
}
function FacilityDetails() {
  const [bank, setBank] = useState<any>(null);
  const [slots, setSlots] = useState<any[]>([]);
  const [urgentRequests, setUrgentRequests] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/blood-banks")
      .then((res) => res.json())
      .then((data) => {
        const bankId = localStorage.getItem("selectedBankId");
        const selected = bankId 
          ? data.find((b: any) => b.id === parseInt(bankId)) || data[0]
          : data[0];
        setBank(selected || null);
      });

    fetch("/api/slots")
      .then((res) => res.json())
      .then((data) => {
        const bankId = localStorage.getItem("selectedBankId");
        const filtered = bankId 
          ? data.filter((s: any) => s.bank_id === parseInt(bankId))
          : data;
        setSlots(filtered);
      });

    fetch("/api/blood-requests")
      .then((res) => res.json())
      .then((data) => setUrgentRequests(data.filter((r: any) => r.urgency_level === "urgent")));
  }, []);

  if (!bank) return <EmptyState icon="building" title="Loading..." />;

  return (
    <>
      <nav className="detail-breadcrumb" aria-label="Breadcrumb">
        <a href="#donor-search">Facilities</a>
        <span aria-hidden="true">&gt;</span>
        <span>{bank.name}</span>
      </nav>

      <div className="detail-info-card">
        <div className="detail-info-top">
          <div className="facility-type-badge">
            <Icon name="building" />
            <span>Blood Bank</span>
          </div>
          <StatusBadge tone="normal">Accepting Donors</StatusBadge>
        </div>
        <h2 className="detail-facility-name">{bank.name}</h2>

        <div className="detail-contact-grid">
          <div className="detail-contact-item">
            <div className="detail-contact-icon">
              <svg viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
            </div>
            <div>
              <strong>Address</strong>
              <p>{bank.address}</p>
              <p>{bank.city}</p>
            </div>
          </div>
          <div className="detail-contact-item">
            <div className="detail-contact-icon">
              <svg viewBox="0 0 24 24"><path d="M22 16.9v3a2 2 0 0 1-2.2 2A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.6a2 2 0 0 1-.4 2.1L8 9.7a16 16 0 0 0 6.3 6.3l1.3-1.3a2 2 0 0 1 2.1-.4c.8.3 1.7.5 2.6.7a2 2 0 0 1 1.7 2z" /></svg>
            </div>
            <div>
              <strong>Contact</strong>
              <p>{bank.phone}</p>
            </div>
          </div>
        </div>

        {urgentRequests.length > 0 && (
          <div className="detail-blood-needs">
            <p className="detail-blood-label">
              <span className="red-dot" aria-hidden="true"></span>
              Urgently Needed Blood Types
            </p>
            <div className="detail-blood-badges">
              {[...new Set(urgentRequests.map((r: any) => r.blood_type))].map((type: any) => (
                <span className="blood-badge" key={type}>{type}</span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="detail-slots-card">
        <div className="detail-slots-header">
          <Icon name="calendar" />
          <h2>Available Donation Slots</h2>
        </div>
        {slots.length === 0 ? (
          <EmptyState icon="calendar" title="No slots available." />
        ) : (
          slots.map((slot: any) => {
            const availableSeats = slot.max_capacity - slot.current_capacity;
            const isFull = availableSeats <= 0;
            return (
              <div className="detail-slot-row" key={slot.id}>
                <div className="detail-slot-date-box">
                  <span className="detail-slot-day">{new Date(slot.slot_date).toLocaleDateString('en', {weekday: 'short'}).toUpperCase()}</span>
                  <span className="detail-slot-num">{new Date(slot.slot_date).getDate()}</span>
                </div>
                <div className="detail-slot-time">
                  <strong>{slot.start_time} - {slot.end_time}</strong>
                  <span>{isFull ? "Fully Booked" : `${availableSeats} seats available`}</span>
                </div>
                <a className={`button ${isFull ? "button-secondary" : "button-primary"} small`} href="#book-appointment">
                  {isFull ? "Full" : "Book"}
                </a>
              </div>
            );
          })
        )}
        <a className="button button-primary full-width detail-book-main" href="#book-appointment">Book Appointment</a>
      </div>
    </>
  );
}
function BookAppointment() {
  const [slots, setSlots] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [booked, setBooked] = useState<number[]>([]);

  useEffect(() => {
    fetchSlots();
  }, []);

  async function fetchSlots() {
    try {
      const response = await fetch("/api/slots");
      const data = await response.json();
      setSlots(data);
    } catch {
      console.error("Failed to fetch slots");
    }
  }

  async function handleBook(slotId: number) {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ slot_id: slotId }),
      });
      const data = await response.json();
      if (response.ok) {
        setBooked([...booked, slotId]);
        fetchSlots();
        alert("Appointment booked successfully!");
      } else {
        alert(data.message || "Failed to book appointment");
      }
    } catch {
      alert("Cannot connect to server");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <PageTitle title="Book Appointment" subtitle="Select a date and time to schedule your blood donation." />

      {slots.length === 0 ? (
        <EmptyState icon="calendar" title="No slots available." text="Check back later for available donation slots." />
      ) : (
        <div className="booking-slots-grid">
          {slots.map((slot: any) => {
            const availableSpots = slot.max_capacity - slot.current_capacity;
            const isFull = availableSpots <= 0;

            return (
              <article className="booking-slot-card" key={slot.id}>
                <div className="booking-slot-top">
                  <div className="booking-slot-date">
                    <Icon name="calendar" />
                    <strong>{slot.slot_date}</strong>
                  </div>
                  <StatusBadge tone={isFull ? "urgent" : "normal"}>
                    {isFull ? "Full" : "Available"}
                  </StatusBadge>
                </div>
                <div className="booking-slot-meta">
                  <p><Icon name="clock" />{slot.start_time} - {slot.end_time}</p>
                  <p><Icon name="user" />
                    {isFull ? "No spots available" : `${availableSpots} spots left`}
                  </p>
                </div>
                <button
                  className="button button-primary full-width"
                  type="button"
                  onClick={() => handleBook(slot.id)}
                  disabled={loading || booked.includes(slot.id) || isFull}
                >
                  {booked.includes(slot.id) ? "Booked ✓" : isFull ? "Fully Booked" : "Confirm Booking"}
                </button>
              </article>
            );
          })}
        </div>
      )}
    </>
  );
}
function MyAppointments() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [banks, setBanks] = useState<any[]>([]);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchMyAppointments();
    fetch("/api/blood-banks")
      .then((res) => res.json())
      .then((data) => setBanks(data));
  }, []);

  async function fetchMyAppointments() {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/my-appointments", {
        headers: { "Authorization": `Bearer ${token}` },
      });
      const data = await response.json();
      setAppointments(data);
    } catch {
      console.error("Failed to fetch appointments");
    }
  }

  function getBankName(bankId: number) {
    const bank = banks.find((b: any) => b.id === bankId);
    return bank ? bank.name : "—";
  }

  function formatDate(dateString: string) {
    if (!dateString) return "—";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  const filtered = filter === "all" ? appointments : appointments.filter((a) => a.status === filter);

  return (
    <>
      <div className="page-title-row">
        <PageTitle title="My Appointments" subtitle="Manage your past and upcoming donation appointments." />
        <label className="appointments-filter">
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">All Appointments</option>
            <option value="pending">Pending</option>
            <option value="accepted">Accepted</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </label>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon="calendar" title="No appointments found" text="You haven't made any appointments yet." />
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Blood Bank</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((apt: any) => (
                <tr key={apt.id}>
                  <td>{formatDate(apt.appointment_time)}</td>
                  <td>{getBankName(apt.blood_bank_id)}</td>
                  <td>
                    <span className={`status-badge status-${apt.status}`}>
                      {apt.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
function DonorUrgentRequests() {
  const [requests, setRequests] = useState<any[]>([]);
  const [banks, setBanks] = useState<any[]>([]);
  const [bloodType, setBloodType] = useState("");

  const compatibility: Record<string, string[]> = {
    "O-":  ["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"],
    "O+":  ["O+", "A+", "B+", "AB+"],
    "A-":  ["A-", "A+", "AB-", "AB+"],
    "A+":  ["A+", "AB+"],
    "B-":  ["B-", "B+", "AB-", "AB+"],
    "B+":  ["B+", "AB+"],
    "AB-": ["AB-", "AB+"],
    "AB+": ["AB+"],
  };

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (user.blood_type) {
      setBloodType(user.blood_type);
    }

    Promise.all([
      fetch("/api/blood-requests").then((res) => res.json()),
      fetch("/api/blood-banks").then((res) => res.json()),
    ])
      .then(([requestsData, banksData]) => {
        setRequests(requestsData);
        setBanks(banksData);
      })
      .catch(() => console.error("Failed to fetch"));
  }, []);

  function getBankName(bankId: number) {
    const bank = banks.find((b: any) => b.id === bankId);
    return bank ? bank.name : "—";
  }

  const filtered = bloodType && compatibility[bloodType]
    ? requests.filter((r: any) => compatibility[bloodType].includes(r.blood_type))
    : requests;

  return (
    <>
      <PageTitle title="Urgent Requests" subtitle="Critical blood shortages that match your blood type." />
      <div className="search-panel compact" style={{ marginBottom: "24px" }}>
        <label className="search-select-wrap">
          <select value={bloodType} onChange={(e) => setBloodType(e.target.value)}>
            <option value="">Select your blood type to see who you can help</option>
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
      </div>
      {filtered.length === 0 ? (
        <EmptyState icon="warning" title="No urgent requests match your blood type." />
      ) : (
        <div className="request-grid-legacy dashboard-requests">
          {filtered.map((request: any, index: number) => (
            <RequestCard
              key={request.id}
              request={{
                ...request,
                bloodType: request.blood_type,
                facility: getBankName(request.bank_id),
                status: request.urgency_level === "urgent" ? "urgent" : "normal",
              }}
              index={index}
            />
          ))}
        </div>
      )}
    </>
  );
}
function AdminDashboard() {
  const [stats, setStats] = useState({
    pendingAppointments: 0,
    acceptedAppointments: 0,
    availableSlots: 0,
    totalUnits: 0,
    urgentRequests: 0,
    lowStockTypes: 0,
  });
  const [recentAppointments, setRecentAppointments] = useState<any[]>([]);
  const [bloodTypeStats, setBloodTypeStats] = useState<any[]>([]);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 10000);
    return () => clearInterval(interval);
  }, []);

  async function fetchStats() {
    try {
      const [appointmentsRes, slotsRes, inventoryRes, requestsRes] = await Promise.all([
        fetch("/api/appointments"),
        fetch("/api/slots"),
        fetch("/api/inventory"),
        fetch("/api/blood-requests"),
      ]);

      const appointments = await appointmentsRes.json();
      const slots = await slotsRes.json();
      const inventory = await inventoryRes.json();
      const requests = await requestsRes.json();

      // تجميع الوحدات لكل فصيلة دم
      const bloodTypes: any = {};
      inventory.forEach((item: any) => {
        if (!bloodTypes[item.blood_type]) {
          bloodTypes[item.blood_type] = 0;
        }
        bloodTypes[item.blood_type] += item.units;
      });

      const bloodTypeArray = Object.entries(bloodTypes).map(([type, units]) => ({
        blood_type: type,
        units: units as number,
      }));

      const lowStockItems = bloodTypeArray.filter((item) => item.units < 5);

      setStats({
        pendingAppointments: appointments.filter((a: any) => a.status === "pending").length,
        acceptedAppointments: appointments.filter((a: any) => a.status === "accepted").length,
        availableSlots: slots.length,
        totalUnits: inventory.reduce((sum: number, item: any) => sum + item.units, 0),
        urgentRequests: requests.filter((r: any) => r.urgency_level === "urgent").length,
        lowStockTypes: lowStockItems.length,
      });

      setRecentAppointments(appointments.slice(0, 3));
      setBloodTypeStats(bloodTypeArray);
    } catch {
      console.error("Failed to fetch stats");
    }
  }

  return (
    <>
      <PageTitle title="Facility Overview" subtitle="Monitor inventory and appointments." />
      <StatGrid
        stats={[
          ["Pending Apps.", String(stats.pendingAppointments), "", "yellow", "calendar"],
          ["Accepted Apps.", String(stats.acceptedAppointments), "", "green", "calendar"],
          ["Available Slots", String(stats.availableSlots), "", "teal", "user"],
          ["Total Units", String(stats.totalUnits), "", "blue", "grid"],
          ["Urgent Requests", String(stats.urgentRequests), "", "red", "warning"],
          ["Low Stock Types", String(stats.lowStockTypes), "", "yellow", "drop"],
        ]}
      />
      <div className="split-grid">
        <Panel title="Recent Appointments">
          {recentAppointments.length === 0 ? (
            <EmptyState title="No recent appointments found." />
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Donor</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentAppointments.map((apt: any) => (
                    <tr key={apt.id}>
                      <td>{apt.user?.full_name || "—"}</td>
                      <td>{apt.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel>
        <Panel title="Blood Inventory by Type">
          {bloodTypeStats.length === 0 ? (
            <EmptyState icon="drop" title="No inventory found." />
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Blood Type</th>
                    <th>Total Units</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {bloodTypeStats.map((item: any) => (
                    <tr key={item.blood_type}>
                      <td><strong>{item.blood_type}</strong></td>
                      <td>{item.units}</td>
                      <td>
                        <span className={`status-badge status-${item.units < 5 ? "urgent" : "normal"}`}>
                          {item.units < 5 ? "Low Stock" : "OK"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel>
      </div>
    </>
  );
}
function AdminProfile() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const [bank, setBank] = useState<any>({});
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [facilityType, setFacilityType] = useState("Hospital");
  const [workingHours, setWorkingHours] = useState("");
  const [operationalStatus, setOperationalStatus] = useState("active");
  const [loading, setLoading] = useState(false);

useEffect(() => {
    const token = localStorage.getItem("token");
    fetch("/api/admin/blood-banks", {
      headers: { "Authorization": `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        const b = data[0] || {};
        setBank(b);
        setName(b.name || "");
        setCity(b.city || "");
        setPhone(b.phone || "");
        setAddress(b.address || "");
        setFacilityType(b.facility_type || "Hospital");
        setWorkingHours(b.working_hours || "");
        setOperationalStatus(b.operational_status || "active");
      })
      .catch(() => console.error("Failed to fetch bank"));
  }, []);

  async function handleSave() {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");

      let response;
      if (bank.id) {
        response = await fetch(`/api/blood-banks/${bank.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
          body: JSON.stringify({ name, city, phone, address, facility_type: facilityType, working_hours: workingHours, operational_status: operationalStatus }),
        });
      } else {
        response = await fetch(`/api/blood-banks`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
          body: JSON.stringify({ name, city, phone, address, facility_type: facilityType, working_hours: workingHours, operational_status: operationalStatus }),
        });
      }

      const data = await response.json();
      if (response.ok) {
        setBank(data);
        setName(data.name || "");
        setCity(data.city || "");
        setPhone(data.phone || "");
        setAddress(data.address || "");
        setFacilityType(data.facility_type || "Hospital");
        setWorkingHours(data.working_hours || "");
        setOperationalStatus(data.operational_status || "active");
        alert("Profile updated successfully!");
      } else {
        alert(data.message || "Failed to update");
      }
    } catch {
      alert("Cannot connect to server");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <PageTitle title="Facility Profile" subtitle="Manage your facility's public information." />
      <div className="form-card">
        <div className="form-card-header">
          <h2>{name || "Facility Details"}</h2>
          <p>This information is visible to donors searching for locations.</p>
        </div>
        <div className="form-two">
          <Input label="Facility Name" placeholder="" value={name} onChange={(e) => setName(e.target.value)} />
          <SelectField label="Facility Type" options={["Hospital", "Blood Bank", "Clinic"]} value={facilityType} onChange={(e) => setFacilityType(e.target.value)} />
        </div>
        <div className="form-two">
          <Input label="City" placeholder="" value={city} onChange={(e) => setCity(e.target.value)} />
          <Input label="Public Phone" placeholder="" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>
        <Input label="Full Address" placeholder="" value={address} onChange={(e) => setAddress(e.target.value)} />
        <div className="form-two">
          <Input label="Contact Person (Internal)" placeholder="" defaultValue={user.full_name || ""} />
          <Input label="Working Hours" placeholder="e.g. Mon-Fri 8AM-4PM" value={workingHours} onChange={(e) => setWorkingHours(e.target.value)} />
        </div>
        <SelectField label="Operational Status" options={["active", "inactive", "maintenance"]} value={operationalStatus} onChange={(e) => setOperationalStatus(e.target.value)} />
        <p className="form-hint">Inactive facilities will not appear in donor searches.</p>
        <button className="button button-primary" type="button" onClick={handleSave} disabled={loading}>
          {loading ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </>
  );
}
function ManageSlots() {
  const [showModal, setShowModal] = useState(false);
  const [slots, setSlots] = useState<any[]>([]);
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [capacity, setCapacity] = useState("5");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSlots();
  }, []);

  async function fetchSlots() {
    try {
      const response = await fetch("/api/slots");
      const data = await response.json();
      setSlots(data);
    } catch {
      console.error("Failed to fetch slots");
    }
  }

  async function handleCreateSlot() {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/slots", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          bank_id: 1,
          slot_date: date,
          start_time: startTime,
          end_time: endTime,
          max_capacity: parseInt(capacity),
        }),
      });
      const data = await response.json();
      if (response.ok) {
        setShowModal(false);
        fetchSlots();
      } else {
        alert(data.message || "Failed to create slot");
      }
    } catch {
      alert("Cannot connect to server");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="page-title-row">
        <PageTitle title="Donation Slots" subtitle="Manage your facility's available appointment times." />
        <button className="button button-primary" type="button" onClick={() => setShowModal(true)}>
          <Icon name="plus" />Create Slot
        </button>
      </div>

      {slots.length === 0 ? (
        <EmptyState icon="calendar" title="No slots configured." />
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Start Time</th>
                <th>End Time</th>
                <th>Capacity</th>
              </tr>
            </thead>
            <tbody>
              {slots.map((slot: any) => (
                <tr key={slot.id}>
                  <td>{slot.slot_date}</td>
                  <td>{slot.start_time}</td>
                  <td>{slot.end_time}</td>
                  <td>{slot.max_capacity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-card" onClick={(e: MouseEvent) => e.stopPropagation()}>
            <div className="modal-header">
              <Icon name="calendar" />
              <h3>Create New Donation Slot</h3>
              <button className="modal-close" type="button" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <Input label="Date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            <Input label="Start Time" type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
            <Input label="End Time" type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
            <Input label="Capacity" placeholder="5" value={capacity} onChange={(e) => setCapacity(e.target.value)} />
            <button className="button button-primary full-width" type="button" onClick={handleCreateSlot} disabled={loading}>
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
function ManageAppointments() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [filter, setFilter] = useState("all");
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [selectedApt, setSelectedApt] = useState<any>(null);
  const [units, setUnits] = useState("1");

  useEffect(() => {
    fetchAppointments();
  }, []);

  async function fetchAppointments() {
    try {
      const response = await fetch("/api/appointments");
      const data = await response.json();
      setAppointments(data);
    } catch {
      console.error("Failed to fetch appointments");
    }
  }
async function updateStatus(id: number, status: string, donationUnits?: number) {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/appointments/${id}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ status, units: donationUnits }),
      });
      if (response.ok) {
        fetchAppointments();
        setShowCompleteModal(false);
      } else {
        alert("Failed to update status");
      }
    } catch {
      alert("Cannot connect to server");
    }
  }
  function handleCompleteClick(apt: any) {
    setSelectedApt(apt);
    setUnits("1");
    setShowCompleteModal(true);
  }

  const filtered = filter === "all" ? appointments : appointments.filter((a) => a.status === filter);

  return (
    <>
      <div className="page-title-row">
        <PageTitle title="Appointments" subtitle="Manage incoming donor appointments." />
        <label className="appointments-filter">
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">All Appointments</option>
            <option value="pending">Pending</option>
            <option value="accepted">Accepted</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </label>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon="calendar" title="No appointments found." />
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Donor</th>
                <th>Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((apt: any) => (
                <tr key={apt.id}>
                  <td>{apt.user?.full_name || "—"}</td>
                  <td>{apt.created_at?.split("T")[0]}</td>
                  <td>{apt.status}</td>
                  <td>
                    {apt.status === "pending" && (
                      <>
                        <button className="button button-primary small" type="button" onClick={() => updateStatus(apt.id, "accepted")}>Accept</button>
                        {" "}
                        <button className="button button-secondary small" type="button" onClick={() => updateStatus(apt.id, "cancelled")}>Reject</button>
                      </>
                    )}
                    {apt.status === "accepted" && (
                      <>
                        <button className="button button-primary small" type="button" onClick={() => handleCompleteClick(apt)}>Complete</button>
                        {" "}
                        <button className="button button-secondary small" type="button" onClick={() => updateStatus(apt.id, "cancelled")}>Cancel</button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showCompleteModal && (
        <div className="modal-overlay" onClick={() => setShowCompleteModal(false)}>
          <div className="modal-card" onClick={(e: MouseEvent) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Complete Donation</h3>
              <button className="modal-close" type="button" onClick={() => setShowCompleteModal(false)}>&times;</button>
            </div>
            <p>Donor: <strong>{selectedApt?.user?.full_name}</strong></p>
            <Input
              label="Units Donated"
              type="number"
              value={units}
              onChange={(e) => setUnits(e.target.value)}
            />
            <button
              className="button button-primary full-width"
              type="button"
              onClick={() => updateStatus(selectedApt.id, "completed", parseInt(units))}
            >
              Confirm Complete
            </button>
          </div>
        </div>
      
      )}
    </>
  );
}
function ManageInventory() {
  const [showModal, setShowModal] = useState(false);
  const [inventory, setInventory] = useState<any[]>([]);
  const [bloodType, setBloodType] = useState("A+");
  const [quantity, setQuantity] = useState("1");
  const [expirationDate, setExpirationDate] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchInventory();
  }, []);

  async function fetchInventory() {
    try {
      const response = await fetch("/api/inventory");
      const data = await response.json();
      setInventory(data);
    } catch {
      console.error("Failed to fetch inventory");
    }
  }

  async function handleAddStock() {
    if (!expirationDate) {
      alert("Please enter expiration date");
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/inventory", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          blood_type: bloodType,
          units: parseInt(quantity),
          expiration_date: expirationDate,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        setShowModal(false);
        fetchInventory();
      } else {
        alert(data.message || "Failed to add stock");
      }
    } catch {
      alert("Cannot connect to server");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="page-title-row">
        <PageTitle title="Blood Inventory" subtitle="Manage your facility's current blood stock." />
        <button className="button button-primary" type="button" onClick={() => setShowModal(true)}>
          <Icon name="plus" />Add Stock
        </button>
      </div>

      <Panel title="Inventory Items">
        {inventory.length === 0 ? (
          <EmptyState icon="drop" title="No inventory items found." />
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Blood Type</th>
                  <th>Units</th>
                  <th>Expiration Date</th>
                </tr>
              </thead>
              <tbody>
                {inventory.map((item: any) => (
                  <tr key={item.id}>
                    <td>{item.blood_type}</td>
                    <td>{item.units}</td>
                    <td>{item.expiration_date || "N/A"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-card" onClick={(e: MouseEvent) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add Inventory Item</h3>
              <button className="modal-close" type="button" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <SelectField label="Blood Type" options={["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]} onChange={(e) => setBloodType(e.target.value)} />
            <Input label="Quantity (Units)" placeholder="0" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
            <Input label="Expiration Date *" type="date" value={expirationDate} onChange={(e) => setExpirationDate(e.target.value)} />
            <button className="button button-primary full-width" type="button" onClick={handleAddStock} disabled={loading}>
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
function ManageRequests() {
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showFulfillModal, setShowFulfillModal] = useState(false);
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [patientName, setPatientName] = useState("");
  const [bloodType, setBloodType] = useState("A+");
  const [units, setUnits] = useState("1");
  const [urgency, setUrgency] = useState("normal");
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [unitsGiven, setUnitsGiven] = useState("1");

  useEffect(() => {
    fetchRequests();
  }, []);

  async function fetchRequests() {
    try {
      const response = await fetch("/api/blood-requests");
      const data = await response.json();
      setRequests(data);
    } catch {
      console.error("Failed to fetch requests");
    }
  }
async function handleCreateRequest() {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      
      const banksRes = await fetch("/api/blood-banks");
      const banks = await banksRes.json();
      const bankId = banks[0]?.id || 1;

      const response = await fetch("/api/blood-requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          bank_id: bankId,
          blood_type: bloodType,
          units_needed: parseInt(units),
          urgency_level: urgency,
          patient_name: patientName,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        setShowModal(false);
        setPatientName("");
        setUnits("1");
        fetchRequests();
      } else {
        alert(data.message || "Failed to create request");
      }
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleEditRequest() {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/blood-requests/${selectedRequest.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          blood_type: bloodType,
          units_needed: parseInt(units),
          urgency_level: urgency,
          patient_name: patientName,
        }),
      });
      if (response.ok) {
        setShowEditModal(false);
        fetchRequests();
      } else {
        alert("Failed to update request");
      }
    } catch {
      alert("Cannot connect to server");
    } finally {
      setLoading(false);
    }
  }  async function handleDeleteRequest(id: number) {
    if (!confirm("Are you sure you want to delete this request?")) return;
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/blood-requests/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` },
      });
      if (response.ok) {
        fetchRequests();
      } else {
        alert("Failed to delete request");
      }
    } catch {
      alert("Cannot connect to server");
    }
  }

  async function handleFulfill() {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/blood-requests/${selectedRequest.id}/fulfill`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ units_given: parseInt(unitsGiven) }),
      });
      const data = await response.json();
      if (response.ok) {
        setShowFulfillModal(false);
        fetchRequests();
        alert("Request fulfilled successfully!");
      } else {
        alert(data.message || "Failed to fulfill request");
      }
    } catch {
      alert("Cannot connect to server");
    } finally {
      setLoading(false);
    }
  }

  function handleEditClick(req: any) {
    setSelectedRequest(req);
    setPatientName(req.patient_name || "");
    setBloodType(req.blood_type);
    setUnits(String(req.units_needed));
    setUrgency(req.urgency_level);
    setShowEditModal(true);
  }

  function handleFulfillClick(req: any) {
    setSelectedRequest(req);
    setUnitsGiven("1");
    setShowFulfillModal(true);
  }

  return (
    <>
      <div className="page-title-row">
        <PageTitle title="Blood Requests" subtitle="Manage your facility's active blood requests." />
        <button className="button button-primary" type="button" onClick={() => setShowModal(true)}>
          <Icon name="plus" />New Request
        </button>
      </div>

      {requests.length === 0 ? (
        <EmptyState icon="file" title="No blood requests created." />
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Patient</th>
                <th>Blood Type</th>
                <th>Units Needed</th>
                <th>Urgency</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((req: any) => (
                <tr key={req.id}>
                  <td>{req.patient_name || "—"}</td>
                  <td>{req.blood_type}</td>
                  <td>{req.units_needed}</td>
                  <td>{req.urgency_level}</td>
                  <td>{req.status}</td>
                  <td>
                    {req.status !== "fulfilled" && (
                      <>
                        <button className="button button-primary small" type="button" onClick={() => handleFulfillClick(req)}>Fulfill</button>
                        {" "}
                        <button className="button button-secondary small" type="button" onClick={() => handleEditClick(req)}>Edit</button>
                        {" "}
                      </>
                    )}
                    <button className="button button-secondary small" type="button" onClick={() => handleDeleteRequest(req.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-card" onClick={(e: MouseEvent) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Create Blood Request</h3>
              <button className="modal-close" type="button" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <Input label="Patient/Case Name" placeholder="Internal Ref or Name" value={patientName} onChange={(e) => setPatientName(e.target.value)} />
            <div className="form-two">
              <SelectField label="Blood Type" options={["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]} onChange={(e) => setBloodType(e.target.value)} />
              <Input label="Units Needed" placeholder="1" value={units} onChange={(e) => setUnits(e.target.value)} />
            </div>
            <SelectField label="Urgency Level" options={["normal", "urgent", "critical"]} onChange={(e) => setUrgency(e.target.value)} />
            <button className="button button-primary full-width" type="button" onClick={handleCreateRequest} disabled={loading}>
              {loading ? "Publishing..." : "Publish Request"}
            </button>
          </div>
        </div>
      )}

      {showEditModal && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-card" onClick={(e: MouseEvent) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Edit Blood Request</h3>
              <button className="modal-close" type="button" onClick={() => setShowEditModal(false)}>&times;</button>
            </div>
            <Input label="Patient/Case Name" placeholder="Internal Ref or Name" value={patientName} onChange={(e) => setPatientName(e.target.value)} />
            <div className="form-two">
              <SelectField label="Blood Type" options={["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]} value={bloodType} onChange={(e) => setBloodType(e.target.value)} />
              <Input label="Units Needed" placeholder="1" value={units} onChange={(e) => setUnits(e.target.value)} />
            </div>
            <SelectField label="Urgency Level" options={["normal", "urgent", "critical"]} value={urgency} onChange={(e) => setUrgency(e.target.value)} />
            <button className="button button-primary full-width" type="button" onClick={handleEditRequest} disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      )}

      {showFulfillModal && (
        <div className="modal-overlay" onClick={() => setShowFulfillModal(false)}>
          <div className="modal-card" onClick={(e: MouseEvent) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Fulfill Blood Request</h3>
              <button className="modal-close" type="button" onClick={() => setShowFulfillModal(false)}>&times;</button>
            </div>
            <p>Patient: <strong>{selectedRequest?.patient_name || "—"}</strong></p>
            <p>Blood Type: <strong>{selectedRequest?.blood_type}</strong></p>
            <p>Units Needed: <strong>{selectedRequest?.units_needed}</strong></p>
            <Input
              label="Units Given to Patient"
              type="number"
              value={unitsGiven}
              onChange={(e) => setUnitsGiven(e.target.value)}
            />
            <button className="button button-primary full-width" type="button" onClick={handleFulfill} disabled={loading}>
              {loading ? "Processing..." : "Confirm Fulfill"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    fetchNotifications();
  }, []);

  async function fetchNotifications() {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/notifications", {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setNotifications(data);
    } catch {
      console.error("Failed to fetch notifications");
    }
  }

  async function markAsRead(id: number) {
    try {
      const token = localStorage.getItem("token");
      await fetch(`/api/notifications/${id}/read`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });
      fetchNotifications();
      window.dispatchEvent(new Event("notificationsUpdated"));
    } catch {
      console.error("Failed to mark as read");
    }
  }

  return (
    <section className="notifications-page">
      <PageTitle title="Notifications" subtitle="Stay updated on your account activity." />
      {notifications.length === 0 ? (
        <EmptyState icon="bell" title="No notifications" text="You're all caught up!" />
      ) : (
        <div className="notifications-list">
          {notifications.map((notif: any) => (
            <div key={notif.id} className={`notification-item ${notif.is_read ? "" : "unread"}`}>
              <div className="notification-content">
                <strong>{notif.title}</strong>
                <p>{notif.message}</p>
                <span>{notif.created_at?.split("T")[0]}</span>
              </div>
              {!notif.is_read && (
                <button className="button button-primary small" type="button" onClick={() => markAsRead(notif.id)}>
                  Mark as Read
                </button>
              )}
            </div>
          ))}
        </div>
      )}
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

function RequestCard({ request, admin = false, index = 0 }: { request: any; admin?: boolean; index?: number }) {
  const typeChar = request.bloodType.replace(/[+-]/g, '');
  const typeSign = request.bloodType.includes('+') ? '+' : '−';
  const isUrgent = request.status === 'urgent';

  function timeAgo(dateString: string) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diff < 60) return `${diff} seconds ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    return `${Math.floor(diff / 86400)} days ago`;
  }

  return (
    <article className={`request-card-legacy ${isUrgent ? 'request-card-legacy--urgent' : 'request-card-legacy--normal'}`}>
      <div className="legacy-blood-circle">
        {typeSign}{typeChar}
      </div>
      <div className="legacy-meta-row">
        <span className="legacy-time">{request.created_at ? timeAgo(request.created_at) : "—"}</span>
        {isUrgent && <span className="legacy-urgency legacy-urgency-red">URGENT</span>}
      </div>
      <div className="legacy-location">
        <svg viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
        {request.facility || "—"}
      </div>
      <a href={admin ? "#admin-requests" : (localStorage.getItem("token") ? "#book-appointment" : "#login")} className={`legacy-help-btn ${index === 0 ? 'legacy-btn-filled' : 'legacy-btn-outline'}`}>
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

function AppointmentMini({ item, admin = false }: { item: any; admin?: boolean }) {
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

function RequestMini({ request }: { request: any }) {
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
function SelectField({ label, options, onChange, value }: { label: string; options: string[]; onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void; value?: string }) {
  return (
    <label className="field">
      <span>{label}</span>
      <select onChange={onChange} value={value}>
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
