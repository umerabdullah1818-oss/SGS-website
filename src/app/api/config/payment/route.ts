import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { paymentConfigSchema } from "@/lib/validations";
import { getCurrentAdmin, hasPermission } from "@/lib/auth";
import { Permission } from "@/types";

const CONFIG_DOC_ID = "paymentInfo";

export async function GET() {
  try {
    const db = await getDb();
    const doc = await db.collection("config").findOne({ _id: CONFIG_DOC_ID as any });

    if (!doc) {
      return NextResponse.json({ config: null });
    }

    const { _id, ...rest } = doc;
    return NextResponse.json({ config: rest });
  } catch (error) {
    console.error("GET /api/config/payment error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const admin = await getCurrentAdmin();
    if (!hasPermission(admin, Permission.ManageConfig)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = paymentConfigSchema.parse(body);

    const db = await getDb();
    await db.collection("config").updateOne(
      { _id: CONFIG_DOC_ID as any },
      { 
        $set: {
          ...validatedData,
          updatedAt: new Date().toISOString(),
        }
      },
      { upsert: true }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PUT /api/config/payment error:", error);
    return NextResponse.json({ error: "Invalid data or Server Error" }, { status: 400 });
  }
}
