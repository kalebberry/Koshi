# Kōshi Complete Monolithic Architectural Specification & Skill Reference

> **Note for Evaluation Condition D:** This document consolidates all eight Kōshi skill modules into a single monolithic reference. It contains 100% equivalent technical contracts, architectural laws, principles, anti-patterns, workflows, and curated specimens.

---

<!-- SECTION START: skills/koshi/SKILL.md -->

---
name: koshi
description: >-
  Architectural layout system for intentional web composition using native
  CSS Grid, Flexbox, Subgrid, and Container Queries. Use when designing,
  authoring, refining, or diagnosing layouts, responsive scaffolds,
  editorial compositions, or bento grids in projects using Kōshi.
---

# Kōshi (格子) — Intentional Web Composition

Kōshi is an architectural composition system built on native CSS. It provides
a disciplined layout vocabulary for humans and AI agents to construct
predictable, responsive compositions grounded in craftsmanship and intentional
negative space (*Yohaku*).

- **Skill Version:** 0.1.0
- **Core Compatibility:** v0.2.0 (pure CSS in `@layer kos-grid`, zero runtime JS)

---

## 1. The Four Foundational Pillars

1. **CSS Grid — Architecture:** Multi-axis spatial structure, deliberate track geometry (`.kos-grid`).
2. **Flexbox — Flow:** Content-driven distribution, natural wrapping, proportional bases (`.kos-flex-grid`).
3. **Subgrid — Alignment:** Shared track relationships across nested DOM cards (`[kos-subgrid]`).
4. **Container Queries — Context:** Responsive adaptation based on local available space (`.kos-composition`, `.kos-cq`).

---

## 2. Activation Boundaries

### Activate This Skill When:
- The project imports `koshi.css` or declares Kōshi markup (`.kos-grid`, `.kos-flex-grid`, `.kos-composition`).
- The user explicitly asks to use, convert to, or troubleshoot Kōshi.
- Designing responsive scaffolds, bento grids, magazine layouts, or media galleries with Kōshi.

### Do NOT Activate When:
- Working on generic CSS in projects that do not use or intend to adopt Kōshi.
- Micro-component styling with no spatial or track relationship to a layout.
- Styling typography, color palettes, or theme tokens (Kōshi governs spatial layout only).
- The project uses an incompatible layout framework (e.g. Tailwind, Bootstrap) without an explicit migration request.

---

## 3. Essential Technical Constraints

1. **Never Invent Attributes:** Only use verified attributes documented in [API Contracts](./references/api-contracts.md). Never use hallucinated attributes like `kos-span`, `kos-width`, `kos-columns`, `kos-flex-col`, or `kos-container="inline-size"`.
2. **Flexbox Growth Contract (Decision D-1):** In `.kos-flex-grid`, supported numeric spans (`kos-col-span="1..12"`) default to `flex-grow: 0` (proportional basis). Unspanned items receive Kōshi's rule `flex: 1 1 16rem` (growing automatically). Opt-in growth requires explicit `kos-grow="1"`. (Note: In standard native CSS Flexbox, `flex-grow` defaults to `0`).
3. **Shrinking & Containment:** `flex-shrink: 1` allows items to shrink, but active shrinking does not guarantee overflow prevention if minimum content size exceeds container width.
4. **Valid Attribute Ranges:** `kos-col-span` supports `1..12` and `custom`. `kos-row-span` supports `1..6` and `custom`. `kos-offset` strictly supports `1..6`. Spans do NOT need to sum to 12; partial rows and intentional asymmetric layouts are fully supported.
5. **Preserve Offsets (F-05):** Grid item spans use longhand `grid-column-end: span N` to avoid shorthand collisions with `kos-offset` (`grid-column-start: N+1`). Native shorthand declarations (such as `grid-column: 1 / -1` in container collapse) remain valid and intentional where full track resetting is desired.
6. **Subgrid Syntax:** Subgrid uses `grid-template-rows: subgrid` (via `kos-subgrid="rows"`). Never write `grid-row: subgrid` (invalid CSS).
7. **Configurable Defaults:** Gutter (`--kos-gutter`), min item size (`--kos-grid-min-item-size`), and container widths are configurable custom properties, not hardcoded constants.

---

## 4. Human Creative Authority

- **Preserve Creative Intent:** Respect user-provided design direction, content hierarchy, and branding.
- **Yohaku is a Principle, Not Dogma:** Unoccupied space may represent intentional *Yohaku* or an unconsidered gap; never assume all unused space is intentional without confirming intent. Do not force asymmetry, minimalism, or Japanese aesthetics where the user requires dense or conventional UI.
- **Autonomous vs. Gated Decisions:** Make reversible, proportional layout adjustments autonomously. Request human guidance when consequential layout direction or architectural changes are unresolved.
- **Instruction Precedence:** Project-specific guidelines and direct human instructions always override skill recommendations.

---

## 5. Context Routing Matrix (Progressive Disclosure)

Load ONLY the operational files required for your specific task:

| Task Intent | Primary Runbook / Reference | Supporting Context |
| :--- | :--- | :--- |
| **API Syntax / Properties** | [API Contracts](./references/api-contracts.md) | [Architectural Laws](./references/architectural-laws.md) |
| **Engineering Invariants & Bounds** | [Architectural Laws](./references/architectural-laws.md) | [Anti-Patterns](./principles/anti-patterns.md) |
| **Layout Design & Spatial Reasoning** | [Composition Guide](./principles/composition-guide.md) | [Curated Specimens](./examples/curated-specimens.md) |
| **Authoring New Composition** | [Compose & Refine](./workflows/compose-and-refine.md) | [Composition Guide](./principles/composition-guide.md) |
| **Debugging / Layout Triage** | [Diagnose & Fix](./workflows/diagnose-and-fix.md) | [Anti-Patterns](./principles/anti-patterns.md) |
| **Code Examples & Specimen Patterns** | [Curated Specimens](./examples/curated-specimens.md) | [API Contracts](./references/api-contracts.md) |
| **Failure Prevention & Common Traps** | [Anti-Patterns](./principles/anti-patterns.md) | [Architectural Laws](./references/architectural-laws.md) |

---

## 6. Verification Expectations

Before completing any Kōshi layout task:
- Verify horizontal containment: `scrollWidth <= clientWidth` across viewports down to $320\text{px}$.
- Verify that offsets and spans compose without collision.
- Verify that visual reordering (`order`, offsets) maintains a logical reading sequence consistent with DOM source order (WCAG 2.1 SC 1.3.2). Auditing DOM sequence is necessary for reading order, but does not by itself establish complete accessibility compliance.


---

<!-- SECTION START: skills/koshi/references/api-contracts.md -->

# Kōshi API Contracts & Syntax Specification

**Specification Version:** 0.1.0 (Aligned with Kōshi Core v0.2.0)  
**Cascade Layer:** `@layer kos-grid`  
**Runtime Requirements:** 0 KB JavaScript, 100% native CSS.

