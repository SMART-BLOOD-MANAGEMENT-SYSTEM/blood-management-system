const aboutOpeningParagraphs = [
  "Smart Blood Bank is a digital platform dedicated to solving the blood shortage crisis. We connect voluntary donors with those in urgent need through a smart, fast, and secure management system.",
  "Fast Response: Connecting requestors with donors in real-time to save every critical second.",
  "Verified Community: Ensuring all donors are registered and verified for a safe and reliable process.",
  "Easy Access: user-friendly interface designed for everyone, especially in emergencies.",
];

const aboutLongParagraph =
  "Smart Blood Bank is a digital platform dedicated to solving the blood shortage crisis. We connect voluntary donors with those in urgent need through a smart, fast, and secure management system. Smart Blood Bank is a digital platform dedicated to solving the blood shortage crisis. We connect voluntary donors with those in urgent need through a smart, fast, and secure management system.";

export function AboutPage() {
  return (
    <section className="about-page" id="about" aria-labelledby="about-page-title">
      <div className="about-page__inner">
        <p className="about-page__kicker">Who We Are</p>
        <div className="about-page__heading">
          <h1 id="about-page-title">Saving Lives Through Technology</h1>
        </div>

        <div className="about-page__layout">
          <div className="about-page__copy">
            {aboutOpeningParagraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
            {Array.from({ length: 5 }, (_, index) => (
              <p key={`about-long-${index}`}>{aboutLongParagraph}</p>
            ))}
          </div>

          <div className="about-page__media" aria-hidden="true">
            <img className="about-page__image about-page__image--main" src="/about-main.png" alt="" />
            <img className="about-page__image about-page__image--detail-left" src="/about-detail-1.png" alt="" />
            <img className="about-page__image about-page__image--detail-right" src="/about-detail-2.png" alt="" />
          </div>
        </div>
      </div>
    </section>
  );
}
