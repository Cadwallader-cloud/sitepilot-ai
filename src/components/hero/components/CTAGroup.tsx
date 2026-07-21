import type { Hero } from "@/lib/website";
import { Button, alignClass, marginTop, spacing, type UiAlign } from "@/components/ui";

export type CTAGroupProps = {
  hero: Hero;
  align?: UiAlign;
  className?: string;
};

/** Primary + secondary CTAs — composes ui/Button (theme injected). */
export function CTAGroup({
  hero,
  align = "left",
  className = "",
}: CTAGroupProps) {
  return (
    <div
      className={`flex flex-wrap ${spacing.md} ${alignClass(align)} ${className || marginTop.lg}`.trim()}
      data-component="CTAGroup"
    >
      <Button variant="primary">{hero.primaryCTA}</Button>
      {hero.secondaryCTA ? (
        <Button variant="secondary">{hero.secondaryCTA}</Button>
      ) : null}
    </div>
  );
}
