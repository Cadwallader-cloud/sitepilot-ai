"use client";

type PublishCTAProps = {
  businessName?: string;
};

/** Stage 1: preview first. Stage 2 will wire real Publish → live URL. */
export function PublishCTA({ businessName }: PublishCTAProps) {
  return (
    <div className="mt-8 rounded-2xl border border-brand/30 bg-brand/10 p-8 text-center">
      <p className="text-lg font-semibold">Looks good?</p>
      <p className="mt-2 text-muted">
        {businessName
          ? `${businessName} is ready for the next step.`
          : "Your website is ready for the next step."}{" "}
        Publishing a live URL is coming next — free generate & preview for now.
      </p>
      <button
        type="button"
        disabled
        className="mt-6 inline-flex h-14 cursor-not-allowed items-center justify-center rounded-full bg-brand/50 px-10 text-lg font-bold text-white"
      >
        Publish Website
      </button>
      <p className="mt-3 text-xs text-muted">
        Stage 2: live address on crestis.app · Stage 3: pay to publish
      </p>
    </div>
  );
}
