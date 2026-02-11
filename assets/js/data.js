(function () {
  "use strict";

  window.NovaBlogData = {
    socials: {
      twitter: 12840,
      youtube: 54200,
      instagram: 21450,
      linkedin: 8600
    },
    authorDefault: {
      name: "R.K.",
      title: "Editor at NovaBlog",
      avatarText: "RK",
      bio: "I write about product-like UI, performance, and practical JavaScript patterns for modern blogs.",
      links: {
        twitter: "https://twitter.com",
        linkedin: "https://linkedin.com"
      }
    },
    posts: [
      {
        id: "premium-reading",
        title: "Building a premium reading experience",
        category: "Design",
        dateISO: "2026-02-11",
        excerpt: "Progress bar, typography scale, and an interruption-free layout that feels like a real product.",
        tags: ["UI", "UX", "Template"],
        featured: true,
        imageJpg: "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1400&q=70",
        imageWebp: "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1400&fm=webp&q=70",
        author: {
          name: "R.K.",
          title: "Design Engineer",
          avatarText: "RK",
          bio: "I build premium-feel interfaces with accessibility-first patterns and lightweight JavaScript.",
          links: {
            twitter: "https://twitter.com",
            linkedin: "https://linkedin.com"
          }
        },
        poll: {
          question: "Which feature makes a blog feel most premium?",
          options: ["Typography", "Reading progress", "Dark mode", "Fast loading"],
          id: "poll-premium"
        },
        heroGradient:
          "radial-gradient(circle at 25% 30%, rgba(125,211,252,.35), transparent 55%), radial-gradient(circle at 70% 65%, rgba(167,139,250,.35), transparent 50%), linear-gradient(135deg, rgba(255,255,255,.08), rgba(255,255,255,.02))",
        contentHtml:
          "<p>Great reading pages are calm: predictable spacing, strong hierarchy, and minimal visual noise. This template uses a tight typography system, a max-width container, and subtle glass surfaces to give a premium feel without heavy frameworks.</p>" +
          "<p>Use the theme toggle in the header to switch between dark and light modes. Your choice is saved automatically.</p>" +
          "<h2>Progress bar + back to top</h2>" +
          "<p>As you scroll, the progress bar fills based on how much of the article you have read. The back-to-top button appears after scrolling a bit, and the header stays sticky for fast navigation.</p>" +
          "<h2>Syntax highlighting</h2>" +
          "<p>If you publish coding content, clean code blocks matter. This template includes a lightweight highlighter for <code>pre code</code>.</p>" +
          "<pre><code class=\"language-js\">function greet(name) {\n  const msg = `Hello, ${name}`;\n  return msg;\n}\n\nconsole.log(greet('NovaBlog'));\n</code></pre>" +
          "<h2>Lazy loading images</h2>" +
          "<p>Images below use lazy loading and only load when near the viewport.</p>" +
          "<figure class=\"figure\"><img class=\"lazy\" alt=\"Sample cover\" data-src=\"https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1400&q=60\" width=1400 height=800 /><figcaption>Sample lazy-loaded image (Unsplash).</figcaption></figure>" +
          "<h2>Accessibility + motion</h2>" +
          "<p>Controls are keyboard-friendly, have focus styles, and respect reduced-motion preferences.</p>"
      },
      {
        id: "mega-menu",
        title: "Mega menu interactions without a framework",
        category: "Development",
        dateISO: "2026-02-11",
        excerpt: "Keyboard-friendly toggles, outside click handling, and responsive behavior for mobile.",
        tags: ["JavaScript", "Navigation"],
        featured: true,
        imageJpg: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=1400&q=70",
        imageWebp: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=1400&fm=webp&q=70",
        password: "demo123",
        author: {
          name: "R.K.",
          title: "Frontend Engineer",
          avatarText: "RK",
          bio: "No-framework UI interactions that still feel polished, tested, and accessible.",
          links: {
            twitter: "https://twitter.com",
            linkedin: "https://linkedin.com"
          }
        },
        heroGradient:
          "radial-gradient(circle at 30% 30%, rgba(34,197,94,.35), transparent 55%), radial-gradient(circle at 75% 70%, rgba(59,130,246,.35), transparent 55%), linear-gradient(135deg, rgba(255,255,255,.08), rgba(255,255,255,.02))",
        contentHtml:
          "<p>Mega menus can be simple and accessible. The goal is predictable open/close logic, outside-click handling, and Escape-to-close support.</p>" +
          "<h2>Interaction model</h2>" +
          "<p>Use a button to toggle, manage <code>aria-expanded</code>, and close on outside click.</p>" +
          "<h2>Mobile behavior</h2>" +
          "<p>On smaller screens, the menu becomes a stacked panel so it remains usable.</p>"
      },
      {
        id: "performance",
        title: "Practical performance for content-heavy pages",
        category: "AI",
        dateISO: "2026-02-11",
        excerpt: "Skeleton loading, reduced motion support, and lightweight JS patterns.",
        tags: ["Performance", "UX"],
        featured: false,
        imageJpg: "https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?auto=format&fit=crop&w=1400&q=70",
        imageWebp: "https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?auto=format&fit=crop&w=1400&fm=webp&q=70",
        heroGradient:
          "radial-gradient(circle at 20% 35%, rgba(244,63,94,.35), transparent 55%), radial-gradient(circle at 70% 70%, rgba(250,204,21,.25), transparent 55%), linear-gradient(135deg, rgba(255,255,255,.08), rgba(255,255,255,.02))",
        contentHtml:
          "<p>Performance is a UX feature. Start with quick placeholders, load non-critical items later, and keep JavaScript lean.</p>" +
          "<h2>Skeleton first</h2>" +
          "<p>Skeleton states make your UI feel fast even when data is slow.</p>" +
          "<h2>Respect the user</h2>" +
          "<p>Reduced-motion settings should be honored for a more comfortable experience.</p>"
      },
      {
        id: "glass-ui",
        title: "Glassmorphism UI done right",
        category: "Design",
        dateISO: "2026-02-11",
        excerpt: "How to use blur, borders, and contrast to keep glass UI readable and premium.",
        tags: ["Glassmorphism", "UI"],
        featured: false,
        imageJpg: "https://images.unsplash.com/photo-1524253482453-3fed8d2fe12b?auto=format&fit=crop&w=1400&q=70",
        imageWebp: "https://images.unsplash.com/photo-1524253482453-3fed8d2fe12b?auto=format&fit=crop&w=1400&fm=webp&q=70",
        heroGradient:
          "radial-gradient(circle at 20% 30%, rgba(59,130,246,.30), transparent 55%), radial-gradient(circle at 78% 78%, rgba(167,139,250,.25), transparent 55%), linear-gradient(135deg, rgba(255,255,255,.08), rgba(255,255,255,.02))",
        contentHtml:
          "<p>Glass effects look premium when you maintain strong contrast and use subtle blur instead of heavy opacity.</p>" +
          "<h2>Contrast first</h2>" +
          "<p>Keep text readable with strong foreground color and toned-down background.</p>" +
          "<h2>Subtle borders</h2>" +
          "<p>Borders help glass surfaces stand out without being loud.</p>"
      },
      {
        id: "editor-workflow",
        title: "A writing workflow that scales",
        category: "Productivity",
        dateISO: "2026-02-11",
        excerpt: "Templates, checklists, and a review loop to publish consistently.",
        tags: ["Writing", "Workflow"],
        featured: false,
        imageJpg: "https://images.unsplash.com/photo-1506784926709-22f1ec395907?auto=format&fit=crop&w=1400&q=70",
        imageWebp: "https://images.unsplash.com/photo-1506784926709-22f1ec395907?auto=format&fit=crop&w=1400&fm=webp&q=70",
        heroGradient:
          "radial-gradient(circle at 25% 30%, rgba(34,197,94,.22), transparent 55%), radial-gradient(circle at 70% 65%, rgba(125,211,252,.18), transparent 55%), linear-gradient(135deg, rgba(255,255,255,.08), rgba(255,255,255,.02))",
        contentHtml:
          "<p>Consistency comes from a good workflow: idea capture, outline, draft, review, publish.</p>" +
          "<h2>Outlines</h2>" +
          "<p>Start with headings and fill in details later.</p>" +
          "<h2>Review loop</h2>" +
          "<p>Use a checklist to prevent small mistakes.</p>"
      }
    ]
  };
})();
