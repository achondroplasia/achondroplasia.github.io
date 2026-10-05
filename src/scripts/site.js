/* Achondroplasia Guide — progressive enhancements.
   Navigation, menus, and the table of contents are <details> elements and
   plain links, so the site works fully without JavaScript. This adds:
   menu housekeeping, the current-section highlight, search, and print. */

/* ---- Menus ------------------------------------------------------------- */
const menus = [...document.querySelectorAll(".nav-group, .mobile-nav")];

const closeMenus = (except) => {
  for (const m of menus) if (m !== except) m.open = false;
};

for (const menu of menus) {
  menu.addEventListener("toggle", () => {
    if (menu.open) closeMenus(menu);
    if (menu.classList.contains("mobile-nav")) {
      document.documentElement.style.overflow = menu.open ? "hidden" : "";
    }
  });
}

document.addEventListener("click", (e) => {
  if (!e.target.closest(".nav-group, .mobile-nav")) closeMenus();
});

document.addEventListener("keydown", (e) => {
  if (e.key !== "Escape") return;
  const open = menus.find((m) => m.open);
  if (open) {
    open.open = false;
    open.querySelector("summary").focus();
  }
});

/* ---- Current section in "On this page" -------------------------------------- */
const tocLinks = [...document.querySelectorAll("[data-toc-link]")];
if (tocLinks.length) {
  const byId = new Map(tocLinks.map((a) => [decodeURIComponent(a.hash.slice(1)), a]));
  const headings = [...byId.keys()].map((id) => document.getElementById(id)).filter(Boolean);
  let ticking = false;

  // The current section is the last heading scrolled into the top third.
  const update = () => {
    ticking = false;
    let current = headings[0];
    for (const h of headings) {
      if (h.getBoundingClientRect().top < innerHeight * 0.3) current = h;
    }
    for (const a of tocLinks) a.removeAttribute("aria-current");
    byId.get(current.id)?.setAttribute("aria-current", "true");
  };
  addEventListener(
    "scroll",
    () => {
      if (!ticking) requestAnimationFrame(update);
      ticking = true;
    },
    { passive: true }
  );
  update();
}

/* ---- Print ---------------------------------------------------------------- */
for (const button of document.querySelectorAll("[data-print]")) {
  button.hidden = false;
  button.addEventListener("click", () => print());
}

/* ---- Search (Pagefind, loaded on first use) ------------------------------- */
const dialog = document.getElementById("search-dialog");
if (dialog) {
  const input = dialog.querySelector("input");
  const results = dialog.querySelector("#search-results");
  const initial = results.innerHTML;
  let pagefind;
  let latest = 0;

  const openSearch = () => {
    closeMenus();
    if (!dialog.open) dialog.showModal();
    input.select();
  };

  for (const b of document.querySelectorAll("[data-search-open]")) {
    b.hidden = false;
    b.addEventListener("click", openSearch);
  }
  dialog.querySelector("[data-search-close]").addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", (e) => {
    if (e.target === dialog) dialog.close(); // backdrop
  });

  document.addEventListener("keydown", (e) => {
    const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName);
    if ((e.key === "/" && !typing) || (e.key === "k" && (e.metaKey || e.ctrlKey))) {
      e.preventDefault();
      openSearch();
    }
  });

  const escape = (s) =>
    s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  // Pagefind reports built file paths; the site serves them without ".html".
  const clean = (url) => url.replace(/\.html(?=#|$)/, "").replace(/^\/index(?=#|$)/, "/");

  const render = (items, query) => {
    if (!items.length) {
      results.innerHTML = `<p class="search-dialog__status">No pages mention “${escape(query)}”. Try a simpler word, or browse the <a href="/glossary">glossary</a>.</p>`;
      return;
    }
    results.innerHTML =
      "<ol>" +
      items
        .map((r) => {
          const subs = (r.sub_results || [])
            .filter((s) => s.url.includes("#"))
            .slice(0, 3)
            .map(
              (s) =>
                `<li><a class="search-result" href="${clean(s.url)}"><span class="search-result__title">${escape(s.title)}</span><span class="search-result__excerpt">${s.excerpt}</span></a></li>`
            )
            .join("");
          return `<li><a class="search-result" href="${clean(r.url)}"><span class="search-result__title">${escape(r.meta.title || "")}</span><span class="search-result__excerpt">${r.excerpt}</span></a>${subs ? `<ol class="search-subresults">${subs}</ol>` : ""}</li>`;
        })
        .join("") +
      "</ol>";
  };

  let timer;
  input.addEventListener("input", () => {
    clearTimeout(timer);
    timer = setTimeout(async () => {
      const query = input.value.trim();
      const id = ++latest;
      if (!query) {
        results.innerHTML = initial;
        return;
      }
      try {
        pagefind ??= await import(/* @vite-ignore */ "/pagefind/pagefind.js");
        const search = await pagefind.search(query);
        const items = await Promise.all(search.results.slice(0, 8).map((r) => r.data()));
        if (id === latest) render(items, query);
      } catch {
        results.innerHTML =
          '<p class="search-dialog__status">Search is unavailable here. (The search index is built with <code>npm run build</code>.)</p>';
      }
    }, 120);
  });

  // Close the dialog when a result on the same page is chosen.
  results.addEventListener("click", (e) => {
    if (e.target.closest("a")) dialog.close();
  });
}