---

## 1. Design Tokens & Configurable Custom Properties

Kōshi defaults are defined on `:root` within `@layer kos-grid`. All properties are configurable by authors:

| Custom Property | Default Value | Purpose |
| :--- | :--- | :--- |
| `--kos-gutter` | `1.5rem` ($24\text{px}$) | Spatial gap between grid and flexbox tracks. |
| `--kos-grid-min-item-size` | `16rem` ($256\text{px}$) | Intrinsic track basis for auto-fit / auto-fill grids and flex items. |
| `--grid-container-offset` | `clamp(1rem, 3.5vw, 3.5rem)` | Dynamic inline margin offset for `.kos-container`. |
| `--container-max-width-narrow` | `48rem` ($768\text{px}$) | Maximum width for narrow containers (`container-type="narrow"`). |
| `--container-max-width-default` | `75rem` ($1200\text{px}$) | Maximum width for default containers. |
| `--container-max-width-wide` | `90rem` ($1440\text{px}$) | Maximum width for wide containers (`container-type="wide"`). |
| `--kos-sidebar-width` | `16rem` ($256\text{px}$) | Fixed sidebar column track width in `.kos-sidebar-grid`. |
| `--kos-masonry-columns` | `3` | Column count in `.kos-masonry-grid`. |
| `--kos-flow-space` | `1rem` ($16\text{px}$) | Vertical separation in `.kos-flow > * + *` (axial flow utility). |
| `--kos-subgrid-gap` | `0.75rem` ($12\text{px}$) | Vertical flex gap fallback for subgrids during mobile container collapse. |

### Gutter Utility Modifiers
Override `--kos-gutter` on any container using utility classes:
- `.kos-gap-0` $\to$ `0`
- `.kos-gap-2` $\to$ `0.5rem` ($8\text{px}$)
- `.kos-gap-4` $\to$ `1rem` ($16\text{px}$)
- `.kos-gap-6` $\to$ `1.5rem` ($24\text{px}$)
- `.kos-gap-8` $\to$ `2rem` ($32\text{px}$)

---

## 2. Container Primitives (`.kos-container`)

Constrains layout width while maintaining responsive fluid inline padding via `min(var(--max-width), calc(100% - var(--grid-container-offset)))`:

```html
<div class="kos-container">Default 1200px container</div>
<div class="kos-container" container-type="narrow">Narrow 768px reading column</div>
<div class="kos-container" container-type="wide">Wide 1440px media canvas</div>
<div class="kos-container" container-type="full-bleed">
  <div class="kos-container__inner">Full-bleed edge with padded inner content</div>
</div>
```

> **API Boundary:** `.kos-container` governs outer layout max-width and margin offsets; it does **not** establish a CSS Container Query context. Attributes like `kos-container="inline-size"` do not exist in Kōshi. To establish container query contexts, use `.kos-composition` or `.kos-cq`.

---

## 3. CSS Grid System (`.kos-grid`)

### Container Placement & Track Modes
- **Default Intrinsic Grid:** `.kos-grid` without attributes uses `repeat(auto-fit, minmax(min(100%, var(--kos-grid-min-item-size)), 1fr))`.
- **Automatic 12-Track Transition:** Adding any child with `[kos-col-span]` automatically transitions an unadorned `.kos-grid` into `repeat(12, minmax(0, 1fr))`.
- **Fixed Track Counts:** `kos-cols="1"` through `"12"`, and `kos-cols="16"`.
- **Custom Track Counts:** `kos-cols="custom"` combined with inline `style="--kos-cols: N;"`.
- **Placement Modes:** `.kos-grid--fill` (switches to `auto-fill`), `.kos-grid--fit` (switches to `auto-fit`).

### Item Attributes (Grid Children)

| Attribute / Property | Supported Values | CSS Longhand Implementation | Behavioral Impact |
| :--- | :--- | :--- | :--- |
| `kos-col-span` | `"1"` through `"12"` | `grid-column-end: span N;` | Spans $N$ column tracks. |
| `kos-col-span="custom"` | Requires `--kos-col-span: N;` | `grid-column-end: span var(--kos-col-span, 1);` | Arbitrary integer column span. |
| `kos-row-span` | `"1"` through `"6"` | `grid-row: span N;` | Spans $N$ explicit row tracks. |
| `kos-row-span="custom"` | Requires `--kos-row-span: N;` | `grid-row: span var(--kos-row-span, 1);` | Arbitrary integer row span. |
| `kos-offset` | `"1"` through `"6"` | `grid-column-start: N + 1;` | Shifts item start to line $N+1$ (e.g. `2` starts at line 3). |
| `kos-order` | `"-4"` through `"4"` | `order: N;` | Visual reordering in flex or grid. |

> **Critical Contracts:**
> 1. **Offsets & Spans (F-05):** Item column spans use longhand `grid-column-end: span N` to avoid shorthand collisions with `kos-offset` (`grid-column-start: N+1`). Shorthand `grid-column: 1 / -1` is reserved strictly for full container width resets during mobile collapse.
> 2. **Offset Limits:** `kos-offset` strictly supports integer values `1` through `6`. Values `7` through `12` are **not** defined in Core CSS.
> 3. **Attribute Verification:** Generic `kos-span` is unsupported; always use `kos-col-span` or `kos-row-span`.
> 4. **Partial Rows:** Column spans do **not** need to sum to 12. Incomplete rows leave remaining tracks vacant as intentional negative space (*Yohaku*).

---

## 4. Flexbox Grid System (`.kos-flex-grid`)

Used for one-dimensional distribution, natural wrapping, and content-driven rhythm.

```html
<div class="kos-flex-grid">
  <!-- Unspanned items share available space automatically -->
  <div>Item A</div>
  <div>Item B</div>
  <!-- Explicit span maintains deliberate proportional basis -->
  <div kos-col-span="4">Card C (384px in 1200px)</div>
</div>
```

### Finalized Growth Contract (Decision D-1 — Option A)

In standard native CSS Flexbox, the initial/default value of `flex-grow` is `0`. In Kōshi:
- Direct children inherit `flex: 1 1 var(--kos-grid-min-item-size)` (`16rem`) from the `.kos-flex-grid > *` baseline rule. Unspanned children therefore grow fluidly to distribute space.
- Supported numeric spans (`kos-col-span="1..12"`) explicitly set `flex-grow: 0`, establishing a proportional basis while preserving unoccupied space as *Yohaku*.
- Invalid, unsupported, empty, or custom spans (`kos-col-span="custom"`) fall through to `flex-grow: 1`.

