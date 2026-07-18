"use client";

import { exampleFormInput, type BusinessFormInput } from "@/lib/business-form";
import { useState } from "react";

type BusinessFormProps = {
  onSubmit: (data: BusinessFormInput) => void;
  initial?: Partial<BusinessFormInput>;
};

const fields: {
  key: keyof BusinessFormInput;
  label: string;
  placeholder: string;
  multiline?: boolean;
}[] = [
  { key: "businessName", label: "Business name", placeholder: "ABC Roofing" },
  { key: "type", label: "Type", placeholder: "Roof repair company" },
  { key: "location", label: "Location", placeholder: "London" },
  {
    key: "services",
    label: "Services",
    placeholder: "Roof replacement, gutters, emergency repairs",
    multiline: true,
  },
  { key: "phone", label: "Phone", placeholder: "+44 20 7946 0958" },
];

export function BusinessForm({ onSubmit, initial }: BusinessFormProps) {
  const [form, setForm] = useState<BusinessFormInput>({
    businessName: initial?.businessName ?? "",
    type: initial?.type ?? "",
    location: initial?.location ?? "",
    services: initial?.services ?? "",
    phone: initial?.phone ?? "",
  });

  function handleChange(key: keyof BusinessFormInput, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    onSubmit(form);
  }

  function fillExample() {
    setForm(exampleFormInput);
    onSubmit(exampleFormInput);
  }

  const isValid =
    form.businessName.trim() &&
    form.type.trim() &&
    form.location.trim() &&
    form.services.trim() &&
    form.phone.trim();

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {fields.map((field) => (
        <div key={field.key}>
          <label className="mb-1.5 block text-sm font-medium text-foreground">
            {field.label}
          </label>
          {field.multiline ? (
            <textarea
              value={form[field.key]}
              onChange={(e) => handleChange(field.key, e.target.value)}
              rows={3}
              placeholder={field.placeholder}
              className="w-full rounded-xl border border-surface-border bg-surface px-4 py-3 text-sm text-foreground placeholder:text-muted focus:border-brand/50 focus:outline-none"
            />
          ) : (
            <input
              type="text"
              value={form[field.key]}
              onChange={(e) => handleChange(field.key, e.target.value)}
              placeholder={field.placeholder}
              className="w-full rounded-xl border border-surface-border bg-surface px-4 py-3 text-sm text-foreground placeholder:text-muted focus:border-brand/50 focus:outline-none"
            />
          )}
        </div>
      ))}

      <div className="flex flex-col gap-3 pt-2 sm:flex-row">
        <button
          type="submit"
          disabled={!isValid}
          className="flex-1 rounded-xl bg-brand py-3 text-sm font-semibold text-white transition hover:bg-brand-light disabled:cursor-not-allowed disabled:opacity-40"
        >
          Generate with AI →
        </button>
        <button
          type="button"
          onClick={fillExample}
          className="rounded-xl border border-surface-border px-4 py-3 text-sm text-muted transition hover:border-brand/40 hover:text-foreground"
        >
          Try example
        </button>
      </div>
    </form>
  );
}
