"use client";

import { SiteJsonLd } from "@/components/site-json-ld";
import { resolveHeroShell, SiteHeroShell } from "@/components/site-hero-shell";
import { ServiceIcon } from "@/components/service-icon";
import { brand } from "@/lib/brand";
import {
  designSystemToCssVars,
  googleFontsHrefFor,
  normalizeDesignSystem,
  sectionSurfaceClass,
} from "@/lib/design-system";
import { partitionServices } from "@/lib/service-layout";
import { getSiteSections } from "@/lib/site-layout";
import type { GeneratedSite } from "@/lib/site-types";
import { getBusinessName, getHero } from "@/lib/site-types";
import Image from "next/image";
import { useState, type CSSProperties } from "react";

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
  const sections = getSiteSections(site);
  const hero = getHero(site);
  const design = normalizeDesignSystem(site.design);
  const designVars = designSystemToCssVars(design, theme);
  const fontsHref = googleFontsHrefFor(design.font);
  let surfaceIndex = 0;
  const nextSurface = () =>
    sectionSurfaceClass(design.sectionStyle, surfaceIndex++);

  /** Trust row — Hero Generator trustBar preferred over service titles */
  const trustItems =
    hero.trustBar.length > 0
      ? hero.trustBar
      : site.services.slice(0, 4).map((s) => s.title);
  const heroShell = resolveHeroShell(site);

  function patchHero(
    field: "headline" | "subheadline" | "primaryCTA" | "secondaryCTA",
    value: string,
  ) {
    onChange?.({
      ...site,
      hero: {
        headline: hero.headline,
        subheadline: hero.subheadline,
        primaryCTA: hero.primaryCTA,
        secondaryCTA: hero.secondaryCTA,
        [field]: value,
      },
    });
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
              [
                "hero.headline",
                hero.headline,
                (v: string) => patchHero("headline", v),
              ],
              [
                "hero.subheadline",
                hero.subheadline,
                (v: string) => patchHero("subheadline", v),
              ],
              [
                "hero.primaryCTA",
                hero.primaryCTA,
                (v: string) => patchHero("primaryCTA", v),
              ],
              [
                "hero.secondaryCTA",
                hero.secondaryCTA,
                (v: string) => patchHero("secondaryCTA", v),
              ],
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
          {site.layout?.sections && (
            <span className="ml-auto hidden max-w-[45%] truncate text-[10px] text-zinc-400 sm:inline">
              {site.layout.sections.map((s) => s.label).join(" → ")}
            </span>
          )}
        </div>

        <div
          className="max-h-[75vh] overflow-y-auto"
          style={
            {
              ...designVars,
              fontFamily: "var(--site-font)",
            } as CSSProperties
          }
          data-design-theme={design.theme}
          data-design-palette={design.palette}
          data-design-font={design.font}
          data-design-spacing={design.spacing}
          data-design-radius={design.borderRadius}
          data-design-animation={design.animation}
          data-design-image={design.imageStyle}
          data-section-style={design.sectionStyle}
        >
          {fontsHref ? <link rel="stylesheet" href={fontsHref} /> : null}
          <SiteJsonLd site={site} />
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

          {sections.map((section) => {
            if (section.id === "hero") {
              return (
                <div key="hero" id="hero">
                  <SiteHeroShell
                    shell={heroShell}
                    compact
                    headline={hero.headline}
                    subheadline={hero.subheadline}
                    primaryCTA={hero.primaryCTA}
                    secondaryCTA={hero.secondaryCTA || site.contact.phone}
                    address={site.contact.address}
                    heroImage={site.images.hero}
                    primaryColor={theme.primary}
                    renderAddress={(className) =>
                      editing ? (
                        <input
                          className={`${className} w-full bg-transparent outline-none`}
                          value={site.contact.address}
                          onChange={(e) =>
                            patchContact("address", e.target.value)
                          }
                        />
                      ) : (
                        <p className={className}>{site.contact.address}</p>
                      )
                    }
                    renderPrimaryCta={(className, style) =>
                      editing ? (
                        <input
                          className={`${className} outline-none`}
                          style={style}
                          value={hero.primaryCTA}
                          onChange={(e) =>
                            patchHero("primaryCTA", e.target.value)
                          }
                        />
                      ) : (
                        <button type="button" className={className} style={style}>
                          {hero.primaryCTA}
                        </button>
                      )
                    }
                    renderSecondaryCta={(className) =>
                      editing ? (
                        <input
                          className={`${className} bg-transparent outline-none`}
                          value={hero.secondaryCTA || site.contact.phone}
                          onChange={(e) =>
                            patchHero("secondaryCTA", e.target.value)
                          }
                        />
                      ) : (
                        <span className={className}>
                          {hero.secondaryCTA || site.contact.phone}
                        </span>
                      )
                    }
                  />
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
                </div>
              );
            }

            if (
              section.id === "about" ||
              section.id === "why_us" ||
              section.id === "trust"
            ) {
              return (
                <section
                  key={section.id}
                  id={section.id}
                  className={`grid gap-8 px-5 py-12 sm:px-8 lg:grid-cols-2 lg:items-center ${nextSurface()}`}
                >
                  <div>
                    <h3 className="text-2xl font-bold text-zinc-900">
                      {site.about.title || section.label}
                    </h3>
                    {(site.about.paragraphs?.length
                      ? site.about.paragraphs
                      : site.about.text.split(/\n\n+/).filter(Boolean)
                    ).map((para) => (
                      <p
                        key={para.slice(0, 24)}
                        className="mt-4 text-sm leading-relaxed text-zinc-600"
                      >
                        {para}
                      </p>
                    ))}
                    {site.about.highlights && site.about.highlights.length > 0 ? (
                      <ul className="mt-5 grid gap-2 sm:grid-cols-3">
                        {site.about.highlights.map((item) => (
                          <li
                            key={item}
                            className="rounded-xl bg-zinc-50 px-3 py-2 text-center text-xs font-medium text-zinc-700"
                          >
                            {item}
                          </li>
                        ))}
                      </ul>
                    ) : null}
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
              );
            }

            if (section.id === "services" || section.id === "menu") {
              const { featured, secondary, optional } = partitionServices(
                site.services,
              );
              return (
                <section
                  key={section.id}
                  id={section.id}
                  className={`border-t border-zinc-100 px-5 py-12 sm:px-8 ${nextSurface()}`}
                >
                  <h3 className="text-2xl font-bold text-zinc-900">
                    {section.label}
                  </h3>
                  <p className="mt-2 text-sm text-zinc-600">
                    {section.id === "menu"
                      ? `Highlights from ${site.contact.address}`
                      : `Across ${site.contact.address}`}
                  </p>

                  {featured ? (
                    <div className="mt-6 rounded-xl border border-zinc-200 bg-white p-5">
                      <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-zinc-500">
                        Primary service
                      </p>
                      <div className="mt-2 flex items-start gap-3">
                        <span
                          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
                          style={{
                            backgroundColor: `${theme.primary}14`,
                            color: theme.primary,
                          }}
                        >
                          <ServiceIcon name={featured.icon} />
                        </span>
                        <div>
                          <p
                            className="text-lg font-bold"
                            style={{ color: theme.primary }}
                          >
                            {featured.title}
                          </p>
                          <p className="mt-1 text-sm text-zinc-600">
                            {featured.description}
                          </p>
                          {featured.benefits && featured.benefits.length > 0 && (
                            <ul className="mt-3 flex flex-wrap gap-2">
                              {featured.benefits.map((benefit) => (
                                <li
                                  key={benefit}
                                  className="rounded-md bg-zinc-50 px-2 py-1 text-xs text-zinc-600"
                                >
                                  {benefit}
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : null}

                  {secondary.length > 0 ? (
                    <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                      {secondary.map((service) => (
                        <li
                          key={service.title}
                          className="rounded-xl border border-zinc-100 bg-white px-4 py-3"
                        >
                          <div className="flex items-start gap-2.5">
                            <span
                              className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md"
                              style={{
                                backgroundColor: `${theme.primary}14`,
                                color: theme.primary,
                              }}
                            >
                              <ServiceIcon
                                name={service.icon}
                                className="h-4 w-4"
                              />
                            </span>
                            <div className="min-w-0">
                              <p
                                className="text-sm font-semibold"
                                style={{ color: theme.primary }}
                              >
                                {service.title}
                              </p>
                              <p className="mt-1 text-sm text-zinc-600">
                                {service.description}
                              </p>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : null}

                  {optional.length > 0 ? (
                    <div className="mt-5 border-t border-zinc-100 pt-4">
                      <p className="text-xs font-medium text-zinc-500">
                        Also available
                      </p>
                      <ul className="mt-2 flex flex-wrap gap-1.5">
                        {optional.map((service) => (
                          <li
                            key={service.title}
                            className="rounded-full border border-zinc-200 bg-white px-2.5 py-1 text-xs text-zinc-700"
                          >
                            {service.title}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </section>
              );
            }

            if (section.id === "projects" || section.id === "gallery") {
              return (
                <section
                  key={section.id}
                  id={section.id}
                  className={`px-5 py-12 sm:px-8 ${nextSurface()}`}
                >
                  <h3 className="text-2xl font-bold text-zinc-900">
                    {section.label}
                  </h3>
                  <div className="mt-6 grid gap-3 sm:grid-cols-3">
                    {gallery.slice(0, 3).map((src, i) => (
                      <div
                        key={`${src}-${i}`}
                        className="relative h-40 overflow-hidden rounded-xl"
                      >
                        <Image
                          src={src}
                          alt={`${section.label} ${i + 1}`}
                          fill
                          className="object-cover"
                          sizes="300px"
                        />
                      </div>
                    ))}
                  </div>
                </section>
              );
            }

            if (section.id === "testimonials" && site.testimonials.length > 0) {
              return (
                <section
                  key="testimonials"
                  id="testimonials"
                  className={`border-t border-zinc-100 px-5 py-12 sm:px-8 ${nextSurface()}`}
                >
                  <div className="flex flex-wrap items-end justify-between gap-2">
                    <h3 className="text-2xl font-bold text-zinc-900">
                      {section.label}
                    </h3>
                    {site.testimonials.some((t) => t.demo) && (
                      <p className="text-xs text-zinc-500">
                        Example reviews for preview — not shown as real on the
                        live site
                      </p>
                    )}
                  </div>
                  <div className="mt-6 grid gap-4 sm:grid-cols-3">
                    {site.testimonials.map((t) => (
                      <blockquote
                        key={`${t.name}-${t.text.slice(0, 16)}`}
                        className="rounded-2xl border border-zinc-100 bg-white p-5 shadow-sm"
                      >
                        {t.demo ? (
                          <span className="mb-3 inline-block rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-800">
                            Example
                          </span>
                        ) : (
                          <span className="mb-3 inline-block rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-800">
                            Customer review
                          </span>
                        )}
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
              );
            }

            if (section.id === "faq" && site.faq.length > 0) {
              return (
                <section
                  key="faq"
                  id="faq"
                  className={`px-5 py-12 sm:px-8 ${nextSurface()}`}
                >
                  <h3 className="text-2xl font-bold text-zinc-900">
                    {section.label}
                  </h3>
                  <div className="mt-6 space-y-3">
                    {site.faq.map((item) => (
                      <details
                        key={item.question}
                        className="rounded-xl border border-zinc-100 bg-zinc-50 px-4 py-3"
                      >
                        <summary className="cursor-pointer list-none text-sm font-semibold text-zinc-900">
                          <span className="flex flex-wrap items-center gap-2">
                            {item.category ? (
                              <span className="rounded bg-white px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wide text-zinc-500">
                                {item.category}
                              </span>
                            ) : null}
                            <span>{item.question}</span>
                          </span>
                        </summary>
                        <p className="mt-2 text-sm leading-relaxed text-zinc-600">
                          {item.answer}
                        </p>
                      </details>
                    ))}
                  </div>
                </section>
              );
            }

            if (section.id === "contact") {
              const band = site.cta ?? {
                headline: hero.primaryCTA,
                primaryCTA: hero.primaryCTA,
                secondaryCTA: hero.secondaryCTA,
              };
              return (
                <section
                  key="contact"
                  id="contact"
                  className="px-5 py-14 text-center text-white sm:px-8"
                  style={{
                    background: `linear-gradient(135deg, ${theme.primary}, ${theme.accent})`,
                  }}
                >
                  <h3 className="text-2xl font-bold sm:text-3xl">
                    {band.headline}
                  </h3>
                  <p className="mx-auto mt-3 max-w-md text-sm opacity-90">
                    {site.seo.description}
                  </p>
                  <div className="mt-6 space-y-1">
                    <p className="text-2xl font-bold">{site.contact.phone}</p>
                    <p className="text-sm opacity-90">{site.contact.email}</p>
                    <p className="text-sm opacity-80">{site.contact.address}</p>
                  </div>
                  <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                    <button
                      type="button"
                      className="rounded-full bg-white px-6 py-2.5 text-sm font-semibold"
                      style={{ color: theme.primary }}
                    >
                      {band.primaryCTA}
                    </button>
                    {band.secondaryCTA && (
                      <span className="text-sm font-medium text-white/90">
                        {band.secondaryCTA}
                      </span>
                    )}
                  </div>
                </section>
              );
            }

            return null;
          })}

          <footer className="px-5 py-4 text-center text-[11px] text-zinc-400">
            © {new Date().getFullYear()} {businessName}. Preview by {brand.name}.
          </footer>
        </div>
      </div>
    </div>
  );
}
