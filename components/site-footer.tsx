import { DISCLAIMER } from "@/lib/copy";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border px-4 py-8 sm:px-6">
      <p className="mx-auto max-w-2xl text-xs leading-5 text-muted-foreground">
        {DISCLAIMER}
      </p>
      <p className="mx-auto mt-4 max-w-2xl text-xs text-muted-foreground">
        TitleScar · US not-at-fault drivers · Not affiliated with any insurer,
        Carfax, or department of insurance
      </p>
    </footer>
  );
}
