# Kōshi Curated Specimens: Tested Architectural Patterns

**Specification Version:** 0.1.0 (Aligned with Kōshi Core v0.2.0)  
**Origin:** Selected and adapted directly from the 72 verified recipes in `src/lib/compositions.ts`.  
**Purpose:** Concrete, standalone reference implementations illustrating Kōshi's four architectural pillars.

---

## 1. Bento Master Tile (8 : 4 Stack)
*Origin: Recipe `bento-hero-stack` (`src/lib/compositions.ts`)*

### Intended Use
Feature-rich landing pages, SaaS product showcases, or portfolio hero sections where a dominant media preview is paired with stacked contextual feature cards.

### Compositional Reasoning
Establishes a primary focal anchor using an 8-column visual container spanning 2 rows with a cinematic 16:9 aspect ratio. The remaining 4 columns house two vertically stacked secondary cards.

In a unified 12-column grid, the hero occupies columns 1–8 of rows 1 and 2. Card 1 fills columns 9–12 of row 1. Card 2 automatically flows into columns 9–12 of row 2 via CSS grid auto-placement (no offset required).

```html
<section class="kos-composition">
  <div class="kos-grid" kos-cols="12">
    <!-- Dominant 8-column media anchor spanning 2 rows -->
    <div kos-col-span="8" kos-row-span="2" kos-ratio="16/9">
      <img src="/visual.webp" alt="Primary Product Demonstration" />
    </div>

    <!-- Stacked 4-column satellite card 1 (Row 1, Cols 9-12) -->
    <article kos-col-span="4" class="card">
      <span class="eyebrow">FEATURE 01</span>
      <h3>Modular Architecture</h3>
      <p>Snaps to the upper right 4-column quadrant.</p>
    </article>

    <!-- Stacked 4-column satellite card 2 (Row 2, auto-placed in Cols 9-12) -->
    <article kos-col-span="4" class="card">
      <span class="eyebrow">FEATURE 02</span>
      <h3>Subgrid Inherited</h3>
      <p>Completes the vertical stack beside the 8-column hero.</p>
    </article>
  </div>
</section>
```

- **Primitives Used:** `.kos-grid`, `kos-cols="12"`, `kos-col-span`, `kos-row-span`, `kos-ratio="16/9"`, `.kos-composition`.
- **Technical Note on Offsets:** `kos-offset` strictly supports values `1` through `6`. Values like `kos-offset="8"` do not exist in Core and are unnecessary in a unified grid because grid auto-placement handles row 2 placement naturally.
- **Responsive Behavior:** Below $48\text{rem}$ ($768\text{px}$), the `.kos-composition` container query collapses all items into a single full-width stack (`grid-column: 1 / -1`).

---

## 2. Cinema Split Hero (7 : 5 Asymmetric Split)
*Origin: Recipe `hero-split-16-9` (`src/lib/compositions.ts`)*

### Intended Use
Editorial mastheads, article introductions, and high-impact landing hero sections.

### Compositional Reasoning
Subtle asymmetry ($7:5 \approx 1.4$, close to the Japanese silver ratio $1.414$, distinct from the golden ratio $\approx 1.618$) avoids the monotony of a rigid $6:6$ split. The 7-column media frame establishes visual precedence, while the 5-column text column provides an optimal reading line length ($45$–$75$ characters).

```html
<section class="kos-composition">
  <div class="kos-grid" kos-cols="12">
    <!-- 7-column cinematic frame -->
    <figure kos-col-span="7" kos-ratio="16/9">
      <img src="/cinema.webp" alt="Editorial Story Visual" />
    </figure>

    <!-- 5-column lead narrative block -->
    <header kos-col-span="5" class="hero-narrative">
      <span class="eyebrow">ARCHITECTURAL ESSAY</span>
      <h1>Form Follows Proportion</h1>
      <p>Deriving interface harmony from classical lattice geometry and twelve fractional tracks.</p>
      <a href="#read" class="cta-link">Read Story →</a>
    </header>
  </div>
</section>
```

- **Primitives Used:** `kos-cols="12"`, `kos-col-span="7"`, `kos-col-span="5"`, `kos-ratio="16/9"`, `.kos-composition`.
- **Responsive Behavior:** Stacks to single column below $48\text{rem}$, placing the visual first and the text directly beneath.

