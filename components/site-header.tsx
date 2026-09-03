import Link from "next/link";
import { TitleScarMark } from "@/components/mark";

export function SiteHeader() {
  return (
    <header className="flex items-center justify-between gap-4 px-4 py-4 sm:px-6">
      <Link href="/" className="flex items-center gap-2.5">
        <TitleScarMark />
        <span className="font-heading text-xl tracking-tight">TitleScar</span>
      </Link>
      <p className="hidden text-xs text-muted-foreground sm:block">
        Diminished-value pack · $39
      </p>
    </header>
  );
}
