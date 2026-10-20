import { getDb } from "@/lib/mongodb";
import TournamentsClient from "./TournamentsClient";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";

export const dynamic = 'force-dynamic';

export default async function TournamentsPage() {
  let games: any[] = [];
  let results: any[] = [];

  try {
    const db = await getDb();
    
    // Fetch all approved games (active and inactive)
    const gamesDocs = await db.collection("games").find({ approvalStatus: "approved" }).sort({ createdAt: -1 }).toArray();
    games = gamesDocs.map(doc => {
      const { _id, ...rest } = doc;
      return { id: _id.toString(), ...rest };
    });

    // Fetch all results to show Hall of Fame for completed tournaments
    const resultsDocs = await db.collection("results").find().sort({ createdAt: -1 }).toArray();
    results = resultsDocs.map(doc => {
      const { _id, ...rest } = doc;
      return { id: _id.toString(), ...rest };
    });

  } catch (err) {
    console.error("Failed to fetch tournaments data", err);
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--color-bg)", paddingTop: "80px" }}>
      <Navbar />
      <main style={{ flex: 1, width: "100%", maxWidth: "1200px", margin: "0 auto", padding: "2rem" }}>
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <h1 style={{ fontSize: "2.5rem", fontWeight: 800, color: "var(--color-text)", marginBottom: "0.5rem" }}>
            Tournament Center
          </h1>
          <p style={{ color: "var(--color-text-muted)", fontSize: "1.1rem" }}>
            Track live scores, match schedules, and points tables for all events.
          </p>
        </div>
        
        <TournamentsClient initialGames={games} initialResults={results} />
      </main>
      <Footer />
    </div>
  );
}
