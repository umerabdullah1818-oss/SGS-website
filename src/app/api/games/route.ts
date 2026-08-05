import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import { gameSchema } from "@/lib/validations";
import { getCurrentAdmin } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const all = searchParams.get("all") === "true";

    const db = await getDb();
    const gamesCol = db.collection("games");

    if (id) {
      if (!ObjectId.isValid(id)) {
        return NextResponse.json({ error: "Invalid game ID" }, { status: 400 });
      }
      const doc = await gamesCol.findOne({ _id: new ObjectId(id) });
      if (!doc) {
        return NextResponse.json({ error: "Game not found" }, { status: 404 });
      }
      const { _id, ...rest } = doc;
      return NextResponse.json({ game: { id: _id.toString(), ...rest } });
    }

    const admin = await getCurrentAdmin();
    const isHead = admin?.role === "head";
    
    // For "all" games list, if user is a head, only show their own games.
    // If user is superadmin, show all games.
    let filter: any = all ? {} : { isActive: true, approvalStatus: "approved" };
    
    if (isHead) {
      filter.createdBy = admin.uid;
    }

    const docs = await gamesCol
      .find(filter)
      .sort({ createdAt: -1 })
      .toArray();

    const games = docs.map(({ _id, ...rest }) => ({ id: _id.toString(), ...rest }));

    return NextResponse.json({ games });
  } catch (error) {
    console.error("GET /api/games error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = gameSchema.parse(body);

    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (admin.role === "head" && admin.assignedGame) {
      if (validatedData.name !== admin.assignedGame) {
        return NextResponse.json({ error: `You are only authorized to create games for ${admin.assignedGame}` }, { status: 403 });
      }
    }

    const now = new Date().toISOString();
    const gameDoc = {
      ...validatedData,
      approvalStatus: admin.role === "superadmin" ? "approved" : "pending",
      createdBy: admin.uid,
      createdAt: now,
      updatedAt: now,
    };

    const db = await getDb();
    const result = await db.collection("games").insertOne(gameDoc);
    
    return NextResponse.json({ id: result.insertedId.toString(), ...gameDoc }, { status: 201 });
  } catch (error) {
    console.error("POST /api/games error:", error);
    return NextResponse.json({ error: "Invalid data or Server Error" }, { status: 400 });
  }
}

export async function PUT(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    
    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Missing or invalid game ID" }, { status: 400 });
    }

    const body = await request.json();
    const { createdAt, id: _bodyId, ...rest } = body;
    void createdAt;
    void _bodyId;
    
    const validatedData = gameSchema.parse(rest);

    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (admin.role === "head" && admin.assignedGame) {
      if (validatedData.name !== admin.assignedGame) {
        return NextResponse.json({ error: `You are only authorized to edit games for ${admin.assignedGame}` }, { status: 403 });
      }
    }

    const updateData: any = {
      ...validatedData,
      updatedAt: new Date().toISOString(),
    };
    
    // If it's a head editing their game, they can't change approvalStatus directly here.
    // But if superadmin is editing, we can let them change it, or handle it via a separate endpoint.
    // We will leave approvalStatus as whatever came in from the client for now, but 
    // ideally, heads shouldn't be able to auto-approve.
    if (admin.role === "head") {
      updateData.approvalStatus = "pending"; // force back to pending on edit? Or keep it.
      // Actually, if a head edits an approved game, it might need re-approval.
      // We will force it to pending.
    }

    const db = await getDb();
    await db.collection("games").updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PUT /api/games error:", error);
    return NextResponse.json({ error: "Invalid data or Server Error" }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    
    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Missing or invalid game ID" }, { status: 400 });
    }

    const db = await getDb();
    await db.collection("games").deleteOne({ _id: new ObjectId(id) });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/games error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
