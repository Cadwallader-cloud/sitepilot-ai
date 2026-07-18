import Image from "next/image";
import { showcaseImages } from "@/lib/showcase-images";
import { ShowcaseChrome, ShowcaseMobileCTA } from "./showcase-chrome";
import { ProjectGallery, TeamSection, TestimonialsSection } from "./showcase-sections";

export function PlumbingShowcase() {
  return (
    <div className="min-h-screen bg-sky-50 pb-24 text-sky-950 md:pb-0">
      <ShowcaseChrome />
      <ShowcaseMobileCTA phone="(305) 555-0171" accent="#0284c7" />

      <section className="relative overflow-hidden bg-gradient-to-br from-sky-100 to-white">
        <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-sky-200/60 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-48 w-48 rounded-full bg-cyan-200/50 blur-3xl" />

        <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-6 py-16 md:grid-cols-2 md:py-24">
          <div>
            <span className="animate-fade-up inline-block rounded-full bg-sky-600 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-white">
              Miami&apos;s #1 rated plumber
            </span>
            <h1 className="animate-fade-up-delay-1 mt-6 text-5xl font-bold leading-tight text-sky-950 md:text-6xl">
              FlowMaster
              <span className="block text-sky-600">Plumbing</span>
            </h1>
            <p className="animate-fade-up-delay-2 mt-6 text-lg text-sky-800/80">
              Burst pipes, clogged drains, water heaters — we fix it fast.
              Available 24/7 across Miami-Dade County.
            </p>
            <div className="animate-fade-up-delay-3 mt-8 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                className="rounded-2xl bg-sky-600 px-8 py-4 text-sm font-bold text-white shadow-lg shadow-sky-600/30 transition hover:bg-sky-700"
              >
                🚨 Emergency call-out
              </button>
              <button
                type="button"
                className="rounded-2xl border-2 border-sky-200 bg-white px-8 py-4 text-sm font-bold text-sky-700 transition hover:border-sky-400"
              >
                Get a free estimate
              </button>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-md">
            <div className="overflow-hidden rounded-[2rem] shadow-2xl shadow-sky-900/20">
              <Image
                src={showcaseImages.plumbing.hero}
                alt="Professional plumber"
                width={500}
                height={600}
                className="h-auto w-full object-cover"
                priority
              />
            </div>
            <div className="absolute -bottom-4 -left-4 rounded-2xl bg-white p-4 shadow-xl">
              <p className="text-2xl font-bold text-sky-600">30 min</p>
              <p className="text-xs font-medium text-sky-800/60">Avg response time</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <h2 className="text-center text-2xl font-bold text-sky-950">What we fix</h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[
            "Emergency leak repair",
            "Drain cleaning & unblocking",
            "Water heater install",
            "Bathroom remodeling",
            "Sewer line inspection",
            "Gas line services",
          ].map((service) => (
            <div
              key={service}
              className="flex items-center gap-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-sky-100 transition hover:-translate-y-1 hover:shadow-md hover:ring-sky-300"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-sky-100 text-xl">
                💧
              </span>
              <span className="font-semibold text-sky-900">{service}</span>
            </div>
          ))}
        </div>
      </section>

      <ProjectGallery
        title="Jobs we've completed"
        subtitle="From emergency leaks to full bathroom remodels"
        dark={false}
        images={[
          {
            src: showcaseImages.plumbing.gallery[0],
            alt: "Plumber at work",
            caption: "Emergency pipe repair — Miami Beach",
          },
          {
            src: showcaseImages.plumbing.gallery[1],
            alt: "Bathroom plumbing",
            caption: "Bathroom remodel — Coral Gables",
          },
          {
            src: showcaseImages.plumbing.gallery[2],
            alt: "Water heater install",
            caption: "Tankless water heater — Brickell",
          },
        ]}
      />

      <TeamSection
        src={showcaseImages.plumbing.team}
        alt="Plumbing team"
        dark={false}
      >
        <h2 className="text-3xl font-bold">Licensed & ready 24/7</h2>
        <p className="mt-4 leading-relaxed text-sky-800/80">
          Our Miami-based team handles everything from burst pipes to full
          bathroom renovations. Upfront pricing, no hidden fees, guaranteed work.
        </p>
      </TeamSection>

      <TestimonialsSection
        title="Miami homeowners rate us 5 stars"
        dark={false}
        accent="#0284c7"
        items={[
          {
            quote:
              "Had a burst pipe at 2am. They arrived in 25 minutes and fixed it before sunrise.",
            name: "Carlos G.",
            role: "Homeowner, Miami",
          },
          {
            quote:
              "Fair price, professional crew, and they cleaned up perfectly. Highly recommend.",
            name: "Jennifer W.",
            role: "Condo owner, South Beach",
          },
        ]}
      />

      <section className="bg-sky-600 px-6 py-16 text-center text-white">
        <h2 className="text-3xl font-bold">Available right now</h2>
        <p className="mt-4 text-sky-100">No overtime surprises. Upfront pricing before we start.</p>
        <a
          href="tel:+13055550171"
          className="mt-8 inline-block text-4xl font-bold tracking-tight"
        >
          (305) 555-0171
        </a>
      </section>

      <footer className="px-6 py-8 text-center text-sm text-sky-600/60">
        Licensed · Insured · FL License #CFC1234567
      </footer>
    </div>
  );
}
