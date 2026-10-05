import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const pages = defineCollection({
  loader: glob({ pattern: "*.mdx", base: "./src/content/pages" }),
  schema: z.object({
    /** Short title: <title>, social cards, structured data */
    title: z.string(),
    /** On-page <h1>, when it differs from `title` */
    heading: z.string().optional(),
    /** Full <title> override (otherwise "`title` · Achondroplasia Guide") */
    headTitle: z.string().optional(),
    description: z.string(),
    /** Social-card text, when it differs from `description` */
    ogDescription: z.string().optional(),
    twitterDescription: z.string().optional(),
    keywords: z.string().optional(),
    /** One-sentence summary under the heading */
    lede: z.string().optional(),
    /** Date the medical content was last checked against its sources */
    lastReviewed: z.coerce.date().optional(),
    /** Show the "On this page" sidebar (built from the ## headings) */
    toc: z.boolean().default(true),
    sources: z
      .object({
        intro: z.string().optional(),
        /** One Markdown string per numbered source */
        items: z.array(z.string()).min(1),
      })
      .optional(),
  }),
});

export const collections = { pages };
