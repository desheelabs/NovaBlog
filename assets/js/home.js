(function () {
  "use strict";

  var store = window.NovaStore;
  var data = window.NovaBlogData;
  if (!store || !data) return;

  var POSTS_PER_PAGE = 6;

  function qs(sel) {
    return document.querySelector(sel);
  }

  function escapeHtml(s) {
    return String(s)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }

  function formatDate(iso) {
    try {
      var d = new Date(iso);
      return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
    } catch (e) {
      return iso;
    }
  }

  function getReadingTimeFromHtml(html) {
    var text = String(html)
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    var words = text ? text.split(" ").length : 0;
    var minutes = Math.max(1, Math.round(words / 200));
    return minutes + " min read";
  }

  function postUrl(post) {
    return "post.html?id=" + encodeURIComponent(post.id);
  }

  function buildPicture(post, cls) {
    var webp = post.imageWebp;
    var jpg = post.imageJpg;
    if (!webp && !jpg) return "";

    var alt = escapeHtml(post.title || "");
    var h = post.featured ? 260 : 180 + ((post.title || "").length % 60);

    return (
      "<picture>" +
      (webp ? "<source type=\"image/webp\" data-srcset=\"" + escapeHtml(webp) + "\">" : "") +
      "<img class=\"" +
      escapeHtml(cls || "") +
      " lazy\" alt=\"" +
      alt +
      "\" data-src=\"" +
      escapeHtml(jpg || webp) +
      "\" width=\"1400\" height=\"" +
      h +
      "\" decoding=\"async\" />" +
      "</picture>"
    );
  }

  function initLazyPictures(scope) {
    var root = scope || document;
    var imgs = Array.prototype.slice.call(root.querySelectorAll("img.lazy[data-src]"));
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

  function renderCard(post) {
    var gradient = post.heroGradient || "linear-gradient(135deg, rgba(125,211,252,.18), rgba(167,139,250,.16))";
    var read = getReadingTimeFromHtml(post.contentHtml || "");

    return (
      "<article class=\"card post-card\">" +
      "<a class=\"card-link\" href=\"" +
      postUrl(post) +
      "\">" +
      "<div class=\"card-media\" data-open-media data-media-webp=\"" +
      escapeHtml(post.imageWebp || "") +
      "\" data-media-jpg=\"" +
      escapeHtml(post.imageJpg || "") +
      "\" data-media-title=\"" +
      escapeHtml(post.title || "") +
      "\" style=\"background-image: " +
      gradient +
      ";\">" +
      buildPicture(post, "card-img") +
      "</div>" +
      "<div class=\"card-body\">" +
      "<div class=\"card-kicker\">" +
      escapeHtml(post.category || "") +
      "</div>" +
      "<h3 class=\"card-title\">" +
      escapeHtml(post.title || "") +
      "</h3>" +
      "<p class=\"card-excerpt\">" +
      escapeHtml(post.excerpt || "") +
      "</p>" +
      "<div class=\"card-meta\">" +
      "<span>" +
      read +
      "</span><span>•</span><time datetime=\"" +
      escapeHtml(post.dateISO || "") +
      "\">" +
      escapeHtml(formatDate(post.dateISO || "")) +
      "</time>" +
      "</div>" +
      "</div>" +
      "</a>" +
      "</article>"
    );
  }

  function renderFeaturedSlide(post, idx, total) {
    var gradient = post.heroGradient || "linear-gradient(135deg, rgba(125,211,252,.18), rgba(167,139,250,.16))";
    var read = getReadingTimeFromHtml(post.contentHtml || "");

    return (
      "<div class=\"slide\" role=\"group\" aria-roledescription=\"slide\" aria-label=\"" +
      (idx + 1) +
      " of " +
      total +
      "\">" +
      "<a class=\"slide-inner glass\" href=\"" +
      postUrl(post) +
      "\" style=\"background-image: " +
      gradient +
      ";\">" +
      "<div class=\"slide-media\" data-open-media data-media-webp=\"" +
      escapeHtml(post.imageWebp || "") +
      "\" data-media-jpg=\"" +
      escapeHtml(post.imageJpg || "") +
      "\" data-media-title=\"" +
      escapeHtml(post.title || "") +
      "\">" +
      buildPicture(post, "slide-img") +
      "</div>" +
      "<div class=\"slide-overlay\"></div>" +
      "<div class=\"slide-content\">" +
      "<div class=\"slide-kicker\">Featured • " +
      escapeHtml(post.category || "") +
      "</div>" +
      "<div class=\"slide-title\">" +
      escapeHtml(post.title || "") +
      "</div>" +
      "<div class=\"slide-meta\">" +
      read +
      " • " +
      escapeHtml(formatDate(post.dateISO || "")) +
      "</div>" +
      "</div>" +
      "</a>" +
      "</div>"
    );
  }

  function initFeaturedSlider(posts) {
    var track = qs("[data-slider-track]");
    var prev = qs("[data-slider-prev]");
    var next = qs("[data-slider-next]");

    if (!track) return;

    var featured = posts.filter(function (p) {
      return !!p.featured;
    });

    if (!featured.length) return;

    track.innerHTML = featured
      .slice(0, 5)
      .map(function (p, idx, arr) {
        return renderFeaturedSlide(p, idx, arr.length);
      })
      .join("");

    var index = 0;

    function go(i) {
      var slides = track.querySelectorAll(".slide");
      if (!slides.length) return;
      index = (i + slides.length) % slides.length;
      track.style.transform = "translateX(" + -index * 100 + "%)";
    }

    if (prev)
      prev.addEventListener("click", function () {
        go(index - 1);
      });
    if (next)
      next.addEventListener("click", function () {
        go(index + 1);
      });

    window.setInterval(function () {
      var reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduced) return;
      go(index + 1);
    }, 6500);

    go(0);
  }

  function initListing(posts) {
    var skelGrid = qs("[data-skeleton-grid]");
    var grid = qs("[data-post-grid]");
    var loadMore = qs("[data-load-more]");
    var search = qs("[data-live-search]");
    var count = qs("[data-results-count]");

    if (!grid) return;

    var query = "";
    var page = 1;

    function matches(p) {
      if (!query) return true;
      var q = query.toLowerCase();
      var hay = [p.title, p.excerpt, p.category, (p.tags || []).join(" ")].join(" ").toLowerCase();
      return hay.includes(q);
    }

    function getFiltered() {
      return posts.filter(matches);
    }

    function render() {
      var filtered = getFiltered();
      var visible = filtered.slice(0, page * POSTS_PER_PAGE);

      grid.innerHTML = visible.map(renderCard).join("");
      initLazyPictures(grid);

      if (count) {
        count.textContent = filtered.length ? filtered.length + " results" : "No results";
      }

      if (loadMore) {
        loadMore.disabled = visible.length >= filtered.length;
        loadMore.classList.toggle("is-hidden", filtered.length <= POSTS_PER_PAGE);
      }
    }

    if (search) {
      search.addEventListener("input", function () {
        query = search.value.trim();
        page = 1;
        render();
      });
    }

    if (loadMore) {
      loadMore.addEventListener("click", function () {
        page += 1;
        render();
      });
    }

    window.setTimeout(function () {
      if (skelGrid) skelGrid.classList.add("is-hidden");
      grid.classList.remove("is-hidden");
      render();
    }, 750);
  }

  var posts = store.getPublishedPosts().slice().sort(function (a, b) {
    return String(b.dateISO || "").localeCompare(String(a.dateISO || ""));
  });

  initFeaturedSlider(posts);
  initListing(posts);

  window.setTimeout(function () {
    initLazyPictures(document);
  }, 0);
})();
