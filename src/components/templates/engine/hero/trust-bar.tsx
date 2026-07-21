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
      className={`mt-12 flex flex-wrap gap-3 ${align === "center" ? "justify-center" : ""} ${className}`.trim()}
      data-component="TrustBar"
    >
      {items.map((item) => (
        <li
          key={item}
          className="rounded-full border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700"
        >
          {item}
        </li>
      ))}
    </ul>
  );
}
