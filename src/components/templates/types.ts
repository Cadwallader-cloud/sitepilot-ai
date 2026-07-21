import type { ReactNode } from "react";
import type {
  About,
  Contact,
  FAQ,
  Navigation,
  Service,
} from "@/lib/website";

export type HeroTemplateProps = import("./hero/hero-props").HeroProps;

export type AboutTemplateProps = {
  data: About;
  label?: string;
  imageUrl?: string;
  imageAlt?: string;
};

export type ServicesTemplateProps = {
  items: Service[];
  label?: string;
  locationLink?: ReactNode;
};

export type FaqTemplateProps = {
  items: FAQ[];
  label?: string;
};

export type FooterTemplateProps = {
  businessName: string;
  contact: Contact;
  phoneLink?: ReactNode;
  emailLink?: ReactNode;
  addressLink?: ReactNode;
};

export type NavbarTemplateProps = {
  navigation: Navigation;
  businessName: string;
  phoneLink?: ReactNode;
  addressLink?: ReactNode;
};
