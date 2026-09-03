import { z } from "zod";
import { US_STATES, normalizeState } from "./states";

const stateCodes = US_STATES.map((s) => s.code) as [string, ...string[]];

function moneyNumber(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  const cleaned = String(value ?? "")
    .replace(/[$,\s]/g, "")
    .trim();
  if (!cleaned) return value;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : value;
}

export const claimFormSchema = z.object({
  state: z.preprocess(normalizeState, z.enum(stateCodes)),
  year: z.preprocess(moneyNumber, z.number().int().min(1985).max(2028)),
  make: z.string().trim().min(1).max(40),
  model: z.string().trim().min(1).max(60),
  mileage: z.preprocess(moneyNumber, z.number().int().min(0).max(500_000)),
  preAccidentValue: z.preprocess(
    moneyNumber,
    z.number().positive().max(500_000)
  ),
  repairCost: z.preprocess(moneyNumber, z.number().min(0).max(500_000)),
  structural: z.enum(["yes", "no"]),
  insurerName: z.string().trim().min(2).max(80),
  claimType: z.enum(["first", "third"]),
  atFaultName: z.string().trim().min(2).max(80),
});

export type ClaimForm = z.infer<typeof claimFormSchema>;

const FIELD_LABEL: Record<string, string> = {
  state: "State",
  year: "Year",
  make: "Make",
  model: "Model",
  mileage: "Mileage",
  preAccidentValue: "Pre-accident value",
  repairCost: "Repair amount",
  structural: "Structural damage",
  insurerName: "Insurer name",
  claimType: "Whose insurer",
  atFaultName: "At-fault driver name",
};

export function parseClaimForm(input: unknown) {
  return claimFormSchema.safeParse(input);
}

export function formErrorMessage(error: z.ZodError) {
  const names = error.issues.map(
    (issue) => FIELD_LABEL[String(issue.path[0])] ?? String(issue.path[0])
  );
  const unique = [...new Set(names)].filter(Boolean);
  if (unique.includes("State") && unique.length === 1) {
    return "Pick the state where the wreck happened.";
  }
  return `Check ${unique.join(", ") || "the required fields"}.`;
}

export function vehicleLine(form: ClaimForm) {
  return `${form.year} ${form.make} ${form.model}`;
}
