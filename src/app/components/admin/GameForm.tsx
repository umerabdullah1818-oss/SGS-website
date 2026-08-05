"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import type { GameFormat, ExtraField } from "@/types";
import FormatBuilder from "./FormatBuilder";
import ExtraFieldBuilder from "./ExtraFieldBuilder";
import LivePreview from "./LivePreview";

interface GameFormProps {
  initialData?: {
    id?: string;
    name: string;
    category: string;
    venue: string;
    isActive: boolean;
    description: string;
    eventDate?: string;
    eventHeadName?: string;
    eventHeadPhone?: string;
    eventCoHeadName?: string;
    eventCoHeadPhone?: string;
    rules: string[];
    formats: GameFormat[];
    extraFields: ExtraField[];
    registrationDeadline: string;
    approvalStatus?: string;
  };
  mode: "create" | "edit";
}

export default function GameForm({ initialData, mode }: GameFormProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isHead = user?.role === "head";
  const assignedGame = user?.assignedGame;
  const isNameLocked = isHead && !!assignedGame;

  // Form state
  const [name, setName] = useState(initialData?.name || "");
  const [category, setCategory] = useState(initialData?.category || "");
  const [eventName, setEventName] = useState(initialData?.eventName || "");
  const [venue, setVenue] = useState(initialData?.venue || "");
  const [isActive, setIsActive] = useState(initialData?.isActive ?? true);
  const [description, setDescription] = useState(initialData?.description || "");
  const [eventDate, setEventDate] = useState(initialData?.eventDate || "");
  const [eventHeadName, setEventHeadName] = useState(initialData?.eventHeadName || "");
  const [eventHeadPhone, setEventHeadPhone] = useState(initialData?.eventHeadPhone || "");
  const [eventCoHeadName, setEventCoHeadName] = useState(initialData?.eventCoHeadName || "");
  const [eventCoHeadPhone, setEventCoHeadPhone] = useState(initialData?.eventCoHeadPhone || "");
  const [rules, setRules] = useState<string[]>(initialData?.rules || [""]);
  const [formats, setFormats] = useState<GameFormat[]>(initialData?.formats || []);
  const [extraFields, setExtraFields] = useState<ExtraField[]>(initialData?.extraFields || []);
  const [registrationDeadline, setRegistrationDeadline] = useState(initialData?.registrationDeadline || "");

  useEffect(() => {
    if (mode === "create" && isNameLocked && assignedGame && !name) {
      setName(assignedGame);
    }
  }, [mode, isNameLocked, assignedGame, name]);

  // Rules builder
  const addRule = () => setRules([...rules, ""]);
  const removeRule = (index: number) => setRules(rules.filter((_, i) => i !== index));
  const updateRule = (index: number, value: string) => {
    const updated = [...rules];
    updated[index] = value;
    setRules(updated);
  };
  const moveRule = (index: number, direction: "up" | "down") => {
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= rules.length) return;
    const updated = [...rules];
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    setRules(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const gameData = {
      name,
      category,
      eventName,
      venue,
      isActive,
      description,
      eventDate,
      eventHeadName,
      eventHeadPhone,
      eventCoHeadName: eventCoHeadName || undefined,
      eventCoHeadPhone: eventCoHeadPhone || undefined,
      rules: rules.filter((r) => r.trim()),
      formats,
      extraFields,
      registrationDeadline: registrationDeadline || undefined,
    };

    try {
      const url = mode === "create"
        ? "/api/games"
        : `/api/games?id=${initialData?.id}`;
      const method = mode === "create" ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(gameData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save game");
      }

      router.push("/admin/games");
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div className="admin-login__error" style={{ marginBottom: "1.5rem" }}>
          {error}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: "1.5rem", alignItems: "start" }}>
        {/* Left: Form */}
        <div className="admin-form">
          {/* Basic Info */}
          <div className="admin-card">
            <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "1.1rem", marginBottom: "1rem", color: "var(--color-white)" }}>
              Basic Information
            </h3>

            <div className="admin-form" style={{ gap: "1rem" }}>
              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label className="admin-form-label" htmlFor="game-name">Game Name *</label>
                  <input
                    id="game-name"
                    type="text"
                    className="admin-form-input"
                    placeholder="e.g. Table Tennis"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={isNameLocked}
                    required
                  />
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label" htmlFor="game-category">Category *</label>
                  <input
                    id="game-category"
                    type="text"
                    className="admin-form-input"
                    placeholder='e.g. "Boys", "Girls", "Open"'
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label className="admin-form-label" htmlFor="game-event-name">Event Name</label>
                  <input
                    id="game-event-name"
                    type="text"
                    list="event-names"
                    className="admin-form-input"
                    placeholder='e.g. "Sports Week", "Pre Daira Events"'
                    value={eventName}
                    onChange={(e) => setEventName(e.target.value)}
                  />
                  <datalist id="event-names">
                    <option value="Sports Week" />
                    <option value="Pre Daira Events" />
                    <option value="Ramzan Events" />
                  </datalist>
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label" htmlFor="game-venue">Venue / Area *</label>
                  <input
                    id="game-venue"
                    type="text"
                    className="admin-form-input"
                    placeholder='e.g. "Main Ground", "Gym Hall"'
                    value={venue}
                    onChange={(e) => setVenue(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label className="admin-form-label" htmlFor="game-event-date">Event Date *</label>
                  <input
                    id="game-event-date"
                    type="date"
                    className="admin-form-input"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    required
                  />
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label" htmlFor="game-deadline">Registration Deadline</label>
                  <input
                    id="game-deadline"
                    type="datetime-local"
                    className="admin-form-input"
                    value={registrationDeadline}
                    onChange={(e) => setRegistrationDeadline(e.target.value)}
                  />
                </div>
              </div>

              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label className="admin-form-label" htmlFor="head-name">Event Head Name *</label>
                  <input
                    id="head-name"
                    type="text"
                    className="admin-form-input"
                    placeholder="e.g. Ali Ahmed"
                    value={eventHeadName}
                    onChange={(e) => setEventHeadName(e.target.value)}
                    required
                  />
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label" htmlFor="head-phone">Event Head Phone *</label>
                  <input
                    id="head-phone"
                    type="text"
                    className="admin-form-input"
                    placeholder="e.g. 0300-1234567"
                    value={eventHeadPhone}
                    onChange={(e) => setEventHeadPhone(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label className="admin-form-label" htmlFor="cohead-name">Co-Head Name (Optional)</label>
                  <input
                    id="cohead-name"
                    type="text"
                    className="admin-form-input"
                    placeholder="e.g. Sara Khan"
                    value={eventCoHeadName}
                    onChange={(e) => setEventCoHeadName(e.target.value)}
                  />
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label" htmlFor="cohead-phone">Co-Head Phone (Optional)</label>
                  <input
                    id="cohead-phone"
                    type="text"
                    className="admin-form-input"
                    placeholder="e.g. 0300-7654321"
                    value={eventCoHeadPhone}
                    onChange={(e) => setEventCoHeadPhone(e.target.value)}
                  />
                </div>
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label" htmlFor="game-description">Description</label>
                <textarea
                  id="game-description"
                  className="admin-form-textarea"
                  placeholder="Brief description of the game, shown to students..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="admin-form-group">
                <div
                  className={`admin-toggle ${isActive ? "admin-toggle--active" : ""}`}
                  onClick={() => setIsActive(!isActive)}
                >
                  <div className="admin-toggle__switch" />
                  <span style={{ fontWeight: 500 }}>
                    {isActive ? "Active — visible to students" : "Inactive — hidden from registration"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Formats */}
          <FormatBuilder formats={formats} onChange={setFormats} />

          {/* Rules */}
          <div className="admin-builder">
            <div className="admin-builder__header">
              <div className="admin-builder__title">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="8" y1="6" x2="21" y2="6" />
                  <line x1="8" y1="12" x2="21" y2="12" />
                  <line x1="8" y1="18" x2="21" y2="18" />
                  <line x1="3" y1="6" x2="3.01" y2="6" />
                  <line x1="3" y1="12" x2="3.01" y2="12" />
                  <line x1="3" y1="18" x2="3.01" y2="18" />
                </svg>
                Game Rules
                <span className="admin-builder__count">{rules.filter((r) => r.trim()).length}</span>
              </div>
              <button type="button" className="admin-btn admin-btn--primary admin-btn--sm" onClick={addRule}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Add Rule
              </button>
            </div>
            <div className="admin-builder__items">
              {rules.length === 0 && (
                <div className="admin-builder__empty">
                  No rules defined. Add rule bullet points for students to see.
                </div>
              )}
              {rules.map((rule, index) => (
                <div key={index} className="admin-builder__item" style={{ flexDirection: "row", alignItems: "center", gap: "0.5rem" }}>
                  <div className="admin-actions" style={{ flexDirection: "column", gap: "0.15rem" }}>
                    <button
                      type="button"
                      className="admin-btn admin-btn--icon admin-btn--secondary"
                      onClick={() => moveRule(index, "up")}
                      disabled={index === 0}
                      style={{ opacity: index === 0 ? 0.3 : 1 }}
                      title="Move up"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="18 15 12 9 6 15" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      className="admin-btn admin-btn--icon admin-btn--secondary"
                      onClick={() => moveRule(index, "down")}
                      disabled={index === rules.length - 1}
                      style={{ opacity: index === rules.length - 1 ? 0.3 : 1 }}
                      title="Move down"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </button>
                  </div>
                  <input
                    type="text"
                    className="admin-form-input"
                    placeholder={`Rule ${index + 1}...`}
                    value={rule}
                    onChange={(e) => updateRule(index, e.target.value)}
                    style={{ flex: 1 }}
                  />
                  <button
                    type="button"
                    className="admin-btn admin-btn--icon admin-btn--danger"
                    onClick={() => removeRule(index)}
                    title="Remove rule"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Extra Fields */}
          <ExtraFieldBuilder extraFields={extraFields} onChange={setExtraFields} />

          {/* Submit */}
          <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end", paddingTop: "0.5rem" }}>
            <button
              type="button"
              className="admin-btn admin-btn--secondary"
              onClick={() => router.push("/admin/games")}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="admin-btn admin-btn--primary"
              disabled={saving}
            >
              {saving
                ? mode === "create" ? "Creating…" : "Saving…"
                : mode === "create" ? "Create Game" : "Save Changes"
              }
            </button>
          </div>
        </div>

        {/* Right: Live Preview */}
        <div style={{ position: "sticky", top: "1.5rem" }}>
          <LivePreview
            name={name}
            category={category}
            venue={venue}
            description={description}
            eventDate={eventDate}
            eventHeadName={eventHeadName}
            eventHeadPhone={eventHeadPhone}
            eventCoHeadName={eventCoHeadName}
            eventCoHeadPhone={eventCoHeadPhone}
            formats={formats}
            extraFields={extraFields}
            rules={rules}
          />
        </div>
      </div>
    </form>
  );
}
