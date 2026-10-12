import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { site, sections, href } from "../data/site";

/* /llms.txt (https://llmstxt.org): a Markdown map of the site for AI tools,
   built from the same `sections` as the nav so it never drifts. */
export const GET: APIRoute = async () => {
  const pages = new Map((await getCollection("pages")).map((p) => [p.id, p.data]));
  const home = pages.get("index")!;

  const body = sections
    .map((section) => {
      const links = section.pages
        .map((p) => {
          const data = pages.get(p.slug);
          return `- [${p.label}](${site.url}${href(p.slug)}): ${data?.description ?? p.hint ?? ""}`;
        })
        .join("\n");
      return `## ${section.label}\n\n${section.blurb}\n\n${links}`;
    })
    .join("\n\n");

  const extras = ["about", "updates"]
    .filter((slug) => pages.has(slug))
    .map((slug) => `- [${pages.get(slug)!.title}](${site.url}${href(slug)}): ${pages.get(slug)!.description}`)
    .join("\n");

  const text = `# ${site.name}

> ${home.description}

Written in plain English for families, people with achondroplasia, and the clinicians and teachers who support them. Medical claims are cited to published guidelines and peer-reviewed papers, listed at the end of each page. This is general information, not medical advice.

${body}
${extras ? `\n## Optional\n\n${extras}\n` : ""}`;

  return new Response(text, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
};
