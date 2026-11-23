/**
 * Interactive Ratio Division Selector
 * Dynamically switches proportions in Section 01 of the homepage.
 */
interface RatioOption {
  key: string;
  label: string;
  formula: string;
  code: string;
  columns: Array<{
    span: number;
    title: string;
    sub: string;
    cls: string;
  }>;
}

const RATIOS: Record<string, RatioOption> = {
  '8-4': {
    key: '8-4',
    label: '8 + 4',
    formula: '8 + 4 = 12',
    code: `<div class="kos-grid" kos-cols="12">
  <main kos-col-span="8">Primary Content</main>
  <aside kos-col-span="4">Supporting Space</aside>
</div>`,
    columns: [
      { span: 8, title: '08 / 12', sub: 'Primary Content', cls: 'feature' },
      { span: 4, title: '04 / 12', sub: 'Supporting Space', cls: 'aside' },
    ],
  },
  '7-5': {
    key: '7-5',
    label: '7 + 5',
    formula: '7 + 5 = 12',
    code: `<div class="kos-grid" kos-cols="12">
  <section kos-col-span="7">Feature Narrative</section>
  <figure kos-col-span="5">Visual Specimen</figure>
</div>`,
    columns: [
      { span: 7, title: '07 / 12', sub: 'Feature Narrative', cls: 'feature' },
      { span: 5, title: '05 / 12', sub: 'Visual Specimen', cls: 'aside' },
    ],
  },
  '4-4-4': {
    key: '4-4-4',
    label: '4 + 4 + 4',
    formula: '4 + 4 + 4 = 12',
    code: `<div class="kos-grid" kos-cols="12">
  <div kos-col-span="4">Column 01</div>
  <div kos-col-span="4">Column 02</div>
  <div kos-col-span="4">Column 03</div>
</div>`,
    columns: [
      { span: 4, title: '04 / 12', sub: 'Track Alpha', cls: 'feature' },
      { span: 4, title: '04 / 12', sub: 'Track Beta', cls: 'feature' },
      { span: 4, title: '04 / 12', sub: 'Track Gamma', cls: 'feature' },
    ],
  },
  '6-6': {
    key: '6-6',
    label: '6 + 6',
    formula: '6 + 6 = 12',
    code: `<div class="kos-grid" kos-cols="12">
  <div kos-col-span="6">Left Balance</div>
  <div kos-col-span="6">Right Balance</div>
</div>`,
    columns: [
      { span: 6, title: '06 / 12', sub: 'Left Balance', cls: 'feature' },
      { span: 6, title: '06 / 12', sub: 'Right Balance', cls: 'aside' },
    ],
  },
  '3-6-3': {
    key: '3-6-3',
    label: '3 + 6 + 3',
    formula: '3 + 6 + 3 = 12',
    code: `<div class="kos-grid" kos-cols="12">
  <nav kos-col-span="3">Index</nav>
  <article kos-col-span="6">Reading Chamber</article>
  <aside kos-col-span="3">Footnotes</aside>
</div>`,
    columns: [
      { span: 3, title: '03 / 12', sub: 'Index', cls: 'aside' },
      { span: 6, title: '06 / 12', sub: 'Reading Chamber', cls: 'feature' },
      { span: 3, title: '03 / 12', sub: 'Footnotes', cls: 'aside' },
    ],
  },
};

export function initRatioSelector(): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  function setup() {
    const selectorContainer = document.querySelector<HTMLElement>('[data-ratio-selector]');
    const demoGrid = document.querySelector<HTMLElement>('[data-demo-grid]');
    const formulaDisplay = document.querySelector<HTMLElement>('[data-ratio-formula]');
    const codeDisplay = document.querySelector<HTMLElement>('[data-ratio-code]');

    if (!selectorContainer || !demoGrid) return;
    const targetGrid = demoGrid;

    const pills = selectorContainer.querySelectorAll<HTMLButtonElement>('[data-ratio]');

    function selectRatio(key: string) {
      const option = RATIOS[key];
      if (!option) return;

      pills.forEach((pill) => {
        const isCurrent = pill.getAttribute('data-ratio') === key;
        pill.setAttribute('aria-pressed', String(isCurrent));
      });

      if (formulaDisplay) {
        formulaDisplay.textContent = option.formula;
      }

      if (codeDisplay) {
        codeDisplay.textContent = option.code;
      }

      targetGrid.innerHTML = '';
      option.columns.forEach((col) => {
        const div = document.createElement('div');
        div.className = col.cls;
        div.style.gridColumn = `span ${col.span}`;
        div.setAttribute('kos-col-span', String(col.span));
        div.innerHTML = `
          <div class="col-spec">
            <span class="col-num">${col.title}</span>
            <span class="col-desc">${col.sub}</span>
          </div>
        `;
        targetGrid.appendChild(div);
      });
    }

    pills.forEach((pill) => {
      pill.addEventListener('click', () => {
        const key = pill.getAttribute('data-ratio');
        if (key) selectRatio(key);
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setup, { once: true });
  } else {
    setup();
  }
}

initRatioSelector();
