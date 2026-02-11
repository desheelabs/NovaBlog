(function () {
  "use strict";

  var root = document.documentElement;

  function setTheme(next) {
    root.setAttribute("data-theme", next);
    try {
      localStorage.setItem("nb_theme", next);
    } catch (e) {}
    updateThemeIcon(next);
  }

  function setUiAttr(name, value) {
    if (value == null || value === false || value === "0") root.removeAttribute(name);
    else root.setAttribute(name, value === true ? "1" : String(value));
    try {
      localStorage.setItem("nb_" + name, root.getAttribute(name) || "");
    } catch (e) {}
  }

  function restoreUiAttr(name) {
    try {
      var v = localStorage.getItem("nb_" + name);
      if (v) root.setAttribute(name, v);
    } catch (e) {}
  }

  function initPageReady() {
    window.setTimeout(function () {
      document.body.classList.add("is-ready");
    }, 0);
  }

  function initPageTransitions() {
    document.addEventListener("click", function (e) {
      var a = e.target.closest("a[href]");
      if (!a) return;
      var href = a.getAttribute("href") || "";
      if (!href || href.startsWith("#") || href.startsWith("http") || href.startsWith("mailto:")) return;
      if (a.target === "_blank") return;
      e.preventDefault();
      document.body.classList.remove("is-ready");
      window.setTimeout(function () {
        window.location.href = href;
      }, 140);
    });
  }

  function initCursorFollower() {
    var el = document.querySelector("[data-cursor]");
    if (!el) return;
    var x = -999;
    var y = -999;

    document.addEventListener(
      "mousemove",
      function (e) {
        x = e.clientX;
        y = e.clientY;
        el.style.transform = "translate(" + (x - 13) + "px," + (y - 13) + "px)";
      },
      { passive: true }
    );
  }

  function initUiToggles() {
    restoreUiAttr("data-ui");
    restoreUiAttr("data-minimal");

    var neo = document.querySelector("[data-neo-toggle]");
    if (neo)
      neo.addEventListener("click", function () {
        setUiAttr("data-ui", root.getAttribute("data-ui") === "neo" ? "" : "neo");
      });

    var min = document.querySelector("[data-min-toggle]");
    if (min)
      min.addEventListener("click", function () {
        setUiAttr("data-minimal", root.getAttribute("data-minimal") === "1" ? "" : "1");
      });
  }

  function initFab() {
    var fab = document.querySelector("[data-fab]");
    if (!fab) return;
    fab.addEventListener("click", function () {
      var modal = document.querySelector("[data-newsletter-modal]") || document.querySelector("[data-auth-modal]");
      if (modal) {
        modal.classList.add("is-open");
        modal.setAttribute("aria-hidden", "false");
      }
    });
  }

  function computeAccentFromImage(img) {
    try {
      var c = document.createElement("canvas");
      var w = 18;
      var h = 18;
      c.width = w;
      c.height = h;
      var ctx = c.getContext("2d", { willReadFrequently: true });
      ctx.drawImage(img, 0, 0, w, h);
      var d = ctx.getImageData(0, 0, w, h).data;
      var r = 0,
        g = 0,
        b = 0,
        n = 0;
      for (var i = 0; i < d.length; i += 16) {
        r += d[i];
        g += d[i + 1];
        b += d[i + 2];
        n += 1;
      }
      r = Math.round(r / n);
      g = Math.round(g / n);
      b = Math.round(b / n);
      root.style.setProperty("--primary", "rgb(" + r + "," + g + "," + b + ")");
      root.style.setProperty("--primary-2", "rgba(" + r + "," + g + "," + b + ", .55)");
      return { r: r, g: g, b: b };
    } catch (e) {
      return null;
    }
  }

  function renderPalette(rgb) {
    var palette = document.querySelector("[data-palette]");
    if (!palette || !rgb) return;
    var r = rgb.r,
      g = rgb.g,
      b = rgb.b;
    palette.innerHTML =
      "<span class=\"swatch\" style=\"background:rgb(" +
      r +
      "," +
      g +
      "," +
      b +
      ")\"></span>";
  }

  function initMediaModal() {
    var modal = document.querySelector("[data-media-modal]");
    if (!modal) return;
    var stage = modal.querySelector("[data-media-stage]");
    var title = modal.querySelector("[data-media-title]");
    var prev = modal.querySelector("[data-media-prev]");
    var next = modal.querySelector("[data-media-next]");
    var zoom = modal.querySelector("[data-media-zoom]");
    var closeEls = modal.querySelectorAll("[data-media-close]");

    var items = [];
    var idx = 0;

    function refreshItems() {
      items = Array.prototype.slice.call(document.querySelectorAll("[data-open-media]"));
    }

    function setOpen(open) {
      modal.classList.toggle("is-open", open);
      modal.setAttribute("aria-hidden", open ? "false" : "true");
      if (!open && stage) {
        stage.classList.remove("is-zoom");
        stage.innerHTML = "";
      }
    }

    function show(i) {
      refreshItems();
      if (!items.length) return;
      idx = (i + items.length) % items.length;
      var el = items[idx];
      var webp = el.getAttribute("data-media-webp") || "";
      var jpg = el.getAttribute("data-media-jpg") || "";
      var t = el.getAttribute("data-media-title") || "";
      if (title) title.textContent = t;
      if (!stage) return;

      stage.classList.remove("is-zoom");
      stage.innerHTML =
        "<picture>" +
        (webp ? "<source type=\"image/webp\" srcset=\"" + webp + "\">" : "") +
        "<img alt=\"" + (t || "") + "\" src=\"" + (jpg || webp) + "\" crossorigin=\"anonymous\" />" +
        "</picture>";

      var img = stage.querySelector("img");
      if (img) {
        img.onload = function () {
          var rgb = computeAccentFromImage(img);
          renderPalette(rgb);
        };
      }
    }

    document.addEventListener("click", function (e) {
      var open = e.target.closest("[data-open-media]");
      if (!open) return;
      e.preventDefault();
      refreshItems();
      var i = items.indexOf(open);
      setOpen(true);
      show(i >= 0 ? i : 0);
    });

    if (prev)
      prev.addEventListener("click", function () {
        show(idx - 1);
      });
    if (next)
      next.addEventListener("click", function () {
        show(idx + 1);
      });
    if (zoom)
      zoom.addEventListener("click", function () {
        if (stage) stage.classList.toggle("is-zoom");
      });

    Array.prototype.forEach.call(closeEls, function (el) {
      el.addEventListener("click", function () {
        setOpen(false);
      });
    });

    document.addEventListener("keydown", function (e) {
      if (!modal.classList.contains("is-open")) return;
      if (e.key === "Escape") setOpen(false);
      if (e.key === "ArrowLeft") show(idx - 1);
      if (e.key === "ArrowRight") show(idx + 1);
    });
  }

  function initHorizontalGallery() {
    var track = document.querySelector("[data-hscroll-track]");
    var data = window.NovaBlogData;
    var store = window.NovaStore;
    if (!track || !data || !store) return;

    var posts = store.getPublishedPosts().slice(0, 10);

    function esc(s) {
      return String(s)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");
    }

    track.innerHTML = posts
      .map(function (p) {
        return (
          "<div class=\"hitem\">" +
          "<div class=\"hitem-media\" data-open-media data-media-webp=\"" +
          esc(p.imageWebp || "") +
          "\" data-media-jpg=\"" +
          esc(p.imageJpg || "") +
          "\" data-media-title=\"" +
          esc(p.title || "") +
          "\">" +
          "<picture>" +
          (p.imageWebp ? "<source type=\"image/webp\" data-srcset=\"" + esc(p.imageWebp) + "\">" : "") +
          "<img class=\"lazy\" alt=\"" +
          esc(p.title || "") +
          "\" data-src=\"" +
          esc(p.imageJpg || p.imageWebp || "") +
          "\" width=\"1400\" height=\"900\" decoding=\"async\" />" +
          "</picture>" +
          "</div>" +
          "<div class=\"hitem-body\">" +
          "<div class=\"hitem-title\">" +
          esc(p.title || "") +
          "</div>" +
          "<div class=\"hitem-meta\">" +
          esc(p.category || "") +
          "</div>" +
          "</div>" +
          "</div>"
        );
      })
      .join("");
  }

  function initGlobalLazy() {
    var imgs = Array.prototype.slice.call(document.querySelectorAll("img.lazy[data-src]"));
    if (!imgs.length) return;

    function load(img) {
      var pic = img.closest("picture");
      if (pic) {
        var source = pic.querySelector("source[data-srcset]");
        if (source) {
          source.srcset = source.getAttribute("data-srcset");
          source.removeAttribute("data-srcset");
        }
      }
      img.src = img.getAttribute("data-src");
      img.loading = "lazy";
      img.decoding = "async";
      img.removeAttribute("data-src");
      img.classList.add("is-loaded");
    }

    if (!("IntersectionObserver" in window)) {
      imgs.forEach(load);
      return;
    }

    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (!e.isIntersecting) return;
          load(e.target);
          io.unobserve(e.target);
        });
      },
      { rootMargin: "250px 0px" }
    );

    imgs.forEach(function (img) {
      io.observe(img);
    });
  }

  async function loadFooterModule() {
    var hosts = document.querySelectorAll("[data-footer-host]");
    if (!hosts.length) return;

    try {
      var res = await fetch("modules/footer.html", { cache: "no-store" });
      if (!res.ok) return;
      var html = await res.text();
      hosts.forEach(function (h) {
        h.innerHTML = html;
      });
      initFooterBehaviors();
    } catch (e) {
      var fallback = window.NovaFooterTemplate;
      if (!fallback) return;
      hosts.forEach(function (h) {
        h.innerHTML = fallback;
      });
      initFooterBehaviors();
    }
  }

  function initFooterBehaviors() {
    var store = window.NovaStore;

    var year = document.querySelector("[data-auto-year]");
    if (year) year.textContent = String(new Date().getFullYear());

    var lang = document.querySelector("[data-lang-switch]");
    var cur = document.querySelector("[data-currency-switch]");

    try {
      if (lang) lang.value = localStorage.getItem("nb_lang") || lang.value;
      if (cur) cur.value = localStorage.getItem("nb_currency") || cur.value;
    } catch (e) {}

    if (lang) {
      lang.addEventListener("change", function () {
        try {
          localStorage.setItem("nb_lang", lang.value);
        } catch (e) {}
      });
    }

    if (cur) {
      cur.addEventListener("change", function () {
        try {
          localStorage.setItem("nb_currency", cur.value);
        } catch (e) {}
      });
    }

    var recent = document.querySelector("[data-footer-recent]");
    if (recent && store && store.getPublishedPosts) {
      var posts = store.getPublishedPosts().slice().sort(function (a, b) {
        return String(b.dateISO || "").localeCompare(String(a.dateISO || ""));
      });

      recent.innerHTML = posts
        .slice(0, 4)
        .map(function (p) {
          return (
            "<a class=\"footer-mini__item\" href=\"post.html?id=" +
            encodeURIComponent(p.id) +
            "\">" +
            "<span class=\"footer-mini__title\">" +
            String(p.title || "") +
            "</span>" +
            "<span class=\"footer-mini__meta\">" +
            String(p.category || "") +
            "</span>" +
            "</a>"
          );
        })
        .join("");
    }

    var cats = document.querySelector("[data-footer-cats]");
    if (cats && store && store.getCategories) {
      var list = store.getCategories().slice(0, 8);
      cats.innerHTML = list
        .map(function (c) {
          return "<a href=\"#posts\" data-scroll>" + String(c) + "</a>";
        })
        .join("");
    }

    var form = document.querySelector("[data-footer-newsletter]");
    var note = document.querySelector("[data-footer-newsletter-note]");
    if (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        var email = (form.elements.email && form.elements.email.value || "").trim();
        if (!email) return;
        try {
          localStorage.setItem("nb_newsletter_email", email);
          localStorage.setItem("nb_newsletter_subscribed", "1");
        } catch (err) {}
        if (note) note.textContent = "Subscribed: " + email;
        form.reset();
      });
    }

    var strip = document.querySelector("[data-social-strip]");
    if (strip) {
      var thumbs = strip.querySelectorAll(".social-thumb");
      thumbs.forEach(function (t, i) {
        t.style.backgroundImage =
          "radial-gradient(circle at 30% 30%, rgba(125,211,252,.35), transparent 55%)," +
          "radial-gradient(circle at 70% 70%, rgba(167,139,250,.30), transparent 55%)," +
          "linear-gradient(135deg, rgba(255,255,255,.10), rgba(255,255,255,.02))";
        t.style.opacity = String(0.9 - i * 0.04);
      });
    }

    initFooterReveal();
  }

  function initFooterReveal() {
    var footer = document.querySelector("footer[data-footer]");
    if (!footer) return;

    var targets = [];
    var social = footer.querySelector(".social-row");
    if (social) targets.push(social);
    var grid = footer.querySelector(".footer-grid");
    if (grid) {
      var blocks = Array.prototype.slice.call(grid.children || []);
      blocks.forEach(function (b, i) {
        b.classList.add("reveal");
        if (i === 1) b.classList.add("d2");
        if (i === 2) b.classList.add("d3");
        if (i === 3) b.classList.add("d4");
        if (i >= 4) b.classList.add("d5");
        targets.push(b);
      });
    }
    var bottom = footer.querySelector(".footer-bottom");
    if (bottom) targets.push(bottom);

    if (!targets.length) return;

    var reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      targets.forEach(function (t) {
        t.classList.add("is-in");
      });
      return;
    }

    if (!("IntersectionObserver" in window)) {
      targets.forEach(function (t) {
        t.classList.add("is-in");
      });
      return;
    }

    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (!e.isIntersecting) return;
          e.target.classList.add("is-in");
          io.unobserve(e.target);
        });
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.1 }
    );

    targets.forEach(function (t) {
      if (!t.classList.contains("reveal")) t.classList.add("reveal");
      io.observe(t);
    });
  }

  function getStoredTheme() {
    try {
      return localStorage.getItem("nb_theme");
    } catch (e) {
      return null;
    }
  }

  function prefersDark() {
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  }

  function updateThemeIcon(theme) {
    var icon = document.querySelector("[data-theme-icon]");
    if (!icon) return;
    icon.textContent = theme === "dark" ? "◑" : "◐";
  }

  function initTheme() {
    var stored = getStoredTheme();
    if (stored === "light" || stored === "dark") {
      setTheme(stored);
      return;
    }
    setTheme(prefersDark() ? "dark" : "light");
  }

  function initThemeToggle() {
    var btns = document.querySelectorAll("[data-theme-toggle]");
    if (!btns.length) return;

    btns.forEach(function (btn) {
      btn.addEventListener("click", function () {
        var current = root.getAttribute("data-theme") || "light";
        setTheme(current === "dark" ? "light" : "dark");
      });
    });
  }

  function initMaintenanceRedirect() {
    var store = window.NovaStore;
    if (!store) return;

    var path = (window.location.pathname || "").toLowerCase();
    var isAdmin = path.endsWith("/admin.html") || path.endsWith("\\admin.html") || path.endsWith("admin.html");
    var isMaintenance = path.endsWith("/maintenance.html") || path.endsWith("\\maintenance.html") || path.endsWith("maintenance.html");
    if (isAdmin || isMaintenance) return;

    if (store.getMaintenance && store.getMaintenance()) {
      window.location.replace("maintenance.html");
    }
  }

  function initAuth() {
    var store = window.NovaStore;
    if (!store) return;

    var areas = document.querySelectorAll("[data-auth-area]");
    var modal = document.querySelector("[data-auth-modal]");
    var closeEls = modal ? modal.querySelectorAll("[data-auth-close]") : [];
    var form = modal ? modal.querySelector("[data-auth-form]") : null;
    var note = modal ? modal.querySelector("[data-auth-note]") : null;
    var title = modal ? modal.querySelector("[data-auth-title]") : null;
    var sub = modal ? modal.querySelector("[data-auth-sub]") : null;
    var switchBtn = modal ? modal.querySelector("[data-auth-switch]") : null;
    var nameField = modal ? modal.querySelector("[data-auth-name-field]") : null;
    var submitBtn = modal ? modal.querySelector("[data-auth-submit]") : null;

    var mode = "login";

    function setMode(next) {
      mode = next;
      if (title) title.textContent = mode === "signup" ? "Signup" : "Login";
      if (sub) sub.textContent = mode === "signup" ? "Create a demo account (stored locally)." : "Access profile and admin (demo).";
      if (switchBtn) switchBtn.textContent = mode === "signup" ? "Switch to Login" : "Switch to Signup";
      if (nameField) nameField.style.display = mode === "signup" ? "grid" : "none";
      if (submitBtn) submitBtn.textContent = mode === "signup" ? "Create account" : "Login";
      if (note) note.textContent = "";
      if (form) form.reset();
    }

    function setOpen(open) {
      if (!modal) return;
      modal.classList.toggle("is-open", open);
      modal.setAttribute("aria-hidden", open ? "false" : "true");
      if (open) {
        var input = modal.querySelector("input[name='email']");
        if (input) input.focus();
      }
    }

    function renderAreas() {
      var session = store.getSession && store.getSession();
      areas.forEach(function (a) {
        if (!a) return;
        if (!session) {
          a.innerHTML = "<button class=\"icon-btn\" type=\"button\" data-auth-open aria-label=\"Login\"><span class=\"icon\" aria-hidden=\"true\">👤</span></button>";
          return;
        }
        a.innerHTML =
          "<a class=\"nav-link\" href=\"profile.html\">" +
          "Profile</a>" +
          "<a class=\"nav-link\" href=\"admin.html\">Admin</a>" +
          "<button class=\"icon-btn\" type=\"button\" data-auth-logout aria-label=\"Logout\"><span class=\"icon\" aria-hidden=\"true\">⎋</span></button>";
      });
    }

    document.addEventListener("click", function (e) {
      var open = e.target.closest("[data-auth-open]");
      if (open) {
        setMode("login");
        setOpen(true);
      }

      var logout = e.target.closest("[data-auth-logout]");
      if (logout) {
        store.clearSession();
        renderAreas();
      }
    });

    if (switchBtn) {
      switchBtn.addEventListener("click", function () {
        setMode(mode === "login" ? "signup" : "login");
      });
    }

    Array.prototype.forEach.call(closeEls, function (el) {
      el.addEventListener("click", function () {
        setOpen(false);
      });
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && modal && modal.classList.contains("is-open")) setOpen(false);
    });

    if (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        var email = (form.elements.email && form.elements.email.value || "").trim();
        var password = (form.elements.password && form.elements.password.value || "").trim();
        var name = (form.elements.name && form.elements.name.value || "").trim();

        if (!email || !password) return;

        var res;
        if (mode === "signup") {
          res = store.signup(email, password, name);
        } else {
          res = store.login(email, password);
        }

        if (!res || !res.ok) {
          if (note) note.textContent = (res && res.message) ? res.message : "Auth failed";
          return;
        }

        renderAreas();
        if (note) note.textContent = "Success";
        window.setTimeout(function () {
          setOpen(false);
        }, 500);
      });
    }

    setMode("login");
    renderAreas();
  }

  function initNewsletterModal() {
    var modal = document.querySelector("[data-newsletter-modal]");
    var openBtn = document.querySelector("[data-newsletter-open]");
    if (!modal || !openBtn) return;

    var closeEls = modal.querySelectorAll("[data-modal-close]");
    var form = modal.querySelector("[data-newsletter-form]");
    var note = modal.querySelector("[data-newsletter-note]");

    function setOpen(open) {
      modal.classList.toggle("is-open", open);
      modal.setAttribute("aria-hidden", open ? "false" : "true");
      if (open) {
        var input = modal.querySelector("input[name='email']");
        if (input) input.focus();
      }
    }

    openBtn.addEventListener("click", function () {
      setOpen(true);
    });

    closeEls.forEach(function (el) {
      el.addEventListener("click", function () {
        setOpen(false);
      });
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && modal.classList.contains("is-open")) setOpen(false);
    });

    if (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        var email = (form.elements.email && form.elements.email.value || "").trim();
        if (!email) return;
        try {
          localStorage.setItem("nb_newsletter_email", email);
          localStorage.setItem("nb_newsletter_subscribed", "1");
        } catch (err) {}
        if (note) note.textContent = "Subscribed: " + email;
        window.setTimeout(function () {
          setOpen(false);
        }, 700);
      });
    }

    try {
      var subscribed = localStorage.getItem("nb_newsletter_subscribed") === "1";
      if (!subscribed) {
        window.setTimeout(function () {
          if (!modal.classList.contains("is-open")) setOpen(true);
        }, 5500);
      }
    } catch (err2) {}
  }

  function formatCompact(n) {
    try {
      return new Intl.NumberFormat(undefined, { notation: "compact" }).format(n);
    } catch (e) {
      return String(n);
    }
  }

  function initFollowCounters() {
    var wrap = document.querySelector("[data-follow-counters]");
    if (!wrap) return;
    var data = window.NovaBlogData;
    if (!data || !data.socials) return;

    var els = wrap.querySelectorAll("[data-counter]");
    els.forEach(function (el) {
      var key = el.getAttribute("data-counter");
      var target = Number(data.socials[key] || 0);
      var start = Math.max(0, Math.floor(target * 0.85));
      var steps = 18;
      var i = 0;
      var timer = window.setInterval(function () {
        i += 1;
        var v = Math.round(start + (target - start) * (i / steps));
        el.textContent = formatCompact(v);
        if (i >= steps) window.clearInterval(timer);
      }, 40);
    });
  }

  function initNotificationBell() {
    var bell = document.querySelector("[data-notify-bell]");
    if (!bell) return;

    bell.addEventListener("click", async function () {
      if (!("Notification" in window)) {
        window.alert("Notifications are not supported in this browser.");
        return;
      }

      var perm = Notification.permission;
      if (perm !== "granted") {
        try {
          perm = await Notification.requestPermission();
        } catch (e) {
          perm = "denied";
        }
      }

      if (perm !== "granted") {
        window.alert("Notification permission not granted.");
        return;
      }

      try {
        new Notification("NovaBlog", { body: "You will be notified when new posts are available (demo)." });
      } catch (e2) {
        window.alert("Notifications enabled (demo).");
      }
    });
  }

  function initMobileNav() {
    var toggle = document.querySelector("[data-nav-toggle]");
    var panel = document.querySelector("[data-nav-panel]");
    if (!toggle || !panel) return;

    function setOpen(open) {
      panel.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    }

    toggle.addEventListener("click", function () {
      var isOpen = panel.classList.contains("is-open");
      setOpen(!isOpen);
    });

    document.addEventListener("click", function (e) {
      if (!panel.classList.contains("is-open")) return;
      if (panel.contains(e.target) || toggle.contains(e.target)) return;
      setOpen(false);
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") setOpen(false);
    });
  }

  function initMegaMenu() {
    var wrap = document.querySelector("[data-mega]");
    if (!wrap) return;

    var btn = wrap.querySelector("[data-mega-toggle]");
    var menu = wrap.querySelector(".mega");
    if (!btn || !menu) return;

    function setOpen(open) {
      menu.classList.toggle("is-open", open);
      btn.setAttribute("aria-expanded", open ? "true" : "false");
    }

    btn.addEventListener("click", function () {
      var open = menu.classList.contains("is-open");
      setOpen(!open);
    });

    document.addEventListener("click", function (e) {
      if (!menu.classList.contains("is-open")) return;
      if (wrap.contains(e.target)) return;
      setOpen(false);
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") setOpen(false);
    });
  }

  function smoothScrollTo(target) {
    if (!target) return;

    var reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    target.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
  }

  function initSmoothScrolling() {
    document.addEventListener("click", function (e) {
      var a = e.target.closest("a[data-scroll]");
      if (!a) return;

      var href = a.getAttribute("href") || "";
      if (!href.startsWith("#")) return;

      var el = document.querySelector(href);
      if (!el) return;

      e.preventDefault();
      smoothScrollTo(el);
    });
  }

  function initBackToTop() {
    var btn = document.querySelector("[data-back-to-top]");
    if (!btn) return;

    function onScroll() {
      var y = window.scrollY || document.documentElement.scrollTop || 0;
      btn.classList.toggle("is-visible", y > 420);
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    btn.addEventListener("click", function () {
      smoothScrollTo(document.body);
      window.scrollTo({ top: 0, behavior: (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) ? "auto" : "smooth" });
    });
  }

  function initSkeletonLoading() {
    if (document.body && document.body.hasAttribute("data-dynamic-posts")) return;
    var skelGrid = document.querySelector("[data-skeleton-grid]");
    var postGrid = document.querySelector("[data-post-grid]");
    if (!skelGrid || !postGrid) return;

    window.setTimeout(function () {
      skelGrid.classList.add("is-hidden");
      postGrid.classList.remove("is-hidden");
    }, 900);
  }

  function initCopyLink() {
    var btn = document.querySelector("[data-copy-link]");
    if (!btn) return;

    btn.addEventListener("click", async function () {
      var url = window.location.href;
      try {
        await navigator.clipboard.writeText(url);
        btn.textContent = "Copied";
        window.setTimeout(function () {
          btn.textContent = "Copy Link";
        }, 1200);
      } catch (e) {
        window.prompt("Copy this link:", url);
      }
    });
  }

  initTheme();
  initThemeToggle();
  initMobileNav();
  initMegaMenu();
  initSmoothScrolling();
  initBackToTop();
  initSkeletonLoading();
  initCopyLink();
  initNewsletterModal();
  initFollowCounters();
  initNotificationBell();
  initMaintenanceRedirect();
  initAuth();
  initPageReady();
  initPageTransitions();
  initCursorFollower();
  initUiToggles();
  initFab();
  initHorizontalGallery();
  initGlobalLazy();
  initMediaModal();
  loadFooterModule();
})();
