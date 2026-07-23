import { brand } from "@/lib/brand";

export type SiteRouteLink = {
  kind: "route";
  href: string;
  label: string;
};

export type SiteAnchorLink = {
  kind: "anchor";
  anchorId: string;
  label: string;
};

export type SiteExternalLink = {
  kind: "external";
  href: string;
  label: string;
};

export type SiteNavEntry = SiteRouteLink | SiteAnchorLink;

export type SiteFooterEntry = SiteRouteLink | SiteAnchorLink | SiteExternalLink;

/** Primary header navigation (Admin is injected when the user is an admin). */
export const MAIN_NAV_ENTRIES: SiteNavEntry[] = [
  { kind: "route", href: "/demos", label: "Demos" },
  { kind: "route", href: "/dashboard", label: "My Websites" },
  { kind: "anchor", anchorId: "how-it-works", label: "How it works" },
];

export const ADMIN_NAV_ENTRY: SiteRouteLink = {
  kind: "route",
  href: "/admin",
  label: "Admin",
};

export const FOOTER_ENTRIES: SiteFooterEntry[] = [
  { kind: "route", href: "/privacy", label: "Privacy Policy" },
  { kind: "route", href: "/terms", label: "Terms of Service" },
  { kind: "route", href: "/refund", label: "Refund Policy" },
  { kind: "anchor", anchorId: "pricing", label: "Pricing" },
  {
    kind: "external",
    href: `mailto:${brand.supportEmail}`,
    label: "Contact",
  },
];

export const CREATE_CTA = {
  href: "/create",
  label: brand.cta,
} as const;
