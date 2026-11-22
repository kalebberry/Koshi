import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const rawCss = readFileSync(new URL('../src/styles/koshi.css', import.meta.url), 'utf8');
const normalizedCss = rawCss.replace(/\s+/g, ' ');
const columns = 12;
const gutterSizes = [0, 8, 16, 24, 40];
const widths = [320, 768, 1200];

function expectedSpanWidth(span, width, gap) {
  return (span / columns) * width - ((columns - span) / columns) * gap;
}

test('every flex span has the correct gutter-aware expression', () => {
  for (let span = 1; span <= columns; span++) {
    const expression = span === 12
      ? '100%'
      : `calc(100% * ${span} / 12 - var(--kos-gutter) * ${12 - span} / 12)`;
    const pattern = new RegExp(`\\.kos-flex-grid > \\[kos-col-span=['"]${span}['"]\\] \\{ flex-basis: ${expression.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}; \\}`);
    assert.match(normalizedCss, pattern, `span ${span}`);
  }
});

test('12 columns occupy one complete row', () => {
  for (const width of widths) for (const gap of gutterSizes) {
    assert.equal(expectedSpanWidth(12, width, gap), width);
  }
});

test('row combinations exactly fill their available width including gaps', () => {
  const rows = [[6, 6], [4, 4, 4], [3, 9], [8, 4], [2, 5, 5], [1, 11], [12]];
  for (const width of widths) for (const gap of gutterSizes) for (const row of rows) {
    const occupied = row.reduce((sum, span) => sum + expectedSpanWidth(span, width, gap), 0)
      + (row.length - 1) * gap;
    assert.ok(Math.abs(occupied - width) < 1e-8, `width=${width} gap=${gap} row=${row} got=${occupied}`);
  }
});

