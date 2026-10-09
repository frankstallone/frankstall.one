---
target: homepage
total_score: 23
p0_count: 0
p1_count: 3
timestamp: 2026-07-14T00-05-37Z
slug: src-pages-index-astro
---
## Design Health Score

| # | Heuristic | Score | Key issue |
|---|---|---:|---|
| 1 | Visibility of System Status | 1 | The contact form has no authored pending, success, or failure state. |
| 2 | Match System / Real World | 3 | The voice is conversational, but terms such as “SaaS,” “0 to 1,” and “lab environments” assume insider knowledge. |
| 3 | User Control and Freedom | 3 | Navigation is easy to escape and a skip link exists, but the autoplaying portfolio video has no pause control. |
| 4 | Consistency and Standards | 3 | The visual system is cohesive; external and social-link accessible names are inconsistent. |
| 5 | Error Prevention | 2 | Native validation and a honeypot help, but required/optional cues, autocomplete, and privacy reassurance are absent. |
| 6 | Recognition Rather Than Recall | 3 | Major destinations are visible and text-labeled; several social/external links lose their purpose for assistive technology. |
| 7 | Flexibility and Efficiency | 2 | Keyboard foundations are sound, but the mobile journey is long and has undersized link targets. |
| 8 | Aesthetic and Minimalist Design | 3 | Strong hierarchy and restraint are weakened by repetitive numbered rails, a timid palette, and thin portfolio proof. |
| 9 | Error Recognition and Recovery | 1 | There is no authored inline error copy, recovery guidance, preserved-state promise, or visible confirmation. |
| 10 | Help and Documentation | 2 | Contact and accessibility content exist, but the form gives no response-time, privacy, submission, or troubleshooting guidance. |
| **Total** |  | **23/40** | **Acceptable — visually solid, but conversion and form experience need significant work.** |

## Anti-Patterns Verdict

The page passes the obvious AI-slop test, but only narrowly. The Future display face, custom wordmark, portrait, blunt hero line, and disciplined grid make it feel authored. It does not resemble a generated card-grid landing page.

It does fail the inverse distinctiveness test. “A minimalist product designer portfolio with an oversized geometric headline, numbered sections, neutral palette, and one indigo accent” describes a saturated portfolio lane. The repeated 01–04 section rails are attractive, but they behave like scaffolding more than brand expression. The sequence—hero, writing, biography, work, contact—is safe rather than unmistakable.

The deterministic scan returned zero findings for `src/pages/index.astro`. It did not flag any banned pattern or code-level design smell. This does not invalidate the design review: the scanner only inspected the page file, while much of the interface lives in imported components and CSS. Browser fallback found no console warnings or errors. Mutable script injection was blocked by browser security policy, so no reliable visual overlay was created.

## Overall Impression

The opening line is the page’s clearest piece of positioning and its strongest emotional peak. The page then makes visitors read essays and biography before it proves the work, so the new promise is not paid off quickly enough. The single biggest opportunity is to make the page behave like evidence for “I make tools”: selected work should arrive immediately after the hero, with outcomes and artifacts that make the claim undeniable.

## What’s Working

1. **A real typographic identity.** Future’s alternate glyphs, the custom wordmark, and the large hero avoid the default Inter/Fraunces portfolio look.
2. **Excellent structural discipline.** The three-column composition scans quickly, collapses cleanly on mobile, and avoids card clutter.
3. **Strong accessibility foundations.** Semantic headings, visible labels, native form controls, a skip link, global focus treatment, meaningful portrait alt text, and reduced-motion handling are present.

## Cognitive Load and Emotional Journey

The page has moderate cognitive load: two of eight checklist items fail.

- **Single focus fails.** A prospective client must infer whether this is a writing site, personal archive, consultancy funnel, or portfolio. The hero has no supporting proposition or action, and the first section prioritizes essays.
- **Minimal choices fails at the end.** The footer presents seven navigation links and five social links—twelve adjacent exits—after the visitor reaches the conversion endpoint.

Chunking, grouping, hierarchy, sequential focus, working-memory demands, and progressive disclosure are otherwise strong.

The emotional journey begins with a confident peak, falls immediately because the claim has no explanation or CTA, recovers through thoughtful writing and human biography, then underdelivers at the proof and contact moments. The peak-end rule is inverted: the opening is memorable; the ending is operational and uncertain.

## Priority Issues

### [P1] Portfolio proof arrives too late

