/* Sätteri hast plugins for the guide's content pages. */
import { defineHastPlugin } from "satteri";

/* `## Heading \{#custom-id}` sets an explicit id. Runs before Astro's own
   heading-ids plugin, which keeps an existing id instead of slugging. Used
   where a pre-migration id differs from the auto slug, so old #links work. */
const ID = /\s*\{#([\w-]+)\}\s*$/;
export const headingIds = defineHastPlugin({
  name: "heading-ids-explicit",
  element: {
    filter: ["h1", "h2", "h3", "h4", "h5", "h6"],
    visit(node, ctx) {
      const last = node.children[node.children.length - 1];
      const m = last?.type === "text" && last.value.match(ID);
      if (!m) return;
      ctx.replaceNode(last, { type: "text", value: last.value.slice(0, m.index) });
      ctx.setProperty(node, "id", m[1]);
    },
  },
});

/* Off-site links open in a new tab. */
export const externalLinks = defineHastPlugin({
  name: "external-links",
  element: {
    filter: ["a"],
    visit(node, ctx) {
      if (!/^https?:\/\//.test(String(node.properties?.href ?? ""))) return;
      ctx.setProperty(node, "target", "_blank");
      ctx.setProperty(node, "rel", ["noopener", "noreferrer"]);
    },
  },
});

/* Wide tables scroll sideways inside a wrapper instead of the whole page.
   The wrapper is focusable so keyboard users can scroll it too, and is a
   labelled region named after the section it sits in (names must be unique
   on a page). A factory, so the heading tracking starts fresh per page. */
const textOf = (node) =>
  node.type === "text" ? node.value : (node.children ?? []).map(textOf).join("");
export const tableWrap = () => {
  let section = "";
  const used = new Map();
  const label = () => {
    const base = section ? `Table: ${section}` : "Table";
    const n = (used.get(base) ?? 0) + 1;
    used.set(base, n);
    return n > 1 ? `${base} (${n})` : base;
  };
  const wrap = (node, ctx) =>
    ctx.wrapNode(node, {
      type: "element",
      tagName: "div",
      properties: { className: ["table-wrap"], tabIndex: 0, role: "region", ariaLabel: label() },
      children: [],
    });
  return defineHastPlugin({
    name: "table-wrap",
    element: {
      filter: ["h2", "h3", "table"],
      visit(node, ctx) {
        if (node.tagName === "table") return wrap(node, ctx);
        section = textOf(node).replace(ID, "").trim();
      },
    },
    mdxJsxFlowElement: { filter: ["table"], visit: wrap },
  });
};
