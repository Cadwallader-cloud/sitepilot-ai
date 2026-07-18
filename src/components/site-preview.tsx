"use client";

import { brand } from "@/lib/brand";
import type { GeneratedSite } from "@/lib/site-types";
import { useState } from "react";

const defaultThemes = [
  { primary: "#ea580c", accent: "#f59e0b", style: "bold" as const },
  { primary: "#2563eb", accent: "#3b82f6", style: "professional" as const },
  { primary: "#059669", accent: "#10b981", style: "clean" as const },
  { primary: "#0f172a", accent: "#0ea5e9", style: "bold" as const },
];

function pickTheme(title: string) {
  const index = title.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return defaultThemes[index % defaultThemes.length];
}

function toSlug(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

type SitePreviewProps = {
  site: GeneratedSite;
};

export function SitePreview({ site }: SitePreviewProps) {
  const [viewport, setViewport] = useState<"desktop" | "mobile">("desktop");
  const theme = site.theme ?? pickTheme(site.title);
  const slug = toSlug(site.title) || "your-site";
  const services =
    site.services?.length
      ? site.services
      : site.sections.find((s) => s.items?.length)?.items ?? [];
  const highlights = site.highlights?.length
    ? site.highlights
    : ["Licensed & insured", "Free estimates", "Local & reliable"];
  const testimonials = site.testimonials?.length
    ? site.testimonials
    : [];
  const whyUs = site.sections.find((s) => s.id === "why-us");
  const area = site.sections.find((s) => s.id === "service-area");

  return (
    <div>
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 rounded-full border border-surface-border bg-surface p-1 text-xs">
          <button
            type="button"
            onClick={() => setViewport("desktop")}
            className={`rounded-full px-3 py-1.5 font-medium transition ${
              viewport === "desktop"
                ? "bg-brand text-white"
                : "text-muted hover:text-foreground"
            }`}
          >
            Desktop
          </button>
          <button
            type="button"
            onClick={() => setViewport("mobile")}
            className={`rounded-full px-3 py-1.5 font-medium transition ${
              viewport === "mobile"
                ? "bg-brand text-white"
                : "text-muted hover:text-foreground"
            }`}
          >
            Mobile
          </button>
        </div>
        <p className="truncate text-xs text-muted">
          Preview · {slug}.{brand.domain}
        </p>
      </div>

      <div
        className={`mx-auto overflow-hidden rounded-2xl border border-surface-border bg-white text-zinc-900 shadow-2xl transition-all ${
          viewport === "mobile" ? "max-w-[390px]" : "w-full"
        }`}
      >
        <div className="flex items-center gap-2 border-b border-zinc-200 bg-zinc-100 px-4 py-3">
          <span className="h-3 w-3 rounded-full bg-red-400" />
          <span className="h-3 w-3 rounded-full bg-yellow-400" />
          <span className="h-3 w-3 rounded-full bg-green-400" />
          <span className="ml-3 truncate text-xs text-zinc-500">
            {slug}.{brand.domain}
          </span>
        </div>

        <div className="max-h-[70vh] overflow-y-auto">
          {/* Nav */}
          <header className="flex items-center justify-between px-5 py-4 sm:px-8">
            <div>
              <p className="text-sm font-bold" style={{ color: theme.primary }}>
                {site.title}
              </p>
              {site.trade && (
                <p className="text-[11px] uppercase tracking-wide text-zinc-500">
                  {site.trade}
                </p>
              )}
            </div>
            {site.phone && (
              <a
                href={`tel:${site.phone.replace(/\s/g, "")}`}
                className="rounded-full px-3 py-1.5 text-xs font-semibold text-white"
                style={{ backgroundColor: theme.primary }}
              >
                Call now
              </a>
            )}
          </header>

          {/* Hero */}
          <section
            className="px-5 py-12 text-center text-white sm:px-10 sm:py-16"
            style={{
              background: `linear-gradient(135deg, ${theme.primary}, ${theme.accent})`,
            }}
          >
            {(site.trade || site.location) && (
              <p className="mb-3 text-xs font-medium uppercase tracking-wider opacity-90">
                {[site.trade, site.location].filter(Boolean).join(" · ")}
              </p>
            )}
            <h2 className="text-3xl font-bold leading-tight sm:text-4xl">
              {site.title}
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-sm opacity-95 sm:text-base">
              {site.tagline}
            </p>
            <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <button
                type="button"
                className="rounded-full bg-white px-6 py-2.5 text-sm font-semibold shadow"
                style={{ color: theme.primary }}
              >
                {site.cta}
              </button>
              {site.phone && (
                <p className="text-sm font-medium opacity-95">{site.phone}</p>
              )}
            </div>
          </section>

          {/* Highlights */}
          <section className="grid gap-3 border-b border-zinc-100 bg-zinc-50 px-5 py-5 sm:grid-cols-3 sm:px-8">
            {highlights.slice(0, 3).map((item) => (
              <div
                key={item}
                className="rounded-xl bg-white px-4 py-3 text-center text-sm font-medium text-zinc-700 shadow-sm"
              >
                {item}
              </div>
            ))}
          </section>

          {/* Services */}
          {services.length > 0 && (
            <section className="px-5 py-10 sm:px-8">
              <h3 className="text-xl font-bold text-zinc-900">Our services</h3>
              <p className="mt-2 text-sm text-zinc-600">
                {site.sections.find((s) => s.id === "services")?.body ||
                  `Professional ${site.trade?.toLowerCase() || "services"} for homes and businesses.`}
              </p>
              <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                {services.map((service) => (
                  <li
                    key={service}
                    className="flex items-start gap-3 rounded-xl border border-zinc-100 bg-zinc-50 px-4 py-3 text-sm text-zinc-700"
                  >
                    <span
                      className="mt-0.5 font-bold"
                      style={{ color: theme.primary }}
                    >
                      ✓
                    </span>
                    {service}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* About */}
          {(site.about || whyUs) && (
            <section className="border-t border-zinc-100 bg-zinc-50 px-5 py-10 sm:px-8">
              <h3 className="text-xl font-bold text-zinc-900">
                {whyUs?.title || "About us"}
              </h3>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-zinc-600">
                {site.about || whyUs?.body}
              </p>
              {area && (
                <p className="mt-4 text-sm text-zinc-600">
                  <span className="font-semibold text-zinc-800">
                    {area.title}:{" "}
                  </span>
                  {area.body}
                </p>
              )}
            </section>
          )}

          {/* Testimonials */}
          {testimonials.length > 0 && (
            <section className="px-5 py-10 sm:px-8">
              <h3 className="text-xl font-bold text-zinc-900">
                What customers say
              </h3>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {testimonials.slice(0, 2).map((t) => (
                  <blockquote
                    key={`${t.name}-${t.quote.slice(0, 12)}`}
                    className="rounded-2xl border border-zinc-100 bg-white p-5 shadow-sm"
                  >
                    <p className="text-sm leading-relaxed text-zinc-700">
                      “{t.quote}”
                    </p>
                    <footer className="mt-4 text-xs font-semibold text-zinc-900">
                      {t.name}
                      <span className="block font-normal text-zinc-500">
                        {t.role}
                      </span>
                    </footer>
                  </blockquote>
                ))}
              </div>
            </section>
          )}

          {/* Contact / CTA */}
          <section
            className="px-5 py-12 text-center text-white sm:px-8"
            style={{ backgroundColor: theme.primary }}
          >
            <h3 className="text-2xl font-bold">Ready to get started?</h3>
            <p className="mx-auto mt-2 max-w-md text-sm opacity-90">
              {site.hours || "Call today for a free estimate."}
            </p>
            <div className="mt-6 space-y-2">
              {site.phone && (
                <p className="text-2xl font-bold tracking-tight">{site.phone}</p>
              )}
              {site.email && (
                <p className="text-sm opacity-90">{site.email}</p>
              )}
              {site.location && (
                <p className="text-sm opacity-80">Serving {site.location}</p>
              )}
            </div>
            <button
              type="button"
              className="mt-6 rounded-full bg-white px-6 py-2.5 text-sm font-semibold"
              style={{ color: theme.primary }}
            >
              {site.cta}
            </button>
          </section>

          <footer className="px-5 py-4 text-center text-[11px] text-zinc-400 sm:px-8">
            © {new Date().getFullYear()} {site.title}. Preview by {brand.name}.
          </footer>
        </div>
      </div>
    </div>
  );
}