| Item Markup | Computed `flex-basis` | Computed `flex-grow` | Layout Behavior |
| :--- | :--- | :---: | :--- |
| `<div>` (unspanned) | `var(--kos-grid-min-item-size)` (`16rem`) | **`1`** | Fluid automatic sizing (shares available space). |
| `<div kos-col-span="4">` | `calc(100% * 4/12 - gutter * 8/12)` | **`0`** | Proportional 4-track basis; preserves *Yohaku*. |
| `<div kos-col-span="13">` | `16rem` (fallback) | **`1`** | Out-of-range span falls through to fluid auto-growth. |
| `<div kos-col-span="">` | `16rem` (fallback) | **`1`** | Empty attribute falls through to fluid auto-growth. |
| `<div kos-col-span="custom">` | `16rem` (fallback) | **`1`** | Custom grid syntax in flex falls through to auto-growth. |
| `<div kos-col-span="4" kos-grow="1">` | Proportional 4-track basis | **`1`** | Opt-in expansion: consumes positive free space. |
| `<div kos-col-span="4" kos-grow="2">` | Proportional 4-track basis | **`2`** | Weighted expansion (receives $2\times$ free space). |
| `<div kos-col-span="4" kos-grow="3">` | Proportional 4-track basis | **`3`** | Weighted expansion (receives $3\times$ free space). |
| `<div kos-grow="0">` | Declared or fallback basis | **`0`** | Explicit non-growth override on unspanned item. |

> **Sizing Disclaimers:**
> - `flex-shrink: 1` remains active across all flex items. Proportional spans do **not** lock items to fixed pixel widths; items shrink when available row space is constrained.
> - Active shrinking does **not** guarantee overflow prevention if an item's minimum content size (`min-content`) exceeds the container width or if an unbroken text string exists.

---

## 5. CSS Subgrid (`[kos-subgrid]`)

Inherits row or column track lines from a parent `.kos-grid`:

```html
<div class="kos-grid" kos-cols="12" style="grid-template-rows: auto auto auto;">
  <!-- Card spanning 4 columns and 3 rows -->
  <article kos-col-span="4" kos-row-span="3" kos-subgrid="rows">
    <header>Aligned Header Track</header>
    <div class="content">Aligned Body Track</div>
    <footer>Aligned Action Track</footer>
  </article>
</div>
```

- `kos-subgrid` or `kos-subgrid="rows"` $\to$ `display: grid; grid-template-rows: subgrid;`
- `kos-subgrid="cols"` $\to$ `display: grid; grid-template-columns: subgrid;`
- `kos-subgrid="both"` $\to$ `display: grid; grid-template-rows: subgrid; grid-template-columns: subgrid;`

> **Syntax Invariant:** Subgrid sets `grid-template-rows: subgrid`. The card item defines how many parent tracks it spans using `kos-row-span="N"` (or `grid-row: span N`). Never write `grid-row: subgrid` (which is invalid CSS syntax).

---

## 6. Responsive Compositions (`.kos-composition` & `.kos-cq`)

Establishes a CSS Container Query context (`container-type: inline-size`):

```html
<section class="kos-composition" kos-collapse="sm">
  <div class="kos-grid" kos-cols="12">...</div>
</section>
```

### Stacking Breakpoints on Direct Child `.kos-grid`
- `kos-collapse="sm"`: Stacks to single column when container width $\le 32\text{rem}$ ($512\text{px}$).
- Default (no attribute): Stacks to single column when container width $\le 48\text{rem}$ ($768\text{px}$).
- `kos-collapse="lg"`: Stacks to single column when container width $\le 64\text{rem}$ ($1024\text{px}$).
- `kos-collapse="none"`: Disables container collapse entirely; tracks remain multi-column.

> **Scope Note:** Container collapse queries in Kōshi specifically target direct child `.kos-grid` elements. `.kos-sidebar-grid` and `.kos-masonry-grid` collapse via native mobile media queries (`@media (max-width: 40rem)`).

---

## 7. Aspect Ratio Framing (`kos-ratio`)

Prevents Cumulative Layout Shift (CLS) on media containers:

```html
<div kos-ratio="16/9"><img src="..." alt="..." /></div>
<div kos-col-span="4" kos-ratio="silver"><img src="..." alt="..." /></div>
```

- Supported ratios: `16/9`, `4/3`, `1/1` (or `square`), `3/4`, `golden` ($1.618:1$), `silver` ($1:1.414$, Hakugin-hi).
- Child media elements (`img`, `video`, `iframe`, `picture`) automatically receive `width: 100%; height: 100%; object-fit: cover; display: block;`.

---

## 8. Specialized Utilities

- **Sidebar Grid:** `.kos-sidebar-grid` $\to$ two columns: `minmax(0, var(--kos-sidebar-width, 16rem)) minmax(0, 1fr)`. Collapses to single column at `@media (max-width: 40rem)`.
- **Masonry Grid:** `.kos-masonry-grid` $\to$ multi-column layout (`columns: var(--kos-masonry-columns, 3)`), progressively enhanced with `grid-template-rows: masonry` where supported. Collapses to 1 column at `@media (max-width: 40rem)`.
- **Vertical Flow Utility:** `.kos-flow > * + *` $\to$ `margin-block-start: var(--kos-flow-space, 1rem)`. This is strictly an axial vertical spacing utility (the lobotomized owl pattern), completely distinct from `.kos-flex-grid`.
- **Lattice Visualizer:** Add `kos-debug` to any grid or composition during development to project Shu-iro red guides and track badge overlays.


---

<!-- SECTION START: skills/koshi/references/architectural-laws.md -->

# Kōshi Architectural Laws & Physical Bounds

**Specification Version:** 0.1.0 (Derived from Normative Architectural Laws Spec v2.0)  
**Purpose:** Establish immutable engineering invariants, behavioral guarantees, and explicit physical limitations for AI coding agents authoring Kōshi layouts.

---

## Law I — Containment
> *Kōshi compositions must respect their available layout space under explicitly defined and supported content and sizing conditions.*

- **Guarantee:** Compositions do not cause unintended horizontal overflow (`scrollWidth <= clientWidth`) on viewports down to $320\text{px}$.
- **Core Primitives:**
  - `.kos-container`: Sets `width: min(var(--max-width), calc(100% - var(--grid-container-offset)))` and `overflow-wrap: break-word`.
  - `.kos-grid > *`, `.kos-flex-grid > *`: Sets `min-width: 0` to neutralize the CSS grid item blowout trap.
  - Replaced elements (`img`, `video`): Constrained via `max-width: 100%; display: block;`.
- **Explicit Limitations & Bounds:**
  - `min-width: 0` does **not** override an explicit inline pixel width (e.g., `style="width: 800px"`). Author intent overrides containment.
  - Unbroken strings without whitespace require `.kos-container`'s `overflow-wrap: break-word`.
  - **Shrink Disclaimer:** Active shrinking (`flex-shrink: 1`) does **not** guarantee overflow prevention if an item's minimum content size (`min-content`) exceeds container width or if an unbroken string exists.

---

## Law II — Flow
> *Kōshi provides predictable automatic sizing, proportional sizing, growth, distribution, and wrapping.*

