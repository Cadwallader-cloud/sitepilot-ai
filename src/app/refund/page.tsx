import type { Metadata } from "next";
import { LegalPageShell } from "@/components/legal/legal-page-shell";
import { RefundPolicyContent } from "@/components/legal/refund-policy-content";
import { brand } from "@/lib/brand";

export const metadata: Metadata = {
  title: `Refund Policy — ${brand.name}`,
  description: `Refund terms for ${brand.name} subscriptions and paid plans.`,
};

export default function RefundPage() {
  return (
    <LegalPageShell title="Refund Policy" updated="July 23, 2026">
      <RefundPolicyContent />
    </LegalPageShell>
  );
}
