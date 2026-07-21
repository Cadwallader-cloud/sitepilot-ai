import { css, inset, marginTop, radius, spacing } from "@/components/ui/tokens";

export type TrustBarProps = {
  items: string[];
  align?: "left" | "center";
  className?: string;
};

/** Trust chips below hero copy. */
export function TrustBar({
  items,
  align = "center",
  className = "",
}: TrustBarProps) {
  if (!items.length) return null;

  return (
    <ul
      className={`${marginTop["2xl"]} flex flex-wrap ${spacing.md} ${align === "center" ? "justify-center" : ""} ${className}`.trim()}
      data-component="TrustBar"
    >
      {items.map((item) => (
        <li
          key={item}
          className={`${radius.full} ${css.borderAll} ${inset.badge} text-sm font-medium ${css.text}`}
        >
          {item}
        </li>
      ))}
    </ul>
  );
}
