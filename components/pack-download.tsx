"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ClaimFormFields, readDraft } from "@/components/claim-form";
import { buttonVariants } from "@/components/ui/button";
import type { ClaimForm } from "@/lib/form-schema";
import { cn } from "@/lib/utils";

type Status = "checking" | "unpaid" | "ready" | "done" | "error";

export function PackDownload() {
  const params = useSearchParams();
  const sessionId = params.get("session_id");
  const unlockKey = params.get("k");
  const [status, setStatus] = useState<Status>("checking");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const query = new URLSearchParams();
    if (sessionId) query.set("session_id", sessionId);
    if (unlockKey) query.set("k", unlockKey);
    fetch(`/api/access?${query.toString()}`)
      .then((res) => res.json())
      .then((data: { paid?: boolean }) => {
        setStatus(data.paid ? "ready" : "unpaid");
      })
      .catch(() => {
        setStatus("error");
        setMessage("Could not verify payment.");
      });
  }, [sessionId, unlockKey]);

  async function download(form: ClaimForm) {
    const response = await fetch("/api/pack", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId, unlockKey, form }),
    });
    if (response.status === 402) {
      setStatus("unpaid");
      throw new Error("Payment is not verified.");
    }
    if (!response.ok) {
      const data = (await response.json().catch(() => ({}))) as { error?: string };
      throw new Error(data.error || "The pack could not be generated.");
    }
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    const disposition = response.headers.get("Content-Disposition");
    const match = disposition?.match(/filename="([^"]+)"/);
    anchor.href = url;
    anchor.download = match?.[1] ?? "titlescar-dv-pack.zip";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
    setStatus("done");
  }

  if (status === "checking") {
    return <p className="text-sm text-muted-foreground">Checking payment…</p>;
  }

  if (status === "unpaid") {
    return (
      <div className="grid gap-4">
        <p className="rounded-md border border-stamp/30 bg-stamp/8 px-3 py-3 text-sm text-stamp">
          This page unlocks after a real $39 payment. There is no free
          download and no demo unlock.
        </p>
        <Link href="/" className={cn(buttonVariants({ size: "lg" }), "h-11")}>
          Back to TitleScar
        </Link>
      </div>
    );
  }

  if (status === "error") {
    return (
      <p className="rounded-md border border-stamp/30 bg-stamp/8 px-3 py-3 text-sm text-stamp">
        {message}
      </p>
    );
  }

  const draft = readDraft();

  return (
    <div className="grid gap-6">
      {status === "done" ? (
        <p className="rounded-md border border-primary/25 bg-primary/8 px-3 py-3 text-sm">
          Downloaded. Open the ZIP. Fill the comps sheet. 17c is the floor.
        </p>
      ) : null}
      {!draft?.make ? (
        <p className="text-sm text-muted-foreground">
          Payment is verified. Fill the wreck facts and download the pack.
        </p>
      ) : null}
      <ClaimFormFields
        submitLabel="Download the ZIP pack"
        pendingLabel="Building the PDFs…"
        onSubmit={download}
      />
    </div>
  );
}