- **Guarantee:** 
  - Direct children of `.kos-flex-grid` distribute along one dimension with native gutter deduction.
  - In standard native CSS Flexbox, `flex-grow` defaults to `0`. In Kōshi's `.kos-flex-grid > *`, unspanned items receive `flex: 1 1 16rem`, sharing available row space fluidly.
  - Supported numeric spans `1` through `12` explicitly default to non-growing geometry (`flex-grow: 0`), preserving unoccupied row space as intentional negative space (*Yohaku*).
  - Explicit growth modifiers (`kos-grow="1"`, `"2"`, `"3"`) override defaults at equal specificity `(0, 2, 0)`.
  - Invalid, empty, or custom spans fall through to fluid auto-growth (`flex-grow: 1`).
  - Column spans do **not** need to sum to 12. Incomplete rows, single-item spans, and intentional asymmetric divisions are fully supported.
- **Explicit Limitations & Bounds:**
  - Flex items are atomic boxes; wrapping moves the entire box to the next line.
  - `flex-shrink: 1` remains active. "Non-growing" does **not** mean an immutable pixel lock; items shrink under narrow viewports.

---

## Law III — Alignment
> *Kōshi establishes shared spatial track relationships across independent DOM subtrees using native CSS Subgrid.*

- **Guarantee:** A child element bearing `[kos-subgrid]` inherits the row or column track lines of its parent `.kos-grid`.
- **Core Primitives:** `kos-subgrid="rows"`, `kos-subgrid="cols"`, `kos-subgrid="both"`.
- **Explicit Limitations & Bounds:**
  - Subgrid sets `grid-template-rows: subgrid` (or `columns: subgrid`). The participating item defines how many parent tracks it spans using `kos-row-span="N"` (or `grid-row: span N`). Writing `grid-row: subgrid` is invalid CSS syntax.
  - Subgrid enforces **track-level spatial alignment**, not typographic baseline alignment. Baseline alignment across independent text elements requires explicit typography rules or CSS `align-items: baseline`.

---

## Law IV — Nesting
> *Kōshi compositions compose recursively without geometric interference or style leakage between nesting tiers.*

- **Guarantee:**
  - Grid inside Grid establishes a discrete local formatting context.
  - Grid inside Flexbox preserves multi-track column architecture.
  - Flexbox inside Grid establishes a discrete flex formatting context.
- **Explicit Limitations & Bounds:**
  - Container query collapse rules on `.kos-composition` target direct child `.kos-grid` elements; nested flex grids do not force-collapse into single-column stacks.
  - **Legitimate Nested Grids:** Independent nested grids (without subgrid) are completely valid and necessary when a component requires its own local track coordinate system independent of the parent grid.

---

## Law V — Accessibility
> *Kōshi layouts must maintain a legible, logical relationship between the document object model (DOM) reading order and the visual flow.*

- **Guarantee:** Standard Kōshi compositions follow standard DOM source order.
- **Explicit Limitations & Bounds:**
  - Visual reordering via `kos-order` or `kos-offset` alters visual coordinates without modifying the DOM.
  - Authors and agents are responsible for ensuring visual reordering does not degrade accessibility or violate WCAG 2.1 Success Criterion 1.3.2 (Meaningful Sequence). Auditing DOM sequence is necessary for logical reading order, but does not by itself constitute comprehensive accessibility compliance.
  - Kōshi does **not** claim automatic or universal WCAG compliance.

---

## Law VI — Portability
> *Kōshi Core must function identically across any standards-compliant modern web environment without runtime dependencies, script execution, or framework ties.*

- **Guarantee:** 
  - Kōshi Core is 100% native CSS encapsulated in `@layer kos-grid`.
  - Zero runtime JavaScript dependencies ($0.00\text{KB}$ JS in Core).
  - Usable in vanilla HTML, Astro, React, Vue, Svelte, or static sites via `<link rel="stylesheet">`.
- **Explicit Limitations & Bounds:**
  - The documentation site and Composition Lab use Astro and Vue; however, Kōshi Core itself has zero framework dependencies.

---

## Law VII — Determinism
> *Given identical container constraints and markup inputs, Kōshi compositions evaluate to mathematically deterministic track geometry across all supported browser engines.*

- **Guarantee:** Column widths, gaps, and offset positions calculate deterministically across Chromium, Firefox, and WebKit without floating-point layout drift.
- **Tested Verification Environments:**
  - Chromium 159.0 (Blink)
  - Firefox 159.0 (Gecko)
  - WebKit 27.2 (Safari equivalent)
- **Explicit Limitations & Bounds:**
  - Browser zoom levels and subpixel display scaling may introduce fractional subpixel rounding ($\pm 0.5\text{px}$), which is absorbed by native CSS track mathematics.


---

<!-- SECTION START: skills/koshi/principles/composition-guide.md -->

# Kōshi Composition Guide: Spatial Reasoning & Layout Architecture

**Specification Version:** 0.1.0 (Aligned with Kōshi Core v0.2.0)  
**Scope:** Principles for choosing layout primitives, structuring visual rhythm, and reasoning about spatial relationships.

---

## 1. The Four Foundational Pillars

