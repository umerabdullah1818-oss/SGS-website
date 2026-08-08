import Link from "next/link";
import Image from "next/image";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Footer from "./components/Footer";

export default function Home() {
  return (
    <main>
      <Navbar />
      <Hero />

      {/* Experience / Why SGS */}
      <section className="experience" id="experience">
        <div className="public-page-container">
          <div className="section-head">
            <div>
              <span className="section-kicker">Why SGS</span>
              <h2>Sport is<br /><em>our language.</em></h2>
            </div>
            <p>
              From campus tournaments to high-energy pop-up experiences, SGS creates spaces where competition, community and unforgettable moments come together.
            </p>
          </div>

          <div className="feature-grid">
            <article className="feature-card large">
              <span className="feature-number">01</span>
              <div className="feature-icon">⚡</div>
              <h3>High Energy</h3>
              <p>Fast-paced experiences designed to get everyone involved and moving.</p>
            </article>
            <article className="feature-card">
              <span className="feature-number">02</span>
              <div className="feature-icon">🏆</div>
              <h3>Real Competition</h3>
              <p>Structured tournaments, live results and a proper path to the podium.</p>
            </article>
            <article className="feature-card">
              <span className="feature-number">03</span>
              <div className="feature-icon">🤝</div>
              <h3>One Community</h3>
              <p>Bring athletes, supporters and organizers together through sport.</p>
            </article>
          </div>
        </div>
      </section>

      {/* Marquee Section */}
      <section className="marquee-section">
        <div className="marquee">
          <span>CRICKET • FUTSAL • FOOTBALL • ATHLETICS • ESPORTS • </span>
          <span>CRICKET • FUTSAL • FOOTBALL • ATHLETICS • ESPORTS • </span>
        </div>
      </section>

      {/* Split Section / The SGS Experience */}
      <section className="split-section">
        <div className="public-page-container" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "4rem", alignItems: "center" }}>
          <div className="split-image">
            <Image
              src="/athlete-1.jpg"
              alt="Sports Guild Society"
              fill
              style={{ objectFit: "cover" }}
            />
          </div>
          <div className="split-copy">
            <span className="section-kicker">The SGS Experience</span>
            <h2>Built for<br /><em>the moment.</em></h2>
            <p>
              SGS is more than a tournament. It is a platform for students and athletes to test themselves, represent their teams and create memories that last beyond the final whistle.
            </p>
            <div className="stat-row">
              <div>
                <strong>06+</strong>
                <span>Sports</span>
              </div>
              <div>
                <strong>100+</strong>
                <span>Athletes</span>
              </div>
              <div>
                <strong>∞</strong>
                <span>Memories</span>
              </div>
            </div>
            <Link href="/about" className="text-link">
              Discover our story <span>→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <span className="section-kicker">Ready?</span>
        <h2>Your Game.<br /><em>Your Moment.</em></h2>
        <p>Join the next SGS tournament and step onto the field.</p>
        <Link href="/register" className="navbar__cta" style={{ width: "fit-content" }}>
          Start Registration
          <span className="navbar__cta-arrow" style={{ transform: "rotate(-45deg)" }}>
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="7" y1="17" x2="17" y2="7" />
              <polyline points="7 7 17 7 17 17" />
            </svg>
          </span>
        </Link>
      </section>

      <Footer />
    </main>
  );
}
