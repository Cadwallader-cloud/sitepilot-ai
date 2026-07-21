import { css, inset, radius } from "./tokens";

export type InputProps = {
  name?: string;
  type?: "text" | "email" | "tel" | "url" | "search";
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  disabled?: boolean;
  className?: string;
};

export function Input({
  name,
  type = "text",
  placeholder,
  value,
  defaultValue,
  disabled = false,
  className = "",
}: InputProps) {
  return (
    <input
      name={name}
      type={type}
      placeholder={placeholder}
      value={value}
      defaultValue={defaultValue}
      disabled={disabled}
      className={`w-full ${css.borderAll} ${css.surface} text-sm ${css.text} outline-none transition placeholder:text-[var(--muted)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--primary)_20%,transparent)] disabled:cursor-not-allowed disabled:opacity-60 ${radius.sm} ${inset.input} ${className}`.trim()}
      data-component="Input"
    />
  );
}
