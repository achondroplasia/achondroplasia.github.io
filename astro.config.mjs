import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import { satteri } from "@astrojs/markdown-satteri";
import { headingIds, externalLinks, tableWrap } from "./src/plugins/content.mjs";

export default defineConfig({
  site: "https://achondroplasia.github.io",
  /* /treatments is served from treatments.html, matching the URLs the site
     has always had on GitHub Pages (no trailing-slash redirects). */
  build: { format: "file" },
  trailingSlash: "never",
  integrations: [mdx()],
  markdown: {
    processor: satteri({
      hastPlugins: [headingIds, externalLinks, tableWrap],
      /* Keep the text exactly as written (no curly-quote conversion). */
      features: { smartPunctuation: false },
    }),
  },
});
