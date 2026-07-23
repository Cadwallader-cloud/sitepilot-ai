import type { Metadata } from "next";
import { LegalPageShell } from "@/components/legal/legal-page-shell";
import { PrivacyPolicyContent } from "@/components/legal/privacy-policy-content";
import { brand } from "@/lib/brand";

export const metadata: Metadata = {
  title: `Privacy Policy — ${brand.name}`,
  description: `How ${brand.name} collects, uses, and protects your business and account data, including AI processing.`,
};

export default function PrivacyPage() {
  return (
    <LegalPageShell title="Privacy Policy" updated="July 23, 2026">
      <PrivacyPolicyContent />
    </LegalPageShell>
  );
}
