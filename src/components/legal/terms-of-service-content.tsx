import Link from "next/link";
import { brand } from "@/lib/brand";

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="text-lg font-semibold text-foreground">{title}</h2>
      <div className="mt-3 space-y-3">{children}</div>
    </section>
  );
}

export function TermsOfServiceContent() {
  return (
    <>
      <p>
        These Terms of Service (&quot;Terms&quot;) govern your access to and use
        of {brand.name} (&quot;{brand.name}&quot;, &quot;we&quot;, &quot;us&quot;)
        at{" "}
        <a
          href={`https://${brand.domain}`}
          className="text-brand-light underline-offset-2 hover:underline"
        >
          {brand.domain}
        </a>{" "}
        and related services (the &quot;Service&quot;). By creating an account,
        generating a website, or otherwise using the Service, you agree to these
        Terms and our{" "}
        <Link href="/privacy" className="text-brand-light underline-offset-2 hover:underline">
          Privacy Policy
        </Link>
        .
      </p>

      <Section title="1. Acceptance">
        <p>
          You must be at least 18 years old and able to enter a binding contract
          to use the Service. If you use the Service on behalf of a business,
          you represent that you have authority to bind that business to these
          Terms.
        </p>
      </Section>

      <Section title="2. The Service">
        <p>
          {brand.name} is an AI-powered website builder for local businesses. We
          help you create, preview, edit, publish, and host websites using
          information you provide (such as business name, location, services,
          and contact details). Features, plans, and availability may change over
          time.
        </p>
        <p>
          The Service uses artificial intelligence to generate text, layouts,
          and related content. AI outputs are suggestions — you are responsible
          for reviewing, editing, and approving anything you publish.
        </p>
        <p>
          {brand.name} is currently offered as a beta service. Features, pricing,
          and functionality may change without prior notice.
        </p>
      </Section>

      <Section title="3. Accounts">
        <p>
          You may sign in with email or supported providers (such as Google).
          You are responsible for maintaining the security of your account and
          for all activity under it. Notify us promptly at{" "}
          <a
            href={`mailto:${brand.supportEmail}`}
            className="text-brand-light underline-offset-2 hover:underline"
          >
            {brand.supportEmail}
          </a>{" "}
          if you suspect unauthorized access.
        </p>
        <p>
          You agree to provide accurate account and business information and to
          keep it up to date where reasonably necessary for the Service to
          function.
        </p>
      </Section>

      <Section title="4. Acceptable use">
        <p>You agree not to use the Service to:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>violate any applicable law or third-party rights;</li>
          <li>
            publish unlawful, fraudulent, misleading, harassing, or harmful
            content;
          </li>
          <li>
            upload malware, attempt unauthorized access, or interfere with the
            Service or its infrastructure;
          </li>
          <li>
            scrape, reverse engineer, or resell the Service except as expressly
            permitted;
          </li>
          <li>
            impersonate others or misrepresent your business, affiliation, or
            credentials;
          </li>
          <li>
            submit sensitive personal data you are not authorized to share
            (such as health records, government IDs, or payment card numbers).
          </li>
        </ul>
        <p>
          We may suspend or terminate access if we reasonably believe you have
          violated these Terms or pose a risk to the Service or other users.
        </p>
      </Section>

      <Section title="5. AI usage restrictions">
        <p>
          Because {brand.name} uses third-party AI providers (such as OpenAI),
          you may not use the Service — including AI generation, editing, or
          publishing — to create, promote, or distribute content related to:
        </p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong className="text-foreground">Illegal activity</strong> —
            any use that violates applicable local, national, or international
            law;
          </li>
          <li>
            <strong className="text-foreground">Fraud</strong> — scams, deceptive
            schemes, impersonation, or misrepresentation intended to defraud
            others;
          </li>
          <li>
            <strong className="text-foreground">Malware</strong> — viruses,
            trojans, ransomware, phishing pages, or other harmful or malicious
            code or links;
          </li>
          <li>
            <strong className="text-foreground">Spam</strong> — unsolicited bulk
            messaging, link farms, or other abusive promotional practices;
          </li>
          <li>
            <strong className="text-foreground">Copyright infringement</strong> —
            content you do not have the right to use, reproduce, or publish;
          </li>
          <li>
            <strong className="text-foreground">Hate or extremist content</strong>{" "}
            — material that promotes hatred, violence, discrimination, or
            extremist ideologies against individuals or groups.
          </li>
        </ul>
        <p>
          You must comply with our AI providers&apos; acceptable-use and safety
          policies. We may block, remove, or refuse to generate content that
          violates these restrictions or provider rules, and may suspend or
          terminate accounts without refund where misuse is found.
        </p>
      </Section>

      <Section title="6. Your content and intellectual property">
        <p>
          You retain ownership of business information, text, images, and other
          materials you submit (&quot;User Content&quot;). You grant {brand.name}{" "}
          a non-exclusive, worldwide license to host, store, reproduce, display,
          and process User Content solely to operate, improve, and provide the
          Service (including sending relevant inputs to AI providers to generate
          outputs).
        </p>
        <p>
          You represent that you have the rights needed to submit User Content
          and to publish it on your website, and that doing so does not infringe
          anyone else&apos;s intellectual property or privacy rights.
        </p>
        <p>
          {brand.name} and its logos, software, and platform design are our
          property or our licensors&apos;. These Terms do not grant you rights to
          our brand assets except as needed to use the Service.
        </p>
      </Section>

      <Section title="7. AI-generated content">
        <p>
          AI-generated drafts, copy, layouts, and suggestions may be inaccurate,
          incomplete, outdated, or unsuitable for your business or jurisdiction.
          They are not legal, financial, medical, or professional advice.
        </p>
        <p>
          You are solely responsible for reviewing AI outputs before publishing,
          ensuring compliance with applicable laws (including advertising and
          consumer protection rules), and correcting errors. {brand.name} does
          not guarantee that AI outputs will be unique, error-free, or free of
          third-party claims.
        </p>
      </Section>

      <Section title="8. Plans, billing, and subscriptions">
        <p>
          Some features require a paid plan. Prices, limits, and plan details
          are shown at checkout or in your account. By subscribing, you authorize
          us to charge the selected plan on a recurring basis until you cancel,
          subject to the billing terms presented at purchase.
        </p>
        <p>
          We may offer payment methods such as cryptocurrency checkout. Payment
          processing may be handled by third parties; we do not store full
          payment card numbers on our servers. Crypto payments may be
          irreversible — verify amounts and wallet addresses before sending
          funds.
        </p>
        <p>
          See our{" "}
          <Link href="/refund" className="text-brand-light underline-offset-2 hover:underline">
            Refund Policy
          </Link>
          : unless required by applicable law, subscription fees are
          non-refundable. Refund requests may be considered at {brand.name}&apos;s
          sole discretion in cases of duplicate charges, billing errors, or
          technical issues preventing use of the Service.
        </p>
        <p>
          You may cancel renewal through your account or by contacting support;
          cancellation takes effect at the end of the current paid period unless
          we specify otherwise.
        </p>
      </Section>

      <Section title="9. Termination">
        <p>
          You may stop using the Service at any time and may request account
          deletion by contacting{" "}
          <a
            href={`mailto:${brand.supportEmail}`}
            className="text-brand-light underline-offset-2 hover:underline"
          >
            {brand.supportEmail}
          </a>
          .
        </p>
        <p>
          We may suspend or terminate your access if you breach these Terms,
          fail to pay applicable fees, or if we discontinue the Service (with
          reasonable notice where practicable). Upon termination, your right to
          use the Service ends. We may retain certain data as described in our
          Privacy Policy and as required by law.
        </p>
      </Section>

      <Section title="10. Export and deletion">
        <p>
          Users may request deletion of their account and associated data in
          accordance with the{" "}
          <Link href="/privacy" className="text-brand-light underline-offset-2 hover:underline">
            Privacy Policy
          </Link>
          . Where applicable law provides, you may also request access to or
          export of your personal data as described there.
        </p>
      </Section>

      <Section title="11. Disclaimers">
        <p>
          {brand.name} does not guarantee uninterrupted or error-free
          availability of the Service and may perform maintenance from time to
          time.
        </p>
        <p>
          THE SERVICE IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot;
          WITHOUT WARRANTIES OF ANY KIND, WHETHER EXPRESS, IMPLIED, OR STATUTORY,
          INCLUDING IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
          PARTICULAR PURPOSE, AND NON-INFRINGEMENT. WE DO NOT WARRANT THAT THE
          SERVICE WILL BE UNINTERRUPTED, SECURE, OR ERROR-FREE, OR THAT
          PUBLISHED WEBSITES WILL MEET YOUR BUSINESS GOALS.
        </p>
      </Section>

      <Section title="12. Limitation of liability">
        <p>
          TO THE MAXIMUM EXTENT PERMITTED BY LAW, {brand.name.toUpperCase()} AND
          ITS AFFILIATES, OFFICERS, EMPLOYEES, AND SUPPLIERS WILL NOT BE LIABLE
          FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE
          DAMAGES, OR ANY LOSS OF PROFITS, REVENUE, DATA, OR GOODWILL, ARISING
          FROM YOUR USE OF THE SERVICE.
        </p>
        <p>
          OUR TOTAL LIABILITY FOR ANY CLAIM RELATING TO THE SERVICE OR THESE
          TERMS WILL NOT EXCEED THE GREATER OF (A) THE AMOUNT YOU PAID US IN THE
          TWELVE (12) MONTHS BEFORE THE EVENT GIVING RISE TO THE CLAIM, OR (B)
          ONE HUNDRED U.S. DOLLARS (USD $100).
        </p>
        <p>
          Some jurisdictions do not allow certain limitations; in those cases,
          our liability is limited to the fullest extent permitted by law.
        </p>
      </Section>

      <Section title="13. Changes to these Terms">
        <p>
          We may update these Terms from time to time. We will post the revised
          version on this page and update the &quot;Last updated&quot; date.
          Material changes may be communicated by email or in-product notice
          where appropriate. Continued use after changes take effect constitutes
          acceptance of the updated Terms.
        </p>
      </Section>

      <Section title="14. Governing law">
        <p>
          These Terms are governed by the laws applicable where {brand.name}{" "}
          operates the Service, without regard to conflict-of-law rules. Disputes
          will be resolved in the courts of that jurisdiction, unless mandatory
          consumer protection laws in your country require otherwise.
        </p>
      </Section>

      <Section title="15. Contact">
        <p>
          Questions about these Terms:{" "}
          <a
            href={`mailto:${brand.supportEmail}`}
            className="text-brand-light underline-offset-2 hover:underline"
          >
            {brand.supportEmail}
          </a>
          . Website:{" "}
          <Link href="/" className="text-brand-light underline-offset-2 hover:underline">
            {brand.domain}
          </Link>
          .
        </p>
      </Section>
    </>
  );
}
