import type { Metadata } from "next";
import { LegalPageShell } from "@/components/legal/legal-page-shell";
import { TermsOfServiceContent } from "@/components/legal/terms-of-service-content";
import { brand } from "@/lib/brand";

export const metadata: Metadata = {
  title: `Terms of Service — ${brand.name}`,
  description: `Terms governing your use of ${brand.name}, including accounts, AI-generated websites, billing, and acceptable use.`,
};

export default function TermsPage() {
  return (
    <LegalPageShell title="Terms of Service" updated="July 23, 2026">
      <TermsOfServiceContent />
    </LegalPageShell>
  );
}
