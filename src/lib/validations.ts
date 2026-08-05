import { z } from "zod";

// ══════════════════════════════════════════════════════════
//  SGS – Zod Validation Schemas
//  One source of truth: used by both client forms and
//  server route handlers. Mirrors types/index.ts.
// ══════════════════════════════════════════════════════════

// ── Enums / Primitives ───────────────────────────────────

export const rosterTypeSchema = z.enum(["individual", "team"]);
export const fieldTypeSchema = z.enum(["text", "number", "select", "radio"]);
export const registrationStatusSchema = z.enum(["pending", "verified", "rejected"]);
export const gameApprovalStatusSchema = z.enum(["pending", "approved", "rejected"]);

// ── Game Definition ──────────────────────────────────────

export const gameFormatSchema = z.object({
  formatName: z.string().min(1, "Format name is required"),
  fee: z.number().min(0, "Fee must be non-negative"),
  rosterType: rosterTypeSchema,
  hasCaptain: z.boolean(),
  minPlayers: z.number().int().min(1, "Minimum 1 player"),
  maxPlayers: z.number().int().min(1, "Minimum 1 player"),
}).refine(
  (data) => data.maxPlayers >= data.minPlayers,
  { message: "Max players must be ≥ min players", path: ["maxPlayers"] }
);

export const extraFieldSchema = z.object({
  label: z.string().min(1, "Label is required"),
  fieldType: fieldTypeSchema,
  options: z.array(z.string().min(1)).optional(),
  required: z.boolean(),
}).refine(
  (data) => {
    if (data.fieldType === "select" || data.fieldType === "radio") {
      return data.options && data.options.length >= 2;
    }
    return true;
  },
  { message: "Select/radio fields must have at least 2 options", path: ["options"] }
);

export const gameSchema = z.object({
  name: z.string().min(1, "Game name is required"),
  category: z.string().min(1, "Category is required"),
  venue: z.string().min(1, "Venue is required"),
  isActive: z.boolean().default(true),
  approvalStatus: gameApprovalStatusSchema.default("pending"),
  description: z.string().optional(),
  eventName: z.string().optional(),
  eventDate: z.string().min(1, "Event date is required"),
  eventHeadName: z.string().min(1, "Event head name is required"),
  eventHeadPhone: z.string().min(1, "Event head phone is required"),
  eventCoHeadName: z.string().optional(),
  eventCoHeadPhone: z.string().optional(),
  rules: z.array(z.string()).min(1, "At least one rule is required"),
  formats: z.array(gameFormatSchema).min(1, "At least one format is required"),
  extraFields: z.array(extraFieldSchema),
  registrationDeadline: z.string().optional(),
});

export type GameFormData = z.infer<typeof gameSchema>;

// ── Player & Registration ────────────────────────────────

export const playerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  rollNumber: z.string().min(1, "Roll number is required"),
  phone: z.string().optional(),
});

export const captainSchema = playerSchema.extend({
  contactNumber: z.string().min(1, "Captain contact number is required"),
});

export const paymentDetailsSchema = z.object({
  dateOfTransaction: z.string().min(1, "Transaction date is required"),
  source: z.string().min(1, "Payment source is required"),
  transactionId: z.string().min(1, "Transaction ID is required"),
  amountTransferred: z.number().min(0, "Amount must be non-negative"),
  screenshotUrl: z.string().min(1, "Screenshot is required"),
});

/**
 * Registration schema factory — dynamically builds validation
 * based on the live game definition's format. This is the key
 * to "nothing is hardcoded": the schema adapts to whatever
 * the admin has configured for a given game.
 */
export function createRegistrationSchema(
  format: {
    rosterType: "individual" | "team";
    hasCaptain: boolean;
    minPlayers: number;
    maxPlayers: number;
  },
  extraFields: Array<{
    label: string;
    fieldType: string;
    options?: string[];
    required: boolean;
  }>
) {
  // Build dynamic extra-answers schema from game's extraFields
  const extraAnswersShape: Record<string, z.ZodTypeAny> = {};
  for (const field of extraFields) {
    let fieldSchema: z.ZodTypeAny = z.string();
    if (field.fieldType === "number") {
      fieldSchema = z.string().regex(/^\d+(\.\d+)?$/, `${field.label} must be a number`);
    }
    if (field.options && field.options.length > 0) {
      fieldSchema = z.enum(field.options as [string, ...string[]]);
    }
    if (field.required) {
      fieldSchema = fieldSchema.pipe(z.string().min(1, `${field.label} is required`));
    } else {
      fieldSchema = fieldSchema.optional();
    }
    extraAnswersShape[field.label] = fieldSchema;
  }

  const baseSchema = z.object({
    gameId: z.string().min(1),
    formatName: z.string().min(1),
    teamName: format.rosterType === "team" ? z.string().min(1, "Team name is required") : z.string().optional(),
    captain: format.hasCaptain ? captainSchema : z.any().optional(),
    players: z.array(playerSchema)
      .min(format.minPlayers, `At least ${format.minPlayers} player(s) required`)
      .max(format.maxPlayers, `At most ${format.maxPlayers} player(s) allowed`),
    extraAnswers: z.object(extraAnswersShape),
    payment: paymentDetailsSchema,
  });

  return baseSchema;
}

// ── Results ──────────────────────────────────────────────

export const standingSchema = z.object({
  position: z.number().int().min(1),
  name: z.string().min(1, "Winner name is required"),
  rollNumbers: z.array(z.string()).optional(),
});

export const resultEntrySchema = z.object({
  seasonYear: z.number().int().min(2000).max(2100),
  gameId: z.string().nullable(),
  gameNameSnapshot: z.string().min(1, "Game name is required"),
  category: z.string().min(1, "Category is required"),
  formatName: z.string().optional(),
  standings: z.array(standingSchema).min(1, "At least one standing is required"),
  notes: z.string().optional(),
  photoUrl: z.string().url().optional().or(z.literal("")),
});

export type ResultFormData = z.infer<typeof resultEntrySchema>;

// ── Config ───────────────────────────────────────────────

export const paymentConfigSchema = z.object({
  bankName: z.string().min(1, "Bank name is required"),
  accountTitle: z.string().min(1, "Account title is required"),
  accountNumber: z.string().min(1, "Account number is required"),
  instructions: z.string().min(1, "Instructions are required"),
});

export type PaymentConfigFormData = z.infer<typeof paymentConfigSchema>;

// ── CSV Import ───────────────────────────────────────────

export const csvResultRowSchema = z.object({
  gameName: z.string().min(1),
  seasonYear: z.coerce.number().int().min(2000).max(2100),
  category: z.string().min(1),
  position: z.coerce.number().int().min(1),
  winnerName: z.string().min(1),
  rollNumbers: z.string().optional(), // comma-separated
});

// ── Team Members ─────────────────────────────────────────

export const roleGroupSchema = z.enum(["Mentor", "Executive Body", "Game Head", "Core Committee"]);

export const teamMemberSchema = z.object({
  name: z.string().min(1, "Name is required"),
  designation: z.string().min(1, "Designation is required"),
  roleGroup: roleGroupSchema,
  year: z.string().min(1, "Year is required"),
  photoUrl: z.string().optional(),
  successStory: z.string().optional(),
  importance: z.string().optional(),
  feedback: z.string().optional(),
});

export type TeamMemberFormData = z.infer<typeof teamMemberSchema>;
