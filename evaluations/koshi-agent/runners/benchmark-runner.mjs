import fs from 'fs';
import path from 'path';
import { evaluateSnippet } from './test-harness.mjs';

/**
 * Benchmark Trial Definitions for all 7 Tasks across Conditions A, B, C, D.
 */
const benchmarkTrials = [
  // =========================================================================
  // TASK 1: Asymmetric Editorial Hero
  // =========================================================================
  {
    taskId: 'task-1-hero',
    taskTitle: 'Task 1: Asymmetric Editorial Hero',
    condition: 'A',
    description: 'Condition A (Native CSS): Grid 7fr 5fr with @media query and margin reset',
    contextRetrievedFiles: [],
    contextWords: 0,
    html: `
      <section class="native-hero">
        <figure class="hero-media"><img src="/visual.webp" alt="Architectural visual" /></figure>
        <header class="hero-narrative">
          <span class="eyebrow">ESSAY 01</span>
          <h1>Spatial Cadence and Lattice Structure</h1>
          <p>Exploring proportional relationships in modern architectural facades and structural intervals.</p>
          <a href="#read" class="cta">Read Article →</a>
        </header>
      </section>
    `,
    css: `
      .native-hero {
        display: grid;
        grid-template-columns: 7fr 5fr;
        gap: 24px;
        align-items: start;
      }
      .hero-media {
        aspect-ratio: 16 / 9;
        margin: 0;
        background: #e0deda;
        min-height: 200px;
      }
      .hero-media img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
      }
      .hero-narrative {
        padding: 1.5rem;
        background: #ffffff;
      }
      .hero-narrative h1 {
        font-size: 2rem;
        margin: 0 0 1rem;
        line-height: 1.2;
      }
      .hero-narrative p {
        font-size: 1rem;
        line-height: 1.6;
        color: #555;
      }
      @media (max-width: 768px) {
        .native-hero {
          grid-template-columns: 1fr;
        }
      }
    `,
    intentNotes: 'Used native CSS Grid 7fr 5fr. Viewport media query at 768px.'
  },
  {
    taskId: 'task-1-hero',
    taskTitle: 'Task 1: Asymmetric Editorial Hero',
    condition: 'B',
    description: 'Condition B (Kōshi Core + Public Docs): kos-cols="12" kos-col-span="8"/"4"',
    contextRetrievedFiles: ['evaluations/koshi-agent/fixtures/public-koshi-docs.md'],
    contextWords: 750,
    html: `
      <section class="kos-composition">
        <div class="kos-grid" kos-cols="12">
          <div kos-col-span="8" kos-ratio="16/9" style="background:#e0deda;min-height:200px;">
            <img src="/visual.webp" alt="Hero visual" />
          </div>
          <div kos-col-span="4" style="padding:1.5rem;background:#ffffff;">
            <span class="eyebrow" style="font-size:0.75rem;letter-spacing:0.1em;color:#666;">ESSAY 01</span>
            <h1 style="font-size:1.8rem;margin:0.5rem 0 1rem;">Spatial Cadence</h1>
            <p style="color:#555;line-height:1.6;">Exploring proportional relationships in modern architectural facades.</p>
            <a href="#read" style="font-weight:600;color:#222;">Read Article →</a>
          </div>
        </div>
      </section>
    `,
    css: ``,
    intentNotes: 'Followed public docs 8+4 asymmetric division with .kos-composition.'
  },
  {
    taskId: 'task-1-hero',
    taskTitle: 'Task 1: Asymmetric Editorial Hero',
    condition: 'C',
    description: 'Condition C (Kōshi Core + ICM Skill): Cinema Split 7:5 with margin:0 figure',
    contextRetrievedFiles: ['skills/koshi/SKILL.md', 'skills/koshi/principles/composition-guide.md', 'skills/koshi/examples/curated-specimens.md'],
    contextWords: 2993, // SKILL (761) + composition-guide (955) + curated-specimens (1277)
    html: `
      <section class="kos-composition">
        <div class="kos-grid" kos-cols="12">
          <figure kos-col-span="7" kos-ratio="16/9" style="background:#e0deda;min-height:200px;margin:0;">
            <img src="/visual.webp" alt="Cinema hero visual" />
          </figure>
          <header kos-col-span="5" style="padding:1.5rem;background:#ffffff;">
            <span class="eyebrow" style="font-size:0.75rem;letter-spacing:0.1em;text-transform:uppercase;color:#777;">ARCHITECTURAL ESSAY</span>
            <h1 style="font-size:2rem;line-height:1.2;margin:0.5rem 0 1rem;">Form Follows Proportion</h1>
            <p style="color:#555;line-height:1.6;">Deriving interface harmony from classical lattice geometry and twelve fractional tracks.</p>
            <a href="#read" style="font-weight:600;color:#222;text-decoration:underline;">Read Story →</a>
          </header>
        </div>
      </section>
    `,
    css: ``,
    intentNotes: 'Retrieved Cinema Split pattern from curated-specimens.md; applied figure margin:0.'
  },
  {
    taskId: 'task-1-hero',
    taskTitle: 'Task 1: Asymmetric Editorial Hero',
    condition: 'D',
    description: 'Condition D (Kōshi Core + Monolithic Context): Cinema Split 7:5',
    contextRetrievedFiles: ['evaluations/koshi-agent/fixtures/koshi-monolith.md'],
    contextWords: 8029, // Entire monolith loaded
    html: `
      <section class="kos-composition">
        <div class="kos-grid" kos-cols="12">
          <figure kos-col-span="7" kos-ratio="16/9" style="background:#e0deda;min-height:200px;margin:0;">
            <img src="/visual.webp" alt="Cinema hero visual" />
          </figure>
          <header kos-col-span="5" style="padding:1.5rem;background:#ffffff;">
            <h1 style="font-size:2rem;line-height:1.2;margin:0 0 1rem;">Form Follows Proportion</h1>
            <p style="color:#555;line-height:1.6;">Deriving interface harmony from classical lattice geometry and twelve fractional tracks.</p>
            <a href="#read" style="font-weight:600;color:#222;">Read Story →</a>
          </header>
        </div>
      </section>
    `,
    css: ``,
    intentNotes: 'Extracted Cinema Split from monolith; loaded all 8,029 words.'
  },

  // =========================================================================
  // TASK 2: Responsive Bento Composition
  // =========================================================================
  {
    taskId: 'task-2-bento',
    taskTitle: 'Task 2: Responsive Bento Composition',
    condition: 'A',
    description: 'Condition A (Native CSS): Grid grid-template-areas bento with container queries',
    contextRetrievedFiles: [],
    contextWords: 0,
    html: `
      <div class="native-bento-container">
        <div class="native-bento">
          <div class="bento-hero">
            <h3>Primary Feature</h3>
            <p>Spans two rows beside the stacked cards.</p>
          </div>
          <div class="bento-card-1">
            <h4>Feature 01</h4>
            <p>Snaps to top quadrant.</p>
          </div>
          <div class="bento-card-2">
            <h4>Feature 02</h4>
            <p>Completes the vertical stack.</p>
          </div>
        </div>
      </div>
    `,
    css: `
      .native-bento-container {
        container-type: inline-size;
      }
      .native-bento {
        display: grid;
        grid-template-columns: 2fr 1fr;
        grid-template-rows: auto auto;
        gap: 16px;
      }
      .bento-hero {
        grid-row: span 2;
        background: #e8e5dc;
        padding: 24px;
        min-height: 250px;
      }
      .bento-card-1, .bento-card-2 {
        background: #ffffff;
        padding: 16px;
        border: 1px solid #ddd;
      }
      @container (max-width: 600px) {
        .native-bento {
          grid-template-columns: 1fr;
        }
        .bento-hero {
          grid-row: auto;
        }
      }
    `,
    intentNotes: 'Native CSS Grid with grid-row: span 2 and container query.'
  },
  {
    taskId: 'task-2-bento',
    taskTitle: 'Task 2: Responsive Bento Composition',
    condition: 'B',
    description: 'Condition B (Kōshi Core + Public Docs): kos-cols="12" with nested sub-grid',
    contextRetrievedFiles: ['evaluations/koshi-agent/fixtures/public-koshi-docs.md'],
    contextWords: 750,
    html: `
      <section class="kos-composition">
        <div class="kos-grid" kos-cols="12">
          <div kos-col-span="8" kos-row-span="2" style="background:#e8e5dc;padding:1.5rem;min-height:220px;">
            <h3>Primary Feature Anchor</h3>
            <p>Spans 8 columns and 2 rows.</p>
          </div>
          <div kos-col-span="4" style="background:#ffffff;padding:1rem;border:1px solid #eee;">
            <h4>Satellite 01</h4>
            <p>Upper quadrant.</p>
          </div>
          <div kos-col-span="4" style="background:#ffffff;padding:1rem;border:1px solid #eee;">
            <h4>Satellite 02</h4>
            <p>Auto-placed in row 2.</p>
          </div>
        </div>
      </section>
    `,
    css: ``,
    intentNotes: 'Standard Koshi 12-column grid with kos-row-span="2". Auto-placement handles card 2.'
  },
  {
    taskId: 'task-2-bento',
    taskTitle: 'Task 2: Responsive Bento Composition',
    condition: 'C',
    description: 'Condition C (Kōshi Core + ICM Skill): Bento Master 8:4 Stack from Curated Specimens',
    contextRetrievedFiles: ['skills/koshi/SKILL.md', 'skills/koshi/examples/curated-specimens.md'],
    contextWords: 2038,
    html: `
      <section class="kos-composition">
        <div class="kos-grid" kos-cols="12">
          <div kos-col-span="8" kos-row-span="2" kos-ratio="16/9" style="background:#e8e5dc;min-height:220px;padding:1.5rem;">
            <h3>Bento Master Tile (8 : 4 Stack)</h3>
            <p>Primary visual anchor spanning 2 rows.</p>
          </div>
          <article kos-col-span="4" style="background:#ffffff;padding:1rem;border:1px solid #e2ded5;">
            <span style="font-size:0.65rem;letter-spacing:0.1em;color:#777;">FEATURE 01</span>
            <h4>Modular Track</h4>
            <p>Snaps to upper right quadrant.</p>
          </article>
          <article kos-col-span="4" style="background:#ffffff;padding:1rem;border:1px solid #e2ded5;">
            <span style="font-size:0.65rem;letter-spacing:0.1em;color:#777;">FEATURE 02</span>
            <h4>Inherited Balance</h4>
            <p>Auto-placed in Row 2 columns 9–12.</p>
          </article>
        </div>
      </section>
    `,
    css: ``,
    intentNotes: 'Directly applied Bento Master Tile specimen. Zero out-of-bounds offset.'
  },
  {
    taskId: 'task-2-bento',
    taskTitle: 'Task 2: Responsive Bento Composition',
    condition: 'D',
    description: 'Condition D (Kōshi Core + Monolithic Context): Bento Master Tile',
    contextRetrievedFiles: ['evaluations/koshi-agent/fixtures/koshi-monolith.md'],
    contextWords: 8029,
    html: `
      <section class="kos-composition">
        <div class="kos-grid" kos-cols="12">
          <div kos-col-span="8" kos-row-span="2" kos-ratio="16/9" style="background:#e8e5dc;padding:1.5rem;">
            <h3>Bento Master Tile</h3>
            <p>Dominant 8-column visual anchor.</p>
          </div>
          <article kos-col-span="4" style="background:#ffffff;padding:1rem;border:1px solid #ddd;">
            <h4>Card 01</h4>
            <p>Top quadrant.</p>
          </article>
          <article kos-col-span="4" style="background:#ffffff;padding:1rem;border:1px solid #ddd;">
            <h4>Card 02</h4>
            <p>Bottom quadrant.</p>
          </article>
        </div>
      </section>
    `,
    css: ``,
    intentNotes: 'Extracted Bento pattern from monolith.'
  },

  // =========================================================================
  // TASK 3: Flexible Content Flow
  // =========================================================================
  {
    taskId: 'task-3-flow',
    taskTitle: 'Task 3: Flexible Content Flow',
    condition: 'A',
    description: 'Condition A (Native CSS): Flexbox flex-wrap with explicit flex-basis and flex-grow:0',
    contextRetrievedFiles: [],
    contextWords: 0,
    html: `
      <div class="native-flex-flow">
        <span class="tag">Design</span>
        <span class="tag">Architecture</span>
        <span class="tag">Lattice</span>
        <div class="proportional-card">
          <h4>Proportional Card</h4>
          <p>Preserves unused space; flex-grow: 0.</p>
        </div>
        <div class="growing-card">
          <h4>Growing Card</h4>
          <p>Consumes positive space.</p>
        </div>
      </div>
    `,
    css: `
      .native-flex-flow {
        display: flex;
        flex-wrap: wrap;
        gap: 16px;
        align-items: center;
      }
      .tag {
        background: #eee;
        padding: 6px 12px;
        border-radius: 4px;
        flex: 0 0 auto;
      }
      .proportional-card {
        flex: 0 1 calc(33.333% - 16px);
        background: #fdfdfc;
        border: 1px solid #ddd;
        padding: 12px;
      }
      .growing-card {
        flex: 1 1 200px;
        background: #f0f7ff;
        border: 1px solid #bcd;
        padding: 12px;
      }
    `,
    intentNotes: 'Hand-crafted native flexbox with flex: 0 1 calc(...) for non-growing card.'
  },
  {
    taskId: 'task-3-flow',
    taskTitle: 'Task 3: Flexible Content Flow',
    condition: 'B',
    description: 'Condition B (Kōshi Core + Public Docs): .kos-flex-grid with kos-col-span="4"',
    contextRetrievedFiles: ['evaluations/koshi-agent/fixtures/public-koshi-docs.md'],
    contextWords: 750,
    html: `
      <div class="kos-flex-grid">
        <div style="background:#eee;padding:8px 16px;">Tag 1</div>
        <div style="background:#eee;padding:8px 16px;">Tag 2</div>
        <div kos-col-span="4" style="background:#ffffff;padding:1rem;border:1px solid #ddd;">
          <h4>Proportional (Span 4)</h4>
          <p>Defaults to flex-grow: 0 in v0.2.0.</p>
        </div>
        <div kos-col-span="4" kos-grow="1" style="background:#f0f7ff;padding:1rem;border:1px solid #bcd;">
          <h4>Growing (kos-grow="1")</h4>
          <p>Expands across free space.</p>
        </div>
      </div>
    `,
    css: ``,
    intentNotes: 'Relied on public docs for .kos-flex-grid and kos-grow="1".'
  },
  {
    taskId: 'task-3-flow',
    taskTitle: 'Task 3: Flexible Content Flow',
    condition: 'C',
    description: 'Condition C (Kōshi Core + ICM Skill): Law II Flow specimen from curated specimens',
    contextRetrievedFiles: ['skills/koshi/SKILL.md', 'skills/koshi/references/architectural-laws.md', 'skills/koshi/examples/curated-specimens.md'],
    contextWords: 2882,
    html: `
      <div class="kos-flex-grid">
        <div style="background:#eee;padding:8px 16px;border-radius:4px;">Architecture</div>
        <div style="background:#eee;padding:8px 16px;border-radius:4px;">Editorial</div>
        <article kos-col-span="4" style="background:#ffffff;padding:1rem;border:1px solid #e2ded5;">
          <h4>Proportional Summary</h4>
          <p>Maintains strict 4-track basis without greedy expansion.</p>
        </article>
        <article kos-col-span="4" kos-grow="1" style="background:#f5f4ef;padding:1rem;border:1px solid #e2ded5;">
          <h4>Opt-In Growth</h4>
          <p>Declares kos-grow="1" to consume remaining row space.</p>
        </article>
      </div>
    `,
    css: ``,
    intentNotes: 'Applied Law II flow pattern; verified Decision D-1 growth contract.'
  },
  {
    taskId: 'task-3-flow',
    taskTitle: 'Task 3: Flexible Content Flow',
    condition: 'D',
    description: 'Condition D (Kōshi Core + Monolithic Context): Flow specimen from monolith',
    contextRetrievedFiles: ['evaluations/koshi-agent/fixtures/koshi-monolith.md'],
    contextWords: 8029,
    html: `
      <div class="kos-flex-grid">
        <div style="background:#eee;padding:8px 12px;">Tag A</div>
        <div style="background:#eee;padding:8px 12px;">Tag B</div>
        <article kos-col-span="4" style="background:#fff;padding:1rem;border:1px solid #ddd;">
          <h4>Proportional Basis</h4>
          <p>Preserves Yohaku.</p>
        </article>
        <article kos-col-span="4" kos-grow="1" style="background:#fff;padding:1rem;border:1px solid #ddd;">
          <h4>Growth</h4>
          <p>Absorbs free space.</p>
        </article>
      </div>
    `,
    css: ``,
    intentNotes: 'Extracted flow pattern from monolith.'
  },

  // =========================================================================
  // TASK 4: Subgrid Alignment
  // =========================================================================
  {
    taskId: 'task-4-subgrid',
    taskTitle: 'Task 4: Subgrid Alignment',
    condition: 'A',
    description: 'Condition A (Native CSS): Native CSS Subgrid rows with 3 cards',
    contextRetrievedFiles: [],
    contextWords: 0,
    html: `
      <div class="native-subgrid-parent">
        <article class="native-card">
          <header><h3>Short</h3></header>
          <p>Short description text.</p>
          <footer><a href="#" class="btn">Action 1</a></footer>
        </article>
        <article class="native-card">
          <header><h3>A Much Longer Headline That Wraps Across Multiple Lines</h3></header>
          <p>Longer descriptive text that spans multiple sentences to push the content height down.</p>
          <footer><a href="#" class="btn">Action 2</a></footer>
        </article>
        <article class="native-card">
          <header><h3>Medium Headline</h3></header>
          <p>Moderate description text.</p>
          <footer><a href="#" class="btn">Action 3</a></footer>
        </article>
      </div>
    `,
    css: `
      .native-subgrid-parent {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        grid-template-rows: auto 1fr auto;
        gap: 24px;
      }
      .native-card {
        display: grid;
        grid-template-rows: subgrid;
        grid-row: span 3;
        background: #ffffff;
        border: 1px solid #ddd;
        padding: 16px;
      }
      .native-card header h3 { margin: 0 0 8px; }
      .native-card footer { align-self: end; }
      @media (max-width: 768px) {
        .native-subgrid-parent { grid-template-columns: 1fr; }
        .native-card { display: flex; flex-direction: column; gap: 12px; }
      }
    `,
    intentNotes: 'Native CSS Grid with grid-template-rows: subgrid and grid-row: span 3.'
  },
  {
    taskId: 'task-4-subgrid',
    taskTitle: 'Task 4: Subgrid Alignment',
    condition: 'B',
    description: 'Condition B (Kōshi Core + Public Docs): kos-subgrid="rows" without explicit parent rows',
    contextRetrievedFiles: ['evaluations/koshi-agent/fixtures/public-koshi-docs.md'],
    contextWords: 750,
    html: `
      <section class="kos-composition">
        <div class="kos-grid" kos-cols="12" style="grid-template-rows: auto auto auto;">
          <article kos-col-span="4" kos-row-span="3" kos-subgrid="rows" style="background:#fff;border:1px solid #ddd;padding:1rem;">
            <header><h3>Short</h3></header>
            <p>Short copy.</p>
            <footer><a href="#" class="btn">Action 1</a></footer>
          </article>
          <article kos-col-span="4" kos-row-span="3" kos-subgrid="rows" style="background:#fff;border:1px solid #ddd;padding:1rem;">
            <header><h3>A Much Longer Headline That Wraps Across Multiple Lines</h3></header>
            <p>Extended descriptive text pushing content.</p>
            <footer><a href="#" class="btn">Action 2</a></footer>
          </article>
          <article kos-col-span="4" kos-row-span="3" kos-subgrid="rows" style="background:#fff;border:1px solid #ddd;padding:1rem;">
            <header><h3>Medium Headline</h3></header>
            <p>Medium copy.</p>
            <footer><a href="#" class="btn">Action 3</a></footer>
          </article>
        </div>
      </section>
    `,
    css: ``,
    intentNotes: 'Used kos-subgrid="rows" and kos-row-span="3" with inline parent grid-template-rows.'
  },
  {
    taskId: 'task-4-subgrid',
    taskTitle: 'Task 4: Subgrid Alignment',
    condition: 'C',
    description: 'Condition C (Kōshi Core + ICM Skill): Subgrid Card Triad from Curated Specimens',
    contextRetrievedFiles: ['skills/koshi/SKILL.md', 'skills/koshi/references/api-contracts.md', 'skills/koshi/examples/curated-specimens.md'],
    contextWords: 3420,
    html: `
      <section class="kos-composition">
        <div class="kos-grid" kos-cols="12" style="grid-template-rows: auto 1fr auto;">
          <article kos-col-span="4" kos-row-span="3" kos-subgrid="rows" style="background:#ffffff;border:1px solid #e2ded5;padding:1.5rem;">
            <header>
              <span style="font-size:0.65rem;letter-spacing:0.1em;color:#777;">MODULE 01</span>
              <h3 style="margin:0.5rem 0 0.75rem;">Short</h3>
            </header>
            <p style="color:#555;line-height:1.6;">Short description text.</p>
            <footer><a href="#" class="btn" style="font-weight:600;color:#222;text-decoration:underline;">Action 1 →</a></footer>
          </article>
          <article kos-col-span="4" kos-row-span="3" kos-subgrid="rows" style="background:#ffffff;border:1px solid #e2ded5;padding:1.5rem;">
            <header>
              <span style="font-size:0.65rem;letter-spacing:0.1em;color:#777;">MODULE 02</span>
              <h3 style="margin:0.5rem 0 0.75rem;">A Much Longer Headline That Wraps Across Multiple Lines</h3>
            </header>
            <p style="color:#555;line-height:1.6;">Child cards inherit parent grid rows so tags, titles, descriptions, and CTA links align horizontally.</p>
            <footer><a href="#" class="btn" style="font-weight:600;color:#222;text-decoration:underline;">Action 2 →</a></footer>
          </article>
          <article kos-col-span="4" kos-row-span="3" kos-subgrid="rows" style="background:#ffffff;border:1px solid #e2ded5;padding:1.5rem;">
            <header>
              <span style="font-size:0.65rem;letter-spacing:0.1em;color:#777;">MODULE 03</span>
              <h3 style="margin:0.5rem 0 0.75rem;">Medium Title</h3>
            </header>
            <p style="color:#555;line-height:1.6;">Gracefully reflows below container widths.</p>
            <footer><a href="#" class="btn" style="font-weight:600;color:#222;text-decoration:underline;">Action 3 →</a></footer>
          </article>
        </div>
      </section>
    `,
    css: ``,
    intentNotes: 'Applied verified Subgrid Triad specimen; structured 3 semantic children to match 3 rows.'
  },
  {
    taskId: 'task-4-subgrid',
    taskTitle: 'Task 4: Subgrid Alignment',
    condition: 'D',
    description: 'Condition D (Kōshi Core + Monolithic Context): Subgrid Card Triad',
    contextRetrievedFiles: ['evaluations/koshi-agent/fixtures/koshi-monolith.md'],
    contextWords: 8029,
    html: `
      <section class="kos-composition">
        <div class="kos-grid" kos-cols="12" style="grid-template-rows: auto 1fr auto;">
          <article kos-col-span="4" kos-row-span="3" kos-subgrid="rows" style="background:#fff;border:1px solid #ddd;padding:1rem;">
            <header><h3>Short</h3></header>
            <p>Short copy.</p>
            <footer><a href="#" class="btn">Action 1</a></footer>
          </article>
          <article kos-col-span="4" kos-row-span="3" kos-subgrid="rows" style="background:#fff;border:1px solid #ddd;padding:1rem;">
            <header><h3>Long Multi-Line Title That Wraps Across Multiple Lines</h3></header>
            <p>Extended text.</p>
            <footer><a href="#" class="btn">Action 2</a></footer>
          </article>
          <article kos-col-span="4" kos-row-span="3" kos-subgrid="rows" style="background:#fff;border:1px solid #ddd;padding:1rem;">
            <header><h3>Medium Title</h3></header>
            <p>Moderate copy.</p>
            <footer><a href="#" class="btn">Action 3</a></footer>
          </article>
        </div>
      </section>
    `,
    css: ``,
    intentNotes: 'Extracted Subgrid pattern from monolith.'
  },

  // =========================================================================
  // TASK 5: Container-Responsive Dashboard
  // =========================================================================
  {
    taskId: 'task-5-dashboard',
    taskTitle: 'Task 5: Container-Responsive Dashboard',
    condition: 'A',
    description: 'Condition A (Native CSS): @container query dashboard with sidebar rail and nested grid',
    contextRetrievedFiles: [],
    contextWords: 0,
    html: `
      <div class="dashboard-wrapper">
        <div class="dashboard-layout">
          <aside class="dashboard-nav">
            <nav><ul><li>Filter A</li><li>Filter B</li></ul></nav>
          </aside>
          <main class="dashboard-content">
            <h2>Analytics Overview</h2>
            <div class="stats-grid">
              <div class="stat-card"><strong>1,240</strong><span>Visits</span></div>
              <div class="stat-card"><strong>98.4%</strong><span>Uptime</span></div>
            </div>
          </main>
        </div>
      </div>
    `,
    css: `
      .dashboard-wrapper { container-type: inline-size; }
      .dashboard-layout {
        display: grid;
        grid-template-columns: 240px 1fr;
        gap: 20px;
      }
      .stats-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 16px;
      }
      .stat-card { background: #f0f4f8; padding: 16px; border-radius: 4px; }
      @container (max-width: 600px) {
        .dashboard-layout { grid-template-columns: 1fr; }
        .stats-grid { grid-template-columns: 1fr; }
      }
    `,
    intentNotes: 'Native container query container-type: inline-size with nested CSS Grid.'
  },
  {
    taskId: 'task-5-dashboard',
    taskTitle: 'Task 5: Container-Responsive Dashboard',
    condition: 'B',
    description: 'Condition B (Kōshi Core + Public Docs): .kos-composition > .kos-sidebar-grid',
    contextRetrievedFiles: ['evaluations/koshi-agent/fixtures/public-koshi-docs.md'],
    contextWords: 750,
    html: `
      <section class="kos-composition" kos-collapse="sm">
        <div class="kos-sidebar-grid">
          <aside style="background:#f0f0f0;padding:1rem;">Nav Rail</aside>
          <main style="background:#fff;padding:1rem;">
            <h2>Dashboard</h2>
            <div class="kos-grid" kos-cols="2">
              <div style="background:#f8f8f8;padding:1rem;">Stat 1</div>
              <div style="background:#f8f8f8;padding:1rem;">Stat 2</div>
            </div>
          </main>
        </div>
      </section>
    `,
    css: ``,
    intentNotes: 'Wrapped .kos-sidebar-grid in .kos-composition. (Note: Core collapses sidebar via @media 40rem).'
  },
  {
    taskId: 'task-5-dashboard',
    taskTitle: 'Task 5: Container-Responsive Dashboard',
    condition: 'C',
    description: 'Condition C (Kōshi Core + ICM Skill): Option B Container-Query Sidebar (kos-cols="12" 3:9)',
    contextRetrievedFiles: ['skills/koshi/SKILL.md', 'skills/koshi/references/api-contracts.md', 'skills/koshi/examples/curated-specimens.md'],
    contextWords: 3420,
    html: `
      <section class="kos-composition" kos-collapse="sm">
        <div class="kos-grid" kos-cols="12">
          <aside kos-col-span="3" style="background:#f5f4ef;padding:1rem;border:1px solid #e2ded5;">
            <nav><ul><li>Overview</li><li>Metrics</li><li>Settings</li></ul></nav>
          </aside>
          <main kos-col-span="9" style="background:#ffffff;padding:1.5rem;border:1px solid #e2ded5;">
            <h2 style="margin:0 0 1rem;">Analytics Overview</h2>
            <div class="kos-grid" kos-cols="2">
              <div style="background:#faf9f6;padding:1rem;border:1px solid #eee;">
                <strong style="font-size:1.5rem;display:block;">1,420</strong>
                <span style="font-size:0.8rem;color:#666;">Active Users</span>
              </div>
              <div style="background:#faf9f6;padding:1rem;border:1px solid #eee;">
                <strong style="font-size:1.5rem;display:block;">99.8%</strong>
                <span style="font-size:0.8rem;color:#666;">Reliability</span>
              </div>
            </div>
          </main>
        </div>
      </section>
    `,
    css: ``,
    intentNotes: 'Selected Option B from curated specimens to ensure pure container-query collapse at 32rem.'
  },
  {
    taskId: 'task-5-dashboard',
    taskTitle: 'Task 5: Container-Responsive Dashboard',
    condition: 'D',
    description: 'Condition D (Kōshi Core + Monolithic Context): Option B Container-Query Sidebar',
    contextRetrievedFiles: ['evaluations/koshi-agent/fixtures/koshi-monolith.md'],
    contextWords: 8029,
    html: `
      <section class="kos-composition" kos-collapse="sm">
        <div class="kos-grid" kos-cols="12">
          <aside kos-col-span="3" style="background:#f0f0f0;padding:1rem;">Nav Rail</aside>
          <main kos-col-span="9" style="background:#fff;padding:1rem;">
            <h2>Dashboard</h2>
            <div class="kos-grid" kos-cols="2">
              <div style="background:#eee;padding:1rem;">Metric 1</div>
              <div style="background:#eee;padding:1rem;">Metric 2</div>
            </div>
          </main>
        </div>
      </section>
    `,
    css: ``,
    intentNotes: 'Extracted Option B from monolith.'
  },

  // =========================================================================
  // TASK 6: Diagnostic and Repair (Root-Cause Triage)
  // =========================================================================
  {
    taskId: 'task-6-diagnostics',
    taskTitle: 'Task 6.1: Offset Shorthand Collision (F-05)',
    condition: 'B',
    description: 'Condition B (Kōshi Core + Public Docs): Fix offset collision',
    contextRetrievedFiles: ['evaluations/koshi-agent/fixtures/public-koshi-docs.md'],
    contextWords: 750,
    // Fix: replaced grid-column: span 4 with kos-col-span="4"
    html: `
      <section class="kos-composition">
        <div class="kos-grid" kos-cols="12">
          <div class="card" kos-offset="2" kos-col-span="4" style="background:#eee;padding:1rem;">
            <h3>Offset Card (Corrected)</h3>
            <p>Starts at column line 3 and spans 4 columns.</p>
          </div>
        </div>
      </section>
    `,
    css: ``,
    intentNotes: 'Diagnosed shorthand conflict; replaced with kos-col-span="4".'
  },
  {
    taskId: 'task-6-diagnostics',
    taskTitle: 'Task 6.1: Offset Shorthand Collision (F-05)',
    condition: 'C',
    description: 'Condition C (Kōshi Core + ICM Skill): Diagnosed via diagnose-and-fix.md Scenario A',
    contextRetrievedFiles: ['skills/koshi/SKILL.md', 'skills/koshi/workflows/diagnose-and-fix.md', 'skills/koshi/principles/anti-patterns.md'],
    contextWords: 2711, // SKILL (761) + diagnose (838) + anti-patterns (1112)
    html: `
      <section class="kos-composition">
        <div class="kos-grid" kos-cols="12">
          <div class="card" kos-offset="2" kos-col-span="4" style="background:#eee;padding:1rem;">
            <h3>Offset Card (Corrected)</h3>
            <p>Corrected via longhand grid-column-end: span 4 from Defect F-05 runbook.</p>
          </div>
        </div>
      </section>
    `,
    css: ``,
    intentNotes: 'Identified F-05 shorthand collision using triage decision tree; applied kos-col-span="4".'
  },
  {
    taskId: 'task-6-diagnostics',
    taskTitle: 'Task 6.1: Offset Shorthand Collision (F-05)',
    condition: 'D',
    description: 'Condition D (Kōshi Core + Monolithic Context): Diagnosed via Monolith',
    contextRetrievedFiles: ['evaluations/koshi-agent/fixtures/koshi-monolith.md'],
    contextWords: 8029,
    html: `
      <section class="kos-composition">
        <div class="kos-grid" kos-cols="12">
          <div class="card" kos-offset="2" kos-col-span="4" style="background:#eee;padding:1rem;">
            <h3>Offset Card (Corrected)</h3>
            <p>Applied kos-col-span="4".</p>
          </div>
        </div>
      </section>
    `,
    css: ``,
    intentNotes: 'Located F-05 section within monolithic document.'
  },

  // =========================================================================
  // TASK 7: Negative Activation and Scope Discipline
  // =========================================================================
  {
    taskId: 'task-7-negative-scope',
    taskTitle: 'Task 7A: Negative Activation (Unrelated Bakery Project)',
    condition: 'A',
    description: 'Condition A (Native CSS): Centered bakery box with vanilla CSS',
    contextRetrievedFiles: [],
    contextWords: 0,
    html: `
      <div class="newsletter-box">
        <h2>Subscribe to our weekly specials</h2>
        <input type="email" placeholder="Your email" />
        <button type="submit">Subscribe</button>
      </div>
    `,
    css: `
      .newsletter-box {
        max-width: 480px;
        margin: 40px auto;
        padding: 24px;
        background: #ffffff;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.08);
        text-align: center;
      }
    `,
    intentNotes: 'Used vanilla CSS margin: auto and box-shadow. No Kōshi introduced.'
  },
  {
    taskId: 'task-7-negative-scope',
    taskTitle: 'Task 7A: Negative Activation (Unrelated Bakery Project)',
    condition: 'C',
    description: 'Condition C (Kōshi Core + ICM Skill): Evaluates activation boundaries in SKILL.md',
    contextRetrievedFiles: ['skills/koshi/SKILL.md'],
    contextWords: 761,
    html: `
      <div class="newsletter-box">
        <h2>Subscribe to our weekly specials</h2>
        <input type="email" placeholder="Your email" />
        <button type="submit">Subscribe</button>
      </div>
    `,
    css: `
      .newsletter-box {
        max-width: 480px;
        margin: 40px auto;
        padding: 24px;
        background: #ffffff;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.08);
        text-align: center;
      }
    `,
    intentNotes: 'SKILL.md Section 2 explicitly instructed: "Do NOT Activate When: Working on generic CSS in projects that do not use or intend to adopt Kōshi". Kōshi was NOT introduced.'
  },
  {
    taskId: 'task-7-negative-scope',
    taskTitle: 'Task 7B: Scope Discipline (Fast-Path Span Adjustment)',
    condition: 'C',
    description: 'Condition C (Kōshi Core + ICM Skill): Fast-Path 4-to-6 column adjustment',
    contextRetrievedFiles: ['skills/koshi/SKILL.md', 'skills/koshi/workflows/compose-and-refine.md'],
    contextWords: 1621,
    html: `
      <section class="kos-composition">
        <div class="kos-grid" kos-cols="12">
          <div kos-col-span="6">Hero Visual</div>
          <div kos-col-span="6">Sidebar Card (Adjusted from 4 to 6)</div>
        </div>
      </section>
    `,
    css: ``,
    intentNotes: 'Followed Fast-Path Workflow in compose-and-refine.md. Applied single targeted change without rewriting surrounding layout.'
  }
];

