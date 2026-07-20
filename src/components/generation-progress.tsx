"use client";

import {
  GENERATION_STEPS,
  type GenerationStepState,
} from "@/lib/generation-progress";

type GenerationProgressProps = {
  steps: GenerationStepState;
  elapsedSec: number;
};

export function GenerationProgress({
  steps,
  elapsedSec,
}: GenerationProgressProps) {
  return (
    <div className="flex min-h-[480px] flex-col justify-center rounded-2xl border border-surface-border bg-surface/50 p-8 sm:p-10">
      <div className="mx-auto w-full max-w-md">
        <p className="text-center text-sm font-medium uppercase tracking-wider text-muted">
          Crestis AI is building your site
        </p>

        <ul className="mt-8 space-y-3.5" aria-live="polite" aria-busy="true">
          {GENERATION_STEPS.map((step) => {
            const status = steps[step.id];
            const mark =
              status === "done"
                ? "✔"
                : status === "active"
                  ? "⏳"
                  : status === "error"
                    ? "✕"
                    : "⬜";
            const tone =
              status === "done"
                ? "text-emerald-300/90"
                : status === "active"
                  ? "text-foreground"
                  : status === "error"
                    ? "text-red-300"
                    : "text-muted/55";

            return (
              <li
                key={step.id}
                className={`flex items-baseline gap-3 text-[15px] leading-snug ${tone} ${
                  status === "active" ? "font-medium" : ""
                }`}
              >
                <span className="w-5 shrink-0 text-center" aria-hidden>
                  {mark}
                </span>
                <span>{step.label}</span>
              </li>
            );
          })}
        </ul>

        <p className="mt-8 text-center text-xs text-muted">
          {elapsedSec < 20
            ? "This usually takes under a minute…"
            : elapsedSec < 60
              ? `Still working… ${elapsedSec}s`
              : `Almost there… ${elapsedSec}s`}
        </p>
      </div>
    </div>
  );
}
