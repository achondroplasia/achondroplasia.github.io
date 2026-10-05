/* Fails the build if any internal link in dist/ points to a page or
   #fragment that doesn't exist. Run after `astro build`. */
import fs from "node:fs";
import path from "node:path";

const DIST = path.resolve("dist");
const pages = new Map(); // "/treatments" -> Set of ids
const links = []; // [fromFile, href]

for (const file of fs.readdirSync(DIST).filter((f) => f.endsWith(".html"))) {
  const html = fs.readFileSync(path.join(DIST, file), "utf8");
  const route = file === "index.html" ? "/" : "/" + file.replace(/\.html$/, "");
  pages.set(route, new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1])));
  for (const m of html.matchAll(/<a\s[^>]*href="([^"]+)"/g)) links.push([file, m[1]]);
}

const assets = new Set(fs.readdirSync(DIST));
const broken = [];
for (const [file, href] of links) {
  if (/^(https?:|mailto:|tel:)/.test(href)) continue;
  const [p, frag] = href.split("#");
  const route = p === "" ? (file === "index.html" ? "/" : "/" + file.replace(/\.html$/, "")) : p;
  if (!pages.has(route)) {
    if (!assets.has(route.slice(1))) broken.push(`${file}: ${href} (no such page)`);
  } else if (frag && !pages.get(route).has(decodeURIComponent(frag))) {
    broken.push(`${file}: ${href} (no #${frag} on ${route})`);
  }
}

if (broken.length) {
  console.error(`✗ ${broken.length} broken internal link(s):\n  ` + broken.join("\n  "));
  process.exit(1);
}
console.log(`✓ ${links.length} links checked across ${pages.size} pages, none broken`);
