"use client";

import Link from "next/link";
import { HomeSectionLink, siteLinkClassName } from "@/components/home-section-link";
import { FOOTER_ENTRIES, type SiteFooterEntry } from "@/lib/site-navigation";

function FooterLink({ item }: { item: SiteFooterEntry }) {
  const className = siteLinkClassName;

  if (item.kind === "anchor") {
    return (
      <HomeSectionLink anchorId={item.anchorId} className={className}>
        {item.label}
      </HomeSectionLink>
    );
  }

  if (item.kind === "external") {
    return (
      <a href={item.href} className={className}>
        {item.label}
      </a>
    );
  }

  return (
    <Link href={item.href} className={className}>
      {item.label}
    </Link>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-surface-border px-6 py-8">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 text-sm text-muted sm:flex-row">
        <p>© 2026 Crestis · AI Website Builder</p>
        <nav
          aria-label="Footer"
          className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2"
        >
          {FOOTER_ENTRIES.map((item, index) => (
            <span key={item.label} className="inline-flex items-center gap-4">
              {index > 0 ? (
                <span aria-hidden="true" className="text-muted/50">
                  ·
                </span>
              ) : null}
              <FooterLink item={item} />
            </span>
          ))}
        </nav>
      </div>
    </footer>
  );
}
