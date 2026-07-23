import Link from "next/link";
import Image from "next/image";
import { showcaseDemoCount, showcaseDemos } from "@/lib/showcase-demos";

const featured = [
  "roofing",
  "plumbing",
  "electrician",
  "brightsmile-dental-austin",
  "ember-table-restaurant",
  "sterling-law-group",
];

export function DemoExamples() {
  const demos = featured
    .map((slug) => showcaseDemos.find((d) => d.slug === slug))
    .filter(Boolean) as typeof showcaseDemos;

  return (
    <section id="examples" className="border-t border-surface-border px-6 py-20">
      <div className="mx-auto max-w-6xl">
        <div className="text-center">
          <h2 className="text-3xl font-bold md:text-4xl">
            See finished websites first
          </h2>
          <p className="mt-3 text-muted">
            {showcaseDemoCount} free demos across trades, clinics, firms &
            restaurants
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {demos.map((demo) => (
            <DemoCard key={demo.slug} demo={demo} />
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link
            href="/demos"
            className="inline-flex h-12 items-center justify-center rounded-full border border-surface-border px-8 text-sm font-semibold transition hover:border-brand/40 hover:text-brand-light"
          >
            View all {showcaseDemoCount} demos →
          </Link>
        </div>
      </div>
    </section>
  );
}

function DemoCard({ demo }: { demo: (typeof showcaseDemos)[number] }) {
  return (
    <Link
      href={`/demos/${demo.slug}`}
      className="group overflow-hidden rounded-2xl border border-surface-border bg-surface transition hover:border-brand/40 hover:shadow-lg hover:shadow-brand/10"
    >
      <div className="relative h-44 overflow-hidden bg-zinc-800">
        <Image
          src={demo.heroImage}
          alt={demo.name}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover transition duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        <span
          className="absolute left-4 top-4 rounded-full border border-white/25 bg-white/95 px-3 py-1 text-xs font-bold text-slate-900 shadow-sm backdrop-blur-sm"
        >
          {demo.trade}
        </span>
        <p className="absolute bottom-3 left-4 text-lg font-bold text-white drop-shadow-md">
          {demo.name}
        </p>
      </div>
      <div className="p-5">
        <p className="text-sm text-muted">{demo.location}</p>
        <p className="mt-3 text-sm font-semibold group-hover:text-brand-light">
          View live demo →
        </p>
      </div>
    </Link>
  );
}
