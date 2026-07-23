const steps = [
  {
    title: "Tell us about your business",
    description:
      "Add your name, trade, location, services, and contact details — takes about a minute.",
  },
  {
    title: "AI builds your website",
    description:
      "Crestis generates copy, layout, SEO text, and a mobile-ready preview in under 60 seconds.",
  },
  {
    title: "Preview, edit, and publish",
    description:
      "Review the draft, tweak anything you want, then publish when you are ready to go live.",
  },
] as const;

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="scroll-mt-20 border-t border-surface-border px-6 py-20"
    >
      <div className="mx-auto max-w-4xl">
        <h2 className="text-center text-3xl font-bold md:text-4xl">How it works</h2>
        <p className="mt-3 text-center text-muted">
          Three steps from business details to a live website.
        </p>

        <ol className="mt-12 space-y-6">
          {steps.map((step, index) => (
            <li
              key={step.title}
              className="flex gap-5 rounded-2xl border border-surface-border bg-surface/40 p-6"
            >
              <span
                aria-hidden
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand/15 text-sm font-bold text-brand-light"
              >
                {index + 1}
              </span>
              <div>
                <h3 className="text-lg font-semibold text-foreground">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {step.description}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
