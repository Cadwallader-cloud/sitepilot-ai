import Image from "next/image";
import { showcaseImages } from "@/lib/showcase-images";
import { ShowcaseChrome, ShowcaseMobileCTA } from "./showcase-chrome";
import { TestimonialsSection } from "./showcase-sections";

export function ConstructionShowcase() {
  return (
    <div className="min-h-screen bg-zinc-950 pb-24 text-white md:pb-0">
      <ShowcaseChrome />
      <ShowcaseMobileCTA phone="(312) 555-0199" accent="#eab308" />

      <section className="relative overflow-hidden border-b-4 border-yellow-400">
        <div className="grid min-h-[85vh] lg:grid-cols-2">
          <div className="flex flex-col justify-center bg-zinc-950 px-6 py-16 lg:px-12">
            <p className="animate-fade-up font-mono text-xs font-bold uppercase tracking-[0.4em] text-yellow-400">
              Est. 2008 · Chicago
            </p>
            <h1 className="animate-fade-up-delay-1 mt-4 text-5xl font-black uppercase leading-none tracking-tight md:text-7xl">
              Ironbridge
              <span className="block text-yellow-400">Builders</span>
            </h1>
            <p className="animate-fade-up-delay-2 mt-6 max-w-md text-zinc-400">
              Commercial framing, residential renovations, and ground-up construction.
              On schedule. On budget. No excuses.
            </p>
            <button
              type="button"
              className="animate-fade-up-delay-3 mt-10 w-fit bg-yellow-400 px-8 py-4 text-sm font-black uppercase text-zinc-950 transition hover:bg-yellow-300"
            >
              Request bid package →
            </button>
          </div>
          <div className="relative min-h-[50vh] lg:min-h-0">
            <Image
              src={showcaseImages.construction.hero}
              alt="Construction site"
              fill
              priority
              className="object-cover"
            />
            <div className="absolute inset-0 bg-yellow-400/10 mix-blend-overlay" />
          </div>
        </div>
      </section>

      <section className="grid grid-cols-2 border-b border-zinc-800 md:grid-cols-4">
        {[
          { v: "$120M+", l: "Projects delivered" },
          { v: "200+", l: "Skilled crew" },
          { v: "0", l: "OSHA violations" },
          { v: "98%", l: "On-time rate" },
        ].map((item) => (
          <div
            key={item.l}
            className="border-r border-zinc-800 p-8 text-center last:border-r-0"
          >
            <p className="text-3xl font-black text-yellow-400 md:text-4xl">{item.v}</p>
            <p className="mt-2 font-mono text-xs uppercase tracking-wider text-zinc-500">
              {item.l}
            </p>
          </div>
        ))}
      </section>

      <section className="mx-auto max-w-6xl px-6 py-20">
        <h2 className="font-mono text-sm uppercase tracking-[0.3em] text-yellow-400">
          Capabilities
        </h2>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {[
            {
              t: "Commercial",
              d: "Office build-outs, warehouses, retail shells up to 100,000 sq ft.",
              img: showcaseImages.construction.gallery[0],
            },
            {
              t: "Residential",
              d: "Custom homes, additions, and full gut renovations.",
              img: showcaseImages.construction.gallery[1],
            },
            {
              t: "Industrial",
              d: "Structural steel, concrete, and heavy civil support.",
              img: showcaseImages.construction.gallery[2],
            },
          ].map((card) => (
            <article
              key={card.t}
              className="group overflow-hidden border border-zinc-800 bg-zinc-900 transition hover:border-yellow-400/50"
            >
              <div className="relative h-48 overflow-hidden">
                <Image
                  src={card.img}
                  alt={card.t}
                  fill
                  className="object-cover transition duration-500 group-hover:scale-110"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-black uppercase">{card.t}</h3>
                <p className="mt-2 text-sm text-zinc-400">{card.d}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <TestimonialsSection
        title="Clients across Chicago trust us"
        dark
        accent="#eab308"
        items={[
          {
            quote:
              "Ironbridge delivered our warehouse expansion 2 weeks ahead of schedule. Zero change orders.",
            name: "Michael P.",
            role: "Operations director",
          },
          {
            quote:
              "From bid to final walkthrough, the communication was excellent. We'll hire them again.",
            name: "Lisa C.",
            role: "General contractor",
          },
        ]}
      />

      <section className="bg-yellow-400 px-6 py-16 text-center text-zinc-950">
        <h2 className="text-3xl font-black uppercase">Let&apos;s build something solid</h2>
        <p className="mt-4 font-medium">(312) 555-0199 · bids@ironbridge.com</p>
      </section>
    </div>
  );
}
