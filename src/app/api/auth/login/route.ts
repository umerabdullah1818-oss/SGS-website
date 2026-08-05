// ══════════════════════════════════════════════════════════
//  POST /api/auth/login — Admin sign-in
//  Validates email + password against MongoDB admins collection,
//  returns a JWT token set as httpOnly cookie.
// ══════════════════════════════════════════════════════════

import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { verifyPassword, createToken, setAuthCookie } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const db = await getDb();
    const admin = await db.collection("admins").findOne({ email });

    if (!admin) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const isValid = await verifyPassword(password, admin.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const token = createToken({
      uid: admin._id.toString(),
      email: admin.email,
      role: admin.role || "admin",
      assignedGame: admin.assignedGame,
      permissions: admin.permissions || [],
    });

    // Set the token as an httpOnly cookie
    await setAuthCookie(token);

    return NextResponse.json({
      success: true,
      user: {
        uid: admin._id.toString(),
        email: admin.email,
        role: admin.role || "admin",
        assignedGame: admin.assignedGame,
        permissions: admin.permissions || [],
      },
    });
  } catch (error) {
    console.error("POST /api/auth/login error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
