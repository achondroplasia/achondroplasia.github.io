/* Site-wide structure: the one place to add, rename, or reorder a page. */

export const site = {
  name: "Achondroplasia Guide",
  tagline: "A one-stop family guide, from birth onward",
  url: "https://achondroplasia.github.io",
  repo: "https://github.com/achondroplasia/achondroplasia.github.io",
  author: "Shubham Tatvamasi",
};

export type NavLink = { label: string; href: string };
export type NavGroup = { label: string; items: NavLink[] };

/* Header navigation */
export const nav: (NavLink | NavGroup)[] = [
  { label: "Home", href: "/" },
  { label: "Understanding It", href: "/understanding" },
  {
    label: "Life Stages",
    items: [
      { label: "First Years (0–2)", href: "/first-years" },
      { label: "Childhood (2–12)", href: "/childhood" },
      { label: "Teen Years", href: "/teens" },
      { label: "Adults & Aging", href: "/adults" },
    ],
  },
  {
    label: "Health & Care",
    items: [
      { label: "Treatments", href: "/treatments" },
      { label: "Nutrition & Exercise", href: "/nutrition" },
      { label: "Dental & Oral Health", href: "/dental" },
      { label: "Vision & Eye Health", href: "/vision" },
      { label: "Learning & School", href: "/learning" },
      { label: "Pain Management", href: "/pain" },
      { label: "Immunizations", href: "/immunizations" },
    ],
  },
  {
    label: "Daily Life",
    items: [
      { label: "Everyday Life", href: "/daily-living" },
      { label: "Careers & Work", href: "/career" },
      { label: "Wellbeing & Community", href: "/wellbeing" },
      { label: "Global Resources", href: "/international" },
      { label: "Research & Trials", href: "/research" },
    ],
  },
  {
    label: "Reference",
    items: [
      { label: "Care Checklist", href: "/checklist" },
      { label: "Warning Signs", href: "/warning-signs" },
      { label: "Medical Library", href: "/medical-library" },
      { label: "Glossary", href: "/glossary" },
    ],
  },
];

/* Footer columns */
export const footer: NavGroup[] = [
  {
    label: "Life stages",
    items: [
      { label: "First years (0–2)", href: "/first-years" },
      { label: "Childhood (2–12)", href: "/childhood" },
      { label: "Teen years", href: "/teens" },
      { label: "Adults & aging", href: "/adults" },
      { label: "Understanding it", href: "/understanding" },
    ],
  },
  {
    label: "Medical care",
    items: [
      { label: "Treatments", href: "/treatments" },
      { label: "Pain management", href: "/pain" },
      { label: "Nutrition & exercise", href: "/nutrition" },
      { label: "Dental & oral health", href: "/dental" },
      { label: "Vision & eye health", href: "/vision" },
      { label: "Immunizations", href: "/immunizations" },
    ],
  },
  {
    label: "Daily life",
    items: [
      { label: "Everyday life", href: "/daily-living" },
      { label: "Careers & work", href: "/career" },
      { label: "Learning & school", href: "/learning" },
      { label: "Wellbeing & community", href: "/wellbeing" },
      { label: "Global resources", href: "/international" },
      { label: "Research & trials", href: "/research" },
    ],
  },
  {
    label: "Reference",
    items: [
      { label: "Care checklist", href: "/checklist" },
      { label: "Warning signs", href: "/warning-signs" },
      { label: "Medical library", href: "/medical-library" },
      { label: "Glossary", href: "/glossary" },
    ],
  },
];

/* Reading order for the "← Previous / Next →" links at the foot of each
   page; the label is how the neighbouring pages refer to it. The chain
   loops back home from the last page. */
export const readingOrder: [slug: string, label: string][] = [
  ["index", "Home"],
  ["understanding", "Understanding It"],
  ["first-years", "The First Years"],
  ["childhood", "Childhood"],
  ["teens", "The Teen Years"],
  ["adults", "Adults & Aging"],
  ["treatments", "Treatments"],
  ["nutrition", "Nutrition & Exercise"],
  ["dental", "Dental & Oral Health"],
  ["vision", "Vision & Eye Health"],
  ["learning", "Learning & School"],
  ["pain", "Pain Management"],
  ["immunizations", "Immunizations"],
  ["daily-living", "Everyday Life"],
  ["career", "Careers & Work"],
  ["wellbeing", "Wellbeing & Community"],
  ["international", "Global Resources"],
  ["research", "Research & Trials"],
  ["checklist", "Care Checklist"],
  ["warning-signs", "Warning Signs"],
  ["medical-library", "Medical Library"],
  ["glossary", "Glossary"],
];

export const href = (slug: string) => (slug === "index" ? "/" : `/${slug}`);
