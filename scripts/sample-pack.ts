import { writeFileSync } from "fs";
import { computeSeventeenC } from "../lib/formula";
import { generatePackZip } from "../lib/pack";
import type { ClaimForm } from "../lib/form-schema";
import { routeLetter } from "../lib/routing";

const txFirst: ClaimForm = {
  state: "TX",
  year: 2019,
  make: "Honda",
  model: "CR-V EX",
  mileage: 42000,
  preAccidentValue: 18500,
  repairCost: 6400,
  structural: "yes",
  insurerName: "USAA",
  claimType: "first",
  atFaultName: "Alex Rivera",
};

const gaFirst: ClaimForm = { ...txFirst, state: "GA" };
const third: ClaimForm = {
  ...txFirst,
  claimType: "third",
  insurerName: "State Farm",
};

async function main() {
  const r1 = routeLetter(txFirst);
  const r2 = routeLetter(gaFirst);
  if (!r1.redirectedFromFirstParty || r1.kind !== "third-party") {
    throw new Error("TX first-party must reroute");
  }
  if (r2.kind !== "first-party-ga" || r2.redirectedFromFirstParty) {
    throw new Error("GA first-party must stay first-party");
  }
  const formula = computeSeventeenC({
    preAccidentValue: 18500,
    mileage: 42000,
    structural: true,
  });
  if (formula.floor !== 1110) {
    throw new Error(`17c expected 1110 got ${formula.floor}`);
  }
  const zip = await generatePackZip(third);
  writeFileSync("/tmp/titlescar-sample.zip", zip);
  console.log("zip-bytes", zip.byteLength);
  console.log("routing-ok");
  console.log("17c-floor", formula.floor);
}

main();
