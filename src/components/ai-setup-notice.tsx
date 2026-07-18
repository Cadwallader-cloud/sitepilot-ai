import Link from "next/link";

export function AISetupNotice() {
  return (
    <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-8">
      <p className="text-lg font-semibold text-amber-100">Enable AI generation</p>
      <p className="mt-2 text-sm text-amber-200/80">
        Real AI is not active yet. Follow these steps — takes about 2 minutes.
      </p>

      <ol className="mt-6 space-y-4 text-sm">
        <li className="flex gap-3">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-500/30 text-xs font-bold">
            1
          </span>
          <span>
            Create an account at{" "}
            <a
              href="https://platform.openai.com/signup"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-amber-100 underline"
            >
              platform.openai.com
            </a>
          </span>
        </li>
        <li className="flex gap-3">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-500/30 text-xs font-bold">
            2
          </span>
          <span>
            Go to{" "}
            <a
              href="https://platform.openai.com/api-keys"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-amber-100 underline"
            >
              API Keys
            </a>{" "}
            → Create new secret key → copy it (starts with <code className="text-amber-100">sk-</code>)
          </span>
        </li>
        <li className="flex gap-3">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-500/30 text-xs font-bold">
            3
          </span>
          <span>
            Open <code className="text-amber-100">.env.local</code> in the project root and paste:
            <pre className="mt-2 overflow-x-auto rounded-lg bg-black/30 p-3 text-xs text-amber-100">
              OPENAI_API_KEY=sk-your-key-here{"\n"}OPENAI_MODEL=gpt-4o-mini
            </pre>
          </span>
        </li>
        <li className="flex gap-3">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-500/30 text-xs font-bold">
            4
          </span>
          <span>
            Restart the dev server: <code className="text-amber-100">Ctrl+C</code> then{" "}
            <code className="text-amber-100">npm run dev</code>
          </span>
        </li>
      </ol>

      <p className="mt-6 text-xs text-amber-200/70">
        Cost: ~$0.001 per website with GPT-4o-mini. Add $5 credit at{" "}
        <a
          href="https://platform.openai.com/settings/organization/billing"
          target="_blank"
          rel="noopener noreferrer"
          className="underline"
        >
          Billing
        </a>{" "}
        to get started.
      </p>

      <Link
        href="/create"
        className="mt-6 inline-block text-sm font-medium text-amber-100 underline"
      >
        Refresh this page after setup →
      </Link>
    </div>
  );
}
