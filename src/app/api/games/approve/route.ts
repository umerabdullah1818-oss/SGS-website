import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import { getCurrentAdmin } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin || admin.role !== "superadmin") {
      return NextResponse.json({ error: "Unauthorized. Only superadmins can approve games." }, { status: 403 });
    }

    const { id, status } = await request.json();
    if (!id || !["approved", "rejected", "pending"].includes(status)) {
      return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
    }

    const db = await getDb();
    await db.collection("games").updateOne(
      { _id: new ObjectId(id) },
      { $set: { approvalStatus: status, updatedAt: new Date().toISOString() } }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("POST /api/games/approve error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
