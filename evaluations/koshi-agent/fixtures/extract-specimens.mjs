import fs from 'fs';
import path from 'path';

/**
 * Programmatically extracts the exact HTML code blocks from skills/koshi/examples/curated-specimens.md.
 * Guarantees that evaluation tests the actual Markdown documentation rather than synthetic substitutes.
 */
export function extractSpecimensFromMarkdown() {
  const mdPath = path.resolve('skills/koshi/examples/curated-specimens.md');
  const content = fs.readFileSync(mdPath, 'utf8');

  // Match each specimen section: ## N. Title ... ```html\n(code)\n```
  const sectionRegex = /##\s*(\d+)\.\s*([^\n]+)([\s\S]*?)```html\n([\s\S]*?)```/g;
  const specimens = [];
  let match;

  while ((match = sectionRegex.exec(content)) !== null) {
    const number = parseInt(match[1], 10);
    const title = match[2].trim();
    const body = match[3];
    const html = match[4].trim();

    // Check if there is an Option B or second code block in the section
    specimens.push({
      number,
      title,
      html,
      rawSnippetLength: html.length
    });
  }

  // Also check for Option B under Section 7
  const optionBRegex = /### Option B:[^\n]*\n[\s\S]*?```html\n([\s\S]*?)```/;
  const optBMatch = optionBRegex.exec(content);
  if (optBMatch) {
    specimens.push({
      number: 7.2,
      title: 'Compact Sidebar Option B (Container Query)',
      html: optBMatch[1].trim(),
      rawSnippetLength: optBMatch[1].trim().length
    });
  }

  return specimens;
}

if (process.argv[1] && process.argv[1].endsWith('extract-specimens.mjs')) {
  const specs = extractSpecimensFromMarkdown();
  console.log(`Extracted ${specs.length} specimens directly from Markdown:`);
  for (const s of specs) {
    console.log(`  [${s.number}] ${s.title} (${s.rawSnippetLength} chars)`);
  }
}
