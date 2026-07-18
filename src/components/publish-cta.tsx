"use client";

type PublishCTAProps = {
  businessName?: string;
};

function toSlug(name?: string) {
  if (!name) return "your-business";
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "")
    .slice(0, 24) || "your-business";
}

/** Stage 2 stub — live deploy comes next */
export function PublishCTA({ businessName }: PublishCTAProps) {
  const slug = toSlug(businessName);

  return (
    <div className="mt-8 rounded-2xl border border-brand/30 bg-brand/10 p-8 text-center">
      <p className="text-lg font-semibold">Looks good?</p>
      <p className="mt-2 text-sm text-muted">
        Next: publish to{" "}
        <span className="font-medium text-foreground">
          {slug}.crestis.app
        </span>
      </p>
      <button
        type="button"
        disabled
        className="mt-6 inline-flex h-14 cursor-not-allowed items-center justify-center rounded-full bg-brand/50 px-10 text-lg font-bold text-white"
      >
        Publish
      </button>
      <p className="mt-3 text-xs text-muted">
        Live URL + Lemon Squeezy payment — Stage 2 & 3
      </p>
    </div>
  );
}
