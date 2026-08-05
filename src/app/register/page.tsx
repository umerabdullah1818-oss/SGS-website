import Link from "next/link";
import GameCard from "@/app/components/register/GameCard";
import type { Game } from "@/types";
import "./register.css";

// Force dynamic rendering since we cannot connect to Firebase during static build
export const dynamic = 'force-dynamic';

import { getDb } from "@/lib/mongodb";

export default async function RegisterPage() {
  let games: Game[] = [];
  
  try {
    // In Next.js App Router, we can fetch from our own API route with absolute URL
    // Or better, fetch directly using Firebase Admin (but API is easier to keep logic unified)
    // For build compatibility, if base URL isn't set, we can query adminDb directly.
    // I'll query adminDb directly here for server-side rendering without network overhead.
    const db = await getDb();
    const docs = await db
      .collection("games")
      .find({ isActive: true, approvalStatus: "approved" })
      .sort({ createdAt: -1 })
      .toArray();
      
    games = docs.map((doc) => {
      const { _id, ...rest } = doc;
      return {
        id: _id.toString(),
        ...rest,
      };
    }) as Game[];
  } catch (err) {
    console.error("Failed to load games for registration page", err);
  }

  return (
    <div className="register-layout">
      {/* Navbar overlay header */}
      <header style={{ position: "absolute", top: 0, left: 0, right: 0, padding: "1.25rem 3.5rem", zIndex: 10 }}>
        <Link href="/" className="navbar__logo">
          <div className="navbar__logo-icon">SGS</div>
          <div className="navbar__logo-text">
            SPORTS GUILD
            <span>Society</span>
          </div>
        </Link>
      </header>

      <div className="register-container">
        <div className="register-header">
          <h1>Tournament Registration</h1>
          <p>Select a game to start your registration process. Good luck!</p>
        </div>

        {games.length === 0 ? (
          <div style={{ textAlign: "center", padding: "4rem 2rem", background: "rgba(255,255,255,0.02)", borderRadius: "16px", border: "1px dashed rgba(255,255,255,0.1)" }}>
            <h3 style={{ fontSize: "1.5rem", color: "var(--color-white)", marginBottom: "0.5rem" }}>No Active Games</h3>
            <p style={{ color: "var(--color-text-muted)" }}>Registration is currently closed. Check back soon for upcoming events.</p>
            <Link href="/" className="btn-back" style={{ display: "inline-block", marginTop: "1.5rem", background: "var(--color-primary)", color: "white" }}>
              Return Home
            </Link>
          </div>
        ) : (
          <div className="game-grid">
            {games.map((game) => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
