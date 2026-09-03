import type { ClaimForm } from "./form-schema";

export type LetterRoute = {
  kind: "first-party-ga" | "third-party";
  redirectedFromFirstParty: boolean;
  addresseeLine: string;
  routingNote: string | null;
};

export function routeLetter(form: ClaimForm): LetterRoute {
  const firstPartyOutsideGa = form.claimType === "first" && form.state !== "GA";

  if (form.claimType === "first" && form.state === "GA") {
    return {
      kind: "first-party-ga",
      redirectedFromFirstParty: false,
      addresseeLine: `Claims Department, ${form.insurerName} (first-party / own insurer)`,
      routingNote: null,
    };
  }

  if (firstPartyOutsideGa) {
    return {
      kind: "third-party",
      redirectedFromFirstParty: true,
      addresseeLine: `Liability claims for ${form.atFaultName} (at-fault driver / at-fault carrier - not a first-party demand to ${form.insurerName})`,
      routingNote:
        "You marked first-party (your own insurer). Outside Georgia, first-party diminished value is often dead (Carson). TitleScar will not generate a first-party DV demand. This pack is written to the at-fault carrier instead. Verify that rule for your state.",
    };
  }

  return {
    kind: "third-party",
    redirectedFromFirstParty: false,
    addresseeLine: `${form.insurerName}, liability carrier for ${form.atFaultName}`,
    routingNote: null,
  };
}
