import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";

export default function ContactPage() {
  return (
    <>
      <Navbar />
      <div className="public-page-layout">
        <div className="public-page-container">
          <div className="public-page-header">
            <h1 className="public-page-title">
              Get in <span>Touch</span>
            </h1>
            <p className="public-page-subtitle">
              Have a question about an upcoming event? Want to partner with us? Reach out to the SGS team.
            </p>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "1.5rem",
            marginBottom: "3rem",
          }}>
            <div className="glass-card glass-card--center">
              <div className="glass-card__icon" style={{ background: "rgba(138, 43, 226, 0.1)" }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#8a2be2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
              </div>
              <h3 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "0.5rem", color: "var(--color-text)" }}>Email Us</h3>
              <p className="glass-card__desc" style={{ marginBottom: "1.5rem" }}>
                For general inquiries and support.
              </p>
              <a href="mailto:sgs@cfd.nu.edu.pk" className="glass-card__link">
                sgs@cfd.nu.edu.pk
              </a>
            </div>

            <div className="glass-card glass-card--center">
              <div className="glass-card__icon" style={{ background: "rgba(138, 43, 226, 0.1)" }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#8a2be2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </div>
              <h3 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "0.5rem", color: "var(--color-text)" }}>Visit Us</h3>
              <p className="glass-card__desc" style={{ marginBottom: "1.5rem" }}>
                Come see us at the Sports Office.
              </p>
              <p style={{ color: "var(--color-text)", fontSize: "0.95rem", fontWeight: 500 }}>
                FAST NUCES, Chiniot-Faisalabad Campus
              </p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
