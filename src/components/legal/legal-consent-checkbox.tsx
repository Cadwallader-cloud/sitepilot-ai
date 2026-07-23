"use client";

import Link from "next/link";

type LegalConsentCheckboxProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  id: string;
  className?: string;
};

export function LegalConsentCheckbox({
  checked,
  onChange,
  id,
  className = "",
}: LegalConsentCheckboxProps) {
  return (
    <label
      htmlFor={id}
      className={`flex cursor-pointer items-start gap-3 text-left text-xs leading-relaxed text-muted ${className}`}
    >
      <input
        id={id}
        name={id}
        type="checkbox"
        required
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 h-4 w-4 shrink-0 rounded border-surface-border accent-brand"
      />
      <span>
        I have read and agree to the{" "}
        <Link
          href="/privacy"
          className="text-brand-light underline underline-offset-2 hover:text-foreground"
          onClick={(e) => e.stopPropagation()}
        >
          Privacy Policy
        </Link>{" "}
        and{" "}
        <Link
          href="/terms"
          className="text-brand-light underline underline-offset-2 hover:text-foreground"
          onClick={(e) => e.stopPropagation()}
        >
          Terms of Service
        </Link>
        .
      </span>
    </label>
  );
}
