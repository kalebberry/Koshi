# Kōshi (格子) — Architectural Laws Specification & Behavioral Contracts

**Document Version:** 2.0 (Phase 1 Milestone 7 Final Release Specification)  
**System:** Kōshi (格子) — A system for intentional web composition under *Studio Eien*.  
**Core Pillars:**  
1. **CSS Grid — Architecture:** Deliberate spatial structure and track geometry.  
2. **Flexbox — Flow:** Flexible, content-driven distribution and wrapping.  
3. **Subgrid — Alignment:** Shared track relationships across nested compositions.  
4. **Container Queries — Context:** Responsive behavior based on available compositional space.

---

## 1. Core Behavioral Contracts & Architectural Refinements

### 1.1 The Flexbox Growth Behavioral Contract (Decision D-1 — Finalized Contract)

Under the approved architectural contract (Option A, implemented directly on supported numeric spans `.kos-flex-grid > [kos-col-span='1']` through `['12'] { flex-grow: 0; }`), explicit numeric column spans represent deliberate geometric decisions rather than fluid auto-fill blocks. Growth is opt-in, preserving intentional negative space (*Yohaku*).

Unspanned items and invalid, unsupported, empty, or custom span attributes retain automatic sizing behavior (`flex-grow: 1`). Explicit growth modifiers (`kos-grow="0..3"`) are declared after numeric span rules at equal specificity `(0, 2, 0)`, ensuring author overrides take precedence in the cascade.

| Declaration Syntax | Computed `flex-grow` | Computed `flex-shrink` | Resulting Layout Behavior |
| :--- | :---: | :---: | :--- |
| `.kos-flex-grid > *` (unspanned) | **1** | **1** | Fluid intrinsic item sharing available row space equally. |
| `.kos-flex-grid > [kos-col-span='1'..'12']` | **0** | **1** | Deliberate proportional basis; unoccupied space is preserved as *Yohaku*. |
| `.kos-flex-grid > [kos-col-span='13']` (invalid) | **1** | **1** | Falls through to fluid automatic sizing (`flex: 1 1 16rem`). |
| `.kos-flex-grid > [kos-col-span='']` (empty) | **1** | **1** | Falls through to fluid automatic sizing (`flex: 1 1 16rem`). |
| `.kos-flex-grid > [kos-col-span='custom']` | **1** | **1** | Falls through to fluid automatic sizing (custom spans are Grid-only). |
| `.kos-flex-grid > [kos-col-span='4'][kos-grow="0"]` | **0** | **1** | Explicitly non-growing proportional basis ($384\text{px}$ basis in $1200\text{px}$). |
| `.kos-flex-grid > [kos-col-span='4'][kos-grow="1"]` | **1** | **1** | Proportional basis with standard positive free space expansion. |
| `.kos-flex-grid > [kos-col-span='4'][kos-grow="2"]` | **2** | **1** | Weighted expansion (receives $2\times$ free space relative to weight 1). |
| `.kos-flex-grid > [kos-col-span='4'][kos-grow="3"]` | **3** | **1** | Weighted expansion (receives $3\times$ free space relative to weight 1). |
| `.kos-flex-grid > [kos-grow="0"]` (on invalid/custom) | **0** | **1** | Explicit non-growth override on unspanned or non-numeric item. |

#### Critical Sizing Disclaimers & Behavioral Bounds:
- **Proportional Basis, Not Fixed Width:** "Non-growing" does **not** mean an unconditionally fixed pixel width. Explicit spans establish proportional flex bases (`flex-basis`). Because `flex-shrink: 1` remains enabled, items will shrink below their basis under constrained widths or when available row space is less than the sum of item bases.
- **Line Collection vs. Flexible Length Resolution:** In CSS Flexbox, line breaking and collection generally occur *before* flexible length resolution (growth/shrink). Items wrap based on their flex bases and container width.
- **Rounding and Wrapping:** While `flex-shrink: 1` absorbs sub-pixel fractional rounding across viewports, it does **not** prevent line wrapping caused by explicit spans summing to greater than 12 or items with minimum content sizes exceeding available track space.

