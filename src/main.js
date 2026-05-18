import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import './style.css';
import logo from './assets/logo.png';

document.querySelector('#app').innerHTML = `
<section class="hero-section">

  <nav class="navbar navbar-expand-lg hero-navbar">
    <div class="container-fluid hero-nav-container">

      <a class="navbar-brand logo-box" href="#">
        <img src="${logo}" alt="SBMS Logo" class="logo-img" />
        <span class="logo-label">SBMS</span>
      </a>

      <button
        class="navbar-toggler custom-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navbarNav"
      >
        <span class="navbar-toggler-icon"></span>
      </button>

      <div class="collapse navbar-collapse hero-nav-collapse" id="navbarNav">
        <ul class="navbar-nav nav-links mx-auto">
          <li class="nav-item"><a class="nav-link active" href="#">Home</a></li>
          <li class="nav-item"><a class="nav-link" href="#">About Us</a></li>
          <li class="nav-item"><a class="nav-link" href="#">Find Donor</a></li>
          <li class="nav-item"><a class="nav-link" href="#">Urgent Requests</a></li>
          <li class="nav-item"><a class="nav-link" href="#">Contact</a></li>
        </ul>

        <button class="donor-btn">Become a Donor</button>
      </div>

    </div>
  </nav>

  <div class="hero-content">
  <h1>
  Be a Reason for&nbsp;<span>Someone</span>
  <br />
  Else's Life
</h1>

    <p>
  Every drop counts. Connect with blood donors
  <br />
  near you in seconds and help save a life today.
</p>

    <div class="hero-buttons">
      <button class="main-btn">Become a donor →</button>
      <button class="light-btn">Request blood now</button>
    </div>
  </div>

</section>

<section class="requests-section-wrapper" id="requests">

  <div class="requests-hero-bar">
    <div>
      <p class="page-kicker">Requests</p>
      <h2 class="requests-title">Urgent Requests</h2>
    </div>
    <div class="hero-right">
      <div class="hero-circle"></div>
      <button class="add-request-btn">Add New Request</button>
    </div>
  </div>

  <div class="request-grid" id="urgent-grid"></div>

  <div class="section-divider"></div>

  <div class="section-heading-bar">
    <h2>All Requests</h2>
  </div>

  <div class="request-grid" id="all-grid"></div>

  <div class="load-more-arrow">
    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <line x1="12" y1="5" x2="12" y2="19"></line>
      <polyline points="19 12 12 19 5 12"></polyline>
    </svg>
  </div>

</section>

<footer class="footer-section">

  <div class="footer-cta">
    <div class="footer-drop footer-drop-left"></div>
    <div class="footer-drop footer-drop-right"></div>
    <div class="footer-drop footer-drop-bottom"></div>

    <div class="footer-cta-grid"></div>

    <div class="footer-cta-content">
      <h2>Ready to save a life?&nbsp; join our community of heroes today.</h2>
      <button class="footer-cta-btn">Request Blood Now</button>
    </div>
  </div>

  <div class="footer-main">
    <div class="footer-info">
      <div class="footer-brand-row">
        <img src="${logo}" alt="SBMS Logo" class="footer-logo" />
        <span class="footer-brand-label">SBMS</span>
      </div>

      <h4>Smart Blood Management System</h4>

      <p>
        Smart Blood Bank is a digital platform dedicated to solving the blood
        shortage crisis. We connect voluntary donors with those in urgent need
        through a smart, fast, and secure management system.
      </p>
    </div>

    <div class="footer-form">
      <h3>Contact Us</h3>

      <div class="footer-inputs">
        <input type="text" placeholder="Enter Name" />
        <input type="email" placeholder="Interested" />
      </div>

      <div class="footer-message-row">
        <input type="text" placeholder="Enter your message" />
        <button class="footer-send-btn">Send</button>
      </div>
    </div>
  </div>

  <div class="footer-bottom">
    <a href="#">Home</a>
    <a href="#">About Us</a>
    <a href="#">Find Donors</a>
    <a href="#">Urgent Requests</a>
    <a href="#">Terms & Conditions</a>
    <a href="#">Privacy Policy</a>
  </div>

  <div class="footer-copyright">
    Copyright © 2026 Deema Redwan
  </div>

</footer>
`;

