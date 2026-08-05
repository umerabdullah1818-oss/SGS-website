import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const ext = file.name.split('.').pop() || 'png';
    const filename = `${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;
    
    // Save locally to public/uploads/payments
    const uploadDir = path.join(process.cwd(), "public", "uploads", "payments");
    
    // Ensure the directory exists
    try {
      await fs.access(uploadDir);
    } catch {
      await fs.mkdir(uploadDir, { recursive: true });
    }

    const filePath = path.join(uploadDir, filename);
    await fs.writeFile(filePath, buffer);

    // Get the public URL
    const publicUrl = `/uploads/payments/${filename}`;

    return NextResponse.json({ url: publicUrl });
  } catch (error) {
    console.error("POST /api/upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
