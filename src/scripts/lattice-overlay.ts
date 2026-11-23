/**
 * Global Lattice Grid Overlay Toggle:
 * Projects the authentic Kōshi 12-track cinnabar grid lines across the screen.
 */
export function initLatticeOverlay(): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  function setup() {
    const toggleBtns = document.querySelectorAll<HTMLButtonElement>('[data-lattice-toggle]');
    if (!toggleBtns.length) return;

    const updateState = (active: boolean) => {
      document.body.classList.toggle('show-lattice', active);
      toggleBtns.forEach((btn) => {
        btn.setAttribute('aria-pressed', String(active));
        const icon = btn.querySelector('.toggle-icon');
        const text = btn.querySelector('.toggle-text');
        if (icon) icon.textContent = active ? '✕' : '⊞';
        if (text) text.textContent = active ? 'Hide 12-Track Lattice' : 'Toggle 12-Track Lattice';
      });
      try {
        sessionStorage.setItem('koshi-show-lattice', active ? '1' : '0');
      } catch (e) {}
    };

    toggleBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const currentlyActive = document.body.classList.contains('show-lattice');
        updateState(!currentlyActive);
      });
    });

    try {
      if (sessionStorage.getItem('koshi-show-lattice') === '1') {
        updateState(true);
      }
    } catch (e) {}
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setup, { once: true });
  } else {
    setup();
  }
}

initLatticeOverlay();
