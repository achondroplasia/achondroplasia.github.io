/* Reports off-site links in dist/ that are dead (404/410, DNS failure,
   timeout). Many journals and agencies block automated requests (403/429),
   so those are listed separately as "blocked", not broken.
   Run after `npm run build`. Exits 1 if any link is definitely dead. */
import fs from "node:fs";
import path from "node:path";

const DIST = path.resolve("dist");
const CONCURRENCY = 8;
const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140 Safari/537.36";

const where = new Map(); // url -> Set(pages)
for (const file of fs.readdirSync(DIST).filter((f) => f.endsWith(".html"))) {
  const html = fs.readFileSync(path.join(DIST, file), "utf8");
  for (const m of html.matchAll(/href="(https?:\/\/[^"]+)"/g)) {
    const url = m[1].replace(/&amp;/g, "&");
    if (url.includes("achondroplasia.github.io")) continue;
    if (!where.has(url)) where.set(url, new Set());
    where.get(url).add(file.replace(/\.html$/, ""));
  }
}

async function check(url) {
  for (const method of ["HEAD", "GET"]) {
    try {
      const res = await fetch(url, {
        method,
        redirect: "follow",
        signal: AbortSignal.timeout(25000),
        headers: { "User-Agent": UA, Accept: "text/html,application/xhtml+xml,*/*" },
      });
      if (res.ok) return "ok";
      if ([403, 429, 401, 999].includes(res.status)) return "blocked";
      if (method === "GET") return String(res.status);
    } catch (e) {
      if (method === "GET") return e.name === "TimeoutError" ? "timeout" : "unreachable";
    }
  }
}

const urls = [...where.keys()];
const results = new Map();
let next = 0;
await Promise.all(
  Array.from({ length: CONCURRENCY }, async () => {
    while (next < urls.length) {
      const url = urls[next++];
      results.set(url, await check(url));
    }
  })
);

const dead = urls.filter((u) => !["ok", "blocked"].includes(results.get(u)));
const blocked = urls.filter((u) => results.get(u) === "blocked");
const line = (u) => `  [${results.get(u)}] ${u}  (on: ${[...where.get(u)].join(", ")})`;

console.log(`Checked ${urls.length} external links: ${urls.length - dead.length - blocked.length} ok, ${blocked.length} blocked automated checks, ${dead.length} dead.`);
if (blocked.length) console.log(`\nBlocked (probably fine, check by hand occasionally):\n${blocked.map(line).join("\n")}`);
if (dead.length) {
  console.log(`\nDead or unreachable:\n${dead.map(line).join("\n")}`);
  process.exit(1);
}
