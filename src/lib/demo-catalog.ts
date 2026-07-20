import { showcaseImages } from "@/lib/showcase-images";

export type DemoLayout = "fullBleed" | "splitLight" | "darkTech";

export type DemoSite = {
  slug: string;
  name: string;
  trade: string;
  location: string;
  tagline: string;
  description: string;
  accent: string;
  layout: DemoLayout;
  phone: string;
  email: string;
  heroImage: string;
  aboutTitle: string;
  aboutText: string;
  cta: string;
  services: string[];
  stats: { n: string; l: string }[];
  gallery: { src: string; alt: string; caption: string }[];
  testimonials: { quote: string; name: string; role: string }[];
  /** Uses a handcrafted showcase component instead of the template */
  flagship?: boolean;
};

const u = (id: string, w = 1600) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;

function gallery(
  images: [string, string, string],
  captions: [string, string, string],
) {
  return images.map((src, i) => ({
    src,
    alt: captions[i],
    caption: captions[i],
  }));
}

/** 25+ free demos across local-business niches */
export const demoCatalog: DemoSite[] = [
  // —— Roofing (3) ——
  {
    slug: "roofing",
    name: "Summit Roofing Co.",
    trade: "Roofing",
    location: "Denver, CO",
    tagline: "Protecting homes from the Rockies to the plains",
    description: "Bold hero imagery, copper accents, storm-damage focus",
    accent: "#c2410c",
    layout: "fullBleed",
    phone: "(303) 555-0142",
    email: "hello@summitroofing.demo",
    heroImage: showcaseImages.roofing.hero,
    aboutTitle: "Built for Colorado weather",
    aboutText:
      "From asphalt shingles to metal roofing, our crew delivers craftsmanship that lasts decades across the Front Range.",
    cta: "Free roof inspection",
    services: [
      "Roof replacement & installation",
      "Storm & hail damage repair",
      "Emergency leak response",
      "Gutter systems & drainage",
      "Free roof inspections",
    ],
    stats: [
      { n: "15+", l: "Years experience" },
      { n: "500+", l: "Roofs completed" },
      { n: "24h", l: "Emergency response" },
      { n: "5★", l: "Average rating" },
    ],
    gallery: gallery(
      [
        showcaseImages.roofing.gallery[0],
        showcaseImages.roofing.gallery[1],
        showcaseImages.roofing.gallery[2],
      ],
      ["Full roof replacement", "Storm repair", "Metal roofing install"],
    ),
    testimonials: [
      {
        quote: "They replaced our roof after hail — fast, clean, fair price.",
        name: "Megan R.",
        role: "Homeowner, Aurora",
      },
      {
        quote: "Insurance paperwork handled end to end. Highly recommend.",
        name: "Chris T.",
        role: "Homeowner, Boulder",
      },
    ],
    flagship: true,
  },
  {
    slug: "apex-roofing-dallas",
    name: "Apex Shield Roofing",
    trade: "Roofing",
    location: "Dallas, TX",
    tagline: "Storm-ready roofs for North Texas heat",
    description: "Texas storm specialists with same-week estimates",
    accent: "#b45309",
    layout: "fullBleed",
    phone: "(214) 555-0198",
    email: "jobs@apexshield.demo",
    heroImage: u("photo-1632759145351-1d592919f522"),
    aboutTitle: "Hail season? We're already on it.",
    aboutText:
      "Local crews, manufacturer warranties, and clear timelines — so your home stays dry through the next Texas storm.",
    cta: "Get a free estimate",
    services: [
      "Composition shingle roofs",
      "Hail & wind damage",
      "Flat commercial roofs",
      "Insurance claim support",
      "Ventilation upgrades",
    ],
    stats: [
      { n: "12+", l: "Years in DFW" },
      { n: "800+", l: "Homes protected" },
      { n: "48h", l: "Typical start" },
      { n: "A+", l: "BBB rating" },
    ],
    gallery: gallery(
      [
        u("photo-1600585154340-be6161a56a0c", 800),
        u("photo-1560518883-ce09059eeffa", 800),
        u("photo-1503387762-592deb58ef4e", 800),
      ],
      ["Shingle replacement", "Commercial flat roof", "Inspection day"],
    ),
    testimonials: [
      {
        quote: "Transparent quote, finished before the weekend storm.",
        name: "Luis M.",
        role: "Homeowner, Plano",
      },
      {
        quote: "Best roofing experience we've had in 20 years.",
        name: "Dana K.",
        role: "Homeowner, Frisco",
      },
    ],
  },
  {
    slug: "harbor-roofing-seattle",
    name: "Harborline Roofing",
    trade: "Roofing",
    location: "Seattle, WA",
    tagline: "Rain-ready roofs for the Pacific Northwest",
    description: "Moss-resistant systems and leak specialists",
    accent: "#0f766e",
    layout: "splitLight",
    phone: "(206) 555-0174",
    email: "crew@harborline.demo",
    heroImage: u("photo-1600585154340-be6161a56a0c"),
    aboutTitle: "Built for wet winters",
    aboutText:
      "We specialize in leak tracing, cedar & composite installs, and ventilation that stops moss before it starts.",
    cta: "Book a roof check",
    services: [
      "Leak detection & repair",
      "Moss treatment systems",
      "Cedar & composite installs",
      "Skylight flashing",
      "Annual maintenance plans",
    ],
    stats: [
      { n: "18+", l: "Years local" },
      { n: "1.2k", l: "Jobs completed" },
      { n: "Same day", l: "Leak visits" },
      { n: "4.9★", l: "Google rating" },
    ],
    gallery: gallery(
      [
        u("photo-1560518883-ce09059eeffa", 800),
        u("photo-1503387762-592deb58ef4e", 800),
        u("photo-1632759145351-1d592919f522", 800),
      ],
      ["Northwest install", "Flashing detail", "After-storm repair"],
    ),
    testimonials: [
      {
        quote: "Found a leak others missed. House finally stayed dry.",
        name: "Priya S.",
        role: "Homeowner, Bellevue",
      },
      {
        quote: "Professional crew, tidy site every day.",
        name: "Owen L.",
        role: "Homeowner, Tacoma",
      },
    ],
  },

  // —— Plumbing (3) ——
  {
    slug: "plumbing",
    name: "FlowMaster Plumbing",
    trade: "Plumbing",
    location: "Miami, FL",
    tagline: "Fast fixes. Fair prices. Available around the clock.",
    description: "Clean aqua-white UI with emergency CTA",
    accent: "#0284c7",
    layout: "splitLight",
    phone: "(305) 555-0171",
    email: "help@flowmaster.demo",
    heroImage: showcaseImages.plumbing.hero,
    aboutTitle: "Miami's on-call plumbers",
    aboutText:
      "From burst pipes to full bathroom remodels — upfront pricing and guaranteed workmanship.",
    cta: "Call for emergency help",
    services: [
      "Emergency leak repair",
      "Water heater install",
      "Drain cleaning",
      "Bathroom remodeling",
      "Sewer line inspection",
    ],
    stats: [
      { n: "24/7", l: "Emergency line" },
      { n: "10k+", l: "Jobs done" },
      { n: "45m", l: "Avg arrival" },
      { n: "5★", l: "Customer score" },
    ],
    gallery: gallery(
      [
        showcaseImages.plumbing.gallery[0],
        showcaseImages.plumbing.gallery[1],
        showcaseImages.plumbing.gallery[2],
      ],
      ["Bathroom remodel", "Water heater swap", "Drain clearing"],
    ),
    testimonials: [
      {
        quote: "Arrived in under an hour for a midnight leak.",
        name: "Carla V.",
        role: "Homeowner, Coral Gables",
      },
      {
        quote: "No surprise fees. Exactly what they quoted.",
        name: "James P.",
        role: "Property manager",
      },
    ],
    flagship: true,
  },
  {
    slug: "pipewright-chicago",
    name: "Pipewright Pros",
    trade: "Plumbing",
    location: "Chicago, IL",
    tagline: "Honest plumbing for city apartments & suburbs",
    description: "Hydro-jetting and boiler specialists",
    accent: "#0369a1",
    layout: "fullBleed",
    phone: "(312) 555-0133",
    email: "desk@Pipewright.demo",
    heroImage: u("photo-1585704032915-c3400ca199e7"),
    aboutTitle: "Chicago winters won't wait",
    aboutText:
      "Boiler tune-ups, frozen pipe rescue, and camera inspections for older buildings — licensed & bonded.",
    cta: "Schedule service",
    services: [
      "Boiler & radiator service",
      "Frozen pipe thawing",
      "Hydro-jet drain cleaning",
      "Camera inspections",
      "Fixture installs",
    ],
    stats: [
      { n: "20+", l: "Years" },
      { n: "Union", l: "Trained techs" },
      { n: "Same day", l: "Slots" },
      { n: "Licensed", l: "& insured" },
    ],
    gallery: gallery(
      [
        u("photo-1607472586893-edb57bdc0e39", 800),
        u("photo-1584622650111-993a426fbf0a", 800),
        u("photo-1558618666-fcd25c85cd64", 800),
      ],
      ["Boiler service", "Kitchen install", "Camera inspection"],
    ),
    testimonials: [
      {
        quote: "Saved our building from a frozen riser disaster.",
        name: "Nora H.",
        role: "Condo board",
      },
      {
        quote: "Clear communication from dispatch to finish.",
        name: "Brett A.",
        role: "Homeowner, Evanston",
      },
    ],
  },
  {
    slug: "clearflow-phoenix",
    name: "ClearFlow Plumbing",
    trade: "Plumbing",
    location: "Phoenix, AZ",
    tagline: "Desert-ready plumbing without the drama",
    description: "Water heaters, soft water, trenchless options",
    accent: "#0891b2",
    layout: "darkTech",
    phone: "(480) 555-0160",
    email: "hello@clearflow.demo",
    heroImage: u("photo-1607472586893-edb57bdc0e39"),
    aboutTitle: "Cool water. Hot service.",
    aboutText:
      "Tankless upgrades, soft-water systems, and trenchless repairs built for Arizona heat and hard water.",
    cta: "Request a quote",
    services: [
      "Tankless water heaters",
      "Water softener install",
      "Trenchless sewer repair",
      "Garbage disposal service",
      "New construction rough-in",
    ],
    stats: [
      { n: "9+", l: "Years AZ" },
      { n: "Flat", l: "Rate options" },
      { n: "Warranty", l: "On parts" },
      { n: "4.9★", l: "Reviews" },
    ],
    gallery: gallery(
      [
        u("photo-1584622650111-993a426fbf0a", 800),
        u("photo-1556912173-46c336c7fd55", 800),
        u("photo-1507652313519-d4e9174996dd", 800),
      ],
      ["Tankless install", "Kitchen plumbing", "Softener setup"],
    ),
    testimonials: [
      {
        quote: "Tankless install done in one day. Huge upgrade.",
        name: "Amir J.",
        role: "Homeowner, Scottsdale",
      },
      {
        quote: "Explained hard-water options without upselling junk.",
        name: "Kelly R.",
        role: "Homeowner, Tempe",
      },
    ],
  },

  // —— Electrician (3) ——
  {
    slug: "electrician",
    name: "VoltPro Electric",
    trade: "Electrician",
    location: "Austin, TX",
    tagline: "Powering homes & businesses safely — 24/7",
    description: "Dark neon theme, tech-forward cards",
    accent: "#0ea5e9",
    layout: "darkTech",
    phone: "(512) 555-0188",
    email: "jobs@voltpro.demo",
    heroImage: showcaseImages.electrician.hero,
    aboutTitle: "Licensed master electricians",
    aboutText:
      "Panel upgrades, EV chargers, rewiring, and commercial lighting — inspected and code-compliant.",
    cta: "Book an electrician",
    services: [
      "Panel upgrades",
      "EV charger install",
      "Whole-home rewiring",
      "Commercial lighting",
      "Generator hookups",
    ],
    stats: [
      { n: "24/7", l: "Emergency" },
      { n: "Master", l: "Licensed" },
      { n: "EV", l: "Charger pros" },
      { n: "5★", l: "Rated" },
    ],
    gallery: gallery(
      [
        showcaseImages.electrician.gallery[0],
        showcaseImages.electrician.gallery[1],
        showcaseImages.electrician.gallery[2],
      ],
      ["Panel upgrade", "Commercial lighting", "EV charger"],
    ),
    testimonials: [
      {
        quote: "EV charger install was clean and fast.",
        name: "Tyler N.",
        role: "Homeowner, Round Rock",
      },
      {
        quote: "They diagnosed a panel issue others missed.",
        name: "Sofia G.",
        role: "Cafe owner",
      },
    ],
    flagship: true,
  },
  {
    slug: "brightline-electric-boston",
    name: "Brightline Electric",
    trade: "Electrician",
    location: "Boston, MA",
    tagline: "Safe power for historic homes & new builds",
    description: "Knob-and-tube replacement specialists",
    accent: "#2563eb",
    layout: "splitLight",
    phone: "(617) 555-0144",
    email: "office@brightline.demo",
    heroImage: u("photo-1621905251189-08b45d6a269e"),
    aboutTitle: "Old wiring. Modern safety.",
    aboutText:
      "We modernize Boston brownstones without wrecking the character — permits, inspections, done right.",
    cta: "Free safety check",
    services: [
      "Knob-and-tube replacement",
      "Service upgrades",
      "Smart home wiring",
      "Outdoor lighting",
      "Code corrections",
    ],
    stats: [
      { n: "14+", l: "Years" },
      { n: "Permit", l: "Ready" },
      { n: "Insured", l: "Fully" },
      { n: "4.9★", l: "Reviews" },
    ],
    gallery: gallery(
      [
        u("photo-1558618666-fcd25c85cd64", 800),
        u("photo-1504328345606-18bbc8c9d7d1", 800),
        u("photo-1621905252507-b35492cc74b4", 800),
      ],
      ["Service upgrade", "Lighting design", "Safety inspection"],
    ),
    testimonials: [
      {
        quote: "Handled our 1920s home rewire with care.",
        name: "Helen W.",
        role: "Homeowner, Cambridge",
      },
      {
        quote: "Inspector signed off first visit.",
        name: "Marcus D.",
        role: "General contractor",
      },
    ],
  },
  {
    slug: "spark-city-electric-nyc",
    name: "Spark City Electric",
    trade: "Electrician",
    location: "Brooklyn, NY",
    tagline: "Commercial & residential power that just works",
    description: "Retail fit-outs and apartment upgrades",
    accent: "#f59e0b",
    layout: "fullBleed",
    phone: "(718) 555-0190",
    email: "dispatch@sparkcity.demo",
    heroImage: u("photo-1504328345606-18bbc8c9d7d1"),
    aboutTitle: "NYC pace. Code-perfect installs.",
    aboutText:
      "From bodega lighting to loft panel upgrades — union-trained techs who show up on time.",
    cta: "Get a site visit",
    services: [
      "Retail electrical fit-out",
      "Apartment panel upgrades",
      "Emergency troubleshooting",
      "LED conversions",
      "Data & low-voltage",
    ],
    stats: [
      { n: "Citywide", l: "Coverage" },
      { n: "Night", l: "Work OK" },
      { n: "COI", l: "On request" },
      { n: "Same week", l: "Starts" },
    ],
    gallery: gallery(
      [
        u("photo-1621905252507-b35492cc74b4", 800),
        u("photo-1558618666-fcd25c85cd64", 800),
        u("photo-1497366216548-37526070297c", 800),
      ],
      ["Retail lighting", "Panel work", "Office fit-out"],
    ),
    testimonials: [
      {
        quote: "Night install for our shop — zero downtime.",
        name: "Ivy C.",
        role: "Boutique owner",
      },
      {
        quote: "Clear permit path for our loft renovation.",
        name: "Greg F.",
        role: "Homeowner, Williamsburg",
      },
    ],
  },

  // —— HVAC (3) ——
  {
    slug: "climate-pro-hvac-atlanta",
    name: "ClimatePro HVAC",
    trade: "HVAC",
    location: "Atlanta, GA",
    tagline: "Comfort that holds through Georgia summers",
    description: "AC install, maintenance plans, indoor air quality",
    accent: "#0284c7",
    layout: "splitLight",
    phone: "(404) 555-0122",
    email: "service@climatepro.demo",
    heroImage: u("photo-1504328345606-18bbc8c9d7d1"),
    aboutTitle: "Cool homes. Honest diagnostics.",
    aboutText:
      "We size systems properly, seal ducts, and offer maintenance plans so you're not guessing when humidity spikes.",
    cta: "Book a comfort check",
    services: [
      "AC install & replacement",
      "Furnace service",
      "Duct sealing",
      "Indoor air quality",
      "Maintenance memberships",
    ],
    stats: [
      { n: "11+", l: "Years" },
      { n: "NATE", l: "Certified" },
      { n: "Financing", l: "Available" },
      { n: "Same day", l: "Diagnose" },
    ],
    gallery: gallery(
      [
        u("photo-1486406146926-c627a92ad1ab", 800),
        u("photo-1541888946425-d81bb19240f5", 800),
        u("photo-1621905252507-b35492cc74b4", 800),
      ],
      ["Outdoor condenser", "Duct work", "Thermostat setup"],
    ),
    testimonials: [
      {
        quote: "Our upstairs finally cools evenly.",
        name: "Anita B.",
        role: "Homeowner, Decatur",
      },
      {
        quote: "Membership plan already paid for itself.",
        name: "Ron S.",
        role: "Homeowner, Marietta",
      },
    ],
  },
  {
    slug: "northwind-hvac-minneapolis",
    name: "Northwind Comfort",
    trade: "HVAC",
    location: "Minneapolis, MN",
    tagline: "Heat that works when it's -20°",
    description: "Furnaces, heat pumps, emergency heat",
    accent: "#1d4ed8",
    layout: "fullBleed",
    phone: "(612) 555-0155",
    email: "warm@northwind.demo",
    heroImage: u("photo-1486406146926-c627a92ad1ab"),
    aboutTitle: "Winter is our busy season — on purpose.",
    aboutText:
      "High-efficiency furnaces, cold-climate heat pumps, and emergency heat calls answered by real locals.",
    cta: "Schedule heating service",
    services: [
      "Furnace install",
      "Cold-climate heat pumps",
      "Emergency no-heat calls",
      "Humidifier & filtration",
      "Energy audits",
    ],
    stats: [
      { n: "16+", l: "Winters" },
      { n: "24/7", l: "No-heat line" },
      { n: "High-eff", l: "Systems" },
      { n: "5★", l: "Rated" },
    ],
    gallery: gallery(
      [
        u("photo-1504328345606-18bbc8c9d7d1", 800),
        u("photo-1541888946425-d81bb19240f5", 800),
        u("photo-1581094794329-c8112a89af12", 800),
      ],
      ["Furnace room", "Heat pump", "Filter upgrade"],
    ),
    testimonials: [
      {
        quote: "Midnight no-heat call — fixed before sunrise.",
        name: "Erik J.",
        role: "Homeowner, St. Paul",
      },
      {
        quote: "Explained heat pump vs furnace without pressure.",
        name: "Mina L.",
        role: "Homeowner, Edina",
      },
    ],
  },
  {
    slug: "airwell-hvac-houston",
    name: "AirWell Systems",
    trade: "HVAC",
    location: "Houston, TX",
    tagline: "Humidity control for Gulf Coast living",
    description: "Commercial & residential air systems",
    accent: "#0e7490",
    layout: "darkTech",
    phone: "(713) 555-0181",
    email: "cool@airwell.demo",
    heroImage: u("photo-1541888946425-d81bb19240f5"),
    aboutTitle: "Beat the Houston humidity",
    aboutText:
      "Proper tonnage, dehumidification, and commercial rooftop units kept running through peak season.",
    cta: "Request service",
    services: [
      "Residential AC",
      "Commercial RTUs",
      "Dehumidification",
      "Preventive maintenance",
      "Smart thermostats",
    ],
    stats: [
      { n: "Gulf", l: "Climate pros" },
      { n: "Commercial", l: "Ready" },
      { n: "Maintenance", l: "Plans" },
      { n: "4.8★", l: "Reviews" },
    ],
    gallery: gallery(
      [
        u("photo-1486406146926-c627a92ad1ab", 800),
        u("photo-1497366216548-37526070297c", 800),
        u("photo-1504328345606-18bbc8c9d7d1", 800),
      ],
      ["Rooftop unit", "Office climate", "Home system"],
    ),
    testimonials: [
      {
        quote: "Restaurant kitchen finally comfortable.",
        name: "Chef Diego",
        role: "Restaurant owner",
      },
      {
        quote: "Maintenance visits are on time every quarter.",
        name: "Paula M.",
        role: "Office manager",
      },
    ],
  },

  // —— Landscaping (3) ——
  {
    slug: "landscaping",
    name: "Verdant Landscapes",
    trade: "Landscaping",
    location: "Portland, OR",
    tagline: "Outdoor spaces that breathe life into your property",
    description: "Organic greens, garden gallery feel",
    accent: "#16a34a",
    layout: "fullBleed",
    phone: "(503) 555-0166",
    email: "grow@verdant.demo",
    heroImage: showcaseImages.landscaping.hero,
    aboutTitle: "Design. Plant. Maintain.",
    aboutText:
      "Native plantings, outdoor lighting, and irrigation that respects Pacific Northwest seasons.",
    cta: "Start a landscape plan",
    services: [
      "Garden design",
      "Hardscaping",
      "Irrigation",
      "Seasonal maintenance",
      "Outdoor lighting",
    ],
    stats: [
      { n: "Native", l: "Plant focus" },
      { n: "Design", l: "Build" },
      { n: "Weekly", l: "Care plans" },
      { n: "5★", l: "Rated" },
    ],
    gallery: gallery(
      [
        showcaseImages.landscaping.gallery[0],
        showcaseImages.landscaping.gallery[1],
        showcaseImages.landscaping.gallery[2],
      ],
      ["Backyard transform", "Hardscape patio", "Garden beds"],
    ),
    testimonials: [
      {
        quote: "Our yard finally matches the house.",
        name: "Riley P.",
        role: "Homeowner, Sellwood",
      },
      {
        quote: "Maintenance crew is consistent and careful.",
        name: "Jordan K.",
        role: "Homeowner, Beaverton",
      },
    ],
    flagship: true,
  },
  {
    slug: "stonepath-landscapes-austin",
    name: "Stonepath Outdoor",
    trade: "Landscaping",
    location: "Austin, TX",
    tagline: "Drought-smart yards that still look lush",
    description: "Xeriscape and patio builders",
    accent: "#15803d",
    layout: "splitLight",
    phone: "(512) 555-0112",
    email: "hello@stonepath.demo",
    heroImage: u("photo-1558904541-efa843a96f01"),
    aboutTitle: "Less water. More wow.",
    aboutText:
      "Xeriscape design, flagstone patios, and drip irrigation built for Central Texas summers.",
    cta: "Book a yard consult",
    services: [
      "Xeriscape design",
      "Patios & fire pits",
      "Drip irrigation",
      "Tree & shrub install",
      "HOA-friendly plans",
    ],
    stats: [
      { n: "Water", l: "Wise" },
      { n: "Custom", l: "Hardscape" },
      { n: "HOA", l: "Packets" },
      { n: "4.9★", l: "Reviews" },
    ],
    gallery: gallery(
      [
        u("photo-1416879595882-3373a0480b5b", 800),
        u("photo-1557429287-b2e26467fc2b", 800),
        u("photo-1466692476866-aef1dfb1e735", 800),
      ],
      ["Xeriscape front", "Patio night", "Garden path"],
    ),
    testimonials: [
      {
        quote: "Water bill dropped and yard looks better.",
        name: "Samir A.",
        role: "Homeowner, Cedar Park",
      },
      {
        quote: "HOA approved the plan on first submit.",
        name: "Laura B.",
        role: "Homeowner, Round Rock",
      },
    ],
  },
  {
    slug: "greenline-care-charlotte",
    name: "Greenline Care",
    trade: "Landscaping",
    location: "Charlotte, NC",
    tagline: "Weekly lawn care that looks premium",
    description: "Commercial & residential groundskeeping",
    accent: "#166534",
    layout: "darkTech",
    phone: "(704) 555-0177",
    email: "crew@greenline.demo",
    heroImage: u("photo-1416879595882-3373a0480b5b"),
    aboutTitle: "Curb appeal on autopilot",
    aboutText:
      "Mowing, seasonal color, and commercial grounds programs with photo reports after every visit.",
    cta: "Get a lawn quote",
    services: [
      "Weekly mowing",
      "Fertilization",
      "Seasonal color beds",
      "Commercial grounds",
      "Leaf & cleanup",
    ],
    stats: [
      { n: "Routes", l: "Citywide" },
      { n: "Photo", l: "Reports" },
      { n: "Commercial", l: "Teams" },
      { n: "Reliable", l: "Schedules" },
    ],
    gallery: gallery(
      [
        u("photo-1558904541-efa843a96f01", 800),
        u("photo-1466692476866-aef1dfb1e735", 800),
        u("photo-1557429287-b2e26467fc2b", 800),
      ],
      ["Fresh cut lawn", "Color beds", "Commercial campus"],
    ),
    testimonials: [
      {
        quote: "Office park looks sharp every Monday.",
        name: "Facilities Team",
        role: "Property mgmt",
      },
      {
        quote: "Never have to chase the crew. They just show up.",
        name: "Dana E.",
        role: "Homeowner",
      },
    ],
  },

  // —— Painting (2) ——
  {
    slug: "brushwork-painting-nashville",
    name: "Brushwork Painting",
    trade: "Painting",
    location: "Nashville, TN",
    tagline: "Crisp interiors & weather-tight exteriors",
    description: "Cabinet refinishing and whole-home color",
    accent: "#7c3aed",
    layout: "splitLight",
    phone: "(615) 555-0139",
    email: "color@brushwork.demo",
    heroImage: u("photo-1562259949-e8e7689d7828"),
    aboutTitle: "Prep is everything",
    aboutText:
      "Proper sanding, priming, and clean lines — interiors, exteriors, and cabinets that look factory-new.",
    cta: "Get a color consult",
    services: [
      "Interior painting",
      "Exterior painting",
      "Cabinet refinishing",
      "Deck staining",
      "Color consulting",
    ],
    stats: [
      { n: "Dust", l: "Controlled" },
      { n: "Premium", l: "Paints" },
      { n: "Cabinet", l: "Pros" },
      { n: "5★", l: "Finish" },
    ],
    gallery: gallery(
      [
        u("photo-1589939705384-5185137a7f0f", 800),
        u("photo-1560184897-ae75f418493e", 800),
        u("photo-1484154218962-a197022b5858", 800),
      ],
      ["Interior refresh", "Exterior trim", "Cabinet refinish"],
    ),
    testimonials: [
      {
        quote: "Cabinets look brand new at half the replacement cost.",
        name: "Claire M.",
        role: "Homeowner",
      },
      {
        quote: "Edges were razor sharp. Zero mess left behind.",
        name: "Todd R.",
        role: "Homeowner, Franklin",
      },
    ],
  },
  {
    slug: "colorfield-painting-san-diego",
    name: "Colorfield Co.",
    trade: "Painting",
    location: "San Diego, CA",
    tagline: "Coastal exteriors that fight salt & sun",
    description: "HOA exteriors and commercial interiors",
    accent: "#db2777",
    layout: "fullBleed",
    phone: "(619) 555-0148",
    email: "paint@colorfield.demo",
    heroImage: u("photo-1589939705384-5185137a7f0f"),
    aboutTitle: "Color that lasts by the ocean",
    aboutText:
      "Marine-grade coatings, HOA packages, and commercial night work so your building never looks tired.",
    cta: "Request a walkthrough",
    services: [
      "Coastal exterior coatings",
      "HOA multi-unit painting",
      "Commercial interiors",
      "Epoxy floors",
      "Pressure wash prep",
    ],
    stats: [
      { n: "HOA", l: "Packets" },
      { n: "Night", l: "Crews" },
      { n: "Marine", l: "Coatings" },
      { n: "Insured", l: "Fully" },
    ],
    gallery: gallery(
      [
        u("photo-1562259949-e8e7689d7828", 800),
        u("photo-1497366216548-37526070297c", 800),
        u("photo-1484154218962-a197022b5858", 800),
      ],
      ["Exterior refresh", "Office walls", "Lobby finish"],
    ),
    testimonials: [
      {
        quote: "HOA board loved the sample boards.",
        name: "Board President",
        role: "Coastal HOA",
      },
      {
        quote: "Zero disruption to tenants during night work.",
        name: "Property Mgr",
        role: "Apartment complex",
      },
    ],
  },

  // —— Cleaning (2) ——
  {
    slug: "sparkle-home-cleaning-denver",
    name: "SparkleHome Clean",
    trade: "Cleaning",
    location: "Denver, CO",
    tagline: "Recurring cleans you can set and forget",
    description: "Move-in/out and weekly home cleaning",
    accent: "#0d9488",
    layout: "splitLight",
    phone: "(720) 555-0129",
    email: "book@sparklehome.demo",
    heroImage: u("photo-1581578731548-c64695cc6952"),
    aboutTitle: "Spotless, on schedule",
    aboutText:
      "Background-checked cleaners, eco products on request, and photo checklists after every visit.",
    cta: "Book a clean",
    services: [
      "Weekly / biweekly cleans",
      "Deep cleaning",
      "Move-in / move-out",
      "Airbnb turnovers",
      "Eco-friendly products",
    ],
    stats: [
      { n: "Bonded", l: "& insured" },
      { n: "Same week", l: "Starts" },
      { n: "Photo", l: "Checklists" },
      { n: "4.9★", l: "Clients" },
    ],
    gallery: gallery(
      [
        u("photo-1527515637462-cff94eecc1ac", 800),
        u("photo-1584622650111-993a426fbf0a", 800),
        u("photo-1556912173-46c336c7fd55", 800),
      ],
      ["Kitchen shine", "Bathroom deep clean", "Living room reset"],
    ),
    testimonials: [
      {
        quote: "Consistent quality every other Tuesday.",
        name: "Elena F.",
        role: "Busy parent",
      },
      {
        quote: "Move-out clean got our full deposit back.",
        name: "Chris Y.",
        role: "Renter",
      },
    ],
  },
  {
    slug: "proshine-commercial-cleaning",
    name: "ProShine Facilities",
    trade: "Cleaning",
    location: "Dallas, TX",
    tagline: "Nightly commercial cleaning that never slips",
    description: "Offices, clinics, and retail floors",
    accent: "#334155",
    layout: "darkTech",
    phone: "(972) 555-0151",
    email: "ops@proshine.demo",
    heroImage: u("photo-1527515637462-cff94eecc1ac"),
    aboutTitle: "Your space, ready before open",
    aboutText:
      "Night crews, floor care, and restroom programs with supervisor audits — built for multi-site managers.",
    cta: "Request a facilities quote",
    services: [
      "Nightly office cleaning",
      "Medical suite protocols",
      "Floor care & polish",
      "Restroom programs",
      "Multi-site management",
    ],
    stats: [
      { n: "Nightly", l: "Crews" },
      { n: "HIPAA", l: "Aware" },
      { n: "Audit", l: "Reports" },
      { n: "Multi-site", l: "Ready" },
    ],
    gallery: gallery(
      [
        u("photo-1497366216548-37526070297c", 800),
        u("photo-1497366811353-6870744d04b2", 800),
        u("photo-1581578731548-c64695cc6952", 800),
      ],
      ["Office floors", "Lobby glass", "Suite clean"],
    ),
    testimonials: [
      {
        quote: "Three clinics, one reliable partner.",
        name: "Ops Lead",
        role: "Dental group",
      },
      {
        quote: "Supervisor audits keep standards high.",
        name: "Facilities Dir.",
        role: "Tech office",
      },
    ],
  },

  // —— Dental (2) ——
  {
    slug: "brightsmile-dental-austin",
    name: "BrightSmile Dental",
    trade: "Dental",
    location: "Austin, TX",
    tagline: "Gentle dentistry for the whole family",
    description: "Modern clinic site with clear booking CTAs",
    accent: "#0ea5e9",
    layout: "splitLight",
    phone: "(512) 555-0167",
    email: "front@brightsmile.demo",
    heroImage: u("photo-1606811841689-23dfdb7ee46b"),
    aboutTitle: "Care without the clinic chill",
    aboutText:
      "Preventive care, clear aligners, and same-week new-patient openings — explained in plain language.",
    cta: "Book an appointment",
    services: [
      "Cleanings & exams",
      "Whitening",
      "Clear aligners",
      "Crowns & fillings",
      "Kids' dentistry",
    ],
    stats: [
      { n: "New", l: "Patients welcome" },
      { n: "Evening", l: "Hours" },
      { n: "Insurance", l: "Friendly" },
      { n: "4.9★", l: "Reviews" },
    ],
    gallery: gallery(
      [
        u("photo-1629909613654-28e377c37b09", 800),
        u("photo-1609840114035-3c981b782dfe", 800),
        u("photo-1598256989800-fe5f95da9787", 800),
      ],
      ["Treatment room", "Reception", "Hygiene suite"],
    ),
    testimonials: [
      {
        quote: "Kids actually ask to come back. Unreal.",
        name: "Parent review",
        role: "Family patient",
      },
      {
        quote: "No upsell pressure — just solid advice.",
        name: "Alex T.",
        role: "Patient",
      },
    ],
  },
  {
    slug: "harbor-dental-group",
    name: "Harbor Dental Group",
    trade: "Dental",
    location: "San Francisco, CA",
    tagline: "Advanced care with a calm chairside manner",
    description: "Implants, cosmetics, sedation options",
    accent: "#0369a1",
    layout: "fullBleed",
    phone: "(415) 555-0183",
    email: "care@harbordental.demo",
    heroImage: u("photo-1629909613654-28e377c37b09"),
    aboutTitle: "Technology with a human pace",
    aboutText:
      "Digital scans, implants, and cosmetic smile design — with sedation options for anxious patients.",
    cta: "Schedule a consult",
    services: [
      "Dental implants",
      "Cosmetic dentistry",
      "Invisalign",
      "Sedation options",
      "Emergency dentistry",
    ],
    stats: [
      { n: "Digital", l: "Scans" },
      { n: "Implant", l: "Focus" },
      { n: "Sedation", l: "Available" },
      { n: "Central", l: "SF location" },
    ],
    gallery: gallery(
      [
        u("photo-1606811841689-23dfdb7ee46b", 800),
        u("photo-1609840114035-3c981b782dfe", 800),
        u("photo-1598256989800-fe5f95da9787", 800),
      ],
      ["Consult room", "Operatory", "Smile studio"],
    ),
    testimonials: [
      {
        quote: "Implant process was clearer than I expected.",
        name: "Patricia L.",
        role: "Patient",
      },
      {
        quote: "Sedation made my visit completely manageable.",
        name: "Kevin R.",
        role: "Patient",
      },
    ],
  },

  // —— Law Firm (2) ——
  {
    slug: "sterling-law-group",
    name: "Sterling & Co. Law",
    trade: "Law Firm",
    location: "Chicago, IL",
    tagline: "Business & real estate counsel that moves deals",
    description: "Trusted dark professional layout",
    accent: "#1e293b",
    layout: "darkTech",
    phone: "(312) 555-0199",
    email: "intake@sterlinglaw.demo",
    heroImage: u("photo-1589829545856-d10d557cf95f"),
    aboutTitle: "Clarity before the contract",
    aboutText:
      "We advise growing companies and property owners — negotiations, entity setup, and disputes handled with precision.",
    cta: "Request a consultation",
    services: [
      "Business formation",
      "Commercial contracts",
      "Real estate closings",
      "Dispute resolution",
      "Outside general counsel",
    ],
    stats: [
      { n: "20+", l: "Years" },
      { n: "Deal", l: "Focused" },
      { n: "Flat fee", l: "Options" },
      { n: "Responsive", l: "Partners" },
    ],
    gallery: gallery(
      [
        u("photo-1450101499163-c8848c66ca85", 800),
        u("photo-1521791136064-7986c2920216", 800),
        u("photo-1507679799987-c73779587ccf", 800),
      ],
      ["Partner meeting", "Contract review", "Client strategy"],
    ),
    testimonials: [
      {
        quote: "They closed our lease amendment in days, not weeks.",
        name: "COO",
        role: "Logistics startup",
      },
      {
        quote: "Straight talk. No billable fog.",
        name: "Founder",
        role: "SaaS company",
      },
    ],
  },
  {
    slug: "northside-family-law",
    name: "Northside Family Law",
    trade: "Law Firm",
    location: "Seattle, WA",
    tagline: "Family law with steadiness and respect",
    description: "Warm professional site for sensitive matters",
    accent: "#334155",
    layout: "splitLight",
    phone: "(206) 555-0121",
    email: "hello@northsidelaw.demo",
    heroImage: u("photo-1450101499163-c8848c66ca85"),
    aboutTitle: "Guidance when it matters most",
    aboutText:
      "Divorce, custody, and mediation — clear process, compassionate communication, strong advocacy.",
    cta: "Book a confidential call",
    services: [
      "Divorce & separation",
      "Custody & parenting plans",
      "Mediation",
      "Support modifications",
      "Prenuptial agreements",
    ],
    stats: [
      { n: "Confidential", l: "Always" },
      { n: "Mediation", l: "First" },
      { n: "Evening", l: "Calls" },
      { n: "Local", l: "Courts" },
    ],
    gallery: gallery(
      [
        u("photo-1521791136064-7986c2920216", 800),
        u("photo-1507679799987-c73779587ccf", 800),
        u("photo-1589829545856-d10d557cf95f", 800),
      ],
      ["Consultation", "Strategy session", "Office"],
    ),
    testimonials: [
      {
        quote: "Felt heard without losing the legal edge.",
        name: "Client",
        role: "Family matter",
      },
      {
        quote: "Process roadmap reduced so much anxiety.",
        name: "Client",
        role: "Mediation",
      },
    ],
  },

  // —— Restaurant (2) ——
  {
    slug: "ember-table-restaurant",
    name: "Ember & Table",
    trade: "Restaurant",
    location: "Austin, TX",
    tagline: "Wood-fired plates & neighborhood nights",
    description: "Warm hospitality site with reservation CTA",
    accent: "#c2410c",
    layout: "fullBleed",
    phone: "(512) 555-0140",
    email: "hello@embertable.demo",
    heroImage: u("photo-1517248135467-4c7edcad34c4"),
    aboutTitle: "Fire, seasonal produce, good company",
    aboutText:
      "Neighborhood restaurant with a wood oven, rotating seasonal menu, and walk-ins welcome after 8.",
    cta: "Reserve a table",
    services: [
      "Dinner service",
      "Weekend brunch",
      "Private dining",
      "Catering",
      "Happy hour",
    ],
    stats: [
      { n: "Wed–Sun", l: "Open" },
      { n: "Patio", l: "Seating" },
      { n: "Local", l: "Farms" },
      { n: "Walk-ins", l: "Welcome" },
    ],
    gallery: gallery(
      [
        u("photo-1414235077428-338989a2e8c0", 800),
        u("photo-1559339352-11d035aa65de", 800),
        u("photo-1504754524776-8f4f6399872c", 800),
      ],
      ["Dining room", "Wood-fired dish", "Bar night"],
    ),
    testimonials: [
      {
        quote: "Best neighborhood dinner we've found in years.",
        name: "Reviewer",
        role: "Regular",
      },
      {
        quote: "Private room made our birthday effortless.",
        name: "Guest",
        role: "Celebration",
      },
    ],
  },
  {
    slug: "noon-kitchen-cafe",
    name: "Noon Kitchen",
    trade: "Restaurant",
    location: "Portland, OR",
    tagline: "All-day cafe for slow mornings & quick lunches",
    description: "Bright cafe layout with menu highlights",
    accent: "#ca8a04",
    layout: "splitLight",
    phone: "(503) 555-0192",
    email: "hi@noonkitchen.demo",
    heroImage: u("photo-1554118811-1e0d58224f24"),
    aboutTitle: "Coffee, bowls, and bakery cases",
    aboutText:
      "From early espresso to lunch bowls — baked in-house, sourced locally, and ready for takeout.",
    cta: "See today's menu",
    services: [
      "Breakfast & brunch",
      "Lunch bowls",
      "Espresso bar",
      "Bakery case",
      "Catering trays",
    ],
    stats: [
      { n: "Open 7am", l: "Daily" },
      { n: "Wi-Fi", l: "Friendly" },
      { n: "Vegan", l: "Options" },
      { n: "Takeout", l: "Ready" },
    ],
    gallery: gallery(
      [
        u("photo-1495474472287-4d71bcdd2085", 800),
        u("photo-1504754524776-8f4f6399872c", 800),
        u("photo-1559339352-11d035aa65de", 800),
      ],
      ["Cafe counter", "Brunch plate", "Pastry case"],
    ),
    testimonials: [
      {
        quote: "My remote-work cafe of choice.",
        name: "Regular",
        role: "Neighbor",
      },
      {
        quote: "Catering trays disappeared in minutes at the office.",
        name: "Office manager",
        role: "Local team",
      },
    ],
  },

  // —— Bonus construction (kept from original set) ——
  {
    slug: "construction",
    name: "Ironbridge Builders",
    trade: "Construction",
    location: "Chicago, IL",
    tagline: "Commercial & residential builds since 2008",
    description: "Industrial yellow-black grid, project portfolio",
    accent: "#eab308",
    layout: "fullBleed",
    phone: "(312) 555-0108",
    email: "build@ironbridge.demo",
    heroImage: showcaseImages.construction.hero,
    aboutTitle: "Builds that stand up to Chicago winters",
    aboutText:
      "Ground-up residential, commercial TI, and renovations managed with clear schedules and site discipline.",
    cta: "Start a project",
    services: [
      "Custom homes",
      "Commercial TI",
      "Renovations",
      "Project management",
      "Design-build",
    ],
    stats: [
      { n: "2008", l: "Est." },
      { n: "On-time", l: "Focus" },
      { n: "Licensed", l: "GC" },
      { n: "5★", l: "Clients" },
    ],
    gallery: gallery(
      [
        showcaseImages.construction.gallery[0],
        showcaseImages.construction.gallery[1],
        showcaseImages.construction.gallery[2],
      ],
      ["Commercial shell", "Site work", "Interior build"],
    ),
    testimonials: [
      {
        quote: "Schedule held even through a brutal winter.",
        name: "Dev partner",
        role: "Mixed-use project",
      },
      {
        quote: "Change orders were clear and fair.",
        name: "Owner",
        role: "Custom home",
      },
    ],
    flagship: true,
  },
];

export const demoTrades = [
  "Roofing",
  "Plumbing",
  "Electrician",
  "HVAC",
  "Landscaping",
  "Painting",
  "Cleaning",
  "Dental",
  "Law Firm",
  "Restaurant",
  "Construction",
] as const;

export function getDemoBySlug(slug: string): DemoSite | undefined {
  return demoCatalog.find((d) => d.slug === slug);
}

export function getDemosByTrade(trade: string): DemoSite[] {
  return demoCatalog.filter(
    (d) => d.trade.toLowerCase() === trade.toLowerCase(),
  );
}
