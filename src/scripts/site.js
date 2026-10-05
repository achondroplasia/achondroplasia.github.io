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
    // Return focus to the trigger only if it was inside the menu; a menu
    // opened by hover closes without moving focus (WCAG 1.4.13).
    const hadFocus = open.contains(document.activeElement);
    open.open = false;
    if (hadFocus) open.querySelector("summary").focus();
  }
});

/* Desktop groups also open on hover, for mouse users only. Delays follow
   NN/g and Baymard: ~300 ms before opening filters out pointers that are
   just passing over the bar, and ~500 ms before closing forgives a
   diagonal path into the panel. Moving across from an already-open group
   switches faster. Touch, pen, and keyboard keep click/Enter to open. */
const canHover = matchMedia("(hover: hover) and (pointer: fine)");
const OPEN_DELAY = 300;
const SWITCH_DELAY = 150;
const CLOSE_DELAY = 500;

for (const group of document.querySelectorAll(".nav-group")) {
  let openTimer;
  let closeTimer;
  const isMouse = (e) => e.pointerType === "mouse" && canHover.matches;

  group.addEventListener("pointerenter", (e) => {
    if (!isMouse(e)) return;
    clearTimeout(closeTimer);
    if (group.open) return;
    const switching = menus.some((m) => m.open);
    openTimer = setTimeout(() => {
      group.open = true;
      group.dataset.hovered = "";
    }, switching ? SWITCH_DELAY : OPEN_DELAY);
  });

  group.addEventListener("pointerleave", (e) => {
    if (!isMouse(e)) return;
    clearTimeout(openTimer);
    if (group.open && "hovered" in group.dataset) {
      closeTimer = setTimeout(() => (group.open = false), CLOSE_DELAY);
    }
  });

  // Clicking a group that hover already opened pins it open instead of
  // closing it; a pinned group stays until a click elsewhere or Escape.
  group.querySelector("summary").addEventListener("click", (e) => {
    clearTimeout(openTimer);
    if (group.open && "hovered" in group.dataset) {
      e.preventDefault();
      delete group.dataset.hovered;
    }
  });

  group.addEventListener("toggle", () => {
    if (!group.open) {
      delete group.dataset.hovered;
      clearTimeout(closeTimer);
      return;
    }
    // Keep the panel inside the viewport on narrower desktop screens.
    const panel = group.querySelector(".nav-menu");
    panel.style.translate = "";
    const overflow = panel.getBoundingClientRect().right - (document.documentElement.clientWidth - 16);
    if (overflow > 0) panel.style.translate = `${-overflow}px 0`;
  });

  // Tabbing out of an open group closes it.
  group.addEventListener("focusout", (e) => {
    if (e.relatedTarget && !group.contains(e.relatedTarget)) group.open = false;
  });
}

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
