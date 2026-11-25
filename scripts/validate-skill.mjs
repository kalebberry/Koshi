/**
 * scripts/validate-skill.mjs
 * 
 * Lightweight automated verification for Kōshi Agent Context Architecture.
 * Verifies:
 * - Presence of 8 canonical context files + README + LICENSE
 * - YAML frontmatter validity in SKILL.md
 * - Integrity of all Markdown relative links
 * - API contract conformance in code blocks (attribute names, valid values, absence of hallucinations)
 * - Absence of machine-specific absolute file paths
 * - Core v0.2.0 compatibility metadata
 */

import fs from 'node:fs';
import path from 'node:path';

const TARGET_DIR = process.argv[2] || path.resolve('skills/koshi');

console.log(`\n=== Validating Kōshi Skill Context in: ${TARGET_DIR} ===\n`);

const REQUIRED_FILES = [
  'SKILL.md',
  'README.md',
  'LICENSE',
  'references/api-contracts.md',
  'references/architectural-laws.md',
  'principles/composition-guide.md',
  'principles/anti-patterns.md',
  'workflows/compose-and-refine.md',
  'workflows/diagnose-and-fix.md',
  'examples/curated-specimens.md',
];

const CANONICAL_8_FILES = [
  'SKILL.md',
  'references/api-contracts.md',
  'references/architectural-laws.md',
  'principles/composition-guide.md',
  'principles/anti-patterns.md',
  'workflows/compose-and-refine.md',
  'workflows/diagnose-and-fix.md',
  'examples/curated-specimens.md',
];

let errors = [];
let warnings = [];
let passCount = 0;

function assert(condition, message, isWarning = false) {
  if (condition) {
    passCount++;
  } else {
    if (isWarning) {
      warnings.push(message);
    } else {
      errors.push(message);
    }
  }
}

// 1. Check Required Files
console.log('1. Checking file presence and non-zero size...');
for (const relPath of REQUIRED_FILES) {
  const fullPath = path.join(TARGET_DIR, relPath);
  const exists = fs.existsSync(fullPath);
  assert(exists, `Missing required file: ${relPath}`);
  if (exists) {
    const stat = fs.statSync(fullPath);
    assert(stat.size > 0, `File is empty: ${relPath}`);
  }
}

// 2. Validate SKILL.md Metadata and Size
console.log('2. Validating SKILL.md router constraints...');
const skillMdPath = path.join(TARGET_DIR, 'SKILL.md');
if (fs.existsSync(skillMdPath)) {
  const content = fs.readFileSync(skillMdPath, 'utf8');
  const lines = content.split('\n');
  assert(lines.length <= 100, `SKILL.md must be <= 100 lines (actual: ${lines.length} lines)`);

  const hasName = /name:\s*koshi/.test(content);
  assert(hasName, 'SKILL.md frontmatter must declare "name: koshi"');

  const hasDescription = /description:\s*/.test(content);
  assert(hasDescription, 'SKILL.md frontmatter must contain a description');

  const hasCoreCompat = /v0\.2\.0/.test(content);
  assert(hasCoreCompat, 'SKILL.md must declare compatibility with Kōshi Core v0.2.0');
}

// 3. Validate Markdown Relative Links
console.log('3. Validating Markdown relative link integrity...');
const markdownLinkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;

for (const relPath of REQUIRED_FILES.filter(f => f.endsWith('.md'))) {
  const fullPath = path.join(TARGET_DIR, relPath);
  if (!fs.existsSync(fullPath)) continue;

  const content = fs.readFileSync(fullPath, 'utf8');
  const dir = path.dirname(fullPath);
  let match;

  while ((match = markdownLinkRegex.exec(content)) !== null) {
    const rawTarget = match[2].trim();
    // Ignore external URLs and page anchors
    if (rawTarget.startsWith('http://') || rawTarget.startsWith('https://') || rawTarget.startsWith('#') || rawTarget.startsWith('mailto:')) {
      continue;
    }

    // Strip anchor fragments
    const targetFile = rawTarget.split('#')[0];
    if (!targetFile) continue;

    const resolvedTarget = path.resolve(dir, targetFile);
    const targetExists = fs.existsSync(resolvedTarget);
    assert(targetExists, `Broken relative link in ${relPath}: "${rawTarget}" -> target not found at ${resolvedTarget}`);
  }
}