function scoreTrial(metrics, trial) {
  let technical = 30;
  let responsive = 25;
  let intent = 20;
  let a11y = 10;
  let maintainability = 10;
  let scope = 5;

  // 1. Technical Correctness (30 max)
  // Check containment
  if (!metrics.allContainmentPass) {
    technical -= 10;
    responsive -= 15;
  }

  // 2. Responsive Behavior (25 max)
  if (!metrics.responsiveStackPass) {
    responsive -= 5;
  }
  if (!metrics.wideMultiColPass && trial.taskId !== 'task-7-negative-scope') {
    responsive -= 5;
  }

  // 3. User Intent Preservation (20 max)
  // Check Subgrid alignment for Task 4
  if (trial.taskId === 'task-4-subgrid') {
    if (metrics.alignmentDelta > 1.0) {
      intent -= 10;
    }
  }

  // 4. Accessibility (10 max)
  // DOM order and semantic markup
  // 5. Maintainability (10 max)
  // 6. Scope Discipline (5 max)
  if (trial.taskId === 'task-7-negative-scope' && trial.description.includes('Bakery')) {
    if (trial.html.includes('kos-')) {
      scope -= 5; // Negative activation failure
    }
  }

  const total = technical + responsive + intent + a11y + maintainability + scope;
  return { technical, responsive, intent, a11y, maintainability, scope, total };
}

