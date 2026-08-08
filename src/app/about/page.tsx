import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <div className="public-page-layout">
        <div className="public-page-container">
          {/* Hero */}
          <div className="public-page-header">
            <h1 className="public-page-title">
              About <span>SGS</span>
            </h1>
            <p className="public-page-subtitle">
              Fostering sportsmanship, brotherhood, and excellence at FAST NUCES Chiniot-Faisalabad Campus.
            </p>
          </div>

          {/* Content Blocks */}
          <div style={{ display: "flex", flexDirection: "column", gap: "2.5rem" }}>
            <div className="glass-card">
              <div className="glass-card__icon" style={{ background: "rgba(30,86,255,0.15)" }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6098ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 16v-4m0-4h.01" />
                </svg>
              </div>
              <h2 className="glass-card__title">Who We Are</h2>
              <p className="glass-card__desc">
                The Sports Guild Society (SGS) is the official sports body of FAST National University of Computer and Emerging Sciences, Chiniot-Faisalabad Campus. We are a student-led organization that organizes, manages, and promotes all intra- and inter-university sports activities, from annual Sports Week to specialized tournaments throughout the academic year.
              </p>
            </div>

            <div className="glass-card">
              <div className="glass-card__icon" style={{ background: "rgba(0,200,100,0.15)" }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00c864" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              </div>
              <h2 className="glass-card__title">Our Mission</h2>
              <p className="glass-card__desc">
                To provide every student with the opportunity to participate in competitive and recreational sports. We believe that sports are essential to a balanced university experience — they build discipline, teamwork, leadership, and lifelong friendships.
              </p>
            </div>

            <div className="glass-card">
              <div className="glass-card__icon" style={{ background: "rgba(255,200,0,0.15)" }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ffc800" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              </div>
              <h2 className="glass-card__title">What We Do</h2>
              <div className="glass-card__desc">
                <ul style={{ paddingLeft: "1.25rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  <li><strong style={{ color: "white" }}>Sports Week</strong> — Our flagship annual event featuring 15+ games across multiple categories.</li>
                  <li><strong style={{ color: "white" }}>Pre-Daira Events</strong> — Warm-up tournaments leading up to the main university fair.</li>
                  <li><strong style={{ color: "white" }}>Ramzan Events</strong> — Special sporting events during the holy month to keep spirits high.</li>
                  <li><strong style={{ color: "white" }}>Inter-University Competitions</strong> — Representing FAST CFD at regional and national levels.</li>
                  <li><strong style={{ color: "white" }}>Skill Development</strong> — Workshops, training camps, and mentorship for emerging athletes.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
