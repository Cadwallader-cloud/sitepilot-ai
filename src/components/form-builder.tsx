"use client";

import { BusinessForm } from "@/components/business-form";
import { PublishCTA } from "@/components/publish-cta";
import { SitePreview } from "@/components/site-preview";
import { exampleFormInput, type BusinessFormInput } from "@/lib/business-form";
import { formInputToJson, generateFromForm } from "@/lib/generate-from-form";
import type { GeneratedSite } from "@/lib/site-types";
import { useEffect, useState } from "react";

const funnelSteps = ["Fill form", "Preview", "Looks good?", "Publish $199"];

type FormBuilderProps = {
  loadExample?: boolean;
};

export function FormBuilder({ loadExample = false }: FormBuilderProps) {
  const [site, setSite] = useState<GeneratedSite | null>(null);
  const [jsonOutput, setJsonOutput] = useState<object | null>(null);
  const [activeStep, setActiveStep] = useState(1);

  function handleSubmit(input: BusinessFormInput) {
    const generated = generateFromForm(input);
    setSite(generated);
    setJsonOutput(formInputToJson(input));
    setActiveStep(2);
  }

  useEffect(() => {
    if (loadExample) {
      const generated = generateFromForm(exampleFormInput);
      setSite(generated);
      setJsonOutput(formInputToJson(exampleFormInput));
      setActiveStep(2);
    }
  }, [loadExample]);

  return (
    <div>
      <div className="mb-10 flex flex-wrap items-center justify-center gap-2 text-sm">
        {funnelSteps.map((step, index) => (
          <div key={step} className="flex items-center gap-2">
            <span
              className={`rounded-full px-4 py-1.5 font-medium ${
                index + 1 <= activeStep
                  ? "bg-brand/20 text-brand-light"
                  : "bg-surface text-muted"
              }`}
            >
              {step}
            </span>
            {index < funnelSteps.length - 1 && (
              <span className="text-muted">→</span>
            )}
          </div>
        ))}
      </div>

      <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
        <div>
          <h2 className="mb-4 text-sm font-medium uppercase tracking-wider text-muted">
            Step 1 — Your business details
          </h2>
          <BusinessForm
            onSubmit={handleSubmit}
            initial={loadExample ? exampleFormInput : undefined}
          />
        </div>

        <div>
          <h2 className="mb-4 text-sm font-medium uppercase tracking-wider text-muted">
            Step 2 — Website preview
          </h2>

          {site ? (
            <>
              <SitePreview site={site} />
              <PublishCTA businessName={site.title} />

              {jsonOutput && (
                <details className="mt-6 rounded-xl border border-surface-border bg-surface">
                  <summary className="cursor-pointer px-4 py-3 text-sm font-medium text-muted">
                    View site structure (JSON)
                  </summary>
                  <pre className="overflow-x-auto border-t border-surface-border p-4 text-xs text-muted">
                    {JSON.stringify(jsonOutput, null, 2)}
                  </pre>
                </details>
              )}
            </>
          ) : (
            <div className="flex min-h-[480px] items-center justify-center rounded-2xl border border-dashed border-surface-border bg-surface/50 p-8 text-center text-muted">
              <div>
                <p className="text-4xl">📋</p>
                <p className="mt-4 font-medium text-foreground">
                  Fill the form to see your website
                </p>
                <p className="mt-2 text-sm">
                  Or click &quot;Try example&quot; for ABC Roofing
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
