import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import { getCurrentAdmin } from "@/lib/auth";

export async function PUT(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const admin = await getCurrentAdmin();
    if (!admin || (admin.role !== "superadmin" && admin.role !== "head")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { action, match_id, date, time, winner_id, score_a, score_b } = body;

    if (!match_id) {
      return NextResponse.json({ error: "Match ID is required" }, { status: 400 });
    }

    const db = await getDb();
    
    const game = await db.collection("games").findOne({ _id: new ObjectId(params.id) });
    if (!game) {
      return NextResponse.json({ error: "Game not found" }, { status: 404 });
    }
    if (admin.role === "head" && game.createdBy !== admin.uid) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    if (!game.matches || !Array.isArray(game.matches)) {
      return NextResponse.json({ error: "No schedule generated yet" }, { status: 400 });
    }

    const matches = [...game.matches];
    const matchIndex = matches.findIndex((m: any) => m.match_id === match_id || m.id === match_id);
    
    if (matchIndex === -1) {
      return NextResponse.json({ error: "Match not found" }, { status: 404 });
    }

    const match = matches[matchIndex];

    if (action === "update_datetime") {
      // Only superadmin can change schedule once it's set
      if (match.date && admin.role !== "superadmin") {
        return NextResponse.json({ error: "Only admin can modify an already-set schedule." }, { status: 403 });
      }
      match.date = date;
      match.time = time;
    } else if (action === "update_result") {
      // Prevent modifying completed matches (only superadmin can override)
      if (match.status === "completed" && admin.role !== "superadmin") {
        return NextResponse.json({ error: "Result already submitted. Only admin can override." }, { status: 403 });
      }

      // Score validation: if both scores are provided, the winner must match the higher score
      // Exception: games like cricket may have different scoring, so only validate numeric comparisons
      const numA = parseFloat(score_a);
      const numB = parseFloat(score_b);
      if (!isNaN(numA) && !isNaN(numB) && winner_id !== "DRAW") {
        if (numA > numB && winner_id !== match.team_a_id) {
          return NextResponse.json({ 
            error: `Score mismatch: ${match.team_a_name} has a higher score (${numA}) but is not selected as the winner.` 
          }, { status: 400 });
        }
        if (numB > numA && winner_id !== match.team_b_id) {
          return NextResponse.json({ 
            error: `Score mismatch: ${match.team_b_name} has a higher score (${numB}) but is not selected as the winner.` 
          }, { status: 400 });
        }
        if (numA === numB && winner_id !== "DRAW") {
          return NextResponse.json({ 
            error: `Scores are equal (${numA} - ${numB}). Please select Draw or correct the scores.` 
          }, { status: 400 });
        }
      }

      match.winner_id = winner_id;
      match.score_a = score_a;
      match.score_b = score_b;
      match.status = "completed";

      // Bracket progression: Auto-advance winner to next match if applicable
      if (match.next_match_id && winner_id !== "DRAW") {
        const nextMatchIndex = matches.findIndex((m: any) => m.match_id === match.next_match_id || m.id === match.next_match_id);
        if (nextMatchIndex !== -1) {
          const nextMatch = matches[nextMatchIndex];
          const winnerName = winner_id === match.team_a_id ? match.team_a_name : match.team_b_name;

          // Fill the first available "TBD" slot
          if (nextMatch.team_a_id === null || nextMatch.team_a_name === "TBD") {
            nextMatch.team_a_id = winner_id;
            nextMatch.team_a_name = winnerName;
          } else if (nextMatch.team_b_id === null || nextMatch.team_b_name === "TBD") {
            nextMatch.team_b_id = winner_id;
            nextMatch.team_b_name = winnerName;
          }
          
          // Both teams filled → mark as scheduled
          if (nextMatch.team_a_id && nextMatch.team_b_id && 
              nextMatch.team_a_name !== "TBD" && nextMatch.team_b_name !== "TBD") {
            nextMatch.status = "scheduled";
          }
        }
      }
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    // Save updated matches array
    await db.collection("games").updateOne(
      { _id: new ObjectId(params.id) },
      { $set: { matches } }
    );

    return NextResponse.json({ success: true, match });

  } catch (error) {
    console.error("PUT /api/games/[id]/matches error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