### 1.2 Grid Offset and Column Span Longhand Contract (Defect F-05 — Implemented)

To prevent shorthand property collision where `grid-column: span ...` resets preceding `grid-column-start: N` declarations from `[kos-offset]`, all column span rules in Kōshi Core use longhand `grid-column-end: span ...`:
- Custom spans: `grid-column-end: span var(--kos-col-span, 1);`
- Progressive typed `attr()`: `grid-column-end: span attr(kos-col-span type(<integer>), 1);`
- Numeric spans (1–12): `grid-column-end: span N;`
- Responsive container query collapse rules retain shorthand `grid-column: 1 / -1;` to span all tracks during intentional full-width stacking.

### 1.3 Custom Column Count Cascade Isolation Contract (Defect F-06 — Implemented)

To ensure author-declared custom column counts (`kos-cols="custom"` and `--kos-cols: N`) are not stomped in browsers supporting typed `attr()` (CSS Values & Units Level 5), the progressive enhancement rule isolates standard column attributes via zero-specificity pseudo-class negation:
- Selector: `.kos-grid[kos-cols]:where(:not([kos-cols='custom']))`
- Preserves exact specificity `(0, 2, 0)` while preventing `attr("custom" type(<integer>), 12)` integer parsing fallback from stomping custom track counts.

### 1.4 Custom Column and Row Span Cascade Isolation Contract (Defect F-07 — Implemented)

To ensure author-declared custom column spans (`kos-col-span="custom"`) and custom row spans (`kos-row-span="custom"`) are not stomped by progressive enhancement rules in browsers supporting typed `attr()`, custom values are isolated via zero-specificity pseudo-class negation:
- Column Span Selector: `.kos-grid > [kos-col-span]:where(:not([kos-col-span='custom']))`
- Row Span Selector: `.kos-grid > [kos-row-span]:where(:not([kos-row-span='custom']))`
- Preserves exact specificity `(0, 2, 0)` while allowing custom custom properties (`--kos-col-span: N`, `--kos-row-span: N`) to evaluate cleanly without falling back to `span 1`.

---

## 2. The Seven Architectural Laws

### Law I — Containment
> *Kōshi compositions should respect their available layout space under explicitly defined and supported content and sizing conditions.*

- **Compositional Purpose:** Prevent broken page scaffolds, visual tearing, and unintended horizontal scrolling across viewports from $320\text{px}$ upwards.
- **Supported Conditions:**
  - Viewports and containers $\ge 320\text{px}$.
  - Replaced elements (`<img>`, `<video>`, `<canvas>`, `<iframe>`) nested inside Kōshi wrappers.
  - Native CSS `gap` and documented spacing utilities (`.kos-gap-0` through `.kos-gap-8`).
- **Relevant CSS Primitives:**
  - `.kos-container`: `width: min(var(--max-width), calc(100% - var(--grid-container-offset))); overflow-wrap: break-word;`
  - `.kos-grid > *`, `.kos-flex-grid > *`: `min-width: 0;` (neutralizes `min-width: auto` blowout trap).
  - Replaced element constraint: `:is(img, video) { max-width: 100%; display: block; }`.
- **Limitations & Developer Responsibilities:**
  - `min-width: 0` alone does **not** prevent every overflow scenario. If a consumer explicitly sets an inline fixed width (e.g. `style="width: 600px;"`) without a `max-width`, consumer intent overrides containment.
  - Unbroken strings without word separators require `.kos-container`'s `overflow-wrap: break-word`.
- **Measurable Acceptance Criteria:**
  - `document.documentElement.scrollWidth <= document.documentElement.clientWidth` across all viewports down to 320px.
- **Test File:** `tests/e2e/laws/law-1-containment.spec.ts`

---

### Law II — Flow
> *Kōshi should provide predictable automatic sizing, proportional sizing, growth, distribution, and wrapping.*

