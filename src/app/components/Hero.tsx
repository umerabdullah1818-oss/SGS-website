"use client";

import Image from "next/image";

export default function Hero() {
  const headingLine1 = "WE BRING THE";
  const headingLine2 = "GAME TO YOU";

  let letterIndex = 0;

  const renderLetters = (text: string) => {
    return text.split("").map((char) => {
      const idx = letterIndex++;
      return (
        <span
          key={`letter-${idx}`}
          className={`letter-${idx}`}
          style={{ display: "inline-block" }}
        >
          {char === " " ? "\u00A0" : char}
        </span>
      );
    });
  };

  return (
    <section className="hero" id="home">
      {/* Background Image */}
      <div className="hero__bg">
        <Image
          src="/hero-bg.png"
          alt="Sports arena background"
          fill
          priority
          quality={90}
          style={{ objectFit: "cover" }}
        />
      </div>

      {/* Animated glow orbs */}
      <div className="hero__glow hero__glow--1" />
      <div className="hero__glow hero__glow--2" />
      <div className="hero__glow hero__glow--3" />

      {/* Subtle grid overlay */}
      <div className="hero__grid" />

      {/* Blue arc decoration behind athletes */}
      <div className="hero__arc" />

      {/* Hero Text Content */}
      <div className="hero__content">
        <p className="hero__tagline">Pop Up. Step In. Play.</p>

        <h1 className="hero__heading">
          {renderLetters(headingLine1)}
          <br />
          {renderLetters(headingLine2)}
        </h1>

        <p className="hero__description">
          Interactive cricket, football, and futsal experiences delivered
          straight to your event. Anywhere. Anytime.
        </p>

        <a href="#contact" className="hero__cta">
          Book Your Event
          <span className="hero__cta-arrow">
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
        </a>
      </div>

      {/* Athletes / Sports Images Composite */}
      <div className="hero__athletes">
        {/* Image 1 — Trophy ceremony */}
        <div className="hero__athlete hero__athlete--1">
          <Image
            src="/athlete-1.jpg"
            alt="Trophy ceremony at Sports Guild Society"
            fill
            quality={85}
            style={{ objectFit: "cover", objectPosition: "top center" }}
          />
        </div>

        {/* Image 2 — Futsal field */}
        <div className="hero__athlete hero__athlete--2">
          <Image
            src="/athlete-2.jpg"
            alt="Futsal field at Sports Guild Society"
            fill
            quality={85}
            style={{ objectFit: "cover", objectPosition: "top center" }}
          />
        </div>
      </div>

      {/* Spinning circular badge */}
      <div className="hero__badge">
        <div className="hero__badge-ring">
          <svg viewBox="0 0 100 100">
            <defs>
              <path
                id="circlePath"
                d="M 50, 50 m -37, 0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0"
              />
            </defs>
            <text>
              <textPath href="#circlePath">
                PLAY · SPORTS GUILD · STEP IN ·{" "}
              </textPath>
            </text>
          </svg>
        </div>
        <div className="hero__badge-center">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="12" y1="19" x2="12" y2="5" />
            <polyline points="5 12 12 5 19 12" />
          </svg>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="hero__bottom-gradient" />
    </section>
  );
}
