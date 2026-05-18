import { useEffect, useState } from "react";
import {
  CommunityCta,
  HomeAbout,
  HomeHero,
  HomeHowItWorks,
  HomeQuickSearch,
  HomeUrgentPreview,
} from "./components/HomeHero";
import { AboutPage } from "./pages/AboutPage";
import { DonorSearchPage } from "./pages/DonorSearchPage";
import { LoginPage } from "./pages/LoginPage";
import { RequestsPage } from "./pages/RequestsPage";

const navItems = [
  { id: "home", href: "#top", label: "Home" },
  { id: "about", href: "#about", label: "About Us" },
  { id: "find-donor", href: "#find-donor", label: "Find Donors" },
  { id: "urgent-requests", href: "#urgent-requests", label: "Urgent Requests" },
  { id: "contact", href: "#contact", label: "Conact" },
];

function App() {
  const [activeSection, setActiveSection] = useState("home");
  const [isHeroNav, setIsHeroNav] = useState(true);
  const [currentHash, setCurrentHash] = useState(() => window.location.hash);

  const isLoginView = currentHash === "#login";
  const isAboutView = currentHash === "#about";

  useEffect(() => {
    function syncNavigation() {
      setCurrentHash(window.location.hash);
      const scrollPosition = window.scrollY + 150;
      const sections = [
        { id: "home", element: document.getElementById("top") },
        { id: "about", element: document.getElementById("about") ?? document.getElementById("about-preview") },
        { id: "find-donor", element: document.getElementById("find-donor") },
        { id: "urgent-requests", element: document.getElementById("urgent-requests") },
        { id: "contact", element: document.getElementById("contact") },
      ];

      const current = sections.reduce((matched, section) => {
        if (section.element && section.element.offsetTop <= scrollPosition) {
          return section.id;
        }
        return matched;
      }, "home");

      const heroHeight = document.querySelector<HTMLElement>(".home-hero, .login-hero")?.offsetHeight ?? 0;

      setActiveSection(current);
      setIsHeroNav(window.scrollY < Math.max(120, heroHeight - 140));
    }

    syncNavigation();
    window.addEventListener("scroll", syncNavigation, { passive: true });
    window.addEventListener("hashchange", syncNavigation);
    window.setTimeout(syncNavigation, 0);

    return () => {
      window.removeEventListener("scroll", syncNavigation);
      window.removeEventListener("hashchange", syncNavigation);
    };
  }, []);

  useEffect(() => {
    if (!currentHash || isLoginView || isAboutView) {
      return;
    }

    window.setTimeout(() => {
      if (currentHash === "#top") {
        window.scrollTo({ top: 0 });
        return;
      }

      document.querySelector<HTMLElement>(currentHash)?.scrollIntoView({ block: "start" });
    }, 0);
  }, [currentHash, isAboutView, isLoginView]);

  return (
    <div className="app">
      <header className={`top-nav ${isAboutView || !isHeroNav ? "top-nav--solid" : "top-nav--hero"}`}>
        <a className="brand" href="#top" aria-label="Smart Blood Management System home">
          <img src="/sbms-logo.svg" alt="SBMS logo" />
        </a>
        <nav aria-label="Main navigation">
          {navItems.map((item) => (
            <a className={(isAboutView ? "about" : activeSection) === item.id ? "is-active" : ""} href={item.href} key={item.id}>
              {item.label}
            </a>
          ))}
        </nav>
        <a className="nav-cta" href="#login">
          Become a Donor
        </a>
      </header>

      <main id="top">
        {isLoginView ? (
          <LoginPage />
        ) : isAboutView ? (
          <AboutPage />
        ) : (
          <>
            <HomeHero />
            <HomeQuickSearch />
            <HomeAbout />
            <HomeHowItWorks />
            <HomeUrgentPreview />
            <DonorSearchPage />
            <RequestsPage />
            <CommunityCta />
          </>
        )}
      </main>

      <footer className="site-footer" id="contact">
        <div className="footer-inner">
          <div className="footer-brand">
            <div className="footer-logo">
              <img src="/sbms-logo.svg" alt="SBMS logo" />
            </div>
            <p className="footer-tagline">Smart Blood Management System</p>
            <p className="footer-desc">
              Smart Blood Bank is a digital platform dedicated to solving the blood shortage crisis. We connect voluntary donors with those in urgent need through a smart, fast, and secure management system.
            </p>
          </div>

          <div className="footer-contact">
            <h3>Contact Us</h3>
            <form className="footer-form" onSubmit={(event) => event.preventDefault()}>
              <div className="footer-form-row">
                <input type="text" placeholder="Enter Name" />
                <input type="email" placeholder="Enter Email" />
              </div>
              <textarea placeholder="Enter your message" rows={3} />
              <button className="footer-submit" type="submit">Search</button>
            </form>
          </div>
        </div>

        <nav className="footer-links" aria-label="Footer navigation">
          <a href="#top">Home</a>
          <a href="#about">About Us</a>
          <a href="#find-donor">Find Donors</a>
          <a href="#urgent-requests">Urgent Requests</a>
          <a href="#terms">Terms & Conditions</a>
          <a href="#privacy">Privacy Policy</a>
        </nav>

        <p className="footer-copy">Copyright @ 2026 Heba H. Almuzeny</p>
      </footer>
    </div>
  );
}

export default App;
