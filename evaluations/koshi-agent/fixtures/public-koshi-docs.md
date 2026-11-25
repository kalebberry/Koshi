# Conventional Kōshi Documentation (Condition B Fixture)

*Derived from public documentation at `src/pages/docs/index.astro` and `README.md`.*

---

## Overview
Kōshi (格子) is a portable, framework-independent CSS layout architecture built inside `@layer kos-grid`. It provides a 12-track fractional coordinate system, responsive container queries, flexbox flow utilities, and subgrid track alignment.

## Core Principles & 12 Tracks
Think of a row as twelve equal parts:
- `6 + 6` makes two equal halves.
- `8 + 4` makes an asymmetric main area and sidebar.
- `4 + 4 + 4` makes three equal columns.
- `7 + 5` makes an editorial masthead.

## Public Classes & Attributes

### 1. Containers
- `.kos-container`: Constrains layout width with dynamic responsive margins (`clamp(1rem, 3.5vw, 3.5rem)`).
- `container-type="narrow"`: Max width 48rem (768px).
- `container-type="wide"`: Max width 90rem (1440px).
- `container-type="full-bleed"`: 100% width with inner padding.

### 2. Grid System (`.kos-grid`)
- Intrinsic default: `.kos-grid` without attributes automatically fits items using `minmax(min(100%, 16rem), 1fr)`.
- 12-Track transition: Any direct child with `kos-col-span` transitions the grid into 12 fractional tracks (`repeat(12, minmax(0, 1fr))`).
- Fixed columns: `kos-cols="1"` through `"12"`, and `"16"`.
- Custom columns: `kos-cols="custom"` with inline `style="--kos-cols: N;"`.
- Placement modifiers: `.kos-grid--fill`, `.kos-grid--fit`.

### 3. Spans & Placement
- Column span: `kos-col-span="1"` through `"12"` (or `kos-col-span="custom"` with `--kos-col-span: N`).
- Row span: `kos-row-span="1"` through `"6"` (or `kos-row-span="custom"` with `--kos-row-span: N`).
- Offsets: `kos-offset="1"` through `"6"` (starts item at column line $N+1$).
- Reordering: `kos-order="-4"` through `"4"`.

### 4. Flexbox Grid (`.kos-flex-grid`)
- Horizontal wrapping layout: `.kos-flex-grid`.
- Children receive `flex: 1 1 16rem` by default.
- Supported numeric spans `kos-col-span="1"` through `"12"` calculate gutter-deducted bases and default to `flex-grow: 0`.
- Explicit growth modifiers: `kos-grow="0"`, `kos-grow="1"`, `kos-grow="2"`, `kos-grow="3"`.

### 5. Subgrid (`[kos-subgrid]`)
- `kos-subgrid="rows"`: Inherits parent grid rows (`grid-template-rows: subgrid`).
- `kos-subgrid="cols"`: Inherits parent grid columns (`grid-template-columns: subgrid`).
- `kos-subgrid="both"`: Inherits both rows and columns.
- Note: The card specifies row span count using `kos-row-span="N"`.

### 6. Responsive Compositions (`.kos-composition`)
- Establishes a container query context (`container-type: inline-size`).
- Direct child `.kos-grid` elements collapse to single columns at container query thresholds:
  * `kos-collapse="sm"`: Stacks when container width $\le 32\text{rem}$ ($512\text{px}$).
  * Default (no attribute): Stacks when container width $\le 48\text{rem}$ ($768\text{px}$).
  * `kos-collapse="lg"`: Stacks when container width $\le 64\text{rem}$ ($1024\text{px}$).
  * `kos-collapse="none"`: Disables stacking.

### 7. Media Ratios (`kos-ratio`)
- Supported ratios: `16/9`, `4/3`, `1/1` (or `square`), `3/4`, `golden` (1.618:1), `silver` (1:1.414).
- Child images and videos automatically fill the container with `object-fit: cover`.

### 8. Utilities
- Gutters: `.kos-gap-0` (0), `.kos-gap-2` (0.5rem), `.kos-gap-4` (1rem), `.kos-gap-6` (1.5rem), `.kos-gap-8` (2rem).
- Sidebar: `.kos-sidebar-grid` (fixed 16rem column + 1fr main; collapses at `@media (max-width: 40rem)`).
- Masonry: `.kos-masonry-grid` (`columns: 3`; collapses at `@media (max-width: 40rem)`).
- Vertical spacing: `.kos-flow > * + *` (`margin-block-start: 1rem`).
- Debug overlays: `kos-debug`.
