(function () {
  "use strict";

  var bar = document.querySelector("[data-reading-progress]");
  var article = document.querySelector("[data-article]");
  var toc = document.querySelector("[data-toc]");
  var relatedGrid = document.querySelector("[data-related-grid]");
  var share = document.querySelector("[data-share]");
  var postTitle = document.querySelector("[data-post-title]");
  var postSubtitle = document.querySelector("[data-post-subtitle]");
  var postKicker = document.querySelector("[data-post-kicker]");
  var postDate = document.querySelector("[data-post-date]");
  var postCover = document.querySelector("[data-post-cover]");
  var likeBtn = document.querySelector("[data-like-btn]");
  var likeCount = document.querySelector("[data-like-count]");
  var ratingWrap = document.querySelector("[data-rating]");
  var ratingNote = document.querySelector("[data-rating-note]");
  var ttsPlay = document.querySelector("[data-tts-play]");
  var ttsStop = document.querySelector("[data-tts-stop]");
  var printBtn = document.querySelector("[data-print]");
  var authorAvatar = document.querySelector("[data-author-avatar]");
  var authorName = document.querySelector("[data-author-name]");
  var authorTitle = document.querySelector("[data-author-title]");
  var authorBio = document.querySelector("[data-author-bio]");
  var authorLinks = document.querySelector("[data-author-links]");
  var pollWrap = document.querySelector("[data-poll]");
  var commentForm = document.querySelector("[data-comment-form]");
  var commentList = document.querySelector("[data-comment-list]");
  var clearCommentsBtn = document.querySelector("[data-clear-comments]");
  var exportPdfBtn = document.querySelector("[data-export-pdf]");
  var passwordGate = document.querySelector("[data-password-gate]");
  var passwordForm = document.querySelector("[data-password-form]");
  var passwordNote = document.querySelector("[data-password-note]");

  if (!bar || !article) return;

  var data = window.NovaBlogData;
  var store = window.NovaStore;

  function qs(sel, el) {
    return (el || document).querySelector(sel);
  }

  function qsa(sel, el) {
    return Array.prototype.slice.call((el || document).querySelectorAll(sel));
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

  function getParam(name) {
    try {
      return new URLSearchParams(window.location.search).get(name);
    } catch (e) {
      return null;
    }
  }

  function estimateReadingTimeFromHtml(html) {
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

  function setShareButtons(url, title) {
    if (!share) return;

    var u = encodeURIComponent(url);
    var t = encodeURIComponent(title || "");

    share.innerHTML =
      "<a class=\"share-btn\" href=\"https://wa.me/?text=" +
      t +
      "%20" +
      u +
      "\" target=\"_blank\" rel=\"noopener\">WhatsApp</a>" +
      "<a class=\"share-btn\" href=\"https://www.facebook.com/sharer/sharer.php?u=" +
      u +
      "\" target=\"_blank\" rel=\"noopener\">Facebook</a>" +
      "<a class=\"share-btn\" href=\"https://twitter.com/intent/tweet?text=" +
      t +
      "&url=" +
      u +
      "\" target=\"_blank\" rel=\"noopener\">Twitter</a>" +
      "<a class=\"share-btn\" href=\"https://www.linkedin.com/sharing/share-offsite/?url=" +
      u +
      "\" target=\"_blank\" rel=\"noopener\">LinkedIn</a>";
  }

  function initLazyImages(scope) {
    var imgs = qsa("img.lazy[data-src]", scope);
    if (!imgs.length) return;

    if (!("IntersectionObserver" in window)) {
      imgs.forEach(function (img) {
        img.src = img.getAttribute("data-src");
        img.removeAttribute("data-src");
      });
      return;
    }

    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var img = entry.target;
          img.src = img.getAttribute("data-src");
          img.loading = "lazy";
          img.decoding = "async";
          img.removeAttribute("data-src");
          io.unobserve(img);
        });
      },
      { rootMargin: "250px 0px" }
    );

    imgs.forEach(function (img) {
      io.observe(img);
    });
  }

  function highlightCode(scope) {
    var blocks = qsa("pre code", scope);
    if (!blocks.length) return;

    var kw = new Set([
      "const",
      "let",
      "var",
      "function",
      "return",
      "if",
      "else",
      "for",
      "while",
      "switch",
      "case",
      "break",
      "continue",
      "class",
      "new",
      "try",
      "catch",
      "finally",
      "throw",
      "import",
      "from",
      "export",
      "default",
      "async",
      "await"
    ]);

    function tokenize(code) {
      var s = escapeHtml(code);
      s = s.replace(/\/\/[^\n]*/g, function (m) {
        return "<span class=\"tok-com\">" + m + "</span>";
      });
      s = s.replace(/\b(\d+(?:\.\d+)?)\b/g, "<span class=\"tok-num\">$1</span>");
      s = s.replace(/`[^`]*`/g, function (m) {
        return "<span class=\"tok-str\">" + m + "</span>";
      });
      s = s.replace(/'(?:\\'|[^'])*'|\"(?:\\\"|[^\"])*\"/g, function (m) {
        return "<span class=\"tok-str\">" + m + "</span>";
      });
      s = s.replace(/\b([A-Za-z_$][\w$]*)\b/g, function (m, w) {
        if (kw.has(w)) return "<span class=\"tok-kw\">" + w + "</span>";
        if (/^[A-Z]/.test(w)) return "<span class=\"tok-key\">" + w + "</span>";
        return w;
      });
      s = s.replace(/\b([a-zA-Z_$][\w$]*)\s*(?=\()/g, "<span class=\"tok-fn\">$1</span>");
      return s;
    }

    blocks.forEach(function (codeEl) {
      var raw = codeEl.textContent || "";
      codeEl.innerHTML = tokenize(raw);
    });
  }

  function buildToc(scope) {
    if (!toc) return;
    var headings = qsa("h2, h3", scope);
    if (!headings.length) {
      toc.innerHTML = "";
      return;
    }

    var html = headings
      .map(function (h) {
        if (!h.id) {
          h.id = "h-" + Math.random().toString(16).slice(2);
        }
        var label = h.textContent || "";
        return "<a href=\"#" + escapeHtml(h.id) + "\" data-scroll>" + escapeHtml(label) + "</a>";
      })
      .join("");

    toc.innerHTML = html;
  }

  function renderRelated(posts, current) {
    if (!relatedGrid) return;
    var sameCat = posts.filter(function (p) {
      return p.id !== current.id && p.category === current.category;
    });
    var fallback = posts.filter(function (p) {
      return p.id !== current.id;
    });
    var list = (sameCat.length ? sameCat : fallback).slice(0, 2);

    relatedGrid.innerHTML = list
      .map(function (p) {
        return (
          "<div class=\"related-card\">" +
          "<a href=\"post.html?id=" +
          encodeURIComponent(p.id) +
          "\">" +
          "<div class=\"related-kicker\">" +
          escapeHtml(p.category || "") +
          "</div>" +
          "<div class=\"related-name\">" +
          escapeHtml(p.title || "") +
          "</div>" +
          "<div class=\"related-excerpt\">" +
          escapeHtml(p.excerpt || "") +
          "</div>" +
          "</a>" +
          "</div>"
        );
      })
      .join("");
  }

  function renderPost() {
    if (!data || !store) return;

    var first = (store.getPublishedPosts()[0] || null);
    if (!first) return;

    var id = getParam("id") || first.id;
    var post = store.getPostById(id) || first;

    document.title = (post.title || "Post") + " — NovaBlog";

    var read = estimateReadingTimeFromHtml(post.contentHtml || "");
    if (postKicker) postKicker.textContent = (post.category || "") + " • " + read;
    if (postTitle) postTitle.textContent = post.title || "";
    if (postSubtitle) postSubtitle.textContent = post.excerpt || "";
    if (postDate) {
      postDate.setAttribute("datetime", post.dateISO || "");
      postDate.textContent = formatDate(post.dateISO || "");
    }

    if (postCover && post.heroGradient) {
      postCover.style.backgroundImage = post.heroGradient;
    }

    store.bumpView(post.id);

    var locked = typeof post.password === "string" && post.password.length > 0;
    var unlocked = !locked || store.isUnlocked(post.id);

    if (passwordGate) passwordGate.classList.toggle("is-hidden", unlocked);
    article.classList.toggle("is-hidden", !unlocked);

    if (!unlocked) {
      article.innerHTML = "";
      if (passwordForm) {
        passwordForm.onsubmit = function (e) {
          e.preventDefault();
          var pw = (passwordForm.elements.password && passwordForm.elements.password.value || "").trim();
          if (pw === post.password) {
            store.unlockPost(post.id);
            if (passwordGate) passwordGate.classList.add("is-hidden");
            article.classList.remove("is-hidden");
            renderPost();
          } else {
            if (passwordNote) passwordNote.textContent = "Incorrect password";
          }
        };
      }
      return;
    }

    article.innerHTML = post.contentHtml || "";

    buildToc(article);
    highlightCode(article);
    initLazyImages(article);
    renderRelated(store.getPublishedPosts(), post);
    setShareButtons(window.location.href, post.title || "");

    initLike(post);
    initRating(post);
    initPrint();
    initTts(post);
    renderAuthor(post);
    renderPoll(post);
    initComments(post);
  }

  function storageGet(key, fallback) {
    try {
      var v = localStorage.getItem(key);
      if (v == null) return fallback;
      return JSON.parse(v);
    } catch (e) {
      return fallback;
    }
  }

  function storageSet(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {}
  }

  function initLike(post) {
    if (!likeBtn || !likeCount) return;
    var key = "nb_like_" + post.id;
    var likedKey = "nb_liked_" + post.id;

    var count = Number(storageGet(key, 0) || 0);
    var liked = storageGet(likedKey, false) === true;

    function paint() {
      likeCount.textContent = String(count);
      likeBtn.setAttribute("aria-pressed", liked ? "true" : "false");
    }

    paint();

    likeBtn.addEventListener("click", function () {
      liked = !liked;
      count = Math.max(0, count + (liked ? 1 : -1));
      storageSet(key, count);
      storageSet(likedKey, liked);
      paint();
    });
  }

  function initRating(post) {
    if (!ratingWrap) return;
    var key = "nb_rating_" + post.id;
    var current = Number(storageGet(key, 0) || 0);

    var stars = qsa("[data-star]", ratingWrap);

    function paint() {
      stars.forEach(function (s) {
        var n = Number(s.getAttribute("data-star") || 0);
        s.classList.toggle("is-on", n <= current);
      });
      if (ratingNote) ratingNote.textContent = current ? current + "/5" : "Not rated";
    }

    stars.forEach(function (s) {
      s.addEventListener("click", function () {
        current = Number(s.getAttribute("data-star") || 0);
        storageSet(key, current);
        paint();
      });
    });

    paint();
  }

  function initPrint() {
    if (!printBtn) return;
    printBtn.addEventListener("click", function () {
      window.print();
    });
  }

  function initExportPdf() {
    if (!exportPdfBtn) return;
    exportPdfBtn.addEventListener("click", function () {
      window.print();
    });
  }

  function initTts(post) {
    if (!ttsPlay || !ttsStop) return;

    function getArticleText() {
      var text = (article.textContent || "").replace(/\s+/g, " ").trim();
      return text;
    }

    ttsPlay.addEventListener("click", function () {
      if (!("speechSynthesis" in window)) {
        window.alert("Text-to-speech is not supported in this browser.");
        return;
      }
      try {
        window.speechSynthesis.cancel();
      } catch (e) {}

      var u = new SpeechSynthesisUtterance(getArticleText());
      u.rate = 1;
      u.pitch = 1;
      u.volume = 1;
      u.lang = "en";
      window.speechSynthesis.speak(u);
    });

    ttsStop.addEventListener("click", function () {
      if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    });
  }

  function renderAuthor(post) {
    var a = (post && post.author) || (data && data.authorDefault) || null;
    if (!a) return;
    if (authorAvatar) authorAvatar.textContent = a.avatarText || "";
    if (authorName) authorName.textContent = a.name || "";
    if (authorTitle) authorTitle.textContent = a.title || "";
    if (authorBio) authorBio.textContent = a.bio || "";
    if (authorLinks) {
      var links = a.links || {};
      var html = "";
      if (links.twitter) html += "<a href=\"" + escapeHtml(links.twitter) + "\" target=\"_blank\" rel=\"noopener\">Twitter</a>";
      if (links.linkedin) html += "<a href=\"" + escapeHtml(links.linkedin) + "\" target=\"_blank\" rel=\"noopener\">LinkedIn</a>";
      authorLinks.innerHTML = html;
    }
  }

  function renderPoll(post) {
    if (!pollWrap) return;
    pollWrap.innerHTML = "";
    if (!post.poll || !post.poll.options || !post.poll.options.length) return;

    var key = "nb_poll_" + post.poll.id;
    var votes = storageGet(key, null);
    if (!votes || !Array.isArray(votes) || votes.length !== post.poll.options.length) {
      votes = post.poll.options.map(function () {
        return 0;
      });
    }

    var votedKey = key + "_voted";
    var votedIndex = storageGet(votedKey, -1);

    function totalVotes() {
      return votes.reduce(function (a, b) {
        return a + b;
      }, 0);
    }

    function pct(i) {
      var t = totalVotes();
      if (!t) return 0;
      return Math.round((votes[i] / t) * 100);
    }

    function paint() {
      var box = pollWrap.querySelector(".poll-box");
      if (!box) return;
      var opts = qsa("[data-poll-opt]", box);
      opts.forEach(function (btn) {
        var i = Number(btn.getAttribute("data-poll-opt") || 0);
        var fill = btn.querySelector(".poll-fill");
        var p = btn.querySelector(".poll-pct");
        if (fill) fill.style.width = pct(i) + "%";
        if (p) p.textContent = pct(i) + "%";
      });
    }

    pollWrap.innerHTML =
      "<div class=\"poll-box glass\">" +
      "<div class=\"poll-q\">" +
      escapeHtml(post.poll.question) +
      "</div>" +
      "<div class=\"poll-options\">" +
      post.poll.options
        .map(function (opt, i) {
          return (
            "<button class=\"poll-opt\" type=\"button\" data-poll-opt=\"" +
            i +
            "\" " +
            (votedIndex >= 0 ? "disabled" : "") +
            ">" +
            "<span>" +
            escapeHtml(opt) +
            "</span>" +
            "<span class=\"poll-bar\"><span class=\"poll-fill\"></span></span>" +
            "<span class=\"poll-pct\">0%</span>" +
            "</button>"
          );
        })
        .join("") +
      "</div>" +
      "</div>";

    qsa("[data-poll-opt]", pollWrap).forEach(function (btn) {
      btn.addEventListener("click", function () {
        if (votedIndex >= 0) return;
        var i = Number(btn.getAttribute("data-poll-opt") || 0);
        votes[i] += 1;
        votedIndex = i;
        storageSet(key, votes);
        storageSet(votedKey, votedIndex);
        qsa("[data-poll-opt]", pollWrap).forEach(function (b) {
          b.disabled = true;
        });
        paint();
      });
    });

    paint();
  }

  function initComments(post) {
    if (!commentForm || !commentList) return;
    var key = "nb_comments_" + post.id;
    var list = storageGet(key, []);
    if (!Array.isArray(list)) list = [];

    function render() {
      if (!list.length) {
        commentList.innerHTML = "<div class=\"form-note\">No comments yet. Be the first.</div>";
        return;
      }
      commentList.innerHTML = list
        .slice()
        .reverse()
        .map(function (c) {
          return (
            "<div class=\"comment\">" +
            "<div class=\"comment-top\">" +
            "<div class=\"comment-name\">" +
            escapeHtml(c.name) +
            "</div>" +
            "<div class=\"comment-time\">" +
            escapeHtml(formatDate(c.timeISO)) +
            "</div>" +
            "</div>" +
            "<div class=\"comment-text\">" +
            escapeHtml(c.text) +
            "</div>" +
            "</div>"
          );
        })
        .join("");
    }

    commentForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = (commentForm.elements.name && commentForm.elements.name.value || "").trim();
      var text = (commentForm.elements.comment && commentForm.elements.comment.value || "").trim();
      if (!name || !text) return;
      list.push({ name: name, text: text, timeISO: new Date().toISOString() });
      storageSet(key, list);
      commentForm.reset();
      render();
    });

    if (clearCommentsBtn) {
      clearCommentsBtn.addEventListener("click", function () {
        list = [];
        storageSet(key, list);
        render();
      });
    }

    render();
  }

  function clamp(n, min, max) {
    return Math.min(max, Math.max(min, n));
  }

  function update() {
    var rect = article.getBoundingClientRect();
    var viewport = window.innerHeight || document.documentElement.clientHeight;

    var articleTop = rect.top;
    var articleHeight = rect.height;

    var progress;

    if (articleTop >= 0) {
      progress = 0;
    } else {
      var scrolled = -articleTop;
      var scrollable = Math.max(1, articleHeight - viewport * 0.35);
      progress = scrolled / scrollable;
    }

    var pct = clamp(progress, 0, 1) * 100;
    bar.style.width = pct.toFixed(2) + "%";
  }

  window.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", update);
  renderPost();
  initExportPdf();
  update();
})();
