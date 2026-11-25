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
