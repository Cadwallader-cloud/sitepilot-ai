"use client";

import Link from "next/link";

type PublishSuccessBannerProps = {
  url: string;
  slug: string;
};

export function PublishSuccessBanner({ url, slug }: PublishSuccessBannerProps) {
  return (
    <div className="mb-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5 sm:p-6">
      <p className="text-sm font-semibold uppercase tracking-wider text-emerald-300">
        Your site is live
      </p>
      <p className="mt-2 text-sm text-muted">
        Anyone can visit your published website at:
      </p>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 block break-all text-lg font-semibold text-emerald-200 underline-offset-2 hover:underline"
      >
        {url}
      </a>
      <div className="mt-4 flex flex-wrap gap-3">
        <Link
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-400"
        >
          Open live site
        </Link>
        <span className="self-center text-xs text-muted">slug: {slug}</span>
      </div>
    </div>
  );
}