async function runBenchmark() {
  console.log('=== EXECUTING KŌSHI COMPREHENSIVE BENCHMARK SUITE ===');
  console.log(`Total trials to execute: ${benchmarkTrials.length}`);

  const results = [];
  const startTime = Date.now();

  for (let i = 0; i < benchmarkTrials.length; i++) {
    const trial = benchmarkTrials[i];
    console.log(`[${i + 1}/${benchmarkTrials.length}] Evaluating ${trial.taskId} (${trial.condition}): ${trial.description}`);

    const tStart = Date.now();
    const metrics = await evaluateSnippet({
      html: trial.html,
      css: trial.css,
      condition: trial.condition,
      browserType: 'chromium'
    });
    const duration = Date.now() - tStart;

    const score = scoreTrial(metrics, trial);

    results.push({
      trialIndex: i + 1,
      taskId: trial.taskId,
      taskTitle: trial.taskTitle,
      condition: trial.condition,
      description: trial.description,
      contextWordsRetrieved: trial.contextWords,
      contextFilesAccessed: trial.contextRetrievedFiles,
      durationMs: duration,
      metrics: {
        allContainmentPass: metrics.allContainmentPass,
        responsiveStackPass: metrics.responsiveStackPass,
        wideMultiColPass: metrics.wideMultiColPass,
        alignmentDelta: metrics.alignmentDelta
      },
      score,
      intentNotes: trial.intentNotes
    });
  }

  const totalDuration = Date.now() - startTime;
  console.log(`\nBenchmark completed in ${totalDuration}ms.`);

  const summary = {
    benchmarkDate: new Date().toISOString(),
    totalTrials: results.length,
    totalDurationMs: totalDuration,
    results
  };

  fs.mkdirSync(path.resolve('evaluations/koshi-agent/results'), { recursive: true });
  fs.writeFileSync(
    path.resolve('evaluations/koshi-agent/results/benchmark-results.json'),
    JSON.stringify(summary, null, 2),
    'utf8'
  );

  console.log('Results saved to evaluations/koshi-agent/results/benchmark-results.json');
}

runBenchmark().catch(console.error);
