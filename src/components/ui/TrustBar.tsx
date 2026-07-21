import { inset, marginTop, radius, spacing } from "./tokens";

export type TrustBarProps = {
  items: string[];
  align?: "left" | "center";
  className?: string;
};

export function TrustBar({
  items,
  align = "center",
  className = "",
}: TrustBarProps) {
  if (!items.length) return null;

  return (
    <ul
      className={`flex flex-wrap ${spacing.md} ${marginTop["2xl"]} ${align === "center" ? "justify-center" : ""} ${className}`.trim()}
      data-component="TrustBar"
    >
      {items.map((item) => (
        <li
          key={item}
          className={`border border-zinc-200 text-sm font-medium text-zinc-700 ${radius.full} ${inset.badge}`}
        >
          {item}
        </li>
      ))}
    </ul>
  );
}
