# Kōshi (格子)

**A human-first, native CSS spatial composition system for intentional web layouts.**

Crafted by **Studio Eien** · Released as **v0.2.0** (Core) and **v0.1.0** (Optional Agent Skill).

---

## 1. What is Kōshi?

Kōshi (格子, Japanese for *lattice* or *grid*) is a framework-independent CSS layout architecture founded on mathematical rigor, intentional spatial rhythm, and respectful white space (*Yohaku*).

Instead of drowning markup in dozens of utility classes or relying on heavy JavaScript layout runtimes, Kōshi uses clean semantic HTML with declarative attribute modifiers (`kos-cols`, `kos-col-span`, `kos-offset`, `kos-subgrid`, `kos-grow`) powered by modern native CSS.

### Who is Kōshi for?
- **Design Engineers & Frontend Architects:** Developers who care about proportional geometry, baseline alignment, and container responsiveness.
- **Minimalists & Modern Web Advocates:** Teams building fast, resilient websites with zero JavaScript runtime overhead.
- **Engineers Pairing with AI Assistants:** Developers seeking disciplined, contract-backed layout authoring when pairing with AI coding assistants.

---

## 2. The Four Architectural Pillars

Kōshi integrates four complementary native CSS specifications into a unified composition language:

| Pillar | Underlying CSS Standard | Compositional Role in Kōshi |
| :--- | :--- | :--- |
| **1. Grid — Architecture** | CSS Grid Layout Level 1 & 2 | Deliberate spatial structure, proportional 12-track rows, asymmetric feature layouts, and custom ratios. |
| **2. Flexbox — Flow** | CSS Flexible Box Layout Level 1 | Content-driven distribution, natural wrapping, proportional bases, and deliberate negative space (*Yohaku*). |
| **3. Subgrid — Alignment** | CSS Grid Layout Level 2 (`subgrid`) | Shared track relationships across independent nested components without flattening semantic DOM hierarchies. |
| **4. Container Queries — Context** | CSS Containment Level 3 (`@container`) | Self-contained component responsiveness based on available spatial container width rather than fragile viewport queries. |

All four pillars are governed by the **[Seven Architectural Laws of Kōshi](docs/architectural-laws-spec.md)** (Containment, Flow, Alignment, Context, Accessibility, Graceful Degradation, Zero Runtime Dependencies).

---

## 3. Quick Start (Using Kōshi Without AI)

Kōshi Core requires **zero runtime JavaScript**, **zero build steps**, and **zero dependencies**. It works in plain HTML, Astro, React, Vue, Svelte, Django, Rails, or WordPress.

### 1. Include the Stylesheet
Download `koshi.css` or link it directly in your HTML `<head>`:
```html
<link rel="stylesheet" href="path/to/koshi.css" />
```

### 2. Compose an Editorial Layout
```html
<!-- .kos-composition activates container-query responsive stacking -->
<section class="kos-composition">
  <div class="kos-grid" kos-cols="12">
    <!-- Asymmetric Feature Article (spans 8 columns on desktop) -->
    <article kos-col-span="8">
      <span class="eyebrow">Architecture</span>
      <h1>Structure Shapes Experience</h1>
      <p>Kōshi provides proportional spatial balance across responsive viewports.</p>
    </article>

    <!-- Supporting Sidebar (spans 4 columns on desktop) -->
    <aside kos-col-span="4">
      <h2>Related Notes</h2>
      <p>Content stacks into a single column automatically on narrow screens.</p>
    </aside>
  </div>
</section>
```

---

## 4. The Five Developer Entry Points

Kōshi is organized so you can adopt only what you need:

