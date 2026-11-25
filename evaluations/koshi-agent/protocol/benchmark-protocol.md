# Kōshi Evaluation Protocol & 100-Point Scoring Rubric

## 1. Weighted Quality Rubric (100 Points)

Every generated trial implementation is evaluated against six objective categories:

| Category | Max Points | Evaluation Scope & Objective Assertions | Partial Credit Rules |
| :--- | :---: | :--- | :--- |
| **1. Technical Correctness** | **30** | - Valid CSS and HTML syntax (10 pts).<br>- Correct layout primitives chosen for requirements (10 pts).<br>- No invalid or hallucinated attributes (e.g. `kos-span`, `grid-row: subgrid`) (10 pts). | - Deduct 5 pts per syntax error or hallucinated attribute.<br>- Deduct 10 pts if layout primitive fails completely. |
| **2. Responsive Behavior** | **25** | - Full horizontal containment (`scrollWidth <= clientWidth`) across 360px, 768px, 1200px (10 pts).<br>- Meaningful multi-column layout on desktop ($\ge 1024\text{px}$) (5 pts).<br>- Clean reflow or single-column stack on narrow mobile ($\le 480\text{px}$) (10 pts). | - Deduct 10 pts for horizontal scrollbar at 360px.<br>- Deduct 5 pts for premature or broken wrapping. |
| **3. User Intent Preservation** | **20** | - All requested content elements present (headline, text, media, cards, actions) (10 pts).<br>- Correct spatial hierarchy (dominant anchor vs secondary elements) (5 pts).<br>- Deliberate negative space (*Yohaku*) or growth intent respected (5 pts). | - Deduct 5 pts per missing core functional requirement.<br>- Deduct 5 pts for dogmatic space filling where negative space was requested. |
| **4. Accessibility Fundamentals** | **10** | - DOM source order provides logical sequential reading order matching visual flow (WCAG 2.1 SC 1.3.2) (5 pts).<br>- Semantic HTML elements (`header`, `article`, `figure`, `h1-h6`) used appropriately (5 pts). | - Deduct 5 pts if visual reordering breaks logical reading flow.<br>- Deduct 3 pts for pure div-soup. |
| **5. Maintainability & Code Quality** | **10** | - Clean, idiomatic, readable code structure (5 pts).<br>- Appropriate track sizing without fragile magic numbers or arbitrary pixel widths (5 pts). | - Deduct 5 pts for fragile inline fixed widths (e.g. `style="width: 500px"`). |
| **6. Scope Discipline** | **5** | - Solves only the requested task without unrequested redesigns, unsolicited frameworks, or extraneous scaffolding (5 pts). | - Deduct 5 pts for unsolicited framework injection or unrequested full-page rebuilds. |

**Total Score:** 0 to 100 points.

---

## 2. Resource & Efficiency Metrics (Tracked Separately)

Efficiency is recorded alongside quality scores:
- **Input Tokens (Estimated / Measured):** Estimated based on prompt + injected context.
- **Context Words / Bytes Retrieved:** Measured from files loaded during execution.
- **Context Files Accessed:** Exact files read by the agent.
- **Tool Invocations:** Total tool calls.
- **Execution Duration:** Milliseconds elapsed.
- **Verification Result:** Automated Playwright browser assertion pass/fail.

---

## 3. Browser Assertion Matrix

Every trial output is mounted into a headless Playwright harness loading the appropriate stylesheet (`koshi.css` for B/C/D, vanilla baseline for A):
- **Viewport Dimensions Tested:**
  * Narrow: `360px` width $\times$ `720px` height.
  * Medium: `768px` width $\times$ `900px` height.
  * Wide: `1200px` width $\times$ `900px` height.
- **Automated Assertions:**
  1. `assert(scrollWidth <= clientWidth)` across all widths (Zero horizontal overflow).
  2. `assert(computedColumns)` matches intended multi-column layout on wide, and stacked on narrow.
  3. `assert(alignmentDelta <= 1.0px)` for subgrid rows.
  4. `assert(readingOrderMatchesDOM)` for tab navigation and sequential flow.

---

## 4. Methodology Classification & Research Integrity Boundaries

### 4.1 Evaluation Classification
This evaluation suite distinguishes four distinct levels of validation:
1. **Fixture-Based Browser Validation (Completed):** Automated Playwright execution of 26 curated HTML/CSS implementation fixtures across Chromium, Firefox, and WebKit, testing DOM and CSS Box Model compliance at 360px, 768px, and 1200px.
2. **Structural Context Validation (Completed):** Programmatic verification of the 8 canonical skill files under `skills/koshi/` (link validity, YAML frontmatter syntax, attribute accuracy, word counts).
3. **Preliminary Agent Smoke Testing (Completed):** Interactive exploratory sessions verifying that an LLM agent correctly loads `SKILL.md` and routes to child context files upon prompt keyword matches.
4. **Independent Comparative Agent Evaluation (Not Yet Completed):** Autonomous, multi-agent trials measuring unassisted generation across diverse LLM families in randomized double-blind conditions. This remains an uncompleted future research opportunity.

### 4.2 Explicit Negative Scope & Non-Claims
To preserve scientific honesty:
- **No Claim of Proven Superiority:** The data does not establish that the Kōshi skill produces superior layout code compared to conventional documentation or monolithic context. Conventional documentation performed strongly across standard grid compositions.
- **No Claim of Improved Reasoning:** The modular architecture organizes context for human maintainability; it does not confer higher cognitive or architectural reasoning upon the model.
- **No Claim of Measured Financial or Token Savings:** While prompt context reduction was measured across matched tasks (63.7% reduction in retrieved words), overall session tokens and inference costs depend heavily on model caching, tool overhead, and agent prompting patterns.
- **No Claim of Universal Compatibility:** Verification was conducted in a single model environment (Gemini 2.5 Pro via Playwright harness). Behavior on other LLM families remains unverified.
- **No Claim of Statistical Significance:** Sample sizes (26 total trials across 7 tasks) are exploratory fixtures, not a statistically powered clinical trial.

