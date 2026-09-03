export type SeventeenC = {
  preAccidentValue: number;
  mileage: number;
  structural: boolean;
  base: number;
  mileageModifier: number;
  mileageBand: string;
  damageModifier: number;
  damageLabel: string;
  floor: number;
};

export function mileageModifier(mileage: number): { modifier: number; band: string } {
  if (mileage < 20_000) return { modifier: 1.0, band: "0-19,999 miles" };
  if (mileage < 40_000) return { modifier: 0.8, band: "20,000-39,999 miles" };
  if (mileage < 60_000) return { modifier: 0.6, band: "40,000-59,999 miles" };
  if (mileage < 80_000) return { modifier: 0.4, band: "60,000-79,999 miles" };
  if (mileage < 100_000) return { modifier: 0.2, band: "80,000-99,999 miles" };
  return { modifier: 0, band: "100,000+ miles" };
}

export function computeSeventeenC(input: {
  preAccidentValue: number;
  mileage: number;
  structural: boolean;
}): SeventeenC {
  const miles = mileageModifier(input.mileage);
  const damageModifier = input.structural ? 1 : 0.25;
  const base = input.preAccidentValue * 0.1;
  const floor = roundCents(base * miles.modifier * damageModifier);
  return {
    preAccidentValue: input.preAccidentValue,
    mileage: input.mileage,
    structural: input.structural,
    base: roundCents(base),
    mileageModifier: miles.modifier,
    mileageBand: miles.band,
    damageModifier,
    damageLabel: input.structural
      ? "Structural damage marked YES (modifier 1.00)"
      : "Structural damage marked NO / panels only (modifier 0.25)",
    floor,
  };
}

export function money(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

export function commas(n: number) {
  return new Intl.NumberFormat("en-US").format(n);
}

function roundCents(n: number) {
  return Math.round(n * 100) / 100;
}
