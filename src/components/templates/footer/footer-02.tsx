import {
  Container,
  css,
  Footer,
  Grid,
  marginTop,
  paddingX,
  paddingY,
  Text,
} from "@/components/ui";
import type { FooterTemplateProps } from "../types";

/** Multi-column footer with contact stack. */
export function Footer02({
  businessName,
  contact,
  phoneLink,
  emailLink,
  addressLink,
}: FooterTemplateProps) {
  return (
    <Footer
      template="footer-02"
      className={`${css.invertedBg} ${paddingX.site} ${paddingY["2xl"]} ${css.invertedText}`}
    >
      <Container maxWidth="2xl">
        <Grid cols={3} gap="lg">
          <div>
            <Text as="p" size="lg" className="font-bold">
              {businessName}
            </Text>
            <Text as="p" size="sm" tone="muted" className={marginTop.sm}>
              Professional local service — clear quotes, reliable work.
            </Text>
          </div>
          <div>
            <Text as="p" size="xs" className={`font-semibold uppercase tracking-wider ${css.muted}`}>
              Contact
            </Text>
            <div className={`${marginTop.sm} space-y-2`}>
              {phoneLink ?? (contact.phone ? <Text as="p" size="sm">{contact.phone}</Text> : null)}
              {emailLink ?? (contact.email ? <Text as="p" size="sm">{contact.email}</Text> : null)}
              {addressLink ?? (contact.address ? <Text as="p" size="sm">{contact.address}</Text> : null)}
            </div>
          </div>
          <div>
            <Text as="p" size="xs" className={`font-semibold uppercase tracking-wider ${css.muted}`}>
              Hours
            </Text>
            <ul className={`${marginTop.sm} space-y-1`}>
              {(contact.hours?.length ? contact.hours : ["Mon–Sat 8am–6pm"]).map((line) => (
                <li key={line}>
                  <Text as="span" size="sm">
                    {line}
                  </Text>
                </li>
              ))}
            </ul>
          </div>
        </Grid>
        <div className={`${marginTop.lg} border-t border-white/10 pt-6`}>
          <Text as="p" size="xs" tone="muted">
            © {new Date().getFullYear()} {businessName}
            <span className="mx-2">·</span>
            <Text as="span" tone="brand">
              Crestis
            </Text>
          </Text>
        </div>
      </Container>
    </Footer>
  );
}
