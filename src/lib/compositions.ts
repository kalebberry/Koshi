/**
 * Composition recipes are data structures representing production-ready layout archetypes.
 * The underlying grid attributes belong to Kōshi; the lab explores combinations for real websites.
 */

// -----------------------------------------------------------------------------
// Types & Interfaces
// -----------------------------------------------------------------------------

export type BlockKind = 'image' | 'text' | 'quote' | 'card' | 'stat' | 'space';
export type BlockHeight = 'short' | 'medium' | 'tall';
export type AspectRatio = '16/9' | '4/3' | '1/1' | 'golden' | 'silver' | '3/4';
export type CompositionCategory =
  | 'all'
  | 'hero'
  | 'features'
  | 'editorial'
  | 'gallery'
  | 'lattice';

export interface CardData {
  eyebrow?: string;
  title: string;
  description: string;
  cta?: string;
}

export interface StatData {
  value: string;
  label: string;
  note?: string;
}

export interface Block {
  span: number;
  kind: BlockKind;
  height?: BlockHeight;
  offset?: number;
  rowSpan?: number;
  ratio?: AspectRatio;
  subgrid?: 'rows' | 'cols' | 'both';
  title?: string;
  subtitle?: string;
  text?: string;
  quote?: string;
  author?: string;
  cardData?: CardData;
  statData?: StatData;
}

export interface Composition {
  id: string;
  title: string;
  category: Exclude<CompositionCategory, 'all'>;
  categoryLabel: string;
  signature: string;
  description: string;
  rows: Block[][];
}

export interface CategoryInfo {
  id: CompositionCategory;
  label: string;
  count: number;
}

// -----------------------------------------------------------------------------
// Recipe Construction Helpers
// -----------------------------------------------------------------------------

interface BlockOptions {
  height?: BlockHeight;
  offset?: number;
  rowSpan?: number;
  ratio?: AspectRatio;
  subgrid?: 'rows' | 'cols' | 'both';
  title?: string;
  subtitle?: string;
  text?: string;
  quote?: string;
  author?: string;
  cardData?: CardData;
  statData?: StatData;
}

const b = (span: number, kind: BlockKind, options: BlockOptions = {}): Block => ({
  span,
  kind,
  ...options,
});

// -----------------------------------------------------------------------------
// Curated 36 Production-Ready Website Compositions
// -----------------------------------------------------------------------------

