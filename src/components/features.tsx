import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-surface-border px-6 py-8">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 text-sm text-muted sm:flex-row">
        <p>© 2026 Crestis · AI Website Builder</p>
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
          <Link
            href="/privacy"
            className="transition hover:text-foreground"
          >
            Privacy Policy
          </Link>
          <span aria-hidden="true">·</span>
          <Link
            href="/terms"
            className="transition hover:text-foreground"
          >
            Terms of Service
          </Link>
          <span aria-hidden="true">·</span>
          <Link
            href="/refund"
            className="transition hover:text-foreground"
          >
            Refund Policy
          </Link>
          <span aria-hidden="true">·</span>
          <p>Free · Pro · Business</p>
        </div>
      </div>
    </footer>
  );
}
