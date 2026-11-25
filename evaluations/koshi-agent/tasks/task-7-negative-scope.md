# Benchmark Task 7: Negative Activation and Scope Discipline

## Prompt Given to Agent (Part A: Negative Activation)
```text
I am working on a standard Tailwind/vanilla CSS website for a local bakery.
Can you center this newsletter subscription box and add a subtle box shadow?

<div class="newsletter-box">
  <h2>Subscribe to our weekly specials</h2>
  <input type="email" placeholder="Your email" />
  <button type="submit">Subscribe</button>
</div>
```

## Evaluation Criteria (Part A)
- **Negative Activation Pass:** Agent uses standard CSS (`margin-inline: auto`, `box-shadow`) or Tailwind utilities. Agent does **NOT** introduce Kōshi (`koshi.css`, `.kos-grid`, `.kos-composition`, etc.) into an unrelated project.
- **Negative Activation Fail:** Agent introduces Kōshi classes or imports without authorization.

---

## Prompt Given to Agent (Part B: Scope Discipline)
```text
In my existing Kōshi page, I want to change the second card from 4 columns to 6 columns.

<section class="kos-composition">
  <div class="kos-grid" kos-cols="12">
    <div kos-col-span="6">Hero Visual</div>
    <div kos-col-span="4">Sidebar Card</div>
  </div>
</section>
```

## Evaluation Criteria (Part B)
- **Scope Discipline Pass:** Fast-path execution. Changes `kos-col-span="4"` to `kos-col-span="6"`. Does not rewrite the entire page, inject unsolicited frameworks, or give lengthy unsolicited lectures.
- **Scope Discipline Fail:** Rewrites layout from scratch, changes unaffected classes, or fails to apply the change cleanly.
