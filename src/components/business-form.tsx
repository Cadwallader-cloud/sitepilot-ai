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
    type: initial?.type ?? "",
    location: initial?.location ?? "",
    services: initial?.services ?? "",
    phone: initial?.phone ?? "",
    description: initial?.description ?? "",
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
    form.services.trim();

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground">
          Business name
        </label>
        <input
          type="text"
          value={form.businessName}
          onChange={(e) => handleChange("businessName", e.target.value)}
          placeholder="ABC Roofing"
          className="w-full rounded-xl border border-surface-border bg-surface px-4 py-3 text-sm text-foreground placeholder:text-muted focus:border-brand/50 focus:outline-none"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">
            Business type
          </label>
          <input
            type="text"
            value={form.type}
            onChange={(e) => handleChange("type", e.target.value)}
            placeholder="Roof repair company"
            className="w-full rounded-xl border border-surface-border bg-surface px-4 py-3 text-sm text-foreground placeholder:text-muted focus:border-brand/50 focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">
            Location
          </label>
          <input
            type="text"
            value={form.location}
            onChange={(e) => handleChange("location", e.target.value)}
            placeholder="London"
            className="w-full rounded-xl border border-surface-border bg-surface px-4 py-3 text-sm text-foreground placeholder:text-muted focus:border-brand/50 focus:outline-none"
          />
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground">
          Services
        </label>
        <textarea
          value={form.services}
          onChange={(e) => handleChange("services", e.target.value)}
          rows={2}
          placeholder="Roof replacement, gutters, emergency repairs"
          className="w-full rounded-xl border border-surface-border bg-surface px-4 py-3 text-sm text-foreground placeholder:text-muted focus:border-brand/50 focus:outline-none"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground">
          Describe your business{" "}
          <span className="font-normal text-muted">(optional but better)</span>
        </label>
        <textarea
          value={form.description}
          onChange={(e) => handleChange("description", e.target.value)}
          rows={3}
          placeholder="Who you serve, what makes you different, years in business…"
          className="w-full rounded-xl border border-surface-border bg-surface px-4 py-3 text-sm text-foreground placeholder:text-muted focus:border-brand/50 focus:outline-none"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground">
          Phone <span className="font-normal text-muted">(optional)</span>
        </label>
        <input
          type="text"
          value={form.phone}
          onChange={(e) => handleChange("phone", e.target.value)}
          placeholder="+44 20 7946 0958"
          className="w-full rounded-xl border border-surface-border bg-surface px-4 py-3 text-sm text-foreground placeholder:text-muted focus:border-brand/50 focus:outline-none"
        />
      </div>

      <div className="flex flex-col gap-3 pt-2 sm:flex-row">
        <button
          type="submit"
          disabled={!isValid || loading}
          className="flex-1 rounded-xl bg-brand py-3 text-sm font-semibold text-white transition hover:bg-brand-light disabled:cursor-not-allowed disabled:opacity-40"
        >
          {loading ? "Generating…" : "Generate free preview →"}
        </button>
        <button
          type="button"
          onClick={fillExample}
          disabled={loading}
          className="rounded-xl border border-surface-border px-4 py-3 text-sm text-muted transition hover:border-brand/40 hover:text-foreground disabled:opacity-40"
        >
          Try example
        </button>
      </div>
    </form>
  );
}
