/**
 * scripts/package-skill.mjs
 * 
 * Packages the canonical Kōshi Agent Skill into standalone distribution archives:
 * - dist/downloads/koshi-skill-v0.1.0.zip
 * - dist/downloads/koshi-skill-v0.1.0.tar.gz
 * Also syncs archives and checksums to public/downloads/ for website distribution.
 * 
 * Cross-Platform Architecture:
 * 1. Zero external binary dependencies (no reliance on OS-specific tar, bsdtar, gzip, or zip).
 * 2. Deterministic archive generation:
 *    - Pinned timestamp (2024-01-01T00:00:00Z)
 *    - Pinned file modes (0644 files, 0755 dirs)
 *    - Pinned UID 0, GID 0 (root:root)
 *    - Alphabetical entry sort order
 *    - Normalized LF line endings for packaged skill text files
 * 3. Dual-integrity verification:
 *    - Source Integrity: Canonical source LF hash verified against Core v0.2.0 git baseline.
 *    - Distribution Baseline Integrity: Exact published byte baseline (17,757 bytes, CRLF)
 *      preserved and verified for downloadable assets.
 * 4. Isolated extraction and post-packaging validation in temporary directory.
 */

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import zlib from 'node:zlib';
import { execFileSync } from 'node:child_process';

const ROOT_DIR = process.cwd();
const SOURCE_DIR = path.join(ROOT_DIR, 'skills', 'koshi');
const DIST_DOWNLOADS = path.join(ROOT_DIR, 'dist', 'downloads');
const PUBLIC_DOWNLOADS = path.join(ROOT_DIR, 'public', 'downloads');
const TEMP_EXTRACT_DIR = path.join(ROOT_DIR, '.temp-skill-validation');

// Deterministic constants
const PINNED_UNIX_TIME = 1704067200; // 2024-01-01T00:00:00Z
// DOS time: 00:00:00 -> 0; DOS date: 2024-01-01 -> ((2024-1980) << 9) | (1 << 5) | 1 = 22561
const PINNED_DOS_TIME = 0;
const PINNED_DOS_DATE = ((2024 - 1980) << 9) | (1 << 5) | 1;

// Core v0.2.0 Integrity Baselines
// 1. Canonical Source LF Hash (Git tree blob a4d06684dca86d54bf7a9e5eed5458124760251a, 17,132 bytes)
const CANONICAL_SOURCE_LF_HASH = 'b9d5013b032b9f5e4afb522f04b82ce6c139fcbf4a8dda4f258388c82a7da5c9';
// 2. Published Distribution Asset Baseline (published v0.2.0 release asset, 17,757 bytes, CRLF)
const PUBLISHED_DISTRIBUTION_BASELINE_HASH = '07abbaedb54132bff9288de58c6ab60733a06f82a5274d828433a1bb481dd135';

console.log('\n=== Kōshi Distribution Packaging Pipeline ===\n');

// 1. Run Pre-Packaging Validation
console.log('1. Running pre-packaging context validation...');
execFileSync('node', ['scripts/validate-skill.mjs', SOURCE_DIR], { stdio: 'inherit' });

// Ensure output directories exist
fs.mkdirSync(DIST_DOWNLOADS, { recursive: true });
fs.mkdirSync(PUBLIC_DOWNLOADS, { recursive: true });

// 2. Core CSS Integrity Verification (Source & Distribution)
console.log('\n2. Verifying Core CSS source & distribution integrity...');

// 2a. Source CSS Integrity
const coreCssPath = path.join(ROOT_DIR, 'src', 'styles', 'koshi.css');
if (!fs.existsSync(coreCssPath)) {
  console.error(`[!] ERROR: Source CSS not found at ${coreCssPath}`);
  process.exit(1);
}
const sourceRaw = fs.readFileSync(coreCssPath, 'utf8');
const sourceNormalizedLF = sourceRaw.replace(/\r\n/g, '\n');
const sourceLFHash = crypto.createHash('sha256').update(sourceNormalizedLF, 'utf8').digest('hex');

if (sourceLFHash !== CANONICAL_SOURCE_LF_HASH) {
  console.error(`[!] ERROR: Source CSS normalized LF hash (${sourceLFHash}) does not match canonical Core v0.2.0 baseline (${CANONICAL_SOURCE_LF_HASH})!`);
  console.error('    Substantive changes to Core CSS are prohibited during Phase 2.');
  process.exit(1);
}
console.log(`   [✓] Source CSS normalized LF hash verified: ${sourceLFHash}`);

