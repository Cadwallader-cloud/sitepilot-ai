import Link from "next/link";
import { auth } from "@/auth";
import { BrandLogo } from "@/components/brand-logo";
import { ProjectsList } from "@/components/projects-list";
import { redirect } from "next/navigation";

export default async function ProjectsPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/create");
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-surface-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <BrandLogo />
          <div className="flex items-center gap-4 text-sm">
            <Link
              href="/create"
              className="text-muted transition hover:text-foreground"
            >
              + New site
            </Link>
            <Link
              href="/"
              className="text-muted transition hover:text-foreground"
            >
              ← Home
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-12">
        <h1 className="text-3xl font-bold">Your projects</h1>
        <p className="mt-2 text-muted">
          Sites you generated are saved here — open any one tomorrow and keep
          editing.
        </p>
        <div className="mt-8">
          <ProjectsList />
        </div>
      </main>
    </div>
  );
}
