/**
 * Few-shot quality etalons for Crestis prompts.
 * Show excellence → ask for a new one. Never copy.
 */

export const HERO_ETALONS = `Below are examples of excellent Hero JSON (Hero Generator v1).
Study the pattern. Do NOT copy. Do NOT reuse their wording.

Example 1:
{
  "headline": "Roof Repairs Built for Manchester Weather",
  "subheadline": "We fix leaks and storm damage for local homeowners who want clear answers and a crew that shows up when they say they will.",
  "primaryCTA": "Request Free Quote",
  "secondaryCTA": "Call Now",
  "trustBar": ["Licensed", "Insured", "Free Estimates", "Locally Owned"]
}

Example 2:
{
  "headline": "Dental Visits That Feel Less Stressful",
  "subheadline": "Same-week appointments and plain-English plans for Austin families who want care without the rush or the hard sell.",
  "primaryCTA": "Schedule Visit",
  "secondaryCTA": "Call Now",
  "trustBar": ["Locally Owned", "Family Business", "Free Estimates"]
}

Example 3:
{
  "headline": "Tonight's Tables Go Fast Downtown",
  "subheadline": "Seasonal plates and a neighborhood room for diners who want a real kitchen — not a concept chain.",
  "primaryCTA": "Reserve a Table",
  "secondaryCTA": "Call for Same-Day",
  "trustBar": ["Locally Owned"]
}

Now create a NEW hero for THIS business.
Do NOT copy.
Follow the same quality.`;

export const ABOUT_ETALONS = `Below are examples of excellent About JSON (About Generator v1).
Specific, trustworthy, no fake history. Do NOT copy.

Example 1:
{
  "title": "Why Homeowners Call Us First",
  "paragraphs": [
    "Helping homeowners keep their properties safe starts with dependable roofing work. Every project is approached with careful planning, honest communication and attention to detail, whether it's a small repair or a complete roof replacement.",
    "Customers value straightforward advice, careful workmanship and a crew that respects both their time and their property from the first inspection to the final cleanup."
  ],
  "highlights": ["Fast Response", "Clear Communication", "Transparent Pricing"]
}

Example 2:
{
  "title": "Care Without the Rush",
  "paragraphs": [
    "Dental visits feel easier when someone slows down and explains options in plain English. We help Austin families and busy adults who want clear plans — not pressure.",
    "Appointments stay respectful of your time. People come back because the conversation is honest and the next step is always clear."
  ],
  "highlights": ["Clear Communication", "Attention To Detail", "Local Focus"]
}

Example 3:
{
  "title": "A Kitchen With a Point of View",
  "paragraphs": [
    "We cook what the season gives us and refuse to pad the menu with filler. The room is loud in a good way, and the point is always the plate — not a concept deck.",
    "Regulars come back for seasonal plates, a neighborhood room, and a team that remembers what you ordered last time."
  ],
  "highlights": ["Seasonal Focus", "Local Ingredients", "Attention To Detail"]
}

Now write a NEW About section for THIS business.
Do NOT copy.
Follow the same quality.`;

export const SERVICE_ETALONS = `Below are examples of excellent service items (title + description).
Concrete benefit, local relevance, no filler. Do NOT copy.

Example 1:
{ "title": "Emergency Leak Repair", "description": "Same-day response when water is coming in. We stabilize the leak, protect the interior, and give a clear next-step plan before we leave." }

Example 2:
{ "title": "Invisalign Consults", "description": "A focused visit to see if clear aligners fit your bite and lifestyle — with honest timelines and pricing, not a hard sell." }

Example 3:
{ "title": "Private Dining", "description": "Book the back room for birthdays, client dinners, or quiet celebrations. Fixed menus available so hosting stays easy." }

Now create NEW service items from THIS business's real services list.
Do NOT copy.
Follow the same quality.`;

export const FAQ_ETALONS = `Below are examples of excellent FAQ pairs.
Real customer questions, useful answers, conversion-aware. Do NOT copy.

Example 1:
{ "question": "Do you handle storm damage claims?", "answer": "We document the damage, walk you through what insurers usually ask for, and give a repair scope you can share. We do not guarantee claim outcomes — we make the paperwork clearer." }

Example 2:
{ "question": "Do you take emergency dental patients?", "answer": "Yes — call first thing. We hold slots for urgent pain, broken teeth, and swelling, and we will tell you honestly if you need same-day care elsewhere." }

Example 3:
{ "question": "Can you accommodate dietary restrictions?", "answer": "Tell us when you book. We mark allergens in the kitchen and can usually adapt a dish — if we cannot do it safely, we will say so before you arrive." }

Now create NEW FAQ items for THIS niche and city.
Do NOT copy.
Follow the same quality.`;

export const CTA_ETALONS = `Below are examples of excellent final CTA bands.
Urgent without hype. Do NOT copy.

Example 1:
{ "headline": "Get the roof checked before the next storm rolls in", "primaryCTA": "Book a Free Inspection", "secondaryCTA": "Call the crew" }

Example 2:
{ "headline": "Ready for a calmer dental visit?", "primaryCTA": "Book online", "secondaryCTA": "Call the front desk" }

Example 3:
{ "headline": "Tonight's tables go fast — claim yours", "primaryCTA": "Reserve now", "secondaryCTA": "Call for same-day" }

Now create a NEW CTA band for THIS business.
Do NOT copy.
Follow the same quality.`;