Kōshi is built on the understanding that modern layout systems are complementary, not competing. Selecting the right primitive is the first architectural decision:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        THE FOUR LAYOUT PILLARS                         │
├───────────────────┬───────────────────┬────────────────────────────────┤
│ Pillar            │ Native Mechanism  │ Compositional Responsibility   │
├───────────────────┼───────────────────┼────────────────────────────────┤
│ 1. Architecture   │ CSS Grid          │ Deliberate multi-axis geometry,│
│                   │ (.kos-grid)       │ spatial frameworks, track lines│
├───────────────────┼───────────────────┼────────────────────────────────┤
│ 2. Flow           │ Flexbox           │ One-dimensional distribution,  │
│                   │ (.kos-flex-grid)  │ natural wrapping, content rhythm│
├───────────────────┼───────────────────┼────────────────────────────────┤
│ 3. Alignment      │ CSS Subgrid       │ Cross-card track synchronization│
│                   │ ([kos-subgrid])   │ without flattening DOM hierarchy│
├───────────────────┼───────────────────┼────────────────────────────────┤
│ 4. Context        │ Container Queries │ Local responsive adaptation    │
│                   │ (.kos-composition)│ based on available parent space│
└───────────────────┴───────────────────┴────────────────────────────────┘
```

### Primitive Selection Matrix

| Content & Layout Need | Recommended Primitive | Why This Primitive? |
| :--- | :--- | :--- |
| Asymmetric magazine spreads, bento grids, full-page scaffolds | **CSS Grid (`.kos-grid`)** | Coordinates both columns and rows simultaneously on a shared fractional coordinate system. |
| Tag clouds, navigation bars, metadata badges, wrapping media lists | **Flexbox (`.kos-flex-grid`)** | Allows content to flow organically, size intrinsically, and wrap naturally when line space is exceeded. |
| Multi-column feature cards where titles, copy, and CTAs must align across cards | **CSS Subgrid (`[kos-subgrid="rows"]`)** | Child cards participate directly in parent row tracks, eliminating uneven heights without JavaScript. |
| Components embedded in unknown parent containers (e.g., sidebar vs. main content) | **Container Queries (`.kos-composition` / `.kos-cq`)** | Adapts layout based on immediate container width rather than global viewport width. |

---

## 2. Spatial Hierarchy & Visual Weight

Composition begins with establishing clear focal hierarchy:

1. **Dominant Focal Point (The Anchor):**  
   Assign the anchor element a dominant column span (e.g., `kos-col-span="7"` or `"8"`) or a multi-row span (`kos-row-span="2"`).
2. **Secondary Narrative (Supporting Content):**  
   Position supporting text, stats, or satellite cards in the complementary tracks (e.g., `kos-col-span="5"` or `"4"`).
3. **Tertiary Metadata:**  
   Use Subgrid or intrinsic Flexbox rows to tuck metadata, tags, and timestamps beneath primary blocks without competing for visual dominance.

---

## 3. Spatial Rhythm: Ma (間) and Yohaku (余白)

Kōshi draws inspiration from traditional spatial disciplines, translating them into practical web layout decisions:

### Yohaku (余白 — Intentional Negative Space)
In Kōshi, negative space is an active compositional element, not an accidental defect or void space waiting to be filled.
- In `.kos-flex-grid`, explicit column spans default to `flex-grow: 0`. A 4-column card on an incomplete row preserves the remaining 8 columns as breathing room.
- In `.kos-grid`, offsets (`kos-offset="2"`) create intentional breathing margins that draw visual focus to centered content (such as Tatami modular layouts).
- **Distinguishing Intent from Gaps:** Unoccupied space may be intentional *Yohaku* or simply an unconsidered layout gap. Agents must **not** assume all unused space is intentional Yohaku without verifying design intent.
- **Partial Rows are Valid:** Column spans do **not** need to sum to 12. Partial rows, single-card lines, and offset blocks are fully valid.
- **Aesthetic Authority:** *Yohaku* is an intentional design option, not an immutable dogma. Kōshi equally supports dense commercial interfaces and data dashboards. Never force empty space when the user's intent requires dense utility.

### Ma (間 — Meaningful Spatial Intervals)
*Ma* refers to the cadence and relationship between structural elements:
- Consistent native gutters (`--kos-gutter`, default `1.5rem` / $24\text{px}$).
- Proportional aspect-ratio framing (`kos-ratio`), ensuring visual rhythm does not collapse while assets load.

---

## 4. Asymmetry & Optical Balance

Symmetrical grids ($6:6$ or $4:4:4$) provide stability, but asymmetric distributions create forward visual momentum:

- **The Asymmetric Split ($8 : 4$):** Highly effective for editorial headers where an 8-column media frame commands attention while a 4-column column provides concise narrative context.
- **The Cinema Split ($7 : 5$):** A $7:5$ asymmetric split ($1.4$ ratio, close to the classical Yamato / Silver ratio of $1.414$, distinct from the golden ratio $\phi \approx 1.618$). Balances wide 16:9 media with comfortable reading lines.
- **Counterbalanced Offsets:** Pairing an offset item (`kos-offset="2" kos-col-span="8"`) creates centered symmetry with balanced 2-track margins on either side ($2:8:2$).

---

## 5. Responsive Composition & Container Context

Responsive design in Kōshi is container-driven, but recognizes legitimate uses of viewport media queries:

- **Container Queries for Components:** Wrap multi-column layouts inside `.kos-composition` to collapse tracks into single-column stacks based on local container width:
  - Dense cards or compact sidebars $\to$ Early collapse `kos-collapse="sm"` ($32\text{rem}$ / $512\text{px}$).
  - Standard multi-column cards $\to$ Default collapse ($48\text{rem}$ / $768\text{px}$).
  - Wide panoramic media spreads $\to$ Late collapse `kos-collapse="lg"` ($64\text{rem}$ / $1024\text{px}$).
  - Fixed layouts $\to$ `kos-collapse="none"`.
- **Viewport Media Queries for Macro Layout:** Viewport media queries (`@media`) remain entirely appropriate and necessary for macro page scaffolding (e.g. outer page margins, header/nav hiding, print stylesheets, user accessibility preferences like `prefers-reduced-motion`, and mobile fallbacks such as Kōshi's `@media (max-width: 40rem)`).
- **Legitimate Nested Grids:** Independent nested grids are completely valid when a child card requires its own independent column geometry (e.g. a 3-button toolbar or status grid). Subgrid is only needed when sibling cards must synchronize tracks across columns.

---

## 6. Reading Order & Accessibility Considerations

Layout geometry must never compromise accessibility:
1. **DOM Order is Reading Order:** Screen readers and keyboard navigation follow DOM source sequence, not visual CSS coordinates.
2. **Audit Visual Reordering:** When using `kos-order` or `kos-offset`, verify that visual positioning does not create a disorienting disconnect with logical reading sequence (WCAG 2.1 SC 1.3.2).
3. **Heading Hierarchy:** Structural layout containers (`article`, `section`, `div`) must not replace proper semantic heading tags (`h1`–`h6`).


---

<!-- SECTION START: skills/koshi/principles/anti-patterns.md -->

# Kōshi Anti-Patterns & Common Failure Modes

**Specification Version:** 0.1.0 (Aligned with Kōshi Core v0.2.0)  
**Purpose:** Catalog common LLM failure modes, syntax traps, and architectural anti-patterns with actionable corrections and valid exceptions.

---

### 1. Hallucinated / Invented Attributes
- **Symptom:** Elements declare non-existent attributes such as `kos-span="6"`, `kos-width="50%"`, `kos-container="inline-size"`, `kos-columns="4"`, or `kos-flex-col`.
- **Why It Occurs:** LLMs extrapolate syntax from other frameworks or invent intuitive-sounding names.
- **Constraint:** Kōshi Core strictly evaluates `kos-cols`, `kos-col-span`, `kos-row-span`, `kos-offset`, `kos-order`, `kos-subgrid`, `kos-grow`, `kos-ratio`, `kos-collapse`, and `kos-debug`. Any other attribute has no CSS rules and fails silently.
- **Correction:** Use only verified attributes documented in [API Contracts](../references/api-contracts.md). Replace `kos-span="6"` with `kos-col-span="6"`; replace `kos-columns="4"` with `kos-cols="4"`. To establish a container query context, use class `.kos-composition` or `.kos-cq`, not an invented container attribute.

---

### 2. Confusing `.kos-flow` with `.kos-flex-grid`
- **Symptom:** Declaring `<div class="kos-flow">` expecting a horizontal, wrapping flexbox layout.
- **Why It Occurs:** Confusing the "Flow" architectural pillar with the `.kos-flow` CSS utility class.
- **Constraint:** In Kōshi Core, `.kos-flow` is strictly an axial vertical flow utility (`.kos-flow > * + * { margin-block-start: var(--kos-flow-space, 1rem); }`). Horizontal, wrapping flexbox layouts use `.kos-flex-grid`.
- **Correction:** Use `.kos-flex-grid` for one-dimensional distribution and natural wrapping. Reserve `.kos-flow` for vertical stacking of article paragraphs or text blocks.

---

### 3. Grid Shorthand Overriding Offsets (F-05 Collision)
- **Symptom:** Author adds `kos-offset="2"` to an item with `kos-col-span="4"`, but the item begins at track 1 instead of track 3.
- **Why It Occurs:** Applying custom CSS rules with shorthand `grid-column: span 4` (or `grid-column: 1 / span 4`). In native CSS, the `grid-column` shorthand resets `grid-column-start` to `auto`.
- **Constraint:** In Kōshi Core (Defect F-05), all item spans use longhand `grid-column-end: span N`.
- **Correction:** Always use longhand `grid-column-end: span N` when overriding or declaring spans alongside `kos-offset`.
- **Exceptions:** Intentional full-width collapse rules (such as `.kos-composition > .kos-grid > [kos-col-span] { grid-column: 1 / -1; }`) intentionally use shorthand to reset both start and end lines across the entire container.

---

### 4. Custom Spans Declared in Flexbox
- **Symptom:** Declaring `<div kos-col-span="custom" style="--kos-col-span: 5;">` inside `.kos-flex-grid` results in an item that ignores the custom property and renders at the default `16rem` basis.
- **Why It Occurs:** Assuming CSS Grid custom property escape hatches apply to Flexbox.
- **Constraint:** Flexbox proportional bases are pre-calculated strictly for integer spans `1` through `12`. In `.kos-flex-grid`, `kos-col-span="custom"` has no basis rule and falls through to fluid automatic sizing (`flex-grow: 1`).
- **Correction:** In `.kos-flex-grid`, use standard integer spans `1` through `12`. If an arbitrary non-standard ratio is required, use CSS Grid (`.kos-grid` with `kos-cols="custom"`).

---

### 5. Out-of-Bounds Offsets
- **Symptom:** Declaring `kos-offset="7"` or `kos-offset="8"` on a grid item.
- **Why It Occurs:** Assuming offsets support the full 12 columns.
- **Constraint:** Kōshi Core strictly defines `kos-offset="1"` through `kos-offset="6"` (setting `grid-column-start: N+1`). Offsets $7$ to $12$ are undefined in Core.
- **Correction:** In a unified grid with multi-row items (e.g. an 8-col hero spanning 2 rows), second-row items naturally place into columns 9–12 without needing an offset. For custom placements beyond column 7, use CSS `grid-column-start: N;`.

---

### 6. Invalid Subgrid Syntax (`grid-row: subgrid`)
- **Symptom:** Writing custom CSS or documentation stating `grid-row: subgrid`.
- **Why It Occurs:** Confusing grid placement properties with track sizing properties.
- **Constraint:** In CSS Grid Level 2, `grid-row` is a placement shorthand (`grid-row-start / grid-row-end`). Setting `grid-row: subgrid` is invalid CSS.
- **Correction:** Use `grid-template-rows: subgrid` (applied via `kos-subgrid="rows"`). The item itself declares how many parent tracks it spans using `kos-row-span="N"` (or `grid-row: span N`).

---

### 7. The "Greedy Fill" Anti-Pattern (Unnecessary `kos-grow="1"`)
- **Symptom:** Author automatically adds `kos-grow="1"` to every explicitly spanned Flexbox card, causing a 4-column card on an incomplete row to stretch across the entire page ($100\%$ width).
- **Why It Occurs:** Assuming that empty space on an incomplete row is always a bug that must be filled.
- **Constraint:** Under Decision D-1, explicit numeric spans default to `flex-grow: 0` to preserve deliberate proportional geometry and *Yohaku*.
- **Correction:** Omit `kos-grow="1"` unless the user or design brief explicitly requests that cards expand to absorb remaining space.

---

### 8. The "Empty Space Fallacy" (Dogmatic Yohaku)
- **Symptom:** Refusing to allow elements to fill the container on an incomplete row when the user explicitly requested a full-width stretching layout, claiming "Yohaku forbids it."
- **Why It Occurs:** Treating an aesthetic philosophy as an unbending technical dogma.
- **Constraint:** *Yohaku* is an intentional design option, not a mandatory rule. Kōshi explicitly provides `kos-grow="1..3"` so authors can choose fluid space-filling when desired.
- **Correction:** When user intent or functional requirements call for edge-to-edge distribution, apply `kos-grow="1"` willingly.

---

### 9. Unintentional Horizontal Overflow (Breaking Law I)
- **Symptom:** Horizontal scrollbars appear on mobile viewports ($320\text{px}$ to $480\text{px}$).
- **Why It Occurs:** Hardcoding inline fixed widths (e.g. `style="width: 600px;"`), or placing long unbroken strings outside `.kos-container`.
- **Constraint:** Law I (Containment) guarantees zero overflow only under supported conditions. Hardcoded inline pixel widths override `min-width: 0`. Active shrinking does not prevent overflow in these cases.
- **Correction:** Replace fixed widths with max-widths (`max-width: 600px; width: 100%;`). Ensure outer layouts are wrapped in `.kos-container` for `overflow-wrap: break-word`.

---

### 10. Rejecting Legitimate Media Queries & Legitimate Nested Grids
- **Symptom:** Claiming that `@media` queries or nested grids are strictly forbidden in Kōshi.
- **Why It Occurs:** Over-generalizing the preference for container queries and subgrids.
- **Correction:**
  - Viewport media queries (`@media`) are legitimate and necessary for macro page scaffolding, header/footer behavior, print styles, accessibility preferences, and mobile fallbacks.
  - Independent nested grids are legitimate and desirable when a child component has its own internal track structure independent of the parent grid.

---

### 11. Visual Reordering Compromising Reading Sequence (Law V)
- **Symptom:** Screen reader reads secondary sidebar content before the primary headline because `kos-order="-1"` was used to visually move the sidebar to the top.
- **Why It Occurs:** Using CSS visual reordering (`order` or `kos-offset`) without considering underlying DOM source order.
- **Constraint:** Law V (Accessibility) requires a logical relationship between DOM reading order and visual flow (WCAG 2.1 SC 1.3.2).
- **Correction:** Structure the DOM in meaningful reading order first. Use visual reordering only for non-structural, purely visual accents.

---

### 12. Forcing Kōshi Where Native CSS is Simpler
- **Symptom:** Wrapping a single centered button or icon in `.kos-composition > .kos-grid[kos-cols="12"] > [kos-col-span="12"]`.
- **Why It Occurs:** Assuming that every layout task requires a grid system.
- **Constraint:** Kōshi is a composition architecture, not a replacement for basic CSS utilities.
- **Correction:** Use standard native CSS for micro-placements (e.g., `margin-inline: auto` or `display: flex; justify-content: center;`). Reserve Kōshi for multi-track compositions and responsive scaffolds.


---

<!-- SECTION START: skills/koshi/workflows/compose-and-refine.md -->

# Kōshi Workflow: Compose and Refine

**Specification Version:** 0.1.0 (Aligned with Kōshi Core v0.2.0)  
**Purpose:** Actionable operational runbook for designing, authoring, and refining Kōshi web compositions.

---

## 1. The Adaptable 6-Stage Lifecycle

```
Understand ──> Plan ──> Compose ──> Refine ──> Verify ──> Handoff
     │                                                     ▲
     └───────────── Fast-Path (Minor / Reversible) ────────┘
