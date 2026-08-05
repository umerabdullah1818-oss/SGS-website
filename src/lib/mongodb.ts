// ══════════════════════════════════════════════════════════
//  MongoDB Connection — Singleton for Next.js
//  Used by both API routes and server-side pages.
//  Connects to local MongoDB instance.
// ══════════════════════════════════════════════════════════

import { MongoClient, Db } from "mongodb";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/sgs-website";

let client: MongoClient | null = null;
let db: Db | null = null;

/**
 * Returns a cached MongoDB database instance.
 * In development, the connection is cached on `globalThis` to survive HMR.
 */
export async function getDb(): Promise<Db> {
  if (db) return db;

  // In development, cache the client on globalThis to prevent
  // multiple connections during hot-module-replacement
  const globalAny = globalThis as any;
  if (globalAny._mongoClient) {
    client = globalAny._mongoClient;
    db = client!.db();
    return db;
  }

  client = new MongoClient(MONGODB_URI);
  await client.connect();
  db = client.db();

  if (process.env.NODE_ENV === "development") {
    globalAny._mongoClient = client;
  }

  return db;
}

/**
 * Returns a reference to a named collection.
 * Convenience wrapper so callers don't need to import Db.
 */
export async function getCollection<T extends Document = Document>(name: string) {
  const database = await getDb();
  return database.collection<T>(name);
}

export default getDb;
