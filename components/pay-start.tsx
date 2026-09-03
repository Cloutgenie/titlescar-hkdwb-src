"use client";

import { useRouter } from "next/navigation";
import { ClaimFormFields } from "@/components/claim-form";
import type { ClaimForm } from "@/lib/form-schema";

export function PayStart() {
  const router = useRouter();

  async function onSubmit(_form: ClaimForm) {
    const response = await fetch("/api/checkout", { method: "POST" });
    const data = (await response.json()) as { url?: string; error?: string };
    if (!response.ok || !data.url) {
      throw new Error(data.error || "Checkout is not available.");
    }
    router.push(data.url);
  }

  return (
    <ClaimFormFields
      submitLabel="Pay $39 and get the pack"
      pendingLabel="Opening checkout…"
      onSubmit={onSubmit}
    />
  );
}
