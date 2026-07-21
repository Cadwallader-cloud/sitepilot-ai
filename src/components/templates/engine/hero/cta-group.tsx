import type { Hero } from "@/lib/website";
import type { EngineAlign, EngineThemeSlice } from "../types";
import { alignClass, engineButtonRadius, enginePrimary } from "../types";

export type CTAGroupProps = EngineThemeSlice & {
  hero: Pick<Hero, "primaryCTA" | "secondaryCTA">;
  align?: EngineAlign;
  className?: string;
};

/** Primary + secondary call-to-action buttons. */
export function CTAGroup({
  hero,
  theme,
  align = "left",
  className = "",
}: CTAGroupProps) {
  const primary = enginePrimary(theme);
  const radius = engineButtonRadius(theme);

  return (
    <div
      className={`flex flex-wrap gap-3 ${alignClass(align)} ${className || "mt-8"}`.trim()}
      data-component="CTAGroup"
    >
      <span
        className={`inline-flex items-center justify-center px-6 py-3 text-sm font-semibold text-white ${radius}`}
        style={{ backgroundColor: primary }}
      >
        {hero.primaryCTA}
      </span>
      {hero.secondaryCTA ? (
        <span
          className={`inline-flex items-center justify-center border border-zinc-200 bg-white px-6 py-3 text-sm font-semibold text-zinc-800 ${radius}`}
        >
          {hero.secondaryCTA}
        </span>
      ) : null}
    </div>
  );
}