1. **[Kōshi Core (`koshi.css`)](dist/downloads/koshi.css):** Standalone, production-ready stylesheet (~17 KB unminified, ~3.5 KB gzip).
2. **[Documentation (`/docs/`)](https://koshi.eien.studio/docs/):** Comprehensive API reference, mathematical formulas, and tutorial guides.
3. **[Composition Lab (`/lab/`)](https://koshi.eien.studio/lab/):** Interactive visual sandbox with live lattice grid overlay and responsive container resizing.
4. **Exported Compositions:** Self-contained, framework-agnostic HTML/CSS specimens ready to paste into any project.
5. **[Optional Agent Skill (`skills/koshi/`)](docs/agent-skill-installation.md):** 8-file Interpretable Context Architecture (ICM) for AI coding assistants.

For details on each entry point, see the **[Developer Guide](docs/developer-guide.md)**.

---

## 5. The Optional Agent Skill (ICM Architecture)

Kōshi is completely usable by human developers without AI. However, for teams developing with AI coding tools (Claude Code, Cursor, Google Antigravity, OpenAI Codex), Kōshi provides an optional, modular agent skill.

### Progressive Context Disclosure
Rather than injecting a massive, monolithic documentation file that clutters LLM context windows, Kōshi uses **Progressive Context Disclosure**:
- A lightweight router (`skills/koshi/SKILL.md`, maintained under an internal Kōshi budget of $\le 100$ lines) is exposed to the agent.
- Child documents (API contracts, architectural laws, composition guides, anti-patterns, workflows, and 7 curated specimens) are loaded **on demand** only when relevant.
- A fixture-based document-selection comparison demonstrated a **63.7% reduction in selected-document word count** on matched authoring tasks (averaging 2,911 retrieved words under progressive disclosure vs. 8,029 words for monolithic context). This metric reflects document selection volume and does not represent measured live agent token or financial savings.

### Asking an Agent for a Kōshi Layout
With the skill installed, you can prompt your AI assistant with natural architectural requirements:
```text
Create an editorial bento grid showcase:
- 1 dominant hero card spanning 8 columns and 2 rows.
- 2 stacked secondary cards spanning 4 columns each, using Subgrid row alignment.
- Use native Kōshi markup inside .kos-composition.
- Ensure Law I (Containment) holds down to 320px mobile viewports.
```

The agent loads the appropriate reference files and writes precise, valid Kōshi markup adhering to documented API contracts and avoiding common traps like invented attributes (`kos-span`) or invalid CSS properties (`grid-row: subgrid`).

See **[Agent Skill Installation](docs/agent-skill-installation.md)** to install the skill in Claude Code, Cursor, Antigravity, or Codex.

---

## 6. Supported API & Architectural Boundaries

### Supported HTML Attributes
- **Columns:** `kos-cols="1..12|custom"`
- **Column Spans:** `kos-col-span="1..12|custom"`
- **Row Spans:** `kos-row-span="1..6|custom"`
- **Offsets:** `kos-offset="1..6"`
- **Visual Order:** `kos-order="-1|0|1|2|first|last"`
- **Subgrid:** `kos-subgrid="rows"`
- **Flexbox Growth:** `kos-grow="0|1|2|3"` (explicit spans default to `0` to preserve *Yohaku*)
- **Aspect Ratios:** `kos-ratio="1:1|4:3|16:9|21:9"`
- **Responsive Collapse:** `kos-collapse="never|tablet|mobile"`
- **Lattice Debug:** `kos-debug`

### Architectural Boundaries & Safe Practices
- Responsive container stacking is activated by wrapping grids in `.kos-composition`.
- Grid item spans use longhand `grid-column-end: span N` to prevent collision with offsets.
- When using `aspect-ratio: 16/9`, omit rigid `min-height: 220px` or apply it conditionally via container queries (`@container (min-width: 480px)`) to avoid intrinsic size transfer overflow on mobile screens.

---

## 7. Compatibility & Verification Limitations

- **Browser Support:** Cross-browser verified via Playwright across Chromium 159+, Firefox 159+, and WebKit 27+ on Windows, macOS, and Linux. Supported down to $320\text{px}$ mobile screens.
- **CSS Subgrid:** Requires modern evergreen browsers (Chrome 117+, Firefox 71+, Safari 16+). In legacy browsers without subgrid support, layouts degrade gracefully to independent child tracks.
- **Container Queries:** Native browser support in Chrome 105+, Firefox 110+, Safari 16+.
- **Agent Skill Compatibility:** Verified locally with live invocation in Google Antigravity. Documented filesystem conventions provided for OpenAI Codex, Claude Code, and Cursor.

---

## 8. Local Development

To run the documentation website and interactive Composition Lab locally:

```bash
# Clone the repository
git clone https://github.com/kalebberry/koshi.git
cd koshi

# Install dependencies (Node.js LTS 20+ or 22+ recommended)
npm install

# Start development server
npm run dev

# Run unit tests and typecheck
npm run test:unit
npm run check

# Build static production site and download artifacts
npm run build
```

---

## 9. License & Attribution

Kōshi is open-source software licensed under the **[MIT License](LICENSE)**.  
Crafted with intention by **Sourumeiji / Studio Eien** (2026).
