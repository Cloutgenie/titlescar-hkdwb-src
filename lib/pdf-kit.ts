import {
  PDFDocument,
  StandardFonts,
  rgb,
  type PDFFont,
  type PDFPage,
} from "pdf-lib";
import { DISCLAIMER, SHORT_DISCLAIMER } from "./copy";

export const INK = rgb(0.12, 0.1, 0.09);
export const MUTED = rgb(0.34, 0.3, 0.26);
export const RULE = rgb(0.7, 0.62, 0.54);
export const SCAR = rgb(0.5, 0.2, 0.12);
export const PAPER = rgb(0.985, 0.97, 0.94);
export const WASH = rgb(0.96, 0.9, 0.86);

export type Kit = {
  doc: PDFDocument;
  serif: PDFFont;
  serifBold: PDFFont;
  sans: PDFFont;
  sansBold: PDFFont;
};

export async function createKit(): Promise<Kit> {
  const doc = await PDFDocument.create();
  const [serif, serifBold, sans, sansBold] = await Promise.all([
    doc.embedFont(StandardFonts.TimesRoman),
    doc.embedFont(StandardFonts.TimesRomanBold),
    doc.embedFont(StandardFonts.Helvetica),
    doc.embedFont(StandardFonts.HelveticaBold),
  ]);
  return { doc, serif, serifBold, sans, sansBold };
}

export function wrap(text: string, font: PDFFont, size: number, width: number) {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const trial = line ? `${line} ${word}` : word;
    if (font.widthOfTextAtSize(trial, size) > width && line) {
      lines.push(line);
      line = word;
    } else {
      line = trial;
    }
  }
  if (line) lines.push(line);
  return lines;
}

export type Cursor = { page: PDFPage; y: number; kit: Kit };

export function addPage(kit: Kit, title: string): Cursor {
  const page = kit.doc.addPage([612, 792]);
  page.drawRectangle({ x: 0, y: 0, width: 612, height: 792, color: PAPER });
  page.drawText("TITLESCAR", {
    x: 54,
    y: 752,
    size: 10,
    font: kit.sansBold,
    color: SCAR,
  });
  page.drawText(title, {
    x: 128,
    y: 752,
    size: 10,
    font: kit.sans,
    color: MUTED,
  });
  page.drawLine({
    start: { x: 54, y: 744 },
    end: { x: 558, y: 744 },
    thickness: 1.4,
    color: SCAR,
  });
  page.drawText(SHORT_DISCLAIMER, {
    x: 54,
    y: 730,
    size: 7.5,
    font: kit.sans,
    color: SCAR,
  });
  page.drawLine({
    start: { x: 54, y: 58 },
    end: { x: 558, y: 58 },
    thickness: 0.6,
    color: RULE,
  });
  const foot = wrap(DISCLAIMER, kit.sans, 6.5, 504);
  let fy = 48;
  for (const line of foot.slice(0, 4)) {
    page.drawText(line, { x: 54, y: fy, size: 6.5, font: kit.sans, color: MUTED });
    fy -= 8;
  }
  return { page, y: 710, kit };
}

export function para(
  cur: Cursor,
  text: string,
  opts?: { font?: PDFFont; size?: number; color?: ReturnType<typeof rgb>; lh?: number }
) {
  const font = opts?.font ?? cur.kit.serif;
  const size = opts?.size ?? 10.5;
  const lh = opts?.lh ?? size + 3;
  const lines = wrap(text, font, size, 504);
  for (const line of lines) {
    if (cur.y < 80) {
      const next = addPage(cur.kit, "continued");
      cur.page = next.page;
      cur.y = next.y;
    }
    cur.page.drawText(line, {
      x: 54,
      y: cur.y,
      size,
      font,
      color: opts?.color ?? INK,
    });
    cur.y -= lh;
  }
  cur.y -= 6;
}

export function heading(cur: Cursor, text: string) {
  cur.y -= 4;
  para(cur, text, { font: cur.kit.sansBold, size: 11, color: SCAR, lh: 14 });
}

export function box(cur: Cursor, text: string) {
  const lines = wrap(text, cur.kit.serifBold, 10.5, 484);
  const h = 16 + lines.length * 14;
  if (cur.y - h < 80) {
    const next = addPage(cur.kit, "continued");
    cur.page = next.page;
    cur.y = next.y;
  }
  cur.page.drawRectangle({
    x: 54,
    y: cur.y - h + 12,
    width: 504,
    height: h,
    color: WASH,
    borderColor: RULE,
    borderWidth: 0.8,
  });
  let y = cur.y - 4;
  for (const line of lines) {
    cur.page.drawText(line, {
      x: 64,
      y,
      size: 10.5,
      font: cur.kit.serifBold,
      color: INK,
    });
    y -= 14;
  }
  cur.y -= h + 8;
}

export function check(cur: Cursor, text: string) {
  if (cur.y < 80) {
    const next = addPage(cur.kit, "continued");
    cur.page = next.page;
    cur.y = next.y;
  }
  cur.page.drawRectangle({
    x: 54,
    y: cur.y - 1,
    width: 8,
    height: 8,
    borderColor: INK,
    borderWidth: 0.8,
  });
  const lines = wrap(text, cur.kit.sans, 9, 486);
  let y = cur.y;
  for (const line of lines) {
    cur.page.drawText(line, {
      x: 68,
      y,
      size: 9,
      font: cur.kit.sans,
      color: INK,
    });
    y -= 12;
  }
  cur.y = y - 6;
}

export function fieldRow(cur: Cursor, label: string, height = 22) {
  if (cur.y - height < 80) {
    const next = addPage(cur.kit, "continued");
    cur.page = next.page;
    cur.y = next.y;
  }
  cur.page.drawText(label, {
    x: 54,
    y: cur.y,
    size: 8,
    font: cur.kit.sansBold,
    color: MUTED,
  });
  cur.page.drawLine({
    start: { x: 54, y: cur.y - height + 8 },
    end: { x: 558, y: cur.y - height + 8 },
    thickness: 0.5,
    color: RULE,
  });
  cur.y -= height;
}
