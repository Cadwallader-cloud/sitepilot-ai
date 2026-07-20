"use client";

import { SiteJsonLd } from "@/components/site-json-ld";
import {
  mapsSearchUrl,
  SitePageView,
  TrackedLink,
} from "@/components/site-tracker";
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
import {
  shouldShowTestimonialsSection,
  visibleTestimonials,
} from "@/lib/testimonials";
import Image from "next/image";
import type { CSSProperties } from "react";

type PublishedWebsiteProps = {
  site: GeneratedSite;
  projectId: string;
  slug: string;
};

/** Public live website — no editor chrome */
export function PublishedWebsite({
  site,
  projectId,
  slug,
}: PublishedWebsiteProps) {
  const theme = site.theme;
  const businessName = getBusinessName(site);
  const gallery = site.images.gallery.length
    ? site.images.gallery
    : [site.images.hero];
  const sections = getSiteSections(site);
  const hero = getHero(site);
  const design = normalizeDesignSystem(site.design);
  const designVars = designSystemToCssVars(design, theme);
  const fontsHref = googleFontsHrefFor(design.font);
  const trustItems =
    hero.trustBar.length > 0
      ? hero.trustBar
      : site.services.slice(0, 4).map((s) => s.title);
  const phoneHref = `tel:${site.contact.phone.replace(/\s/g, "")}`;
  const emailHref = `mailto:${site.contact.email.trim()}`;
  const mapsHref = mapsSearchUrl(site.contact.address);
  const heroShell = resolveHeroShell(site);
  let surfaceIndex = 0;
  const nextSurface = () =>
    sectionSurfaceClass(design.sectionStyle, surfaceIndex++);

  return (
    <div
      className="min-h-screen bg-white text-zinc-900"
      style={
        {
          ...designVars,
          fontFamily: "var(--site-font)",
        } as CSSProperties
      }
      data-design-theme={design.theme}
      data-design-palette={design.palette}
      data-design-font={design.font}
      data-section-style={design.sectionStyle}
    >
      {fontsHref ? <link rel="stylesheet" href={fontsHref} /> : null}
      <SiteJsonLd site={site} />
      <SitePageView projectId={projectId} slug={slug} />

      <header className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 sm:px-8 lg:px-12">
        <div>
          <p className="font-bold" style={{ color: theme.primary }}>
            {businessName}
          </p>
          <TrackedLink
            projectId={projectId}
            eventType="maps_click"
            href={mapsHref}
            className="text-[11px] uppercase tracking-wide text-zinc-500 underline-offset-2 hover:underline"
          >
            {site.contact.address}
          </TrackedLink>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {(site.seo.internalLinks ?? [])
            .filter((l) => l.href !== "#hero" && l.href !== "#contact")
            .slice(0, 4)
            .map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="hidden text-xs font-medium text-zinc-600 underline-offset-2 hover:underline sm:inline"
              >
                {link.anchor}
              </a>
            ))}
          <TrackedLink
            projectId={projectId}
            eventType="phone_click"
            href={phoneHref}
            className="rounded-full px-4 py-2 text-sm font-semibold text-white"
            style={{ backgroundColor: theme.primary }}
          >
            Call now
          </TrackedLink>
        </div>
      </header>

      {sections.map((section) => {
        if (section.id === "hero") {
          return (
            <div key="hero" id="hero">
              <SiteHeroShell
                shell={heroShell}
                headline={hero.headline}
                subheadline={hero.subheadline}
                primaryCTA={hero.primaryCTA}
                secondaryCTA={hero.secondaryCTA || site.contact.phone}
                address={site.contact.address}
                heroImage={site.images.hero}
                primaryColor={theme.primary}
                renderAddress={(className) => (
                  <TrackedLink
                    projectId={projectId}
                    eventType="maps_click"
                    href={mapsHref}
                    className={className}
                  >
                    {site.contact.address}
                  </TrackedLink>
                )}
                renderPrimaryCta={(className, style) => (
                  <TrackedLink
                    projectId={projectId}
                    eventType="phone_click"
                    href={phoneHref}
                    className={className}
                    style={style}
                  >
                    {hero.primaryCTA}
                  </TrackedLink>
                )}
                renderSecondaryCta={(className) => (
                  <TrackedLink
                    projectId={projectId}
                    eventType="phone_click"
                    href={phoneHref}
                    className={className}
                  >
                    {hero.secondaryCTA || site.contact.phone}
                  </TrackedLink>
                )}
              />
              {trustItems.length > 0 && (
                <section className="grid gap-3 border-b border-zinc-100 bg-zinc-50 px-5 py-6 sm:grid-cols-2 sm:px-8 lg:grid-cols-4 lg:px-12">
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
              className={`grid gap-8 px-5 py-14 sm:px-8 lg:grid-cols-2 lg:items-center lg:px-12 ${nextSurface()}`}
            >
              <div>
                <h2 className="text-3xl font-bold">
                  {site.about.title || section.label}
                </h2>
                {(site.about.paragraphs?.length
                  ? site.about.paragraphs
                  : site.about.text.split(/\n\n+/).filter(Boolean)
                ).map((para) => (
                  <p
                    key={para.slice(0, 24)}
                    className="mt-4 text-base leading-relaxed text-zinc-600"
                  >
                    {para}
                  </p>
                ))}
                {site.about.highlights && site.about.highlights.length > 0 ? (
                  <ul className="mt-6 grid gap-2 sm:grid-cols-3">
                    {site.about.highlights.map((item) => (
                      <li
                        key={item}
                        className="rounded-xl bg-zinc-50 px-3 py-2 text-center text-sm font-medium text-zinc-700"
                      >
                        {item}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
              <div className="relative h-64 overflow-hidden rounded-2xl sm:h-72">
                <Image
                  src={gallery[0]}
                  alt={site.about.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
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
              className={`border-t border-zinc-100 px-5 py-14 sm:px-8 lg:px-12 ${nextSurface()}`}
            >
              <h2 className="text-3xl font-bold">{section.label}</h2>
              <p className="mt-2 text-sm text-zinc-600">
                {section.id === "menu" ? "Highlights across " : "Across "}
                <TrackedLink
                  projectId={projectId}
                  eventType="maps_click"
                  href={mapsHref}
                  className="underline-offset-2 hover:underline"
                >
                  {site.contact.address}
                </TrackedLink>
              </p>

              {featured ? (
                <div
                  className="mt-8 rounded-2xl border border-zinc-200 bg-white p-6 sm:p-8"
                  style={{ boxShadow: `0 0 0 1px ${theme.primary}18` }}
                >
                  <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
                    <span
                      className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
                      style={{
                        backgroundColor: `${theme.primary}14`,
                        color: theme.primary,
                      }}
                    >
                      <ServiceIcon
                        name={featured.icon}
                        className="h-6 w-6"
                      />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-zinc-500">
                        Primary service
                      </p>
                      <h3
                        className="mt-1 text-2xl font-bold sm:text-3xl"
                        style={{ color: theme.primary }}
                      >
                        {featured.title}
                      </h3>
                      <p className="mt-3 max-w-2xl text-base text-zinc-600">
                        {featured.description}
                      </p>
                      {featured.benefits && featured.benefits.length > 0 && (
                        <ul className="mt-5 grid gap-2 sm:grid-cols-3">
                          {featured.benefits.map((benefit) => (
                            <li
                              key={benefit}
                              className="rounded-lg bg-zinc-50 px-3 py-2 text-sm text-zinc-600"
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
                <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {secondary.map((service) => (
                    <li
                      key={service.title}
                      className="rounded-xl border border-zinc-100 bg-white px-5 py-4"
                    >
                      <div className="flex items-start gap-3">
                        <span
                          className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                          style={{
                            backgroundColor: `${theme.primary}14`,
                            color: theme.primary,
                          }}
                        >
                          <ServiceIcon name={service.icon} />
                        </span>
                        <div className="min-w-0">
                          <p
                            className="font-semibold"
                            style={{ color: theme.primary }}
                          >
                            {service.title}
                          </p>
                          <p className="mt-2 text-sm text-zinc-600">
                            {service.description}
                          </p>
                          {service.benefits && service.benefits.length > 0 && (
                            <ul className="mt-3 space-y-1 text-sm text-zinc-500">
                              {service.benefits.map((benefit) => (
                                <li key={benefit}>• {benefit}</li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : null}

              {optional.length > 0 ? (
                <div className="mt-8 border-t border-zinc-100 pt-6">
                  <p className="text-sm font-medium text-zinc-500">
                    Also available
                  </p>
                  <ul className="mt-3 flex flex-wrap gap-2">
                    {optional.map((service) => (
                      <li
                        key={service.title}
                        className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-sm text-zinc-700"
                      >
                        <ServiceIcon
                          name={service.icon}
                          className="h-3.5 w-3.5"
                          color={theme.primary}
                        />
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
              className={`px-5 py-14 sm:px-8 lg:px-12 ${nextSurface()}`}
            >
              <h2 className="text-3xl font-bold">{section.label}</h2>
              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                {gallery.slice(0, 3).map((src, i) => (
                  <div
                    key={`${src}-${i}`}
                    className="relative h-48 overflow-hidden rounded-xl"
                  >
                    <Image
                      src={src}
                      alt={`${section.label} ${i + 1}`}
                      fill
                      className="object-cover"
                      sizes="33vw"
                    />
                  </div>
                ))}
              </div>
            </section>
          );
        }

        // Live sites: never show AI demo examples — real reviews only, or hide
        if (
          section.id === "testimonials" &&
          shouldShowTestimonialsSection(site.testimonials, "live")
        ) {
          const reviews = visibleTestimonials(site.testimonials, "live");
          return (
            <section
              key="testimonials"
              id="testimonials"
              className={`border-t border-zinc-100 px-5 py-14 sm:px-8 lg:px-12 ${nextSurface()}`}
            >
              <h2 className="text-3xl font-bold">{section.label}</h2>
              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                {reviews.map((t) => (
                  <blockquote
                    key={`${t.name}-${t.text.slice(0, 16)}`}
                    className="rounded-2xl border border-zinc-100 bg-white p-6 shadow-sm"
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
          );
        }

        if (section.id === "faq" && site.faq.length > 0) {
          return (
            <section
              key="faq"
              id="faq"
              className={`px-5 py-14 sm:px-8 lg:px-12 ${nextSurface()}`}
            >
              <h2 className="text-3xl font-bold">{section.label}</h2>
              <div className="mt-8 space-y-3">
                {site.faq.map((item) => (
                  <details
                    key={item.question}
                    className="rounded-xl border border-zinc-100 bg-zinc-50 px-5 py-4"
                  >
                    <summary className="cursor-pointer list-none font-semibold">
                      <span className="flex flex-wrap items-center gap-2">
                        {item.category ? (
                          <span className="rounded bg-white px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-zinc-500">
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
              className="px-5 py-16 text-center text-white sm:px-8"
              style={{
                background: `linear-gradient(135deg, ${theme.primary}, ${theme.accent})`,
              }}
            >
              <h2 className="text-3xl font-bold sm:text-4xl">
                {band.headline}
              </h2>
              <p className="mx-auto mt-3 max-w-md text-sm opacity-90">
                {site.seo.description}
              </p>
              <div className="mt-6 space-y-2">
                <p>
                  <TrackedLink
                    projectId={projectId}
                    eventType="phone_click"
                    href={phoneHref}
                    className="text-2xl font-bold underline-offset-2 hover:underline"
                  >
                    {site.contact.phone}
                  </TrackedLink>
                </p>
                <p>
                  <TrackedLink
                    projectId={projectId}
                    eventType="contact_click"
                    href={emailHref}
                    className="text-sm opacity-90 underline-offset-2 hover:underline"
                  >
                    {site.contact.email}
                  </TrackedLink>
                </p>
                <p>
                  <TrackedLink
                    projectId={projectId}
                    eventType="maps_click"
                    href={mapsHref}
                    className="text-sm opacity-80 underline-offset-2 hover:underline"
                  >
                    {site.contact.address}
                  </TrackedLink>
                </p>
              </div>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                <TrackedLink
                  projectId={projectId}
                  eventType="phone_click"
                  href={phoneHref}
                  className="inline-block rounded-full bg-white px-7 py-3 text-sm font-semibold"
                  style={{ color: theme.primary }}
                >
                  {band.primaryCTA}
                </TrackedLink>
                {band.secondaryCTA && (
                  <TrackedLink
                    projectId={projectId}
                    eventType="phone_click"
                    href={phoneHref}
                    className="text-sm font-medium text-white/90 underline-offset-2 hover:underline"
                  >
                    {band.secondaryCTA}
                  </TrackedLink>
                )}
              </div>
            </section>
          );
        }

        return null;
      })}

      <footer className="px-5 py-6 text-center text-xs text-zinc-400">
        © {new Date().getFullYear()} {businessName}. Built with {brand.name}.
      </footer>
    </div>
  );
}