```

The workflow is adaptable. Simple tasks (e.g. modifying a span or offset) use the **Fast-Path Workflow**, skipping detailed stage narration and proceeding directly to Compose and Verify.

---

### Stage 1: Understand
**Objective:** Capture author intent, content structure, and project constraints without imposing premature design decisions.

- **Actions:**
  1. Identify content elements: headlines, body copy, media, cards, call-to-actions, metadata.
  2. Identify the target context: full page hero, bento feature section, editorial article, or embedded sidebar.
  3. Identify established design conventions: existing typography, spacing scales, or brand tone.
  4. Identify responsive requirements: target breakpoints and container constraints.
- **Boundaries:**
  - Never invent branding, marketing copy, or unstated business requirements.
  - Never assume that an existing layout needs an unrequested overhaul.
  - Preserve human creative authority. Do not impose stylistic preferences (minimalism, asymmetry) unless requested.

---

### Stage 2: Plan
**Objective:** Map content elements to Kōshi spatial primitives and determine track geometry.

- **Actions:**
  1. **Select Primitives:**
     - Multi-axis spatial structure $\to$ `.kos-grid` (CSS Grid).
     - Content-driven wrapping distribution $\to$ `.kos-flex-grid` (Flexbox).
     - Synchronized card tracks $\to$ `kos-subgrid="rows"`.
     - Container-responsive adaptation $\to$ `.kos-composition` or `.kos-cq`.
  2. **Establish Track Proportions:**
     - Asymmetric Hero $\to$ $7:5$ (editorial split) or $8:4$ (major/minor split).
     - Triad Cards $\to$ $4:4:4$.
     - Tatami / Balanced Focal $\to$ $2:8:2$ (using `kos-offset="2"`).
     - Partial Rows $\to$ Spans do **not** need to sum to 12. Single-card lines (e.g. span 4 alone) or partial rows are fully valid.
  3. **Plan Negative Space (*Yohaku*):**
     - Determine whether unoccupied space on incomplete rows should remain as breathing room (default) or expand edge-to-edge (opt-in `kos-grow="1"`). Do not assume all unused space is intentional Yohaku.
- **Human Checkpoint:**
  - If the planned architecture involves significant trade-offs (e.g. restructuring an existing multi-column layout), briefly state the plan and confirm alignment before generating large blocks of code.

---

### Stage 3: Compose
**Objective:** Generate clean, standards-compliant HTML markup and minimal necessary CSS.

- **Actions:**
  1. Wrap multi-column layouts in `.kos-composition` with appropriate collapse threshold (`kos-collapse="sm"`, `"lg"`, or default).
  2. Apply outer `.kos-grid` or `.kos-flex-grid` classes.
  3. Assign verified child attributes: `kos-col-span`, `kos-row-span`, `kos-offset`, `kos-ratio`. (Never `kos-span`).
  4. Ensure semantic HTML structure (`<section>`, `<article>`, `<header>`, `<figure>`, `<h3>`).
- **Boundaries:**
  - Zero runtime JavaScript dependencies in Core layouts.
  - Zero invented attributes (refer to [API Contracts](../references/api-contracts.md)).
  - Prefer native CSS for simple micro-placements where Kōshi provides no benefit.

---

### Stage 4: Refine
**Objective:** Evaluate visual cadence, alignment, content resilience, and mobile flow.

- **Actions:**
  1. **Inspect Alignment:** Verify that headings, body copy, and CTA buttons align across sibling cards (using Subgrid where needed).
  2. **Inspect Spacing Rhythm:** Adjust gutter utilities (`.kos-gap-2` to `.kos-gap-8`) to maintain harmonious spacing.
  3. **Inspect Content Resilience:** Verify how the layout responds to variable content lengths (e.g., 3-line headline vs. 1-line headline).
  4. **Inspect Mobile Stacking:** Verify that container collapse rules stack cleanly into a single-column flow below breakpoint thresholds.
- **Boundaries:**
  - Do not impose unrequested aesthetic redesigns when the task only called for a localized adjustment.
  - Distinguish objective technical improvements from subjective aesthetic taste.

---

### Stage 5: Verify
**Objective:** Audit the generated composition against Kōshi's Architectural Laws.

- **Verification Checklist:**
  - [ ] **Law I (Containment):** Verified `scrollWidth <= clientWidth` across viewports down to $320\text{px}$. No hardcoded fixed widths overriding `min-width: 0`. Active shrinking does not guarantee containment if content exceeds container width.
  - [ ] **Law II (Flow):** Spans totaling $>12$ wrap naturally. Explicit Flexbox spans respect `flex-grow: 0` unless `kos-grow="1"` was intentionally requested. Spans totaling $<12$ leave unoccupied space when requested.
  - [ ] **Law III (Alignment):** Subgrid cards declare explicit row spans (`kos-row-span="3"`) to participate in parent tracks. Uses `grid-template-rows: subgrid`, never invalid `grid-row: subgrid`.
  - [ ] **Law IV (Nesting):** Nested grids do not leak styles or break outer track geometry.
  - [ ] **Law V (Accessibility):** DOM source sequence maintains a logical reading order consistent with visual flow (WCAG 2.1 SC 1.3.2).
- **Strict Verification Reporting Rule:**  
  *Agents must NEVER state or imply that "all tests pass", "visual alignment is verified", or "layout is responsive" without executing an actual verification command or reading the computed DOM tree.* Distinguish **observed verification** from **inferred correctness**.

---

### Stage 6: Handoff
**Objective:** Deliver clean production markup and communicate meaningful compositional decisions.

- **Actions:**
  1. Present the complete, clean semantic HTML/CSS markup.
  2. State consequential layout decisions concisely (e.g., *"Selected a 7:5 asymmetric grid with 16:9 media framing; wrapped in `.kos-composition` for 48rem mobile collapse"*).
  3. Note verification performed and state any remaining open design choices.

---

## 2. The Fast-Path Workflow (Minor / Reversible Edits)

When the task is minor (e.g., changing `kos-col-span="6"` to `"4"`, adding `kos-offset="2"`, or adjusting a gap utility):

1. **Direct Compose:** Apply the verified Kōshi attribute directly to the markup.
2. **Direct Verify:** Check for offset collisions (F-05) and horizontal containment (Law I).
3. **Direct Handoff:** Present the code diff concisely.


---

<!-- SECTION START: skills/koshi/workflows/diagnose-and-fix.md -->

# Kōshi Workflow: Diagnose and Fix

**Specification Version:** 0.1.0 (Aligned with Kōshi Core v0.2.0)  
**Purpose:** Actionable operational runbook for diagnosing, isolating, and repairing layout defects in Kōshi compositions.

---

## 1. The 6-Stage Diagnostic Sequence

$$\text{Observe} \longrightarrow \text{Reproduce} \longrightarrow \text{Inspect} \longrightarrow \text{Identify} \longrightarrow \text{Correct} \longrightarrow \text{Verify}$$

---

### Step 1: Observe (Capture the Symptom)
Identify the observable defect:
- Unintended horizontal scrollbar / overflow.
- Grid item starting at column 1 instead of its declared offset.
- Flexbox item unexpectedly stretching across the full row.
- Subgrid card titles misaligning vertically across columns.
- Layout refusing to stack into a single column on mobile.
- Items wrapping prematurely or failing to wrap when expected.

---

### Step 2: Reproduce
Isolate the minimal markup conditions that trigger the defect:
- Does the defect occur at all viewport widths, or only below a specific breakpoint?
- Does it reproduce with empty placeholder text, or only with dynamic live content?
- Is it isolated to a specific browser engine (Chromium, Firefox, or WebKit)?

---

### Step 3: Inspect (Inspect Computed Styles & DOM)
Use browser developer tools or computed style evaluations:
1. **Computed Track Geometry:** Check `getComputedStyle(element)` for `grid-column-start`, `grid-column-end`, `flex-basis`, and `flex-grow`.
2. **Container Queries:** Check if `@container` is active. Is the parent container establishing `container-type: inline-size`?
3. **Box Sizing:** Verify `box-sizing: border-box` is active on children and pseudo-elements.
4. **Dimensions & Content Sizing:** Check `scrollWidth` vs `clientWidth`. Is an inner child specifying an inline fixed width (`width: 600px`) that breaks `min-width: 0`?
5. **DOM Source Order:** Compare visual order against DOM order to check reading sequence.

---

### Step 4: Identify (Root-Cause Triage Decision Trees)

```
┌────────────────────────────────────────────────────────────────────────┐
│                        DEFECT TRIAGE DECISION TREE                     │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
    ┌───────────────────────────────┼───────────────────────────────┐
    ▼                               ▼                               ▼
