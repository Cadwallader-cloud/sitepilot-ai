/**
 * Crestis AI → Website field ownership.
 *
 * Each agent may ONLY write its allowed paths.
 * Everything else is Crestis-owned (metadata, navigation, settings, crestis, …).
 *
 * | AI                 | Allowed to change   |
 * | ------------------ | ------------------- |
 * | Business Analyzer  | business            |
 * | Brand Personality  | branding            |
 * | Website Planner    | pages               |
 * | Hero Generator     | hero.data           |
 * | About Generator    | about.data          |
 * | Services Generator | services.data       |
 * | FAQ Generator      | faq.data            |
 * | SEO Generator      | seo                 |
 * | Theme Engine       | theme               |
 */

import type {
  About,
  Branding,
  Business,
  FAQ,
  Hero,
  Page,
  Section,
  SEO,
  Service,
  WebsiteTheme,
  Website,
} from "./website";

export type AiWebsiteAgent =
  | "business_analyzer"
  | "brand_personality"
  | "website_planner"
  | "hero_generator"
  | "about_generator"
  | "services_generator"
  | "faq_generator"
  | "seo_generator"
  | "theme_engine";

/** Human labels matching Crestis pipeline stages */
export const AI_WEBSITE_AGENT_LABELS: Record<AiWebsiteAgent, string> = {
  business_analyzer: "Business Analyzer",
  brand_personality: "Brand Personality",
  website_planner: "Website Planner",
  hero_generator: "Hero Generator",
  about_generator: "About Generator",
  services_generator: "Services Generator",
  faq_generator: "FAQ Generator",
  seo_generator: "SEO Generator",
  theme_engine: "Theme Engine",
};

/**
 * Allowed write targets per agent.
 * Section agents own `pages[*].sections[type].data` only (not id/type/enabled).
 */
export const AI_WEBSITE_OWNERSHIP: Record<
  AiWebsiteAgent,
  readonly string[]
> = {
  business_analyzer: ["business"],
  brand_personality: ["branding"],
  website_planner: ["pages"],
  hero_generator: ["pages.sections[type=hero].data"],
  about_generator: ["pages.sections[type=about].data"],
  services_generator: ["pages.sections[type=services].data"],
  faq_generator: ["pages.sections[type=faq].data"],
  seo_generator: ["seo"],
  theme_engine: ["theme"],
} as const;

/** Paths no AI agent may mutate */
export const CRESTIS_OWNED_PATHS = [
  "metadata",
  "navigation",
  "settings",
  "crestis",
] as const;

export type SectionAgent =
  | "hero_generator"
  | "about_generator"
  | "services_generator"
  | "faq_generator";

export const SECTION_AGENT_TYPE: Record<
  SectionAgent,
  "hero" | "about" | "services" | "faq"
> = {
  hero_generator: "hero",
  about_generator: "about",
  services_generator: "services",
  faq_generator: "faq",
};

export function agentOwns(agent: AiWebsiteAgent, path: string): boolean {
  const allowed = AI_WEBSITE_OWNERSHIP[agent];
  return allowed.some(
    (p) => path === p || path.startsWith(`${p}.`) || p.startsWith(`${path}.`),
  );
}

/** Prompt brief — inject into agent system/user prompts */
export function agentOwnershipBrief(agent: AiWebsiteAgent): string {
  const paths = AI_WEBSITE_OWNERSHIP[agent].join(", ");
  return [
    `OWNERSHIP (${AI_WEBSITE_AGENT_LABELS[agent]}):`,
    `You may ONLY write: ${paths}`,
    `Do not invent or overwrite: ${CRESTIS_OWNED_PATHS.join(", ")}, or other agents' fields.`,
    "Return JSON for your owned fields only.",
  ].join("\n");
}

