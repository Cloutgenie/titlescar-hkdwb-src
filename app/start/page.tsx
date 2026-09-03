import Link from "next/link";
import { DisclaimerBanner } from "@/components/disclaimer-banner";
import { PayStart } from "@/components/pay-start";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getCheckoutMode, getWhopCheckoutUrl } from "@/lib/payment";

export const metadata = {
  title: "Claim facts — TitleScar",
};

export default function StartPage() {
  const mode = getCheckoutMode();
  const whopUrl = getWhopCheckoutUrl();

  return (
    <div className="flex min-h-full flex-col">
      <DisclaimerBanner />
      <SiteHeader />
      <main className="mx-auto w-full max-w-xl flex-1 px-4 pb-16 sm:px-6">
        <p className="mt-4 text-sm">
          <Link href="/" className="text-primary underline-offset-4 hover:underline">
            Back
          </Link>
        </p>
        <h1 className="font-heading mt-4 text-3xl tracking-tight">
          The wreck facts
        </h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          No account. After you pay, the ZIP builds on the next page. TitleScar
          does not email the pack.
        </p>
        <div className="mt-8 rounded-lg border border-border bg-card p-4 sm:p-6">
          {mode === "stripe" ? (
            <PayStart />
          ) : mode === "whop" ? (
            <div className="grid gap-4">
              <p className="text-sm leading-6 text-muted-foreground">
                Checkout is on Whop. Pay $39 there. After payment you come back
                to fill this form and download the ZIP.
              </p>
              <a
                href={whopUrl}
                rel="noopener noreferrer"
                className="inline-flex h-12 items-center justify-center rounded-lg bg-primary px-4 text-base font-medium text-primary-foreground"
              >
                Pay $39 on Whop
              </a>
            </div>
          ) : (
            <p className="text-sm text-stamp">
              Checkout is not configured. Set STRIPE_SECRET_KEY or
              WHOP_CHECKOUT_URL.
            </p>
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
