"use client";

import { useEffect, useState } from "react";
import { buttonVariants } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  formErrorMessage,
  parseClaimForm,
  type ClaimForm,
} from "@/lib/form-schema";
import { US_STATES } from "@/lib/states";

const STORAGE_KEY = "titlescar-claim-draft";

export function readDraft(): Partial<ClaimForm> | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Partial<ClaimForm>) : null;
  } catch {
    return null;
  }
}

export function writeDraft(form: ClaimForm) {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(form));
}

type Props = {
  submitLabel: string;
  pendingLabel?: string;
  onSubmit: (form: ClaimForm) => Promise<void>;
};

function str(value: string | number | undefined) {
  if (value === undefined || value === null) return "";
  return String(value);
}

export function ClaimFormFields({
  submitLabel,
  pendingLabel = "Working…",
  onSubmit,
}: Props) {
  const [draft, setDraft] = useState<Partial<ClaimForm> | null>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    setDraft(readDraft());
    setReady(true);
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const data = new FormData(event.currentTarget);
    const parsed = parseClaimForm({
      state: data.get("state"),
      year: data.get("year"),
      make: data.get("make"),
      model: data.get("model"),
      mileage: data.get("mileage"),
      preAccidentValue: data.get("preAccidentValue"),
      repairCost: data.get("repairCost"),
      structural: data.get("structural"),
      insurerName: data.get("insurerName"),
      claimType: data.get("claimType"),
      atFaultName: data.get("atFaultName"),
    });
    if (!parsed.success) {
      setError(formErrorMessage(parsed.error));
      return;
    }
    writeDraft(parsed.data);
    setPending(true);
    try {
      await onSubmit(parsed.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setPending(false);
    }
  }

  if (!ready) {
    return <p className="text-sm text-muted-foreground">Loading the form…</p>;
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="grid gap-5">
      <Field label="State" htmlFor="state">
        <select
          id="state"
          name="state"
          required
          defaultValue={draft?.state ?? ""}
          className={cn(fieldClass, "bg-background")}
        >
          <option value="">Select state</option>
          {US_STATES.map((item) => (
            <option key={item.code} value={item.code}>
              {item.name}
            </option>
          ))}
        </select>
      </Field>
      <div className="grid gap-5 sm:grid-cols-3">
        <Field label="Year" htmlFor="year">
          <input
            id="year"
            name="year"
            required
            type="text"
            inputMode="decimal"
            autoComplete="off"
            defaultValue={str(draft?.year)}
            placeholder="2019"
            className={fieldClass}
          />
        </Field>
        <Field label="Make" htmlFor="make">
          <input
            id="make"
            name="make"
            required
            type="text"
            autoComplete="off"
            defaultValue={draft?.make ?? ""}
            placeholder="Honda"
            className={fieldClass}
          />
        </Field>
        <Field label="Model" htmlFor="model">
          <input
            id="model"
            name="model"
            required
            type="text"
            autoComplete="off"
            defaultValue={draft?.model ?? ""}
            placeholder="CR-V EX"
            className={fieldClass}
          />
        </Field>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Mileage" htmlFor="mileage">
          <input
            id="mileage"
            name="mileage"
            required
            type="text"
            inputMode="decimal"
            autoComplete="off"
            defaultValue={str(draft?.mileage)}
            placeholder="42000"
            className={fieldClass}
          />
        </Field>
        <Field label="Pre-accident value (USD)" htmlFor="preAccidentValue">
          <input
            id="preAccidentValue"
            name="preAccidentValue"
            required
            type="text"
            inputMode="decimal"
            autoComplete="off"
            defaultValue={str(draft?.preAccidentValue)}
            placeholder="18500"
            className={fieldClass}
          />
        </Field>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Repair $ (invoice or quote)" htmlFor="repairCost">
          <input
            id="repairCost"
            name="repairCost"
            required
            type="text"
            inputMode="decimal"
            autoComplete="off"
            defaultValue={str(draft?.repairCost)}
            placeholder="6400"
            className={fieldClass}
          />
        </Field>
        <fieldset className="grid gap-2">
          <legend className="text-sm font-medium">Structural damage</legend>
          <Radio
            name="structural"
            value="yes"
            label="Yes"
            defaultChecked={draft?.structural === "yes"}
          />
          <Radio
            name="structural"
            value="no"
            label="No"
            defaultChecked={draft?.structural !== "yes"}
          />
        </fieldset>
      </div>
      <Field label="Insurer name" htmlFor="insurerName">
        <input
          id="insurerName"
          name="insurerName"
          required
          type="text"
          autoComplete="off"
          defaultValue={draft?.insurerName ?? ""}
          placeholder="State Farm"
          className={fieldClass}
        />
      </Field>
      <fieldset className="grid gap-2">
        <legend className="text-sm font-medium">Whose insurer</legend>
        <Radio
          name="claimType"
          value="third"
          label="Third-party — at-fault driver’s carrier"
          defaultChecked={draft?.claimType !== "first"}
        />
        <Radio
          name="claimType"
          value="first"
          label="First-party — my own insurer"
          defaultChecked={draft?.claimType === "first"}
        />
        <p className="text-xs leading-5 text-muted-foreground">
          If you mark first-party and you are not in Georgia, TitleScar will not
          write a first-party DV demand. It writes the at-fault carrier letter
          instead. First-party DV is often dead outside GA (Carson).
        </p>
      </fieldset>
      <Field label="At-fault driver name" htmlFor="atFaultName">
        <input
          id="atFaultName"
          name="atFaultName"
          required
          type="text"
          autoComplete="off"
          defaultValue={draft?.atFaultName ?? ""}
          placeholder="Alex Rivera"
          className={fieldClass}
        />
      </Field>
      {error ? (
        <p className="rounded-md border border-stamp/30 bg-stamp/8 px-3 py-2 text-sm text-stamp">
          {error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className={cn(buttonVariants({ size: "lg" }), "h-12 w-full text-base")}
      >
        {pending ? pendingLabel : submitLabel}
      </button>
    </form>
  );
}

const fieldClass =
  "h-10 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm";

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
    </div>
  );
}

function Radio({
  name,
  value,
  label,
  defaultChecked,
}: {
  name: string;
  value: string;
  label: string;
  defaultChecked?: boolean;
}) {
  const id = `${name}-${value}`;
  return (
    <label htmlFor={id} className="flex items-center gap-2 text-sm">
      <input
        id={id}
        type="radio"
        name={name}
        value={value}
        defaultChecked={defaultChecked}
        className="size-4 accent-primary"
      />
      {label}
    </label>
  );
}
