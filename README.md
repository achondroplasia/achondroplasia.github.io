# Achondroplasia Guide

[![License: CC BY 4.0](https://img.shields.io/badge/License-CC%20BY%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by/4.0/)

A free, comprehensive family guide to achondroplasia, from birth through adulthood.
Built with [Astro](https://astro.build) as a fully static site and hosted on GitHub Pages:

**🌐 https://achondroplasia.github.io/**

---

## What's here

| Page | Description |
|------|-------------|
| [Understanding It](src/content/pages/understanding.mdx) | Genetics, inheritance, diagnosis: FGFR3, de novo mutations, prenatal testing |
| [First Years (0–2)](src/content/pages/first-years.mdx) | Foramen magnum screening, sleep studies, safe handling, milestones |
| [Childhood (2–12)](src/content/pages/childhood.mdx) | Ears, bowed legs, weight, school setup, friendships |
| [Teen Years](src/content/pages/teens.mdx) | Puberty, identity, driving, mental health, transition to adult care |
| [Adults & Aging](src/content/pages/adults.mdx) | Spinal stenosis, heart health, pregnancy, anesthesia, work rights |
| [Treatments](src/content/pages/treatments.mdx) | Vosoritide, navepegritide, infigratinib, limb lengthening, what doesn't work |
| [Nutrition & Exercise](src/content/pages/nutrition.mdx) | BMI caveats, weight management, safe exercise, physical therapy, bone health |
| [Dental & Oral Health](src/content/pages/dental.mdx) | Malocclusion, orthodontics, jaw surgery, mouth breathing, daily hygiene |
| [Vision & Eye Health](src/content/pages/vision.mdx) | Strabismus, refractive errors, amblyopia, screening schedule |
| [Learning & School](src/content/pages/learning.mdx) | Hearing, sleep and fatigue as learning barriers; IEPs and 504 plans |
| [Pain Management](src/content/pages/pain.mdx) | Sources of chronic pain, the multimodal approach, medications |
| [Immunizations](src/content/pages/immunizations.mdx) | Standard schedules, RSV prevention, respiratory health |
| [Everyday Life](src/content/pages/daily-living.mdx) | Home, car, school, clothing, travel, sports, assistive tech |
| [Careers & Work](src/content/pages/career.mdx) | Employment data, legal protections, disclosure, accommodations, benefits |
| [Wellbeing & Community](src/content/pages/wellbeing.mdx) | Mental health, parenting, support organizations worldwide |
| [Global Resources](src/content/pages/international.mdx) | Drug availability by country, specialist centers, patient organizations |
| [Research & Trials](src/content/pages/research.mdx) | Finding trials, trial phases, evaluating a study, registries |
| [Care Checklist](src/content/pages/checklist.mdx) | Age-by-age monitoring schedule from published clinical guidelines |
| [Warning Signs](src/content/pages/warning-signs.mdx) | Symptoms that need urgent medical attention, printable ER card |
| [Medical Library](src/content/pages/medical-library.mdx) | Digests of every major clinical guideline and key paper |
| [Glossary](src/content/pages/glossary.mdx) | 120+ medical terms in plain English |

## Treatment status (September 2026)

| Drug | Status |
|------|--------|
| Vosoritide (Voxzogo, BioMarin) | FDA approved Nov 2021; expanded to infants Oct 2023 |
| Navepegritide (Yuviwel, Ascendis) | FDA approved Feb 27, 2026 (ages 2+) |
| Infigratinib (BridgeBio) | Phase 3 (PROPEL 3) positive Feb 2026; NDA submitted Sept 2026 |
| TYRA-300 / dabogratinib (Tyra Bio) | Phase 2 (BEACH301) started 2025 |

## Sources

Content is compiled from published clinical guidelines and peer-reviewed research including:
- AAP *Health Supervision for People With Achondroplasia* (Pediatrics, 2020)
- *International Consensus Statement* (Nature Reviews Endocrinology, 2022)
- GeneReviews Achondroplasia chapter (revised 2026)
- European Achondroplasia Forum guidelines (2023–2025)

Every page lists its numbered sources. **This site is educational, not medical advice.**

## Contributing

Corrections and suggestions are welcome: open an issue or pull request.
Please include a published source for any medical claim.

### Editing a page

Each page is one MDX file (Markdown plus a few components) in
[`src/content/pages/`](src/content/pages/). The file name is the URL:
`treatments.mdx` is served at `/treatments`.

The frontmatter at the top holds everything that isn't body text:

```yaml
---
title: Treatments & Research          # <title>, social cards
description: Every achondroplasia…    # search-result snippet
lede: An honest, complete tour of…    # summary under the heading
summary: The two approved growth…     # blurb on the home-page directory
keywords: vosoritide, Voxzogo, …
lastReviewed: 2026-08-01              # shown as "Content last reviewed: August 2026"
sources:
  intro: "This page draws on the following…"
  items:
    - Hoover-Fong J, et al. *Health Supervision…*. Pediatrics, 2020. [aap.org](https://…)
---
```

The schema is in [`src/content.config.ts`](src/content.config.ts), and the
build fails if a field is missing or mistyped.

In the body:

- `##` headings become the "On this page" sidebar automatically.
- `## Heading \{#custom-id}` pins a heading's id, so existing `#links` to it keep working.
- Links to other pages are root-relative: `[Childhood](/childhood#sleep)`.
- Off-site links open in a new tab automatically.

Components available in every page:

```mdx
<Callout type="info" title="Good to know">…</Callout>   {/* info | tip | caution | emergency */}

<Grid>
  <LinkCard href="/checklist" kicker="Reference" title="Care checklist">
    Blurb text.
  </LinkCard>
  <Card kicker="Drug approval" title="Navepegritide">Body text.</Card>
</Grid>

<AgeBand>
### Birth–1 month
…
</AgeBand>
```

Tables can be plain Markdown tables. Tables that need captions, merged
cells or lists inside cells are written as HTML.

### Adding a page

1. Create `src/content/pages/<slug>.mdx` with the frontmatter above.
2. Add one entry (slug, label, icon) to the right section in
   [`src/data/site.ts`](src/data/site.ts). The header menus, mobile menu,
   footer, home-page directory, breadcrumbs, previous/next links, and
   search index all pick it up from there.

## Development

Requires Node 22.12 or newer.

```bash
npm install
npm run dev           # local server with live reload at http://localhost:4321
npm run build         # static site into dist/, plus the Pagefind search index
npm run check:links   # after a build: fails on any broken internal link or #anchor
```

Search only works on a build (`npm run build && npm run preview`), not in
`npm run dev`, because the index is generated from the built pages.

Every push to `main` builds the site, checks links, and deploys to GitHub Pages
through [the workflow](.github/workflows/deploy.yml). Pull requests run the same
build and link check without deploying.

## License

Content: [CC BY 4.0](LICENSE)
Code (HTML/CSS/JS structure): MIT
Medical content may not be reproduced as medical advice.
