"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Game } from "@/types";
import { useAuth } from "@/lib/auth-context";

export default function AdminGamesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchGames = async () => {
    try {
      const res = await fetch("/api/games?all=true");
      const data = await res.json();
      setGames(data.games || []);
    } catch {
      console.error("Failed to fetch games");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGames();
  }, []);

  const toggleActive = async (game: Game) => {
    try {
      await fetch(`/api/games?id=${game.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...game, isActive: !game.isActive }),
      });
      fetchGames();
    } catch {
      console.error("Failed to toggle");
    }
  };

  const updateApprovalStatus = async (id: string, status: "approved" | "rejected") => {
    try {
      await fetch(`/api/games/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      fetchGames();
    } catch {
      console.error("Failed to update status");
    }
  };

  const deleteGame = async () => {
    if (!deleteId) return;
    try {
      await fetch(`/api/games?id=${deleteId}`, { method: "DELETE" });
      setDeleteId(null);
      fetchGames();
    } catch {
      console.error("Failed to delete");
    }
  };

  const duplicateGame = async (game: Game) => {
    try {
      const { id, createdAt, updatedAt, ...rest } = game;
      void id; void createdAt; void updatedAt;
      await fetch("/api/games", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...rest, name: `${rest.name} (Copy)` }),
      });
      fetchGames();
    } catch {
      console.error("Failed to duplicate");
    }
  };

  return (
    <>
      <div className="admin-page-header">
        <div>
          <h1>Games</h1>
          <p>Create and manage all tournament games. These are rendered dynamically on the public site.</p>
        </div>
        <Link href="/admin/games/new" className="admin-btn admin-btn--primary">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Create Game
        </Link>
      </div>

      {loading ? (
        <div className="admin-empty">
          <p>Loading games…</p>
        </div>
      ) : games.length === 0 ? (
        <div className="admin-empty">
          <div className="admin-empty__icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 12h4m4 0h4M6 12a6 6 0 1 0 12 0a6 6 0 0 0-12 0" />
              <circle cx="12" cy="12" r="2" />
            </svg>
          </div>
          <h3 className="admin-empty__title">No games yet</h3>
          <p className="admin-empty__description">
            Create your first game to get started. Students will see it on the registration page.
          </p>
          <Link href="/admin/games/new" className="admin-btn admin-btn--primary">
            Create First Game
          </Link>
        </div>
      ) : (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Game Name</th>
                <th>Category</th>
                <th>Event</th>
                <th>Formats</th>
                <th>Approval</th>
                <th>Active</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {games.map((game) => {
                return (
                  <tr key={game.id}>
                    <td>
                      <div style={{ fontWeight: 600, color: "var(--color-text)" }}>{game.name}</div>
                      <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>{game.venue}</div>
                    </td>
                    <td>
                      <span className="admin-badge" style={{ background: "rgba(255,255,255,0.06)" }}>
                        {game.category}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: "0.85rem", color: "var(--color-text)" }}>
                        {game.eventName || "—"}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: "0.3rem", flexWrap: "wrap" }}>
                        {game.formats.map((f, i) => (
                          <span key={i} className="admin-badge admin-badge--active" style={{ fontSize: "0.68rem" }}>
                            {f.formatName}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td>
                      <span
                        className={`admin-badge ${
                          game.approvalStatus === "approved"
                            ? "admin-badge--active"
                            : game.approvalStatus === "rejected"
                            ? "admin-badge--danger"
                            : "admin-badge--warning"
                        }`}
                      >
                        {game.approvalStatus === "approved" ? "Approved" : game.approvalStatus === "rejected" ? "Rejected" : "Pending"}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`admin-badge ${game.isActive ? "admin-badge--active" : "admin-badge--inactive"}`}
                        style={{ cursor: "pointer" }}
                        onClick={() => toggleActive(game)}
                      >
                        {game.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td>
                      <div className="admin-actions">
                        {user?.role === "superadmin" && game.approvalStatus === "pending" && (
                          <>
                            <button
                              className="admin-btn admin-btn--primary admin-btn--sm"
                              onClick={() => updateApprovalStatus(game.id, "approved")}
                              title="Approve"
                            >
                              Approve
                            </button>
                            <button
                              className="admin-btn admin-btn--danger admin-btn--sm"
                              onClick={() => updateApprovalStatus(game.id, "rejected")}
                              title="Reject"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        <button
                          className="admin-btn admin-btn--secondary admin-btn--sm"
                          onClick={() => router.push(`/admin/games/${game.id}/edit`)}
                          title="Edit"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                          </svg>
                          Edit
                        </button>
                        <button
                          className="admin-btn admin-btn--primary admin-btn--sm"
                          onClick={() => router.push(`/admin/games/${game.id}/schedule`)}
                          title="Schedule"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                            <line x1="16" y1="2" x2="16" y2="6" />
                            <line x1="8" y1="2" x2="8" y2="6" />
                            <line x1="3" y1="10" x2="21" y2="10" />
                          </svg>
                          Schedule
                        </button>
                        <button
                          className="admin-btn admin-btn--secondary admin-btn--sm"
                          onClick={() => router.push(`/admin/games/${game.id}/matches`)}
                          title="Matches"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 20v-6M6 20V10M18 20V4" />
                          </svg>
                          Matches
                        </button>
                        {user?.role === "superadmin" && (
                          <>
                            <button
                              className="admin-btn admin-btn--secondary admin-btn--sm"
                              onClick={() => duplicateGame(game)}
                              title="Duplicate"
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                              </svg>
                              Copy
                            </button>
                            <button
                              className="admin-btn admin-btn--danger admin-btn--sm"
                              onClick={() => setDeleteId(game.id)}
                              title="Delete"
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="3 6 5 6 21 6" />
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                              </svg>
                              Delete
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="admin-modal-overlay" onClick={() => setDeleteId(null)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <h3 className="admin-modal__title">Delete Game?</h3>
            <p className="admin-modal__description">
              This will permanently remove this game. Existing registrations will NOT be affected (they contain snapshots), but students will no longer be able to register for it.
            </p>
            <div className="admin-modal__actions">
              <button className="admin-btn admin-btn--secondary" onClick={() => setDeleteId(null)}>
                Cancel
              </button>
              <button className="admin-btn admin-btn--danger" onClick={deleteGame}>
                Delete Game
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
