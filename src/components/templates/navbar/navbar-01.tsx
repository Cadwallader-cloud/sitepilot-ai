import { Button, Logo, Navbar, paddingX, paddingY } from "@/components/ui";
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
      className={`border-b border-zinc-100 ${paddingX.site} ${paddingY.lg}`}
      brand={
        <div>
          <Logo name={businessName || navigation.logo} tone="brand" />
          {addressLink ? (
            <div className="text-[11px] uppercase tracking-wide text-zinc-500">
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
              className="text-xs font-medium text-zinc-600 underline-offset-2 hover:underline"
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
