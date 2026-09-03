import { NextRequest } from "next/server";
import {
  createStripeCheckout,
  getCheckoutMode,
  getWhopCheckoutUrl,
} from "@/lib/payment";

export async function POST(request: NextRequest) {
  const mode = getCheckoutMode();
  const origin = request.nextUrl.origin;

  if (mode === "stripe") {
    const result = await createStripeCheckout({ origin });
    if ("error" in result) {
      return Response.json({ error: result.error }, { status: 500 });
    }
    return Response.json({ url: result.url, mode });
  }

  if (mode === "whop") {
    return Response.json({ url: getWhopCheckoutUrl(), mode });
  }

  return Response.json(
    {
      error:
        "Checkout is not configured. Set STRIPE_SECRET_KEY or WHOP_CHECKOUT_URL.",
    },
    { status: 503 }
  );
}
