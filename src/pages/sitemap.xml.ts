import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { site, href } from "../data/site";

export const GET: APIRoute = async () => {
  const pages = (await getCollection("pages")).filter((p) => p.id !== "404");
  const urls = pages
    .map((p) => {
      const loc = site.url + (p.id === "index" ? "/" : href(p.id));
      const lastmod = p.data.lastReviewed?.toISOString().slice(0, 10);
      return `  <url>\n    <loc>${loc}</loc>${lastmod ? `\n    <lastmod>${lastmod}</lastmod>` : ""}\n  </url>`;
    })
    .join("\n");
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
    { headers: { "Content-Type": "application/xml" } }
  );
};
