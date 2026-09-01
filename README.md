# Achondroplasia Guide

[![License: CC BY 4.0](https://img.shields.io/badge/License-CC%20BY%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by/4.0/)

A free, comprehensive family guide to achondroplasia — from birth through adulthood.  
Built as a plain static site (no build step) and hosted on GitHub Pages:

**🌐 https://shubhamtatvamasi.com/achondroplasia/**

---

## What's here

| Page | Description |
|------|-------------|
| [Understanding It](understanding.html) | Genetics, inheritance, diagnosis — FGFR3, de novo mutations, prenatal testing |
| [First Years (0–2)](first-years.html) | Foramen magnum screening, sleep studies, safe handling, milestones |
| [Childhood (2–12)](childhood.html) | Ears, bowed legs, weight, school setup, friendships |
| [Teen Years](teens.html) | Puberty, identity, driving, mental health, transition to adult care |
| [Adults & Aging](adults.html) | Spinal stenosis, heart health, pregnancy, anesthesia, work rights |
| [Treatments](treatments.html) | Vosoritide, navepegritide, infigratinib, limb lengthening, what doesn't work |
| [Nutrition & Exercise](nutrition.html) | BMI caveats, weight management, safe exercise, physical therapy, bone health |
| [Dental & Oral Health](dental.html) | Malocclusion, orthodontics, jaw surgery, mouth breathing, daily hygiene |
| [Everyday Life](daily-living.html) | Home, car, school, clothing, travel, sports, assistive tech |
| [Careers & Work](career.html) | Employment data, legal protections, disclosure, accommodations, career choice, discrimination, entrepreneurship, disability benefits |
| [Wellbeing & Community](wellbeing.html) | Mental health, parenting, support organizations worldwide |
| [Care Checklist](checklist.html) | Age-by-age monitoring schedule from published clinical guidelines |
| [Warning Signs](warning-signs.html) | Symptoms that need urgent medical attention, printable ER card |
| [Medical Library](medical-library.html) | Digests of every major clinical guideline and key paper |
| [Glossary](glossary.html) | 120+ medical terms in plain English |

## Treatment status (August 2026)

| Drug | Status |
|------|--------|
| Vosoritide (Voxzogo, BioMarin) | FDA approved Nov 2021; expanded to infants Oct 2023 |
| Navepegritide (Yuviwel, Ascendis) | FDA approved Feb 27, 2026 (ages 2+) |
| Infigratinib (BridgeBio) | Phase 3 (PROPEL 3) positive Feb 2026; NDA filing planned H2 2026 |
| TYRA-300 / dabogratinib (Tyra Bio) | Phase 2 (BEACH301) started 2025 |

## Sources

Content is compiled from published clinical guidelines and peer-reviewed research including:
- AAP *Health Supervision for People With Achondroplasia* (Pediatrics, 2020)
- *International Consensus Statement* (Nature Reviews Endocrinology, 2022)
- GeneReviews Achondroplasia chapter (revised 2026)
- European Achondroplasia Forum guidelines (2023–2025)

Every page lists its numbered sources. **This site is educational, not medical advice.**

## Contributing

Corrections and suggestions are welcome — open an issue or pull request.  
Please include a published source for any medical claim.

## Development

Plain HTML/CSS/JS. No build step required. Serve locally with:

```bash
python3 serve.py
```

`serve.py` mimics GitHub Pages clean URLs — internal links are extensionless throughout the site.  
`_template.html` is the shared page template to copy when creating new pages.

## License

Content: [CC BY 4.0](LICENSE)  
Code (HTML/CSS/JS structure): MIT  
Medical content may not be reproduced as medical advice.
