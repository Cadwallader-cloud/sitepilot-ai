"use client";

import {
  heroShellForVariant,
  isTemplateVariant,
  type HeroShell,
  type TemplateVariant,
} from "@/lib/template-library";
import type { GeneratedSite } from "@/lib/site-types";
import Image from "next/image";
import type { CSSProperties, ReactNode } from "react";

export function resolveHeroShell(site: GeneratedSite): HeroShell {
  const raw = site.layout?.strategy?.variant;
  const variant: TemplateVariant = isTemplateVariant(raw) ? raw : "A";
  return heroShellForVariant(variant);
}

type SiteHeroShellProps = {
  shell: HeroShell;
  headline: string;
  subheadline: string;
  primaryCTA: string;
  secondaryCTA: string;
  address: string;
  heroImage: string;
  primaryColor: string;
  /** Smaller min-heights for editor preview */
  compact?: boolean;
  renderAddress: (className: string) => ReactNode;
  renderPrimaryCta: (className: string, style: CSSProperties) => ReactNode;
  renderSecondaryCta: (className: string) => ReactNode;
};

/**
 * Locked Hero shells from Template Library variants:
 * A fullBleed · B split · C darkBand
 */
export function SiteHeroShell({
  shell,
  headline,
  subheadline,
  primaryCTA,
  secondaryCTA,
  address,
  heroImage,
  primaryColor,
  compact,
  renderAddress,
  renderPrimaryCta,
  renderSecondaryCta,
}: SiteHeroShellProps) {
  const minH = compact
    ? "min-h-[320px] sm:min-h-[380px]"
    : "min-h-[420px] sm:min-h-[520px]";
  const pad = compact
    ? "px-5 py-10 sm:px-10"
    : "px-5 py-12 sm:px-10 lg:px-16";
  const titleClass = compact
    ? "mt-2 max-w-xl text-3xl font-bold leading-tight sm:text-4xl"
    : "mt-2 max-w-3xl text-4xl font-bold leading-tight sm:text-5xl";
  const subClass = compact
    ? "mt-3 max-w-lg text-sm text-white/90 sm:text-base"
    : "mt-4 max-w-xl text-base text-white/90 sm:text-lg";

  if (shell === "split") {
    return (
      <section
        className={`grid overflow-hidden lg:grid-cols-2 ${minH}`}
        data-hero-shell="split"
      >
        <div
          className={`flex flex-col justify-center bg-zinc-50 ${pad}`}
          style={{ color: "#18181b" }}
        >
          {renderAddress(
            "text-xs font-semibold uppercase tracking-wider text-zinc-500",
          )}
          <h1 className={`${titleClass} text-zinc-900`}>{headline}</h1>
          <p className={`${subClass} !text-zinc-600`}>{subheadline}</p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            {renderPrimaryCta("rounded-full px-7 py-3 text-sm font-semibold text-white", {
              backgroundColor: primaryColor,
            })}
            {renderSecondaryCta(
              "text-sm font-medium text-zinc-700 underline-offset-2 hover:underline",
            )}
          </div>
        </div>
        <div className={`relative ${minH}`}>
          <Image
            src={heroImage}
            alt={headline}
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 50vw"
            priority
          />
        </div>
      </section>
    );
  }

  if (shell === "darkBand") {
    return (
      <section
        className={`relative overflow-hidden bg-zinc-950 text-white ${minH}`}
        data-hero-shell="darkBand"
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            backgroundImage: `url(${heroImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/90 to-zinc-950/40" />
        <div className={`relative z-10 flex ${minH} flex-col justify-center ${pad}`}>
          {renderAddress(
            "text-xs font-semibold uppercase tracking-wider text-white/70",
          )}
          <h1 className={titleClass}>{headline}</h1>
          <p className={subClass}>{subheadline}</p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            {renderPrimaryCta(
              "rounded-full bg-white px-7 py-3 text-sm font-semibold",
              { color: primaryColor },
            )}
            {renderSecondaryCta(
              "text-sm font-medium text-white/90 underline-offset-2 hover:underline",
            )}
          </div>
          <p className="sr-only">{address}</p>
        </div>
      </section>
    );
  }

  // Default: fullBleed (variant A)
  return (
    <section
      className={`relative overflow-hidden ${minH}`}
      data-hero-shell="fullBleed"
    >
      <Image
        src={heroImage}
        alt={headline}
        fill
        className="object-cover"
        sizes="100vw"
        priority
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/50 to-black/30" />
      <div
        className={`relative z-10 flex ${minH} flex-col justify-end text-white ${pad}`}
      >
        {renderAddress(
          "text-xs font-semibold uppercase tracking-wider text-white/80 underline-offset-2 hover:underline",
        )}
        <h1 className={titleClass}>{headline}</h1>
        <p className={subClass}>{subheadline}</p>
        <div className="mt-8 flex flex-wrap items-center gap-4">
          {renderPrimaryCta("rounded-full bg-white px-7 py-3 text-sm font-semibold", {
            color: primaryColor,
          })}
          {renderSecondaryCta(
            "text-sm font-medium underline-offset-2 hover:underline",
          )}
        </div>
      </div>
    </section>
  );
}
