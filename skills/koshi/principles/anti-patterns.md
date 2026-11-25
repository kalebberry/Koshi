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
- **Note on User-Agent Margins:** Standard HTML elements such as `<figure>` and `<blockquote>` have browser-default margins (`margin-inline: 40px` in user-agent stylesheets). Because Kōshi Core intentionally avoids global element resets, authors should declare `margin: 0` on semantic figure/quote elements inside grid tracks to prevent mobile gutter blowout.

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

### 13. Conflicting Multi-Axis Sizing Constraints (`aspect-ratio` + Block-Axis Minimums)
- **Symptom:** Elements declaring an explicit `aspect-ratio` (e.g., `16 / 9`) overflow narrow containers or viewports (such as $320\text{px}$–$360\text{px}$ mobile screens), causing unexpected horizontal scrollbars and violating Law I (Containment) even when parent grids apply `min-width: 0`.
- **Why It Occurs:** Authors specify a rigid block-axis minimum (e.g., `min-height: 220px` or `min-block-size: 200px`) alongside a wide `aspect-ratio` (such as `16/9`), assuming `min-width: 0` will allow the card to narrow freely on mobile while preserving the minimum height.
- **Intrinsic Sizing Mechanics (CSS Box Sizing Level 4 & Sizing Level 3):**
  - Under CSS Box Sizing Level 4 (§5.1 *Aspect Ratios and Sizing*), sizing constraints on one axis transfer to the other axis through the preferred aspect ratio.
  - Specifically, a specified `min-height` transfers into the inline axis to establish an automatic transferred minimum inline size:
    $$\text{transferred min-inline-size} = (\text{min-height} - \text{block-padding/border}) \times \text{ratio} + \text{inline-padding/border}$$
  - For example, with `box-sizing: border-box`, `min-height: 220px`, `aspect-ratio: 16/9`, and `padding: 1.5rem` ($24\text{px}$ top/bottom, $24\text{px}$ left/right, net content height $172\text{px}$):
    - Transferred min content width: $172\text{px} \times (16/9) \approx 305.78\text{px}$.
    - Transferred min border-box width: $305.78\text{px} + 48\text{px} = 353.78\text{px}$ (or $391.11\text{px}$ under `content-box`).
  - *Engine-Specific Resolution:* `min-width: 0` explicitly zeroes the element's direct inline minimum, but when `aspect-ratio` and `min-height` are simultaneously present, the transferred constraint creates a geometric conflict with narrow inline space. In Blink/Chromium, the element preserves the transferred minimum inline size from `min-height`, which overrides the narrow container width ($326\text{px}$ in a $360\text{px}$ padded container), creating an observable $\approx 28\text{px}$ overflow. In WebKit, the width is clamped to $326\text{px}$ while maintaining `min-height: 220px`, which avoids horizontal overflow but alters the aspect ratio ($326 / 220 \approx 1.48 \ne 16/9$).
  - *Distinction:* `aspect-ratio` does **not** universally override `min-width: 0`; rather, simultaneously requiring a rigid block minimum and an aspect-ratio creates an intrinsic geometric conflict whenever available inline space is smaller than the transferred minimum dimension.
- **Observable Overflow Symptoms:**
  - `document.documentElement.scrollWidth > document.documentElement.clientWidth` at narrow viewports.
  - The card visibly extends beyond the right edge of its parent grid track.
  - DevTools Computed styles show an actual rendered `width` larger than the parent track's inline size.
- **Debugging Techniques:**
  1. Inspect the overflowing card in browser DevTools and check for simultaneous declarations of `aspect-ratio` and `min-height` (or `min-block-size`).
  2. In the Styles panel, temporarily uncheck `min-height`: if the card immediately collapses to fit the container inline width, multi-axis transfer is confirmed.
  3. Verify whether `max-width: 100%` is present or if the layout requires container-conditional sizing.
- **Legitimate Exceptions:**
  - Combining `aspect-ratio` with `min-height` is completely valid when the container is guaranteed to remain wider than the transferred minimum inline size (such as wide desktop viewports, dominant hero tracks, or fixed-width containers).
  - When `max-width: 100%` is explicitly declared and a slight aspect-ratio distortion at narrow widths is visually acceptable.
- **Possible Responsive Remedies:**
  1. *Omit Rigid Block-Axis Minimums:* Prefer defining card sizing purely through `aspect-ratio` and proportional track width, allowing natural proportional scaling across all viewport widths.
  2. *Apply Block Minimums Conditionally via Container Queries:* If a card requires a minimum height on desktop but must scale fluidly on mobile, establish a container query context (such as `.kos-composition` or `.kos-cq`) and apply `min-height` inside a query:
     ```html
     <!-- Ancestor establishes query container context -->
     <section class="kos-composition">
       <div class="kos-grid" kos-cols="12">
         <article class="kos-card" kos-col-span="12">...</article>
       </div>
     </section>
     ```
     ```css
     /* Card scales proportionally by default */
     .kos-card {
       aspect-ratio: 16 / 9;
       box-sizing: border-box;
       min-width: 0;
     }
     /* Introduce block minimum only when container width can accommodate transferred inline size */
     @container (min-width: 480px) {
       .kos-card {
         min-height: 220px;
       }
     }
     ```
  3. *Clamp Inline Size Explicitly:* Declare `max-width: 100%` on the aspect-ratio element. Note that if height is locked at `min-height: 220px`, clamping width will override the strict $16/9$ aspect ratio at narrow widths, but will strictly prevent page-level horizontal overflow.
