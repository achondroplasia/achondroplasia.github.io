import { markdownToHtml } from "satteri";
import { externalLinks } from "../plugins/content.mjs";

/** Render one line of Markdown (a source, a summary) to inline HTML. */
export const inlineMarkdown = (md: string) =>
  markdownToHtml(md, { hastPlugins: [externalLinks], features: { smartPunctuation: false } })
    .html.trim()
    .replace(/^<p>([\s\S]*)<\/p>$/, "$1");
