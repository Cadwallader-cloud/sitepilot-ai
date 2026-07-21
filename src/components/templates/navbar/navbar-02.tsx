import { Button, css, Navbar, paddingX, paddingY } from "@/components/ui";
import type { NavbarTemplateProps } from "../types";

/** Dark sticky-style bar — high contrast CTA. */
export function Navbar02({
  navigation,
  businessName,
  phoneLink,
}: NavbarTemplateProps) {
  return (
    <Navbar
      template="navbar-02"
      navBreakpoint="desktop"
      className={`sticky top-0 z-40 bg-[color-mix(in_srgb,var(--text)_95%,transparent)] ${paddingX.site} ${paddingY.md} ${css.invertedText} backdrop-blur`}
      brand={<p className="text-sm font-bold tracking-wide">{businessName || navigation.logo}</p>}
      navigation={
        <>
          {navigation.links.slice(0, 4).map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-xs font-medium text-[color-mix(in_srgb,var(--background)_75%,transparent)] hover:text-[var(--background)]"
            >
              {link.label}
            </a>
          ))}
        </>
      }
      actions={
        <>
          {phoneLink}
          <Button variant="primary">{navigation.cta}</Button>
        </>
      }
    />
  );
}
