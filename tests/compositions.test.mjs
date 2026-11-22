import assert from 'node:assert/strict';
import test from 'node:test';
import {
  CATEGORIES,
  generateCompositions,
  getCategoryCounts,
  recipes,
  studySignature,
} from '../src/lib/compositions.ts';
import { exportBoth, exportCSS, exportHTML } from '../src/lib/export.ts';

test('composition recipes count exactly 72 curated studies (12 per archetype)', () => {
  assert.equal(recipes.length, 72, 'should contain exactly 72 production recipes');
});

test('every recipe has unique ID, title, description, and valid category', () => {
  const ids = new Set();
  const validCategories = new Set(['bento', 'hero', 'features', 'editorial', 'gallery', 'lattice']);

  for (const recipe of recipes) {
    assert.ok(recipe.id, 'recipe must have an id');
    assert.ok(!ids.has(recipe.id), `duplicate recipe id: ${recipe.id}`);
    ids.add(recipe.id);

    assert.ok(recipe.title, `recipe ${recipe.id} must have a title`);
    assert.ok(recipe.description, `recipe ${recipe.id} must have a description`);
    assert.ok(recipe.signature, `recipe ${recipe.id} must have a signature`);
    assert.ok(validCategories.has(recipe.category), `recipe ${recipe.id} has invalid category: ${recipe.category}`);
    assert.ok(Array.isArray(recipe.rows) && recipe.rows.length > 0, `recipe ${recipe.id} must have rows`);
  }
});

test('every block in every recipe has valid span and track mathematics', () => {
  for (const recipe of recipes) {
    for (let rIdx = 0; rIdx < recipe.rows.length; rIdx++) {
      const row = recipe.rows[rIdx];
      let currentTrack = 0;

      for (const block of row) {
        assert.ok(
          ['image', 'text', 'quote', 'card', 'stat', 'space'].includes(block.kind),
          `invalid block kind "${block.kind}" in ${recipe.id}`
        );
        assert.ok(block.span >= 1 && block.span <= 12, `span ${block.span} out of bounds in ${recipe.id}`);
        if (block.offset) {
          assert.ok(block.offset >= 1 && block.offset <= 11, `offset ${block.offset} out of bounds in ${recipe.id}`);
        }
        if (block.ratio) {
          assert.ok(
            ['16/9', '4/3', '1/1', 'golden', 'silver', '3/4'].includes(block.ratio),
            `invalid ratio ${block.ratio} in ${recipe.id}`
          );
        }
        if (block.subgrid) {
          assert.ok(
            ['rows', 'cols', 'both'].includes(block.subgrid),
            `invalid subgrid ${block.subgrid} in ${recipe.id}`
          );
        }
        if (block.rowSpan) {
          assert.ok(block.rowSpan >= 1 && block.rowSpan <= 6, `invalid rowSpan in ${recipe.id}`);
        }

        // Track placement checks
        const startTrack = block.offset !== undefined ? block.offset : currentTrack;
        const endTrack = startTrack + block.span;
        const hasMultiRowSpan = row.some((b) => b.rowSpan && b.rowSpan > 1);

        if (!hasMultiRowSpan) {
          assert.ok(
            endTrack <= 12,
            `block exceeds 12 tracks in ${recipe.id} (row ${rIdx}): start=${startTrack}, span=${block.span}, end=${endTrack}`
          );
        }
        currentTrack = endTrack;
      }
    }
  }
});

test('category counts reflect the 72 recipes accurately (exactly 12 per archetype)', () => {
  const counts = getCategoryCounts();
  const allCount = counts.find((c) => c.id === 'all');
  assert.equal(allCount?.count, 72);

  const archetypes = ['bento', 'hero', 'features', 'editorial', 'gallery', 'lattice'];
  for (const arch of archetypes) {
    const archCount = counts.find((c) => c.id === arch);
    assert.equal(archCount?.count, 12, `Archetype ${arch} should have exactly 12 recipes`);
  }
});

test('generateCompositions returns filtered results and deterministic batches', () => {
  const bentoStudies = generateCompositions(0, 'bento', 12);
  assert.equal(bentoStudies.length, 12);
  assert.ok(bentoStudies.every((s) => s.category === 'bento'));

  const allStudies = generateCompositions(0, 'all', 12);
  assert.equal(allStudies.length, 12);

  // Batch 1 produces deterministic shuffle
  const batch1 = generateCompositions(1, 'all', 12);
  const batch1Again = generateCompositions(1, 'all', 12);
  assert.deepEqual(batch1.map((s) => s.id), batch1Again.map((s) => s.id));
});

test('exportHTML generates valid Kōshi CSS Grid markup with subgrids, ratios and spans', () => {
  const bentoStudy = recipes.find((r) => r.id === 'bento-hero-stack');
  assert.ok(bentoStudy);
  const html = exportHTML(bentoStudy);

  assert.ok(html.includes('class="kos-composition"'));
  assert.ok(html.includes('class="kos-grid" kos-cols="12"'));
  assert.ok(html.includes('kos-col-span="8"'));
  assert.ok(html.includes('kos-row-span="2"'));
  assert.ok(html.includes('kos-ratio="16/9"'));

  const subgridStudy = recipes.find((r) => r.id === 'feat-subgrid-triad');
  assert.ok(subgridStudy);
  const subgridHtml = exportHTML(subgridStudy);
  assert.ok(subgridHtml.includes('kos-subgrid="rows"'));
  assert.ok(subgridHtml.includes('class="kos-card"'));
});

test('exportBoth packages companion CSS containing container query and subgrid classes', () => {
  const sample = recipes[0];
  const combined = exportBoth(sample);

  assert.ok(combined.includes('<!-- Include Kōshi\'s core stylesheet (koshi.css)'));
  assert.ok(combined.includes('<style>'));
  assert.ok(combined.includes('.kos-card'));
  assert.ok(combined.includes('.kos-media-wrapper'));
  assert.ok(combined.includes('container-type: inline-size;'));
});
