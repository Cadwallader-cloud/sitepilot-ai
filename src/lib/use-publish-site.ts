"use client";

import { canPublish } from "@/lib/billing/permissions";
import type { BusinessFormInput } from "@/lib/business-form";
import type { GeneratedSite } from "@/lib/site-types";
import { useSession } from "next-auth/react";
import { useCallback, useState } from "react";

type UsePublishSiteOptions = {
  site: GeneratedSite | null;
  projectId: string | null;
  input?: BusinessFormInput | null;
  onPublished?: (info: {
    projectId: string;
    slug: string;
    url: string;
  }) => void;
  onUpgradeRequired?: () => void;
};

export function usePublishSite({
  site,
  projectId,
  input,
  onPublished,
  onUpgradeRequired,
}: UsePublishSiteOptions) {
  const { data: session } = useSession();
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [liveUrl, setLiveUrl] = useState<string | null>(null);

  const allowedToPublish =
    Boolean(session?.user?.isAdmin) ||
    canPublish(session?.user?.entitlements);

  const publish = useCallback(async () => {
    if (!site) return;
    if (!allowedToPublish) {
      onUpgradeRequired?.();
      return;
    }
    if (publishing) return;

    setPublishing(true);
    setError(null);

    try {
      const res = await fetch("/api/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          site,
          projectId,
          input: input ?? undefined,
        }),
      });

      const data = (await res.json()) as {
        ok?: boolean;
        url?: string;
        slug?: string;
        projectId?: string;
        error?: string;
        upgradeRequired?: boolean;
      };

      if (res.status === 402 || data.upgradeRequired) {
        onUpgradeRequired?.();
        return;
      }

      if (!res.ok || !data.url || !data.slug || !data.projectId) {
        throw new Error(data.error ?? "Publish failed");
      }

      setLiveUrl(data.url);
      onPublished?.({
        projectId: data.projectId,
        slug: data.slug,
        url: data.url,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Publish failed");
    } finally {
      setPublishing(false);
    }
  }, [
    allowedToPublish,
    input,
    onPublished,
    onUpgradeRequired,
    projectId,
    publishing,
    site,
  ]);

  return {
    publish,
    publishing,
    error,
    liveUrl,
    allowedToPublish,
  };
}
