import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { getCurrentAdmin } from "@/lib/auth";

export async function GET() {
  try {
    const db = await getDb();
    
    const registrationsCol = db.collection("registrations");
    const gamesCol = db.collection("games");
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const isHead = admin.role === "head" && admin.assignedGame;
    
    // Stats filters
    const regFilter = isHead ? { gameNameSnapshot: admin.assignedGame } : {};
    const verifiedFilter = isHead 
      ? { gameNameSnapshot: admin.assignedGame, status: "verified" } 
      : { status: "verified" };
    const gamesFilter = isHead 
      ? { name: admin.assignedGame, isActive: true } 
      : { isActive: true };

    const totalRegistrations = await registrationsCol.countDocuments(regFilter);
    const verifiedRegistrations = await registrationsCol.countDocuments(verifiedFilter);
    const activeGames = await gamesCol.countDocuments(gamesFilter);

    // Aggregate total revenue from verified registrations
    const revenueAggregation = await registrationsCol.aggregate([
      { $match: verifiedFilter },
      { $group: { _id: null, totalRevenue: { $sum: "$payment.amountTransferred" } } }
    ]).toArray();
    
    const totalRevenue = revenueAggregation.length > 0 ? revenueAggregation[0].totalRevenue : 0;

    return NextResponse.json({
      totalRegistrations,
      verifiedRegistrations,
      totalRevenue,
      activeGames,
    });
  } catch (error) {
    console.error("GET /api/stats error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
