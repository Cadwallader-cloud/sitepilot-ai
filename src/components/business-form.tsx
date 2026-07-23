"use client";

import { exampleFormInput, type BusinessFormInput } from "@/lib/business-form";
import Link from "next/link";
import { useState } from "react";

type BusinessFormProps = {
  onSubmit: (data: BusinessFormInput) => void;
  initial?: Partial<BusinessFormInput>;
  loading?: boolean;
};

export function BusinessForm({ onSubmit, initial, loading }: BusinessFormProps) {
  const [form, setForm] = useState<BusinessFormInput>({
    businessName: initial?.businessName ?? "",
    category: initial?.category ?? "",
    location: initial?.location ?? "",
    description: initial?.description ?? "",
    services: initial?.services ?? "",
    phone: initial?.phone ?? "",
    email: initial?.email ?? "",
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
    form.category.trim() &&
    form.location.trim() &&
    form.description.trim() &&
    form.services.trim() &&
    form.phone.trim() &&
    form.email.trim();

  const fields = [
    {
      key: "businessName" as const,
      label: "Business name",
      placeholder: "Apex Roofing",
    },
    {
      key: "category" as const,
      label: "Category",
      placeholder: "Roofing",
    },
    {
      key: "location" as const,
      label: "Location",
      placeholder: "Dallas",
    },
    {
      key: "description" as const,
      label: "Description",
      placeholder:
        "Residential roofing for Dallas homeowners — repairs, replacements, storm damage.",
      multiline: true,
    },
    {
      key: "services" as const,
      label: "Services",
      placeholder: "Roof repair, roof replacement, storm damage, inspections",
      multiline: true,
    },
    {
      key: "phone" as const,
      label: "Phone",
      placeholder: "+1 214 555 0199",
    },
    {
      key: "email" as const,
      label: "Email",
      placeholder: "hello@apexroofing.example",
    },
  ] as const;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {fields.map((field) => (
        <div key={field.key}>
          <label className="mb-1.5 block text-sm font-medium text-foreground">
            {field.label}
          </label>
          {"multiline" in field && field.multiline ? (
            <textarea
              value={form[field.key]}
              onChange={(e) => handleChange(field.key, e.target.value)}
              rows={3}
              placeholder={field.placeholder}
              className="w-full rounded-xl border border-surface-border bg-surface px-4 py-3 text-sm text-foreground placeholder:text-muted focus:border-brand/50 focus:outline-none"
            />
          ) : (
            <input
              type={field.key === "email" ? "email" : "text"}
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
          disabled={!isValid || loading}
          className="flex-1 rounded-xl bg-brand py-3 text-sm font-semibold text-white transition hover:bg-brand-light disabled:cursor-not-allowed disabled:opacity-40"
        >
          {loading ? "Generating website…" : "Generate Website"}
        </button>
        <button
          type="button"
          onClick={fillExample}
          disabled={loading}
          className="rounded-xl border border-surface-border px-4 py-3 text-sm text-muted transition hover:border-brand/40 hover:text-foreground disabled:opacity-40"
        >
          Try Apex Roofing
        </button>
      </div>
      <p className="text-xs text-muted">
        By generating, you agree to our{" "}
        <Link href="/privacy" className="text-brand-light hover:underline">
          Privacy Policy
        </Link>{" "}
        and{" "}
        <Link href="/terms" className="text-brand-light hover:underline">
          Terms of Service
        </Link>
        . Business details you enter may be processed by AI providers to create
        your website.
      </p>
    </form>
  );
}