[ UNEXPECTED STRETCH ]      [ OFFSET BROKEN ]           [ OVERFLOW / SCROLL ]
    │                               │                               │
    ▼                               ▼                               ▼
Is it .kos-flex-grid?       Is custom CSS using         Is an element setting
Check flex-grow:            shorthand grid-column?      inline fixed width?
- Spans 1-12 default to 0.  - Shorthand resets start.   - Overrides min-width: 0.
- Did author declare        Fix: Use longhand           Fix: Use max-width: 100%.
  kos-grow="1"?             grid-column-end: span N.    Is long text outside container?
Fix: Remove kos-grow="1"    Is offset > 6?              Fix: Wrap in .kos-container.
to restore Yohaku.          Fix: kos-offset only        Does min-content exceed width?
                            supports 1 to 6.            Fix: Active shrink cannot prevent it.
```

#### Diagnostic Scenarios:

#### Scenario A: Offset Collision (Shorthand Conflict)
- **Symptom:** `kos-offset="2"` has no effect when combined with a span.
- **Root Cause:** A CSS rule declares shorthand `grid-column: span 4` (or `grid-column: auto / span 4`), which silently resets `grid-column-start` to `auto`.
- **Correction:** Use longhand `grid-column-end: span 4`. Verify that `[kos-offset="2"]` sets `grid-column-start: 3`. Verify that the offset value is between `1` and `6` (offsets 7–12 are not in Core).

#### Scenario B: Unexpected Flexbox Growth
- **Symptom:** A card with `kos-col-span="4"` stretches to $100\%$ width on an incomplete row.
- **Root Cause:** An explicit `kos-grow="1"` was applied, or the item is declared without a supported numeric span (unspanned, invalid `"13"`, or custom `"custom"`).
- **Correction:** For strict proportional sizing, ensure the span is an integer between `1` and `12`, and remove `kos-grow="1"`.

#### Scenario C: Subgrid Track Misalignment
- **Symptom:** Card titles or CTAs do not align horizontally across adjacent columns.
- **Root Cause:** The cards do not declare an explicit multi-row span (e.g. `kos-row-span="3"`), or the CSS uses invalid `grid-row: subgrid`, or internal elements do not map to parent rows.
- **Correction:** Ensure parent `.kos-grid` has rows defined, each card declares `kos-row-span="3" kos-subgrid="rows"` (`grid-template-rows: subgrid`), and internal elements align with the 3 rows.

#### Scenario D: Mobile Collapse Failure
- **Symptom:** Multi-column grid squeezes into tiny columns on mobile viewports instead of stacking vertically.
- **Root Cause:** The grid is not wrapped in `.kos-composition`, or is marked with `kos-collapse="none"`.
- **Note on Sidebars:** `.kos-sidebar-grid` collapses via `@media (max-width: 40rem)`, not `.kos-composition`. For container-query sidebar collapse, use `.kos-composition > .kos-grid` with spans `3` and `9`.
- **Correction:** Wrap the `.kos-grid` inside `<section class="kos-composition">` to enable container query collapse at $48\text{rem}$ (or `kos-collapse="sm"` at $32\text{rem}$).

#### Scenario E: Unintentional Horizontal Overflow (Breaking Law I)
- **Symptom:** Page scrolls horizontally on viewports $\le 480\text{px}$.
- **Root Cause:** An inner element specifies an inline fixed width (`style="width: 500px;"`), an unbroken string exists outside `.kos-container`, or minimum content size exceeds container width.
- **Correction:** Replace fixed widths with `width: 100%; max-width: 500px;`. Enclose layout in `.kos-container` for `overflow-wrap: break-word`.

---

### Step 5: Correct
- **The Golden Rule:** **Prefer the smallest justified correction.**
- Do not automatically blame Kōshi Core or rewrite the entire layout when a single longhand property or container wrapper fixes the issue.
- Preserve unrelated user styles, custom classes, and functional scripts.

---

### Step 6: Verify
- Retest the specific reproduction scenario across target viewports ($320\text{px}$, $768\text{px}$, $1200\text{px}$).
- Verify that the fix did not introduce regressions in sibling tracks or responsive collapse behavior.
- Clearly report:
  1. Root cause identified.
  2. Exact minimal correction made.
  3. Verification method and observed result.


---

<!-- SECTION START: skills/koshi/examples/curated-specimens.md -->

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


---

