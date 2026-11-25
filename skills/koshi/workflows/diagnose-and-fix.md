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
