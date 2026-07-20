import type { ServiceItem } from "@/lib/site-types";

/** Split services for agency-style hierarchy rendering */
export function partitionServices(services: ServiceItem[]) {
  if (!services.length) {
    return { featured: undefined, secondary: [], optional: [] };
  }

  const hasPriority = services.some((s) => s.priority);

  if (!hasPriority) {
    return {
      featured: services[0],
      secondary: services.slice(1, 4),
      optional: services.slice(4),
    };
  }

  const featured =
    services.find((s) => s.priority === "featured") ||
    services.find((s) => s.featured) ||
    services[0];

  return {
    featured,
    secondary: services.filter((s) => s.priority === "secondary"),
    optional: services.filter((s) => s.priority === "optional"),
  };
}
