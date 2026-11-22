/**
 * Global code block enhancement:
 * - Wraps all <pre> blocks in a relative container
 * - Injects a one-click copy button with clipboard integration and visual feedback
 */
export function initCodeCopy(): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  const copySvg = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>`;
  const checkSvg = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"></polyline></svg>`;

  function setupCodeBlock(pre: HTMLElement) {
    if (pre.parentElement?.classList.contains('code-block-wrapper')) return;

    // Create wrapper
    const wrapper = document.createElement('div');
    wrapper.className = 'code-block-wrapper';
    pre.parentNode?.insertBefore(wrapper, pre);
    wrapper.appendChild(pre);

    // Create copy button
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'code-copy-btn';
    btn.setAttribute('aria-label', 'Copy code to clipboard');
    btn.innerHTML = `${copySvg}<span>Copy</span>`;

    btn.addEventListener('click', async () => {
      const raw = (pre.querySelector('code') || pre).textContent || '';
      const cleanCode = raw.replace(/^\n+|\n+$/g, '');

      try {
        if (navigator.clipboard?.writeText) {
          await navigator.clipboard.writeText(cleanCode);
        } else {
          // Fallback using temporary textarea
          const ta = document.createElement('textarea');
          ta.value = cleanCode;
          ta.style.position = 'fixed';
          ta.style.opacity = '0';
          document.body.appendChild(ta);
          ta.select();
          document.execCommand('copy');
          document.body.removeChild(ta);
        }

        btn.classList.add('code-copy-btn--copied');
        btn.innerHTML = `${checkSvg}<span>Copied!</span>`;

        setTimeout(() => {
          btn.classList.remove('code-copy-btn--copied');
          btn.innerHTML = `${copySvg}<span>Copy</span>`;
        }, 2000);
      } catch {
        btn.classList.add('code-copy-btn--copied');
        btn.innerHTML = `<span>Copied</span>`;
        setTimeout(() => {
          btn.classList.remove('code-copy-btn--copied');
          btn.innerHTML = `${copySvg}<span>Copy</span>`;
        }, 2000);
      }
    });

    wrapper.appendChild(btn);
  }

  function init() {
    document.querySelectorAll<HTMLElement>('pre').forEach(setupCodeBlock);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
}

initCodeCopy();
