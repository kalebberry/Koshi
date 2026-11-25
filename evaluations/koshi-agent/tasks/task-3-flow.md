# Benchmark Task 3: Flexible Content Flow

## Prompt Given to Agent
```text
Create a content-driven wrapping tag/filter bar and action panel.
Requirements:
1. A collection of content-driven badges/tags that size according to their content and wrap naturally.
2. A structured card on the same line that has an explicit proportional basis (e.g. 4-column equivalent).
3. The proportional card must NOT greedily expand to fill the entire remaining row space; it must preserve unoccupied row space as intentional breathing room.
4. An optional primary action card that explicitly opts into growth to absorb available positive free space.
5. Items must wrap cleanly on narrow screens without horizontal overflow.

Deliver clean semantic HTML and necessary CSS.
```

## Objective Browser & Code Assertions
- Explicit proportional card does not stretch to 100% width on an incomplete row (preserves negative space).
- Explicit growth item expands to absorb positive free space.
- Natural wrapping occurs without horizontal scrollbars at $360\text{px}$.
