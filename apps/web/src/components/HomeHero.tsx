export function HomeHero() {
  return (
    <section className="home-hero" aria-labelledby="home-title">
      <div className="home-hero__content">
        <h1 id="home-title">
          Be a Reason for <span>Someone</span>
          <br />
          Else's Life
        </h1>
        <p>Every drop counts. Connect with blood donors near you in seconds and help save a life today.</p>
        <div className="home-hero__actions">
          <a className="home-hero__primary" href="#login">
            Become a donor <ArrowRightIcon />
          </a>
          <a className="home-hero__secondary" href="#urgent-requests">
            Request blood now
          </a>
        </div>
      </div>
      <div className="home-hero__character" aria-hidden="true">
        <img src="/character-removebg-preview.png" alt="" />
      </div>
    </section>
  );
}

export function HomeQuickSearch({ variant = "home" }: { variant?: "home" | "login" } = {}) {
  return (
    <section className={`home-quick-search home-quick-search--${variant}`} aria-labelledby={variant === "login" ? "login-quick-search-title" : "quick-search-title"}>
      <span className="blood-drop blood-drop--left" aria-hidden="true"></span>
      <span className="blood-drop blood-drop--right" aria-hidden="true"></span>
      <div className="home-section-inner">
        <h2 id={variant === "login" ? "login-quick-search-title" : "quick-search-title"}>Quick Search</h2>
        <form className="quick-search-form" onSubmit={(event) => event.preventDefault()}>
          <label>
            <span className="sr-only">Select blood type</span>
            <select defaultValue="">
              <option value="">Select Blood type</option>
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
            </select>
            <span className="quick-select-icon" aria-hidden="true">
              <SelectArrowIcon />
            </span>
          </label>
          <label>
            <span className="sr-only">Select city</span>
            <select defaultValue="">
              <option value="">Select City</option>
              <option value="Gaza">Gaza</option>
              <option value="Hebron">Hebron</option>
              <option value="Ramallah">Ramallah</option>
              <option value="Nablus">Nablus</option>
            </select>
            <span className="quick-select-icon" aria-hidden="true">
              <SelectArrowIcon />
            </span>
          </label>
          <a className="quick-search-button" href="#find-donor">
            Search
          </a>
        </form>
      </div>
    </section>
  );
}

export function HomeAbout() {
  return (
    <section id="about-preview" className="home-about" aria-labelledby="home-about-title">
      <span className="blood-drop blood-drop--about" aria-hidden="true"></span>
      <div className="home-section-inner home-about__content">
        <div className="home-about__grid">
          <div className="home-about__copy">
            <p className="home-kicker">Who We Are</p>
            <h2 id="home-about-title">Saving Lives Through Technology</h2>
            <p>
              Smart Blood Bank is a digital platform dedicated to solving the blood shortage crisis. We connect voluntary donors with those in urgent need through a smart, fast, and secure management system.
            </p>
            <p>
              Fast Response: Connecting requestors with donors in real-time to save every critical second.
            </p>
            <p>
              Verified Community: Ensuring all donors are registered and verified for a safe and reliable process.
            </p>
            <p>
              Easy Access: user-friendly interface designed for everyone, especially in emergencies.
            </p>
            <a className="text-link" href="#about">
              See More <ArrowRightIcon />
            </a>
          </div>
          <div className="home-about__media" aria-hidden="true">
            <img className="home-about__main-img" src="/about-main.png" alt="" />
          </div>
        </div>
      </div>
    </section>
  );
}

export function HomeHowItWorks() {
  const steps = [
    { number: "1", title: "Create Donor Profile" },
    { number: "2", title: "Match & Connect" },
    { number: "3", title: "Save A Life" },
  ];

  return (
    <section className="how-it-works" aria-labelledby="how-title">
      <span className="blood-drop blood-drop--steps" aria-hidden="true"></span>
      <div className="home-section-inner">
        <p className="home-kicker">How It Works</p>
        <h2 id="how-title">Saving Lives Is Only Three Steps Away</h2>
        <div className="steps-grid">
          {steps.map((step) => (
            <article className="step-card" key={`${step.number}-${step.title}`}>
              <span className="step-card__number">{step.number}</span>
              <h3>{step.title}</h3>
              <p>
                Smart Blood Bank is a digital platform dedicated to solving the blood shortage crisis. We connect voluntary donors with those in urgent need through a smart, fast, and secure management system.
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function HomeUrgentPreview() {
  return (
    <section className="home-urgent-preview" aria-labelledby="home-urgent-title">
      <span className="blood-drop blood-drop--urgent-one" aria-hidden="true"></span>
      <span className="blood-drop blood-drop--urgent-two" aria-hidden="true"></span>
      <div className="home-section-inner">
        <p className="home-kicker">Urgent Requests</p>
        <h2 id="home-urgent-title">Be The Hero Someone Is Waiting For</h2>
        <div className="home-request-grid">
          {Array.from({ length: 6 }, (_, index) => (
            <article className="home-request-card" key={index}>
              <span className="home-request-card__blood">+A</span>
              <div className="home-request-card__top">
                <span>2 hours ago</span>
                <strong>URGENT</strong>
              </div>
              <p>
                <LocationIcon />
                Al-Noor Hospital
              </p>
              <a className={index === 0 ? "home-help-button home-help-button--filled" : "home-help-button"} href="#urgent-requests">
                I Can Help
              </a>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function CommunityCta() {
  return (
    <section className="community-cta" aria-labelledby="community-cta-title">
      <span className="blood-drop blood-drop--cta-top" aria-hidden="true"></span>
      <span className="blood-drop blood-drop--cta-bottom" aria-hidden="true"></span>
      <div className="home-section-inner">
        <h2 id="community-cta-title">Ready to save a life? join our community of heroes today.</h2>
        <a href="#urgent-requests">Request Blood Now</a>
      </div>
    </section>
  );
}

function LocationIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 1 1 18 0Z"></path>
      <circle cx="12" cy="10" r="3"></circle>
    </svg>
  );
}

function ArrowRightIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14"></path>
      <path d="m13 6 6 6-6 6"></path>
    </svg>
  );
}

function SelectArrowIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 5v13"></path>
      <path d="m6 12 6 6 6-6"></path>
    </svg>
  );
}
