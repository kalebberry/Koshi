# Benchmark Task 2: Responsive Bento Composition

## Prompt Given to Agent
```text
Create a responsive Bento-style feature showcase section.
Requirements:
1. One primary dominant feature block (spanning multiple tracks or rows).
2. Two supporting secondary cards vertically stacked alongside the primary feature.
3. Unequal spatial emphasis reflecting primary vs secondary feature priority.
4. Clean responsive behavior: multi-column layout on desktop, stacking into a single column on compact screens.
5. Strict horizontal containment: no unintended horizontal scrollbars at 360px, 768px, or 1200px.

Deliver clean semantic HTML and necessary CSS.
```

## Objective Browser & Code Assertions
- Primary feature width $>$ secondary card width on wide ($1200\text{px}$).
- Secondary cards stack vertically on wide ($1200\text{px}$) while primary feature spans their height.
- All cards stack into a single column at $360\text{px}$.
- `scrollWidth <= clientWidth` across all widths.
