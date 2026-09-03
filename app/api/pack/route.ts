import { NextRequest } from "next/server";
import { parseClaimForm } from "@/lib/form-schema";
import { generatePackZip, packFilename } from "@/lib/pack";
import { paymentIsVerified } from "@/lib/payment";

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const record =
    body && typeof body === "object" ? (body as Record<string, unknown>) : {};
  const paid = await paymentIsVerified({
    sessionId: typeof record.sessionId === "string" ? record.sessionId : null,
    unlockKey: typeof record.unlockKey === "string" ? record.unlockKey : null,
  });

  if (!paid) {
    return Response.json(
      { error: "Payment is not verified. Pay $39, then download the pack." },
      { status: 402 }
    );
  }

  const parsed = parseClaimForm(record.form);
  if (!parsed.success) {
    return Response.json({ error: "The claim form is incomplete." }, { status: 400 });
  }

  const bytes = await generatePackZip(parsed.data);
  return new Response(Buffer.from(bytes), {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${packFilename(parsed.data)}"`,
      "Cache-Control": "no-store",
    },
  });
}