// 4. Validate Code Blocks for API Contracts & Syntax Bounds
console.log('4. Verifying code blocks for API syntax contracts and hallucination absence...');

const FORBIDDEN_CODE_PATTERNS = [
  { regex: /<[^>]*\bkos-span\s*=/i, desc: 'Hallucinated HTML attribute kos-span (must use kos-col-span)' },
  { regex: /grid-row:\s*subgrid/i, desc: 'Invalid CSS property declaration grid-row: subgrid (must use grid-template-rows: subgrid)' },
  { regex: /<[^>]*\bkos-offset=["']([7-9]|1[0-2])["']/i, desc: 'Out-of-bounds kos-offset in HTML markup (Core supports 1..6 only)' },
  { regex: /<[^>]*\bkos-row-span=["']([7-9]|\d{2,})["']/i, desc: 'Out-of-bounds kos-row-span in HTML markup (Core supports 1..6 only)' },
  { regex: /<[^>]*\bkos-grow=["']([4-9]|\d{2,})["']/i, desc: 'Out-of-bounds kos-grow in HTML markup (Core supports 0..3 only)' },
];

function extractCodeBlocks(markdown) {
  const blocks = [];
  const codeBlockRegex = /```(?:html|css|vue|astro)?\s*([\s\S]*?)```/g;
  let match;
  while ((match = codeBlockRegex.exec(markdown)) !== null) {
    blocks.push(match[1]);
  }
  return blocks;
}

for (const relPath of REQUIRED_FILES.filter(f => f.endsWith('.md'))) {
  const fullPath = path.join(TARGET_DIR, relPath);
  if (!fs.existsSync(fullPath)) continue;

  const content = fs.readFileSync(fullPath, 'utf8');
  
  // In anti-patterns.md, code blocks may demonstrate bad vs good code. Skip anti-patterns.md for code block enforcement.
  if (relPath.includes('anti-patterns.md')) continue;

  const blocks = extractCodeBlocks(content);
  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];
    for (const pattern of FORBIDDEN_CODE_PATTERNS) {
      const match = pattern.regex.test(block);
      assert(!match, `Forbidden syntax pattern in ${relPath} (code block #${i + 1}): ${pattern.desc}`);
    }
  }
}

// 5. Check for Machine-Specific Absolute File Paths
console.log('5. Checking for machine-specific path leakage...');
const MACHINE_PATH_REGEX = /(?:[A-Za-z]:[\\\/]Users[\\\/]|\/home\/|\/Users\/)/i;

for (const relPath of REQUIRED_FILES) {
  const fullPath = path.join(TARGET_DIR, relPath);
  if (!fs.existsSync(fullPath)) continue;

  const content = fs.readFileSync(fullPath, 'utf8');
  const hasMachinePath = MACHINE_PATH_REGEX.test(content);
  assert(!hasMachinePath, `Machine-specific absolute path detected in ${relPath}`);
}

// 6. Token / Word Count Audit
console.log('6. Context size audit across 8 canonical files...');
let totalWords = 0;
for (const relPath of CANONICAL_8_FILES) {
  const fullPath = path.join(TARGET_DIR, relPath);
  if (!fs.existsSync(fullPath)) continue;

  const content = fs.readFileSync(fullPath, 'utf8');
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  totalWords += words;
}
console.log(`   Total canonical context words: ${totalWords}`);
assert(totalWords > 5000 && totalWords < 12000, `Context word count within expected range (actual: ${totalWords})`);

// Summary
console.log(`\n=== Validation Summary ===`);
console.log(`Passed checks: ${passCount}`);
console.log(`Warnings: ${warnings.length}`);
console.log(`Errors: ${errors.length}`);

if (warnings.length > 0) {
  console.log('\nWarnings:');
  for (const w of warnings) console.log(`  [!] ${w}`);
}

if (errors.length > 0) {
  console.log('\nErrors:');
  for (const e of errors) console.log(`  [x] ${e}`);
  process.exit(1);
} else {
  console.log('\nAll automated context architecture checks passed successfully!\n');
  process.exit(0);
}
