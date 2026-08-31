/* Achondroplasia Guide — progressive enhancements (site works fully without JS) */
(function () {
  "use strict";

  document.body.classList.add("js");

  /* The bar is pinned (position: sticky). Publish its measured height as
     --header-h so anchor jumps, the sidebar TOC, and the menu panel clear it. */
  var header = document.querySelector(".site-header");
  if (header) {
    var setHeaderHeight = function () {
      document.documentElement.style.setProperty(
        "--header-h",
        header.offsetHeight + "px"
      );
    };
    setHeaderHeight();
    if ("ResizeObserver" in window) {
      new ResizeObserver(setHeaderHeight).observe(header);
    } else {
      window.addEventListener("resize", setHeaderHeight);
    }
  }

  /* Site nav. On wide screens it starts "docked": in normal flow below the
     bar, fully visible, scrolling away with the page. Once it has scrolled
     out of view it collapses behind the Menu button, which reopens it as a
     fixed panel under the bar. Phones skip the docked stage. A spacer of
     equal height stands in for the collapsed nav so the swap never shifts
     the page. */
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.querySelector(".site-nav");
  if (header && toggle && nav) {
    var desktop = window.matchMedia("(min-width: 47.01rem)");
    var spacer = document.createElement("div");
    spacer.setAttribute("aria-hidden", "true");
    var state; // "docked" | "collapsed" | "overlay"
    var navH = 0;
    var collapsePoint = 0;

    var dock = function () {
      nav.classList.remove("site-nav--overlay");
      nav.hidden = false;
      spacer.remove();
      toggle.hidden = true;
      toggle.setAttribute("aria-expanded", "false");
      state = "docked";
      navH = nav.offsetHeight;
      collapsePoint = nav.offsetTop + navH - header.offsetHeight;
    };
    var collapse = function () {
      nav.classList.remove("site-nav--overlay");
      nav.hidden = true;
      if (desktop.matches) {
        spacer.style.height = navH + "px";
        if (!spacer.parentNode) nav.parentNode.insertBefore(spacer, nav);
      } else {
        spacer.remove();
      }
      toggle.hidden = false;
      toggle.setAttribute("aria-expanded", "false");
      state = "collapsed";
    };
    var openOverlay = function () {
      nav.classList.add("site-nav--overlay");
      nav.hidden = false;
      toggle.setAttribute("aria-expanded", "true");
      state = "overlay";
    };

    /* Scroll only moves us between docked and collapsed on wide screens;
       an open panel is left alone. */
    var sync = function () {
      if (!desktop.matches) return;
      if (state === "docked") {
        if (window.scrollY >= collapsePoint) collapse();
      } else if (state === "collapsed" && window.scrollY < collapsePoint) {
        dock();
      }
    };
    var onModeChange = function () {
      if (desktop.matches) {
        dock(); // measure in the docked state
        sync();
      } else {
        collapse();
      }
    };
    onModeChange();

    var ticking = false;
    window.addEventListener(
      "scroll",
      function () {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(function () {
          ticking = false;
          sync();
        });
      },
      { passive: true }
    );
    desktop.addEventListener("change", onModeChange);
    window.addEventListener("resize", function () {
      if (state === "docked") dock(); // re-measure after reflow
    });

    toggle.addEventListener("click", function () {
      state === "overlay" ? collapse() : openOverlay();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && state === "overlay") {
        collapse();
        toggle.focus();
      }
    });
    document.addEventListener("click", function (e) {
      if (
        state === "overlay" &&
        !e.target.closest(".site-header") &&
        !e.target.closest(".site-nav")
      ) {
        collapse();
      }
    });
  }

  /* Mark the current page in the nav (handles both "page" and "page.html") */
  var pageName = function (path) {
    var name = path.split("/").pop().replace(/\.html$/, "");
    return name === "" || name === "." ? "index" : name;
  };
  var here = pageName(location.pathname);
  document.querySelectorAll(".site-nav a").forEach(function (a) {
    if (pageName(a.getAttribute("href")) === here) {
      a.setAttribute("aria-current", "page");
    }
  });

  /* Build the "On this page" list from h2 headings.
     Ids are normally baked into the HTML so #fragment links work on load;
     this fills in any that are missing. */
  var toc = document.querySelector(".toc");
  var tocList = toc && toc.querySelector("ul");
  var main = document.querySelector("main");
  var count = 0;
  if (tocList && main) {
    var used = {};
    main.querySelectorAll("h2").forEach(function (h) {
      if (h.closest(".sources")) return;
      if (!h.id) {
        var base =
          h.textContent
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, "")
            .trim()
            .replace(/\s+/g, "-")
            .slice(0, 60) || "section";
        var slug = base;
        var n = 1;
        while (used[slug] || document.getElementById(slug)) {
          n += 1;
          slug = base + "-" + n;
        }
        h.id = slug;
      }
      used[h.id] = true;
      var li = document.createElement("li");
      var link = document.createElement("a");
      link.href = "#" + h.id;
      link.textContent = h.textContent;
      li.appendChild(link);
      tocList.appendChild(li);
      count += 1;
    });
  }

  /* On narrow screens the sidebar would otherwise sit above the page title.
     Move it below the intro instead, and collapse it so it stays out of the
     way of the reading. */
  if (toc && count) {
    var anchorEl = main.querySelector(".lede") || main.querySelector("h1");
    var home = document.createComment("toc");
    toc.parentNode.insertBefore(home, toc);

    var summary = document.createElement("button");
    summary.className = "toc__toggle";
    summary.type = "button";
    summary.setAttribute("aria-expanded", "false");
    summary.setAttribute("aria-controls", "toc-list");
    summary.textContent = "On this page (" + count + " sections)";
    tocList.id = "toc-list";
    summary.addEventListener("click", function () {
      var open = summary.getAttribute("aria-expanded") === "true";
      summary.setAttribute("aria-expanded", String(!open));
      tocList.hidden = open;
    });

    var narrow = window.matchMedia("(max-width: 61.99rem)");
    var placeToc = function () {
      if (narrow.matches) {
        if (anchorEl && anchorEl.nextSibling !== toc) {
          anchorEl.parentNode.insertBefore(toc, anchorEl.nextSibling);
        }
        if (!summary.parentNode) toc.insertBefore(summary, tocList);
        toc.classList.add("toc--collapsible");
        tocList.hidden = summary.getAttribute("aria-expanded") !== "true";
      } else {
        if (home.parentNode && home.nextSibling !== toc) {
          home.parentNode.insertBefore(toc, home);
        }
        if (summary.parentNode) summary.remove();
        toc.classList.remove("toc--collapsible");
        tocList.hidden = false;
      }
    };
    placeToc();
    narrow.addEventListener("change", placeToc);

    /* Collapse again after jumping to a section */
    tocList.addEventListener("click", function (e) {
      if (e.target.tagName === "A" && narrow.matches) {
        summary.setAttribute("aria-expanded", "false");
        tocList.hidden = true;
      }
    });
  } else if (toc) {
    toc.hidden = true;
  }
})();
