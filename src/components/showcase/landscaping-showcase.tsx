import Image from "next/image";
import { showcaseImages } from "@/lib/showcase-images";
import { ShowcaseChrome, ShowcaseMobileCTA } from "./showcase-chrome";
import { ProjectGallery, TestimonialsSection } from "./showcase-sections";

export function LandscapingShowcase() {
  return (
    <div className="min-h-screen bg-emerald-950 pb-24 text-white md:pb-0">
      <ShowcaseChrome />
      <ShowcaseMobileCTA phone="(503) 555-0167" accent="#16a34a" />

      <section className="relative min-h-[88vh] overflow-hidden">
        <Image
          src={showcaseImages.landscaping.hero}
          alt="Beautiful landscaped garden"
          fill
          priority
          className="object-cover animate-ken-burns"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-950/60 via-emerald-950/40 to-emerald-950" />

        <div className="relative mx-auto flex min-h-[88vh] max-w-6xl flex-col items-center justify-center px-6 text-center">
          <div className="animate-fade-up rounded-full border border-emerald-400/40 bg-emerald-900/60 px-5 py-2 text-sm backdrop-blur-sm">
            🌿 Portland · Since 2012
          </div>
          <h1 className="animate-fade-up-delay-1 mt-6 font-serif text-5xl font-light italic md:text-7xl">
            Verdant Landscapes
          </h1>
          <p className="animate-fade-up-delay-2 mt-6 max-w-xl text-lg text-emerald-100/90">
            Outdoor spaces that breathe life into your property — from manicured
            lawns to native garden sanctuaries.
          </p>
          <button
            type="button"
            className="animate-fade-up-delay-3 mt-10 rounded-full bg-emerald-500 px-10 py-4 text-sm font-semibold text-white shadow-lg shadow-emerald-900/50 transition hover:bg-emerald-400"
          >
            Book a garden consultation
          </button>
        </div>

        <div className="absolute -bottom-1 left-0 right-0">
          <svg viewBox="0 0 1440 80" className="w-full fill-emerald-950">
            <path d="M0,40 C360,100 720,0 1440,50 L1440,80 L0,80 Z" />
          </svg>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="grid gap-8 md:grid-cols-3">
          {[
            {
              icon: "🌱",
              t: "Lawn care",
              d: "Weekly mowing, fertilization, aeration, and seasonal overseeding.",
            },
            {
              icon: "🪴",
              t: "Garden design",
              d: "Custom planting plans with drought-tolerant and native species.",
            },
            {
              icon: "💧",
              t: "Irrigation",
              d: "Smart sprinkler systems, drip lines, and water-efficient upgrades.",
            },
          ].map((item) => (
            <div
              key={item.t}
              className="rounded-3xl border border-emerald-800/60 bg-emerald-900/30 p-8 text-center transition hover:-translate-y-2 hover:bg-emerald-900/50"
            >
              <span className="text-4xl">{item.icon}</span>
              <h3 className="mt-4 text-xl font-semibold">{item.t}</h3>
              <p className="mt-3 text-sm leading-relaxed text-emerald-200/70">{item.d}</p>
            </div>
          ))}
        </div>
      </section>

      <ProjectGallery
        title="Garden transformations"
        subtitle="Before & after projects across Portland"
        dark
        images={[
          {
            src: showcaseImages.landscaping.gallery[0],
            alt: "Lush garden",
            caption: "Native garden design — Pearl District",
          },
          {
            src: showcaseImages.landscaping.gallery[1],
            alt: "Landscaped backyard",
            caption: "Backyard oasis — Lake Oswego",
          },
          {
            src: showcaseImages.landscaping.gallery[2],
            alt: "Modern lawn",
            caption: "Commercial grounds — Downtown Portland",
          },
        ]}
      />

      <TestimonialsSection
        title="Clients love their new gardens"
        dark
        accent="#16a34a"
        items={[
          {
            quote:
              "They transformed our dead lawn into the best yard on the block. Worth every penny.",
            name: "Emily K.",
            role: "Homeowner, Portland",
          },
          {
            quote:
              "Professional, eco-conscious, and always on schedule. We use them for all our properties.",
            name: "Robert H.",
            role: "Property developer",
          },
        ]}
      />

      <section className="bg-emerald-900/40 py-20">
        <div className="mx-auto grid max-w-6xl gap-8 px-6 md:grid-cols-2 md:items-center">
          <div className="relative h-80 overflow-hidden rounded-3xl md:h-96">
            <Image
              src={showcaseImages.landscaping.gallery[0]}
              alt="Landscaping project"
              fill
              className="object-cover"
            />
          </div>
          <div>
            <h2 className="text-3xl font-serif italic">Transform your outdoor living</h2>
            <p className="mt-4 leading-relaxed text-emerald-200/80">
              We&apos;ve designed and maintained over 800 residential and commercial
              properties across the Pacific Northwest. Every project starts with
              listening to how you want to use your space.
            </p>
            <ul className="mt-6 space-y-2 text-emerald-100">
              <li>✓ Free on-site assessment</li>
              <li>✓ Eco-friendly practices</li>
              <li>✓ Year-round maintenance plans</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="px-6 py-16 text-center">
        <p className="text-2xl font-serif italic text-emerald-300">(503) 555-0167</p>
        <p className="mt-2 text-emerald-400/70">hello@verdantlandscapes.com</p>
      </section>
    </div>
  );
}
