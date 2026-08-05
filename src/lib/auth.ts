// ══════════════════════════════════════════════════════════
//  Auth Utilities — JWT + bcrypt for admin authentication
//  Replaces Firebase Auth. SERVER-SIDE ONLY.
// ══════════════════════════════════════════════════════════

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import type { Permission } from "@/types";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";
const TOKEN_COOKIE = "sgs-admin-token";
const TOKEN_EXPIRY = "7d";

export interface AdminPayload {
  uid: string;
  email: string;
  role: string;
  assignedGame?: string;
  permissions?: string[];
}

/** Check if an admin has a specific permission (or is a superadmin) */
export function hasPermission(admin: AdminPayload | null, permission: Permission): boolean {
  if (!admin) return false;
  if (admin.role === "superadmin") return true;
  return admin.permissions?.includes(permission) ?? false;
}

/** Hash a plaintext password (for seeding / creating admins) */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

/** Compare plaintext against a bcrypt hash */
export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/** Create a signed JWT for an admin user */
export function createToken(payload: AdminPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
}

/** Verify and decode a JWT, returns null if invalid/expired */
export function verifyToken(token: string): AdminPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AdminPayload;
  } catch {
    return null;
  }
}

/** Set the auth token as an httpOnly cookie */
export async function setAuthCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(TOKEN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
  });
}

/** Clear the auth cookie (logout) */
export async function clearAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(TOKEN_COOKIE);
}

/** Read the current admin from the auth cookie, returns null if not logged in */
export async function getCurrentAdmin(): Promise<AdminPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(TOKEN_COOKIE)?.value;
  if (!token) return null;
  return verifyToken(token);
}
