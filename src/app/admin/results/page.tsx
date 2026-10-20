"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Result {
  id?: string;
  gameId: string;
  gameName: string;
  category: string;
  formatName: string;
  firstPlace: string;
  secondPlace?: string;
  thirdPlace?: string;
  createdAt: string;
}

export default function AdminResultsPage() {
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchResults = async () => {
    try {
      const res = await fetch("/api/results");
      const data = await res.json();
      setResults(data.results || []);
    } catch {
      console.error("Failed to fetch results");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
  }, []);

  const deleteResult = async (id: string) => {
    if (!confirm("Are you sure you want to delete this result?")) return;
    try {
      await fetch(`/api/results?id=${id}`, { method: "DELETE" });
      fetchResults();
    } catch {
      alert("Failed to delete result");
    }
  };

  return (
    <>
      <div className="admin-page-header">
        <div>
          <h1>Tournament Results</h1>
          <p>Post the final standings for games. These will be displayed on the public Hall of Fame page.</p>
        </div>
        <Link href="/admin/results/new" className="admin-btn admin-btn--primary">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Post Result
        </Link>
      </div>

      {loading ? (
        <div className="admin-empty">
          <p>Loading results…</p>
        </div>
      ) : results.length === 0 ? (
        <div className="admin-empty">
          <h3 className="admin-empty__title">No results posted yet</h3>
          <p className="admin-empty__description">
            When tournaments conclude, post the winners here to celebrate them.
          </p>
          <Link href="/admin/results/new" className="admin-btn admin-btn--primary">
            Post First Result
          </Link>
        </div>
      ) : (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Game / Format</th>
                <th>🥇 1st Place</th>
                <th>🥈 2nd Place</th>
                <th>🥉 3rd Place</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {results.map((res) => (
                <tr key={res.id}>
                  <td>
                    <div style={{ fontWeight: 600, color: "var(--color-text)" }}>{res.gameName}</div>
                    <div style={{ fontSize: "0.8rem", color: "var(--color-text-muted)" }}>{res.category} • {res.formatName}</div>
                  </td>
                  <td style={{ color: "#ffd700", fontWeight: 600 }}>{res.firstPlace}</td>
                  <td style={{ color: "#c0c0c0" }}>{res.secondPlace || "—"}</td>
                  <td style={{ color: "#cd7f32" }}>{res.thirdPlace || "—"}</td>
                  <td>
                    <button
                      className="admin-btn admin-btn--danger admin-btn--sm"
                      onClick={() => deleteResult(res.id!)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

