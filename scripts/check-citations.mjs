/* Checks that every PubMed / PMC link in the content points to the paper
   the citation describes: fetches the real title from NCBI and compares it
   with the words around the link. Fails on IDs that don't exist or whose
   title shares almost nothing with the citation text.

   Usage: node scripts/check-citations.mjs            (CI)
          node scripts/check-citations.mjs --verbose  (show every match)

   NCBI being unreachable is a warning, not a failure, so a network blip
   never blocks a deploy. */
import fs from "node:fs";
import path from "node:path";

const DIR = path.resolve("src/content/pages");
const VERBOSE = process.argv.includes("--verbose");
const MIN_OVERLAP = 0.2; // share of title words that must appear near the link
const EXCEPTIONS = JSON.parse(fs.readFileSync(path.resolve("scripts/citation-exceptions.json"), "utf8"));

const STOP = new Set(
  "the of and in a an with for to on from by at is are as or its vs versus study children achondroplasia individuals people patients"
    .split(" ")
);
const words = (s) =>
  new Set((s.toLowerCase().match(/[a-z0-9]{3,}/g) || []).filter((w) => !STOP.has(w)));

/* Collect [file, id, db, context-line] for each link */
const cites = [];
for (const file of fs.readdirSync(DIR).filter((f) => f.endsWith(".mdx"))) {
  for (const line of fs.readFileSync(path.join(DIR, file), "utf8").split("\n")) {
    const re =
      /https?:\/\/(?:www\.)?(?:pubmed\.ncbi\.nlm\.nih\.gov\/(\d+)|(?:pmc\.ncbi\.nlm\.nih\.gov|www\.ncbi\.nlm\.nih\.gov\/pmc)\/articles\/PMC(\d+))/g;
    for (const m of line.matchAll(re)) {
      const context = line.replace(/\[([^\]]*)\]\([^)]*\)/g, "$1");
      cites.push({ file, id: m[1] || m[2], db: m[1] ? "pubmed" : "pmc", context });
    }
  }
}

async function summaries(db, ids) {
  const out = {};
  for (let i = 0; i < ids.length; i += 150) {
    const batch = ids.slice(i, i + 150);
    const url = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=${db}&retmode=json&id=${batch.join(",")}`;
    let res;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        res = await fetch(url, { headers: { "User-Agent": "achondroplasia-guide-citation-check" } });
        if (res.ok) break;
      } catch {}
      await new Promise((r) => setTimeout(r, 1500 * (attempt + 1)));
    }
    if (!res?.ok) throw new Error(`NCBI ${db} unreachable`);
    const json = await res.json();
    for (const id of batch) out[id] = json.result?.[id]?.title ?? null;
    await new Promise((r) => setTimeout(r, 400)); // stay under NCBI's rate limit
  }
  return out;
}

let titles;
try {
  const ids = (db) => [...new Set(cites.filter((c) => c.db === db).map((c) => c.id))];
  titles = { pubmed: await summaries("pubmed", ids("pubmed")), pmc: await summaries("pmc", ids("pmc")) };
} catch (e) {
  console.warn(`⚠ Skipping citation check: ${e.message}`);
  process.exit(0);
}

const problems = [];
const seen = new Set();
for (const c of cites) {
  const key = `${c.file}:${c.db}:${c.id}:${c.context}`;
  if (seen.has(key)) continue;
  seen.add(key);
  const title = titles[c.db][c.id];
  const label = `${c.file}: ${c.db === "pmc" ? "PMC" : "PMID "}${c.id}`;
  if (!title) {
    problems.push(`${label} does not exist`);
    continue;
  }
  if (EXCEPTIONS[`${c.file}:${c.db === "pmc" ? "PMC" : ""}${c.id}`]) continue;
  const t = words(title);
  const hits = [...t].filter((w) => words(c.context).has(w)).length;
  const overlap = hits / Math.max(1, t.size);
  if (overlap < MIN_OVERLAP) {
    problems.push(`${label} is "${title}"\n    but the page cites: ${c.context.trim().slice(0, 200)}`);
  } else if (VERBOSE) {
    console.log(`ok ${overlap.toFixed(2)} ${label} — ${title}`);
  }
}

if (problems.length) {
  console.error(`✗ ${problems.length} citation(s) don't match the linked paper:\n  ` + problems.join("\n  "));
  process.exit(1);
}
console.log(`✓ ${seen.size} PubMed/PMC citations match the papers they link to`);
