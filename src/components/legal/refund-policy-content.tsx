import Link from "next/link";
import { brand } from "@/lib/brand";

export function RefundPolicyContent() {
  return (
    <>
      <p>
        This Refund Policy applies to paid subscriptions for {brand.name} at{" "}
        <a
          href={`https://${brand.domain}`}
          className="text-brand-light underline-offset-2 hover:underline"
        >
          {brand.domain}
        </a>
        . It supplements our{" "}
        <Link href="/terms" className="text-brand-light underline-offset-2 hover:underline">
          Terms of Service
        </Link>
        .
      </p>

      <section>
        <h2 className="text-lg font-semibold text-foreground">Refund policy</h2>
        <p className="mt-3 leading-relaxed">
          Unless required by applicable law, subscription fees are
          non-refundable. Refund requests may be considered at {brand.name}&apos;s
          sole discretion in cases of duplicate charges, billing errors, or
          technical issues preventing use of the Service.
        </p>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-semibold text-foreground">How to request a refund</h2>
        <p className="mt-3 leading-relaxed">
          Email{" "}
          <a
            href={`mailto:${brand.supportEmail}`}
            className="text-brand-light underline-offset-2 hover:underline"
          >
            {brand.supportEmail}
          </a>{" "}
          with your account email, payment reference (if available), and a brief
          description of the issue. We aim to respond within a reasonable time.
        </p>
      </section>
    </>
  );
}
