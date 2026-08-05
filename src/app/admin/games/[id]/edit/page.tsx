"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import GameForm from "@/app/components/admin/GameForm";
import type { Game } from "@/types";

export default function EditGamePage() {
  const params = useParams();
  const gameId = params.id as string;
  const [game, setGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchGame() {
      try {
        const res = await fetch(`/api/games?id=${gameId}`);
        if (!res.ok) throw new Error("Game not found");
        const data = await res.json();
        setGame(data.game);
      } catch {
        setError("Failed to load game");
      } finally {
        setLoading(false);
      }
    }
    fetchGame();
  }, [gameId]);

  if (loading) {
    return (
      <div className="admin-empty">
        <p>Loading game…</p>
      </div>
    );
  }

  if (error || !game) {
    return (
      <div className="admin-empty">
        <h3 className="admin-empty__title">Game not found</h3>
        <p className="admin-empty__description">{error}</p>
      </div>
    );
  }

  return (
    <>
      <div className="admin-page-header">
        <div>
          <h1>Edit: {game.name}</h1>
          <p>Modify game settings. Changes affect future registrations only.</p>
        </div>
      </div>
      <GameForm
        mode="edit"
        initialData={{
          id: game.id,
          name: game.name,
          category: game.category,
          venue: game.venue,
          isActive: game.isActive,
          approvalStatus: game.approvalStatus,
          description: game.description || "",
          eventDate: game.eventDate,
          eventHeadName: game.eventHeadName,
          eventHeadPhone: game.eventHeadPhone,
          eventCoHeadName: game.eventCoHeadName,
          eventCoHeadPhone: game.eventCoHeadPhone,
          rules: game.rules,
          formats: game.formats,
          extraFields: game.extraFields,
          registrationDeadline: game.registrationDeadline || "",
        }}
      />
    </>
  );
}
