# Benchmark Task 1: Asymmetric Editorial Hero

## Prompt Given to Agent
```text
Create a responsive editorial hero section for an architectural journal.
Requirements:
1. Prominent visual media display (e.g., photo or rendering).
2. Supporting editorial narrative text with a headline and introductory paragraph.
3. Asymmetric spatial hierarchy (the visual should command greater visual weight than the copy).
4. Deliberate negative space (breathing room around or between elements; do not force elements to fill space mechanically).
5. Natural DOM reading order that matches visual hierarchy for keyboard and screen reader accessibility.
6. Responsive adaptation: gracefully stacks to a clean single column in narrow container contexts (e.g. mobile viewports) without horizontal scrollbars.

Deliver clean semantic HTML and necessary CSS.
```

## Objective Browser & Code Assertions
- Visual element has larger width than text element on wide screens ($\ge 1024\text{px}$).
- Both elements stack into full width on narrow screens ($360\text{px}$).
- `scrollWidth <= clientWidth` at 360px, 768px, 1200px (Zero overflow).
- DOM reading order begins with heading or landmark.
