"use client";

import type {
  AnalyticsClickEventType,
  AnalyticsEventType,
} from "@/lib/site-analytics";
import {
  useEffect,
  useEffectEvent,
  useState,
  type CSSProperties,
  type FormEvent,
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
  eventType: AnalyticsClickEventType;
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

type SiteContactFormProps = {
  projectId: string;
  slug: string;
  className?: string;
};

/** Minimal contact form — tracks form_submission + lead on submit. */
export function SiteContactForm({
  projectId,
  slug,
  className = "",
}: SiteContactFormProps) {
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy || sent) return;
    setBusy(true);
    trackSiteEvent(projectId, "form_submission", { slug });
    trackSiteEvent(projectId, "lead", { slug });
    setSent(true);
    setBusy(false);
  }

  if (sent) {
    return (
      <p className={`text-sm font-medium text-white/95 ${className}`}>
        Thanks — we received your message and will be in touch soon.
      </p>
    );
  }

  return (
    <form
      onSubmit={(e) => void handleSubmit(e)}
      className={`mx-auto mt-8 max-w-md space-y-3 text-left ${className}`}
    >
      <input
        type="text"
        name="name"
        required
        placeholder="Your name"
        className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-white/60 outline-none focus:ring-2 focus:ring-white/30"
      />
      <input
        type="email"
        name="email"
        required
        placeholder="Email"
        className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-white/60 outline-none focus:ring-2 focus:ring-white/30"
      />
      <textarea
        name="message"
        required
        rows={3}
        placeholder="How can we help?"
        className="w-full resize-none rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-white/60 outline-none focus:ring-2 focus:ring-white/30"
      />
      <button
        type="submit"
        disabled={busy}
        className="w-full rounded-full bg-white px-6 py-3 text-sm font-semibold text-zinc-900 transition hover:bg-white/90 disabled:opacity-60"
      >
        {busy ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}
