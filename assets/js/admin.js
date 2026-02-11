(function () {
  "use strict";

  var store = window.NovaStore;
  if (!store) return;

  var session = store.getSession();
  if (!session) {
    window.location.href = "index.html";
    return;
  }

  var maintenanceToggle = document.querySelector("[data-maintenance-toggle]");
  var draftForm = document.querySelector("[data-draft-form]");
  var draftNote = document.querySelector("[data-draft-note]");
  var draftsList = document.querySelector("[data-drafts-list]");
  var draftNew = document.querySelector("[data-draft-new]");
  var catForm = document.querySelector("[data-cat-form]");
  var catList = document.querySelector("[data-cat-list]");
  var tagCloud = document.querySelector("[data-tag-cloud]");
  var mediaGrid = document.querySelector("[data-media-grid]");

  var editingId = null;

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

  function renderDrafts() {
    if (!draftsList) return;
    var drafts = store.getDrafts().slice().sort(function (a, b) {
      return String(b.updatedAt || "").localeCompare(String(a.updatedAt || ""));
    });

    if (!drafts.length) {
      draftsList.innerHTML = "<div class=\"form-note\">No drafts yet.</div>";
      return;
    }

    draftsList.innerHTML = drafts
      .map(function (d) {
        return (
          "<div class=\"comment\">" +
          "<div class=\"comment-top\">" +
          "<div class=\"comment-name\">" +
          escapeHtml(d.title || "Untitled") +
          "</div>" +
          "<div class=\"comment-time\">" +
          escapeHtml(formatDate(d.updatedAt || "")) +
          "</div>" +
          "</div>" +
          "<div class=\"comment-text\">" +
          escapeHtml(d.excerpt || "") +
          "</div>" +
          "<div class=\"form-row\" style=\"margin-top:10px;\">" +
          "<button class=\"btn btn--ghost\" type=\"button\" data-edit-draft=\"" +
          escapeHtml(d.id) +
          "\">Edit</button>" +
          "<button class=\"btn\" type=\"button\" data-publish-draft=\"" +
          escapeHtml(d.id) +
          "\">Publish</button>" +
          "<button class=\"btn btn--ghost\" type=\"button\" data-delete-draft=\"" +
          escapeHtml(d.id) +
          "\">Delete</button>" +
          "</div>" +
          "</div>"
        );
      })
      .join("");
  }

  function renderCategories() {
    if (!catList) return;
    var cats = store.getCategories();
    catList.innerHTML = cats
      .map(function (c) {
        return (
          "<div class=\"comment\">" +
          "<div class=\"comment-top\">" +
          "<div class=\"comment-name\">" +
          escapeHtml(c) +
          "</div>" +
          "<button class=\"btn btn--ghost\" type=\"button\" data-del-cat=\"" +
          escapeHtml(c) +
          "\">Delete</button>" +
          "</div>" +
          "</div>"
        );
      })
      .join("");
  }

  function renderTagCloud() {
    if (!tagCloud) return;
    var tags = store.getTagCloud().slice(0, 18);
    if (!tags.length) {
      tagCloud.innerHTML = "<span class=\"tag\">No tags</span>";
      return;
    }
    tagCloud.innerHTML = tags
      .map(function (t) {
        return "<span class=\"tag\">" + escapeHtml(t.tag) + " (" + t.count + ")</span>";
      })
      .join("");
  }

  function renderMedia() {
    if (!mediaGrid) return;
    var items = (window.NovaBlogData && window.NovaBlogData.posts) ? window.NovaBlogData.posts : [];
    mediaGrid.innerHTML = items
      .slice(0, 8)
      .map(function (p) {
        return (
          "<div class=\"card\" style=\"min-height:110px; background-image:" +
          (p.heroGradient || "") +
          ";\"></div>"
        );
      })
      .join("");
  }

  function loadDraftIntoForm(d) {
    if (!draftForm) return;
    draftForm.elements.title.value = d.title || "";
    draftForm.elements.category.value = d.category || "";
    draftForm.elements.tags.value = (d.tags || []).join(", ");
    draftForm.elements.excerpt.value = d.excerpt || "";
    draftForm.elements.contentHtml.value = d.contentHtml || "";
  }

  function clearDraftForm() {
    editingId = null;
    if (!draftForm) return;
    draftForm.reset();
  }

  function initMaintenance() {
    if (!maintenanceToggle) return;
    maintenanceToggle.checked = store.getMaintenance();
    maintenanceToggle.addEventListener("change", function () {
      store.setMaintenance(maintenanceToggle.checked);
      if (draftNote) draftNote.textContent = maintenanceToggle.checked ? "Maintenance enabled" : "Maintenance disabled";
    });
  }

  function initDraftForm() {
    if (!draftForm) return;

    draftForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var d = {
        id: editingId,
        title: (draftForm.elements.title.value || "").trim(),
        category: (draftForm.elements.category.value || "").trim() || "General",
        tags: (draftForm.elements.tags.value || "")
          .split(",")
          .map(function (s) {
            return s.trim();
          })
          .filter(Boolean),
        excerpt: (draftForm.elements.excerpt.value || "").trim(),
        contentHtml: (draftForm.elements.contentHtml.value || "").trim(),
        isDraft: true,
        updatedAt: new Date().toISOString()
      };
      var saved = store.saveDraft(d);
      editingId = saved.id;
      if (draftNote) draftNote.textContent = "Draft saved";
      renderDrafts();
      renderTagCloud();
    });

    if (draftNew) {
      draftNew.addEventListener("click", function () {
        clearDraftForm();
        if (draftNote) draftNote.textContent = "";
      });
    }

    document.addEventListener("click", function (e) {
      var edit = e.target.closest("[data-edit-draft]");
      if (edit) {
        var id = edit.getAttribute("data-edit-draft");
        var d = store.getDrafts().find(function (x) {
          return x.id === id;
        });
        if (d) {
          editingId = d.id;
          loadDraftIntoForm(d);
          if (draftNote) draftNote.textContent = "Editing draft";
        }
      }

      var del = e.target.closest("[data-delete-draft]");
      if (del) {
        store.deleteDraft(del.getAttribute("data-delete-draft"));
        renderDrafts();
      }

      var pub = e.target.closest("[data-publish-draft]");
      if (pub) {
        var post = store.publishDraft(pub.getAttribute("data-publish-draft"));
        renderDrafts();
        if (post && draftNote) draftNote.textContent = "Published: " + post.title;
      }

      var delCat = e.target.closest("[data-del-cat]");
      if (delCat) {
        store.deleteCategory(delCat.getAttribute("data-del-cat"));
        renderCategories();
      }
    });
  }

  function initCategoryForm() {
    if (!catForm) return;
    catForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = (catForm.elements.category.value || "").trim();
      store.addCategory(name);
      catForm.reset();
      renderCategories();
    });
  }

  function initAnalytics() {
    var canvas = document.getElementById("analyticsChart");
    if (!canvas || !window.Chart) return;

    var posts = store.getPublishedPosts().slice(0, 7);
    var labels = posts.map(function (p) {
      return p.title.length > 18 ? p.title.slice(0, 18) + "…" : p.title;
    });
    var views = posts.map(function (p) {
      return store.getViews(p.id);
    });
    var likes = posts.map(function (p) {
      try {
        return Number(JSON.parse(localStorage.getItem("nb_like_" + p.id) || "0") || 0);
      } catch (e) {
        return 0;
      }
    });

    new Chart(canvas, {
      type: "bar",
      data: {
        labels: labels,
        datasets: [
          { label: "Views", data: views, backgroundColor: "rgba(125,211,252,.35)" },
          { label: "Likes", data: likes, backgroundColor: "rgba(251,113,133,.25)" }
        ]
      },
      options: {
        responsive: true,
        plugins: { legend: { labels: { color: "#9ca3af" } } },
        scales: {
          x: { ticks: { color: "#9ca3af" }, grid: { color: "rgba(255,255,255,.06)" } },
          y: { ticks: { color: "#9ca3af" }, grid: { color: "rgba(255,255,255,.06)" } }
        }
      }
    });
  }

  initMaintenance();
  initDraftForm();
  initCategoryForm();
  renderDrafts();
  renderCategories();
  renderTagCloud();
  renderMedia();
  initAnalytics();
})();
