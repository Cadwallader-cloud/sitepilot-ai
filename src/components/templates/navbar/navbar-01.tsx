import { Button, Logo, Navbar, css, paddingX, paddingY } from "@/components/ui";
import type { NavbarTemplateProps } from "../types";

/** Classic header — Logo + links + CTA via ui Navbar. */
export function Navbar01({
  navigation,
  businessName,
  phoneLink,
  addressLink,
}: NavbarTemplateProps) {
  return (
    <Navbar
      template="navbar-01"
      className={`border-b border-[var(--border)] ${paddingX.site} ${paddingY.lg}`}
      brand={
        <div>
          <Logo name={businessName || navigation.logo} tone="brand" />
          {addressLink ? (
            <div className={`text-[11px] uppercase tracking-wide ${css.muted}`}>
              {addressLink}
            </div>
          ) : null}
        </div>
      }
      navigation={
        <>
          {navigation.links.slice(0, 5).map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={`text-xs font-medium ${css.muted} underline-offset-2 hover:underline`}
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
