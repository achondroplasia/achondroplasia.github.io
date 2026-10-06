/* Achondroplasia Guide — progressive enhancements.
   Navigation, menus, and the table of contents are <details> elements and
   plain links, so the site works fully without JavaScript. This adds:
   menu housekeeping, the current-section highlight, search, and print. */

/* ---- Menus ------------------------------------------------------------- */
const menus = [...document.querySelectorAll(".nav-group, .mobile-nav, .theme-menu")];

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
  if (!e.target.closest(".nav-group, .mobile-nav, .theme-menu")) closeMenus();
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

/* Desktop groups also open on hover, for mouse users only, using "hover
   intent": rather than a fixed delay, the menu opens as soon as the pointer
   slows down over the label (people slow down on what they mean to open),
   while a pointer sweeping across the bar on its way somewhere else opens
   nothing. A cap makes sure a slowly drifting pointer still gets its menu.
   Moving across from an already-open group switches almost at once. The
   ~400 ms close delay forgives a diagonal path into the panel.
   Touch, pen, and keyboard keep click/Enter to open. */
const canHover = matchMedia("(hover: hover) and (pointer: fine)");
const INTENT_SAMPLE = 30; // ms between pointer-speed checks
const INTENT_SPEED = 0.25; // px per ms; slower than this counts as "meant it"
const OPEN_MAX = 220; // open by now anyway if the pointer is still inside
const SWITCH_MAX = 90;
const CLOSE_DELAY = 400;

let pointer = { x: 0, y: 0 };
addEventListener("pointermove", (e) => (pointer = { x: e.clientX, y: e.clientY }), { passive: true });

for (const group of document.querySelectorAll(".nav-group")) {
  let openTimer;
  let closeTimer;
  const isMouse = (e) => e.pointerType === "mouse" && canHover.matches;
  const openNow = () => {
    group.open = true;
    group.dataset.hovered = "";
  };

  group.addEventListener("pointerenter", (e) => {
    if (!isMouse(e)) return;
    clearTimeout(closeTimer);
    if (group.open) return;
    const max = menus.some((m) => m.open) ? SWITCH_MAX : OPEN_MAX;
    const start = performance.now();
    let last = { x: e.clientX, y: e.clientY };
    const check = () => {
      const moved = Math.hypot(pointer.x - last.x, pointer.y - last.y);
      last = pointer;
      if (moved / INTENT_SAMPLE < INTENT_SPEED || performance.now() - start >= max) openNow();
      else openTimer = setTimeout(check, INTENT_SAMPLE);
    };
    openTimer = setTimeout(check, INTENT_SAMPLE);
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

/* ---- Colour theme --------------------------------------------------------- */
/* System (the default) follows prefers-color-scheme; Light or Dark is saved
   and applied as html[data-theme] (early, by the inline script in Page.astro).
   The choice is offered in the desktop header menu and in the Menu drawer. */
{
  const root = document.documentElement;
  const metas = [...document.querySelectorAll('meta[name="theme-color"]')];
  const metaModes = metas.map((m) => [m.media, m.media.includes("dark") ? "dark" : "light"]);
  const themeMenu = document.querySelector(".theme-menu");
  const labels = { system: "System", light: "Light", dark: "Dark" };

  const applyTheme = (choice) => {
    if (choice === "system") delete root.dataset.theme;
    else root.dataset.theme = choice;
    // Browser chrome colour: a forced theme uses its colour on every system setting.
    metas.forEach((m, i) => {
      const [media, mode] = metaModes[i];
      m.media = choice === "system" ? media : choice === mode ? "all" : "not all";
    });
    for (const b of document.querySelectorAll("[data-theme-choice]")) {
      b.setAttribute("aria-pressed", String(b.dataset.themeChoice === choice));
    }
    if (themeMenu) {
      themeMenu.dataset.choice = choice;
      themeMenu.querySelector("summary").setAttribute("aria-label", `Colour theme: ${labels[choice]}`);
    }
  };

  applyTheme(root.dataset.theme || "system");
  for (const el of document.querySelectorAll("[data-theme-ui]")) el.hidden = false;

  document.addEventListener("click", (e) => {
    const button = e.target.closest("[data-theme-choice]");
    if (!button) return;
    const choice = button.dataset.themeChoice;
    applyTheme(choice);
    try {
      if (choice === "system") localStorage.removeItem("theme");
      else localStorage.setItem("theme", choice);
    } catch {}
    if (themeMenu?.contains(button)) {
      themeMenu.open = false;
      themeMenu.querySelector("summary").focus();
    }
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
