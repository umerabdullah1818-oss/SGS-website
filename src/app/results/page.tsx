import Link from "next/link";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import "./results.css";

// Force dynamic rendering since we cannot connect to Firebase during static build
export const dynamic = 'force-dynamic';

interface Result {
  id: string;
  gameId: string;
  gameName: string;
  category: string;
  formatName: string;
  firstPlace: string;
  secondPlace?: string;
  thirdPlace?: string;
  createdAt: string;
}

import { getDb } from "@/lib/mongodb";

export default async function ResultsPage() {
  let results: Result[] = [];

  try {
    const db = await getDb();
    const docs = await db
      .collection("results")
      .find()
      .sort({ createdAt: -1 })
      .toArray();

    results = docs.map(doc => {
      const { _id, ...rest } = doc;
      return {
        id: _id.toString(),
        ...rest
      };
    }) as Result[];
  } catch (err) {
    console.error("Failed to load results", err);
  }

  return (
    <div className="results-layout" style={{ paddingTop: "80px" }}>
      <Navbar />

      <div className="results-container">
        <div className="results-header">
          <h1>Hall of Fame</h1>
          <p>Celebrating the Champions of the Tournament</p>
        </div>

        {results.length === 0 ? (
          <div style={{ textAlign: "center", padding: "4rem", color: "var(--color-text-muted)" }}>
            <h3>No results posted yet.</h3>
            <p>Check back after the tournaments conclude!</p>
          </div>
        ) : (
          <div className="results-grid">
            {results.map((res) => (
              <div key={res.id} className="result-card">
                <div className="result-card__header">
                  <h3 className="result-card__title">{res.gameName}</h3>
                  <div className="result-card__subtitle">
                    <span className="admin-badge admin-badge--active" style={{ fontSize: "0.65rem", padding: "0.2rem 0.5rem" }}>
                      {res.category}
                    </span>
                    {res.formatName}
                  </div>
                </div>

                <div className="podium">
                  <div className="podium-place podium-place--first">
                    <div className="podium-medal">🥇</div>
                    <div className="podium-info">
                      <div className="podium-label">Winner</div>
                      <div className="podium-name">{res.firstPlace}</div>
                    </div>
                  </div>

                  {res.secondPlace && (
                    <div className="podium-place podium-place--second">
                      <div className="podium-medal">🥈</div>
                      <div className="podium-info">
                        <div className="podium-label">Runner-Up</div>
                        <div className="podium-name">{res.secondPlace}</div>
                      </div>
                    </div>
                  )}

                  {res.thirdPlace && (
                    <div className="podium-place podium-place--third">
                      <div className="podium-medal">🥉</div>
                      <div className="podium-info">
                        <div className="podium-label">Third Place</div>
                        <div className="podium-name">{res.thirdPlace}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