**Why it matters:** A prospective client cannot validate expertise quickly. “Recent posts” is the first numbered section; selected work arrives third and contains only one project.

**Fix:** Put selected work directly after the hero. Show two or three projects with role, problem, measurable outcome, and one decisive artifact each. Move writing below proof and use About as the trust bridge before Contact.

**Suggested command:** `$impeccable shape`

### [P1] The contact form has no authored feedback or reassurance

**Why it matters:** Contact is the highest-stakes action. Posting to `/` without pending, success, or failure feedback can look like nothing happened and encourage duplicate submissions.

**Fix:** Add pending, inline validation, preserved input on failure, explicit success confirmation, and a fallback email. Rename “Submit” to “Send message,” mark Phone as optional, add autocomplete, state a response-time expectation, and include a short privacy reassurance.

**Suggested command:** `$impeccable harden`

### [P1] External and social links lose their purpose for assistive technology

**Why it matters:** `aria-label="Opens a new tab"` replaces the visible Designzen link’s meaningful name. Some social links expose no accessible name, so screen-reader users hear behavior or nothing instead of destination.

**Fix:** Preserve purpose in every accessible name and treat “opens in a new tab” as supplementary information. Add explicit accessible names for every social destination.

**Suggested command:** `$impeccable audit`

### [P2] The brand promise is memorable but too abstract to convert

**Why it matters:** “I make tools” does not tell a first-time visitor what Frank does, whom he helps, or why he is credible. Supporting copy uses generic portfolio language such as “stellar user experiences” and “multiple team stakeholders were in alignment.”

**Fix:** Keep the lever line as the expressive headline, then add a precise descriptor with role, audience, specialty, and evidence. Add “See selected work” as the primary action and replace generic process claims with outcomes.

**Suggested command:** `$impeccable clarify`

### [P2] Mobile targets and first-load motion need refinement

**Why it matters:** At 390px, header and footer links are materially shorter than a comfortable 44px touch target. Hero text starts invisible and spends 1.2 seconds blurring into view, briefly leaving the first viewport blank. The portfolio video autoplays without a pause control.

**Fix:** Increase hit areas without enlarging visible type, shorten the hero reveal to roughly 350–500ms while keeping text visible by default, and provide a pause affordance or respect reduced-motion/data preferences for autoplay.

**Suggested commands:** `$impeccable adapt`, then `$impeccable animate`

## Persona Red Flags

### Jordan — First-timer

- The hero is striking, but Jordan cannot tell whether Frank is a designer, developer, consultant, toolmaker, or writer.
- No hero action points toward work or collaboration; the first choice is between essays.
- “SaaS,” “0 to 1,” “Ascent Design System,” and “lab environments” require insider interpretation.
- The consultancy link and generic contact form create two conversion paths without explaining which is appropriate.

### Riley — Stress tester

- The form has no authored pending, success, server-failure, duplicate-submit, or recovery state.
- Required inputs are technically constrained but not visibly marked; Phone is not identified as optional.
- No response-time, privacy, or data-use statement supports the form promise.
- The autoplay loop has no visible control or authored failure behavior.

### Casey — Distracted mobile visitor

- The page is roughly 4,232px tall at 390px; portfolio proof appears after writing, biography, and a large portrait.
- Header and footer links have undersized touch areas.
- The hero can remain visually absent during its long first-load reveal.
- The form asks for four fields without autocomplete cues, then the page ends with twelve competing footer destinations.

## Minor Observations

- “I am working with a limited availability” should be “I have limited availability for consulting.”
- The portfolio category line ends with a stray comma.
- “1 of 5” implies carousel or progress behavior that the homepage does not provide.
- Repeated “Read more…” links duplicate each article-title destination.
- The mobile portrait creates warmth but also a long visual pause before Portfolio.
- Nearly the entire page uses `gray-100`; the broader palette does little brand work beyond indigo numerals.
- Section numbers appear decorative; if they do not convey a meaningful sequence, hide them from assistive technology.

## Questions to Consider

- If a client gives Frank fifteen seconds, should they encounter an essay title or evidence that he can solve their product problem?
- Is “I make tools” the proposition, or the poetic line above a more specific proposition?
- Why does the page claim five portfolio pieces but show only one?
- What would make this feel unmistakably Frank rather than like an excellent minimalist designer portfolio?
- Is the contact section one action or two businesses competing for the same visitor?
- Could the end deliver a stronger emotional payoff than a directory of twelve links?
