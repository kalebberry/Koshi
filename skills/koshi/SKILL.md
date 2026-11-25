---
name: koshi
description: >-
  Architectural layout system for intentional web composition using native
  CSS Grid, Flexbox, Subgrid, and Container Queries. Use when designing,
  authoring, refining, or diagnosing layouts, responsive scaffolds,
  editorial compositions, or bento grids in projects using Kōshi.
---

# Kōshi (格子) — Intentional Web Composition

Kōshi is an architectural composition system built on native CSS. It provides
a disciplined layout vocabulary for humans and AI agents to construct
predictable, responsive compositions grounded in craftsmanship and intentional
negative space (*Yohaku*).

- **Skill Version:** 0.1.0
- **Core Compatibility:** v0.2.0 (pure CSS in `@layer kos-grid`, zero runtime JS)

---

## 1. The Four Foundational Pillars

1. **CSS Grid — Architecture:** Multi-axis spatial structure, deliberate track geometry (`.kos-grid`).
2. **Flexbox — Flow:** Content-driven distribution, natural wrapping, proportional bases (`.kos-flex-grid`).
3. **Subgrid — Alignment:** Shared track relationships across nested DOM cards (`[kos-subgrid]`).
4. **Container Queries — Context:** Responsive adaptation based on local available space (`.kos-composition`, `.kos-cq`).

---

## 2. Activation Boundaries

### Activate This Skill When:
- The project imports `koshi.css` or declares Kōshi markup (`.kos-grid`, `.kos-flex-grid`, `.kos-composition`).
- The user explicitly asks to use, convert to, or troubleshoot Kōshi.
- Designing responsive scaffolds, bento grids, magazine layouts, or media galleries with Kōshi.

### Do NOT Activate When:
- Working on generic CSS in projects that do not use or intend to adopt Kōshi.
- Micro-component styling with no spatial or track relationship to a layout.
- Styling typography, color palettes, or theme tokens (Kōshi governs spatial layout only).
- The project uses an incompatible layout framework (e.g. Tailwind, Bootstrap) without an explicit migration request.

---

## 3. Essential Technical Constraints

1. **Never Invent Attributes:** Only use verified attributes documented in [API Contracts](./references/api-contracts.md). Never use hallucinated attributes like `kos-span`, `kos-width`, `kos-columns`, `kos-flex-col`, or `kos-container="inline-size"`.
2. **Flexbox Growth Contract (Decision D-1):** In `.kos-flex-grid`, supported numeric spans (`kos-col-span="1..12"`) default to `flex-grow: 0` (proportional basis). Unspanned items receive Kōshi's rule `flex: 1 1 16rem` (growing automatically). Opt-in growth requires explicit `kos-grow="1"`. (Note: In standard native CSS Flexbox, `flex-grow` defaults to `0`).
3. **Shrinking & Containment:** `flex-shrink: 1` allows items to shrink, but active shrinking does not guarantee overflow prevention if minimum content size exceeds container width.
4. **Valid Attribute Ranges:** `kos-col-span` supports `1..12` and `custom`. `kos-row-span` supports `1..6` and `custom`. `kos-offset` strictly supports `1..6`. Spans do NOT need to sum to 12; partial rows and intentional asymmetric layouts are fully supported.
5. **Preserve Offsets (F-05):** Grid item spans use longhand `grid-column-end: span N` to avoid shorthand collisions with `kos-offset` (`grid-column-start: N+1`). Native shorthand declarations (such as `grid-column: 1 / -1` in container collapse) remain valid and intentional where full track resetting is desired.
6. **Subgrid Syntax:** Subgrid uses `grid-template-rows: subgrid` (via `kos-subgrid="rows"`). Never write `grid-row: subgrid` (invalid CSS).
7. **Configurable Defaults:** Gutter (`--kos-gutter`), min item size (`--kos-grid-min-item-size`), and container widths are configurable custom properties, not hardcoded constants.

---

## 4. Human Creative Authority

- **Preserve Creative Intent:** Respect user-provided design direction, content hierarchy, and branding.
- **Yohaku is a Principle, Not Dogma:** Unoccupied space may represent intentional *Yohaku* or an unconsidered gap; never assume all unused space is intentional without confirming intent. Do not force asymmetry, minimalism, or Japanese aesthetics where the user requires dense or conventional UI.
- **Autonomous vs. Gated Decisions:** Make reversible, proportional layout adjustments autonomously. Request human guidance when consequential layout direction or architectural changes are unresolved.
- **Instruction Precedence:** Project-specific guidelines and direct human instructions always override skill recommendations.

---

## 5. Context Routing Matrix (Progressive Disclosure)

Load ONLY the operational files required for your specific task:

| Task Intent | Primary Runbook / Reference | Supporting Context |
| :--- | :--- | :--- |
| **API Syntax / Properties** | [API Contracts](./references/api-contracts.md) | [Architectural Laws](./references/architectural-laws.md) |
| **Engineering Invariants & Bounds** | [Architectural Laws](./references/architectural-laws.md) | [Anti-Patterns](./principles/anti-patterns.md) |
| **Layout Design & Spatial Reasoning** | [Composition Guide](./principles/composition-guide.md) | [Curated Specimens](./examples/curated-specimens.md) |
| **Authoring New Composition** | [Compose & Refine](./workflows/compose-and-refine.md) | [Composition Guide](./principles/composition-guide.md) |
| **Debugging / Layout Triage** | [Diagnose & Fix](./workflows/diagnose-and-fix.md) | [Anti-Patterns](./principles/anti-patterns.md) |
| **Code Examples & Specimen Patterns** | [Curated Specimens](./examples/curated-specimens.md) | [API Contracts](./references/api-contracts.md) |
| **Failure Prevention & Common Traps** | [Anti-Patterns](./principles/anti-patterns.md) | [Architectural Laws](./references/architectural-laws.md) |

---

## 6. Verification Expectations

Before completing any Kōshi layout task:
- Verify horizontal containment: `scrollWidth <= clientWidth` across viewports down to $320\text{px}$.
- Verify that offsets and spans compose without collision.
- Verify that visual reordering (`order`, offsets) maintains a logical reading sequence consistent with DOM source order (WCAG 2.1 SC 1.3.2). Auditing DOM sequence is necessary for reading order, but does not by itself establish complete accessibility compliance.
