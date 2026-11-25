# Kōshi Agent Skill — Installation & Integration Guide

**Skill Version:** v0.1.0  
**Compatible Core Version:** v0.2.0  
**Design Philosophy:** Human-First · Interpretable Context Architecture (ICM) · Zero Runtime Dependencies

---

## 1. Overview

The Kōshi Agent Skill is an optional, modular context package designed to help AI coding assistants (such as Claude Code, Cursor, Google Antigravity, and OpenAI Codex) understand Kōshi Core's layout system with high technical precision.

The skill uses **Progressive Context Disclosure**:
- A lightweight entry router (`SKILL.md`, maintained under an internal Kōshi design budget of $\le 100$ lines) is exposed to the agent.
- Detailed technical references (`api-contracts.md`, `architectural-laws.md`), compositional principles (`composition-guide.md`, `anti-patterns.md`), workflows (`compose-and-refine.md`, `diagnose-and-fix.md`), and specimens (`curated-specimens.md`, containing 7 verified specimens) are loaded **only on demand** when relevant to the user's specific prompt.

> [!NOTE]
> The 100-line limit for `SKILL.md` is Kōshi's internal maintenance budget to ensure the entry router remains a pure, high-velocity index rather than an external platform requirement.

This prevents prompt clutter, enforces documented API contracts and automated context integrity checks to prevent syntax drift, enforces the 7 Architectural Laws, and preserves human creative authority.

---

## 2. Platform Verification Matrix

To maintain strict scientific and technical honesty, we distinguish between documented conventions and empirically verified environments:

| Environment | Documented Support | Filesystem Discovery Convention | Verified in this Repo | Verified Live Invocation | Compatibility Level |
| :--- | :---: | :--- | :---: | :---: | :--- |
| **Google Antigravity** | Yes (Customization Guide) | `skills/<name>/SKILL.md`<br>`.agents/skills/<name>/SKILL.md`<br>`~/.gemini/config/skills/` | Yes (`skills/koshi/`) | Yes | **Verified Local & Invocation** |
| **OpenAI Codex** | Yes (Agent Skills Standard) | `.agents/skills/<name>/SKILL.md`<br>`~/.codex/skills/<name>/` | Untested | Untested | **Documented Convention** |
| **Claude Code** | Yes (CLI Skill Protocol) | `.claude/skills/<name>/SKILL.md`<br>`~/.claude/skills/<name>/` | Untested | Untested | **Documented Convention** |
| **Cursor** | Yes (Rules/Skills Protocol) | `.cursor/skills/<name>/SKILL.md`<br>`.agents/skills/<name>/SKILL.md` | Untested | Untested | **Documented Convention** |
| **ChatGPT Web / Custom GPTs** | Manual Context Injection | Manual file attachment / Instructions | Manual | Untested | **Manual Integration** |

> [!IMPORTANT]
> A platform recognizing `SKILL.md` or declaring directory conventions does **not** imply complete behavioral support. True layout fidelity requires the agent to correctly execute progressive file reads adhering to documented contracts. Only Google Antigravity via `skills/koshi/SKILL.md` has been actively executed and verified in this repository's active development sessions. Other environments reflect official platform documentation and standard filesystem conventions.

---

## 3. Installation by Platform

### 3.1 Google Antigravity