// 2b. Distribution Asset Baseline Integrity
// Ensure public/downloads/koshi.css exists and preserves published baseline bytes (17,757 bytes, CRLF)
const pubCoreCssPath = path.join(PUBLIC_DOWNLOADS, 'koshi.css');
const distCoreCssPath = path.join(DIST_DOWNLOADS, 'koshi.css');

if (!fs.existsSync(pubCoreCssPath)) {
  // If not present, generate from normalized source with CRLF to match published baseline
  const crlfContent = sourceNormalizedLF.replace(/\n/g, '\r\n');
  fs.writeFileSync(pubCoreCssPath, crlfContent, 'utf8');
} else {
  // Verify existing file bytes
  let pubBuf = fs.readFileSync(pubCoreCssPath);
  let pubHash = crypto.createHash('sha256').update(pubBuf).digest('hex');
  if (pubHash !== PUBLISHED_DISTRIBUTION_BASELINE_HASH) {
    // If line endings were converted by git checkout without .gitattributes, normalize to CRLF baseline
    const normalizedCRLF = pubBuf.toString('utf8').replace(/\r\n/g, '\n').replace(/\n/g, '\r\n');
    const fixedBuf = Buffer.from(normalizedCRLF, 'utf8');
    const fixedHash = crypto.createHash('sha256').update(fixedBuf).digest('hex');
    if (fixedHash === PUBLISHED_DISTRIBUTION_BASELINE_HASH) {
      fs.writeFileSync(pubCoreCssPath, fixedBuf);
      pubBuf = fixedBuf;
      pubHash = fixedHash;
    } else {
      console.error(`[!] ERROR: Distribution Core CSS checksum (${pubHash}) does not match published v0.2.0 baseline (${PUBLISHED_DISTRIBUTION_BASELINE_HASH})!`);
      process.exit(1);
    }
  }
}

// Sync to dist/downloads/koshi.css
fs.copyFileSync(pubCoreCssPath, distCoreCssPath);

const verifiedPubHash = crypto.createHash('sha256').update(fs.readFileSync(pubCoreCssPath)).digest('hex');
const verifiedDistHash = crypto.createHash('sha256').update(fs.readFileSync(distCoreCssPath)).digest('hex');

if (verifiedPubHash !== PUBLISHED_DISTRIBUTION_BASELINE_HASH || verifiedDistHash !== PUBLISHED_DISTRIBUTION_BASELINE_HASH) {
  console.error(`[!] ERROR: Distributed Core CSS does not match published baseline (${PUBLISHED_DISTRIBUTION_BASELINE_HASH})!`);
  process.exit(1);
}
console.log(`   [✓] Published Core v0.2.0 distribution baseline verified: ${verifiedDistHash} (17,757 bytes)`);

// 3. Build Standalone Distribution Archives (Deterministic & Cross-Platform)
console.log('\n3. Building standalone distribution archives...');

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

/**
 * Scan source directory and return sorted, normalized entries.
 * Normalizes text files to LF for byte-identical cross-platform packaging.
 */
function scanSourceEntries(sourceDir) {
  const entries = [];
  function scan(dir, baseRel = '') {
    const items = fs.readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name));
    for (const item of items) {
      const fullPath = path.join(dir, item.name);
      const relPath = (baseRel ? `${baseRel}/${item.name}` : item.name).replace(/\\/g, '/');
      if (item.isDirectory()) {
        entries.push({ type: 'dir', path: `${relPath}/` });
        scan(fullPath, relPath);
      } else {
        let content = fs.readFileSync(fullPath);
        if (/\.(md|txt|css|json|mjs|ts|js)$/i.test(item.name)) {
          const str = content.toString('utf8').replace(/\r\n/g, '\n');
          content = Buffer.from(str, 'utf8');
        }
        entries.push({ type: 'file', path: relPath, content });
      }
    }
  }
  scan(sourceDir);
  entries.sort((a, b) => a.path.localeCompare(b.path));
  return entries;
}

const entries = scanSourceEntries(SOURCE_DIR);

/**
 * Generate deterministic PKZIP 2.0 archive in pure Node.js.
 */
