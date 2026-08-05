import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const gameId = searchParams.get("gameId");

    const db = await getDb();
    const filter = gameId ? { gameId } : {};
    
    const docs = await db.collection("results")
      .find(filter)
      .sort({ createdAt: -1 })
      .toArray();

    const results = docs.map(({ _id, ...rest }) => ({ id: _id.toString(), ...rest }));

    return NextResponse.json({ results });
  } catch (error) {
    console.error("GET /api/results error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    if (!body.gameId || !body.gameName || !body.firstPlace) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const db = await getDb();
    const doc = {
      gameId: body.gameId,
      gameName: body.gameName,
      category: body.category,
      formatName: body.formatName,
      firstPlace: body.firstPlace,
      secondPlace: body.secondPlace || null,
      thirdPlace: body.thirdPlace || null,
      createdAt: new Date().toISOString(),
    };

    const result = await db.collection("results").insertOne(doc);

    return NextResponse.json({ id: result.insertedId.toString(), success: true }, { status: 201 });
  } catch (error) {
    console.error("POST /api/results error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    
    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Missing or invalid ID" }, { status: 400 });
    }

    const db = await getDb();
    await db.collection("results").deleteOne({ _id: new ObjectId(id) });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
