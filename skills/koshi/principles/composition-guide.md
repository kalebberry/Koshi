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
