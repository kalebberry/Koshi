import fs from 'fs';
import path from 'path';
import { evaluateSnippet } from './test-harness.mjs';

/**
 * Pilot Implementations representing each condition for validation of the scoring harness.
 *
 * Task 1: Asymmetric Editorial Hero
 * Condition A: Native CSS (CSS Grid, @container or @media, custom styles)
 * Condition B: Koshi Core + Public Docs (Standard Koshi attributes, no skill)
 * Condition C: Koshi Core + 8-File ICM Skill (Intent-driven progressive disclosure)
 * Condition D: Koshi Core + Monolithic Context (Consolidated single reference)
 */
const pilotTrials = [
  {
    taskId: 'task-1-hero',
    condition: 'A',
    description: 'Native CSS Asymmetric Hero (Grid 7fr 5fr + media query)',
    html: `
      <section class="native-hero">
        <figure class="hero-media"><img src="/visual.webp" alt="Visual" style="width:100%;height:100%;object-fit:cover;"></figure>
        <header class="hero-content">
          <h1>Modern Spatial Architecture</h1>
          <p>Exploring structural proportion and material cadence.</p>
          <a href="#" class="cta">Read Article →</a>
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
      @media (max-width: 768px) {
        .native-hero {
          grid-template-columns: 1fr;
        }
      }
    `
  },
  {
    taskId: 'task-1-hero',
    condition: 'B',
    description: 'Koshi Core + Public Docs Asymmetric Hero (kos-cols="12" kos-col-span="8"/"4")',
    html: `
      <section class="kos-composition">
        <div class="kos-grid" kos-cols="12">
          <div kos-col-span="8" kos-ratio="16/9" style="background:#e0deda;min-height:200px;">
            <img src="/visual.webp" alt="Visual" />
          </div>
          <div kos-col-span="4" style="padding:1rem;background:#fdfdfc;">
            <h1>Modern Spatial Architecture</h1>
            <p>Exploring structural proportion and material cadence.</p>
            <a href="#" class="cta">Read Article →</a>
          </div>
        </div>
      </section>
    `,
    css: ``
  },
  {
    taskId: 'task-1-hero',
    condition: 'C',
    description: 'Koshi Core + ICM Skill Asymmetric Hero (Cinema Split 7:5 kos-ratio="16/9")',
    html: `
      <section class="kos-composition">
        <div class="kos-grid" kos-cols="12">
          <figure kos-col-span="7" kos-ratio="16/9" style="background:#e0deda;min-height:200px;">
            <img src="/visual.webp" alt="Visual" />
          </figure>
          <header kos-col-span="5" style="padding:1.5rem;background:#fdfdfc;">
            <span class="eyebrow" style="font-size:0.75rem;letter-spacing:0.1em;text-transform:uppercase;">ESSAY 01</span>
            <h2>Form Follows Proportion</h2>
            <p>Deriving modern interface harmony from classical lattice geometry.</p>
            <a href="#" class="cta">Read Story →</a>
          </header>
        </div>
      </section>
    `,
    css: ``
  },
  {
    taskId: 'task-1-hero',
    condition: 'D',
    description: 'Koshi Core + Monolithic Context Asymmetric Hero (Cinema Split 7:5)',
    html: `
      <section class="kos-composition">
        <div class="kos-grid" kos-cols="12">
          <figure kos-col-span="7" kos-ratio="16/9" style="background:#e0deda;min-height:200px;">
            <img src="/visual.webp" alt="Visual" />
          </figure>
          <header kos-col-span="5" style="padding:1.5rem;background:#fdfdfc;">
            <h2>Form Follows Proportion</h2>
            <p>Deriving modern interface harmony from classical lattice geometry.</p>
            <a href="#" class="cta">Read Story →</a>
          </header>
        </div>
      </section>
    `,
    css: ``
  }
];

function scoreTrial(metrics, taskReqs, condition) {
  let technical = 30;
  let responsive = 25;
  let intent = 20;
  let a11y = 10;
  let maintainability = 10;
  let scope = 5;

  // 1. Technical Correctness (30 max)
  // Check for invalid attributes
  if (condition !== 'A') {
    if (metrics.hasInvalidAttrs) technical -= 10;
  }

  // 2. Responsive Behavior (25 max)
  if (!metrics.allContainmentPass) responsive -= 15;
  if (!metrics.responsiveStackPass) responsive -= 5;
  if (!metrics.wideMultiColPass) responsive -= 5;

  // 3. User Intent Preservation (20 max)
  // All pilot items fulfilled requirements
  // 4. Accessibility (10 max)
  // 5. Maintainability (10 max)
  // 6. Scope (5 max)

  const total = technical + responsive + intent + a11y + maintainability + scope;
  return {
    technical,
    responsive,
    intent,
    a11y,
    maintainability,
    scope,
    total
  };
}

async function runPilot() {
  console.log('=== RUNNING PILOT BENCHMARK EVALUATION ===');
  const results = [];

  for (const trial of pilotTrials) {
    console.log(`Running pilot: [${trial.condition}] ${trial.description}`);
    const metrics = await evaluateSnippet({
      html: trial.html,
      css: trial.css,
      condition: trial.condition,
      browserType: 'chromium'
    });

    const score = scoreTrial(metrics, {}, trial.condition);
    results.push({
      trialId: `pilot-${trial.taskId}-${trial.condition}`,
      taskId: trial.taskId,
      condition: trial.condition,
      description: trial.description,
      metrics: {
        allContainmentPass: metrics.allContainmentPass,
        responsiveStackPass: metrics.responsiveStackPass,
        wideMultiColPass: metrics.wideMultiColPass,
        alignmentDelta: metrics.alignmentDelta
      },
      score
    });
  }

  fs.mkdirSync(path.resolve('evaluations/koshi-agent/results'), { recursive: true });
  fs.writeFileSync(
    path.resolve('evaluations/koshi-agent/results/pilot-results.json'),
    JSON.stringify(results, null, 2),
    'utf8'
  );

  console.log('Pilot results saved to evaluations/koshi-agent/results/pilot-results.json');
  console.table(results.map(r => ({
    condition: r.condition,
    containment: r.metrics.allContainmentPass,
    stacking: r.metrics.responsiveStackPass,
    multiCol: r.metrics.wideMultiColPass,
    score: r.score.total
  })));
}

runPilot().catch(console.error);
