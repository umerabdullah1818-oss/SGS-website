import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { createToken, setAuthCookie } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const { email, password, name } = await request.json();

    if (!email || !password || !name) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!email.toLowerCase().endsWith("@cfd.nu.edu.pk")) {
      return NextResponse.json({ error: "Only @cfd.nu.edu.pk emails are allowed" }, { status: 400 });
    }

    const db = await getDb();
    
    // Check if user already exists
    const existing = await db.collection("admins").findOne({ email: email.toLowerCase() });
    if (existing) {
      return NextResponse.json({ error: "Email already exists" }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const now = new Date().toISOString();

    const userDoc = {
      email: email.toLowerCase(),
      displayName: name,
      passwordHash,
      role: "user",
      createdAt: now,
      updatedAt: now,
    };

    const result = await db.collection("admins").insertOne(userDoc);
    
    // Auto login
    const token = createToken({
      uid: result.insertedId.toString(),
      email: userDoc.email,
      role: userDoc.role,
    });

    await setAuthCookie(token);

    return NextResponse.json({
      success: true,
      user: {
        uid: result.insertedId.toString(),
        email: userDoc.email,
        displayName: userDoc.displayName,
        role: userDoc.role,
      }
    });

  } catch (error) {
    console.error("POST /api/auth/register error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