export class AgentOwnershipError extends Error {
  constructor(
    public readonly agent: AiWebsiteAgent,
    public readonly path: string,
  ) {
    super(
      `${AI_WEBSITE_AGENT_LABELS[agent]} is not allowed to write "${path}". Allowed: ${AI_WEBSITE_OWNERSHIP[agent].join(", ")}`,
    );
    this.name = "AgentOwnershipError";
  }
}

export function assertAgentMayWrite(
  agent: AiWebsiteAgent,
  path: string,
): void {
  if (!agentOwns(agent, path)) {
    throw new AgentOwnershipError(agent, path);
  }
}

function homePage(site: Website): Page {
  return (
    site.pages.find((p) => p.id === "home" || p.slug === "/" || !p.slug) ??
    site.pages[0]
  );
}

function withSectionData(
  site: Website,
  type: string,
  data: unknown,
): Website {
  const pages = site.pages.map((page) => {
    const isHome =
      page.id === "home" || page.slug === "/" || page === homePage(site);
    if (!isHome && site.pages.length > 1) return page;
    const sections = page.sections.map((section) =>
      section.type === type
        ? ({ ...section, data } as Section)
        : section,
    );
    // If section missing, append enabled section
    if (!sections.some((s) => s.type === type)) {
      sections.push({
        id: type,
        type,
        enabled: true,
        data,
      });
    }
    return { ...page, sections };
  });
  return { ...site, pages };
}

/** Business Analyzer → business */
export function applyBusinessPatch(
  site: Website,
  business: Business,
): Website {
  assertAgentMayWrite("business_analyzer", "business");
  return { ...site, business };
}

/** Brand Personality → branding */
export function applyBrandingPatch(
  site: Website,
  branding: Branding,
): Website {
  assertAgentMayWrite("brand_personality", "branding");
  return { ...site, branding };
}

/** Website Planner → pages (structure / section list) */
export function applyPagesPatch(site: Website, pages: Page[]): Website {
  assertAgentMayWrite("website_planner", "pages");
  return { ...site, pages };
}

/** Hero Generator → hero.data */
export function applyHeroDataPatch(site: Website, data: Hero): Website {
  assertAgentMayWrite("hero_generator", "pages.sections[type=hero].data");
  return withSectionData(site, "hero", data);
}

/** About Generator → about.data */
export function applyAboutDataPatch(site: Website, data: About): Website {
  assertAgentMayWrite("about_generator", "pages.sections[type=about].data");
  return withSectionData(site, "about", data);
}

/** Services Generator → services.data */
export function applyServicesDataPatch(
  site: Website,
  data: { items: Service[] },
): Website {
  assertAgentMayWrite(
    "services_generator",
    "pages.sections[type=services].data",
  );
  return withSectionData(site, "services", data);
}

/** FAQ Generator → faq.data */
export function applyFaqDataPatch(
  site: Website,
  data: { items: FAQ[] },
): Website {
  assertAgentMayWrite("faq_generator", "pages.sections[type=faq].data");
  return withSectionData(site, "faq", data);
}

/** SEO Generator → seo */
export function applySeoPatch(site: Website, seo: SEO): Website {
  assertAgentMayWrite("seo_generator", "seo");
  return { ...site, seo };
}

/** Theme Engine → theme */
export function applyThemePatch(site: Website, theme: WebsiteTheme): Website {
  assertAgentMayWrite("theme_engine", "theme");
  return { ...site, theme };
}

/** Ownership table as markdown (docs / admin / prompts) */
export function ownershipTableMarkdown(): string {
  const rows = (
    Object.keys(AI_WEBSITE_OWNERSHIP) as AiWebsiteAgent[]
  ).map(
    (agent) =>
      `| ${AI_WEBSITE_AGENT_LABELS[agent]} | ${AI_WEBSITE_OWNERSHIP[agent].join(", ")} |`,
  );
  return [
    "| AI | Allowed to change |",
    "| --- | --- |",
    ...rows,
  ].join("\n");
}