---

## 3. Subgrid Card Triad (4 : 4 : 4 Track Alignment)
*Origin: Recipe `feat-subgrid-triad` (`src/lib/compositions.ts`)*

### Intended Use
Feature comparison cards, pricing tables, or service triads where internal elements (eyebrow + title, description copy, CTA button) must align horizontally across columns regardless of varying text lengths.

### Compositional Reasoning
Solves the classic uneven card height problem without brittle JavaScript line-clamping. Each card participates directly in parent row tracks via CSS Subgrid.

```html
<section class="kos-composition">
  <div class="kos-grid" kos-cols="12" style="grid-template-rows: auto auto auto;">
    <!-- Card 1 spanning 4 columns and 3 parent row tracks -->
    <article kos-col-span="4" kos-row-span="3" kos-subgrid="rows" class="subgrid-card">
      <header>
        <span class="eyebrow">MODULE 01</span>
        <h3>Fluid Margin Math</h3>
      </header>
      <p>Calculates fluid margins via clamp(1rem, 3.5vw, 3.5rem) without layout jitter.</p>
      <footer><a href="#" class="btn">Learn More →</a></footer>
    </article>

    <!-- Card 2 -->
    <article kos-col-span="4" kos-row-span="3" kos-subgrid="rows" class="subgrid-card">
      <header>
        <span class="eyebrow">MODULE 02</span>
        <h3>Track Inheritance Across Cards</h3>
      </header>
      <p>Child cards inherit parent grid rows so tags, titles, descriptions, and CTA links align horizontally.</p>
      <footer><a href="#" class="btn">Learn More →</a></footer>
    </article>

    <!-- Card 3 -->
    <article kos-col-span="4" kos-row-span="3" kos-subgrid="rows" class="subgrid-card">
      <header>
        <span class="eyebrow">MODULE 03</span>
        <h3>Container Query Collapse</h3>
      </header>
      <p>Gracefully reflows below container widths into a clean single-column stack on mobile devices.</p>
      <footer><a href="#" class="btn">Learn More →</a></footer>
    </article>
  </div>
</section>
```

- **Primitives Used:** `kos-col-span="4"`, `kos-row-span="3"`, `kos-subgrid="rows"`.
- **Syntax Rule:** Subgrid sets `grid-template-rows: subgrid` (via `kos-subgrid="rows"`). The item specifies row count via `kos-row-span="3"`. Never write invalid `grid-row: subgrid`.
- **Responsive Behavior:** In desktop mode, rows align across cards. Upon mobile collapse ($\le 48\text{rem}$), `.kos-subgrid` switches automatically to `display: flex; flex-direction: column;` with natural vertical flow spacing (`var(--kos-subgrid-gap, 0.75rem)`).

---

## 4. Magazine Multi-Row Editorial (7 : 5 Asymmetric Spread)
*Origin: Recipe `edit-magazine-asymmetric` (`src/lib/compositions.ts`)*

### Intended Use
Editorial journalism, magazine features, and long-form case studies.

### Compositional Reasoning
Pairs a dominant 7-column 4:3 photograph spanning 2 rows with a headline block on row 1 and a pull-quote block on row 2, evoking print magazine layout craftsmanship.

```html
<section class="kos-composition">
  <div class="kos-grid" kos-cols="12">
    <!-- 7-column photo spanning 2 rows -->
    <figure kos-col-span="7" kos-row-span="2" kos-ratio="4/3">
      <img src="/editorial.webp" alt="Editorial Study" />
    </figure>

    <!-- Row 1: Headline Block (Cols 8-12) -->
    <div kos-col-span="5" class="editorial-copy">
      <span class="eyebrow">ESSAY 01</span>
      <h2>The Space Between</h2>
      <p>In Japanese architecture, yohaku is not void—it is the active relationship between walls and lattice screens.</p>
    </div>

    <!-- Row 2: Pull-Quote Block (Cols 8-12, auto-placed beside photo) -->
    <blockquote kos-col-span="5" class="editorial-quote">
      <p>“Architecture is the thoughtful making of space.”</p>
      <cite>— Louis Kahn</cite>
    </blockquote>
  </div>
</section>
```