- **Compositional Purpose:** Balance structural discipline with organic, content-driven rhythm. Provide predictable item wrapping and negative space preservation.
- **Supported Conditions:**
  - Explicit spans 1 through 12 in 12-track rows.
  - Unspanned fluid items (`flex: 1 1 16rem`).
  - Opt-in growth modifiers `kos-grow="0..3"`.
- **Relevant CSS Primitives:**
  - `.kos-flex-grid`: `display: flex; flex-wrap: wrap; gap: var(--kos-gutter);`
  - Gutter-deducted basis: `flex-basis: calc(100% * (s / 12) - var(--kos-gutter) * ((12 - s) / 12));`
  - Growth modifiers: `.kos-flex-grid > [kos-grow="0..3"]`
- **Limitations:**
  - Items are atomic boxes; wrapping moves the entire box to the next line.
- **Measurable Acceptance Criteria (in 1200px container with 24px gap):**
  - Single span 4: $384.00\text{px}$ item, $816.00\text{px}$ remaining space.
  - Span 4 + 4: $384.00\text{px}$ each, $24.00\text{px}$ gap, $408.00\text{px}$ remaining space.
  - Complete partitions (4+4+4, 7+5, 8+4, 6+6, 12): close row with $0.00\text{px}$ excess space.
  - Span 4 + 10: item 10 wraps to Row 2 ($y_{10} > y_4$).
- **Test Files:** `tests/e2e/laws/law-2-flow.spec.ts`, `tests/e2e/regression/decision-1-flex-growth.spec.ts`

---

### Law III — Alignment
> *Kōshi should preserve declared spatial relationships and shared track alignment under supported configurations.*

- **Compositional Purpose:** Synchronize grid tracks across disparate sibling cards without fixed heights or JavaScript plugins.
- **Supported Conditions:**
  - Parent grids with explicit row track declarations (`grid-template-rows: auto auto auto`).
  - Participating subgrids spanning the appropriate parent track count (`grid-row: span 3`).
- **Relevant CSS Primitives:**
  - `[kos-subgrid="rows"]`: `display: grid; grid-template-rows: subgrid;`
  - `[kos-subgrid="cols"]`: `display: grid; grid-template-columns: subgrid;`
  - `[kos-subgrid="both"]`: `display: grid; grid-template-rows: subgrid; grid-template-columns: subgrid;`
- **Limitations:**
  - Subgrids only inherit the tracks spanned by their box in the parent grid.
  - **Shared Track vs. Typographic Baseline Alignment:** Shared track alignment is distinct from typographic baseline alignment (`align-items: baseline`). Subgrid aligns bounding grid track edges; it does not automatically synchronize font x-heights or text baselines unless individual grid cells use baseline alignment.
- **Measurable Acceptance Criteria:**
  - Sibling cards participating in row subgrids exhibit identical track boundaries ($\Delta y \le 1.0\text{px}$) regardless of unequal text lengths.
- **Test File:** `tests/e2e/laws/law-3-alignment.spec.ts`

---

### Law IV — Nesting
> *Kōshi compositions should establish predictable local layout contexts.*

- **Compositional Purpose:** Allow multi-level component composition (Grid in Grid, Flex in Grid, Grid in Flex) without track coordinate bleed or selector collisions.
- **Supported Conditions:**
  - Arbitrary nesting depth of supported primitives.
  - Local custom property overrides (`--kos-gutter`, `--kos-cols`).
- **Relevant CSS Primitives:**
  - Local CSS Custom Property scoping.
  - Formatting context isolation via `display: grid` and `display: flex`.
- **Known Undocumented Behavior:**
  - Nested `.kos-container` elements subtract `--grid-container-offset` at each nesting level ($44.80\text{px}$ additional inset at 1280px viewport).
- **Measurable Acceptance Criteria:**
  - A grid nested within a span-6 cell evaluates its local tracks relative to that cell's width ($588.00\text{px}$), yielding $282.00\text{px}$ for internal span-6 items.
- **Test File:** `tests/e2e/laws/law-4-nesting.spec.ts`

---

### Law V — Accessibility
> *Kōshi should support accessible composition without making unsupported accessibility guarantees.*

