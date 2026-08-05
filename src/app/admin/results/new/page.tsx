"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Game } from "@/types";

export default function PostResultPage() {
  const router = useRouter();
  const [games, setGames] = useState<Game[]>([]);
  const [selectedGameId, setSelectedGameId] = useState("");
  const [selectedFormatName, setSelectedFormatName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [firstPlace, setFirstPlace] = useState("");
  const [secondPlace, setSecondPlace] = useState("");
  const [thirdPlace, setThirdPlace] = useState("");

  useEffect(() => {
    async function fetchGames() {
      try {
        const res = await fetch("/api/games?all=true");
        const data = await res.json();
        setGames(data.games || []);
      } catch {
        setError("Failed to fetch games list.");
      } finally {
        setLoading(false);
      }
    }
    fetchGames();
  }, []);

  const selectedGame = games.find((g) => g.id === selectedGameId);

  // Auto-select format if there's only one
  useEffect(() => {
    if (selectedGame && selectedGame.formats.length === 1) {
      setSelectedFormatName(selectedGame.formats[0].formatName);
    } else {
      setSelectedFormatName("");
    }
  }, [selectedGame]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGame || !selectedFormatName || !firstPlace.trim()) {
      setError("Please fill out all required fields.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const res = await fetch("/api/results", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gameId: selectedGame.id,
          gameName: selectedGame.name,
          category: selectedGame.category,
          formatName: selectedFormatName,
          firstPlace: firstPlace.trim(),
          secondPlace: secondPlace.trim() || undefined,
          thirdPlace: thirdPlace.trim() || undefined,
        }),
      });

      if (!res.ok) throw new Error("Failed to post result");

      router.push("/admin/results");
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setSaving(false);
    }
  };

  if (loading) return <div className="admin-empty">Loading…</div>;

  return (
    <>
      <div className="admin-page-header">
        <div>
          <h1>Post Final Standings</h1>
          <p>Declare the winners for a specific game and format.</p>
        </div>
      </div>

      <div className="admin-card" style={{ maxWidth: "600px" }}>
        {error && (
          <div className="admin-login__error" style={{ marginBottom: "1.5rem" }}>
            {error}
          </div>
        )}

        <form className="admin-form" onSubmit={handleSubmit}>
          <div className="admin-form-group">
            <label className="admin-form-label">Select Game *</label>
            <select
              className="admin-form-select"
              value={selectedGameId}
              onChange={(e) => setSelectedGameId(e.target.value)}
              required
            >
              <option value="" disabled>Choose a game...</option>
              {games.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name} ({g.category})
                </option>
              ))}
            </select>
          </div>

          {selectedGame && selectedGame.formats.length > 1 && (
            <div className="admin-form-group">
              <label className="admin-form-label">Select Format *</label>
              <select
                className="admin-form-select"
                value={selectedFormatName}
                onChange={(e) => setSelectedFormatName(e.target.value)}
                required
              >
                <option value="" disabled>Choose a format...</option>
                {selectedGame.formats.map((f) => (
                  <option key={f.formatName} value={f.formatName}>
                    {f.formatName}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div style={{ marginTop: "2rem", borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "1.5rem" }}>
            <h3 style={{ fontSize: "1rem", color: "var(--color-white)", marginBottom: "1.5rem" }}>Standings</h3>
            
            <div className="admin-form-group">
              <label className="admin-form-label" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span style={{ fontSize: "1.2rem" }}>🥇</span> First Place / Winner *
              </label>
              <input
                type="text"
                className="admin-form-input"
                placeholder="Name or Team Name"
                value={firstPlace}
                onChange={(e) => setFirstPlace(e.target.value)}
                required
                style={{ borderColor: "rgba(255, 215, 0, 0.3)" }}
              />
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span style={{ fontSize: "1.2rem" }}>🥈</span> Second Place / Runner-up
              </label>
              <input
                type="text"
                className="admin-form-input"
                placeholder="Name or Team Name (Optional)"
                value={secondPlace}
                onChange={(e) => setSecondPlace(e.target.value)}
                style={{ borderColor: "rgba(192, 192, 192, 0.3)" }}
              />
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span style={{ fontSize: "1.2rem" }}>🥉</span> Third Place
              </label>
              <input
                type="text"
                className="admin-form-input"
                placeholder="Name or Team Name (Optional)"
                value={thirdPlace}
                onChange={(e) => setThirdPlace(e.target.value)}
                style={{ borderColor: "rgba(205, 127, 50, 0.3)" }}
              />
            </div>
          </div>

          <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end", marginTop: "2rem" }}>
            <Link href="/admin/results" className="admin-btn admin-btn--secondary">
              Cancel
            </Link>
            <button
              type="submit"
              className="admin-btn admin-btn--primary"
              disabled={saving}
            >
              {saving ? "Posting…" : "Post Results"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
