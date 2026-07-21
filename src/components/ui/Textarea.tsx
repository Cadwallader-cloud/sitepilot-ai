import { css, inset, radius } from "./tokens";

export type TextareaProps = {
  name?: string;
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  rows?: number;
  disabled?: boolean;
  className?: string;
};

export function Textarea({
  name,
  placeholder,
  value,
  defaultValue,
  rows = 4,
  disabled = false,
  className = "",
}: TextareaProps) {
  return (
    <textarea
      name={name}
      placeholder={placeholder}
      value={value}
      defaultValue={defaultValue}
      rows={rows}
      disabled={disabled}
      className={`w-full resize-y ${css.borderAll} ${css.surface} text-sm ${css.text} outline-none transition placeholder:text-[var(--muted)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--primary)_20%,transparent)] disabled:cursor-not-allowed disabled:opacity-60 ${radius.sm} ${inset.input} ${className}`.trim()}
      data-component="Textarea"
    />
  );
}
