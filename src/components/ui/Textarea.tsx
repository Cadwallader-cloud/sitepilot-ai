import { inset, radius } from "./tokens";

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
      className={`w-full resize-y border border-zinc-200 bg-white text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-zinc-400 focus:ring-2 focus:ring-zinc-200 disabled:cursor-not-allowed disabled:opacity-60 ${radius.sm} ${inset.input} ${className}`.trim()}
      data-component="Textarea"
    />
  );
}