*Official Reference:* [Antigravity Customization System Guide](https://github.com/google-deepmind/antigravity) (documented locally in `builtin/skills/agy-customizations/SKILL.md`).

Antigravity natively discovers workspace skills across three scopes:

#### Verified Path: Workspace Root Discovery
In this repository, Antigravity actively discovers `skills/koshi/SKILL.md` directly. This path has been **experimentally verified through live agent invocation**.

#### Documented Path: Project `.agents/skills/`
To integrate Kōshi into another Antigravity workspace, create a symbolic link or copy:
```bash
# Windows PowerShell (Run as Administrator for symlinks)
New-Item -ItemType SymbolicLink -Path ".agents\skills\koshi" -Target "path\to\koshi\skills\koshi"

# macOS / Linux
mkdir -p .agents/skills
ln -s /path/to/koshi/skills/koshi .agents/skills/koshi
```

#### Documented Path: Machine-Global Configuration
To make Kōshi available globally across all Antigravity workspaces:
```bash
# Windows
Copy-Item -Recurse "skills\koshi" "$env:USERPROFILE\.gemini\config\skills\koshi"

# macOS / Linux
cp -r skills/koshi ~/.gemini/config/skills/koshi
```

---

### 3.2 OpenAI Codex

*Official Reference:* [OpenAI Developer Platform — Agent Skills](https://platform.openai.com/docs) (decentralized Agent Skills directory standard).

OpenAI Codex natively supports the decentralized Agent Skills standard via automatic filesystem scanning:

#### Documented Path: Repository Scope (`.agents/skills/`)
Codex automatically scans for project-level skills by walking upward from the current working directory to the repository root:
```bash
# Windows PowerShell
New-Item -ItemType Directory -Force -Path ".agents\skills"
Copy-Item -Recurse "skills\koshi" ".agents\skills\koshi"

# macOS / Linux
mkdir -p .agents/skills
cp -r skills/koshi .agents/skills/koshi
```
Codex inspects the YAML frontmatter of `.agents/skills/koshi/SKILL.md` during session startup and loads child documents on demand.

#### Documented Path: User Scope (`~/.codex/skills/`)
To install Kōshi globally for all Codex sessions on your workstation:
```bash
# Windows PowerShell
New-Item -ItemType Directory -Force -Path "$env:USERPROFILE\.codex\skills"
Copy-Item -Recurse "skills\koshi" "$env:USERPROFILE\.codex\skills\koshi"

# macOS / Linux
mkdir -p ~/.codex/skills
cp -r skills/koshi ~/.codex/skills/koshi
```

#### Manual Fallback (ChatGPT Web / Custom GPTs)
For browser-based ChatGPT or Assistants API without filesystem access, attach the pre-compiled reference (`evaluations/koshi-agent/fixtures/koshi-monolith.md`) to the assistant's knowledge files, and inject `SKILL.md` into the system prompt.

---

### 3.3 Claude Code

*Official Reference:* [Anthropic Claude Code Documentation — Skills](https://docs.anthropic.com/en/docs/agents-and-tools/claude-code/overview).

Claude Code discovers skills placed in `.claude/skills/` within a project, or globally in `~/.claude/skills/`.

#### Project Installation
```bash
# macOS / Linux
mkdir -p .claude/skills
ln -s "$(pwd)/skills/koshi" .claude/skills/koshi

# Windows PowerShell (or copy if symlinks are restricted)
New-Item -ItemType Directory -Force -Path ".claude\skills"
Copy-Item -Recurse "skills\koshi" ".claude\skills\koshi"
```

#### Global Installation
```bash
# macOS / Linux
mkdir -p ~/.claude/skills
cp -r skills/koshi ~/.claude/skills/koshi

# Windows
Copy-Item -Recurse "skills\koshi" "$env:USERPROFILE\.claude\skills\koshi"
```

---

### 3.4 Cursor

*Official Reference:* [Cursor Documentation — Rules for AI](https://docs.cursor.com/context/rules-for-ai).

Cursor inspects project configuration directories (`.cursor/` or `.agents/skills/`).

#### Project Setup
1. Place or link the skill into `.cursor/skills/koshi/` or standard `.agents/skills/koshi/`:
   ```bash
   mkdir -p .cursor/skills
   cp -r skills/koshi .cursor/skills/koshi
   ```
2. In Cursor Settings $\to$ Rules / Features, ensure workspace skill scanning is enabled.
3. Alternatively, reference `skills/koshi/SKILL.md` directly in Cursor Composer using `@skills/koshi/SKILL.md`.

---

## 4. Single Canonical Source Policy

To prevent architectural drift and maintenance overhead:
- **`skills/koshi/` is the sole canonical source of truth.**
- Do **not** maintain separate diverging copies for different platforms in version control.
- Always use symbolic links or automated copy scripts from `skills/koshi/`.

---

## 5. Verification & Health Check

To verify that your installed skill is structurally sound and compatible with Kōshi Core v0.2.0, run the automated verification script:

```bash
node scripts/validate-skill.mjs
```

The script verifies:
1. All 8 canonical files are present with non-zero size.
2. `SKILL.md` frontmatter adheres to specification.
3. All internal Markdown relative links resolve to existing files.
4. No invented attributes (`kos-span`) or invalid properties (`grid-row: subgrid`) are present.
5. All attribute ranges (`kos-cols="1..12|custom"`, `kos-offset="1..6"`, `kos-row-span="1..6"`, `kos-grow="0..3"`) match Core v0.2.0.
