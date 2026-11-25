# Kōshi Evaluation Condition Definitions & Environment Baseline

## 1. Environment & Model Baseline
- **Evaluation Date:** November 2026
- **Operating System:** Windows 11 (x64)
- **Node.js LTS:** v24.3.0
- **Browser Automation:** Playwright v1.65.1 (Chromium 159.0, Firefox 159.0, WebKit 27.2)
- **Kōshi Core Version:** v0.2.0 (`src/styles/koshi.css`, Canonical Source LF SHA-256: `b9d5013b032b9f5e4afb522f04b82ce6c139fcbf4a8dda4f258388c82a7da5c9`, Published Distribution Baseline SHA-256: `07abbaedb54132bff9288de58c6ab60733a06f82a5274d828433a1bb481dd135`)
- **Kōshi Skill Version:** v0.1.0 (Canonical 8-File Streamlined ICM Architecture, total 8,029 words)

---

## 2. Experimental Conditions

### Condition A — Native CSS Alone
- **Provided:** Standard HTML and modern native CSS (CSS Grid, Flexbox, CSS Subgrid, CSS Container Queries).
- **Excluded:** No `koshi.css` stylesheet, no Kōshi documentation, no Kōshi skill.
- **Goal:** Measure baseline agent capability to implement modern responsive layouts from scratch using native CSS without an architectural framework.

### Condition B — Kōshi Core + Conventional Documentation
- **Provided:** Kōshi Core v0.2.0 stylesheet (`koshi.css`) and authentic conventional public documentation (`evaluations/koshi-agent/fixtures/public-koshi-docs.md`, derived from `src/pages/docs/index.astro`).
- **Excluded:** No 8-file ICM agent skill, no specialized compositional workflows, no anti-pattern catalogs.
- **Goal:** Measure agent capability when provided with the Core library and standard reference documentation, representing normal developer docs.

### Condition C — Kōshi Core + Streamlined ICM Skill (8-File Progressive Disclosure)
- **Provided:** Kōshi Core v0.2.0 stylesheet, conventional documentation, and the full 8-file ICM skill under `skills/koshi/` with `SKILL.md` (<100 lines) acting as the intent-based context router.
- **Context Access:** Normal filesystem-based progressive disclosure (`SKILL.md` $\to$ specific leaf files based on task intent).
- **Goal:** Measure the incremental value of intent-driven progressive context routing, explicit behavioral contracts, and compositional workflows.

### Condition D — Kōshi Core + Monolithic Context
- **Provided:** Kōshi Core v0.2.0 stylesheet, conventional documentation, and a single consolidated document (`evaluations/koshi-agent/fixtures/koshi-monolith.md`) containing 100% of the substantive content from the 8 skill files in one continuous file.
- **Control Invariant:** Knowledge quality and technical content are identical to Condition C; only structural organization (single monolithic file vs. modular 8-file progressive disclosure) varies.
- **Goal:** Measure whether modular progressive disclosure improves retrieval accuracy, reduces token consumption, and prevents context degradation compared to monolithic injection.

---

## 3. Evaluation Nature & Classification Boundaries

To preserve research integrity, the status of each validation modality is formally defined:

| Modality | Status | Scope & Environment | Deliverable / Evidence |
| :--- | :---: | :--- | :--- |
| **Fixture-Based Browser Validation** | **Completed** | 26 deterministic HTML/CSS implementation fixtures executed via Playwright across Chromium, Firefox, WebKit at 360px, 768px, 1200px. | `results/reconciled-benchmark-results.json` |
| **Structural Context Validation** | **Completed** | Programmatic verification of 8 files in `skills/koshi/` for relative links, frontmatter, supported syntax, and token metrics. | `scripts/validate-skill.mjs` |
| **Preliminary Smoke Testing** | **Completed** | Focused interactive agent sessions verifying intent-based routing from `SKILL.md` to leaf documents. | Milestone 2.2.1 transcript records |
| **Independent Comparative Agent Evaluation** | **Not Completed** | Multi-model, unassisted, randomized trials measuring autonomous code generation in production agent harness. | Preserved as future research opportunity |

### Explicit Integrity Safeguards
1. **Preservation of Raw & Reconciled Records:** Original uncorrected benchmark metrics are preserved in `results/benchmark-results.json`. Audited corrections and deductions are recorded in `results/reconciled-benchmark-results.json`.
2. **Context Refinements Recorded Post-Evaluation:** Refinements made after the benchmark run (e.g., Anti-Pattern 13 on multi-axis sizing conflicts) are cataloged as post-evaluation improvements and not retroactively scored against previous test runs.
3. **No Marketing Extrapolations:** No claims of autonomous cognitive enhancement or universal agent compatibility are permitted.

