// ══════════════════════════════════════════════════════════
//  MongoDB Seed Script
//  Creates the initial admin user using credentials from .env.local
// ══════════════════════════════════════════════════════════

import { MongoClient } from "mongodb";
import bcrypt from "bcryptjs";
import * as dotenv from "dotenv";

// Load environment variables from .env.local
dotenv.config({ path: ".env.local" });

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/sgs-website";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

async function seed() {
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    console.error("❌ ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env.local");
    process.exit(1);
  }

  const client = new MongoClient(MONGODB_URI);

  try {
    console.log("⏳ Connecting to MongoDB...");
    await client.connect();
    const db = client.db();

    const adminsCol = db.collection("admins");

    // Check if admin already exists
    const existingAdmin = await adminsCol.findOne({ email: ADMIN_EMAIL });
    if (existingAdmin) {
      console.log(`⚠️ Admin with email ${ADMIN_EMAIL} already exists.`);
      
      // Update password just in case
      console.log("⏳ Updating admin password...");
      const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);
      await adminsCol.updateOne(
        { email: ADMIN_EMAIL },
        { $set: { passwordHash, updatedAt: new Date() } }
      );
      console.log("✅ Admin password updated successfully!");
    } else {
      console.log(`⏳ Creating admin user for ${ADMIN_EMAIL}...`);
      const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);
      
      await adminsCol.insertOne({
        email: ADMIN_EMAIL,
        passwordHash,
        role: "superadmin",
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      console.log("✅ Admin user created successfully!");
    }

  } catch (error) {
    console.error("❌ Error seeding database:", error);
  } finally {
    await client.close();
    console.log("🔌 Database connection closed.");
  }
}

seed();
