import type { ComponentType } from "react";
import type { HeroTemplateId } from "@/lib/template-engine";
import type { HeroProps } from "./types";
import { Hero01 } from "./Hero01/Hero01";
import { Hero02 } from "./Hero02/Hero02";
import { Hero03 } from "./Hero03/Hero03";
import { Hero04 } from "./Hero04/Hero04";
import { Hero05 } from "./Hero05/Hero05";

export type { HeroProps } from "./types";

export const HeroRegistry: Record<HeroTemplateId, ComponentType<HeroProps>> = {
  "hero-01": Hero01,
  "hero-02": Hero02,
  "hero-03": Hero03,
  "hero-04": Hero04,
  "hero-05": Hero05,
};