function buildDeterministicZip(entries, outputPath) {
  const localHeaders = [];
  const centralHeaders = [];
  let currentOffset = 0;

  for (const entry of entries) {
    const isDir = entry.type === 'dir';
    const nameBuf = Buffer.from(entry.path, 'utf8');
    const uncompressedData = isDir ? Buffer.alloc(0) : entry.content;
    const crc = zlib.crc32(uncompressedData);
    const compressedData = isDir ? Buffer.alloc(0) : zlib.deflateRawSync(uncompressedData);

    // Local Header (30 bytes + nameBuf.length)
    const localHeader = Buffer.alloc(30 + nameBuf.length);
    localHeader.writeUInt32LE(0x04034b50, 0); // Local header signature
    localHeader.writeUInt16LE(20, 4);          // Version needed (2.0)
    localHeader.writeUInt16LE(0x0800, 6);      // UTF-8 flag
    localHeader.writeUInt16LE(isDir ? 0 : 8, 8); // Method: Store (0) or Deflate (8)
    localHeader.writeUInt16LE(PINNED_DOS_TIME, 10);
    localHeader.writeUInt16LE(PINNED_DOS_DATE, 12);
    localHeader.writeUInt32LE(crc, 14);
    localHeader.writeUInt32LE(compressedData.length, 18);
    localHeader.writeUInt32LE(uncompressedData.length, 22);
    localHeader.writeUInt16LE(nameBuf.length, 26);
    localHeader.writeUInt16LE(0, 28);
    nameBuf.copy(localHeader, 30);

    localHeaders.push(localHeader, compressedData);

    // Central Directory Header (46 bytes + nameBuf.length)
    const centralHeader = Buffer.alloc(46 + nameBuf.length);
    centralHeader.writeUInt32LE(0x02014b50, 0); // Central header signature
    centralHeader.writeUInt16LE(0x0314, 4);     // Unix, v2.0
    centralHeader.writeUInt16LE(20, 6);         // Version needed
    centralHeader.writeUInt16LE(0x0800, 8);     // UTF-8 flag
    centralHeader.writeUInt16LE(isDir ? 0 : 8, 10);
    centralHeader.writeUInt16LE(PINNED_DOS_TIME, 12);
    centralHeader.writeUInt16LE(PINNED_DOS_DATE, 14);
    centralHeader.writeUInt32LE(crc, 16);
    centralHeader.writeUInt32LE(compressedData.length, 20);
    centralHeader.writeUInt32LE(uncompressedData.length, 24);
    centralHeader.writeUInt16LE(nameBuf.length, 28);
    centralHeader.writeUInt16LE(0, 30);
    centralHeader.writeUInt16LE(0, 32);
    centralHeader.writeUInt16LE(0, 34);
    centralHeader.writeUInt16LE(0, 36);
    const unixMode = isDir ? 0o040755 : 0o100644;
    centralHeader.writeUInt32LE((unixMode << 16) >>> 0, 38);
    centralHeader.writeUInt32LE(currentOffset, 42);
    nameBuf.copy(centralHeader, 46);

    centralHeaders.push(centralHeader);
    currentOffset += localHeader.length + compressedData.length;
  }

  const centralDirOffset = currentOffset;
  const centralDirBuf = Buffer.concat(centralHeaders);
  const centralDirSize = centralDirBuf.length;

  // End of Central Directory (22 bytes)
  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0);
  eocd.writeUInt16LE(0, 4);
  eocd.writeUInt16LE(0, 6);
  eocd.writeUInt16LE(entries.length, 8);
  eocd.writeUInt16LE(entries.length, 10);
  eocd.writeUInt32LE(centralDirSize, 12);
  eocd.writeUInt32LE(centralDirOffset, 16);
  eocd.writeUInt16LE(0, 20);

  const finalZip = Buffer.concat([...localHeaders, centralDirBuf, eocd]);
  fs.writeFileSync(outputPath, finalZip);
}

/**
 * Generate deterministic POSIX ustar TAR.GZ archive in pure Node.js.
 */
