/**
 * Step — Services Generator (+ prioritizer + Zod retry)
 *
 *   Services → Retry → PASS → Continue
 *   Services → Retry → FAIL → PipelineError
 */

import { applyServicesDataPatch } from "../../../website-ownership";
import { retryServices } from "../../retry/retryServices";
import type { PipelineContext, PipelineStep } from "../context";

export class ServicesStep implements PipelineStep<PipelineContext> {
  id = "services";

  async run(ctx: PipelineContext): Promise<PipelineContext> {
    const result = await retryServices(ctx);

    let website = applyServicesDataPatch(ctx.website, {
      items: result.services,
    });

    website = {
      ...website,
      pages: website.pages.map((page) => {
        if (page.id !== "home" && page.slug !== "/") return page;
        return {
          ...page,
          sections: page.sections.map((section) => {
            if (section.type === "testimonials") {
              return {
                ...section,
                data: { items: result.content.testimonials },
              };
            }
            if (section.type === "cta") {
              return { ...section, data: result.content.cta };
            }
            if (section.type === "contact") {
              return {
                ...section,
                data: {
                  phone: result.content.contact.phone,
                  email: result.content.contact.email,
                  address: result.content.contact.address,
                  form: true,
                },
              };
            }
            return section;
          }),
        };
      }),
    };

    const business = {
      ...ctx.business,
      services: result.services.map((s) => s.title).filter(Boolean),
    };

    return {
      ...ctx,
      business,
      website: { ...website, business },
      meta: {
        ...ctx.meta,
        brief: result.brief,
        engineCtx: result.engineCtx,
        agentCtx: result.agentCtx,
        content: result.content,
      },
    };
  }
}

export const servicesStep = new ServicesStep();
