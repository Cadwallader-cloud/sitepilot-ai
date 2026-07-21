import type { DesignAnimation } from "@/lib/design-system";
import type { Animation } from "../types";

/** Animation scale — components use animation.fade, never animation: fade-in 0.9s. */
export type AnimationToken = "none" | "fade" | "slide" | "scale";

export const ANIMATION_TOKENS: readonly AnimationToken[] = [
  "none",
  "fade",
  "slide",
  "scale",
] as const;

export type AnimationTokenStyle = {
  duration: string;
  className: string;
};

export type AnimationScale = Record<AnimationToken, AnimationTokenStyle>;

export type ThemeAnimation = AnimationScale & {
  style: DesignAnimation;
  entrance: AnimationToken;
  duration: string;
};

/** Canonical animation definitions — duration + CSS class */
export const animation: AnimationScale = {
  none: { duration: "0ms", className: "" },
  fade: { duration: "250ms", className: "animate-fade-in" },
  slide: { duration: "400ms", className: "animate-slide-up" },
  scale: { duration: "350ms", className: "animate-scale-in" },
};

const DESIGN_DURATION: Record<DesignAnimation, string> = {
  None: "0ms",
  Soft: "250ms",
  Bold: "400ms",
};

const ENTRANCE_BY_DESIGN: Record<DesignAnimation, AnimationToken> = {
  None: "none",
  Soft: "fade",
  Bold: "slide",
};

const TOKEN_DURATION_BY_DESIGN: Record<
  DesignAnimation,
  Record<Exclude<AnimationToken, "none">, string>
> = {
  None: { fade: "0ms", slide: "0ms", scale: "0ms" },
  Soft: { fade: "250ms", slide: "300ms", scale: "300ms" },
  Bold: { fade: "350ms", slide: "400ms", scale: "400ms" },
};

function motionStyle(
  token: AnimationToken,
  duration: string,
): AnimationTokenStyle {
  if (duration === "0ms" || token === "none") {
    return { duration: "0ms", className: "" };
  }
  return {
    duration,
    className: animation[token].className,
  };
}

export function animationClass(token: AnimationToken): string {
  return animation[token].className;
}

export function animationDuration(token: AnimationToken): string {
  return animation[token].duration;
}

/** @deprecated Use animationsForPreset(design).duration */
export function animationDurationFor(design: DesignAnimation): string {
  return animationsForPreset(design).duration;
}

export function entranceAnimationToken(
  design: DesignAnimation,
): AnimationToken {
  return ENTRANCE_BY_DESIGN[design] ?? "fade";
}

export function animationsForPreset(design: DesignAnimation): ThemeAnimation {
  const durations = TOKEN_DURATION_BY_DESIGN[design] ?? TOKEN_DURATION_BY_DESIGN.Soft;
  const entrance = entranceAnimationToken(design);
  const duration = DESIGN_DURATION[design] ?? DESIGN_DURATION.Soft;

  return {
    style: design,
    entrance,
    duration,
    none: motionStyle("none", "0ms"),
    fade: motionStyle("fade", durations.fade),
    slide: motionStyle("slide", durations.slide),
    scale: motionStyle("scale", durations.scale),
  };
}

export function animationCssVars(
  animationTheme: Animation,
): Record<string, string> {
  const vars: Record<string, string> = {
    "--site-anim": animationTheme.duration,
  };
  for (const key of ANIMATION_TOKENS) {
    vars[`--animation-${key}-duration`] = animationTheme[key].duration;
  }
  return vars;
}
