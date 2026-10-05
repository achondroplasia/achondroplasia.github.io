/* Site-wide structure: the one place to add, rename, or reorder a page.
   Header nav, footer, home-page directory, breadcrumbs, and the
   previous/next links are all generated from `sections`. */

export const site = {
  name: "Achondroplasia Guide",
  tagline: "A one-stop family guide, from birth onward",
  url: "https://achondroplasia.github.io",
  repo: "https://github.com/achondroplasia/achondroplasia.github.io",
  author: "Shubham Tatvamasi",
};

/** Icon names map to components in src/components/Icon.astro */
export type IconName =
  | "dna" | "baby" | "backpack" | "graduation" | "user" | "pill" | "apple"
  | "smile" | "eye" | "school" | "activity" | "syringe" | "house"
  | "briefcase" | "heart" | "globe" | "flask" | "clipboard" | "siren"
  | "library" | "book";

export type PageLink = { slug: string; label: string; icon: IconName };
export type Section = { id: string; label: string; blurb: string; pages: PageLink[] };

export const sections: Section[] = [
  {
    id: "start",
    label: "Start here",
    blurb: "What achondroplasia is, and what it means.",
    pages: [{ slug: "understanding", label: "Understanding achondroplasia", icon: "dna" }],
  },
  {
    id: "life-stages",
    label: "Life stages",
    blurb: "What matters at each age, from the newborn checks to healthy aging.",
    pages: [
      { slug: "first-years", label: "First years (0–2)", icon: "baby" },
      { slug: "childhood", label: "Childhood (2–12)", icon: "backpack" },
      { slug: "teens", label: "Teen years", icon: "graduation" },
      { slug: "adults", label: "Adults & aging", icon: "user" },
    ],
  },
  {
    id: "health",
    label: "Health & care",
    blurb: "Treatments, and the body systems that need the most attention.",
    pages: [
      { slug: "treatments", label: "Treatments", icon: "pill" },
      { slug: "nutrition", label: "Nutrition & exercise", icon: "apple" },
      { slug: "dental", label: "Dental & oral health", icon: "smile" },
      { slug: "vision", label: "Vision & eye health", icon: "eye" },
      { slug: "learning", label: "Learning & school", icon: "school" },
      { slug: "pain", label: "Pain management", icon: "activity" },
      { slug: "immunizations", label: "Immunizations", icon: "syringe" },
    ],
  },
  {
    id: "daily-life",
    label: "Daily life",
    blurb: "Home, work, community, and the wider world of research.",
    pages: [
      { slug: "daily-living", label: "Everyday life", icon: "house" },
      { slug: "career", label: "Careers & work", icon: "briefcase" },
      { slug: "wellbeing", label: "Wellbeing & community", icon: "heart" },
      { slug: "international", label: "Global resources", icon: "globe" },
      { slug: "research", label: "Research & trials", icon: "flask" },
    ],
  },
  {
    id: "reference",
    label: "Reference",
    blurb: "Tools to print, bookmark, and take to appointments.",
    pages: [
      { slug: "checklist", label: "Care checklist", icon: "clipboard" },
      { slug: "warning-signs", label: "Warning signs", icon: "siren" },
      { slug: "medical-library", label: "Medical library", icon: "library" },
      { slug: "glossary", label: "Glossary", icon: "book" },
    ],
  },
];

export const href = (slug: string) => (slug === "index" ? "/" : `/${slug}`);

/* Every page in reading order (home first), for previous/next links. */
export const readingOrder: PageLink[] = [
  { slug: "index", label: "Home", icon: "house" },
  ...sections.flatMap((s) => s.pages),
];

export const findPage = (slug: string) => {
  for (const section of sections) {
    const page = section.pages.find((p) => p.slug === slug);
    if (page) return { section, page };
  }
  return undefined;
};

/* "Start where you are" paths on the home page */
export const paths: { label: string; detail: string; slug: string; icon: IconName }[] = [
  { label: "We just got a diagnosis", detail: "What it is, why it happened, what comes next", slug: "understanding", icon: "dna" },
  { label: "Our baby is 0–2", detail: "The checks that matter most, and safe handling", slug: "first-years", icon: "baby" },
  { label: "Raising a child", detail: "Ears, legs, sleep, school, and friendships", slug: "childhood", icon: "backpack" },
  { label: "I'm a teenager", detail: "Identity, driving, and taking charge of your care", slug: "teens", icon: "graduation" },
  { label: "I'm an adult", detail: "Spinal health, pain, pregnancy, work rights", slug: "adults", icon: "user" },
  { label: "I'm a clinician or teacher", detail: "The guidelines and the evidence, annotated", slug: "medical-library", icon: "library" },
];
