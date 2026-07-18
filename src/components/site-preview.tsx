"use client";

import { brand } from "@/lib/brand";
import type { GeneratedSite } from "@/lib/site-types";
import { getBusinessName } from "@/lib/site-types";
import Image from "next/image";
import { useState } from "react";

type SitePreviewProps = {
  site: GeneratedSite;
  onChange?: (site: GeneratedSite) => void;
};

function toSlug(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function SitePreview({ site, onChange }: SitePreviewProps) {
  const [viewport, setViewport] = useState<"desktop" | "mobile">("desktop");
  const [editing, setEditing] = useState(false);
  const theme = site.theme;
  const businessName = getBusinessName(site);
  const slug = toSlug(businessName) || "your-site";
  const gallery = site.images.gallery.length
    ? site.images.gallery
    : [site.images.hero];

  /** Trust row uses AI service titles — no hardcoded placeholders */
  const trustItems = site.services.slice(0, 4).map((s) => s.title);

  function patchHero(field: "title" | "subtitle" | "cta", value: string) {
    onChange?.({ ...site, hero: { ...site.hero, [field]: value } });
  }

  function patchContact(field: "phone" | "email" | "address", value: string) {
    onChange?.({ ...site, contact: { ...site.contact, [field]: value } });
  }

  function patchAboutText(value: string) {
    onChange?.({ ...site, about: { ...site.about, text: value } });
  }

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 rounded-full border border-surface-border bg-surface p-1 text-xs">
            <button
              type="button"
              onClick={() => setViewport("desktop")}
              className={`rounded-full px-3 py-1.5 font-medium ${
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
              className={`rounded-full px-3 py-1.5 font-medium ${
                viewport === "mobile"
                  ? "bg-brand text-white"
                  : "text-muted hover:text-foreground"
              }`}
            >
              Mobile
            </button>
          </div>
          {onChange && (
            <button
              type="button"
              onClick={() => setEditing((v) => !v)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                editing
                  ? "bg-amber-500/20 text-amber-200"
                  : "border border-surface-border text-muted hover:text-foreground"
              }`}
            >
              {editing ? "✓ Done editing" : "✏️ Edit"}
            </button>
          )}
        </div>
        <p className="truncate text-xs text-muted">
          {slug}.{brand.domain}
        </p>
      </div>

      {editing && onChange && (
        <div className="mb-4 space-y-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-amber-200">
            Edit content
          </p>
          {(
            [
              ["hero.title", site.hero.title, (v: string) => patchHero("title", v)],
              [
                "hero.subtitle",
                site.hero.subtitle,
                (v: string) => patchHero("subtitle", v),
              ],
              ["hero.cta", site.hero.cta, (v: string) => patchHero("cta", v)],
              [
                "contact.phone",
                site.contact.phone,
                (v: string) => patchContact("phone", v),
              ],
              [
                "contact.email",
                site.contact.email,
                (v: string) => patchContact("email", v),
              ],
              [
                "contact.address",
                site.contact.address,
                (v: string) => patchContact("address", v),
              ],
            ] as const
          ).map(([label, value, setter]) => (
            <div key={label}>
              <label className="mb-1 block text-xs text-muted">{label}</label>
              <input
                value={value}
                onChange={(e) => setter(e.target.value)}
                className="w-full rounded-lg border border-surface-border bg-background px-3 py-2 text-sm"
              />
            </div>
          ))}
          <div>
            <label className="mb-1 block text-xs text-muted">about.text</label>
            <textarea
              value={site.about.text}
              onChange={(e) => patchAboutText(e.target.value)}
              rows={4}
              className="w-full rounded-lg border border-surface-border bg-background px-3 py-2 text-sm"
            />
          </div>
        </div>
      )}

      <div
        className={`mx-auto overflow-hidden rounded-2xl border border-surface-border bg-white text-zinc-900 shadow-2xl ${
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

        <div className="max-h-[75vh] overflow-y-auto">
          <header className="flex items-center justify-between px-5 py-4 sm:px-8">
            <div>
              <p className="font-bold" style={{ color: theme.primary }}>
                {businessName}
              </p>
              <p className="text-[11px] uppercase tracking-wide text-zinc-500">
                {site.contact.address}
              </p>
            </div>
            <a
              href={`tel:${site.contact.phone.replace(/\s/g, "")}`}
              className="rounded-full px-3 py-1.5 text-xs font-semibold text-white"
              style={{ backgroundColor: theme.primary }}
            >
              Call now
            </a>
          </header>

          <section className="relative min-h-[320px] overflow-hidden sm:min-h-[380px]">
            <Image
              src={site.images.hero}
              alt={site.hero.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 800px"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/50 to-black/30" />
            <div className="relative z-10 flex min-h-[320px] flex-col justify-end px-5 py-10 text-white sm:min-h-[380px] sm:px-10">
              <p className="text-xs font-semibold uppercase tracking-wider text-white/80">
                {site.contact.address}
              </p>
              <h2 className="mt-2 max-w-xl text-3xl font-bold leading-tight sm:text-4xl">
                {site.hero.title}
              </h2>
              <p className="mt-3 max-w-lg text-sm text-white/90 sm:text-base">
                {site.hero.subtitle}
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  className="rounded-full bg-white px-6 py-2.5 text-sm font-semibold"
                  style={{ color: theme.primary }}
                >
                  {site.hero.cta}
                </button>
                <span className="text-sm font-medium">{site.contact.phone}</span>
              </div>
            </div>
          </section>

          {trustItems.length > 0 && (
            <section className="grid gap-3 border-b border-zinc-100 bg-zinc-50 px-5 py-6 sm:grid-cols-2 sm:px-8 lg:grid-cols-4">
              {trustItems.map((item) => (
                <div
                  key={item}
                  className="rounded-xl bg-white px-4 py-3 text-center text-sm font-medium text-zinc-700 shadow-sm"
                >
                  {item}
                </div>
              ))}
            </section>
          )}

          <section className="grid gap-8 px-5 py-12 sm:px-8 lg:grid-cols-2 lg:items-center">
            <div>
              <h3 className="text-2xl font-bold text-zinc-900">
                {site.about.title}
              </h3>
              <p className="mt-4 text-sm leading-relaxed text-zinc-600">
                {site.about.text}
              </p>
            </div>
            <div className="relative h-56 overflow-hidden rounded-2xl sm:h-64">
              <Image
                src={gallery[0]}
                alt={site.about.title}
                fill
                className="object-cover"
                sizes="400px"
              />
            </div>
          </section>

          <section className="border-t border-zinc-100 bg-zinc-50 px-5 py-12 sm:px-8">
            <h3 className="text-2xl font-bold text-zinc-900">Services</h3>
            <p className="mt-2 text-sm text-zinc-600">
              Professional services across {site.contact.address}
            </p>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
              {site.services.map((service) => (
                <li
                  key={service.title}
                  className="rounded-xl border border-zinc-100 bg-white px-4 py-3"
                >
                  <p
                    className="text-sm font-semibold"
                    style={{ color: theme.primary }}
                  >
                    {service.title}
                  </p>
                  <p className="mt-1 text-sm text-zinc-600">
                    {service.description}
                  </p>
                </li>
              ))}
            </ul>
          </section>

          <section className="px-5 py-12 sm:px-8">
            <h3 className="text-2xl font-bold text-zinc-900">Our work</h3>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {gallery.slice(0, 3).map((src, i) => (
                <div
                  key={`${src}-${i}`}
                  className="relative h-40 overflow-hidden rounded-xl"
                >
                  <Image
                    src={src}
                    alt={`Project ${i + 1}`}
                    fill
                    className="object-cover"
                    sizes="300px"
                  />
                </div>
              ))}
            </div>
          </section>

          {site.testimonials.length > 0 && (
            <section className="border-t border-zinc-100 bg-zinc-50 px-5 py-12 sm:px-8">
              <h3 className="text-2xl font-bold text-zinc-900">Reviews</h3>
              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                {site.testimonials.map((t) => (
                  <blockquote
                    key={`${t.name}-${t.text.slice(0, 16)}`}
                    className="rounded-2xl border border-zinc-100 bg-white p-5 shadow-sm"
                  >
                    <p className="text-sm leading-relaxed text-zinc-700">
                      “{t.text}”
                    </p>
                    <footer className="mt-4 text-xs font-semibold text-zinc-900">
                      {t.name}
                    </footer>
                  </blockquote>
                ))}
              </div>
            </section>
          )}

          {site.faq.length > 0 && (
            <section className="px-5 py-12 sm:px-8">
              <h3 className="text-2xl font-bold text-zinc-900">FAQ</h3>
              <div className="mt-6 space-y-3">
                {site.faq.map((item) => (
                  <details
                    key={item.question}
                    className="rounded-xl border border-zinc-100 bg-zinc-50 px-4 py-3"
                  >
                    <summary className="cursor-pointer list-none text-sm font-semibold text-zinc-900">
                      {item.question}
                    </summary>
                    <p className="mt-2 text-sm leading-relaxed text-zinc-600">
                      {item.answer}
                    </p>
                  </details>
                ))}
              </div>
            </section>
          )}

          <section
            className="px-5 py-14 text-center text-white sm:px-8"
            style={{
              background: `linear-gradient(135deg, ${theme.primary}, ${theme.accent})`,
            }}
          >
            <h3 className="text-2xl font-bold sm:text-3xl">{site.hero.cta}</h3>
            <p className="mx-auto mt-3 max-w-md text-sm opacity-90">
              {site.seo.description}
            </p>
            <div className="mt-6 space-y-1">
              <p className="text-2xl font-bold">{site.contact.phone}</p>
              <p className="text-sm opacity-90">{site.contact.email}</p>
              <p className="text-sm opacity-80">{site.contact.address}</p>
            </div>
            <button
              type="button"
              className="mt-6 rounded-full bg-white px-6 py-2.5 text-sm font-semibold"
              style={{ color: theme.primary }}
            >
              {site.hero.cta}
            </button>
          </section>

          <footer className="px-5 py-4 text-center text-[11px] text-zinc-400">
            © {new Date().getFullYear()} {businessName}. Preview by {brand.name}.
          </footer>
        </div>
      </div>
    </div>
  );
}
