/** Demo images — local files load reliably; remote only as fallback */
export const showcaseImages = {
  roofing: {
    hero: "/demos/roofing.jpg",
    gallery: [
      "/demos/roofing.jpg",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80",
    ],
    team: "/demos/construction.jpg",
  },
  construction: {
    hero: "/demos/construction.jpg",
    gallery: [
      "/demos/construction.jpg",
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=800&q=80",
    ],
  },
  landscaping: {
    hero: "/demos/landscaping.jpg",
    gallery: [
      "/demos/landscaping.jpg",
      "https://picsum.photos/id/29/800/600",
      "https://picsum.photos/id/37/800/600",
    ],
  },
  electrician: {
    hero: "/demos/electrician.jpg",
    gallery: [
      "/demos/electrician.jpg",
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=800&q=80",
      "/demos/electrician-ev.jpg",
    ],
  },
  plumbing: {
    hero: "/demos/plumbing.jpg",
    gallery: [
      "/demos/plumbing.jpg",
      "/demos/plumbing-bathroom.jpg",
      "/demos/plumbing-heater.jpg",
    ],
    team: "/demos/plumbing.jpg",
  },
} as const;
