---
isDraft: true
title: 'Taste is trained judgment'
subtitle: 'Taste, craft, and leverage, part 1'
publishDate: 04-26-2026
description: 'AI can generate polished screens quickly, but taste is the trained judgment that helps us see what is actually good.'
---

Lately, when I'm building apps with AI in the loop, I keep seeing the same thing. AI can generate screens that *look* finished.

That sentence still feels strange to write, but it's true. You can ask a model to create a dashboard, a settings page, a workflow, a form, or a dozen versions of the same product screen. In seconds, you get something that compiles, renders, has hover states, and looks close enough.

For a minute, it can feel like real progress.

But polished looking is not the same as good.

That's the shift I keep running into. When production gets cheap, the hard part becomes deciding what deserves to ship.

I think that's why taste has become such a loud topic again. People are arguing about whether taste is the new core skill for the AI era or whether taste has always mattered. I think both sides are right.

Taste is newly visible because AI made production cheap. But taste itself is not new. It has always been the difference between something that merely works and something that feels right.

I don't know that I ever thought taste was fixed, but I also don't think I understood how much it could be cultivated. The more product work I've done, and the more AI generated work I've reviewed, the more obvious that feels.

The mistake is treating taste like a mystical trait. Like some people are born with good taste and everyone else is out of luck.

I don't buy that. Taste is trained judgment.

## Taste is not preference

Preference is personal. Taste is judgment.

The distinction matters because preference ends the conversation. "I like it" and "I don't like it" can both be true, but they don't give a team much to work with. Taste has to go further. It has to explain why something works, why something doesn't, and what would make it better.

Preference says:

> I like this card layout.

Taste says:

> This card layout works because the hierarchy matches the user's decision path. The most important information is scannable first, the secondary details are available without competing, and the action is placed where the user naturally expects to act.

That's a different level of conversation.

Teams can't scale "I like it." Teams can scale reasoning, shared language, and principles. But if taste stays trapped inside personal preference, every design conversation becomes a debate over vibes.

That's where teams get stuck. "Can we make this pop?" "It feels too flat." "Can we add more color?" None of those comments are wrong, exactly. They are just incomplete. The better question is: what problem are we trying to solve?

Are we trying to create emphasis? Reduce hesitation? Make the next action clearer? Increase trust? Make the interface feel more precise?

That's when taste gets useful. It gives the reaction somewhere to go.

This isn't a new idea. David Hume wrote about taste as something improved through practice and comparison in [_Of the Standard of Taste_](https://sourcebooks.fordham.edu/mod/1760hume-taste.asp). Dieter Rams made it feel more practical for designers with principles like ["good design is as little design as possible"](https://www.vitsoe.com/us/about/good-design).

That is the version of taste I mean here. Not personality. Not instinct alone. Trained judgment formed through exposure, comparison, critique, and repetition.

## Before you can judge, you have to see

The first step in developing taste is not making things. It's seeing things.

That sounds obvious, but most of us don't really see what is in front of us. We glance. We recognize. We categorize. We move on.

This happens constantly when reviewing AI generated product work.

A list gets a count it doesn't need. A quiet action gets an icon. A section gets a new color just so it feels different. A dense settings area gets the same breathing room as a simple empty state. An existing component gets extra class names even though the canonical version already looks good without overrides.

Technically, the screen renders. The component works. The acceptance criteria are met. The ticket moves forward.

But did anyone really look at it?

Did anyone notice where the eye goes first? Did anyone notice that the count pulls attention away from the list, that the icon doesn't clarify the action, that the spacing works in one section but falls apart when the density changes?

That's the gap between functional and crafted.

There's an [old story about Louis Agassiz](https://en.wikipedia.org/wiki/Parable_of_the_Sunfish), a naturalist at Harvard, giving a student a fish and telling him to keep looking at it. The student saw the obvious things first, then ran out of observations. Agassiz kept sending him back. More looking. More comparison. More attention. Eventually the student started noticing what was actually there.

Learning to see means slowing down long enough to notice what the interface is actually doing to the user. Not what we intended it to do. Not what the ticket says it should do. What it's doing.

- Where did I hesitate?
- Where did my expectation break?
- Where did the page create confidence?
- Where did it create doubt?
- Where is the hierarchy helping?
- Where is the interface asking color, motion, or decoration to solve a structural problem?

These are taste questions, but they start as observation questions.

## The industry standard is the floor

The thing I keep coming back to is this: users don't judge your product only against your competitors.

They judge it against every good piece of software they use.

Your B2B dashboard is being compared, quietly and subconsciously, to Linear, Notion, Raycast, Stripe, Apple, and whatever else lives in the user's daily software diet.

That might feel unfair. It doesn't matter. 😅

The user doesn't lower their expectations because your domain is complex. They don't say, "This is enterprise software, so confusing hierarchy is acceptable." They simply feel the drag.

They may not know how to name it. They may not tell you the typography feels uncertain, the spacing feels accidental, the interaction feels generic, or the action model feels misaligned. They will just trust the product a little less.

That's probably not fair to the engineering underneath. I've seen fantastically engineered systems hidden behind mediocre interfaces. But users don't experience your architecture diagram. They experience the surface area you give them.

That surface area has a lot of trust to earn.

I try to treat the industry standard as the floor, not the ceiling.

That doesn't mean every product should look like the same modern SaaS template. That's part of the AI era problem. The tools are very good at producing generic competence. Rounded cards. Soft shadows. "Pleasant" gradients. Balanced grids. A little badge in the corner that says "New."

It all looks fine.

But fine can hide weak judgment.

I wrote a little about this in [AI is very good at adding. Design is required to subtract.](/blog/ai-is-very-good-at-adding-design-is-required-to-subtract/) The next post in this series is about craft, so I won't go too far down the subtraction path here. For now, I think of taste as the thing that helps you decide whether the polished output deserves to stay.

## Shared language creates shared taste

Taste can't scale if it only lives in one person's head.

A senior designer saying, "This doesn't feel right," may be correct. But if the team can't understand the reasoning, the judgment doesn't spread. It creates dependency. Everyone waits for the person with taste to bless the work.

That might work for a little while, but it doesn't scale.

What I've found more useful is turning taste into language.

A team should be able to point at a screen and ask clear questions:

- Is this calm enough for the decision being made?
- Is this trustworthy enough for the claim it makes?
- Is this fast enough for the user's context?
- Is this generous enough for someone seeing it for the first time?
- Is this focused enough to remove doubt about the next action?

Those words should come from the brand. A bank, a creative tool, a healthcare workflow, a developer platform, and a consumer social app are different brands, so quality should look and feel different in each.

For me, this gets practical when brand strategy turns into a few product quality filters. Not a wall of values. A small set of words that can survive a design review, guide a pull request, shape a scope decision, and constrain an AI generated first pass.

If the words can't change the product, they aren't doing enough work. Shared language is how a team develops shared taste.

## A small exercise

Pick one screen from a product you use often.

Set a timer for ten minutes.

Don't redesign it. Don't fix it. Don't jump into solutions.

Just write what you notice.

- Where does your eye go first?
- What feels obvious?
- What feels uncertain?
- Where would a new user hesitate?
- What is louder than it needs to be?
- What is quieter than it should be?
- What feels intentional?
- What feels accidental?

Do this regularly and your eye will sharpen.

Do it with your team and your language will sharpen.

That's where better product work starts.

Not with a new tool. Not with a more polished mockup. Not with another generated variation.

Just attention, practiced over time.

The more clearly you see, the more clearly you can decide.
