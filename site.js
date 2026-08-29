/* Achondroplasia Guide — progressive enhancements (site works fully without JS) */
(function () {
  "use strict";

  document.body.classList.add("js");

  /* Mobile nav toggle */
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.querySelector(".site-nav");
  if (toggle && nav) {
    var mq = window.matchMedia("(max-width: 47rem)");
    var sync = function () {
      if (mq.matches) {
        nav.hidden = true;
        toggle.setAttribute("aria-expanded", "false");
      } else {
        nav.hidden = false;
      }
    };
    sync();
    mq.addEventListener ? mq.addEventListener("change", sync) : mq.addListener(sync);
    toggle.addEventListener("click", function () {
      var open = nav.hidden;
      nav.hidden = !open;
      toggle.setAttribute("aria-expanded", String(open));
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

  /* Build the "On this page" list from h2 headings */
  var tocList = document.querySelector(".toc ul");
  var main = document.querySelector("main");
  if (tocList && main) {
    var headings = main.querySelectorAll("h2:not(.sources h2)");
    var used = {};
    headings.forEach(function (h) {
      if (h.closest(".sources")) return;
      if (!h.id) {
        var slug = h.textContent
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, "")
          .trim()
          .replace(/\s+/g, "-")
          .slice(0, 60);
        var base = slug || "section";
        var n = 1;
        slug = base;
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
    });
    if (!headings.length) {
      var toc = document.querySelector(".toc");
      if (toc) toc.hidden = true;
    }
  }
})();
