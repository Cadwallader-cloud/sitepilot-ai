import type { ReactNode } from "react";
import { spacing } from "./tokens";
import { responsiveVisibility } from "./responsive";

export type NavbarProps = {
  brand: ReactNode;
  navigation?: ReactNode;
  actions?: ReactNode;
  className?: string;
  template?: string;
  /** When navigation links appear — tablet (md) or desktop (lg). */
  navBreakpoint?: "tablet" | "desktop";
};

export function Navbar({
  brand,
  navigation,
  actions,
  className = "",
  template,
  navBreakpoint = "tablet",
}: NavbarProps) {
  const navVisibility =
    navBreakpoint === "desktop"
      ? responsiveVisibility.navDesktopLg
      : responsiveVisibility.navDesktop;

  return (
    <header
      className={`flex flex-wrap items-center justify-between ${spacing.md} ${className}`.trim()}
      data-component="Navbar"
      data-template={template}
    >
      <div>{brand}</div>
      {navigation ? (
        <nav className={`${navVisibility} flex-wrap items-center ${spacing.lg}`}>
          {navigation}
        </nav>
      ) : null}
      {actions ? <div className={`flex items-center ${spacing.md}`}>{actions}</div> : null}
    </header>
  );
}
