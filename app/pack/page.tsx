import { Suspense } from "react";
import Link from "next/link";
import { DisclaimerBanner } from "@/components/disclaimer-banner";
import { PackDownload } from "@/components/pack-download";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export const metadata = {
  title: "Download the pack — TitleScar",
};

export default function PackPage() {
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
          Download the diminished-value pack
        </h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          Payment has to check out for real. Then the ZIP is built here — no
          email, no account. 17c is a floor. Comps beat the formula.
        </p>
        <div className="mt-8 rounded-lg border border-border bg-card p-4 sm:p-6">
          <Suspense fallback={<p className="text-sm text-muted-foreground">Loading…</p>}>
            <PackDownload />
          </Suspense>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