function buildDeterministicTarGz(entries, outputPath) {
  const blocks = [];

  for (const entry of entries) {
    const isDir = entry.type === 'dir';
    const header = Buffer.alloc(512);

    // name (100 bytes)
    header.write(entry.path, 0, 100, 'utf8');
    // mode (8 bytes, octal)
    header.write(isDir ? '0000755\0' : '0000644\0', 100, 8, 'ascii');
    // uid & gid (8 bytes each, 0000000)
    header.write('0000000\0', 108, 8, 'ascii');
    header.write('0000000\0', 116, 8, 'ascii');
    // size (12 bytes, octal)
    const size = isDir ? 0 : entry.content.length;
    header.write(`${size.toString(8).padStart(11, '0')}\0`, 124, 12, 'ascii');
    // mtime (12 bytes, octal)
    header.write(`${PINNED_UNIX_TIME.toString(8).padStart(11, '0')}\0`, 136, 12, 'ascii');
    // typeflag (1 byte: '5' for dir, '0' for file)
    header.write(isDir ? '5' : '0', 156, 1, 'ascii');
    // magic & version
    header.write('ustar\0', 257, 6, 'ascii');
    header.write('00', 263, 2, 'ascii');
    // uname & gname
    header.write('root\0', 265, 32, 'ascii');
    header.write('root\0', 297, 32, 'ascii');

    // Checksum (8 bytes at 148, filled with spaces during computation)
    header.fill(32, 148, 156);
    let chksum = 0;
    for (let i = 0; i < 512; i++) chksum += header[i];
    header.write(`${chksum.toString(8).padStart(6, '0')}\0 `, 148, 8, 'ascii');

    blocks.push(header);

    if (!isDir && entry.content.length > 0) {
      blocks.push(entry.content);
      const pad = 512 - (entry.content.length % 512);
      if (pad < 512) {
        blocks.push(Buffer.alloc(pad));
      }
    }
  }

  // End of archive: two 512-byte zero blocks
  blocks.push(Buffer.alloc(1024));

  const tarBuffer = Buffer.concat(blocks);
  // Gzip with mtime 0 for deterministic output
  const gzipped = zlib.gzipSync(tarBuffer, { mtime: 0 });
  fs.writeFileSync(outputPath, gzipped);
}

console.log(`   Creating deterministic ${ZIP_NAME}...`);
buildDeterministicZip(entries, distZipPath);

console.log(`   Creating deterministic ${TAR_NAME}...`);
buildDeterministicTarGz(entries, distTarPath);

// Copy to public/downloads
fs.copyFileSync(distZipPath, publicZipPath);
fs.copyFileSync(distTarPath, publicTarPath);

// 4. Compute Checksums & Write .sha256 files
console.log('\n4. Computing archive checksums...');
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

// 5. Isolated Extraction & Post-Packaging Validation
console.log('\n5. Validating archive extraction in isolated environment...');
if (fs.existsSync(TEMP_EXTRACT_DIR)) {
  fs.rmSync(TEMP_EXTRACT_DIR, { recursive: true, force: true });
}
fs.mkdirSync(TEMP_EXTRACT_DIR, { recursive: true });

/**
 * Pure Node.js TAR.GZ extractor (zero dependency, cross-platform).
 */
function extractTarGz(tarGzPath, targetDir) {
  const gzipped = fs.readFileSync(tarGzPath);
  const tarBuf = zlib.gunzipSync(gzipped);
  let offset = 0;
  while (offset + 512 <= tarBuf.length) {
    const header = tarBuf.subarray(offset, offset + 512);
    offset += 512;
    if (header.every((b) => b === 0)) break;
    const name = header.subarray(0, 100).toString('utf8').replace(/\0.*$/, '').trim();
    if (!name) continue;
    const typeflag = String.fromCharCode(header[156]);
    const sizeStr = header.subarray(124, 136).toString('ascii').replace(/\0.*$/, '').trim();
    const size = sizeStr ? parseInt(sizeStr, 8) : 0;
    const destPath = path.join(targetDir, name);
    if (typeflag === '5' || name.endsWith('/')) {
      fs.mkdirSync(destPath, { recursive: true });
    } else {
      fs.mkdirSync(path.dirname(destPath), { recursive: true });
      const content = tarBuf.subarray(offset, offset + size);
      fs.writeFileSync(destPath, content);
      offset += Math.ceil(size / 512) * 512;
    }
  }
}

console.log(`   Extracting ${distTarPath} into ${TEMP_EXTRACT_DIR}...`);
extractTarGz(distTarPath, TEMP_EXTRACT_DIR);

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
