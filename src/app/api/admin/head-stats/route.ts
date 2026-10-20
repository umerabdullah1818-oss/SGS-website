import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { getCurrentAdmin } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const admin = await getCurrentAdmin();
    // Only superadmin can view this overall head overview
    if (!admin || admin.role !== "superadmin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = await getDb();
    
    // Fetch all admins with role "head"
    const heads = await db.collection("admins").find({ role: "head" }).toArray();
    
    // Fetch all games
    const games = await db.collection("games").find().toArray();
    
    // Aggregate registrations count per game (verified only)
    const registrations = await db.collection("registrations").aggregate([
      { $match: { status: "verified" } },
      { $group: { _id: "$gameId", count: { $sum: 1 } } }
    ]).toArray();
    
    const regCountMap = new Map(registrations.map(r => [r._id.toString(), r.count]));

    const stats = heads.map(head => {
      // Find games created by this head
      const headGames = games.filter(g => g.createdBy === head.uid);
      
      return {
        headId: head.uid,
        headEmail: head.email,
        assignedGame: head.assignedGame || "Unknown",
        games: headGames.map(g => ({
          gameId: g._id.toString(),
          gameName: g.name,
          registrationCount: regCountMap.get(g._id.toString()) || 0,
          scheduleType: g.scheduleType || "Not Scheduled"
        }))
      };
    });

    return NextResponse.json({ stats });

  } catch (error) {
    console.error("GET /api/admin/head-stats error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
