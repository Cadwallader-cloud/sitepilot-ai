import { brand } from "@/lib/brand";
import type { GeneratedSite } from "@/lib/site-types";
import { getBusinessName } from "@/lib/site-types";
import Image from "next/image";

type PublishedWebsiteProps = {
  site: GeneratedSite;
};

/** Public live website — no editor chrome */
export function PublishedWebsite({ site }: PublishedWebsiteProps) {
  const theme = site.theme;
  const businessName = getBusinessName(site);
  const gallery = site.images.gallery.length
    ? site.images.gallery
    : [site.images.hero];
  const trustItems = site.services.slice(0, 4).map((s) => s.title);

  return (
    <div className="min-h-screen bg-white text-zinc-900">
      <header className="flex items-center justify-between px-5 py-4 sm:px-8 lg:px-12">
        <div>
          <p className="font-bold" style={{ color: theme.primary }}>
            {businessName}
          </p>
          <p className="text-[11px] uppercase tracking-wide text-zinc-500">
            {site.contact.address}
          </p>
        </div>
        <a
          href={`tel:${site.contact.phone.replace(/\s/g, "")}`}
          className="rounded-full px-4 py-2 text-sm font-semibold text-white"
          style={{ backgroundColor: theme.primary }}
        >
          Call now
        </a>
      </header>

      <section className="relative min-h-[420px] overflow-hidden sm:min-h-[520px]">
        <Image
          src={site.images.hero}
          alt={site.hero.title}
          fill
          className="object-cover"
          sizes="100vw"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/50 to-black/30" />
        <div className="relative z-10 flex min-h-[420px] flex-col justify-end px-5 py-12 text-white sm:min-h-[520px] sm:px-10 lg:px-16">
          <p className="text-xs font-semibold uppercase tracking-wider text-white/80">
            {site.contact.address}
          </p>
          <h1 className="mt-2 max-w-3xl text-4xl font-bold leading-tight sm:text-5xl">
            {site.hero.title}
          </h1>
          <p className="mt-4 max-w-xl text-base text-white/90 sm:text-lg">
            {site.hero.subtitle}
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <a
              href={`tel:${site.contact.phone.replace(/\s/g, "")}`}
              className="rounded-full bg-white px-7 py-3 text-sm font-semibold"
              style={{ color: theme.primary }}
            >
              {site.hero.cta}
            </a>
            <span className="text-sm font-medium">{site.contact.phone}</span>
          </div>
        </div>
      </section>

      {trustItems.length > 0 && (
        <section className="grid gap-3 border-b border-zinc-100 bg-zinc-50 px-5 py-6 sm:grid-cols-2 sm:px-8 lg:grid-cols-4 lg:px-12">
          {trustItems.map((item) => (
            <div
              key={item}
              className="rounded-xl bg-white px-4 py-3 text-center text-sm font-medium text-zinc-700 shadow-sm"
            >
              {item}
            </div>
          ))}
        </section>
      )}

      <section className="grid gap-8 px-5 py-14 sm:px-8 lg:grid-cols-2 lg:items-center lg:px-12">
        <div>
          <h2 className="text-3xl font-bold">{site.about.title}</h2>
          <p className="mt-4 text-base leading-relaxed text-zinc-600">
            {site.about.text}
          </p>
        </div>
        <div className="relative h-64 overflow-hidden rounded-2xl sm:h-72">
          <Image
            src={gallery[0]}
            alt={site.about.title}
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
        </div>
      </section>

      <section className="border-t border-zinc-100 bg-zinc-50 px-5 py-14 sm:px-8 lg:px-12">
        <h2 className="text-3xl font-bold">Services</h2>
        <p className="mt-2 text-sm text-zinc-600">
          Professional services across {site.contact.address}
        </p>
        <ul className="mt-8 grid gap-4 sm:grid-cols-2">
          {site.services.map((service) => (
            <li
              key={service.title}
              className="rounded-xl border border-zinc-100 bg-white px-5 py-4"
            >
              <p className="font-semibold" style={{ color: theme.primary }}>
                {service.title}
              </p>
              <p className="mt-2 text-sm text-zinc-600">{service.description}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="px-5 py-14 sm:px-8 lg:px-12">
        <h2 className="text-3xl font-bold">Our work</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {gallery.slice(0, 3).map((src, i) => (
            <div
              key={`${src}-${i}`}
              className="relative h-48 overflow-hidden rounded-xl"
            >
              <Image
                src={src}
                alt={`Project ${i + 1}`}
                fill
                className="object-cover"
                sizes="33vw"
              />
            </div>
          ))}
        </div>
      </section>

      {site.testimonials.length > 0 && (
        <section className="border-t border-zinc-100 bg-zinc-50 px-5 py-14 sm:px-8 lg:px-12">
          <h2 className="text-3xl font-bold">Reviews</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {site.testimonials.map((t) => (
              <blockquote
                key={`${t.name}-${t.text.slice(0, 16)}`}
                className="rounded-2xl border border-zinc-100 bg-white p-6 shadow-sm"
              >
                {t.demo && (
                  <span className="mb-3 inline-block rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-800">
                    Demo review
                  </span>
                )}
                <p className="text-sm leading-relaxed text-zinc-700">
                  “{t.text}”
                </p>
                <footer className="mt-4 text-xs font-semibold text-zinc-900">
                  {t.name}
                </footer>
              </blockquote>
            ))}
          </div>
        </section>
      )}

      {site.faq.length > 0 && (
        <section className="px-5 py-14 sm:px-8 lg:px-12">
          <h2 className="text-3xl font-bold">FAQ</h2>
          <div className="mt-8 space-y-3">
            {site.faq.map((item) => (
              <details
                key={item.question}
                className="rounded-xl border border-zinc-100 bg-zinc-50 px-5 py-4"
              >
                <summary className="cursor-pointer list-none font-semibold">
                  {item.question}
                </summary>
                <p className="mt-2 text-sm leading-relaxed text-zinc-600">
                  {item.answer}
                </p>
              </details>
            ))}
          </div>
        </section>
      )}

      <section
        className="px-5 py-16 text-center text-white sm:px-8"
        style={{
          background: `linear-gradient(135deg, ${theme.primary}, ${theme.accent})`,
        }}
      >
        <h2 className="text-3xl font-bold sm:text-4xl">{site.hero.cta}</h2>
        <p className="mx-auto mt-3 max-w-md text-sm opacity-90">
          {site.seo.description}
        </p>
        <div className="mt-6 space-y-1">
          <p className="text-2xl font-bold">{site.contact.phone}</p>
          <p className="text-sm opacity-90">{site.contact.email}</p>
          <p className="text-sm opacity-80">{site.contact.address}</p>
        </div>
        <a
          href={`tel:${site.contact.phone.replace(/\s/g, "")}`}
          className="mt-8 inline-block rounded-full bg-white px-7 py-3 text-sm font-semibold"
          style={{ color: theme.primary }}
        >
          {site.hero.cta}
        </a>
      </section>

      <footer className="px-5 py-6 text-center text-xs text-zinc-400">
        © {new Date().getFullYear()} {businessName}. Built with {brand.name}.
      </footer>
    </div>
  );
}
