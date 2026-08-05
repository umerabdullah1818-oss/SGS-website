import Navbar from "@/app/components/Navbar";

export default function ContactPage() {
  return (
    <>
      <Navbar />
      <div style={{
        minHeight: "100vh",
        background: "#050a14",
        paddingTop: "120px",
        paddingBottom: "4rem",
        fontFamily: "var(--font-ui)",
        color: "white",
      }}>
        <div style={{ maxWidth: "800px", margin: "0 auto", padding: "0 2rem" }}>
          <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
            <h1 style={{
              fontFamily: "var(--font-heading)",
              fontSize: "clamp(2rem, 5vw, 3.5rem)",
              marginBottom: "1rem",
              letterSpacing: "-0.02em",
            }}>
              Get in <span style={{ color: "var(--color-primary-light)" }}>Touch</span>
            </h1>
            <p style={{
              fontSize: "1.1rem",
              color: "var(--color-text-muted)",
              lineHeight: 1.7,
              maxWidth: "550px",
              margin: "0 auto",
            }}>
              Have a question about an upcoming event? Want to partner with us? Reach out to the SGS team.
            </p>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "1.5rem",
            marginBottom: "3rem",
          }}>
            <div style={{
              background: "rgba(255,255,255,0.025)",
              backdropFilter: "blur(12px)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "16px",
              padding: "2.5rem",
              textAlign: "center",
            }}>
              <div style={{
                width: "48px", height: "48px", borderRadius: "12px",
                background: "rgba(30,86,255,0.15)",
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 1.25rem",
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6098ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
              </div>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "0.5rem" }}>Email Us</h3>
              <p style={{ color: "var(--color-text-muted)", fontSize: "0.95rem", marginBottom: "1rem" }}>
                For general inquiries and support.
              </p>
              <a href="mailto:sgs@cfd.nu.edu.pk" style={{
                color: "var(--color-primary-light)", fontWeight: 600, textDecoration: "none"
              }}>
                sgs@cfd.nu.edu.pk
              </a>
            </div>

            <div style={{
              background: "rgba(255,255,255,0.025)",
              backdropFilter: "blur(12px)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "16px",
              padding: "2.5rem",
              textAlign: "center",
            }}>
              <div style={{
                width: "48px", height: "48px", borderRadius: "12px",
                background: "rgba(0,200,100,0.15)",
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 1.25rem",
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00c864" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </div>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "0.5rem" }}>Visit Us</h3>
              <p style={{ color: "var(--color-text-muted)", fontSize: "0.95rem", marginBottom: "1rem" }}>
                Come see us at the Sports Office.
              </p>
              <p style={{ color: "white", fontSize: "0.95rem", fontWeight: 500 }}>
                FAST NUCES, Chiniot-Faisalabad Campus
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
