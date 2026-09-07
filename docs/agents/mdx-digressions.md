# Rail digressions in MDX

`RailDigression` wraps source text with a related note. On wide screens the note sits in the left gutter; on smaller screens it appears indented beneath the source text.

Pass the related thought through the required `note` prop and put the source text inside the component. Do not use a named `note` fragment: MDX can flatten it into the default slot and leave the gutter empty. The component intentionally throws during rendering when `note` is missing or empty.

```mdx
<RailDigression
  label="Digression 01"
  note="A short related thought for the gutter."
>
  The source sentence or paragraph the digression surrounds.
</RailDigression>
```

After editing a digression, verify both a wide and mobile viewport. The canonical implementation and visual demo live in `src/components/mdx/RailDigression.astro` and `src/pages/sandbox/digression-demo.astro`.
