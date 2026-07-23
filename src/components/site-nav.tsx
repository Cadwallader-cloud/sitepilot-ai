"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useEffect, useId, useState } from "react";
import { HomeSectionLink, siteLinkClassName } from "@/components/home-section-link";
import {
  ADMIN_NAV_ENTRY,
  MAIN_NAV_ENTRIES,
  type SiteNavEntry,
} from "@/lib/site-navigation";

type SiteNavLinksProps = {
  className?: string;
  onNavigate?: () => void;
};

function NavEntryLink({
  item,
  className,
  onNavigate,
}: {
  item: SiteNavEntry;
  className: string;
  onNavigate?: () => void;
}) {
  if (item.kind === "anchor") {
    return (
      <HomeSectionLink
        anchorId={item.anchorId}
        className={className}
        onNavigate={onNavigate}
      >
        {item.label}
      </HomeSectionLink>
    );
  }

  return (
    <Link
      href={item.href}
      className={className}
      onClick={() => onNavigate?.()}
    >
      {item.label}
    </Link>
  );
}

export function SiteNavLinks({ className = "", onNavigate }: SiteNavLinksProps) {
  const { data: session } = useSession();
  const linkClass = `${siteLinkClassName} ${className}`.trim();
  const entries: SiteNavEntry[] = session?.user?.isAdmin
    ? [...MAIN_NAV_ENTRIES, ADMIN_NAV_ENTRY]
    : MAIN_NAV_ENTRIES;

  return (
    <>
      {entries.map((item) => (
        <NavEntryLink
          key={item.label}
          item={item}
          className={linkClass}
          onNavigate={onNavigate}
        />
      ))}
    </>
  );
}

export function SiteNav() {
  const [open, setOpen] = useState(false);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <>
      <nav
        className="hidden items-center gap-8 text-sm text-muted md:flex"
        aria-label="Main"
      >
        <SiteNavLinks />
      </nav>

      <div className="md:hidden">
        <button
          type="button"
          aria-expanded={open}
          aria-controls={menuId}
          aria-label={open ? "Close navigation menu" : "Open navigation menu"}
          onClick={() => setOpen((value) => !value)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-surface-border text-muted transition hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50"
        >
          <MenuIcon open={open} />
        </button>

        {open ? (
          <nav
            id={menuId}
            aria-label="Main"
            className="absolute inset-x-0 top-16 z-40 border-b border-surface-border bg-background/95 px-6 py-4 backdrop-blur-md"
          >
            <div className="flex flex-col gap-4 text-sm text-muted">
              <SiteNavLinks onNavigate={() => setOpen(false)} />
            </div>
          </nav>
        ) : null}
      </div>
    </>
  );
}

function MenuIcon({ open }: { open: boolean }) {
  if (open) {
    return (
      <svg
        aria-hidden
        className="h-5 w-5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M6 6l12 12M18 6 6 18" strokeLinecap="round" />
      </svg>
    );
  }

  return (
    <svg
      aria-hidden
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
    </svg>
  );
}
