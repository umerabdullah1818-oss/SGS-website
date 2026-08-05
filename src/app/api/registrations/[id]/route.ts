import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";

export async function GET(request: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    if (!ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: "Invalid registration ID" }, { status: 400 });
    }

    const db = await getDb();
    const doc = await db.collection("registrations").findOne({ _id: new ObjectId(params.id) });
    
    if (!doc) {
      return NextResponse.json({ error: "Registration not found" }, { status: 404 });
    }
    const { _id, ...rest } = doc;
    return NextResponse.json({ registration: { id: _id.toString(), ...rest } });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(request: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    if (!ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: "Invalid registration ID" }, { status: 400 });
    }

    const body = await request.json();
    const { status } = body;

    if (!["pending", "verified", "rejected"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const db = await getDb();
    await db.collection("registrations").updateOne(
      { _id: new ObjectId(params.id) },
      { 
        $set: { 
          status,
          updatedAt: new Date().toISOString(),
        } 
      }
    );
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(request: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    if (!ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: "Invalid registration ID" }, { status: 400 });
    }

    const db = await getDb();
    await db.collection("registrations").deleteOne({ _id: new ObjectId(params.id) });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