test('CSS Grid uses native fractional tracks for 12 columns', () => {
  assert.match(normalizedCss, /\.kos-grid\[kos-cols=['"]12['"]\] \{ grid-template-columns: repeat\(12, minmax\(0, 1fr\)\); \}/);
});

test('ordinary grids remain intrinsic while child spans opt into twelve tracks', () => {
  assert.match(normalizedCss, /repeat\(\s*var\(--kos-grid-placement, auto-fit\),\s*minmax\(min\(100%,\s*var\(--kos-grid-min-item-size\)\),\s*1fr\)\s*\)/);
  assert.ok(normalizedCss.includes('.kos-grid:not([kos-cols]):has(> [kos-col-span]) {'));
  assert.ok(normalizedCss.includes('grid-template-columns: repeat(12, minmax(0, 1fr));'));
  assert.match(normalizedCss, /\.kos-grid\[kos-cols=['"]6['"]\] \{ grid-template-columns: repeat\(6, minmax\(0, 1fr\)\); \}/);
});

test('span-based compositions stack at tiered container widths', () => {
  assert.match(
    normalizedCss,
    /\.kos-composition:not\(\[kos-collapse=['"]sm['"]\]\):not\(\[kos-collapse=['"]lg['"]\]\):not\(\[kos-collapse=['"]none['"]\]\) > \.kos-grid:is\(\[kos-cols\], :has\(> \[kos-col-span\]\)\) \{ grid-template-columns: minmax\(0, 1fr\); \}/
  );
  assert.match(
    normalizedCss,
    /\.kos-composition\[kos-collapse=['"]sm['"]\] > \.kos-grid:is\(\[kos-cols\], :has\(> \[kos-col-span\]\)\) \{ grid-template-columns: minmax\(0, 1fr\); \}/
  );
  assert.match(
    normalizedCss,
    /\.kos-composition\[kos-collapse=['"]lg['"]\] > \.kos-grid:is\(\[kos-cols\], :has\(> \[kos-col-span\]\)\) \{ grid-template-columns: minmax\(0, 1fr\); \}/
  );
});

test('subgrid maps to CSS Grid subgrid row and column tracks', () => {
  assert.match(normalizedCss, /\[kos-subgrid\],\s*\[kos-subgrid=['"]rows['"]\]\s*\{\s*display:\s*grid;\s*grid-template-rows:\s*subgrid;\s*\}/);
  assert.match(normalizedCss, /\[kos-subgrid=['"]cols['"]\]\s*\{\s*display:\s*grid;\s*grid-template-columns:\s*subgrid;\s*\}/);
});

test('aspect ratio primitives map standard ratios', () => {
  assert.match(normalizedCss, /\[kos-ratio=['"]16\/9['"]\]\s*\{\s*aspect-ratio:\s*16\s*\/\s*9;\s*\}/);
  assert.match(normalizedCss, /\[kos-ratio=['"]golden['"]\]\s*\{\s*aspect-ratio:\s*1\.618\s*\/\s*1;\s*\}/);
  assert.match(normalizedCss, /\[kos-ratio=['"]silver['"]\]\s*\{\s*aspect-ratio:\s*1\s*\/\s*1\.414;\s*\}/);
  assert.match(normalizedCss, /:is\(img,\s*video\)\[kos-ratio\],\s*\[kos-ratio\]\s*>\s*:is\(img,\s*video,\s*iframe,\s*picture\)\s*\{\s*width:\s*100%;\s*height:\s*100%;\s*object-fit:\s*cover;\s*display:\s*block;\s*\}/);
});

test('lattice visualizer projects debug outlines and badges under kos-debug', () => {
  assert.match(normalizedCss, /\[kos-debug\]\.kos-grid,\s*\[kos-debug\]\s+\.kos-grid,\s*\.kos-composition\[kos-debug\]\s*\{\s*outline:\s*1px\s+dashed/);
  assert.match(normalizedCss, /content:\s*attr\(kos-col-span\)\s*'\s*\/ 12'/);
});

test('koshi rules are enclosed in the kos-grid cascade layer', () => {
  assert.match(normalizedCss, /@layer\s+kos-grid\s*\{/);
});

test('masonry grid features progressive enhancement for native CSS grid masonry', () => {
  assert.match(
    normalizedCss,
    /@supports\s*\(grid-template-rows:\s*masonry\)\s*\{\s*\.kos-masonry-grid\s*\{\s*display:\s*grid;\s*grid-template-columns:\s*repeat\(var\(--kos-masonry-columns,\s*3\),\s*minmax\(0,\s*1fr\)\);\s*grid-template-rows:\s*masonry;/
  );
});

test('supports arbitrary column and span counts via CSS custom properties', () => {
  assert.match(normalizedCss, /\.kos-grid\[style\*=['"]--kos-cols['"]\]/);
  assert.match(normalizedCss, /\[style\*=['"]--kos-col-span['"]\]/);
});

test('supports progressive enhancement for typed attr() in CSS Values Level 5', () => {
  assert.match(normalizedCss, /@supports\s*\(grid-column:\s*span\s*attr\(test\s+type\(<integer>\),\s*1\)\)/);
  assert.match(normalizedCss, /grid-template-columns:\s*repeat\(attr\(kos-cols\s+type\(<integer>\),\s*12\),\s*minmax\(0,\s*1fr\)\);/);
});

test('offsets map correctly to explicit grid column lines', () => {
  for (let offset = 1; offset <= 6; offset++) {
    const pattern = new RegExp(`\\[kos-offset=['"]${offset}['"]\\]\\s*\\{\\s*grid-column-start:\\s*${offset + 1};\\s*\\}`);
    assert.match(normalizedCss, pattern, `offset ${offset}`);
  }
});

test('row spans map correctly to grid row spans 1 to 6', () => {
  for (let span = 1; span <= 6; span++) {
    const pattern = new RegExp(`\\[kos-row-span=['"]${span}['"]\\]\\s*\\{\\s*grid-row:\\s*span\\s+${span};\\s*\\}`);
    assert.match(normalizedCss, pattern, `row span ${span}`);
  }
});

test('fluid container offset formula scales smoothly with clamp', () => {
  assert.match(normalizedCss, /--grid-container-offset:\s*clamp\(1rem,\s*3\.5vw,\s*3\.5rem\);/);
});