export const recipes: Composition[] = [
  // ===========================================================================
  // 01. HEROES & MASTHEADS (6 Compositions)
  // ===========================================================================
  {
    id: 'hero-split-16-9',
    title: 'Cinema Split 7 : 5',
    category: 'hero',
    categoryLabel: 'Hero Masthead',
    signature: '7 : 5 · 16/9',
    description: 'Asymmetric landing hero pairing a 16:9 cinematic visual with lead narrative, eyebrow, and call to action.',
    rows: [
      [
        b(7, 'image', { ratio: '16/9', title: 'CINEMA FRAME 16:9' }),
        b(5, 'text', {
          subtitle: 'Architectural Lattice',
          title: 'Form Follows Proportion',
          text: 'Deriving modern interface harmony from classical lattice geometry and twelve fractional tracks.',
        }),
      ],
    ],
  },
  {
    id: 'hero-golden-masthead',
    title: 'Golden Masthead 8 : 4',
    category: 'hero',
    categoryLabel: 'Hero Masthead',
    signature: '8 : 4 · Golden',
    description: 'Bold 8-column masthead with Golden ratio (1:1.618) media, flanked by 4-column client quote and index.',
    rows: [
      [
        b(8, 'image', { ratio: 'golden', title: 'GOLDEN VISUAL 1:1.618' }),
        b(4, 'quote', {
          quote: 'Space is not emptiness; it is the structure that gives form meaning.',
          author: 'Kōshi Grid Manifesto',
        }),
      ],
    ],
  },
  {
    id: 'hero-cinema-banner',
    title: 'Cinematic Banner 12 / 4 : 4 : 4',
    category: 'hero',
    categoryLabel: 'Hero Masthead',
    signature: '12 / 4 : 4 : 4',
    description: 'Full-width 16:9 hero banner followed by a synchronized 3-column subgrid feature row.',
    rows: [
      [b(12, 'image', { ratio: '16/9', title: 'FULL-WIDTH CINEMATIC BANNER' })],
      [
        b(4, 'text', { subtitle: '01 / SYSTEM', title: 'Zero JS Runtime', text: 'Pure CSS Grid Level 2 with responsive container queries.' }),
        b(4, 'text', { subtitle: '02 / MATH', title: 'Exact Fractions', text: 'Gutter-aware calc expressions with zero fractional rounding jitter.' }),
        b(4, 'text', { subtitle: '03 / TOKYO', title: 'Hakugin-hi Ratio', text: 'Classic silver and golden ratios engineered for modern web design.' }),
      ],
    ],
  },
  {
    id: 'hero-narrative-silver',
    title: 'Hakugin-hi Hero 5 : 7',
    category: 'hero',
    categoryLabel: 'Hero Masthead',
    signature: '5 : 7 · Silver',
    description: 'Traditional Japanese Silver ratio (1:1.414) portrait frame anchored by a high-contrast editorial title.',
    rows: [
      [
        b(5, 'text', {
          subtitle: 'Design Standards',
          title: 'The Discipline of Yohaku',
          text: 'Intentional negative space that allows dense typographic structure to breathe gracefully.',
        }),
        b(7, 'image', { ratio: 'silver', title: 'HAKUGIN-HI SPECIMEN 1:1.414' }),
      ],
    ],
  },
  {
    id: 'hero-centered-focus',
    title: 'Centered Focus 8 col (Offset 2)',
    category: 'hero',
    categoryLabel: 'Hero Masthead',
    signature: 'Offset 2 · 8 col',
    description: 'Clean centered 8-column hero framed by symmetrical 2-column yohaku margins for calm authority.',
    rows: [
      [
        b(8, 'text', {
          offset: 2,
          subtitle: 'Editorial Specimen 01',
          title: 'Clarity Through Constraint',
          text: 'When every element aligns to a shared 12-track lattice, visual friction disappears.',
        }),
      ],
      [b(8, 'image', { offset: 2, ratio: '16/9', title: 'CENTERED CINEMA 16:9' })],
    ],
  },
  {
    id: 'hero-dual-frame',
    title: 'Comparative Dual 6 : 6',
    category: 'hero',
    categoryLabel: 'Hero Masthead',
    signature: '6 : 6 · 4/3',
    description: 'Symmetrical side-by-side 4:3 containers for product comparisons, light/dark modes, or case studies.',
    rows: [
      [
        b(6, 'image', { ratio: '4/3', title: 'SPECIMEN A · LIGHT' }),
        b(6, 'image', { ratio: '4/3', title: 'SPECIMEN B · DARK' }),
      ],
    ],
  },

  // ===========================================================================
  // 02. FEATURES & SUBGRID (7 Compositions)
  // ===========================================================================
  {
    id: 'feat-subgrid-triad',
    title: 'Subgrid Card Triad 4 : 4 : 4',
    category: 'features',
    categoryLabel: 'Feature Subgrid',
    signature: '4 : 4 : 4 · Subgrid',
    description: 'Three feature cards utilizing CSS Subgrid row tracks to lock headers, copy, and buttons to exact baselines.',
    rows: [
      [
        b(4, 'card', {
          subgrid: 'rows',
          rowSpan: 3,
          cardData: {
            eyebrow: 'Modular Track',
            title: 'Fluid Offset Math',
            description: 'Calculates fluid margins via clamp(1rem, 3.5vw, 3.5rem) without layout jitter.',
            cta: 'Read Specification →',
          },
        }),
        b(4, 'card', {
          subgrid: 'rows',
          rowSpan: 3,
          cardData: {
            eyebrow: 'Track Inheritance',
            title: 'Subgrid Rows',
            description: 'Child cards inherit parent grid rows so tags, titles, descriptions, and CTA links align horizontally across cards.',
            cta: 'Inspect Tracks →',
          },
        }),
        b(4, 'card', {
          subgrid: 'rows',
          rowSpan: 3,
          cardData: {
            eyebrow: 'Container Query',
            title: 'Tiered Collapse',
            description: 'Gracefully reflows below container widths into a clean single-column stack on mobile devices.',
            cta: 'View Responsive Demo →',
          },
        }),
      ],
    ],
  },
  {
    id: 'feat-service-quad',
    title: 'Service Quad 3 : 3 : 3 : 3',
    category: 'features',
    categoryLabel: 'Feature Subgrid',
    signature: '3 : 3 : 3 : 3',
    description: 'Four-column service breakdown where cards inherit subgrid tracks for symmetrical alignment.',
    rows: [
      [
        b(3, 'card', { subgrid: 'rows', cardData: { eyebrow: 'Core 01', title: 'Architecture', description: 'Structural layout systems for high-density applications.', cta: 'Learn More →' } }),
        b(3, 'card', { subgrid: 'rows', cardData: { eyebrow: 'Core 02', title: 'Typography', description: 'Synchronized vertical rhythm with zero runtime overhead.', cta: 'Learn More →' } }),
        b(3, 'card', { subgrid: 'rows', cardData: { eyebrow: 'Core 03', title: 'Chromatics', description: 'Calibrated palettes for high-contrast dark and light contexts.', cta: 'Learn More →' } }),
        b(3, 'card', { subgrid: 'rows', cardData: { eyebrow: 'Core 04', title: 'Collateral', description: 'Print and screen standards unified under one grid.', cta: 'Learn More →' } }),
      ],
    ],
  },
  {
    id: 'feat-spotlight-stack',
    title: 'Feature Spotlight 8 : 4 Stack',
    category: 'features',
    categoryLabel: 'Feature Subgrid',
    signature: '8 : 4 Stack',
    description: 'Dominant 8-column primary showcase card paired with 4-column stacked secondary feature cards.',
    rows: [
      [
        b(8, 'card', {
          subgrid: 'rows',
          rowSpan: 2,
          cardData: {
            eyebrow: 'FLAGSHIP CAPABILITY',
            title: 'Full Lattice Visualization',
            description: 'Interactive kos-debug visualizer projects cinnabar red lattice lines, column span badges, and offset indicators across the active composition.',
            cta: 'Launch Studio Visualizer →',
          },
        }),
        b(4, 'card', {
          cardData: {
            eyebrow: 'INTEGRATION',
            title: 'Astro & Vue Ready',
            description: 'First-class components with reactive previews and instant export.',
            cta: 'View Guide →',
          },
        }),
      ],
      [
        b(4, 'card', {
          offset: 8,
          cardData: {
            eyebrow: 'STANDARDS',
            title: 'Typed Attr Support',
            description: 'Progressive enhancement for CSS Values Level 5 typed attr() column spans.',
            cta: 'Check Browser Support →',
          },
        }),
      ],
    ],
  },
  {
    id: 'feat-comparison-dual',
    title: 'Deep Comparison 6 : 6',
    category: 'features',
    categoryLabel: 'Feature Subgrid',
    signature: '6 : 6 Dual',
    description: 'Two comprehensive comparison columns with subgrid-locked feature rows.',
    rows: [
      [
        b(6, 'card', {
          subgrid: 'rows',
          cardData: {
            eyebrow: 'OPEN SOURCE',
            title: 'Standard Edition',
            description: '12-track fluid CSS grid with basic responsive breakpoints, lightweight and dependency-free.',
            cta: 'Free Download',
          },
        }),
        b(6, 'card', {
          subgrid: 'rows',
          cardData: {
            eyebrow: 'ENTERPRISE / STUDIO',
            title: 'Studio Lattice',
            description: 'Complete subgrid inheritance, aspect ratio framing, cascade layer isolation, and debug visualizer.',
            cta: 'Get Started',
          },
        }),
      ],
    ],
  },
  {
    id: 'feat-alternating-pair',
    title: 'Alternating Feature Pair 5 : 7 / 7 : 5',
    category: 'features',
    categoryLabel: 'Feature Subgrid',
    signature: '5 : 7 / 7 : 5',
    description: 'Two-row rhythm alternating 1:1 square media with rich feature narrative.',
    rows: [
      [
        b(5, 'image', { ratio: '1/1', title: 'SQUARE 1:1' }),
        b(7, 'card', {
          cardData: {
            eyebrow: '01 / PRECISION',
            title: 'Zero Rounding Jitter',
            description: 'By maintaining fractional fr tracks, columns absorb sub-pixel rendering discrepancies smoothly across modern monitors.',
            cta: 'Inspect Math →',
          },
        }),
      ],
      [
        b(7, 'card', {
          cardData: {
            eyebrow: '02 / PERFORMANCE',
            title: 'Zero Runtime JavaScript',
            description: 'Styles compile into pure native CSS Grid rules inside the @layer kos-grid cascade layer without external dependencies.',
            cta: 'Benchmark Tests →',
          },
        }),
        b(5, 'image', { ratio: '1/1', title: 'SQUARE 1:1' }),
      ],
    ],
  },
  {
    id: 'feat-metrics-kpi',
    title: 'Key Metrics & KPIs 3 : 3 : 3 : 3',
    category: 'features',
    categoryLabel: 'Feature Subgrid',
    signature: '3 : 3 : 3 : 3 · KPI',
    description: 'Four high-impact quantitative stats highlighting proof points and performance.',
    rows: [
      [
        b(3, 'stat', { statData: { value: '0.00kb', label: 'Runtime JS', note: 'Pure CSS execution' } }),
        b(3, 'stat', { statData: { value: '12', label: 'Fractional Tracks', note: 'Harmonized lattice' } }),
        b(3, 'stat', { statData: { value: '1:1.414', label: 'Silver Ratio', note: 'Hakugin-hi proportion' } }),
        b(3, 'stat', { statData: { value: '100%', label: 'CLS Protected', note: 'Zero layout shift' } }),
      ],
    ],
  },
  {
    id: 'feat-product-showcase',
    title: 'Product Showcase 4 : 8 / 4 : 4 : 4',
    category: 'features',
    categoryLabel: 'Feature Subgrid',
    signature: '4 : 8 / 4 : 4 : 4',
    description: 'Product overview sidebar with hero visual, followed by a 3-part benefit row.',
    rows: [
      [
        b(4, 'text', { subtitle: 'PRODUCT OVERVIEW', title: 'Kōshi Grid Engine', text: 'A proportional layout system engineered for modern web design.' }),
        b(8, 'image', { ratio: '16/9', title: 'ENGINE SCHEMATIC 16:9' }),
      ],
      [
        b(4, 'card', { cardData: { eyebrow: 'SPEED', title: 'Instant Compile', description: 'Pre-processed cascade layers with zero overhead.' } }),
        b(4, 'card', { cardData: { eyebrow: 'PORTABLE', title: 'Framework Agnostic', description: 'Works with Astro, Vue, React, or plain HTML.' } }),
        b(4, 'card', { cardData: { eyebrow: 'A11Y', title: 'Semantic Flow', description: 'Preserves logical source order for screen readers.' } }),
      ],
    ],
  },

  // ===========================================================================
  // 03. EDITORIAL & CASE STUDIES (8 Compositions)
  // ===========================================================================
  {
    id: 'edit-magazine-asymmetric',
    title: 'Magazine Multi-Row 7 : 5',
    category: 'editorial',
    categoryLabel: 'Editorial Spread',
    signature: '7 : 5 · Multi-Row',
    description: 'Editorial magazine spread where a 4:3 feature visual spans 2 rows alongside headline and pull quote.',
    rows: [
      [
        b(7, 'image', { ratio: '4/3', rowSpan: 2, title: 'FEATURE PHOTO 4:3' }),
        b(5, 'text', { subtitle: 'ESSAY 01', title: 'The Space Between', text: 'In Japanese architecture, yohaku is not void—it is the active relationship between walls and lattice screens.' }),
      ],
      [
        b(5, 'quote', { offset: 7, quote: 'Proportion governs space before ornament arrives.', author: 'Kenzo Tange' }),
      ],
    ],
  },
  {
    id: 'edit-narrative-classic',
    title: 'Narrative Essay 4 : 8',
    category: 'editorial',
    categoryLabel: 'Editorial Spread',
    signature: '4 : 8 Narrative',
    description: 'Traditional Swiss editorial pairing a 4-column contextual margin with an 8-column longform essay.',
    rows: [
      [
        b(4, 'text', { subtitle: 'METADATA', title: 'Issue 04', text: 'Curated by Studio Eien · Tokyo / Zurich · Published November 2026' }),
        b(8, 'text', { subtitle: 'CHRONICLE', title: 'Geometry of the Modern Screen', text: 'The browser window has replaced the printed page as the primary surface of cultural transmission. Yet the fundamental rules of typographic hierarchy, line-height, and optical balance remain invariant across media.' }),
      ],
    ],
  },
  {
    id: 'edit-swiss-trio',
    title: 'Swiss Trio 3 : 6 : 3',
    category: 'editorial',
    categoryLabel: 'Editorial Spread',
    signature: '3 : 6 : 3 Proportions',
    description: 'Harmonious three-tier layout with metadata rail, central narrative column, and pull quote callout.',
    rows: [
      [
        b(3, 'text', { subtitle: 'SPEC', title: 'Archive 88', text: 'Vol. II · Track 12 · Architectural Standards' }),
        b(6, 'text', { subtitle: 'ESSAY', title: 'Lattice and Light', text: 'By subdividing space into twelve fractions, an infinite variety of asymmetric balances becomes mathematically disciplined.' }),
        b(3, 'quote', { quote: 'Simplicity is the resolution of complexity.', author: 'Dieter Rams' }),
      ],
    ],
  },
  {
    id: 'edit-case-study',
    title: 'Case Study Overview 5 : 7 / 12',
    category: 'editorial',
    categoryLabel: 'Editorial Spread',
    signature: '5 : 7 / 12',
    description: 'Structured project brief with 5-column problem statement, 7-column hero image, and full-bleed summary quote.',
    rows: [
      [
        b(5, 'text', { subtitle: 'CASE STUDY', title: 'Studio Identity 2026', text: 'How a traditional Tokyo studio transitioned their brand architecture into a modern responsive design system.' }),
        b(7, 'image', { ratio: '16/9', title: 'IDENTITY SPECIMEN 16:9' }),
      ],
      [
        b(12, 'quote', { quote: 'Kōshi allowed our design and engineering teams to speak the exact same language of fractional tracks.', author: 'Lead Architect, Studio Eien' }),
      ],
    ],
  },
  {
    id: 'edit-offset-flow',
    title: 'Offset Reading Flow 1 : 7 : 4',
    category: 'editorial',
    categoryLabel: 'Editorial Spread',
    signature: 'Offset 1 · 7 : 4',
    description: 'Offset 1-column margin leading into a 7-column readable text body and 4-column margin annotations.',
    rows: [
      [
        b(7, 'text', { offset: 1, subtitle: 'READING COLUMN', title: 'Typographic Measure', text: 'Maintaining an optimal 65-character line length while aligning marginal notes to the strict lattice.' }),
        b(4, 'text', { subtitle: 'MARGIN NOTES', title: 'Field Annotations', text: 'Secondary commentary lines up directly with primary paragraph breaks via shared container tracks.' }),
      ],
    ],
  },
  {
    id: 'edit-double-quote',
    title: 'Dual Quote Spread 4 : 5 : 3',
    category: 'editorial',
    categoryLabel: 'Editorial Spread',
    signature: '4 : 5 : 3 Spread',
    description: 'Three-way editorial balance between a prominent pull quote, central story, and Silver ratio portrait visual.',
    rows: [
      [
        b(4, 'quote', { quote: 'Order is not pressure; order is liberation.', author: 'Josef Müller-Brockmann' }),
        b(5, 'text', { subtitle: 'THEORY', title: 'The Grid as Attitude', text: 'A grid system creates clarity, concentration, and objectivity in visual communication.' }),
        b(3, 'image', { ratio: 'silver', title: 'PORTRAIT HAKUGIN-HI' }),
      ],
    ],
  },
  {
    id: 'edit-longform-chronicle',
    title: 'Alternating Chronicle 8 : 4 / 4 : 8',
    category: 'editorial',
    categoryLabel: 'Editorial Spread',
    signature: '8 : 4 / 4 : 8',
    description: 'Two-stage editorial spread that flips text and media orientation across sequential sections.',
    rows: [
      [
        b(8, 'text', { subtitle: 'PART I', title: 'The Origins of the Lattice', text: 'From traditional wooden machiya townhouses in Kyoto to modern responsive viewport geometry.' }),
        b(4, 'image', { ratio: '4/3', title: 'KYOTO SPECIMEN 4:3' }),
      ],
      [
        b(4, 'image', { ratio: '4/3', title: 'ZURICH SPECIMEN 4:3' }),
        b(8, 'text', { subtitle: 'PART II', title: 'The Swiss Rationalists', text: 'How Max Bill, Emil Ruder, and Arminio Frutiger proved that geometric rigor elevates emotional expression.' }),
      ],
    ],
  },
  {
    id: 'edit-archival-specimen',
    title: 'Archival Index 3 : 9 / 6 : 6',
    category: 'editorial',
    categoryLabel: 'Editorial Spread',
    signature: '3 : 9 / 6 : 6',
    description: 'Curator index rail alongside primary exhibit visual, followed by dual comparison analysis.',
    rows: [
      [
        b(3, 'text', { subtitle: 'INDEX', title: 'Specimen Catalog', text: 'CAT-2026-X12 · Lattice System · Permanent Collection' }),
        b(9, 'image', { ratio: '16/9', title: 'MAIN EXHIBIT VISUAL 16:9' }),
      ],
      [
        b(6, 'text', { subtitle: 'TECHNICAL NOTE', title: 'Coordinate Derivation', text: 'Every column margin is computed with zero CSS magic numbers.' }),
        b(6, 'text', { subtitle: 'CURATOR SUMMARY', title: 'Structural Integrity', text: 'Container queries ensure seamless mobile reading without layout reflow.' }),
      ],
    ],
  },

  // ===========================================================================
  // 04. PORTFOLIO & MEDIA GALLERIES (8 Compositions)
  // ===========================================================================
  {
    id: 'gal-asymmetric-mosaic',
    title: 'Asymmetric Ratio Mosaic 8 : 4 / 4 : 8',
    category: 'gallery',
    categoryLabel: 'Media & Ratios',
    signature: '8 (16/9) : 4 / 4 (Silver) : 8',
    description: 'Harmonized ratio mosaic combining 16:9 cinema, 1:1 square, Silver ratio portrait, and narrative card.',
    rows: [
      [
        b(8, 'image', { ratio: '16/9', title: 'CINEMA 16:9' }),
        b(4, 'image', { ratio: '1/1', title: 'SQUARE 1:1' }),
      ],
      [
        b(4, 'image', { ratio: 'silver', title: 'SILVER 1:1.414' }),
        b(8, 'text', { subtitle: 'CURATION', title: 'Ratio Harmony in Motion', text: 'Aspect ratios enforce proportional discipline before images finish loading.' }),
      ],
    ],
  },
  {
    id: 'gal-hakugin-dual',
    title: 'Hakugin-hi Dual Portraits 6 : 6',
    category: 'gallery',
    categoryLabel: 'Media & Ratios',
    signature: '6 : 6 · Silver (1:1.414)',
    description: 'Two side-by-side Japanese Silver ratio (1:1.414) portrait frames designed for architectural photography.',
    rows: [
      [
        b(6, 'image', { ratio: 'silver', title: 'HAKUGIN-HI NORTH 1:1.414' }),
        b(6, 'image', { ratio: 'silver', title: 'HAKUGIN-HI SOUTH 1:1.414' }),
      ],
    ],
  },
  {
    id: 'gal-golden-feature',
    title: 'Golden Ratio Feature 7 : 5',
    category: 'gallery',
    categoryLabel: 'Media & Ratios',
    signature: '7 (Golden) : 5',
    description: 'Golden ratio (1:1.618) media frame anchored by a high-density project breakdown.',
    rows: [
      [
        b(7, 'image', { ratio: 'golden', title: 'GOLDEN RATIO 1:1.618' }),
        b(5, 'card', { cardData: { eyebrow: 'EXHIBIT 08', title: 'Geometric Derivation', description: 'Phi ratio governs spatial perception in natural forms and classical monuments.', cta: 'View Project Files →' } }),
      ],
    ],
  },
  {
    id: 'gal-quad-squares',
    title: 'Quad Square Tiles 4 × 3 col',
    category: 'gallery',
    categoryLabel: 'Media & Ratios',
    signature: '4 × 3 col · 1/1',
    description: 'Four symmetrical 1:1 square tiles for portfolio showcases, product catalogs, or team galleries.',
    rows: [
      [
        b(3, 'image', { ratio: '1/1', title: 'SQUARE 01' }),
        b(3, 'image', { ratio: '1/1', title: 'SQUARE 02' }),
        b(3, 'image', { ratio: '1/1', title: 'SQUARE 03' }),
        b(3, 'image', { ratio: '1/1', title: 'SQUARE 04' }),
      ],
    ],
  },
  {
    id: 'gal-cinematic-rail',
    title: 'Cinematic Visual & Rail 9 : 3',
    category: 'gallery',
    categoryLabel: 'Media & Ratios',
    signature: '9 (16/9) : 3 Rail',
    description: 'Dominant 9-column 16:9 focal image accompanied by a 3-column vertical thumbnail stack.',
    rows: [
      [
        b(9, 'image', { ratio: '16/9', rowSpan: 2, title: 'FEATURE BROADCAST 16:9' }),
        b(3, 'image', { ratio: '1/1', title: 'THUMBNAIL A' }),
      ],
      [
        b(3, 'image', { offset: 9, ratio: '1/1', title: 'THUMBNAIL B' }),
      ],
    ],
  },
  {
    id: 'gal-triple-rhythm',
    title: 'Triple Ratio Rhythm 4 : 4 : 4',
    category: 'gallery',
    categoryLabel: 'Media & Ratios',
    signature: '16/9 : 1/1 : 3/4',
    description: 'Three distinct aspect ratios (16:9, 1:1 square, 3:4 portrait) side-by-side in balanced tension.',
    rows: [
      [
        b(4, 'image', { ratio: '16/9', title: 'LANDSCAPE 16:9' }),
        b(4, 'image', { ratio: '1/1', title: 'SQUARE 1:1' }),
        b(4, 'image', { ratio: '3/4', title: 'PORTRAIT 3:4' }),
      ],
    ],
  },
  {
    id: 'gal-full-hero-split',
    title: 'Golden Hero & Split 12 / 6 : 6',
    category: 'gallery',
    categoryLabel: 'Media & Ratios',
    signature: '12 (Golden) / 6 : 6',
    description: 'Expansive Golden ratio hero container followed by dual 4:3 project detail shots.',
    rows: [
      [b(12, 'image', { ratio: 'golden', title: 'EXPANSIVE GOLDEN HERO 1:1.618' })],
      [
        b(6, 'image', { ratio: '4/3', title: 'DETAIL A · 4:3' }),
        b(6, 'image', { ratio: '4/3', title: 'DETAIL B · 4:3' }),
      ],
    ],
  },
  {
    id: 'gal-curated-photo-essay',
    title: 'Photo Essay Duo 5 : 7 / 8 : 4',
    category: 'gallery',
    categoryLabel: 'Media & Ratios',
    signature: '5 (Silver) : 7 / 8 : 4',
    description: 'Juxtaposition of Silver ratio portrait and 16:9 landscape, resolved with narrative summary.',
    rows: [
      [
        b(5, 'image', { ratio: 'silver', title: 'SILVER 1:1.414' }),
        b(7, 'image', { ratio: '16/9', title: 'CINEMA 16:9' }),
      ],
      [
        b(8, 'text', { subtitle: 'PHOTO ESSAY', title: 'Light in Architecture', text: 'Capturing structural shadow play across concrete lattice surfaces.' }),
        b(4, 'quote', { quote: 'Light is the creator of architectural space.', author: 'Le Corbusier' }),
      ],
    ],
  },

  // ===========================================================================
  // 05. JAPANESE LATTICE & YOHAKU (7 Compositions)
  // ===========================================================================
  {
    id: 'lat-tatami-modular',
    title: 'Tatami Modular Spread 2 : 8 : 2',
    category: 'lattice',
    categoryLabel: 'Lattice & Yohaku',
    signature: 'Offset 2 · 8 col · 1:2',
    description: 'Traditional Japanese Tatami layout with symmetrical 2-column yohaku gutters centering an 8-column visual.',
    rows: [
      [b(8, 'image', { offset: 2, ratio: 'golden', title: 'TATAMI PROPORTION 1:2' })],
      [b(8, 'text', { offset: 2, subtitle: 'YOHAKU DISCIPLINE', title: 'Negative Space as Anchor', text: 'In Tatami mat arrangement, the margin defines the sanctuary within.' })],
    ],
  },
  {
    id: 'lat-asymmetric-yohaku',
    title: 'Asymmetric Yohaku 1 : 6 / 1 : 4',
    category: 'lattice',
    categoryLabel: 'Lattice & Yohaku',
    signature: 'Offset 1 · 6 / Offset 8 · 4',
    description: 'Offset margins creating rhythmic breathing space between narrative text and visual specimen.',
    rows: [
      [
        b(6, 'text', { offset: 1, subtitle: 'STUDY 01', title: 'Asymmetric Balance', text: 'By offsetting the left margin by one track, the composition gains momentum.' }),
        b(4, 'image', { offset: 8, ratio: '4/3', title: 'OFFSET SPECIMEN 4:3' }),
      ],
    ],
  },
  {
    id: 'lat-negative-anchor',
    title: 'Negative Space Channel 5 : [2] : 5',
    category: 'lattice',
    categoryLabel: 'Lattice & Yohaku',
    signature: '5 : [Void] : 5',
    description: 'Deliberate two-column empty void dividing two high-contrast content anchors.',
    rows: [
      [
        b(5, 'card', { cardData: { eyebrow: 'ANCHOR WEST', title: 'Structural Anchor', description: 'Firmly grounded in 5 fractional tracks on the left boundary.' } }),
        b(5, 'card', { offset: 7, cardData: { eyebrow: 'ANCHOR EAST', title: 'Counterbalance', description: 'Mirrored across the intentional 2-column negative space channel.' } }),
      ],
    ],
  },
  {
    id: 'lat-blueprint-coord',
    title: 'Blueprint & Coordinate 3 : [1] : 8',
    category: 'lattice',
    categoryLabel: 'Lattice & Yohaku',
    signature: '3 : [1] : 8 Coord',
    description: 'Technical coordinate index separated by a single-column gutter from an 8-column schematic.',
    rows: [
      [
        b(3, 'text', { subtitle: 'INDEX', title: 'LAT: 35.6764° N', text: 'Tokyo Coordinates · Pure CSS Lattice Specification 2026' }),
        b(8, 'image', { offset: 4, ratio: '16/9', title: 'BLUEPRINT LATTICE 16:9' }),
      ],
    ],
  },
  {
    id: 'lat-floating-island',
    title: 'Floating Island 3 : 6 : 3 / 12',
    category: 'lattice',
    categoryLabel: 'Lattice & Yohaku',
    signature: 'Offset 3 · 6 col / 12',
    description: 'Centered 6-column floating island framed by 3-column margins on both sides, anchored by a bottom footer.',
    rows: [
      [
        b(6, 'text', { offset: 3, subtitle: 'MEDITATION', title: 'The Quiet Screen', text: 'Restraint in layout communicates higher confidence than edge-to-edge saturation.' }),
      ],
      [b(12, 'quote', { quote: 'Less, but better.', author: 'Dieter Rams' })],
    ],
  },
  {
    id: 'lat-kanji-specimen',
    title: 'Lattice Mark & Specimen 4 : 8',
    category: 'lattice',
    categoryLabel: 'Lattice & Yohaku',
    signature: '4 : 8 Mark Specimen',
    description: 'Japanese kanji mark card paired with 8-column architectural typography specimen.',
    rows: [
      [
        b(4, 'card', { cardData: { eyebrow: 'KANJI MARK', title: '格子 · Kōshi', description: 'Traditional Japanese lattice geometry translated into modern CSS Grid fractional tracks.' } }),
        b(8, 'text', { subtitle: 'TYPOGRAPHIC SPECIMEN', title: 'Proportional Grid Standards', text: 'A system where line-heights, column spans, and margins synchronize across viewports.' }),
      ],
    ],
  },
  {
    id: 'lat-staggered-duet',
    title: 'Staggered Tatami Duet 1:5 / 6:5',
    category: 'lattice',
    categoryLabel: 'Lattice & Yohaku',
    signature: 'Offset 1 (5) / Offset 6 (5)',
    description: 'Diagonally staggered cards creating a dynamic visual zigzag across the 12-track lattice.',
    rows: [
      [
        b(5, 'card', { offset: 1, cardData: { eyebrow: 'PHASE 01', title: 'Upper Left Anchor', description: 'Positioned at track 2, spanning 5 columns.' } }),
      ],
      [
        b(5, 'card', { offset: 6, cardData: { eyebrow: 'PHASE 02', title: 'Lower Right Counter', description: 'Positioned at track 7, spanning 5 columns to complete the balance.' } }),
      ],
    ],
  },
];

