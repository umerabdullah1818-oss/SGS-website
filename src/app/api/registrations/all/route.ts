import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { getCurrentAdmin } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const gameId = searchParams.get("gameId");
    
    const db = await getDb();
    let filter: any = {};
    
    if (admin.role === "head" && admin.assignedGame) {
      filter.gameNameSnapshot = admin.assignedGame;
    } else if (gameId) {
      filter.gameId = gameId;
    }
    
    const docs = await db.collection("registrations")
      .find(filter)
      .sort({ createdAt: -1 })
      .toArray();

    const registrations = docs.map(({ _id, ...rest }) => ({ id: _id.toString(), ...rest }));

    return NextResponse.json({ registrations });
  } catch (error) {
    console.error("GET /api/registrations error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
