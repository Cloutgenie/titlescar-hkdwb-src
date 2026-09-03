import { z } from "zod";
import { US_STATES } from "./states";

const stateCodes = US_STATES.map((s) => s.code) as [string, ...string[]];

export const claimFormSchema = z.object({
  state: z.enum(stateCodes),
  year: z.coerce.number().int().min(1985).max(2028),
  make: z.string().trim().min(1).max(40),
  model: z.string().trim().min(1).max(60),
  mileage: z.coerce.number().int().min(0).max(500_000),
  preAccidentValue: z.coerce.number().positive().max(500_000),
  repairCost: z.coerce.number().min(0).max(500_000),
  structural: z.enum(["yes", "no"]),
  insurerName: z.string().trim().min(2).max(80),
  claimType: z.enum(["first", "third"]),
  atFaultName: z.string().trim().min(2).max(80),
});

export type ClaimForm = z.infer<typeof claimFormSchema>;

export function parseClaimForm(input: unknown) {
  return claimFormSchema.safeParse(input);
}

export function vehicleLine(form: ClaimForm) {
  return `${form.year} ${form.make} ${form.model}`;
}
