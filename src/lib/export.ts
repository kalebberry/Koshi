import type { Block, Composition } from './compositions';

/**
 * Generate semantic HTML markup for each block type in exportable output.
 */
function blockContent(block: Block): string {
  if (block.kind === 'card') {
    const eyebrow = block.cardData?.eyebrow || 'Feature';
    const title = block.cardData?.title || block.title || 'Harmonized Track';
    const desc = block.cardData?.description || block.text || 'Card body copy snaps to shared row tracks across columns.';
    const cta = block.cardData?.cta || 'Learn More →';
    return `\n      <span class="kos-card__eyebrow">${eyebrow}</span>\n      <h3 class="kos-card__title">${title}</h3>\n      <p class="kos-card__desc">${desc}</p>\n      <a href="#" class="kos-card__cta">${cta}</a>\n    `;
  }

  if (block.kind === 'image') {
    const label = block.title || 'Visual Specimen';
    return `<figure class="kos-media">\n      <div class="kos-media__placeholder"><span>${label}</span></div>\n    </figure>`;
  }

  if (block.kind === 'stat') {
    const val = block.statData?.value || '99.4%';
    const label = block.statData?.label || 'Proportional Metric';
    const note = block.statData?.note ? `\n      <small class="kos-stat__note">${block.statData.note}</small>` : '';
    return `\n      <strong class="kos-stat__value">${val}</strong>\n      <span class="kos-stat__label">${label}</span>${note}\n    `;
  }

  if (block.kind === 'quote') {
    const quote = block.quote || 'Space is not emptiness; it is the structure that gives form meaning.';
    const author = block.author ? `\n      <cite>— ${block.author}</cite>` : '';
    return `\n      <p>“${quote}”</p>${author}\n    `;
  }

  if (block.kind === 'text') {
    const subtitle = block.subtitle ? `<span class="eyebrow">${block.subtitle}</span>\n      ` : '';
    const title = block.title || 'Space shapes the story.';
    const text = block.text || 'Every composition begins with proportion, rhythm, and a considered relationship between elements.';
    return `\n      ${subtitle}<h2>${title}</h2>\n      <p>${text}</p>\n    `;
  }

  return '<!-- intentional yohaku negative space -->';
}

/**
 * Build Kōshi attributes string for a block element.
 */
function buildBlockAttrs(block: Block): string {
  const parts: string[] = [`kos-col-span="${block.span}"`];

  if (block.rowSpan) {
    parts.push(`kos-row-span="${block.rowSpan}"`);
  }
  if (block.ratio) {
    parts.push(`kos-ratio="${block.ratio}"`);
  }
  if (block.subgrid) {
    parts.push(`kos-subgrid="${block.subgrid}"`);
  }
  if (block.offset) {
    parts.push(`kos-offset="${block.offset}"`);
  }

  return parts.join(' ');
}

/**
 * Determine CSS class name for a block wrapper.
 */
function blockClass(block: Block): string {
  switch (block.kind) {
    case 'card':
      return 'kos-card';
    case 'stat':
      return 'kos-stat';
    case 'quote':
      return 'kos-quote';
    case 'image':
      return 'kos-media-wrapper';
    case 'text':
      return 'kos-text-block';
    case 'space':
      return 'kos-space';
    default:
      return 'kos-block';
  }
}

/**
 * Export a composition's markup as standalone Kōshi HTML.
 */
export function exportHTML(study: Composition): string {
  const rows = study.rows
    .map((row) => {
      const blocks = row
        .map((block) => {
          const attrs = buildBlockAttrs(block);
          const cls = blockClass(block);
          return `    <div ${attrs} class="${cls}">${blockContent(block)}</div>`;
        })
        .join('\n');
      return `  <div class="kos-grid" kos-cols="12">\n${blocks}\n  </div>`;
    })
    .join('\n');

  return `<!-- ${study.title} · ${study.categoryLabel} -->\n<section class="kos-composition">\n${rows}\n</section>`;
}

/** Companion styles. Include src/styles/koshi.css from the repository first. */
export const exportCSS = `/* Requires Kōshi CSS: src/styles/koshi.css */
.kos-composition {
  container-type: inline-size;
}
.kos-composition > .kos-grid + .kos-grid {
  margin-top: 1.5rem;
}

/* Subgrid Card Pattern */
.kos-card {
  padding: 1.5rem;
  background: #fdfdfc;
  border: 1px solid #e2ded5;
}
.kos-card__eyebrow {
  font-size: 0.65rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #7a776e;
  display: block;
  margin-bottom: 0.5rem;
}
.kos-card__title {
  font: 500 1.25rem/1.2 var(--font-heading, Georgia, serif);
  margin: 0 0 0.75rem;
}
.kos-card__desc {
  font-size: 0.875rem;
  line-height: 1.6;
  color: #636058;
  margin: 0 0 1.25rem;
}
.kos-card__cta {
  font-size: 0.8rem;
  font-weight: 600;
  color: #23221e;
  text-decoration: underline;
  text-underline-offset: 3px;
}

/* Media Containers */
.kos-media-wrapper {
  overflow: hidden;
  background: #e8e5dc;
}
.kos-media {
  margin: 0;
  width: 100%;
  height: 100%;
}
.kos-media__placeholder {
  width: 100%;
  height: 100%;
  min-height: 12rem;
  display: grid;
  place-items: center;
  background: linear-gradient(135deg, #ddd9d0, #c4bfb4);
  color: #4a473f;
  font-size: 0.75rem;
  letter-spacing: 0.1em;
  font-family: ui-monospace, monospace;
}

/* Editorial Quotes */
.kos-quote {
  margin: 0;
  padding: 1.5rem;
  font: italic 1.5rem/1.3 var(--font-heading, Georgia, serif);
  color: #2a2925;
}
.kos-quote cite {
  display: block;
  font-style: normal;
  font-size: 0.75rem;
  letter-spacing: 0.08em;
  color: #7b786f;
  margin-top: 0.75rem;
  text-transform: uppercase;
}

/* Quantitative Stats */
.kos-stat {
  padding: 1.25rem;
  border-top: 2px solid #23221e;
}
.kos-stat__value {
  font: 700 2.25rem/1 var(--font-heading, sans-serif);
  display: block;
  margin-bottom: 0.25rem;
}
.kos-stat__label {
  font-size: 0.8rem;
  color: #6a675e;
  display: block;
}
.kos-stat__note {
  font-size: 0.7rem;
  color: #8c897f;
  display: block;
  margin-top: 0.25rem;
}

/* Text Blocks */
.kos-text-block .eyebrow {
  font-size: 0.65rem;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: #7a776e;
  display: block;
  margin-bottom: 0.5rem;
}
.kos-text-block h2 {
  font: 400 2rem/1.15 var(--font-heading, Georgia, serif);
  margin: 0 0 1rem;
}
.kos-text-block p {
  font-size: 0.95rem;
  line-height: 1.7;
  color: #55534c;
}`;

/**
 * Export both the HTML structure and its companion CSS in a single copyable snippet.
 */
export function exportBoth(study: Composition): string {
  return `<!-- Include Kōshi's core stylesheet (koshi.css) before this HTML -->\n${exportHTML(study)}\n\n<style>\n${exportCSS}\n</style>`;
}
