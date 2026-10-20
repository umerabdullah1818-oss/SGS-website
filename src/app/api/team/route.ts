import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import { teamMemberSchema } from "@/lib/validations";
import { getCurrentAdmin, hasPermission } from "@/lib/auth";
import { Permission } from "@/types";

// GET /api/team — list team members and years, optionally filtered by ?year=
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const year = searchParams.get("year");
    const id = searchParams.get("id");

    const db = await getDb();
    const col = db.collection("team_members");

    if (id) {
      if (!ObjectId.isValid(id)) {
        return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
      }
      const doc = await col.findOne({ _id: new ObjectId(id) });
      if (!doc) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      }
      const { _id, ...rest } = doc;
      return NextResponse.json({ member: { id: _id.toString(), ...rest } });
    }

    // Get all distinct years in descending order
    const years = await col.distinct("year");
    const sortedYears = (years as string[]).sort((a, b) => b.localeCompare(a));

    // Default to the most recent year if not specified
    const selectedYear = year || sortedYears[0] || "2025-26";

    const filter: any = { year: selectedYear };
    const docs = await col.find(filter).sort({ roleGroupOrder: 1, createdAt: 1 }).toArray();
    const members = docs.map(({ _id, ...rest }) => ({ id: _id.toString(), ...rest }));

    return NextResponse.json({
      members,
      selectedYear,
      years: sortedYears,
    });
  } catch (error) {
    console.error("GET /api/team error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// POST /api/team — create a new team member (superadmin only)
export async function POST(request: Request) {
  try {
    const admin = await getCurrentAdmin();
    if (!hasPermission(admin, Permission.ManageTeam)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const data = teamMemberSchema.parse(body);

    const roleGroupOrder: Record<string, number> = {
      "Core Committee": 0,
      "Game Heads": 1,
      "Co-Heads": 2,
    };

    const now = new Date().toISOString();
    const doc = {
      ...data,
      roleGroupOrder: roleGroupOrder[data.roleGroup] ?? 99,
      createdAt: now,
      updatedAt: now,
    };

    const db = await getDb();
    const result = await db.collection("team_members").insertOne(doc);

    return NextResponse.json({ id: result.insertedId.toString(), ...doc }, { status: 201 });
  } catch (error) {
    console.error("POST /api/team error:", error);
    return NextResponse.json({ error: "Invalid data or Server Error" }, { status: 400 });
  }
}

// PUT /api/team?id= — update a team member (superadmin only)
export async function PUT(request: Request) {
  try {
    const admin = await getCurrentAdmin();
    if (!hasPermission(admin, Permission.ManageTeam)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const body = await request.json();
    const data = teamMemberSchema.parse(body);

    const roleGroupOrder: Record<string, number> = {
      "Core Committee": 0,
      "Game Heads": 1,
      "Co-Heads": 2,
    };

    const db = await getDb();
    await db.collection("team_members").updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          ...data,
          roleGroupOrder: roleGroupOrder[data.roleGroup] ?? 99,
          updatedAt: new Date().toISOString(),
        },
      }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PUT /api/team error:", error);
    return NextResponse.json({ error: "Invalid data or Server Error" }, { status: 400 });
  }
}

// DELETE /api/team?id= — delete a team member (superadmin only)
export async function DELETE(request: Request) {
  try {
    const admin = await getCurrentAdmin();
    if (!hasPermission(admin, Permission.ManageTeam)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const db = await getDb();
    await db.collection("team_members").deleteOne({ _id: new ObjectId(id) });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/team error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
