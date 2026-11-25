# Kōshi Agent Context Architecture — Evaluation Suite & Research Record

**System:** Kōshi (格子) — Studio Eien  
**Skill Version:** v0.1.0 | **Core Compatibility:** v0.2.0  
**Status:** Fixture-Based Architectural Validation Completed | Comparative Agent Evaluation Preserved as Future Research

---

## 1. Overview & Purpose

This directory contains the evaluation protocols, implementation fixtures, automated test runners, and reconciled benchmark data developed during Phase 2 Milestone 2.4.

The objective of this suite is to empirically evaluate layout implementations produced under four distinct context conditions:
- **Condition A:** Native CSS alone (no Kōshi library or context).
- **Condition B:** Kōshi Core v0.2.0 + conventional documentation (`public-koshi-docs.md`).
- **Condition C:** Kōshi Core v0.2.0 + Streamlined Interpretable Context Architecture (8-file progressive disclosure under `skills/koshi/`).
- **Condition D:** Kōshi Core v0.2.0 + Monolithic Context (`koshi-monolith.md`, containing identical technical content in a single consolidated file).

---

## 2. Research Integrity & Methodology Classification

To maintain the highest standards of scientific honesty, this suite explicitly distinguishes four validation modalities:

1. **Fixture-Based Browser Validation (Completed):**
   - 26 curated HTML/CSS implementation fixtures were mounted into automated Playwright test harnesses and evaluated across Chromium, Firefox, and WebKit at 360px, 768px, and 1200px viewports.
   - Assertions evaluated layout containment (`scrollWidth <= clientWidth`), column reflow, subgrid alignment, reading order, and responsive stacking.
2. **Structural Context Validation (Completed):**
   - The 8 context files under `skills/koshi/` were audited and verified for exact API fidelity with Core v0.2.0, zero broken relative links, zero hallucinated syntax (`kos-span`), and strict attribute bounds (`kos-cols="1..12|custom"`, `kos-offset="1..6"`, `kos-row-span="1..6"`).
3. **Preliminary Agent Smoke Testing (Completed):**
   - Interactive sessions verified that the agent correctly parses `SKILL.md` (<100 lines) and loads leaf documents on demand.
4. **Independent Comparative Agent Evaluation (Not Completed):**
   - Unassisted, randomized, live agent generation trials across multiple model families (Claude, GPT-4o, open weights) have **not** been executed. This remains a documented future research opportunity.

---

## 3. Explicit Non-Claims & Empirical Findings

The empirical findings from the 26-fixture benchmark demonstrate:
- **Selected-Document Word-Count Reduction:** On matched tasks, the 8-file Streamlined ICM architecture selected an average of **2,911 words** of reference context compared to **8,029 words** for monolithic context—a **63.7% reduction in selected-document word count** in fixture comparisons. This measures document selection volume and does **not** represent measured live agent token or financial savings.
- **No Superiority Over Conventional Documentation:** Condition C did not outperform Condition B in implementation quality. Conventional documentation proved highly effective for standard grid compositions.
- **Physical CSS Edge Cases:** Sizing conflicts (e.g. `aspect-ratio: 16/9` combined with rigid `min-height: 220px`) cause horizontal overflow on mobile viewports due to intrinsic size transfer in CSS Box Sizing Level 4. This physical behavior occurs regardless of whether context is structured as ICM or conventional documentation, and has been documented in `anti-patterns.md` post-evaluation.
- **Maintainability Over Cognitive Superiority:** The modular 8-file ICM architecture is justified as an engineered, human-maintainable context structure, not as an engine of improved model reasoning.

---

## 4. Directory Structure

```
evaluations/koshi-agent/
├── protocol/
│   ├── benchmark-protocol.md       # 100-point rubric and browser assertion criteria
│   └── conditions.md               # Definitions of Conditions A, B, C, D
├── tasks/
│   ├── task-1-hero.md              # Asymmetric editorial hero composition
│   ├── task-2-bento.md             # Bento showcase with aspect-ratio cards
│   ├── task-3-flow.md              # Fluid wrapping tag row and Yohaku preservation
│   ├── task-4-subgrid.md           # Multi-card row-aligned subgrid comparison
│   ├── task-5-dashboard.md         # Nested container-query responsive workspace
│   ├── task-6-diagnostics.md       # Defect localization and repair
│   └── task-7-negative-scope.md    # Boundary testing (unsolicited library rejection)
├── fixtures/
│   ├── broken-layouts/             # Buggy markup fixtures for diagnostic evaluation
│   ├── extract-specimens.mjs       # Programmatic extractor from Markdown
│   ├── public-koshi-docs.md        # Condition B conventional reference (750 words)
│   └── koshi-monolith.md           # Condition D monolithic reference (8,029 words)
├── runners/
│   ├── test-harness.mjs            # Playwright automated browser assertion harness
│   ├── benchmark-runner.mjs        # 26-trial benchmark runner
│   └── test-aspect-ratio.mjs       # Multi-engine physical sizing verification
└── results/
    ├── benchmark-results.json      # Original uncorrected metrics
    ├── pilot-results.json          # Pilot test results
    └── reconciled-benchmark-results.json # Audited scores with documented deductions
```

---

## 5. Artifact Isolation

All files within `evaluations/` are research and benchmarking artifacts. They are strictly excluded from the downloadable Kōshi Agent Skill distribution package (`dist/downloads/koshi-skill-v0.1.0.zip`) and from production website builds.
