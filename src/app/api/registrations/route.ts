import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import { createRegistrationSchema } from "@/lib/validations";
import { getCurrentAdmin } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const user = await getCurrentAdmin();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // 1. Fetch the live game definition from MongoDB
    if (!body.gameId) {
      return NextResponse.json({ error: "Game ID is required" }, { status: 400 });
    }

    if (!ObjectId.isValid(body.gameId)) {
      return NextResponse.json({ error: "Invalid Game ID" }, { status: 400 });
    }

    const db = await getDb();
    
    // Check if user already registered for this game
    const existingRegistration = await db.collection("registrations").findOne({ 
      gameId: body.gameId, 
      userId: user.uid 
    });
    if (existingRegistration) {
      return NextResponse.json({ error: "You have already registered for this game." }, { status: 403 });
    }

    const gameDoc = await db.collection("games").findOne({ _id: new ObjectId(body.gameId) });
    if (!gameDoc) {
      return NextResponse.json({ error: "Game not found" }, { status: 404 });
    }

    if (!gameDoc.isActive) {
      return NextResponse.json({ error: "Registration is closed for this game" }, { status: 403 });
    }

    // Check deadline if applicable
    if (gameDoc.registrationDeadline) {
      if (new Date() > new Date(gameDoc.registrationDeadline)) {
        return NextResponse.json({ error: "Registration deadline has passed" }, { status: 403 });
      }
    }

    // 2. Find the requested format
    const format = gameDoc.formats.find((f: any) => f.formatName === body.formatName);
    if (!format) {
      return NextResponse.json({ error: "Invalid format selected" }, { status: 400 });
    }

    // 3. Dynamically validate the submission against the live game definition
    const dynamicSchema = createRegistrationSchema(
      {
        rosterType: format.rosterType,
        hasCaptain: format.hasCaptain,
        minPlayers: format.minPlayers,
        maxPlayers: format.maxPlayers,
      },
      gameDoc.extraFields || []
    );

    const validatedData = dynamicSchema.parse(body);

    // 4. Snapshot data and write to MongoDB
    const now = new Date().toISOString();
    
    const registrationDoc = {
      ...validatedData,
      userId: user.uid,
      gameNameSnapshot: gameDoc.name, // Frozen at submission time
      feeSnapshot: format.fee,         // Frozen at submission time
      status: "pending",               // Initial status
      createdAt: now,
    };

    const result = await db.collection("registrations").insertOne(registrationDoc);

    return NextResponse.json({ id: result.insertedId.toString(), success: true }, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/registrations error:", error);
    
    if (error.name === "ZodError") {
      return NextResponse.json({ error: "Validation failed", details: error.errors }, { status: 400 });
    }

    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
