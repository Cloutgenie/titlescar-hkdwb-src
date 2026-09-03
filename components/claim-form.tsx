"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
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

function str(value: string | number | undefined) {
  if (value === undefined || value === null) return "";
  return String(value);
}

export function ClaimFormFields({
  submitLabel,
  pendingLabel = "Working…",
  onSubmit,
}: Props) {
  const draft = readDraft();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [state, setState] = useState(draft?.state ?? "");
  const [year, setYear] = useState(str(draft?.year));
  const [make, setMake] = useState(draft?.make ?? "");
  const [model, setModel] = useState(draft?.model ?? "");
  const [mileage, setMileage] = useState(str(draft?.mileage));
  const [preAccidentValue, setPreAccidentValue] = useState(
    str(draft?.preAccidentValue)
  );
  const [repairCost, setRepairCost] = useState(str(draft?.repairCost));
  const [structural, setStructural] = useState<"yes" | "no">(
    draft?.structural === "yes" ? "yes" : "no"
  );
  const [insurerName, setInsurerName] = useState(draft?.insurerName ?? "");
  const [claimType, setClaimType] = useState<"first" | "third">(
    draft?.claimType === "first" ? "first" : "third"
  );
  const [atFaultName, setAtFaultName] = useState(draft?.atFaultName ?? "");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const parsed = parseClaimForm({
      state,
      year,
      make,
      model,
      mileage,
      preAccidentValue,
      repairCost,
      structural,
      insurerName,
      claimType,
      atFaultName,
    });
    if (!parsed.success) {
      setError(
        "Check the required fields. Year, miles, and dollars must be numbers."
      );
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

  return (
    <form onSubmit={handleSubmit} noValidate className="grid gap-5">
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
          <NumberField
            id="year"
            value={year}
            onChange={setYear}
            placeholder="2019"
          />
        </Field>
        <Field label="Make" htmlFor="make">
          <TextField
            id="make"
            value={make}
            onChange={setMake}
            placeholder="Honda"
          />
        </Field>
        <Field label="Model" htmlFor="model">
          <TextField
            id="model"
            value={model}
            onChange={setModel}
            placeholder="CR-V EX"
          />
        </Field>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Mileage" htmlFor="mileage">
          <NumberField
            id="mileage"
            value={mileage}
            onChange={setMileage}
            placeholder="42000"
          />
        </Field>
        <Field label="Pre-accident value (USD)" htmlFor="preAccidentValue">
          <NumberField
            id="preAccidentValue"
            value={preAccidentValue}
            onChange={setPreAccidentValue}
            placeholder="18500"
          />
        </Field>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Repair $ (invoice or quote)" htmlFor="repairCost">
          <NumberField
            id="repairCost"
            value={repairCost}
            onChange={setRepairCost}
            placeholder="6400"
          />
        </Field>
        <fieldset className="grid gap-2">
          <legend className="text-sm font-medium">Structural damage</legend>
          <Radio
            name="structural"
            value="yes"
            label="Yes"
            checked={structural === "yes"}
            onChange={() => setStructural("yes")}
          />
          <Radio
            name="structural"
            value="no"
            label="No"
            checked={structural === "no"}
            onChange={() => setStructural("no")}
          />
        </fieldset>
      </div>
      <Field label="Insurer name" htmlFor="insurerName">
        <TextField
          id="insurerName"
          value={insurerName}
          onChange={setInsurerName}
          placeholder="State Farm"
        />
      </Field>
      <fieldset className="grid gap-2">
        <legend className="text-sm font-medium">Whose insurer</legend>
        <Radio
          name="claimType"
          value="third"
          label="Third-party — at-fault driver’s carrier"
          checked={claimType === "third"}
          onChange={() => setClaimType("third")}
        />
        <Radio
          name="claimType"
          value="first"
          label="First-party — my own insurer"
          checked={claimType === "first"}
          onChange={() => setClaimType("first")}
        />
        <p className="text-xs leading-5 text-muted-foreground">
          If you mark first-party and you are not in Georgia, TitleScar will not
          write a first-party DV demand. It writes the at-fault carrier letter
          instead. First-party DV is often dead outside GA (Carson).
        </p>
      </fieldset>
      <Field label="At-fault driver name" htmlFor="atFaultName">
        <TextField
          id="atFaultName"
          value={atFaultName}
          onChange={setAtFaultName}
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

const fieldClass =
  "h-10 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm";

function TextField({
  id,
  value,
  onChange,
  placeholder,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <input
      id={id}
      name={id}
      required
      type="text"
      autoComplete="off"
      value={value}
      onChange={(event) => onChange(event.currentTarget.value)}
      placeholder={placeholder}
      className={cn(fieldClass)}
    />
  );
}

function NumberField({
  id,
  value,
  onChange,
  placeholder,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <input
      id={id}
      name={id}
      required
      type="text"
      inputMode="decimal"
      autoComplete="off"
      value={value}
      onChange={(event) => onChange(event.currentTarget.value)}
      placeholder={placeholder}
      className={cn(fieldClass)}
    />
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
  checked,
  onChange,
}: {
  name: string;
  value: string;
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  const id = `${name}-${value}`;
  return (
    <label htmlFor={id} className="flex items-center gap-2 text-sm">
      <input
        id={id}
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        className="size-4 accent-primary"
      />
      {label}
    </label>
  );
}
