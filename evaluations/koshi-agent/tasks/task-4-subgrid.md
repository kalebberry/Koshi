# Benchmark Task 4: Subgrid Alignment

## Prompt Given to Agent
```text
Create a 3-card feature comparison row.
Requirements:
1. Three sibling cards positioned side-by-side on wide screens.
2. Each card contains an eyebrow header, a title, a description body, and a call-to-action button.
3. Card 1 has a short 1-line title and short description.
4. Card 2 has a long 3-line title and lengthy multi-line description.
5. Card 3 has a medium title and description.
6. Despite unequal text lengths, the title tracks, description tracks, and bottom CTA button areas MUST align horizontally across all three cards without using fixed pixel heights or JavaScript line-clamping.
7. Graceful mobile reflow to a single-column stack on compact screens.

Deliver clean semantic HTML and necessary CSS.
```

## Objective Browser & Code Assertions
- All three CTA buttons have identical top y-coordinates ($\Delta y \le 1.0\text{px}$) across cards on wide ($1200\text{px}$).
- Titles and descriptions align to shared grid track boundaries.
- No fixed pixel heights (e.g. `height: 400px`) used to force alignment.
- Zero horizontal overflow at $360\text{px}$.
