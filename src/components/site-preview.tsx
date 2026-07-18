import type { GeneratedSite } from "@/lib/site-types";

const defaultThemes = [
  { primary: "#ea580c", accent: "#f59e0b", style: "bold" as const },
  { primary: "#2563eb", accent: "#3b82f6", style: "professional" as const },
  { primary: "#059669", accent: "#10b981", style: "clean" as const },
  { primary: "#7c3aed", accent: "#8b5cf6", style: "bold" as const },
];

function pickTheme(title: string) {
  const index = title.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return defaultThemes[index % defaultThemes.length];
}

export function SitePreview({ site }: { site: GeneratedSite }) {
  const theme = site.theme ?? pickTheme(site.title);
  const slug = site.title.toLowerCase().replace(/[^a-z0-9]+/g, "-");

  return (
    <div className="overflow-hidden rounded-2xl border border-surface-border bg-white text-zinc-900 shadow-2xl">
      <div className="flex items-center gap-2 border-b border-zinc-200 bg-zinc-100 px-4 py-3">
        <span className="h-3 w-3 rounded-full bg-red-400" />
        <span className="h-3 w-3 rounded-full bg-yellow-400" />
        <span className="h-3 w-3 rounded-full bg-green-400" />
        <span className="ml-3 truncate text-xs text-zinc-500">{slug}.sitepilot.app</span>
      </div>

      {(site.trade || site.location) && (
        <div
          className="flex flex-wrap gap-2 px-6 py-3 text-xs font-medium text-white"
          style={{ backgroundColor: theme.primary }}
        >
          {site.trade && <span className="rounded-full bg-white/20 px-3 py-1">{site.trade}</span>}
          {site.location && (
            <span className="rounded-full bg-white/20 px-3 py-1">📍 {site.location}</span>
          )}
        </div>
      )}

      <div
        className="px-8 py-14 text-center text-white"
        style={{
          background: `linear-gradient(135deg, ${theme.primary}, ${theme.accent})`,
        }}
      >
        <h2 className="text-3xl font-bold">{site.title}</h2>
        <p className="mx-auto mt-3 max-w-md text-sm opacity-90">{site.tagline}</p>
        <button
          type="button"
          className="mt-6 rounded-full bg-white px-6 py-2 text-sm font-semibold"
          style={{ color: theme.primary }}
        >
          {site.cta}
        </button>
        {site.phone && (
          <p className="mt-4 text-sm font-medium opacity-90">📞 {site.phone}</p>
        )}
      </div>

      <div className="grid gap-px bg-zinc-200 sm:grid-cols-3">
        {site.sections.map((section, index) => (
          <section
            key={section.id}
            className="bg-white p-6"
            style={
              index === 0
                ? { borderTop: `3px solid ${theme.primary}` }
                : undefined
            }
          >
            <h3 className="font-semibold text-zinc-900">{section.title}</h3>
            {section.items && section.items.length > 0 ? (
              <ul className="mt-3 space-y-2">
                {section.items.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2 text-sm text-zinc-600"
                  >
                    <span style={{ color: theme.primary }}>•</span>
                    {item}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm leading-relaxed text-zinc-600">{section.body}</p>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}
