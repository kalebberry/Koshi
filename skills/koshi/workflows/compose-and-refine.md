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
