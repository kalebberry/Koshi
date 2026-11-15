# Website stylesheet architecture

The website uses a **modern 7–1 plain CSS architecture** leveraging native **CSS Cascade Layers (`@layer`)** and **`index.css` entrypoints** without requiring Sass or preprocessors.

## Cascade Layers (`@layer`)

Layers define explicit cascade priority declared upfront in `src/styles/index.css`:

```css
@layer vendors, abstracts, base, layout, components, pages, themes;
```

Priority flows from lowest to highest:
1. `vendors/`: external fonts and third-party resets
2. `abstracts/`: design tokens and shared custom properties
3. `base/`: document defaults, typography foundations, and overflow safety
4. `layout/`: site navigation, shell, and footer chrome
5. `components/`: reusable documentation controls and preview blocks
6. `pages/`: page-specific layout compositions (homepage, documentation, lab)
7. `themes/`: Japanese typography and theme overrides

Higher layers consistently override lower layers without requiring specificity hacks or fragile import source-ordering.

## Entrypoints & Modular Barrels

- `index.css`: The primary site-wide entrypoint declaring layer order and importing folder barrels.
- `main.css`: Backwards-compatible proxy forwarding to `index.css`.
- Each folder (`abstracts/`, `vendors/`, `base/`, `layout/`, `components/`, `pages/`, `themes/`) contains an `index.css` barrel file encapsulating its internal partials.
- `layout-studies-entry.css`: Page-only aggregator for layout studies utilizing `@layer components, pages;`.
- `pages/_lab.css`: Imported only on the Composition Lab page.

**Important:** `koshi.css` is the distributable Kōshi grid API, not website art direction. Keep it independent from the website architecture.

The layout gallery uses `container: study / inline-size` on each preview. Slider changes update the canvas width, and container queries plus `cqi` typography adapt inside that canvas. Do not replace this with viewport-only `vw` font sizes, which do not respond to the slider.
