import { css, inset, radius, spacing } from "./tokens";

export type TrustBarProps = {
  items: string[];
  className?: string;
};

export function TrustBar({ items, className = "" }: TrustBarProps) {
  const visible = items.filter(Boolean);
  if (visible.length === 0) return null;

  return (
    <ul
      className={`flex flex-wrap ${spacing.md} ${className}`.trim()}
      data-component="TrustBar"
    >
      {visible.map((item) => (
        <li
          key={item}
          className={`${css.borderAll} text-sm font-medium ${css.text} ${radius.full} ${inset.badge}`}
        >
          {item}
        </li>
      ))}
    </ul>
  );
}
