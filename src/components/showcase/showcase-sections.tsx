import Image from "next/image";
import type { ReactNode } from "react";

type ProjectGalleryProps = {
  title: string;
  subtitle?: string;
  images: { src: string; alt: string; caption: string }[];
  dark?: boolean;
};

export function ProjectGallery({ title, subtitle, images, dark = true }: ProjectGalleryProps) {
  return (
    <section className={dark ? "py-20" : "bg-white py-20"}>
      <div className="mx-auto max-w-6xl px-6">
        <h2
          className={`text-center text-3xl font-bold ${dark ? "text-white" : "text-zinc-900"}`}
        >
          {title}
        </h2>
        {subtitle && (
          <p
            className={`mx-auto mt-3 max-w-lg text-center ${dark ? "text-zinc-400" : "text-zinc-600"}`}
          >
            {subtitle}
          </p>
        )}
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {images.map((image) => (
            <figure
              key={image.src}
              className={`group overflow-hidden rounded-2xl ${dark ? "border border-white/10 bg-white/5" : "border border-zinc-200 bg-zinc-50 shadow-sm"}`}
            >
              <div className="relative h-56 overflow-hidden">
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  className="object-cover transition duration-500 group-hover:scale-110"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>
              <figcaption
                className={`p-4 text-sm font-medium ${dark ? "text-zinc-300" : "text-zinc-700"}`}
              >
                {image.caption}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

type Testimonial = { quote: string; name: string; role: string; stars?: number };

export function TestimonialsSection({
  title,
  items,
  dark = true,
  accent = "#6366f1",
}: {
  title: string;
  items: Testimonial[];
  dark?: boolean;
  accent?: string;
}) {
  return (
    <section
      className={dark ? "border-y border-white/5 bg-white/[0.02] py-20" : "bg-sky-100/50 py-20"}
    >
      <div className="mx-auto max-w-6xl px-6">
        <h2
          className={`text-center text-3xl font-bold ${dark ? "text-white" : "text-zinc-900"}`}
        >
          {title}
        </h2>
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {items.map((item) => (
            <blockquote
              key={item.name}
              className={`rounded-2xl p-8 ${dark ? "border border-white/10 bg-white/5" : "border border-sky-200 bg-white shadow-sm"}`}
            >
              <div className="flex gap-1 text-lg" style={{ color: accent }}>
                {Array.from({ length: item.stars ?? 5 }).map((_, i) => (
                  <span key={i}>★</span>
                ))}
              </div>
              <p
                className={`mt-4 leading-relaxed ${dark ? "text-zinc-300" : "text-zinc-700"}`}
              >
                &ldquo;{item.quote}&rdquo;
              </p>
              <footer className={`mt-4 text-sm font-semibold ${dark ? "text-white" : "text-zinc-900"}`}>
                {item.name}
                <span className={`ml-2 font-normal ${dark ? "text-zinc-500" : "text-zinc-500"}`}>
                  — {item.role}
                </span>
              </footer>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}

export function TeamSection({
  src,
  alt,
  dark = true,
  children,
}: {
  src: string;
  alt: string;
  dark?: boolean;
  children: ReactNode;
}) {
  return (
    <section className="py-20">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-6 md:grid-cols-2">
        <div className="relative h-80 overflow-hidden rounded-3xl md:h-96">
          <Image src={src} alt={alt} fill className="object-cover" sizes="50vw" />
        </div>
        <div className={dark ? "text-white" : "text-zinc-900"}>{children}</div>
      </div>
    </section>
  );
}
