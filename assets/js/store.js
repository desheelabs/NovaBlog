(function () {
  "use strict";

  var SEED = (window.NovaBlogData && window.NovaBlogData.posts) ? window.NovaBlogData.posts : [];

  function safeParse(json, fallback) {
    try {
      var v = JSON.parse(json);
      return v == null ? fallback : v;
    } catch (e) {
      return fallback;
    }
  }

  function get(key, fallback) {
    try {
      var v = localStorage.getItem(key);
      if (v == null) return fallback;
      return safeParse(v, fallback);
    } catch (e) {
      return fallback;
    }
  }

  function set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {}
  }

  function nowIso() {
    return new Date().toISOString();
  }

  function uid() {
    return "p_" + Math.random().toString(16).slice(2) + "_" + Date.now().toString(16);
  }

  function getSession() {
    return get("nb_session", null);
  }

  function setSession(user) {
    set("nb_session", user);
  }

  function clearSession() {
    try {
      localStorage.removeItem("nb_session");
    } catch (e) {}
  }

  function getUsers() {
    return get("nb_users", []);
  }

  function saveUsers(users) {
    set("nb_users", users);
  }

  function signup(email, password, name) {
    var users = getUsers();
    var exists = users.some(function (u) {
      return String(u.email).toLowerCase() === String(email).toLowerCase();
    });
    if (exists) return { ok: false, message: "Email already exists" };

    var user = {
      id: "u_" + Math.random().toString(16).slice(2),
      email: email,
      password: password,
      name: name || "User",
      createdAt: nowIso()
    };

    users.push(user);
    saveUsers(users);
    setSession({ id: user.id, email: user.email, name: user.name });
    return { ok: true, user: user };
  }

  function login(email, password) {
    var users = getUsers();
    var user = users.find(function (u) {
      return String(u.email).toLowerCase() === String(email).toLowerCase() && String(u.password) === String(password);
    });
    if (!user) return { ok: false, message: "Invalid credentials" };
    setSession({ id: user.id, email: user.email, name: user.name });
    return { ok: true, user: user };
  }

  function getMaintenance() {
    return get("nb_maintenance", false) === true;
  }

  function setMaintenance(on) {
    set("nb_maintenance", !!on);
  }

  function getDrafts() {
    return get("nb_drafts", []);
  }

  function saveDraft(draft) {
    var drafts = getDrafts();
    var idx = drafts.findIndex(function (d) {
      return d.id === draft.id;
    });
    var next = Object.assign({}, draft);
    if (!next.id) next.id = uid();
    if (!next.updatedAt) next.updatedAt = nowIso();
    if (idx >= 0) drafts[idx] = next;
    else drafts.push(next);
    set("nb_drafts", drafts);
    return next;
  }

  function deleteDraft(id) {
    var drafts = getDrafts().filter(function (d) {
      return d.id !== id;
    });
    set("nb_drafts", drafts);
  }

  function publishDraft(id) {
    var drafts = getDrafts();
    var draft = drafts.find(function (d) {
      return d.id === id;
    });
    if (!draft) return null;

    var published = get("nb_published", []);
    var post = Object.assign({}, draft, { published: true, dateISO: draft.dateISO || nowIso().slice(0, 10) });
    published = published.filter(function (p) {
      return p.id !== post.id;
    });
    published.push(post);
    set("nb_published", published);

    deleteDraft(id);
    return post;
  }

  function getCategories() {
    var base = Array.from(
      new Set(
        SEED.map(function (p) {
          return p.category;
        }).filter(Boolean)
      )
    );
    var custom = get("nb_categories", []);
    var all = base.concat(custom || []);
    return Array.from(new Set(all.map(String))).sort();
  }

  function addCategory(name) {
    var n = String(name || "").trim();
    if (!n) return;
    var cats = get("nb_categories", []);
    if (cats.some(function (c) {
      return String(c).toLowerCase() === n.toLowerCase();
    })) return;
    cats.push(n);
    set("nb_categories", cats);
  }

  function deleteCategory(name) {
    var n = String(name || "").trim().toLowerCase();
    var cats = get("nb_categories", []).filter(function (c) {
      return String(c).toLowerCase() !== n;
    });
    set("nb_categories", cats);
  }

  function getPublishedPosts() {
    var published = get("nb_published", []);
    var merged = SEED.concat(published || []);
    return merged.filter(function (p) {
      return !p.isDraft;
    });
  }

  function getPostById(id) {
    var posts = getPublishedPosts();
    return posts.find(function (p) {
      return p.id === id;
    }) || posts[0] || null;
  }

  function bumpView(postId) {
    var key = "nb_views_" + postId;
    var v = Number(get(key, 0) || 0) + 1;
    set(key, v);
    return v;
  }

  function getViews(postId) {
    return Number(get("nb_views_" + postId, 0) || 0);
  }

  function unlockPost(postId) {
    var unlocked = get("nb_unlocked", {});
    unlocked[postId] = true;
    set("nb_unlocked", unlocked);
  }

  function isUnlocked(postId) {
    var unlocked = get("nb_unlocked", {});
    return unlocked && unlocked[postId] === true;
  }

  function getLikedPostIds() {
    var posts = getPublishedPosts();
    return posts
      .filter(function (p) {
        return get("nb_liked_" + p.id, false) === true;
      })
      .map(function (p) {
        return p.id;
      });
  }

  function getTagCloud() {
    var posts = getPublishedPosts();
    var map = {};
    posts.forEach(function (p) {
      (p.tags || []).forEach(function (t) {
        var k = String(t).trim();
        if (!k) return;
        map[k] = (map[k] || 0) + 1;
      });
    });
    return Object.keys(map)
      .map(function (k) {
        return { tag: k, count: map[k] };
      })
      .sort(function (a, b) {
        return b.count - a.count;
      });
  }

  window.NovaStore = {
    getSession: getSession,
    setSession: setSession,
    clearSession: clearSession,
    signup: signup,
    login: login,
    getMaintenance: getMaintenance,
    setMaintenance: setMaintenance,
    getDrafts: getDrafts,
    saveDraft: saveDraft,
    deleteDraft: deleteDraft,
    publishDraft: publishDraft,
    getCategories: getCategories,
    addCategory: addCategory,
    deleteCategory: deleteCategory,
    getPublishedPosts: getPublishedPosts,
    getPostById: getPostById,
    bumpView: bumpView,
    getViews: getViews,
    unlockPost: unlockPost,
    isUnlocked: isUnlocked,
    getLikedPostIds: getLikedPostIds,
    getTagCloud: getTagCloud
  };
})();
