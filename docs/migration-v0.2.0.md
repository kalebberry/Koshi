# Kōshi (格子) — Migration Guide: v0.1.0 to v0.2.0

This guide explains how to migrate projects from Kōshi v0.1.0 to v0.2.0.

---

## 1. Summary of Changes

Kōshi v0.2.0 is a stability and reliability release that resolves three cascade collisions in CSS Grid and establishes an intentional composition contract for Flexbox.

| Area | v0.1.0 Behavior | v0.2.0 Behavior | Compatibility Status |
| :--- | :--- | :--- | :--- |
| **Flexbox Spans** | Explicit spans (`kos-col-span="1..12"`) grew automatically to fill row space (`flex-grow: 1`). | Explicit spans establish a proportional basis and default to non-growing (`flex-grow: 0`). | **Breaking (Behavioral)** |
| **Grid Offsets + Spans** | Combining `kos-offset` and `kos-col-span` reset offset start line to `auto`. | Offset and span compose cleanly (`grid-column-start: N` and `grid-column-end: span M`). | **Bug Fix** |
| **Custom Column Counts** | In modern browsers, `kos-cols="custom"` fell back to 12 tracks. | `kos-cols="custom"` renders author-declared `--kos-cols: N` tracks. | **Bug Fix** |
| **Custom Column/Row Spans** | In modern browsers, `kos-col-span="custom"` fell back to `span 1`. | Custom spans render author-declared `--kos-col-span: N` and `--kos-row-span: N`. | **Bug Fix** |

---

## 2. Breaking Change: Explicit Flexbox Span Growth Contract (Decision D-1)

### What Changed?
In v0.1.0, direct children of `.kos-flex-grid` inherited `flex: 1 1 16rem` from the generic `.kos-flex-grid > *` selector. When an author added an explicit column span (`kos-col-span="4"`), Kōshi set `flex-basis: calc(...)`, but left `flex-grow: 1` active. As a result, incomplete rows automatically expanded to fill positive free space.

In v0.2.0, explicit spans represent deliberate geometric decisions:
- **Unspanned items** as well as invalid, empty, unsupported, or custom span attributes retain automatic fluid growth (`flex: 1 1 16rem`).
- **Supported numeric spans (1–12)** default to `flex-grow: 0`, preserving remaining row space as intentional negative space (*Yohaku*).

### Who Is Affected?
You are affected if you use `.kos-flex-grid` with:
1. **Single explicitly spanned items on a row** (e.g. `<div kos-col-span="4">` alone on a line).
2. **Incomplete rows whose spans sum to less than 12** (e.g. `4 + 4 = 8 < 12`).
3. **Wrapped rows where items sit alone on subsequent lines** (e.g. `4 + 10`).
4. **Mixed rows combining explicit spans with unspanned items**.

### Who Is NOT Affected?
- **CSS Grid layouts (`.kos-grid`):** Unaffected.
- **Complete 12-column Flexbox rows:** Rows whose spans sum to exactly 12 (such as `6 + 6`, `4 + 4 + 4`, `8 + 4`, `7 + 5`, or `12`) have zero excess free space. They render with identical geometry in v0.1.0 and v0.2.0.

---

## 3. Migration Paths

### Scenario A: Incomplete Rows (Restoring Automatic Expansion)

If you relied on explicit spans expanding automatically to fill the container:

**v0.1.0 Code:**
```html
<div class="kos-flex-grid">
  <!-- Expanded to 588px each in a 1200px container -->
  <div kos-col-span="4">Card A</div>
  <div kos-col-span="4">Card B</div>
</div>
```

**v0.2.0 Upgrade:**
Add `kos-grow="1"` to restore expansion:
```html
<div class="kos-flex-grid">
  <!-- Explicitly opt into positive free space expansion -->
  <div kos-col-span="4" kos-grow="1">Card A</div>
  <div kos-col-span="4" kos-grow="1">Card B</div>
</div>
```

If you prefer intentional proportional geometry (the v0.2.0 default), leave the markup as-is. Each card will render at its strict 4-track basis ($384\text{px}$ in $1200\text{px}$), leaving $408\text{px}$ of negative space.

---

### Scenario B: Single Explicit Item

**v0.1.0 Code:**
```html
<div class="kos-flex-grid">
  <!-- Expanded to 1200px (100% width) -->
  <div kos-col-span="4">Banner</div>
</div>
```

**v0.2.0 Upgrade:**
```html
<!-- To preserve strict 4-column basis (384px) leaving 816px negative space: -->
<div class="kos-flex-grid">
  <div kos-col-span="4">Banner</div>
</div>

<!-- To restore full-width expansion: -->
<div class="kos-flex-grid">
  <div kos-col-span="4" kos-grow="1">Banner</div>
</div>
```

---

### Scenario C: Mixed Explicit & Automatic Items

In v0.1.0, an explicit span and an unspanned item divided positive free space equally. In v0.2.0, the explicit span preserves its declared basis ($384\text{px}$), and the unspanned item absorbs all remaining free space ($792\text{px}$).

**v0.2.0 Migration:**
```html
<!-- New default: explicit span stays 384px, auto item takes rest of row (792px) -->
<div class="kos-flex-grid">
  <div kos-col-span="4">Sidebar (384px)</div>
  <div>Flexible Content Area (792px)</div>
</div>

<!-- To divide free space equally (v0.1.0 behavior): -->
<div class="kos-flex-grid">
  <div kos-col-span="4" kos-grow="1">Sidebar</div>
  <div>Flexible Content Area</div>
</div>
```

---

## 4. Grid Bug Fixes (Action Required: None)

If you previously worked around Grid cascade collisions with custom CSS or specificity hacks, you can safely remove them:

1. **Combined Offsets and Spans (F-05):**
   ```html
   <!-- Now correctly starts at column line 3 and spans 4 tracks -->
   <div class="kos-grid" kos-cols="12">
     <div kos-offset="2" kos-col-span="4">Offset 2, Span 4</div>
   </div>
   ```

2. **Custom Column Counts (F-06):**
   ```html
   <!-- Now reliably renders exactly 5 columns in all modern browsers -->
   <div class="kos-grid" kos-cols="custom" style="--kos-cols: 5;">
     <div>1</div><div>2</div><div>3</div><div>4</div><div>5</div>
   </div>
   ```

3. **Custom Column and Row Spans (F-07):**
   ```html
   <!-- Now reliably spans 6 column tracks and 3 row tracks -->
   <div class="kos-grid" kos-cols="12">
     <div kos-col-span="custom" kos-row-span="custom" style="--kos-col-span: 6; --kos-row-span: 3;">
       Custom 6x3 Card
     </div>
   </div>
   ```
