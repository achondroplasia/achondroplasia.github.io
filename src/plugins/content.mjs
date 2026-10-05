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

/* Wide tables scroll sideways inside a wrapper instead of the whole page. */
const wrap = (node, ctx) =>
  ctx.wrapNode(node, {
    type: "element",
    tagName: "div",
    properties: { className: ["table-wrap"] },
    children: [],
  });
export const tableWrap = defineHastPlugin({
  name: "table-wrap",
  element: { filter: ["table"], visit: wrap },
  mdxJsxFlowElement: { filter: ["table"], visit: wrap },
});
