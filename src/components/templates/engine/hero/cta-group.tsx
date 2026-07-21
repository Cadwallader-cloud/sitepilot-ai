import type { Hero } from "@/lib/website";
import { css, inset, marginTop, spacing } from "@/components/ui/tokens";
import type { EngineAlign, EngineThemeSlice } from "../types";
import { alignClass, engineButtonRadius } from "../types";

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
  const radius = engineButtonRadius(theme);

  return (
    <div
      className={`flex flex-wrap ${spacing.md} ${alignClass(align)} ${className || marginTop.lg}`.trim()}
      data-component="CTAGroup"
    >
      <span
        className={`inline-flex items-center justify-center ${inset.button} text-sm font-semibold ${css.primaryBg} ${css.onPrimary} ${radius}`}
      >
        {hero.primaryCTA}
      </span>
      {hero.secondaryCTA ? (
        <span
          className={`inline-flex items-center justify-center ${css.borderAll} ${css.surface} ${inset.button} text-sm font-semibold ${css.text} ${radius}`}
        >
          {hero.secondaryCTA}
        </span>
      ) : null}
    </div>
  );
}
