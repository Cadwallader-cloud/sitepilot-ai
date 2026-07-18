"use client";

import { exampleFormInput, type BusinessFormInput } from "@/lib/business-form";
import { useState } from "react";

type BusinessFormProps = {
  onSubmit: (data: BusinessFormInput) => void;
  initial?: Partial<BusinessFormInput>;
  loading?: boolean;
};

export function BusinessForm({ onSubmit, initial, loading }: BusinessFormProps) {
  const [form, setForm] = useState<BusinessFormInput>({
    businessName: initial?.businessName ?? "",
    location: initial?.location ?? "",
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
    form.location.trim() &&
    form.services.trim() &&
    form.phone.trim() &&
    form.email.trim();

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {(
        [
          {
            key: "businessName" as const,
            label: "Business name",
            placeholder: "London Roofing",
          },
          {
            key: "location" as const,
            label: "Location",
            placeholder: "London",
          },
          {
            key: "services" as const,
            label: "Services",
            placeholder: "Roof repair, gutter replacement, chimney repair",
            multiline: true,
          },
          {
            key: "phone" as const,
            label: "Phone",
            placeholder: "+44 20 7946 0958",
          },
          {
            key: "email" as const,
            label: "Email",
            placeholder: "hello@londonroofing.co.uk",
          },
        ] as const
      ).map((field) => (
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
          {loading ? "Generating…" : "Generate"}
        </button>
        <button
          type="button"
          onClick={fillExample}
          disabled={loading}
          className="rounded-xl border border-surface-border px-4 py-3 text-sm text-muted transition hover:border-brand/40 hover:text-foreground disabled:opacity-40"
        >
          Try London Roofing
        </button>
      </div>
    </form>
  );
}
