import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import { getCurrentAdmin } from "@/lib/auth";

// ── Algorithm 1: Single Knockout ──
// Helper to label knockout rounds (e.g., Final, Semi Final, Quarter Final)
function getKnockoutRoundLabel(roundNum: number, totalRounds: number): string {
  const roundFromEnd = totalRounds - roundNum; // 0 = final
  switch (roundFromEnd) {
    case 0: return "Final";
    case 1: return "Semi Final";
    case 2: return "Quarter Final";
    case 3: return "Round of 16";
    case 4: return "Round of 32";
    default: return `Round ${roundNum}`;
  }
}

function generateSingleKnockout(participants: any[], startMatchId = 1) {
  const matches: any[] = [];
  let matchId = startMatchId;
  const n = participants.length;
  if (n === 0) return { matches, nextId: matchId };
  if (n === 1) return { matches, nextId: matchId };

  // Calculate Next Power of 2 and Byes
  const nextPowerOf2 = Math.pow(2, Math.ceil(Math.log2(n)));
  const byes = nextPowerOf2 - n;
  const r1MatchesCount = (n - byes) / 2;
  const totalRounds = Math.ceil(Math.log2(nextPowerOf2));
  
  // Randomize seeds
  const teams = [...participants].sort(() => Math.random() - 0.5);
  
  const round1Matches: any[] = [];
  const round2Teams: any[] = [];

  // Assign Round 1 matches
  for (let i = 0; i < r1MatchesCount; i++) {
    round1Matches.push({
      match_id: matchId++,
      round_number: 1,
      round_label: getKnockoutRoundLabel(1, totalRounds),
      group_name: "Knockout",
      team_a_id: teams[i * 2].id,
      team_a_name: teams[i * 2].name,
      team_b_id: teams[i * 2 + 1].id,
      team_b_name: teams[i * 2 + 1].name,
      next_match_id: null,
      status: "scheduled"
    });
  }
  
  // Remaining teams get byes
  for (let i = r1MatchesCount * 2; i < n; i++) {
    round2Teams.push(teams[i]);
  }
  
  matches.push(...round1Matches);
  
  let previousRoundMatches = [...round1Matches];
  let currentRoundNum = 2;
  let matchesInCurrentRound = nextPowerOf2 / 4; 
  
  // Build remaining bracket & link next_match_id
  while (matchesInCurrentRound >= 1) {
    const currentRoundMatches: any[] = [];
    
    for (let i = 0; i < matchesInCurrentRound; i++) {
      let teamA = { id: null as string | null, name: "TBD" };
      let teamB = { id: null as string | null, name: "TBD" };
      let sourceMatchA: any = null;
      let sourceMatchB: any = null;

      if (currentRoundNum === 2 && round2Teams.length > 0) {
        const team = round2Teams.shift()!;
        teamA = { id: team.id, name: team.name };
      } else if (previousRoundMatches.length > 0) {
        sourceMatchA = previousRoundMatches.shift();
      }

      if (currentRoundNum === 2 && round2Teams.length > 0) {
        const team = round2Teams.shift()!;
        teamB = { id: team.id, name: team.name };
      } else if (previousRoundMatches.length > 0) {
        sourceMatchB = previousRoundMatches.shift();
      }

      const newMatch = {
        match_id: matchId++,
        round_number: currentRoundNum,
        round_label: getKnockoutRoundLabel(currentRoundNum, totalRounds),
        group_name: "Knockout",
        team_a_id: teamA.id,
        team_a_name: teamA.name,
        team_b_id: teamB.id,
        team_b_name: teamB.name,
        next_match_id: null,
        status: (teamA.id && teamB.id) ? "scheduled" : "pending"
      };
      
      currentRoundMatches.push(newMatch);
      matches.push(newMatch);

      if (sourceMatchA) sourceMatchA.next_match_id = newMatch.match_id;
      if (sourceMatchB) sourceMatchB.next_match_id = newMatch.match_id;
    }
    
    previousRoundMatches = currentRoundMatches;
    matchesInCurrentRound /= 2;
    currentRoundNum++;
  }
  
  return { matches, nextId: matchId };
}

// ── Algorithm 2: Single Round-Robin (Circle Method) ──
function generateSingleRoundRobin(participants: any[], startMatchId = 1, groupName = "League") {
  const matches: any[] = [];
  let matchId = startMatchId;
  const teams = [...participants];
  
  // Inject Dummy BYE team if odd
  if (teams.length % 2 !== 0) {
    teams.push({ id: "BYE", name: "BYE" });
  }

  const numRounds = teams.length - 1;
  const half = teams.length / 2;

  for (let round = 1; round <= numRounds; round++) {
    for (let i = 0; i < half; i++) {
      const teamA = teams[i];
      const teamB = teams[teams.length - 1 - i];

      // Skip matches against BYE dummy
      if (teamA.id !== "BYE" && teamB.id !== "BYE") {
        matches.push({
          match_id: matchId++,
          round_number: round,
          group_name: groupName,
          team_a_id: teamA.id,
          team_a_name: teamA.name,
          team_b_id: teamB.id,
          team_b_name: teamB.name,
          next_match_id: null,
          status: "scheduled"
        });
      }
    }
    // Circle rotation: keep [0] fixed, pop last, splice into [1]
    teams.splice(1, 0, teams.pop());
  }
  
  return { matches, nextId: matchId };
}

