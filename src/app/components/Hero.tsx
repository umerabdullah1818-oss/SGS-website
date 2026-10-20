"use client";

import Image from "next/image";

export default function Hero() {
  const headingLine1 = "WE BRING THE";
  const headingLine2 = "GAME TO YOU";

  return (
    <section className="hero" id="home">
      {/* Light Blob Background */}
      <div className="hero__bg">
        <svg viewBox="0 0 1440 900" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice" style={{ width: "100%", height: "100%" }}>
          <path fill="rgba(138, 43, 226, 0.05)" d="M0,0 L0,400 C200,450 400,200 600,300 C800,400 900,100 1000,0 L0,0 Z"></path>
          <path fill="rgba(138, 43, 226, 0.08)" d="M1440,200 C1100,150 900,400 1000,700 C1050,850 1250,950 1440,900 L1440,200 Z"></path>
          <path fill="rgba(138, 43, 226, 0.04)" d="M0,700 C250,650 450,800 600,900 L0,900 L0,700 Z"></path>
        </svg>
      </div>

      <div className="hero__container">
        {/* Hero Text Content */}
        <div className="hero__content">
          <p className="hero__tagline">UNITE THROUGH SPORT. EXCEL TOGETHER.</p>

          <h1 className="hero__heading">
            <span style={{ whiteSpace: "nowrap" }}>{headingLine1}</span>
            <br />
            <span style={{ whiteSpace: "nowrap" }}>{headingLine2}</span>
          </h1>

          <p className="hero__description">
            Elevate your university experience beyond the classroom. Find your team, hone your skills,
            and build lifelong connections on and off the field.
          </p>

          <a href="#contact" className="hero__cta">
            Register Now
          </a>
        </div>

        {/* Hero Image */}
        <div className="hero__image">
          <Image
            src="/hero.png"
            alt="Sports Athletes"
            width={700}
            height={700}
            priority
            style={{ width: "100%", height: "auto", objectFit: "contain" }}
          />
        </div>
      </div>
    </section>
  );
}
