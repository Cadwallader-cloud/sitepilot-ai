import type { ReactNode } from "react";

export type FooterProps = {
  brand?: ReactNode;
  children?: ReactNode;
  legal?: ReactNode;
  className?: string;
  template?: string;
};

export function Footer({ brand, children, legal, className = "", template }: FooterProps) {
  return (
    <footer className={className} data-component="Footer" data-template={template}>
      {brand}
      {children}
      {legal}
    </footer>
  );
}
