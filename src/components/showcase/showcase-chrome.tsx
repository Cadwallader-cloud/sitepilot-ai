import Link from "next/link";

export function ShowcaseChrome({
  backHref = "/demos",
  ctaHref = "/create",
}: {
  backHref?: string;
  ctaHref?: string;
}) {
  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between bg-black/50 px-4 py-3 backdrop-blur-md md:px-6">
        <Link
          href={backHref}
          className="text-sm font-medium text-white/90 transition hover:text-white"
        >
          ← All demos
        </Link>
        <Link
          href={ctaHref}
          className="rounded-full bg-white px-4 py-2 text-xs font-bold text-zinc-900 transition hover:bg-zinc-100 md:text-sm"
        >
          Build yours — $199
        </Link>
      </div>
      <div className="h-14" />
    </>
  );
}

export function ShowcaseMobileCTA({ phone, accent }: { phone: string; accent: string }) {
  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 flex gap-2 border-t border-white/10 bg-zinc-950/95 p-3 backdrop-blur-md md:hidden"
    >
      <a
        href={`tel:${phone.replace(/\s/g, "")}`}
        className="flex-1 rounded-xl py-3 text-center text-sm font-bold text-white"
        style={{ backgroundColor: accent }}
      >
        Call now
      </a>
      <Link
        href="/create"
        className="flex-1 rounded-xl border border-white/20 py-3 text-center text-sm font-bold text-white"
      >
        Get a quote
      </Link>
    </div>
  );
}
