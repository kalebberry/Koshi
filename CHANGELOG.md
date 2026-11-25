# Changelog

All notable changes to Kōshi (格子) will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [0.2.0] - 2026-11-24

### Changed
- **BREAKING (Behavioral): Explicit Flexbox Spans Default to Non-Growing (Decision D-1):** Direct children of `.kos-flex-grid` with supported numeric column spans (`kos-col-span="1..12"`) now default to `flex-grow: 0` directly on their numeric span rules, establishing an intentional proportional basis where positive free space on incomplete rows is preserved as *Yohaku* (negative space). Unspanned items as well as invalid, empty, or custom spans retain automatic fluid sizing (`flex-grow: 1`).
- **Intentional Opt-In Growth:** Authors who desire automatic expansion on explicitly spanned Flexbox items can opt in by adding `kos-grow="1"`. Weighted growth modifiers (`kos-grow="2"` and `kos-grow="3"`) distribute available positive free space proportionally across opted-in items.
- **Formalized Architectural Contracts:** Enshrined the four foundational pillars (CSS Grid Architecture, Flexbox Flow, Subgrid Alignment, Container Queries Context) and the Seven Architectural Laws in executable test specifications.

### Fixed
- **Defect F-05 (Grid Offset & Span Specificity Collision):** Replaced shorthand `grid-column: span ...` declarations with longhand `grid-column-end: span ...` across numeric spans 1–12, custom spans, and progressive typed `attr()` rules. Prevents the shorthand from stomping `grid-column-start: N` declarations from `[kos-offset]`.
- **Defect F-06 (Custom Column Count Cascade Collision):** Added zero-specificity negation `.kos-grid[kos-cols]:where(:not([kos-cols='custom']))` inside the progressive enhancement `@supports` block. Prevents integer parsing failure on string `"custom"` from falling back to 12 tracks and stomping author `--kos-cols: N` declarations.
- **Defect F-07 (Custom Column & Row Span Cascade Collisions):** Added zero-specificity negations `.kos-grid > [kos-col-span]:where(:not([kos-col-span='custom']))` and `.kos-grid > [kos-row-span]:where(:not([kos-row-span='custom']))` inside the progressive enhancement `@supports` block. Prevents typed `attr()` integer parsing fallback from resetting custom column and row spans to `span 1`.

### Reliability & Testing
- **Cross-Browser Automated Test Harness:** Established a zero-dependency Playwright browser testing infrastructure running across Chromium (Blink), Firefox (Gecko), and WebKit.
- **Exhaustive Verification Suite:** 23 Node.js unit tests and 76 distinct browser test scenarios executed across 3 browser engines (**228 total cross-browser executions, 100% passing, 0 failures, 0 skips**).
- **All 72 Recipes Audited:** Validated all 72 curated Composition Lab recipes across Bento, Hero, Features, Editorial, Gallery, and Lattice archetypes under real browser layout engines (100% layout containment, 100% export validity).
- **Responsive Container Query Verification:** Validated container query collapse thresholds at 32rem, 48rem, and 64rem across 9 container widths ($320\text{px}$ to $1200\text{px}$) and dynamic root font size scaling ($20\text{px}$ root font).
- **Zero Runtime Dependencies:** Kōshi Core remains 100% pure CSS encapsulated in `@layer kos-grid` with zero JavaScript runtime dependencies ($0.00\text{KB}$ JS).

### Migration
- For detailed migration guidance, see [`docs/migration-v0.2.0.md`](docs/migration-v0.2.0.md).
- To restore the v0.1.0 automatic expansion behavior on explicitly spanned items, add `kos-grow="1"`. Complete 12-column rows ($6+6$, $4+4+4$, etc.) require no changes and render identically.

---

## [0.1.0] - 2026-11-20

### Added
- Initial release of Kōshi (格子) layout architecture.
- Intrinsic and 12-column CSS Grid engine.
- Gutter-deducted Flexbox grid system (`.kos-flex-grid`).
- CSS Subgrid track inheritance (`kos-subgrid="rows|cols|both"`).
- Container query collapse for responsive compositions (`.kos-composition`).
- Fluid container with clamp-scaled padding (`.kos-container`).
- Aspect ratio framing utilities (`kos-ratio`).
- Lattice visualizer debug mode (`kos-debug`).
- Interactive Composition Lab with 72 curated architectural specimens.
