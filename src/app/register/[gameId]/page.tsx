"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import type { Game, PaymentConfig, Player, Captain } from "@/types";
import { useAuth } from "@/lib/auth-context";
import StepIndicator from "@/app/components/register/StepIndicator";
import FormatSelector from "@/app/components/register/FormatSelector";
import RosterForm from "@/app/components/register/RosterForm";
import ExtraFieldRenderer from "@/app/components/register/ExtraFieldRenderer";
import PaymentForm from "@/app/components/register/PaymentForm";
import "../register.css";

export default function RegistrationFlow() {
  const params = useParams();
  const router = useRouter();
  const gameId = params.gameId as string;
  const { user, loading: authLoading } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Game & Config Data
  const [game, setGame] = useState<Game | null>(null);
  const [paymentConfig, setPaymentConfig] = useState<PaymentConfig | null>(null);

  // Form State
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedFormatName, setSelectedFormatName] = useState<string | null>(null);
  const [teamName, setTeamName] = useState("");
  const [captain, setCaptain] = useState<Captain | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [extraAnswers, setExtraAnswers] = useState<Record<string, string>>({});
  
  // Payment State
  const [paymentDetails, setPaymentDetails] = useState({
    dateOfTransaction: new Date().toISOString().split("T")[0],
    source: "",
    transactionId: "",
  });
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  
  // Submission State
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // Fetch Game & Config Data
  useEffect(() => {
    async function fetchData() {
      try {
        const [gameRes, configRes] = await Promise.all([
          fetch(`/api/games?id=${gameId}`),
          fetch("/api/config/payment"),
        ]);

        if (!gameRes.ok) throw new Error("Game not found");
        const gameData = await gameRes.json();
        const configData = await configRes.json();

        if (!gameData.game.isActive) {
          throw new Error("Registration is closed for this game");
        }

        setGame(gameData.game);
        setPaymentConfig(configData.config);

        // If only one format, auto-select it
        if (gameData.game.formats.length === 1) {
          setSelectedFormatName(gameData.game.formats[0].formatName);
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to load");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [gameId]);

  useEffect(() => {
    // If auth and game loading are done, and no user, redirect to login
    if (!authLoading && !loading && !user) {
      router.push(`/login?callback=/register/${gameId}`);
    }
  }, [authLoading, loading, user, router, gameId]);

  if (loading || authLoading || !user) {
    return (
      <div className="register-layout" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "var(--color-text-muted)" }}>Loading registration...</p>
      </div>
    );
  }

  if (error || !game) {
    return (
      <div className="register-layout">
        <div className="register-container" style={{ textAlign: "center", paddingTop: "4rem" }}>
          <h2 style={{ fontSize: "2rem", marginBottom: "1rem" }}>Oops!</h2>
          <p style={{ color: "var(--color-text-muted)", marginBottom: "2rem" }}>{error}</p>
          <Link href="/register" className="btn-back" style={{ background: "var(--color-primary)", color: "white" }}>
            Back to Games
          </Link>
        </div>
      </div>
    );
  }

  const selectedFormat = game.formats.find(f => f.formatName === selectedFormatName);

  // Define steps dynamically based on game properties
  const steps = [];
  if (game.formats.length > 1) steps.push({ id: "format", label: "Format" });
  steps.push({ id: "roster", label: "Details" });
  if (game.extraFields && game.extraFields.length > 0) steps.push({ id: "extra", label: "Questions" });
  steps.push({ id: "payment", label: "Payment" });

  const currentStepId = steps[currentStep]?.id;

  // Validation logic per step
  const canProceed = () => {
    if (currentStepId === "format") {
      return selectedFormatName !== null;
    }
    if (currentStepId === "roster") {
      if (!selectedFormat) return false;
      if (selectedFormat.rosterType === "team" && !teamName.trim()) return false;
      if (selectedFormat.hasCaptain) {
        if (!captain?.name || !captain?.rollNumber || !captain?.contactNumber) return false;
      }
      // Check min players
      const validPlayers = players.filter(p => p.name.trim() && p.rollNumber.trim());
      if (validPlayers.length < selectedFormat.minPlayers) return false;
      return true;
    }
    if (currentStepId === "extra") {
      for (const field of game.extraFields) {
        if (field.required && (!extraAnswers[field.label] || !extraAnswers[field.label].toString().trim())) {
          return false;
        }
      }
      return true;
    }
    if (currentStepId === "payment") {
      return (
        paymentDetails.source.trim() !== "" &&
        paymentDetails.transactionId.trim() !== "" &&
        paymentDetails.dateOfTransaction.trim() !== "" &&
        screenshotFile !== null
      );
    }
    return true;
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      router.push("/register");
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      // 1. Upload screenshot
      let screenshotUrl = "";
      if (screenshotFile) {
        const formData = new FormData();
        formData.append("file", screenshotFile);
        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        if (!uploadRes.ok) throw new Error("Failed to upload screenshot");
        const uploadData = await uploadRes.json();
        screenshotUrl = uploadData.url;
      }

      // 2. Filter out empty player slots
      const validPlayers = players.filter(p => p.name.trim() && p.rollNumber.trim());

      // 3. Submit registration
      const registrationData = {
        gameId,
        formatName: selectedFormatName,
        teamName: selectedFormat?.rosterType === "team" ? teamName : undefined,
        captain: selectedFormat?.hasCaptain ? captain : undefined,
        players: validPlayers,
        extraAnswers,
        payment: {
          ...paymentDetails,
          amountTransferred: selectedFormat?.fee || 0,
          screenshotUrl,
        },
      };

      const res = await fetch("/api/registrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(registrationData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Submission failed");
      }

      setSuccess(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Something went wrong during submission. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="register-layout">
        <div className="register-container">
          <div className="step-container" style={{ padding: "4rem 2rem" }}>
            <div className="success-screen">
              <div className="success-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <h1 className="success-title">Registration Submitted!</h1>
              <p className="success-desc">
                Your registration for <strong>{game.name}</strong> ({selectedFormatName}) has been received. Our team will verify your payment details and update your status soon.
              </p>
              <Link href="/" className="btn-next" style={{ display: "inline-flex", margin: "0 auto", marginTop: "2rem" }}>
                Return to Homepage
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="register-layout">
      {/* Navbar overlay header */}
      <header style={{ position: "absolute", top: 0, left: 0, right: 0, padding: "1.25rem 3.5rem", zIndex: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Link href="/" className="navbar__logo">
          <div className="navbar__logo-icon">SGS</div>
          <div className="navbar__logo-text">
            SPORTS GUILD
            <span>Society</span>
          </div>
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: "1.25rem" }}>
          <span style={{ fontSize: "0.85rem", color: "var(--color-text-muted)" }}>Logged in as <strong style={{color:"white"}}>{user.email}</strong></span>
          <button 
            onClick={async () => {
              await fetch('/api/auth/me', { method: 'POST' });
              window.location.reload();
            }}
            style={{
              background: "rgba(255,255,255,0.1)",
              border: "none",
              color: "white",
              padding: "0.5rem 1rem",
              borderRadius: "8px",
              fontSize: "0.85rem",
              cursor: "pointer"
            }}
          >
            Sign Out
          </button>
        </div>
      </header>

      <div className="register-container">
        <div className="register-header" style={{ marginBottom: "1.5rem" }}>
          <h1 style={{ fontSize: "clamp(2rem, 4vw, 3rem)" }}>{game.name}</h1>
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "1rem", marginTop: "1rem" }}>
            <span style={{ background: "rgba(255,255,255,0.05)", padding: "0.4rem 1rem", borderRadius: "100px", fontSize: "0.9rem" }}>
              📍 {game.venue}
            </span>
            <span style={{ background: "rgba(255,255,255,0.05)", padding: "0.4rem 1rem", borderRadius: "100px", fontSize: "0.9rem" }}>
              📅 {game.eventDate ? new Date(game.eventDate).toLocaleDateString() : "TBA"}
            </span>
            <span style={{ background: "rgba(255,255,255,0.05)", padding: "0.4rem 1rem", borderRadius: "100px", fontSize: "0.9rem" }}>
              🏅 {game.category}
            </span>
          </div>
          
          {(game.eventHeadName || game.eventCoHeadName) && (
            <div style={{ marginTop: "1.5rem", padding: "1rem", background: "rgba(30, 86, 255, 0.1)", border: "1px solid rgba(30, 86, 255, 0.2)", borderRadius: "12px", display: "inline-block", textAlign: "left" }}>
              <div style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--color-primary-light)", marginBottom: "0.5rem", fontWeight: 600 }}>
                Event Contacts
              </div>
              <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap" }}>
                {game.eventHeadName && (
                  <div>
                    <div style={{ fontSize: "0.95rem", fontWeight: 500, color: "var(--color-white)" }}>{game.eventHeadName}</div>
                    <div style={{ fontSize: "0.85rem", color: "var(--color-text-muted)" }}>Head: {game.eventHeadPhone}</div>
                  </div>
                )}
                {game.eventCoHeadName && (
                  <div>
                    <div style={{ fontSize: "0.95rem", fontWeight: 500, color: "var(--color-white)" }}>{game.eventCoHeadName}</div>
                    <div style={{ fontSize: "0.85rem", color: "var(--color-text-muted)" }}>Co-Head: {game.eventCoHeadPhone}</div>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {game.description && (
            <p style={{ marginTop: "1.5rem", maxWidth: "600px", margin: "1.5rem auto 0", lineHeight: 1.6, color: "var(--color-text)" }}>
              {game.description}
            </p>
          )}

          {game.rules && game.rules.length > 0 && (
            <div style={{ marginTop: "2rem", textAlign: "left", maxWidth: "600px", margin: "2rem auto 0", background: "rgba(255,255,255,0.03)", padding: "1.5rem", borderRadius: "12px" }}>
              <h3 style={{ fontSize: "1.1rem", marginBottom: "1rem", color: "var(--color-white)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
                Rules & Regulations
              </h3>
              <ul style={{ paddingLeft: "1.5rem", listStyle: "decimal", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {game.rules.filter(r => r.trim()).map((rule, idx) => (
                  <li key={idx} style={{ color: "var(--color-text-muted)", fontSize: "0.95rem", lineHeight: 1.5 }}>
                    {rule}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <StepIndicator currentStep={currentStep} steps={steps} />

        <div className="step-container">
          {/* STEP: FORMAT */}
          {currentStepId === "format" && (
            <div className="step-content">
              <div className="step-header">
                <h2 className="step-title">Choose Format</h2>
                <p className="step-subtitle">Select how you want to participate in this event.</p>
              </div>
              <FormatSelector
                formats={game.formats}
                selectedFormatName={selectedFormatName}
                onSelect={setSelectedFormatName}
              />
            </div>
          )}

          {/* STEP: ROSTER */}
          {currentStepId === "roster" && selectedFormat && (
            <div className="step-content">
              <div className="step-header">
                <h2 className="step-title">Participant Details</h2>
                <p className="step-subtitle">
                  {selectedFormat.rosterType === "team"
                    ? `Enter your team and player details (Min: ${selectedFormat.minPlayers}, Max: ${selectedFormat.maxPlayers})`
                    : "Enter your personal details"}
                </p>
              </div>
              <RosterForm
                format={selectedFormat}
                teamName={teamName}
                setTeamName={setTeamName}
                captain={captain}
                setCaptain={setCaptain}
                players={players}
                setPlayers={setPlayers}
              />
            </div>
          )}

          {/* STEP: EXTRA FIELDS */}
          {currentStepId === "extra" && (
            <div className="step-content">
              <div className="step-header">
                <h2 className="step-title">Additional Questions</h2>
                <p className="step-subtitle">Please provide this extra information required for the game.</p>
              </div>
              <ExtraFieldRenderer
                fields={game.extraFields}
                answers={extraAnswers}
                setAnswers={setExtraAnswers}
              />
            </div>
          )}

          {/* STEP: PAYMENT */}
          {currentStepId === "payment" && selectedFormat && (
            <div className="step-content">
              <div className="step-header">
                <h2 className="step-title">Payment & Verification</h2>
                <p className="step-subtitle">Transfer your fee and upload the receipt to complete registration.</p>
              </div>
              <PaymentForm
                fee={selectedFormat.fee}
                paymentConfig={paymentConfig}
                paymentDetails={paymentDetails}
                setPaymentDetails={setPaymentDetails}
                screenshotFile={screenshotFile}
                setScreenshotFile={setScreenshotFile}
              />
            </div>
          )}

          {/* Navigation Actions */}
          <div className="step-actions">
            <button type="button" className="btn-back" onClick={handleBack} disabled={submitting}>
              {currentStep === 0 ? "Cancel" : "Back"}
            </button>
            
            {currentStep === steps.length - 1 ? (
              <button
                type="button"
                className="btn-next"
                onClick={handleSubmit}
                disabled={!canProceed() || submitting}
              >
                {submitting ? "Submitting..." : "Submit Registration"}
                {!submitting && (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                )}
              </button>
            ) : (
              <button
                type="button"
                className="btn-next"
                onClick={handleNext}
                disabled={!canProceed()}
              >
                Continue
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