// ── Algorithm 3: Double Round-Robin ──
function generateDoubleRoundRobin(participants: any[], startMatchId = 1, groupName = "League") {
  // Leg 1
  const { matches: leg1Matches, nextId } = generateSingleRoundRobin(participants, startMatchId, groupName);
  
  // Leg 2: Mirror and swap Home/Away
  const numRoundsLeg1 = Math.max(...leg1Matches.map(m => m.round_number), 0);
  let currentMatchId = nextId;
  
  const leg2Matches = leg1Matches.map(m => {
    return {
      match_id: currentMatchId++,
      round_number: m.round_number + numRoundsLeg1,
      group_name: groupName,
      team_a_id: m.team_b_id,
      team_a_name: m.team_b_name,
      team_b_id: m.team_a_id,
      team_b_name: m.team_a_name, // Swapped
      next_match_id: null,
      status: "scheduled"
    };
  });
  
  return { matches: [...leg1Matches, ...leg2Matches], nextId: currentMatchId };
}

// ── Algorithm 4: Multi-Stage ──
function generateMultiStage(participants: any[], numGroups: number, teamsAdvancingPerGroup: number) {
  const matches: any[] = [];
  let matchId = 1;
  const teams = [...participants].sort(() => Math.random() - 0.5);
  
  // Initialize group arrays
  const groups = Array.from({ length: numGroups }, () => []);
  
  // Distribute teams evenly
  teams.forEach((team, index) => {
    (groups[index % numGroups] as any[]).push(team);
  });
  
  // 1. Group Stage (Single Round Robin per group)
  for (let i = 0; i < numGroups; i++) {
    const groupName = `Group ${String.fromCharCode(65 + i)}`;
    const result = generateSingleRoundRobin(groups[i] as any[], matchId, groupName);
    matches.push(...result.matches);
    matchId = result.nextId;
  }
  
  // 2. Knockout Stage Seeding
  const advancingTeams: any[] = [];
  for (let i = 0; i < numGroups; i++) {
    for (let j = 1; j <= teamsAdvancingPerGroup; j++) {
      advancingTeams.push({
        id: null, // Placeholder ID
        name: `Group ${String.fromCharCode(65 + i)} Seed ${j}`
      });
    }
  }
  
  // Create knockout bracket for advancing teams
  const maxGroupRound = Math.max(...matches.map(m => m.round_number), 0);
  const koResult = generateSingleKnockout(advancingTeams, matchId);
  
  // Shift round numbers for knockout matches
  const koMatches = koResult.matches.map(m => ({
    ...m,
    round_number: m.round_number + maxGroupRound,
    group_name: "Knockout Phase"
  }));
  
  matches.push(...koMatches);
  
  return matches;
}

export async function POST(
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
    let { scheduleType, numGroups = 1, teamsAdvancing = 2 } = body;

    const validTypes = ["single-knockout", "single-round-robin", "double-round-robin", "multi-stage"];
    if (!scheduleType || !validTypes.includes(scheduleType)) {
      return NextResponse.json({ error: "Invalid schedule type" }, { status: 400 });
    }

    const db = await getDb();
    
    // Check game access
    const game = await db.collection("games").findOne({ _id: new ObjectId(params.id) });
    if (!game) return NextResponse.json({ error: "Game not found" }, { status: 404 });
    if (admin.role === "head" && game.createdBy !== admin.uid) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Registration must be closed
    if (game.isActive) {
      return NextResponse.json({ error: "Registration is still open. Please close registration before generating a schedule." }, { status: 400 });
    }

    // Lock: once schedule is generated, only superadmin can regenerate
    if (game.matches && game.matches.length > 0 && admin.role !== "superadmin") {
      return NextResponse.json({ error: "Schedule already exists. Only admin can regenerate the schedule." }, { status: 403 });
    }

    // Fetch verified registrations
    const registrations = await db.collection("registrations").find({ 
      gameId: params.id,
      status: "verified" 
    }).toArray();

    const participants = registrations.map(r => ({
      id: r._id.toString(),
      name: r.teamName || (r.players && r.players[0] ? r.players[0].name : "Unknown")
    }));

    const total = participants.length;

    // ── Strict Edge-Case Validation ──
    if (total === 0) {
      return NextResponse.json({ error: "No verified registrations found." }, { status: 400 });
    }
    
    // 1-Team Exception
    if (total === 1) {
      // Mark as champion and return total_matches = 0
      await db.collection("games").updateOne(
        { _id: new ObjectId(params.id) }, 
        { $set: { scheduleType, total_matches: 0, matches: [], status: "completed" } }
      );
      
      // Also update the single registration status to indicate champion
      await db.collection("registrations").updateOne(
        { _id: registrations[0]._id },
        { $set: { champion: true } }
      );

      return NextResponse.json({ 
        success: true, 
        total_matches: 0, 
        matches: [], 
        message: "1-Team exception: Marked as champion" 
      });
    }

    // 2-Team Edge Case mapping & Imbalance protection
    if (total === 2 && scheduleType === "multi-stage") {
      scheduleType = "single-knockout";
    }
    if (scheduleType === "multi-stage" && total < numGroups) {
      numGroups = 1; // Collapse to single group
    }

    // ── Generate Matches ──
    let matches: any[] = [];
    if (scheduleType === "single-knockout") {
      matches = generateSingleKnockout(participants).matches;
    } else if (scheduleType === "single-round-robin") {
      matches = generateSingleRoundRobin(participants).matches;
    } else if (scheduleType === "double-round-robin") {
      matches = generateDoubleRoundRobin(participants).matches;
    } else if (scheduleType === "multi-stage") {
      matches = generateMultiStage(participants, parseInt(numGroups), parseInt(teamsAdvancing));
    }

    // Update database
    await db.collection("games").updateOne(
      { _id: new ObjectId(params.id) },
      { $set: { scheduleType, matches, total_matches: matches.length } }
    );

    return NextResponse.json({ success: true, total_matches: matches.length, matches });

  } catch (error) {
    console.error("POST /api/games/[id]/schedule error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