// -----------------------------------------------------------------------------
// Category Helpers & Query Methods
// -----------------------------------------------------------------------------

export const CATEGORIES: { id: CompositionCategory; label: string }[] = [
  { id: 'all', label: 'All Studies' },
  { id: 'hero', label: 'Heroes & Mastheads' },
  { id: 'features', label: 'Feature Subgrids' },
  { id: 'editorial', label: 'Editorial Spreads' },
  { id: 'gallery', label: 'Media & Ratios' },
  { id: 'lattice', label: 'Lattice & Yohaku' },
];

export function getCategoryCounts(): CategoryInfo[] {
  return CATEGORIES.map((cat) => {
    if (cat.id === 'all') {
      return { ...cat, count: recipes.length };
    }
    const count = recipes.filter((r) => r.category === cat.id).length;
    return { ...cat, count };
  });
}

// -----------------------------------------------------------------------------
// Randomization & Generation
// -----------------------------------------------------------------------------

function rng(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state += 0x6d2b79f5;
    let x = state;
    x = Math.imul(x ^ (x >>> 15), x | 1);
    x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Generate a deterministic batch of editorial compositions for the Composition Lab,
 * optionally filtered by category.
 */
export function generateCompositions(
  batch: number,
  category: CompositionCategory = 'all',
  count = 12
): Composition[] {
  const pool = category === 'all'
    ? recipes
    : recipes.filter((r) => r.category === category);

  if (pool.length === 0) return [];

  // When viewing a category, if batch === 0, keep curated ordering for instant client browsing
  if (batch === 0) {
    return pool.slice(0, count).map((item) => ({
      ...item,
      rows: item.rows.map((row) => row.map((block) => ({ ...block }))),
    }));
  }

  const random = rng(batch * 104729 + 17);
  const indices = pool.map((_, i) => i);

  // Fisher-Yates shuffle using seeded RNG
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [indices[i], indices[j]] = [indices[j]!, indices[i]!];
  }

  return indices.slice(0, Math.min(count, pool.length)).map((idx) => {
    const item = pool[idx]!;
    return {
      ...item,
      rows: item.rows.map((row) => row.map((block) => ({ ...block }))),
    };
  });
}

/**
 * Human-readable signature summarizing the spans of a composition.
 */
export function studySignature(composition: Composition): string {
  return composition.signature;
}