- **Compositional Purpose:** Ensure layout mechanics respect sequential keyboard focus navigation and programmatic reading order.
- **Supported Conditions:**
  - Keyboard navigation using standard sequential focus traversal (`Tab` flow).
  - WCAG 2.2 Success Criterion 1.4.10 (Reflow down to 320px).
- **Relevant CSS Primitives:**
  - `[kos-order="-4..4"]`: `order: N;`
  - `.kos-composition[kos-collapse="sm|md|lg"]`: Container query collapse.
- **Developer Responsibilities & Strict Disclaimers:**
  - **No Universal WCAG Compliance Claims:** Passing automated layout tests does **not** constitute complete WCAG compliance.
  - **DOM Focus Order vs. Visual Reading Order:** Visual reordering with `kos-order` does NOT reorder the DOM. Screen readers and keyboard navigation follow DOM source order, which can create visual disconnects for sighted keyboard users.
  - **Root Font Size vs. Real Browser Zoom:** Testing rem threshold shifts by changing `html { font-size: 20px; }` simulates proportional threshold scaling, but is **not** equivalent to full browser optical/page zoom.
  - Application authors remain responsible for semantic heading hierarchy, color contrast, and descriptive accessible names.
- **Measurable Acceptance Criteria:**
  - Tab focus order (`document.activeElement`) strictly mirrors DOM source order regardless of `kos-order`.
  - Reflow at 320px viewport produces zero horizontal scrolling.
- **Test File:** `tests/e2e/laws/law-5-accessibility.spec.ts`

---

### Law VI — Portability
> *Kōshi Core should remain usable as standalone HTML and CSS without JavaScript runtime dependencies.*

- **Compositional Purpose:** Zero bundle footprint ($0.00\text{KB}$ JavaScript) for Core layouts, framework neutrality (works in static HTML, Astro, React, Vue, Svelte, Web Components).
- **Supported Conditions:**
  - Standalone HTML documents loading `koshi.css`.
  - Browser contexts with JavaScript disabled.
- **Disclaimers & Scope Clarifications:**
  - **Core vs. Product:** Zero runtime JavaScript applies strictly to Kōshi Core (`koshi.css`) and supported standalone exported compositions. The interactive Composition Lab and documentation website incorporate client-side JavaScript for UI interactivity, controls, and syntax highlighting.
  - **Download Footprint:** Zero JavaScript runtime dependencies does **not** mean zero CSS download size.
- **Measurable Acceptance Criteria:**
  - Standalone compositions from all 6 archetypes (Bento, Hero, Features, Editorial, Gallery, Lattice) render identical track geometry when `javaScriptEnabled: false`.
- **Test File:** `tests/e2e/laws/law-6-portability.spec.ts`

---

### Law VII — Determinism
> *Equivalent supported inputs and rendering conditions should produce predictable compositional behavior.*

- **Compositional Purpose:** Cross-browser rendering parity across modern Blink (Chromium), Gecko (Firefox), and WebKit layout engines.
- **Supported Conditions:**
  - Standard viewport boundaries and container dimensions.
- **Tested Browser Engine Versions:**
  - **Chromium:** 159.0.8154.6
  - **Firefox:** 159.0
  - **WebKit:** 27.2 (via Playwright; note: Playwright WebKit testing is **not** equivalent to testing every historic or platform-specific Safari release).
- **Fallback Simulation vs. Untested Older Browsers:**
  - Controlled fallback tests simulate non-support of progressive enhancement queries (e.g. typed `attr()`), but do not replace testing on actual legacy browsers.
  - Universal browser compatibility and pixel-identical cross-engine font rendering are neither claimed nor achievable.
- **Measurable Acceptance Criteria:**
  - Across Chromium, Firefox, and WebKit, 12-track fractional rows close within $\le 1.0\text{px}$ geometric tolerance.
  - Container query collapse transitions trigger deterministically at exact rem thresholds.
- **Test File:** `tests/e2e/laws/law-7-determinism.spec.ts`
