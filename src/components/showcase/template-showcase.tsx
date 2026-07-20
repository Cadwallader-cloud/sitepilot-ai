import Image from "next/image";
import type { DemoSite } from "@/lib/demo-catalog";
import { ShowcaseChrome, ShowcaseMobileCTA } from "./showcase-chrome";
import { ProjectGallery, TestimonialsSection } from "./showcase-sections";

export function TemplateShowcase({ demo }: { demo: DemoSite }) {
  if (demo.layout === "splitLight") {
    return <SplitLightDemo demo={demo} />;
  }
  if (demo.layout === "darkTech") {
    return <DarkTechDemo demo={demo} />;
  }
  return <FullBleedDemo demo={demo} />;
}

function FullBleedDemo({ demo }: { demo: DemoSite }) {
  return (
    <div className="min-h-screen bg-zinc-950 pb-24 text-white md:pb-0">
      <ShowcaseChrome />
      <ShowcaseMobileCTA phone={demo.phone} accent={demo.accent} />

      <section className="relative min-h-[88vh] overflow-hidden">
        <Image
          src={demo.heroImage}
          alt={demo.name}
          fill
          priority
          className="object-cover animate-ken-burns"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/75 to-black/25" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/40" />

        <div className="relative mx-auto flex min-h-[88vh] max-w-6xl flex-col justify-center px-6 py-20">
          <p
            className="animate-fade-up text-sm font-bold uppercase tracking-[0.28em]"
            style={{ color: demo.accent }}
          >
            {demo.location}
          </p>
          <h1 className="animate-fade-up-delay-1 mt-4 max-w-3xl font-serif text-5xl font-bold leading-tight md:text-7xl">
            {demo.name}
          </h1>
          <p className="animate-fade-up-delay-2 mt-6 max-w-xl text-lg text-zinc-300 md:text-xl">
            {demo.tagline}
          </p>
          <div className="animate-fade-up-delay-3 mt-10 flex flex-col gap-4 sm:flex-row">
            <a
              href={`tel:${demo.phone.replace(/\s/g, "")}`}
              className="rounded-full px-8 py-4 text-center text-sm font-bold uppercase tracking-wider text-white transition hover:opacity-90"
              style={{ backgroundColor: demo.accent }}
            >
              {demo.cta}
            </a>
            <a
              href={`tel:${demo.phone.replace(/\s/g, "")}`}
              className="rounded-full border border-white/30 px-8 py-4 text-center text-sm font-bold uppercase tracking-wider backdrop-blur-sm transition hover:bg-white/10"
            >
              {demo.phone}
            </a>
          </div>
        </div>
      </section>

      <AboutBlock demo={demo} dark />
      <ServicesBlock demo={demo} dark />
      <ProjectGallery
        title="Recent work"
        subtitle="Real-looking project photography for this niche"
        images={demo.gallery}
        dark
      />
      <TestimonialsSection
        title="What clients say"
        items={demo.testimonials}
        dark
        accent={demo.accent}
      />
      <FinalCta demo={demo} dark />
    </div>
  );
}

function SplitLightDemo({ demo }: { demo: DemoSite }) {
  return (
    <div className="min-h-screen bg-zinc-50 pb-24 text-zinc-900 md:pb-0">
      <ShowcaseChrome />
      <ShowcaseMobileCTA phone={demo.phone} accent={demo.accent} />

      <section className="mx-auto grid min-h-[80vh] max-w-6xl items-center gap-10 px-6 py-16 lg:grid-cols-2">
        <div className="animate-fade-up">
          <p
            className="text-sm font-bold uppercase tracking-[0.25em]"
            style={{ color: demo.accent }}
          >
            {demo.trade} · {demo.location}
          </p>
          <h1 className="mt-4 text-4xl font-bold leading-tight md:text-6xl">
            {demo.name}
          </h1>
          <p className="mt-5 max-w-lg text-lg text-zinc-600">{demo.tagline}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href={`tel:${demo.phone.replace(/\s/g, "")}`}
              className="rounded-full px-7 py-3.5 text-sm font-bold text-white"
              style={{ backgroundColor: demo.accent }}
            >
              {demo.cta}
            </a>
            <a
              href={`mailto:${demo.email}`}
              className="rounded-full border border-zinc-300 bg-white px-7 py-3.5 text-sm font-bold text-zinc-800"
            >
              Email us
            </a>
          </div>
        </div>
        <div className="relative h-[420px] overflow-hidden rounded-3xl shadow-xl animate-fade-up-delay-1">
          <Image
            src={demo.heroImage}
            alt={demo.name}
            fill
            priority
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
        </div>
      </section>

      <AboutBlock demo={demo} dark={false} />
      <ServicesBlock demo={demo} dark={false} />
      <ProjectGallery
        title="Featured projects"
        images={demo.gallery}
        dark={false}
      />
      <TestimonialsSection
        title="Reviews"
        items={demo.testimonials}
        dark={false}
        accent={demo.accent}
      />
      <FinalCta demo={demo} dark={false} />
    </div>
  );
}

