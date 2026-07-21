"use client";

import { colorsForPalette } from "@/lib/design-system";
import {
  currentTemplateId,
  currentVariant,
  patchAbout,
  patchCta,
  patchHero,
  patchPalette,
  patchTemplate,
  PREVIEW_PALETTES,
  PREVIEW_TEMPLATES,
  templateLabel,
} from "@/lib/preview-editor/patches";
import type { GeneratedSite } from "@/lib/site-types";
import { getHero } from "@/lib/site-types";
import type { TemplateVariant } from "@/lib/template-library";
import { TEMPLATE_VARIANTS } from "@/lib/template-library";

type EditorSection = "hero" | "about" | "cta" | "colors" | "template";

type PreviewEditorPanelProps = {
  site: GeneratedSite;
  onChange: (site: GeneratedSite) => void;
  activeSection?: EditorSection;
  onSectionChange?: (section: EditorSection) => void;
};

const SECTIONS: { id: EditorSection; label: string }[] = [
  { id: "hero", label: "Hero" },
  { id: "about", label: "About" },
  { id: "cta", label: "CTA" },
  { id: "colors", label: "Colors" },
  { id: "template", label: "Template" },
];

export function PreviewEditorPanel({
  site,
  onChange,
  activeSection = "hero",
  onSectionChange,
}: PreviewEditorPanelProps) {
  const hero = getHero(site);
  const cta = site.cta ?? {
    headline: hero.headline,
    primaryCTA: hero.primaryCTA,
    secondaryCTA: hero.secondaryCTA,
  };
  const templateId = currentTemplateId(site);
  const variant = currentVariant(site);
  const palette = site.design?.palette ?? "Dark Blue";

  return (
    <div className="rounded-2xl border border-surface-border bg-surface/50 p-4 sm:p-5">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted">
        Edit without regenerating
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        {SECTIONS.map((section) => (
          <button
            key={section.id}
            type="button"
            onClick={() => onSectionChange?.(section.id)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
              activeSection === section.id
                ? "bg-brand/20 text-brand-light"
                : "border border-surface-border text-muted hover:text-foreground"
            }`}
          >
            {section.label}
          </button>
        ))}
      </div>

      <div className="mt-5 space-y-4">
        {activeSection === "hero" && (
          <>
            <Field
              label="Headline"
              value={hero.headline}
              onChange={(v) => onChange(patchHero(site, { headline: v }))}
            />
            <Field
              label="Subheadline"
              value={hero.subheadline}
              onChange={(v) => onChange(patchHero(site, { subheadline: v }))}
            />
            <Field
              label="Primary CTA"
              value={hero.primaryCTA}
              onChange={(v) => onChange(patchHero(site, { primaryCTA: v }))}
            />
            <Field
              label="Secondary CTA"
              value={hero.secondaryCTA}
              onChange={(v) => onChange(patchHero(site, { secondaryCTA: v }))}
            />
          </>
        )}

        {activeSection === "about" && (
          <>
            <Field
              label="Title"
              value={site.about.title}
              onChange={(v) => onChange(patchAbout(site, { title: v }))}
            />
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted">
                Body
              </label>
              <textarea
                value={site.about.text}
                onChange={(e) =>
                  onChange(patchAbout(site, { text: e.target.value }))
                }
                rows={6}
                className="w-full rounded-xl border border-surface-border bg-background px-3 py-2.5 text-sm"
              />
            </div>
          </>
        )}

        {activeSection === "cta" && (
          <>
            <Field
              label="CTA headline"
              value={cta.headline}
              onChange={(v) => onChange(patchCta(site, { headline: v }))}
            />
            <Field
              label="Primary button"
              value={cta.primaryCTA}
              onChange={(v) => onChange(patchCta(site, { primaryCTA: v }))}
            />
            <Field
              label="Secondary line"
              value={cta.secondaryCTA}
              onChange={(v) => onChange(patchCta(site, { secondaryCTA: v }))}
            />
          </>
        )}

        {activeSection === "colors" && (
          <div className="grid grid-cols-2 gap-2">
            {PREVIEW_PALETTES.map((name) => {
              const active = palette === name;
              const colors = colorsForPalette(name);
              return (
                <button
                  key={name}
                  type="button"
                  onClick={() => onChange(patchPalette(site, name))}
                  className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-left text-xs transition ${
                    active
                      ? "border-brand/50 bg-brand/10"
                      : "border-surface-border hover:border-brand/30"
                  }`}
                >
                  <span
                    className="h-6 w-6 shrink-0 rounded-full border border-white/20"
                    style={{
                      background: `linear-gradient(135deg, ${colors.primary}, ${colors.accent})`,
                    }}
                  />
                  <span className="font-medium text-foreground">{name}</span>
                </button>
              );
            })}
          </div>
        )}

        {activeSection === "template" && (
          <>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted">
                Template
              </label>
              <select
                value={templateId}
                onChange={(e) =>
                  onChange(
                    patchTemplate(
                      site,
                      e.target.value as (typeof PREVIEW_TEMPLATES)[number],
                    ),
                  )
                }
                className="w-full rounded-xl border border-surface-border bg-background px-3 py-2.5 text-sm"
              >
                {PREVIEW_TEMPLATES.map((id) => (
                  <option key={id} value={id}>
                    {templateLabel(id)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted">
                Hero layout
              </label>
              <div className="flex gap-2">
                {TEMPLATE_VARIANTS.map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() =>
                      onChange(patchTemplate(site, templateId, v as TemplateVariant))
                    }
                    className={`flex-1 rounded-xl border py-2 text-sm font-medium transition ${
                      variant === v
                        ? "border-brand/50 bg-brand/10 text-brand-light"
                        : "border-surface-border text-muted hover:text-foreground"
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>
              <p className="mt-2 text-[11px] text-muted">
                A full bleed · B split · C dark band
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-muted">
        {label}
      </label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-surface-border bg-background px-3 py-2.5 text-sm"
      />
    </div>
  );
}
