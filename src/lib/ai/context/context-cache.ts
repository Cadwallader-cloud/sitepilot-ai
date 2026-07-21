/**
 * Context Cache — shared business/planner/branding built once per pipeline bag.
 *
 *   Business → Cache → Hero → About → Services
 *
 * Section contexts reuse the same object references from `cache.shared`
 * instead of re-reading PipelineContext on every build.
 */

import type { PipelineContext } from "../orchestrator/context";
import { selectShared, type SharedContext } from "./shared";
import { selectAbout, type AboutContext } from "./selectors/about.selector";
import { selectFAQ, type FAQContext } from "./selectors/faq.selector";
import { selectHero, type HeroContext } from "./selectors/hero.selector";
import { selectQA, type QAContext } from "./selectors/qa.selector";
import { selectSEO, type SEOContext } from "./selectors/seo.selector";
import {
  selectServices,
  type ServicesContext,
} from "./selectors/services.selector";

export type ContextCacheKey =
  | "shared"
  | "hero"
  | "about"
  | "services"
  | "faq"
  | "seo"
  | "qa";

export class ContextCache {
  readonly ctx: PipelineContext;
  private readonly memo = new Map<ContextCacheKey, unknown>();

  constructor(ctx: PipelineContext) {
    this.ctx = ctx;
  }

  private memoize<T>(key: ContextCacheKey, build: () => T): T {
    if (!this.memo.has(key)) {
      this.memo.set(key, build());
    }
    return this.memo.get(key) as T;
  }

  /** Core bag: business, planner, branding — built once. */
  get shared(): SharedContext {
    return this.memoize("shared", () => selectShared(this.ctx));
  }

  get hero(): HeroContext {
    return this.memoize("hero", () => selectHero(this.ctx, this.shared));
  }

  get about(): AboutContext {
    return this.memoize("about", () => selectAbout(this.ctx, this.shared));
  }

  get services(): ServicesContext {
    return this.memoize("services", () => selectServices(this.ctx, this.shared));
  }

  get faq(): FAQContext {
    return this.memoize("faq", () => selectFAQ(this.ctx, this.shared));
  }

  get seo(): SEOContext {
    return this.memoize("seo", () => selectSEO(this.ctx, this.shared));
  }

  /** Throws when QA prerequisites are missing — failures are not cached. */
  get qa(): QAContext {
    if (!this.memo.has("qa")) {
      this.memo.set("qa", selectQA(this.ctx, this.shared));
    }
    return this.memo.get("qa") as QAContext;
  }

  /** Drop memoized slices (e.g. after in-place ctx mutation). Prefer fork() for new bags. */
  clear(): void {
    this.memo.clear();
  }

  /** New pipeline bag — fresh cache. */
  fork(ctx: PipelineContext): ContextCache {
    return new ContextCache(ctx);
  }
}

export function createContextCache(ctx: PipelineContext): ContextCache {
  return new ContextCache(ctx);
}
