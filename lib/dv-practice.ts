import { stateName } from "./states";

export type PracticeNote = {
  heading: string;
  body: string;
};

/**
 * Public diminished-value / insurance-claim practice notes only.
 * No invented case law. Ambiguous states get a verify-first third-party note.
 */
export function practiceFor(stateCode: string): PracticeNote {
  if (stateCode === "GA") {
    return {
      heading: "Georgia - public 17c / first-party practice",
      body: "Georgia is the state where first-party diminished-value claims against a driver's own insurer are commonly treated as live. Insurers there often run a 17c worksheet. This pack still treats 17c as a floor. Third-party claims against an at-fault carrier are also routinely made. Verify current Georgia DOI guidance and the policy before you send.",
    };
  }

  return {
    heading: `${stateName(stateCode)} - third-party claim practice`,
    body: `In ${stateName(stateCode)}, diminished value is commonly pursued as part of a third-party property-damage claim against the at-fault driver and that driver's liability insurer - the idea being to make the not-at-fault owner whole. First-party collision coverage often will not pay DV. This letter does not cite case law. Confirm the current rule with your state department of insurance and a licensed attorney before you rely on it.`,
  };
}
