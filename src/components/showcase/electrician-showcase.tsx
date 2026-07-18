import Image from "next/image";
import { showcaseImages } from "@/lib/showcase-images";
import { ShowcaseChrome, ShowcaseMobileCTA } from "./showcase-chrome";
import { ProjectGallery, TestimonialsSection } from "./showcase-sections";

export function ElectricianShowcase() {
  return (
    <div className="min-h-screen bg-[#06080f] pb-24 text-white md:pb-0">
      <ShowcaseChrome />
      <ShowcaseMobileCTA phone="(512) 555-0188" accent="#0ea5e9" />

      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-32 top-20 h-96 w-96 rounded-full bg-sky-500/10 blur-3xl" />
        <div className="absolute -right-32 bottom-20 h-96 w-96 rounded-full bg-violet-500/10 blur-3xl" />
      </div>

      <section className="relative mx-auto max-w-6xl px-6 py-16 md:py-24">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <div className="animate-fade-up inline-flex items-center gap-2 rounded-full border border-sky-500/30 bg-sky-500/10 px-4 py-1.5 text-xs font-medium text-sky-300">
              <span className="h-2 w-2 animate-pulse rounded-full bg-sky-400" />
              24/7 emergency service · Austin, TX
            </div>
            <h1 className="animate-fade-up-delay-1 mt-6 text-5xl font-bold tracking-tight md:text-6xl">
              VoltPro
              <span className="block bg-gradient-to-r from-sky-400 to-violet-400 bg-clip-text text-transparent">
                Electric
              </span>
            </h1>
            <p className="animate-fade-up-delay-2 mt-6 text-lg text-zinc-400">
              Licensed master electricians for panel upgrades, EV chargers, rewiring,
              and commercial installs. Code-compliant. Guaranteed.
            </p>
            <div className="animate-fade-up-delay-3 mt-8 flex flex-wrap gap-4">
              <button
                type="button"
                className="rounded-xl bg-gradient-to-r from-sky-500 to-violet-600 px-8 py-4 text-sm font-bold transition hover:opacity-90"
              >
                Schedule service
              </button>
              <button
                type="button"
                className="rounded-xl border border-white/10 bg-white/5 px-8 py-4 text-sm font-bold backdrop-blur-sm transition hover:bg-white/10"
              >
                (512) 555-0188
              </button>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-sky-500/20 to-violet-500/20 blur-2xl" />
            <div className="relative overflow-hidden rounded-3xl border border-white/10">
              <Image
                src={showcaseImages.electrician.hero}
                alt="Electrician at work"
                width={600}
                height={500}
                className="h-auto w-full object-cover"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { t: "Panel upgrades", e: "⚡" },
            { t: "EV chargers", e: "🔌" },
            { t: "Whole-home rewiring", e: "🏠" },
            { t: "Commercial fit-outs", e: "🏢" },
          ].map((item) => (
            <div
              key={item.t}
              className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition hover:border-sky-500/40 hover:bg-white/10"
            >
              <span className="text-2xl">{item.e}</span>
              <h3 className="mt-3 font-semibold">{item.t}</h3>
              <p className="mt-2 text-sm text-zinc-500">Licensed · Insured · Guaranteed</p>
            </div>
          ))}
        </div>
      </section>

      <ProjectGallery
        title="Our work"
        subtitle="Residential and commercial electrical projects across Austin"
        dark
        images={[
          {
            src: showcaseImages.electrician.gallery[0],
            alt: "Electrician on site",
            caption: "Commercial panel upgrade — Downtown Austin",
          },
          {
            src: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80",
            alt: "Electrical wiring",
            caption: "Whole-home rewiring — Round Rock",
          },
          {
            src: "https://images.unsplash.com/photo-1473341303094-9b870a845551?w=800&q=80",
            alt: "EV charger install",
            caption: "Tesla charger install — Cedar Park",
          },
        ]}
      />

      <TestimonialsSection
        title="What customers say"
        dark
        accent="#0ea5e9"
        items={[
          {
            quote:
              "Installed our EV charger same day. Clean work, explained everything, passed inspection first try.",
            name: "David R.",
            role: "Homeowner, Austin",
          },
          {
            quote:
              "Called at 11pm with a power outage — they were here in 90 minutes. Lifesavers.",
            name: "Maria L.",
            role: "Restaurant owner",
          },
        ]}
      />

      <section className="border-y border-white/5 bg-white/[0.02] py-20">
        <div className="mx-auto max-w-6xl px-6 text-center">
          <h2 className="text-3xl font-bold">Why Austin trusts VoltPro</h2>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {[
              { n: "12+", l: "Years licensed" },
              { n: "4.9", l: "Google rating" },
              { n: "2hr", l: "Avg emergency response" },
            ].map((s) => (
              <div key={s.l}>
                <p className="text-5xl font-bold text-sky-400">{s.n}</p>
                <p className="mt-2 text-zinc-500">{s.l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-16 text-center">
        <p className="text-xl text-zinc-400">Power problems don&apos;t wait — neither do we.</p>
        <p className="mt-4 text-3xl font-bold text-sky-400">(512) 555-0188</p>
      </section>
    </div>
  );
}
