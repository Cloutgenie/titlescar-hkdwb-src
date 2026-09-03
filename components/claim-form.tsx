"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { parseClaimForm, type ClaimForm } from "@/lib/form-schema";
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

export function ClaimFormFields({
  submitLabel,
  pendingLabel = "Working…",
  onSubmit,
}: Props) {
  const draft = readDraft();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [state, setState] = useState(draft?.state ?? "");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const data = new FormData(event.currentTarget);
    const parsed = parseClaimForm({
      state,
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
      setError("Check the required fields. Year, miles, and dollars must be numbers.");
      return;
    }
    writeDraft(parsed.data);
    setPending(true);
    try {
      await onSubmit(parsed.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-5">
      <Field label="State" htmlFor="state">
        <Select
          value={state || undefined}
          onValueChange={(value) => setState(value ?? "")}
        >
          <SelectTrigger id="state" className="h-10 w-full">
            <SelectValue placeholder="Select state" />
          </SelectTrigger>
          <SelectContent>
            {US_STATES.map((item) => (
              <SelectItem key={item.code} value={item.code}>
                {item.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>
      <div className="grid gap-5 sm:grid-cols-3">
        <Field label="Year" htmlFor="year">
          <Input
            id="year"
            name="year"
            required
            type="number"
            min={1985}
            max={2028}
            defaultValue={draft?.year}
            placeholder="2019"
            className="h-10"
          />
        </Field>
        <Field label="Make" htmlFor="make">
          <Input
            id="make"
            name="make"
            required
            defaultValue={draft?.make}
            placeholder="Honda"
          />
        </Field>
        <Field label="Model" htmlFor="model">
          <Input
            id="model"
            name="model"
            required
            defaultValue={draft?.model}
            placeholder="CR-V EX"
          />
        </Field>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Mileage" htmlFor="mileage">
          <Input
            id="mileage"
            name="mileage"
            required
            type="number"
            min={0}
            defaultValue={draft?.mileage}
            placeholder="42000"
          />
        </Field>
        <Field label="Pre-accident value (USD)" htmlFor="preAccidentValue">
          <Input
            id="preAccidentValue"
            name="preAccidentValue"
            required
            type="number"
            min={1}
            step="0.01"
            defaultValue={draft?.preAccidentValue}
            placeholder="18500"
          />
        </Field>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Repair $ (invoice or quote)" htmlFor="repairCost">
          <Input
            id="repairCost"
            name="repairCost"
            required
            type="number"
            min={0}
            step="0.01"
            defaultValue={draft?.repairCost}
            placeholder="6400"
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
        <Input
          id="insurerName"
          name="insurerName"
          required
          defaultValue={draft?.insurerName}
          placeholder="State Farm"
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
        <Input
          id="atFaultName"
          name="atFaultName"
          required
          defaultValue={draft?.atFaultName}
          placeholder="Alex Rivera"
        />
      </Field>
      {error ? (
        <p className="rounded-md border border-stamp/30 bg-stamp/8 px-3 py-2 text-sm text-stamp">
          {error}
        </p>
      ) : null}
      <Button
        type="submit"
        disabled={pending}
        className="h-12 w-full text-base"
        size="lg"
      >
        {pending ? pendingLabel : submitLabel}
      </Button>
    </form>
  );
}

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
        required
        className="size-4 accent-primary"
      />
      {label}
    </label>
  );
}
