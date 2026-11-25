# Kōshi Agent Skill

**Version:** 0.1.0  
**Compatible Core Version:** v0.2.0  
**Author:** Studio Eien  
**License:** MIT  

---

## 1. What is This?

This package contains the canonical **Kōshi Interpretable Context Architecture (ICM)**. It is a standalone, modular context package that enables AI coding assistants (Claude Code, Cursor, Google Antigravity, OpenAI Codex) to compose intentional web layouts using Kōshi Core v0.2.0 using documented API contracts and automated context integrity checks to prevent syntax drift or layout containment violations.

---

## 2. File Manifest (8 Canonical Context Files)

```
koshi/
├── SKILL.md                          # Primary context router (<100 lines)
├── README.md                         # Package documentation and installation guide
├── LICENSE                           # MIT License
├── references/
│   ├── api-contracts.md              # Technical attribute specifications and syntax contracts
│   └── architectural-laws.md         # The 7 Architectural Laws of Kōshi
├── principles/
│   ├── composition-guide.md          # Compositional philosophy, hierarchy, and Yohaku
│   └── anti-patterns.md              # 13 documented failure modes, traps, and remedies
├── workflows/
│   ├── compose-and-refine.md         # Step-by-step layout authoring workflow
│   └── diagnose-and-fix.md           # Defect diagnosis and repair runbook
└── examples/
    └── curated-specimens.md          # 7 verified architectural specimens with zero external dependencies
```

---

## 3. How It Works: Progressive Context Disclosure

The entry point `SKILL.md` contains concise routing rules (maintained under an internal design budget of $\le 100$ lines). When an assistant is asked a question or given a layout task:
1. The assistant loads `SKILL.md`.
2. Based on user intent (new layout, subgrid alignment, debugging overflow, flex wrapping), the assistant reads **only the specific relevant child file**.
3. This eliminates context clutter, demonstrated a 63.7% reduction in selected-document word count in fixture comparisons (without claiming live token savings), and ensures the assistant adheres strictly to Kōshi Core v0.2.0 specifications.

---

## 4. Installation by Platform

### Google Antigravity
- **Workspace Discovery:** Automatically active when placed at `skills/koshi` in this workspace (verified through live invocation).
- **Project Discovery:** Place this folder at `.agents/skills/koshi` in another project.
- **Global:** Copy this folder to `~/.gemini/config/skills/koshi`.

### OpenAI Codex
- **Project Discovery:** Place this folder at `.agents/skills/koshi` in your repository root.
- **User Global:** Place this folder at `~/.codex/skills/koshi`.
- **ChatGPT / Custom GPTs:** Attach to assistant knowledge or inject `SKILL.md` into instructions.

### Claude Code
- **Project:** Place this folder at `.claude/skills/koshi`.
- **Global:** Place this folder at `~/.claude/skills/koshi`.

### Cursor
- **Project:** Place this folder at `.cursor/skills/koshi` or `.agents/skills/koshi`.
- **In Composer:** Reference `@SKILL.md` directly.

---

## 5. Architectural Boundaries

- Grid column spans: `1` through `12`. Row spans: `1` through `6`.
- Offsets: `1` through `6`.
- Flexbox spans: explicit spans `1` through `12` default to `flex-grow: 0` to preserve *Yohaku*. Use `kos-grow="1"` to fill remaining space.
- Multi-axis sizing: when using `aspect-ratio: 16/9`, omit rigid `min-height: 220px` to prevent horizontal overflow in narrow mobile viewports.

---

## 6. License

MIT License. Copyright (c) 2026 Sourumeiji / Studio Eien.
