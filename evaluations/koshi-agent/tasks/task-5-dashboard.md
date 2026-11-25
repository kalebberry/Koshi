# Benchmark Task 5: Container-Responsive Dashboard

## Prompt Given to Agent
```text
Create a reusable dashboard component that adapts to its allocated container width, independently of the global browser viewport.
Requirements:
1. Navigation / filter rail paired with a primary content panel.
2. Nested data grid or statistics cards within the main content panel.
3. The component must adapt based on its CONTAINER size, not global viewport media queries (e.g., when embedded inside a narrow 400px sidebar in a 1440px desktop viewport, it must display in compact stacked mode).
4. Full responsive containment without overflow at container widths 360px, 768px, and 1200px.

Deliver clean semantic HTML and necessary CSS.
```

## Objective Browser & Code Assertions
- In a wide viewport ($1200\text{px}$) inside a narrow container ($360\text{px}$), the component renders in compact stacked layout.
- In a wide container ($1200\text{px}$), the component renders in multi-column layout.
- Container query mechanism (`@container`, `container-type: inline-size`) is used rather than purely viewport `@media`.
- Zero horizontal overflow.
