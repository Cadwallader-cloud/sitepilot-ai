import Image from "next/image";
import { showcaseImages } from "@/lib/showcase-images";
import { ShowcaseChrome, ShowcaseMobileCTA } from "./showcase-chrome";
import { ProjectGallery, TeamSection, TestimonialsSection } from "./showcase-sections";

const services = [
  "Roof replacement & installation",
  "Storm & hail damage repair",
  "Emergency leak response",
  "Gutter systems & drainage",
  "Free roof inspections",
];

export function RoofingShowcase() {
  return (
    <div className="min-h-screen bg-stone-950 pb-24 text-white md:pb-0">
      <ShowcaseChrome />
      <ShowcaseMobileCTA phone="(303) 555-0142" accent="#c2410c" />

      <section className="relative min-h-[90vh] overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src={showcaseImages.roofing.hero}
            alt="Professional roofing work"
            fill
            priority
            className="object-cover animate-ken-burns"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-stone-950 via-stone-950/80 to-stone-950/30" />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-transparent to-stone-950/40" />
        </div>

        <div className="relative mx-auto flex min-h-[90vh] max-w-6xl flex-col justify-center px-6 py-20">
          <p className="animate-fade-up text-sm font-bold uppercase tracking-[0.3em] text-orange-400">
            Denver&apos;s trusted roofers
          </p>
          <h1 className="animate-fade-up-delay-1 mt-4 max-w-3xl font-serif text-5xl font-bold leading-tight md:text-7xl">
            Summit Roofing Co.
          </h1>
          <p className="animate-fade-up-delay-2 mt-6 max-w-xl text-lg text-stone-300 md:text-xl">
            Protecting homes from the Rockies to the plains. Licensed, insured,
            and ready before the next storm hits.
          </p>
          <div className="animate-fade-up-delay-3 mt-10 flex flex-col gap-4 sm:flex-row">
            <button
              type="button"
              className="animate-pulse-ring rounded-full bg-orange-600 px-8 py-4 text-sm font-bold uppercase tracking-wider transition hover:bg-orange-500"
            >
              Free roof inspection
            </button>
            <button
              type="button"
              className="rounded-full border border-white/30 px-8 py-4 text-sm font-bold uppercase tracking-wider backdrop-blur-sm transition hover:bg-white/10"
            >
              (303) 555-0142
            </button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <h2 className="text-3xl font-bold md:text-4xl">Built to withstand Colorado weather</h2>
            <p className="mt-4 leading-relaxed text-stone-400">
              From asphalt shingles to metal roofing, our crew delivers craftsmanship
              that lasts decades. 500+ roofs completed across the Front Range.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { n: "15+", l: "Years experience" },
              { n: "500+", l: "Roofs completed" },
              { n: "24h", l: "Emergency response" },
              { n: "5★", l: "Average rating" },
            ].map((stat) => (
              <div
                key={stat.l}
                className="rounded-2xl border border-stone-800 bg-stone-900/80 p-6 text-center transition hover:border-orange-600/50"
              >
                <p className="text-3xl font-bold text-orange-500">{stat.n}</p>
                <p className="mt-1 text-sm text-stone-400">{stat.l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <ProjectGallery
        title="Recent projects"
        subtitle="Quality roofing across Denver and the Front Range"
        dark
        images={[
          {
            src: showcaseImages.roofing.gallery[0],
            alt: "New roof installation",
            caption: "Full roof replacement — Highlands, Denver",
          },
          {
            src: showcaseImages.roofing.gallery[1],
            alt: "Modern home with new roof",
            caption: "Architectural shingles — Boulder, CO",
          },
          {
            src: showcaseImages.roofing.gallery[2],
            alt: "Storm damage repair",
            caption: "Hail damage repair — Aurora, CO",
          },
        ]}
      />

      <TeamSection
        src={showcaseImages.roofing.team}
        alt="Roofing team at work"
        dark
      >
        <h2 className="text-3xl font-bold">Meet our crew</h2>
        <p className="mt-4 leading-relaxed text-stone-400">
          Our certified roofers have completed 500+ projects across Colorado.
          Every job includes a full warranty and post-storm inspection support.
        </p>
      </TeamSection>

      <TestimonialsSection
        title="Homeowners trust Summit"
        dark
        accent="#ea580c"
        items={[
          {
            quote:
              "They replaced our entire roof in two days after hail damage. Professional, clean, and fairly priced.",
            name: "Sarah M.",
            role: "Homeowner, Denver",
          },
          {
            quote:
              "Best roofing company we've used in 20 years. The inspection report alone was worth calling them.",
            name: "James T.",
            role: "Property manager",
          },
        ]}
      />

      <section className="border-y border-stone-800 bg-stone-900/50 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-center text-3xl font-bold">Our services</h2>
          <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service, i) => (
              <li
                key={service}
                className="group flex items-center gap-4 rounded-xl border border-stone-800 bg-stone-950 p-5 transition hover:-translate-y-1 hover:border-orange-600/40"
                style={{ animationDelay: `${i * 0.08}s` }}
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-600/20 text-orange-400">
                  ✓
                </span>
                <span className="font-medium">{service}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-20 text-center">
        <h2 className="text-3xl font-bold">Don&apos;t wait for the leak</h2>
        <p className="mx-auto mt-4 max-w-lg text-stone-400">
          Schedule your free inspection today. Most quotes delivered within 24 hours.
        </p>
        <p className="mt-8 text-2xl font-bold text-orange-400">(303) 555-0142</p>
      </section>
    </div>
  );
}