export const DNA_ETALONS = `Below are examples of excellent Brand Profile JSON (Business Analyzer v1).
brandPersonality must be exactly 5 allowed traits. cta is an array of 3 labels.
Do NOT copy field values blindly.

Example 1:
{
  "industry": "Roofing",
  "subcategory": "Residential Roofing",
  "audience": ["Homeowners", "Property Managers"],
  "customerIntent": "Get Quote",
  "primaryGoal": "Lead Generation",
  "secondaryGoal": "Phone Calls",
  "brandPosition": "Standard",
  "brandPersonality": ["Reliable", "Fast", "Local", "Honest", "Experienced"],
  "tone": "Confident",
  "trustSignals": ["Licensed", "Insured", "Free Estimates", "Emergency Service"],
  "conversionStrategy": "Quote Form",
  "cta": ["Request Estimate", "Book Inspection", "Call Now"],
  "websiteStyle": "Construction",
  "colorDirection": "Navy",
  "imageDirection": "Workers on site",
  "sections": ["Hero", "Trust", "Services", "Projects", "About", "Testimonials", "FAQ", "Contact"],
  "seoIntent": "Local",
  "keywords": ["roof repair Dallas", "storm damage roofing", "roof inspection near me"],
  "localSeo": ["Dallas", "Plano", "Garland"],
  "advantages": ["Clear written quotes", "Local crew response"]
}

Example 2:
{
  "industry": "Dentist",
  "subcategory": "Family Dentistry",
  "audience": ["Parents", "Homeowners"],
  "customerIntent": "Book Appointment",
  "primaryGoal": "Bookings",
  "secondaryGoal": "Reviews",
  "brandPosition": "Premium",
  "brandPersonality": ["Friendly", "Professional", "Approachable", "Honest", "Modern"],
  "tone": "Warm",
  "trustSignals": ["Locally Owned", "Family Business"],
  "conversionStrategy": "Booking",
  "cta": ["Schedule Visit", "Book Appointment", "Call Now"],
  "websiteStyle": "Medical",
  "colorDirection": "Warm White",
  "imageDirection": "Happy customers",
  "sections": ["Hero", "Trust", "Services", "About", "Testimonials", "FAQ", "Contact"],
  "seoIntent": "Booking",
  "keywords": ["family dentist Austin", "kids dental checkup", "book dentist appointment"],
  "localSeo": ["Austin", "Round Rock"],
  "advantages": ["Calm chairside manner", "Clear treatment options"]
}

Example 3:
{
  "industry": "Restaurant",
  "subcategory": "Neighborhood Dining",
  "audience": ["Luxury Clients", "Homeowners"],
  "customerIntent": "Book Appointment",
  "primaryGoal": "Walk-ins",
  "secondaryGoal": "Directions",
  "brandPosition": "Premium",
  "brandPersonality": ["Bold", "Local", "Modern", "Friendly", "Approachable"],
  "tone": "Warm",
  "trustSignals": ["Locally Owned"],
  "conversionStrategy": "Visit Store",
  "cta": ["Reserve a Table", "Call Now", "Get Directions"],
  "websiteStyle": "Creative",
  "colorDirection": "Warm White",
  "imageDirection": "Lifestyle",
  "sections": ["Hero", "About", "Menu", "Testimonials", "FAQ", "Contact"],
  "seoIntent": "Local",
  "keywords": ["neighborhood restaurant", "dinner near me", "reserve table"],
  "localSeo": ["Downtown", "West End"],
  "advantages": ["Seasonal menu focus", "Neighborhood setting"]
}

Now create a NEW Brand Profile for THIS business.
Do NOT copy the examples.
Follow the same quality.`;

export const PLAN_ETALONS = `Below are examples of excellent Website Planner JSON (Template Library).
Structure only — no page copy, no invented design. Do NOT copy.

Example 1 (high-ticket roofing):
{
  "pageType": "Business",
  "conversionGoal": "Lead",
  "template": "construction-premium",
  "variant": "A",
  "sections": ["Hero", "Trust", "Services", "Projects", "Process", "Testimonials", "FAQ", "Contact"],
  "stickyCTA": true,
  "floatingPhone": true,
  "recommendedBlocks": [],
  "removedBlocks": ["Gallery", "Team"],
  "notes": ["Trust immediately after Hero", "Quote form is primary conversion"]
}

Example 2 (family dentist):
{
  "pageType": "Business",
  "conversionGoal": "Bookings",
  "template": "dentist-family",
  "variant": "B",
  "sections": ["Hero", "Trust", "Services", "About", "Testimonials", "FAQ", "Contact"],
  "stickyCTA": true,
  "floatingPhone": false,
  "recommendedBlocks": [],
  "removedBlocks": ["Projects"],
  "notes": ["Calm booking CTA", "Trust after Hero"]
}

Example 3 (restaurant):
{
  "pageType": "Landing",
  "conversionGoal": "Walk-ins",
  "template": "restaurant-modern",
  "variant": "A",
  "sections": ["Hero", "Menu", "Gallery", "About", "Testimonials", "FAQ", "Contact"],
  "stickyCTA": false,
  "floatingPhone": true,
  "recommendedBlocks": ["Reservation CTA in hero"],
  "removedBlocks": ["Projects", "Process"],
  "notes": ["Appetite-first hero", "Keep under 8 sections"]
}

Now create a NEW plan for THIS business.
Do NOT copy.
Follow the same quality.`;
