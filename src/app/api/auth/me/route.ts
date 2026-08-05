// ══════════════════════════════════════════════════════════
//  GET  /api/auth/me     — Check current session
//  POST /api/auth/me     — Logout (clear cookie)
// ══════════════════════════════════════════════════════════

import { NextResponse } from "next/server";
import { getCurrentAdmin, clearAuthCookie } from "@/lib/auth";

export async function GET() {
  try {
    const admin = await getCurrentAdmin();

    if (!admin) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    return NextResponse.json({
      user: {
        uid: admin.uid,
        email: admin.email,
        role: admin.role,
        assignedGame: admin.assignedGame,
        permissions: admin.permissions || [],
      },
    });
  } catch (error) {
    console.error("GET /api/auth/me error:", error);
    return NextResponse.json({ user: null }, { status: 401 });
  }
}

/** POST = logout */
export async function POST() {
  try {
    await clearAuthCookie();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("POST /api/auth/me error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
