(function () {
  "use strict";

  var store = window.NovaStore;
  if (!store) return;

  var session = store.getSession();
  var summary = document.querySelector("[data-profile-summary]");
  var grid = document.querySelector("[data-liked-grid]");
  var logout = document.querySelector("[data-logout]");

  if (!session) {
    window.location.href = "index.html";
    return;
  }

  function escapeHtml(s) {
    return String(s)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
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

  function renderCard(post) {
    var gradient = post.heroGradient || "linear-gradient(135deg, rgba(125,211,252,.18), rgba(167,139,250,.16))";
    var read = getReadingTimeFromHtml(post.contentHtml || "");

    return (
      "<article class=\"card post-card\">" +
      "<a class=\"card-link\" href=\"post.html?id=" +
      encodeURIComponent(post.id) +
      "\">" +
      "<div class=\"card-media\" style=\"background-image: " +
      gradient +
      ";\"></div>" +
      "<div class=\"card-body\">" +
      "<div class=\"card-kicker\">" +
      escapeHtml(post.category || "") +
      "</div>" +
      "<h3 class=\"card-title\">" +
      escapeHtml(post.title || "") +
      "</h3>" +
      "<div class=\"card-meta\">" +
      "<span>" +
      read +
      "</span>" +
      "</div>" +
      "</div>" +
      "</a>" +
      "</article>"
    );
  }

  if (summary) {
    summary.textContent = session.name + " • " + session.email;
  }

  if (grid) {
    var likedIds = store.getLikedPostIds();
    var posts = store
      .getPublishedPosts()
      .filter(function (p) {
        return likedIds.includes(p.id);
      })
      .slice(0, 12);

    grid.innerHTML = posts.length ? posts.map(renderCard).join("") : "<div class=\"form-note\">No liked posts yet.</div>";
  }

  if (logout) {
    logout.addEventListener("click", function () {
      store.clearSession();
      window.location.href = "index.html";
    });
  }
})();
