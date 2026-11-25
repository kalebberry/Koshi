# Benchmark Task 6: Diagnostic and Repair

## Prompt Given to Agent
```text
Below is a broken layout snippet exhibiting a severe layout defect.
Identify the root cause of the defect and provide the minimal, cleanest correction that resolves it without breaking adjacent elements.

Snippet:
<div class="kos-grid" kos-cols="12">
  <!-- Author intended this card to start at column 3 and span 4 columns -->
  <div class="card" kos-offset="2" style="grid-column: span 4;">
    <h3>Offset Card</h3>
    <p>This card is rendering at column line 1 instead of column line 3!</p>
  </div>
</div>
```

## Diagnostic Scenarios for Condition B/C/D & Condition A
- **Sub-task 6.1 (Offset Collision):** Shorthand `grid-column: span 4` resets `grid-column-start: 3` to `auto`. Correction: `grid-column-end: span 4` (or `kos-col-span="4"`).
- **Sub-task 6.2 (Unbounded Flex Growth):** A 4-column card inside `.kos-flex-grid` stretches across the entire row because `kos-grow="1"` was applied unnecessarily. Correction: Remove `kos-grow="1"`.
- **Sub-task 6.3 (Subgrid Alignment Failure):** Cards declare `kos-subgrid="rows"`, but child CTAs do not align because the card failed to declare `kos-row-span="3"`. Correction: Add `kos-row-span="3"`.
- **Sub-task 6.4 (Horizontal Overflow):** Mobile viewports have a horizontal scrollbar because an element has `style="width: 600px;"`. Correction: Replace with `max-width: 100%`.
