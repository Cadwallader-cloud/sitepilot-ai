import { css, marginTop } from "@/components/ui/tokens";
import { responsiveTypography } from "@/components/ui/responsive";
import type { EngineTone } from "../types";

export type SubheadlineProps = {
  children: string;
  tone?: EngineTone;
  className?: string;
};

const toneClass: Record<EngineTone, string> = {
  light: `${css.invertedText}/90`,
  dark: css.muted,
  brand: css.muted,
  muted: css.muted,
};

export function Subheadline({
  children,
  tone = "dark",
  className = "",
}: SubheadlineProps) {
  return (
    <p
      className={`${marginTop.sm} ${responsiveTypography.subheadline} ${toneClass[tone]} ${className}`.trim()}
      data-component="Subheadline"
    >
      {children}
    </p>
  );
}
