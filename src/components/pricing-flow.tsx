import Link from "next/link";
import { brand } from "@/lib/brand";

const steps = [
  {
    label: "Generate",
    description: "Describe your business — free",
  },
  {
    label: "Preview",
    description: "See your full website — free",
  },
  {
    label: "Publish",
    description: "Get a live URL — next",
    highlight: true,
  },
];

export function PricingFlow() {
  return (
    <section id="how-it-works" className="border-t border-surface-border px-6 py-20">
      <div className="mx-auto max-w-4xl">
        <h2 className="text-center text-3xl font-bold md:text-4xl">
          See the result before you pay
        </h2>
        <p className="mt-3 text-center text-muted">
          Generate and preview free. Publish when you&apos;re ready.
        </p>

        <div className="mt-12 flex flex-col items-center gap-4 md:flex-row md:justify-center md:gap-0">
          {steps.map((step, index) => (
            <div key={step.label} className="flex items-center">
              <div
                className={`rounded-2xl border px-6 py-5 text-center ${
                  step.highlight
                    ? "border-brand bg-brand/10 shadow-lg shadow-brand/20"
                    : "border-surface-border bg-surface"
                }`}
              >
                <p
                  className={`text-lg font-bold ${
                    step.highlight ? "text-brand-light" : "text-foreground"
                  }`}
                >
                  {step.label}
                </p>
                <p className="mt-1 max-w-[140px] text-xs text-muted">
                  {step.description}
                </p>
              </div>
              {index < steps.length - 1 && (
                <span className="mx-2 hidden text-2xl text-muted md:block">↓</span>
              )}
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link
            href="/create"
            className="inline-flex h-12 items-center justify-center rounded-full bg-brand px-8 font-semibold text-white transition hover:bg-brand-light"
          >
            {brand.cta}
          </Link>
        </div>
      </div>
    </section>
  );
}
