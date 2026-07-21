import { Footer, Logo, paddingX, paddingY, Stack, Text } from "@/components/ui";
import type { ReactNode } from "react";
import type { FooterTemplateProps } from "../types";

/** Simple centered footer — ui Footer + Logo + Stack. */
export function Footer01({
  businessName,
  contact,
  phoneLink,
  emailLink,
  addressLink,
}: FooterTemplateProps) {
  return (
    <Footer
      className={`border-t border-zinc-200 bg-white ${paddingX.site} ${paddingY.xl} text-center`}
      brand={<Logo name={businessName} tone="brand" />}
    >
      <Stack gap="sm" align="center" className="mt-3">
        {phoneLink ? <div>{phoneLink as ReactNode}</div> : contact.phone ? <Text as="div">{contact.phone}</Text> : null}
        {emailLink ? <div>{emailLink as ReactNode}</div> : contact.email ? <Text as="div">{contact.email}</Text> : null}
        {addressLink ? (
          <div>{addressLink as ReactNode}</div>
        ) : contact.address ? (
          <Text as="div">{contact.address}</Text>
        ) : null}
      </Stack>
      <Text as="p" size="xs" tone="muted" className="mt-6">
        © {new Date().getFullYear()} {businessName}. Built with Crestis.
      </Text>
    </Footer>
  );
}