// ═══════════════════════════════════════════
// MOCK DATA (matching Person 5 mockRequests)
// ═══════════════════════════════════════════

const urgentRequests = [
  { id: "REQ-1001", bloodType: "A+", time: "2 hours ago", hospital: "Al-Noor Hospital" },
  { id: "REQ-1002", bloodType: "O-", time: "2 hours ago", hospital: "Alia Governmental Hospital" },
  { id: "REQ-1003", bloodType: "B+", time: "2 hours ago", hospital: "Rafidia Surgical Hospital" },
  { id: "REQ-1004", bloodType: "AB-", time: "2 hours ago", hospital: "Beit Jala Governmental Hospital" },
  { id: "REQ-1005", bloodType: "O+", time: "3 hours ago", hospital: "Khalil Suleiman Hospital" },
  { id: "REQ-1006", bloodType: "A-", time: "3 hours ago", hospital: "Thabet Thabet Hospital" },
];

const normalRequests = [
  { id: "REQ-1007", bloodType: "A+", time: "5 hours ago", hospital: "Darwish Nazzal Hospital" },
  { id: "REQ-1008", bloodType: "B-", time: "7 hours ago", hospital: "Jericho Governmental Hospital" },
  { id: "REQ-1009", bloodType: "AB+", time: "8 hours ago", hospital: "Palestine Medical Complex" },
  { id: "REQ-1010", bloodType: "O+", time: "10 hours ago", hospital: "An-Najah National Hospital" },
  { id: "REQ-1011", bloodType: "AB-", time: "14 hours ago", hospital: "Hebron Governmental Hospital" },
  { id: "REQ-1012", bloodType: "A-", time: "20 hours ago", hospital: "Holy Family Hospital" },
];

// ═══════════════════════════════════════════
// RENDER CARDS
// ═══════════════════════════════════════════

function createRequestCard(request, variant, isFirst) {
  const isUrgent = variant === 'urgent';
  const statusLabel = isUrgent ? 'URGENT' : 'Normal';
  const cardClass = isUrgent ? 'request-card request-card--urgent' : 'request-card request-card--normal';
  const pillClass = isUrgent ? 'status-pill status-pill--urgent' : 'status-pill status-pill--normal';
  const btnClass = isUrgent ? 'help-button help-button--urgent' : 'help-button help-button--normal';
  const filledClass = isFirst ? ' help-button--filled' : '';

  return `
    <article class="${cardClass}">
      <span class="request-card__blood">${request.bloodType}</span>
      <div class="request-card__topline">
        <span class="request-card__time">${request.time}</span>
        <span class="${pillClass}">${statusLabel}</span>
      </div>
      <div class="request-card__body">
        <p class="request-card__location">
          <svg class="location-icon" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
          ${request.hospital}
        </p>
      </div>
      <div class="request-card__footer">
        <button class="${btnClass}${filledClass}" type="button" onclick="this.textContent='Ready to help'; this.classList.remove('help-button--filled')">
          I Can Help
        </button>
      </div>
    </article>
  `;
}

// Render urgent cards
const urgentGrid = document.getElementById('urgent-grid');
if (urgentGrid) {
  urgentGrid.innerHTML = urgentRequests.map((r, i) => createRequestCard(r, 'urgent', i === 0)).join('');
}

// Render normal cards
const allGrid = document.getElementById('all-grid');
if (allGrid) {
  allGrid.innerHTML = normalRequests.map((r, i) => createRequestCard(r, 'normal', i === 0)).join('');
}