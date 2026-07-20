"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { demoTrades } from "@/lib/demo-catalog";
import { showcaseDemos } from "@/lib/showcase-demos";

export function DemosGallery() {
  const [trade, setTrade] = useState<string>("All");

  const filtered = useMemo(() => {
    if (trade === "All") return showcaseDemos;
    return showcaseDemos.filter((d) => d.trade === trade);
  }, [trade]);

  return (
    <div>
      <div className="flex flex-wrap justify-center gap-2">
        <FilterChip
          active={trade === "All"}
          onClick={() => setTrade("All")}
          label={`All (${showcaseDemos.length})`}
        />
        {demoTrades.map((t) => {
          const count = showcaseDemos.filter((d) => d.trade === t).length;
          if (!count) return null;
          return (
            <FilterChip
              key={t}
              active={trade === t}
              onClick={() => setTrade(t)}
              label={`${t} (${count})`}
            />
          );
        })}
      </div>

      <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((demo) => (
          <Link
            key={demo.slug}
            href={`/demos/${demo.slug}`}
            className="group overflow-hidden rounded-2xl border border-surface-border bg-surface transition hover:border-brand/40 hover:shadow-xl hover:shadow-brand/10"
          >
            <div className="relative h-52 overflow-hidden bg-zinc-800">
              <Image
                src={demo.heroImage}
                alt={demo.name}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover transition duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <span
                  className="rounded-full px-3 py-1 text-xs font-bold text-white"
                  style={{ backgroundColor: demo.accent }}
                >
                  {demo.trade}
                </span>
              </div>
            </div>
            <div className="p-6">
              <h2 className="text-xl font-bold group-hover:text-brand-light">
                {demo.name}
              </h2>
              <p className="mt-1 text-sm text-muted">{demo.location}</p>
              <p className="mt-3 text-sm leading-relaxed text-muted">
                {demo.description}
              </p>
              <p className="mt-4 text-sm font-semibold text-foreground group-hover:text-brand-light">
                View live demo →
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
        active
          ? "bg-brand text-white"
          : "border border-surface-border text-muted hover:border-brand/40 hover:text-foreground"
      }`}
    >
      {label}
    </button>
  );
}
