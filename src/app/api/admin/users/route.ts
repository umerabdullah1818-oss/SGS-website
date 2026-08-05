import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { getCurrentAdmin, hasPermission } from "@/lib/auth";
import { Permission } from "@/types";
import bcrypt from "bcryptjs";
import { ObjectId } from "mongodb";

export async function GET() {
  try {
    const admin = await getCurrentAdmin();
    if (!hasPermission(admin, Permission.ManageUsers)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const db = await getDb();
    const users = await db.collection("admins").find({}, { projection: { passwordHash: 0 } }).toArray();

    return NextResponse.json({ users });
  } catch (error) {
    console.error("GET /api/admin/users error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const admin = await getCurrentAdmin();
    if (!hasPermission(admin, Permission.ManageUsers)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { email, password, role, assignedGame, designation, permissions } = await request.json();

    if (!email || !password || !["superadmin", "head", "user"].includes(role)) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    // Escalation Prevention: Only allow granting permissions the current user has (or superadmin)
    if (permissions && Array.isArray(permissions)) {
      for (const p of permissions) {
        if (!hasPermission(admin, p as Permission)) {
          return NextResponse.json({ error: `Cannot grant permission you don't have: ${p}` }, { status: 403 });
        }
      }
    }

    if (!email.toLowerCase().endsWith("@cfd.nu.edu.pk")) {
      return NextResponse.json({ error: "Email must be a valid FAST campus address (@cfd.nu.edu.pk)" }, { status: 400 });
    }
    
    if (role === "head" && !assignedGame?.trim()) {
      return NextResponse.json({ error: "Game Head must have an assigned game" }, { status: 400 });
    }

    const db = await getDb();
    const existing = await db.collection("admins").findOne({ email });
    if (existing) {
      return NextResponse.json({ error: "Email already exists" }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const now = new Date().toISOString();

    const result = await db.collection("admins").insertOne({
      email,
      passwordHash,
      role,
      assignedGame: role === "head" ? assignedGame?.trim() : undefined,
      designation: designation?.trim() || undefined,
      permissions: permissions || [],
      createdAt: now,
      updatedAt: now,
    });

    return NextResponse.json({ id: result.insertedId.toString(), success: true });
  } catch (error) {
    console.error("POST /api/admin/users error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const admin = await getCurrentAdmin();
    if (!hasPermission(admin, Permission.ManageUsers)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { userId, permissions } = await request.json();

    if (!userId || !Array.isArray(permissions)) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    // Escalation Prevention
    for (const p of permissions) {
      if (!hasPermission(admin, p as Permission)) {
        return NextResponse.json({ error: `Cannot grant permission you don't have: ${p}` }, { status: 403 });
      }
    }

    const db = await getDb();
    const result = await db.collection("admins").updateOne(
      { _id: new ObjectId(userId) },
      { $set: { permissions, updatedAt: new Date().toISOString() } }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PUT /api/admin/users error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
