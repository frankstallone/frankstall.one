# Boris Cherny: automation as infrastructure for agents

## Source and scope

- Boris Cherny, [X post, July 15, 2026](https://x.com/bcherny/status/2077460395279692197). This is one long-form post. X's first-party page reports no self-thread continuation, URL entities, quoted post, or attached article, so there is no linked or continued first-party material to add.

## Claims

- The best engineers have historically multiplied their output by automating recurring work: editor tooling, lint rules, and end-to-end tests are his examples. This is the precedent for his argument, not a break with past engineering practice. [Source](https://x.com/bcherny/status/2077460395279692197)
- Infrastructure and developer-experience automation now has multiplicative leverage because it speeds every agent using the codebase, not only the engineer who created it. [Source](https://x.com/bcherny/status/2077460395279692197)
- Recurring problems should be encoded in deterministic, reusable mechanisms such as lint rules, CI checks, or routines. Re-solving each instance with an agent spends tokens and can miss cases; encoding the class of problem makes the fix persistent. [Source](https://x.com/bcherny/status/2077460395279692197)
- In this framing, agent “loops” are chiefly a way to automate whole categories of busywork rather than handle one-off tasks. Cherny presents them as an extension of familiar engineering automation. [Source](https://x.com/bcherny/status/2077460395279692197)
- Agents are making first-day code contributions and non-engineer contributions more feasible because they can navigate unfamiliar codebases on a contributor's behalf. The remaining obstacle is domain knowledge that exists only in people's heads. [Source](https://x.com/bcherny/status/2077460395279692197)
- Agents expand what can be encoded as infrastructure. Domain knowledge is no longer limited to types, tests, and lint rules; it can also live in comments, skills, `CLAUDE.md` rules, and memories. [Source](https://x.com/bcherny/status/2077460395279692197)
- He makes a strong normative claim: when a contribution is rejected for using the wrong framework or architectural pattern, that is a failure to automate the relevant knowledge, not merely a contributor mistake. [Source](https://x.com/bcherny/status/2077460395279692197)
- Every team should maintain agent-facing instructions, review rules, skills, and documentation that let an agent work productively with no extra context from the person prompting it. [Source](https://x.com/bcherny/status/2077460395279692197)
- Teams should continuously convert domain knowledge into infrastructure so agents generate better code, reviews catch issues automatically, and the next contributor can become effective faster. Smarter models and more mature harnesses will lower the cost of doing this, but Cherny assigns the responsibility to teams now. [Source](https://x.com/bcherny/status/2077460395279692197)

## Core thesis

Cherny's argument is not simply that AI produces more code. It is that the highest-leverage engineering work is shifting toward externalizing judgment and domain knowledge into durable systems that improve every subsequent human or agent contribution.
