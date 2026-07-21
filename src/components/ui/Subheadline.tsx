import { marginTop, typographyScale } from "./tokens";
import { toneTextClass } from "./typography";
import type { UiTone } from "./theme";

export type SubheadlineProps = {
  children: string;
  tone?: UiTone;
  className?: string;
};

/** @deprecated Prefer Text */
export function Subheadline({
  children,
  tone = "dark",
  className = "",
}: SubheadlineProps) {
  return (
    <p
      className={`${marginTop.sm} ${typographyScale.subheadline} ${toneTextClass[tone]} ${className}`.trim()}
      data-component="Subheadline"
    >
      {children}
    </p>
  );
}
