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
