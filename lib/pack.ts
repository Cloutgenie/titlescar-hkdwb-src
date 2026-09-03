import JSZip from "jszip";
import { DISCLAIMER } from "./copy";
import { practiceFor } from "./dv-practice";
import { computeSeventeenC, money, commas } from "./formula";
import type { ClaimForm } from "./form-schema";
import { vehicleLine } from "./form-schema";
import { addPage, box, check, createKit, fieldRow, heading, para, type Kit } from "./pdf-kit";
import { MUTED } from "./pdf-kit";
import { routeLetter } from "./routing";
import { stateName } from "./states";

function today() {
  return new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

async function toBytes(kit: Kit) {
  kit.doc.setAuthor("TitleScar");
  kit.doc.setSubject(DISCLAIMER);
  return kit.doc.save();
}

async function demandLetter(form: ClaimForm) {
  const kit = await createKit();
  const route = routeLetter(form);
  const formula = computeSeventeenC({
    preAccidentValue: form.preAccidentValue,
    mileage: form.mileage,
    structural: form.structural === "yes",
  });
  const practice = practiceFor(form.state);
  const vehicle = vehicleLine(form);
  const cur = addPage(kit, "Diminished-value demand");

  para(cur, today(), { font: kit.sans, size: 9, color: MUTED });
  para(cur, `TO: ${route.addresseeLine}`, { font: kit.serifBold, size: 11 });
  para(cur, `FROM: owner of ${vehicle}`, { size: 11 });
  para(
    cur,
    `RE: Third-party diminished value - ${vehicle}, ${commas(form.mileage)} miles, ${stateName(form.state)}`,
    { font: kit.serifBold, size: 11 }
  );

  if (route.routingNote) {
    box(cur, route.routingNote);
  }

  if (route.kind === "first-party-ga") {
    para(
      cur,
      `I am making a first-party diminished-value claim in Georgia on ${vehicle}. The vehicle was repaired or quoted at ${money(form.repairCost)}. Repair does not restore market value. A Carfax / history mark remains.`
    );
  } else {
    para(
      cur,
      `${form.atFaultName} caused a not-at-fault wreck involving my ${vehicle}. The car was repaired or quoted at ${money(form.repairCost)}. A perfect repair still leaves a history mark. Buyers pay less for an accident-branded car. That leftover loss is diminished value, and it belongs in this property-damage claim.`
    );
  }

  heading(cur, practice.heading);
  para(cur, practice.body);

  para(
    cur,
    `I do not cite case law in this letter. Confirm the current public rule for ${stateName(form.state)} before you treat any sentence as complete.`
  );

  heading(cur, "The 17c number is a floor, not the ask");
  para(
    cur,
    `A Georgia-origin 17c worksheet on these facts produces a floor of ${money(formula.floor)} (10% of pre-accident value ${money(form.preAccidentValue)} x mileage modifier ${formula.mileageModifier} x damage modifier ${formula.damageModifier}). Insurers use 17c to lowball. Comparable clean vs accident-history listings beat the formula. I demand diminished value of not less than ${money(formula.floor)}, and the higher amount shown by the enclosed comps sheet once those listings are attached.`
  );

  box(
    cur,
    `Demand: pay diminished value of not less than ${money(formula.floor)} within 14 days, or send a written explanation of every number you used.`
  );

  para(
    cur,
    "Enclosed: 17c worksheet (math shown), comps capture sheet, evidence checklist. If you refuse or lowball without comps, the next papers are a department-of-insurance complaint and a small-claims outline."
  );
  para(cur, "Requested by the vehicle owner named in the claim file.", {
    size: 10,
  });

  return toBytes(kit);
}

async function worksheet(form: ClaimForm) {
  const kit = await createKit();
  const f = computeSeventeenC({
    preAccidentValue: form.preAccidentValue,
    mileage: form.mileage,
    structural: form.structural === "yes",
  });
  const cur = addPage(kit, "17c worksheet - FLOOR only");

  para(cur, `Vehicle: ${vehicleLine(form)}   State: ${stateName(form.state)}`, {
    font: kit.serifBold,
    size: 11,
  });
  heading(cur, "What 17c is");
  para(
    cur,
    "17c is a Georgia-origin insurer worksheet. TitleScar fills it so you can see their math. It is a FLOOR. It is not the ask. Local clean vs accident-history listings beat this formula. Do not accept 17c as the value of the claim."
  );

  heading(cur, "The math");
  para(cur, `1. Pre-accident value you entered: ${money(f.preAccidentValue)}`);
  para(cur, `2. Base loss (10% x pre-accident value): ${money(f.base)}`);
  para(
    cur,
    `3. Mileage: ${commas(f.mileage)} (${f.mileageBand}) -> modifier ${f.mileageModifier.toFixed(2)}`
  );
  para(cur, `4. Damage: ${f.damageLabel}`);
  box(
    cur,
    `5. 17c floor = ${money(f.base)} x ${f.mileageModifier.toFixed(2)} x ${f.damageModifier.toFixed(2)} = ${money(f.floor)}`
  );
  para(
    cur,
    `Repair amount (for the file, not a 17c input): ${money(form.repairCost)}. Structural: ${form.structural.toUpperCase()}.`
  );
  para(
    cur,
    "Mileage bands used: 0-19,999 = 1.00; 20-39,999 = 0.80; 40-59,999 = 0.60; 60-79,999 = 0.40; 80-99,999 = 0.20; 100,000+ = 0.00. Structural YES uses 1.00; NO uses 0.25 (panels / non-structural). If the floor is $0 because of mileage, comps are the entire ask."
  );
  heading(cur, "How to use this page");
  para(
    cur,
    'Attach this worksheet to the demand. Write on it: "This is the insurer floor. See comps sheet for the market number." If the adjuster quotes 17c, ask for the clean vs branded listings they used. If they used none, they did not value the car.'
  );
  return toBytes(kit);
}

async function compsSheet(form: ClaimForm) {
  const kit = await createKit();
  const cur = addPage(kit, "Comps capture sheet");
  para(
    cur,
    `Fill this before you accept any offer on ${vehicleLine(form)}. This is where claims stall: the adjuster asks for comps, you do not have three local pairs, and the file dies.`
  );
  para(
    cur,
    "Find three listings as close as you can: same year/make/model, similar miles, sold near you. For each, capture one CLEAN (no accident history) and one ACCIDENT-HISTORY (branded / Carfax hit) if both exist. Print the listing. Write the URL and the date you captured it.",
    { size: 10 }
  );

  for (let i = 1; i <= 3; i += 1) {
    heading(cur, `Comp pair ${i}`);
    fieldRow(cur, "Source (Autotrader / Cars.com / dealer / Facebook) and capture date");
    fieldRow(cur, "CLEAN listing - year / miles / price / ZIP / URL");
    fieldRow(cur, "ACCIDENT-HISTORY listing - year / miles / price / ZIP / URL");
    fieldRow(cur, "Why this pair matches my car (trim, options, color, damage type)");
  }

  heading(cur, "Market delta");
  para(
    cur,
    "Clean average $ __________   minus   accident-history average $ __________   =   $ __________  (this number beats 17c when it is higher)."
  );
  para(
    cur,
    `17c floor from the worksheet is attached. If your comps delta is higher, that is the ask for ${vehicleLine(form)}.`
  );
  return toBytes(kit);
}

async function evidence(form: ClaimForm) {
  const kit = await createKit();
  const cur = addPage(kit, "Evidence checklist");
  para(
    cur,
    `Claim file for ${vehicleLine(form)}. Adjusters stall by saying they do not know what to upload. Send this list with the PDFs checked off.`
  );
  check(cur, "Repair invoice or written estimate (itemized).");
  check(cur, "Photos: damage, VIN plate, repaired car, odometer.");
  check(cur, "Carfax or equivalent history report showing the accident mark.");
  check(cur, "Police / crash report naming the at-fault driver.");
  check(cur, "Proof of pre-accident value (guidebook printout or pre-loss listing).");
  check(cur, "Filled 17c worksheet (floor) and comps capture sheet with printouts.");
  check(cur, "All emails / texts / portal notes from the insurer.");
  check(cur, "Title or registration in the claimant's name.");
  para(
    cur,
    `At-fault name on this pack: ${form.atFaultName}. Insurer field: ${form.insurerName}. Claim path: ${form.claimType === "first" ? "you marked first-party" : "you marked third-party"}.`
  );
  para(
    cur,
    "Upload order that usually gets a human: police report, estimate, photos, Carfax, 17c worksheet, comps. Do not send a ZIP of 80 photos and nothing else."
  );
  return toBytes(kit);
}

async function followUp(form: ClaimForm) {
  const kit = await createKit();
  const f = computeSeventeenC({
    preAccidentValue: form.preAccidentValue,
    mileage: form.mileage,
    structural: form.structural === "yes",
  });
  const route = routeLetter(form);
  const cur = addPage(kit, "Lowball counter / DOI / small claims");

  heading(cur, "Lowball counter letter");
  para(cur, today(), { font: kit.sans, size: 9, color: MUTED });
  para(cur, `TO: ${route.addresseeLine}`, { font: kit.serifBold, size: 11 });
  para(
    cur,
    `Your offer on my ${vehicleLine(form)} ignores diminished value or treats 17c as a cap. 17c is a Georgia-origin floor. On my numbers that floor is ${money(f.floor)}. Comparable clean vs accident-history listings are attached / will be attached. Re-open the file and pay the market delta, or send the comps and the formula you used, line by line, within 10 days.`
  );
  para(
    cur,
    'If you have no comps, you have not valued the car. A "software" number without local listings is not a market appraisal.'
  );

  heading(cur, "One-page DOI complaint outline");
  para(
    cur,
    `Use your state department of insurance consumer complaint form for ${stateName(form.state)}. This is an outline, not a filing. Verify the current portal.`
  );
  check(cur, `Who: you (owner), ${form.atFaultName} (at-fault), ${form.insurerName} (insurer named on the form).`);
  check(cur, "What: not-at-fault wreck; repair done or quoted; history mark; DV unpaid or lowballed.");
  check(cur, `When: crash date (add), demand date (add), offer date (add). 17c floor ${money(f.floor)}.`);
  check(cur, "Attach: demand letter, 17c worksheet, comps, estimate, Carfax, police report, their offer.");
  check(cur, "Ask: investigate claims handling; require a written basis; note they used no local comps.");
  para(
    cur,
    "Do not invent a statute number on the complaint. If you cite one, copy it from the state's own complaint instructions."
  );

  heading(cur, "Small-claims outline");
  para(
    cur,
    "Typically you sue the at-fault driver, not the insurer, unless your state lets you name the carrier. Confirm that before you file. Bring: police report, estimate, photos, Carfax, 17c worksheet, comps printouts, this demand, their written offer or silence."
  );
  check(cur, `Defendant to consider: ${form.atFaultName} (verify).`);
  check(cur, `Amount: the comps delta, and not less than the 17c floor of ${money(f.floor)}, plus filing costs if allowed.`);
  check(cur, "Ask the clerk for the property-damage / auto limit and the service rules.");
  check(cur, "Bring two exhibit sets. Tell the story in four sentences, then hand the judge the comps.");
  para(
    cur,
    "TitleScar is not representing you. Small-claims rules are local. Verify the current limit and who you may name."
  );
  return toBytes(kit);
}

export async function generatePackZip(form: ClaimForm): Promise<Uint8Array> {
  const [demand, sheet, comps, checklist, extras] = await Promise.all([
    demandLetter(form),
    worksheet(form),
    compsSheet(form),
    evidence(form),
    followUp(form),
  ]);
  const zip = new JSZip();
  zip.file("01-demand-letter.pdf", demand);
  zip.file("02-17c-worksheet.pdf", sheet);
  zip.file("03-comps-capture.pdf", comps);
  zip.file("04-evidence-checklist.pdf", checklist);
  zip.file("05-lowball-doi-smallclaims.pdf", extras);
  zip.file("README.txt", readme(form));
  return zip.generateAsync({ type: "uint8array" });
}

function readme(form: ClaimForm) {
  const route = routeLetter(form);
  return [
    "TitleScar diminished-value pack",
    "",
    SHORT_LINE,
    "",
    `Vehicle: ${vehicleLine(form)}`,
    `State: ${stateName(form.state)}`,
    route.routingNote ? `Routing: ${route.routingNote}` : "Routing: third-party / at-fault path (or Georgia first-party).",
    "",
    "01 demand letter - send first",
    "02 17c worksheet - floor, not the ask",
    "03 comps sheet - fill this; this is where people stall",
    "04 evidence checklist",
    "05 lowball counter, DOI outline, small-claims outline",
    "",
    DISCLAIMER,
  ].join("\n");
}

const SHORT_LINE =
  "Not a law firm. Not legal advice. 17c is a floor. Comps beat the formula.";

export function packFilename(form: ClaimForm) {
  const slug = `${form.year}-${form.make}-${form.model}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
  return `titlescar-dv-pack-${slug || "stop"}.zip`;
}
