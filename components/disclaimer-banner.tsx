import { SHORT_DISCLAIMER } from "@/lib/copy";

export function DisclaimerBanner() {
  return (
    <p className="border-b border-stamp/30 bg-stamp/8 px-4 py-2 text-center text-[11px] leading-4 font-medium tracking-wide text-stamp sm:text-xs">
      {SHORT_DISCLAIMER}
    </p>
  );
}
