import Link from "next/link";
import type { Game } from "@/types";

interface GameCardProps {
  game: Game;
}

export default function GameCard({ game }: GameCardProps) {
  // Compute fee range
  const fees = game.formats.map((f) => f.fee);
  const feeDisplay =
    fees.length === 0
      ? "Free"
      : fees.length === 1
      ? `Rs. ${fees[0]}`
      : `From Rs. ${Math.min(...fees)}`;

  return (
    <Link href={`/register/${game.id}`} className="game-card">
      <div className="game-card__content">
        <div className="game-card__tags">
          <span className="game-card__tag game-card__tag--active">
            {game.category}
          </span>
          {game.formats.length > 1 && (
            <span className="game-card__tag">Multiple Formats</span>
          )}
        </div>
        
        <h3 className="game-card__title">{game.name}</h3>
        
        <div className="game-card__venue">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          {game.venue}
        </div>

        {game.description && (
          <p style={{ 
            fontSize: "0.85rem", 
            color: "var(--color-text-muted)", 
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            marginBottom: "1rem"
          }}>
            {game.description}
          </p>
        )}

        <div className="game-card__footer">
          <div>
            <div className="game-card__fee-label">Registration Fee</div>
            <div className="game-card__fee-value">{feeDisplay}</div>
          </div>
          
          <div style={{
            width: "36px",
            height: "36px",
            background: "rgba(255,255,255,0.1)",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--color-white)"
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </div>
        </div>
      </div>
    </Link>
  );
}
