import { inset, radius } from "./tokens";

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
      className={`w-full border border-zinc-200 bg-white text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-zinc-400 focus:ring-2 focus:ring-zinc-200 disabled:cursor-not-allowed disabled:opacity-60 ${radius.sm} ${inset.input} ${className}`.trim()}
      data-component="Input"
    />
  );
}
