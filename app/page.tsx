import Link from "next/link";
import { DisclaimerBanner } from "@/components/disclaimer-banner";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { buttonVariants } from "@/components/ui/button";
import { PRICE_USD } from "@/lib/copy";
import { getCheckoutMode, getWhopCheckoutUrl } from "@/lib/payment";
import { cn } from "@/lib/utils";

export default function Home() {
  const mode = getCheckoutMode();
  const whopUrl = getWhopCheckoutUrl();

  return (
    <div className="flex min-h-full flex-col">
      <DisclaimerBanner />
      <SiteHeader />
      <main className="mx-auto w-full max-w-xl flex-1 px-4 pb-16 sm:px-6">
        <p className="mt-6 text-[11px] font-medium tracking-[0.18em] text-primary uppercase">
          For US not-at-fault drivers
        </p>
        <h1 className="font-heading mt-3 text-[2.05rem] leading-[1.12] font-medium tracking-tight sm:text-5xl">
          Your car is worth less even after a perfect repair. Get the letter in
          2 minutes.
        </h1>
        <p className="mt-5 text-base leading-7 text-muted-foreground">
          The wreck was not your fault. The shop can make it look new. Carfax
          still shows a hit. The at-fault insurer lowballs, denies, or will not
          say what to upload. TitleScar builds the pack.
        </p>
        <ul className="mt-8 grid gap-3 text-[15px] leading-6">
          <Bullet>
            State-aware third-party diminished-value demand. No invented case
            law. First-party outside Georgia is rerouted to the at-fault
            carrier.
          </Bullet>
          <Bullet>
            Filled 17c worksheet as a floor — not the ask — plus a 3-pair comps
            sheet, which is where people stall.
          </Bullet>
          <Bullet>
            Evidence checklist, lowball counter, DOI outline, small-claims
            outline. ${PRICE_USD} once. No account.
          </Bullet>
        </ul>
        <div className="mt-8 grid gap-3">
          <PayCta mode={mode} whopUrl={whopUrl} />
          <p className="text-center text-xs text-muted-foreground">
            Instant ZIP download after payment. 17c is a floor. Comps beat the
            formula.
          </p>
        </div>
        <PackSketch />
        <section className="mt-12 grid gap-6">
          <h2 className="font-heading text-2xl tracking-tight">What you get</h2>
          <ol className="grid gap-3 text-sm leading-6 text-muted-foreground">
            <li>1. Third-party DV demand letter for your state</li>
            <li>2. 17c worksheet with the math shown</li>
            <li>3. Comps capture sheet — 3 clean vs accident-history slots</li>
            <li>4. Evidence checklist (invoice, photos, Carfax, police report)</li>
            <li>5. Lowball counter + DOI complaint outline + small-claims outline</li>
          </ol>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

function PayCta({
  mode,
  whopUrl,
}: {
  mode: "stripe" | "whop" | "unconfigured";
  whopUrl: string;
}) {
  if (mode === "stripe") {
    return (
      <Link
        href="/start"
        className={cn(buttonVariants({ size: "lg" }), "h-12 w-full text-base")}
      >
        Get the pack — ${PRICE_USD}
      </Link>
    );
  }

  if (mode === "whop") {
    return (
      <a
        href={whopUrl}
        rel="noopener noreferrer"
        className={cn(buttonVariants({ size: "lg" }), "h-12 w-full text-base")}
      >
        Get the pack — ${PRICE_USD}
      </a>
    );
  }

  return (
    <div className="grid gap-2">
      <span
        className={cn(
          buttonVariants({ size: "lg" }),
          "h-12 w-full text-base opacity-50"
        )}
      >
        Checkout is not configured
      </span>
      <p className="text-center text-xs text-stamp">
        Set STRIPE_SECRET_KEY or WHOP_CHECKOUT_URL. TitleScar will not pretend
        you paid.
      </p>
    </div>
  );
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex gap-3">
      <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" />
      <span>{children}</span>
    </li>
  );
}

function PackSketch() {
  return (
    <aside
      aria-hidden="true"
      className="mt-12 rounded-lg border border-border bg-card px-5 py-6"
    >
      <p className="text-[11px] font-medium tracking-[0.16em] text-primary uppercase">
        Inside the ZIP
      </p>
      <p className="font-heading mt-3 text-xl leading-snug">
        Demand the leftover value the repair did not put back.
      </p>
      <div className="mt-4 space-y-2 text-[13px] leading-5 text-muted-foreground">
        <p>Letter to the at-fault carrier. 17c math as a floor.</p>
        <p>Three local clean vs branded comps — fill these or the claim stalls.</p>
        <p>If they lowball: counter letter, DOI outline, small claims.</p>
      </div>
      <p className="mt-5 border-t border-border pt-3 text-[11px] leading-4 text-stamp">
        Not a law firm. Not legal advice. 17c is a floor. Comps beat the
        formula.
      </p>
    </aside>
  );
}