function DarkTechDemo({ demo }: { demo: DemoSite }) {
  return (
    <div className="min-h-screen bg-zinc-950 pb-24 text-white md:pb-0">
      <ShowcaseChrome />
      <ShowcaseMobileCTA phone={demo.phone} accent={demo.accent} />

      <section className="relative overflow-hidden border-b border-white/10">
        <div
          className="pointer-events-none absolute -right-20 top-10 h-72 w-72 rounded-full blur-3xl"
          style={{ backgroundColor: `${demo.accent}33` }}
        />
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-6 py-20 lg:grid-cols-2">
          <div>
            <p
              className="text-xs font-bold uppercase tracking-[0.35em]"
              style={{ color: demo.accent }}
            >
              {demo.trade}
            </p>
            <h1 className="mt-4 text-4xl font-bold md:text-6xl">{demo.name}</h1>
            <p className="mt-5 text-lg text-zinc-400">{demo.tagline}</p>
            <a
              href={`tel:${demo.phone.replace(/\s/g, "")}`}
              className="mt-8 inline-flex rounded-xl px-7 py-3.5 text-sm font-bold text-zinc-950"
              style={{ backgroundColor: demo.accent }}
            >
              {demo.cta}
            </a>
          </div>
          <div className="relative h-80 overflow-hidden rounded-2xl border border-white/10">
            <Image
              src={demo.heroImage}
              alt={demo.name}
              fill
              priority
              className="object-cover"
              sizes="50vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 to-transparent" />
          </div>
        </div>
      </section>

      <AboutBlock demo={demo} dark />
      <ServicesBlock demo={demo} dark />
      <ProjectGallery title="Work & proof" images={demo.gallery} dark />
      <TestimonialsSection
        title="Client feedback"
        items={demo.testimonials}
        dark
        accent={demo.accent}
      />
      <FinalCta demo={demo} dark />
    </div>
  );
}

function AboutBlock({ demo, dark }: { demo: DemoSite; dark: boolean }) {
  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
        <div>
          <h2
            className={`text-3xl font-bold md:text-4xl ${dark ? "text-white" : "text-zinc-900"}`}
          >
            {demo.aboutTitle}
          </h2>
          <p
            className={`mt-4 leading-relaxed ${dark ? "text-zinc-400" : "text-zinc-600"}`}
          >
            {demo.aboutText}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {demo.stats.map((stat) => (
            <div
              key={stat.l}
              className={`rounded-2xl p-6 text-center ${
                dark
                  ? "border border-white/10 bg-white/5"
                  : "border border-zinc-200 bg-white shadow-sm"
              }`}
            >
              <p
                className="text-2xl font-bold"
                style={{ color: demo.accent }}
              >
                {stat.n}
              </p>
              <p
                className={`mt-1 text-xs ${dark ? "text-zinc-400" : "text-zinc-500"}`}
              >
                {stat.l}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ServicesBlock({ demo, dark }: { demo: DemoSite; dark: boolean }) {
  return (
    <section
      className={dark ? "border-y border-white/5 bg-white/[0.02] py-16" : "bg-white py-16"}
    >
      <div className="mx-auto max-w-6xl px-6">
        <h2
          className={`text-3xl font-bold ${dark ? "text-white" : "text-zinc-900"}`}
        >
          Services
        </h2>
        <ul className="mt-8 grid gap-3 sm:grid-cols-2">
          {demo.services.map((service) => (
            <li
              key={service}
              className={`rounded-xl px-5 py-4 text-sm font-medium ${
                dark
                  ? "border border-white/10 bg-zinc-900/60 text-zinc-200"
                  : "border border-zinc-200 bg-zinc-50 text-zinc-800"
              }`}
            >
              <span style={{ color: demo.accent }}>✓</span> {service}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function FinalCta({ demo, dark }: { demo: DemoSite; dark: boolean }) {
  return (
    <section className="px-6 py-20 text-center">
      <div
        className={`mx-auto max-w-3xl rounded-3xl px-8 py-12 ${
          dark ? "border border-white/10 bg-white/5" : "border border-zinc-200 bg-white shadow-lg"
        }`}
      >
        <h2
          className={`text-3xl font-bold ${dark ? "text-white" : "text-zinc-900"}`}
        >
          {demo.cta}
        </h2>
        <p className={`mt-3 ${dark ? "text-zinc-400" : "text-zinc-600"}`}>
          {demo.phone} · {demo.email}
        </p>
        <a
          href={`tel:${demo.phone.replace(/\s/g, "")}`}
          className="mt-8 inline-flex rounded-full px-8 py-3.5 text-sm font-bold text-white"
          style={{ backgroundColor: demo.accent }}
        >
          Call {demo.name}
        </a>
      </div>
      <p className="mt-8 text-xs text-zinc-500">
        Demo website by Crestis — build yours free
      </p>
    </section>
  );
}
