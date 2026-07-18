import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";
import { FormBuilder } from "@/components/form-builder";

type CreatePageProps = {
  searchParams: Promise<{ example?: string; project?: string }>;
};

export default async function CreatePage({ searchParams }: CreatePageProps) {
  const { example, project } = await searchParams;

  return (
    <div className="min-h-screen">
      <header className="border-b border-surface-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <BrandLogo />
          <div className="flex items-center gap-4 text-sm">
            <Link
              href="/projects"
              className="text-muted transition hover:text-foreground"
            >
              Projects
            </Link>
            <Link
              href="/"
              className="text-muted transition hover:text-foreground"
            >
              ← Back to home
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-12">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold md:text-4xl">
            Generate your website
          </h1>
          <p className="mt-3 text-muted">
            Enter name, location, services, phone & email — AI builds a full
            website in under 60 seconds
          </p>
        </div>

        <FormBuilder
          loadExample={example === "true"}
          projectId={project}
        />
      </main>
    </div>
  );
}
