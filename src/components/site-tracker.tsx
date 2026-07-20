"use client";

import type { AnalyticsEventType } from "@/lib/site-analytics";
import {
  useEffect,
  useEffectEvent,
  type CSSProperties,
  type MouseEvent,
  type ReactNode,
} from "react";

const VISITOR_KEY = "crestis_vid";

function getVisitorId(): string {
  try {
    const existing = localStorage.getItem(VISITOR_KEY);
    if (existing) return existing;
    const id =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `v_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
    localStorage.setItem(VISITOR_KEY, id);
    return id;
  } catch {
    return "anonymous";
  }
}

export function trackSiteEvent(
  projectId: string,
  eventType: AnalyticsEventType,
  extras?: { path?: string; slug?: string },
) {
  if (!projectId || typeof window === "undefined") return;

  const payload = JSON.stringify({
    projectId,
    slug: extras?.slug,
    eventType,
    path: extras?.path ?? window.location.pathname,
    visitorId: getVisitorId(),
    referrer: document.referrer || undefined,
  });

  const url = "/api/analytics/track";
  try {
    if (navigator.sendBeacon) {
      navigator.sendBeacon(
        url,
        new Blob([payload], { type: "application/json" }),
      );
      return;
    }
  } catch {
    // fall through to fetch
  }

  void fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: payload,
    keepalive: true,
  }).catch(() => {});
}

type SitePageViewProps = {
  projectId: string;
  slug: string;
};

/** Fires one page_view when the published site mounts. */
export function SitePageView({ projectId, slug }: SitePageViewProps) {
  const onMount = useEffectEvent(() => {
    trackSiteEvent(projectId, "page_view", { slug });
  });

  useEffect(() => {
    onMount();
  }, [onMount]);

  return null;
}

type TrackedLinkProps = {
  projectId: string;
  eventType: Exclude<AnalyticsEventType, "page_view">;
  href: string;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
};

export function TrackedLink({
  projectId,
  eventType,
  href,
  className,
  style,
  children,
}: TrackedLinkProps) {
  function handleClick(_event: MouseEvent<HTMLAnchorElement>) {
    trackSiteEvent(projectId, eventType);
  }

  return (
    <a
      href={href}
      className={className}
      style={style}
      onClick={handleClick}
      target={href.startsWith("http") ? "_blank" : undefined}
      rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
    >
      {children}
    </a>
  );
}

export function mapsSearchUrl(address: string): string {
  const q = address.trim();
  if (!q) return "https://www.google.com/maps";
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
}