---

## 5. Tatami Modular Spread (2 : 8 : 2 Centered with Yohaku)
*Origin: Recipe `lat-tatami-modular` (`src/lib/compositions.ts`)*

### Intended Use
Minimalist editorial portfolios, artistic monographs, and focused landing announcements.

### Compositional Reasoning
Implements balanced focal framing: the 2-column margin on the left (via `kos-offset="2"`) and 2-column margin on the right frame the 8-column content block as an intentional sanctuary of focus ($2:8:2$).

```html
<section class="kos-composition">
  <div class="kos-grid" kos-cols="12">
    <!-- Centered 8-column visual with 2-column left offset -->
    <div kos-offset="2" kos-col-span="8" kos-ratio="golden">
      <img src="/monograph.webp" alt="Tatami Proportion Study" />
    </div>

    <!-- Centered 8-column text block with matching offset -->
    <div kos-offset="2" kos-col-span="8" class="text-block">
      <span class="eyebrow">YOHAKU DISCIPLINE</span>
      <h2>Negative Space as Anchor</h2>
      <p>In Tatami arrangement, the margin defines the sanctuary within.</p>
    </div>
  </div>
</section>
```

- **Important Contract (F-05):** `kos-offset="2"` sets `grid-column-start: 3`, while `kos-col-span="8"` sets `grid-column-end: span 8`. Both compose cleanly without conflict.

---

## 6. Content-Driven Flexbox Flow (Fluid Items & Proportional Card)

### Intended Use
Interactive filter bars, tag clouds, or mixed content feeds where organic elements flow naturally and wrap alongside a structured card.

### Compositional Reasoning
Demonstrates the **Flexbox Flow Pillar (Law II)**: unspanned items share available space fluidly (`flex: 1 1 16rem`), while an explicitly spanned card maintains proportional geometry (*Yohaku*) without greedy stretching (`flex-grow: 0`).

```html
<div class="kos-flex-grid">
  <!-- Unspanned items: fluid automatic sizing (flex-grow: 1, basis 16rem) -->
  <div class="filter-item">Architecture</div>
  <div class="filter-item">Editorial</div>

  <!-- Explicit 4-column card: defaults to flex-grow: 0 (preserves negative space) -->
  <article kos-col-span="4" class="proportional-card">
    <h4>Proportional Summary</h4>
    <p>Maintains exact 4-track basis (384px in 1200px container) without greedy expansion.</p>
  </article>

  <!-- Opt-in growth card: expands across positive free space -->
  <article kos-col-span="4" kos-grow="1" class="expanded-card">
    <h4>Opt-In Growth</h4>
    <p>Declares kos-grow="1" to consume remaining positive free space on the line.</p>
  </article>
</div>
```

- **Container Primitive:** `.kos-flex-grid` (`display: flex; flex-wrap: wrap; gap: var(--kos-gutter);`). Note that `.kos-flow` is strictly an axial vertical spacing utility, not a flexbox grid container.

---

## 7. Compact Sidebar Options

### Option A: Dedicated Utility Primitive (`.kos-sidebar-grid`)
Used for fixed 16rem sidebar layouts. Stays multi-column on desktop and tablet, and collapses to single-column on mobile viewports via `@media (max-width: 40rem)`:

```html
<div class="kos-sidebar-grid">
  <aside class="sidebar-nav">
    <nav>Sidebar (Fixed 16rem)</nav>
  </aside>
  <main class="main-content">
    <h2>Main Content Area</h2>
  </main>
</div>
```

### Option B: Container-Query Responsive Sidebar (`.kos-composition > .kos-grid`)
When the sidebar should collapse based on its immediate parent container width (e.g. at $\le 32\text{rem}$ / $512\text{px}$), use `.kos-grid` inside `.kos-composition[kos-collapse="sm"]`:

```html
<section class="kos-composition" kos-collapse="sm">
  <div class="kos-grid" kos-cols="12">
    <aside kos-col-span="3" class="sidebar-nav">
      <nav>Sidebar Navigation</nav>
    </aside>
    <main kos-col-span="9" class="main-content">
      <h2>Documentation Article</h2>
    </main>
  </div>
</section>
```
