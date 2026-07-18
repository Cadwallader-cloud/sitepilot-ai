import Link from "next/link";
import { FormBuilder } from "@/components/form-builder";

type CreatePageProps = {
  searchParams: Promise<{ example?: string }>;
};

export default async function CreatePage({ searchParams }: CreatePageProps) {
  const { example } = await searchParams;

  return (
    <div className="min-h-screen">
      <header className="border-b border-surface-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand text-sm font-bold text-white">
              SP
            </span>
            <span className="text-lg font-semibold">
              SitePilot <span className="text-brand-light">AI</span>
            </span>
          </Link>
          <Link
            href="/"
            className="text-sm text-muted transition hover:text-foreground"
          >
            ← Back to home
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-12">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold md:text-4xl">
            Build your contractor website
          </h1>
          <p className="mt-3 text-muted">
            Fill in your details — see a professional preview instantly
          </p>
        </div>

        <FormBuilder loadExample={example === "true"} />
      </main>
    </div>
  );
}
