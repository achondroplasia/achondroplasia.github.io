# Achondroplasia Guide

A free, comprehensive family guide to achondroplasia — from birth through adulthood.
Built as a plain static site (no build step) and hosted on GitHub Pages:

**https://shubhamtatvamasi.github.io/achondroplasia/**

## What's here

- **Understanding It** — what achondroplasia is, genetics, inheritance, diagnosis
- **Life stages** — First Years (0–2), Childhood (2–12), Teen Years, Adults & Aging
- **Treatments** — vosoritide (Voxzogo), drugs in development, limb lengthening, what doesn't work
- **Everyday Life** — home, car, school, clothing, travel, sports adaptations
- **Wellbeing & Community** — mental health, parenting, support organizations worldwide
- **Care Checklist** — the age-by-age monitoring schedule from published clinical guidelines
- **Warning Signs** — symptoms that need urgent medical attention, by age
- **Medical Library** — digests of every major clinical guideline and key paper, with links
- **Glossary** — plain-English explanations of the medical terms families encounter

## Sources

Content is compiled from published clinical guidelines and peer-reviewed research,
including the AAP's *Health Supervision for People With Achondroplasia* (Pediatrics, 2020),
the *International Consensus Statement* (Nature Reviews Endocrinology, 2022),
GeneReviews, and the resources of Little People of America. Every page lists its sources.

**This site is educational, not medical advice.** Always consult a clinician experienced
with skeletal dysplasias.

## Contributing

Corrections and suggestions are welcome — open an issue or pull request.

## Development

Plain HTML/CSS/JS. Serve locally with:

```bash
python3 serve.py
```

(`serve.py` mimics GitHub Pages' clean URLs, where `/first-years` serves
`first-years.html` — internal links are extensionless throughout the site.)

`_template.html` is the shared page template used to keep pages consistent.
