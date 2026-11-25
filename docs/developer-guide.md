# Kōshi Developer Guide — Entry Points & Workflows

**Product:** Kōshi (格子) — Studio Eien  
**Core Version:** v0.2.0 | **Skill Version:** v0.1.0  
**Design Philosophy:** Human-First · Native CSS · Progressive Enhancement · Zero Runtime JavaScript

---

## 1. Choosing Your Entry Point

Kōshi is designed to fit your exact workflow. You do not need AI, Astro, Vue, or a node build step to use Kōshi. Choose the entry point that matches your needs:

| Entry Point | What It Is | Best For | Prerequisites |
| :--- | :--- | :--- | :--- |
| **1. Kōshi Core** | Pure standalone CSS stylesheet (`koshi.css`, ~17 KB unminified, ~3.5 KB gzip). | Any web project (HTML, React, Svelte, Vue, Django, Rails, static sites). | None. Just a `<link>` tag. |
| **2. Public Documentation** | In-depth technical guides, API reference, and architectural laws. | Understanding grid math, subgrid baselines, and container query responsive behavior. | Browser. |
| **3. Composition Lab** | Interactive visual sandbox with real-time resizing and lattice overlay. | Exploring spatial relationships, testing responsive breakpoints, and visual prototyping. | Modern browser (`/lab/`). |
| **4. Exported Compositions** | Curated, self-contained HTML/CSS specimens. | Copy-pasting production-ready magazine layouts, bento grids, and hero sections. | None. Copy HTML/CSS. |
| **5. Optional Agent Skill** | Modular context architecture (8 Markdown files) for AI assistants. | Pairing with AI coding tools (Claude Code, Cursor, Antigravity) with documented API contracts and automated context integrity checks. | AI assistant CLI/editor. |

---

## 2. Using Kōshi Core Without AI

Kōshi is first and foremost a human-first CSS composition architecture. To use it in any web page:

### Quick Start HTML Template
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Kōshi Composition</title>
  <!-- Link the standalone CSS -->
  <link rel="stylesheet" href="path/to/koshi.css" />
  <style>
    /* Optional project aesthetic styling */
    body { font-family: system-ui, sans-serif; margin: 0; padding: 2rem; }
    .card { background: #f4f4f4; padding: 1.5rem; border-radius: 4px; }
  </style>
</head>
<body>

  <!-- The .kos-composition wrapper activates responsive container-query stacking -->
  <section class="kos-composition">
    <div class="kos-grid" kos-cols="12">
      <article kos-col-span="8" class="card">
        <h1>Asymmetric Feature</h1>
        <p>Spans 8 columns on wide screens, automatically collapses to a full stack on narrow screens.</p>
      </article>
      <aside kos-col-span="4" class="card">
        <h2>Sidebar</h2>
        <p>Spans 4 columns.</p>
      </aside>
    </div>
  </section>

</body>
</html>
```

---

## 3. Pairing with an AI Assistant (Optional Skill)

When working with an AI coding assistant equipped with the Kōshi skill, the assistant will write idiomatic Kōshi markup adhering to the 7 Architectural Laws and will avoid common CSS grid anti-patterns.

### Example Human Request to Agent
```text
I need an editorial product showcase section for a modern ceramics studio:
- A dominant feature card showcasing the hero vessel (spanning 8 columns) with an accent quote.
- Two stacked secondary cards on the right (each spanning 4 columns).
- The secondary cards should align their header baselines using Subgrid.
- Preserve intentional negative space (Yohaku) below the feature card.
- Use native Kōshi markup and ensure clean responsive stacking on mobile.
```

### What the Agent Produces
The agent reads `SKILL.md`, consults `references/api-contracts.md` and `references/architectural-laws.md`, and generates verified, valid markup:
```html
<section class="kos-composition">
  <div class="kos-grid" kos-cols="12">
    <!-- Dominant Hero Card -->
    <article kos-col-span="8" kos-row-span="2" class="hero-card">
      <span class="eyebrow">Studio Edition</span>
      <h2>The Kuro Vessel</h2>
      <p>Hand-thrown stoneware with matte iron glaze.</p>
    </article>

    <!-- Secondary Card 1 with Subgrid row alignment -->
    <article kos-col-span="4" kos-subgrid="rows" class="detail-card">
      <h3>Materiality</h3>
      <p>Locally sourced high-fire grogged stoneware.</p>
    </article>

    <!-- Secondary Card 2 with Subgrid row alignment -->
    <article kos-col-span="4" kos-subgrid="rows" class="detail-card">
      <h3>Firing Process</h3>
      <p>72-hour reduction in an anagama wood kiln.</p>
    </article>
  </div>
</section>
```

---

## 4. Architectural Boundaries & Safe Practices

- **Grid Spans:** Numeric column spans are `1` through `12`. Row spans are `1` through `6`.
- **Offsets:** Offsets are `1` through `6`. For positions beyond track 7, use CSS `grid-column-start: N;`.
- **Flexbox Spans:** In `.kos-flex-grid`, explicit spans (`kos-col-span="1..12"`) default to `flex-grow: 0` to preserve negative space (*Yohaku*). To make cards expand into empty row space, explicitly add `kos-grow="1"`.
- **Mobile Containment:** Do not combine fixed inline pixel widths with Kōshi grids. If using `aspect-ratio: 16/9`, omit rigid `min-height: 220px` or apply it conditionally via `@container (min-width: 480px)` to avoid horizontal overflow traps.
