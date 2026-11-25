/**
 * scripts/package-skill.mjs
 * 
 * Packages the canonical Kōshi Agent Skill into standalone distribution archives:
 * - dist/downloads/koshi-skill-v0.1.0.zip
 * - dist/downloads/koshi-skill-v0.1.0.tar.gz
 * Also syncs archives to public/downloads/ for website distribution.
 * 
 * Performs validation:
 * 1. Pre-packaging validation via validate-skill.mjs
 * 2. Standalone archive packaging with preserved relative hierarchy
 * 3. Extraction into isolated temporary directory
 * 4. Post-packaging validation on the extracted standalone directory
 * 5. Generation of SHA-256 checksums
 */

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';

const ROOT_DIR = process.cwd();
const SOURCE_DIR = path.join(ROOT_DIR, 'skills', 'koshi');
const DIST_DOWNLOADS = path.join(ROOT_DIR, 'dist', 'downloads');
const PUBLIC_DOWNLOADS = path.join(ROOT_DIR, 'public', 'downloads');
const TEMP_EXTRACT_DIR = path.join(ROOT_DIR, '.temp-skill-validation');

console.log('\n=== Kōshi Distribution Packaging Pipeline ===\n');

// 1. Run Pre-Packaging Validation
console.log('1. Running pre-packaging context validation...');
execFileSync('node', ['scripts/validate-skill.mjs', SOURCE_DIR], { stdio: 'inherit' });

// Ensure output directories exist
fs.mkdirSync(DIST_DOWNLOADS, { recursive: true });
fs.mkdirSync(PUBLIC_DOWNLOADS, { recursive: true });

const ZIP_NAME = 'koshi-skill-v0.1.0.zip';
const TAR_NAME = 'koshi-skill-v0.1.0.tar.gz';

const distZipPath = path.join(DIST_DOWNLOADS, ZIP_NAME);
const distTarPath = path.join(DIST_DOWNLOADS, TAR_NAME);
const publicZipPath = path.join(PUBLIC_DOWNLOADS, ZIP_NAME);
const publicTarPath = path.join(PUBLIC_DOWNLOADS, TAR_NAME);

// Remove stale archives if present
for (const p of [distZipPath, distTarPath, publicZipPath, publicTarPath]) {
  if (fs.existsSync(p)) fs.unlinkSync(p);
}

// 2. Package Archives using bsdtar with reproducible timestamps
console.log('\n2. Building standalone distribution archives...');

// Pinned epoch timestamp (2024-01-01T00:00:00Z) for deterministic tar archive generation
const PINNED_MTIME = '@1704067200';

console.log(`   Creating ${ZIP_NAME}...`);
execFileSync('tar', ['-a', '-c', '--mtime', PINNED_MTIME, '-f', distZipPath, '*'], { cwd: SOURCE_DIR, shell: true });

console.log(`   Creating ${TAR_NAME}...`);
execFileSync('tar', ['-czf', distTarPath, '--mtime', PINNED_MTIME, '*'], { cwd: SOURCE_DIR, shell: true });

// Copy to public/downloads
fs.copyFileSync(distZipPath, publicZipPath);
fs.copyFileSync(distTarPath, publicTarPath);

// 3. Compute SHA-256
console.log('\n3. Computing archive checksums...');
function computeSHA256(filePath) {
  const fileBuffer = fs.readFileSync(filePath);
  return crypto.createHash('sha256').update(fileBuffer).digest('hex');
}

const zipHash = computeSHA256(distZipPath);
const tarHash = computeSHA256(distTarPath);

console.log(`   ZIP SHA-256: ${zipHash}`);
console.log(`   TAR SHA-256: ${tarHash}`);

fs.writeFileSync(`${distZipPath}.sha256`, `${zipHash}  ${ZIP_NAME}\n`, 'utf8');
fs.writeFileSync(`${distTarPath}.sha256`, `${tarHash}  ${TAR_NAME}\n`, 'utf8');
fs.writeFileSync(`${publicZipPath}.sha256`, `${zipHash}  ${ZIP_NAME}\n`, 'utf8');
fs.writeFileSync(`${publicTarPath}.sha256`, `${tarHash}  ${TAR_NAME}\n`, 'utf8');

// Also verify and record Core CSS checksum
const coreCssPath = path.join(ROOT_DIR, 'src', 'styles', 'koshi.css');
const coreHash = computeSHA256(coreCssPath);
console.log(`   Core CSS SHA-256: ${coreHash}`);
const EXPECTED_CORE_HASH = '07abbaedb54132bff9288de58c6ab60733a06f82a5274d828433a1bb481dd135';
if (coreHash !== EXPECTED_CORE_HASH) {
  console.error(`[!] WARNING: Core CSS checksum (${coreHash}) does not match release v0.2.0 baseline (${EXPECTED_CORE_HASH})!`);
  process.exit(1);
} else {
  console.log('   [✓] Core CSS v0.2.0 baseline verified unchanged.');
}

// 4. Isolated Temporary Directory Extraction & Validation
console.log('\n4. Validating archive extraction in isolated environment...');
if (fs.existsSync(TEMP_EXTRACT_DIR)) {
  fs.rmSync(TEMP_EXTRACT_DIR, { recursive: true, force: true });
}
fs.mkdirSync(TEMP_EXTRACT_DIR, { recursive: true });

console.log(`   Extracting ${distZipPath} into ${TEMP_EXTRACT_DIR}...`);
execFileSync('tar', ['-xf', distZipPath, '-C', TEMP_EXTRACT_DIR], { shell: true });

console.log('   Running post-extraction verification on extracted files...');
execFileSync('node', ['scripts/validate-skill.mjs', TEMP_EXTRACT_DIR], { stdio: 'inherit' });

// Verify absence of evaluation or repository files in extracted folder
const extractedFiles = fs.readdirSync(TEMP_EXTRACT_DIR, { recursive: true });
console.log(`   Extracted ${extractedFiles.length} files/directories.`);
const forbiddenExtractPatterns = ['evaluations', 'node_modules', 'tests', '.git', 'src', 'dist'];
for (const f of extractedFiles) {
  for (const forbidden of forbiddenExtractPatterns) {
    if (f.includes(forbidden)) {
      console.error(`[!] ERROR: Extraneous repository file found in package: ${f}`);
      process.exit(1);
    }
  }
}
console.log('   [✓] Archive is strictly isolated and free of extraneous repository files.');

// Cleanup temp extraction directory
fs.rmSync(TEMP_EXTRACT_DIR, { recursive: true, force: true });
console.log('   [✓] Temporary extraction directory cleaned up.');

console.log('\n=== Distribution Packaging & Validation Complete ===\n');
