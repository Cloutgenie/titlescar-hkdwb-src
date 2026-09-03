import { NextRequest } from "next/server";
import { paymentIsVerified } from "@/lib/payment";

export async function GET(request: NextRequest) {
  const sessionId = request.nextUrl.searchParams.get("session_id");
  const unlockKey = request.nextUrl.searchParams.get("k");
  const paid = await paymentIsVerified({ sessionId, unlockKey });
  return Response.json({ paid });
}
