// ══════════════════════════════════════════════════════════
//  SGS – Shared Type Definitions
//  These are typed SHAPES; the CONTENT is always data from
//  Firestore, never hardcoded game names or literals.
// ══════════════════════════════════════════════════════════

/** How a roster is organized for a particular format */
export type RosterType = "individual" | "team";

/** Supported field types for admin-defined custom questions */
export type FieldType = "text" | "number" | "select" | "radio";

/** Registration verification status */
export type RegistrationStatus = "pending" | "verified" | "rejected";

/** Game approval status */
export type GameApprovalStatus = "pending" | "approved" | "rejected";

/** Podium position (extendable beyond 3 if needed) */
export type StandingPosition = number;

// ── Game Definition ──────────────────────────────────────

export interface GameFormat {
  formatName: string;       // e.g. "1v1", "2v2", "Team", "Singles"
  fee: number;
  rosterType: RosterType;
  hasCaptain: boolean;
  minPlayers: number;
  maxPlayers: number;
}

export interface ExtraField {
  label: string;
  fieldType: FieldType;
  options?: string[];       // for select/radio types
  required: boolean;
}

export interface Game {
  id: string;
  name: string;
  category: string;         // free text set by admin: "Boys" / "Girls" / "Open"
  venue: string;
  isActive: boolean;
  approvalStatus: GameApprovalStatus;
  eventName?: string;       // e.g. "Sports Week", "Pre Daira Events"
  description?: string;
  eventDate: string;
  eventHeadName: string;
  eventHeadPhone: string;
  eventCoHeadName?: string;
  eventCoHeadPhone?: string;
  rules: string[];
  formats: GameFormat[];
  extraFields: ExtraField[];
  registrationDeadline?: string;  // ISO date string, optional per-game
  createdBy?: string;             // admin/head UID
  createdAt: string;
  updatedAt: string;
}

// ── Player & Registration ────────────────────────────────

export interface Player {
  name: string;
  rollNumber: string;
  phone?: string;
}

export interface Captain extends Player {
  contactNumber: string;
}

export interface PaymentDetails {
  dateOfTransaction: string;
  source: string;
  transactionId: string;
  amountTransferred: number;
  screenshotUrl: string;
}

export interface Registration {
  id: string;
  gameId: string;
  gameNameSnapshot: string;     // frozen at submission time
  formatName: string;
  feeSnapshot: number;          // frozen at submission time
  teamName?: string;
  captain?: Captain;
  players: Player[];
  extraAnswers: Record<string, string>;
  payment: PaymentDetails;
  status: RegistrationStatus;
  createdAt: string;
}

// ── Results Archive ──────────────────────────────────────

export interface Standing {
  position: StandingPosition;   // 1 = 1st, 2 = 2nd, 3 = 3rd, etc.
  name: string;                 // player name or team name
  rollNumbers?: string[];       // for teams, all member roll numbers
}

export interface ResultEntry {
  id: string;
  seasonYear: number;           // e.g. 2026
  gameId: string | null;        // null if the game was later deleted
  gameNameSnapshot: string;     // always stored, survives game renames/deletes
  category: string;             // snapshot at time of result
  formatName?: string;          // e.g. "2v2", if relevant
  standings: Standing[];
  notes?: string;               // e.g. "Final abandoned due to rain"
  photoUrl?: string;            // optional winner photo / certificate
  createdAt: string;
}

// ── Config ───────────────────────────────────────────────

export interface PaymentConfig {
  bankName: string;
  accountTitle: string;
  accountNumber: string;
  instructions: string;
}

// ── Admin ────────────────────────────────────────────────

export enum Permission {
  ManageTeam = "manage_team",
  ManageConfig = "manage_config",
  ManageUsers = "manage_users",
}

export interface AdminUser {
  uid: string;
  email: string;
  displayName?: string;
  role: "superadmin" | "head" | "user";
  assignedGame?: string;
  designation?: string;
  permissions?: Permission[];
  createdAt: string;
}

// ── Team Members ────────────────────────────────────────

export type RoleGroup = "Mentor" | "Executive Body" | "Game Head" | "Core Committee";

export interface TeamMember {
  id: string;
  name: string;
  designation: string;       // e.g. "President", "Cricket Head"
  roleGroup: RoleGroup;
  year: string;              // e.g. "2025-26", "2024-25"
  photoUrl?: string;
  successStory?: string;     // their bio / achievements
  importance?: string;       // why they matter to SGS
  feedback?: string;         // feedback from SGS about them
  createdAt: string;
  updatedAt: string;
}
