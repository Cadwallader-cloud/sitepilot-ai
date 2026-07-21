import type { Hero } from "@/lib/website";

export function heroImageSrc(hero: Pick<Hero, "backgroundImage">): string | undefined {
  return hero.backgroundImage?.trim() || undefined;
}
