---
isDraft: false
title: 'Git concepts everyone should know'
publishDate: 06-17-2023
description: 'Today I am going to teach you Git fundamentals everyone should know. Whether you are a designer, developer or product expert having a general understanding of how version controlling code works is easy. '
image: /media/newsletter/git-concepts-everyone-should-know.png
---

<p>Today I am going to teach you Git fundamentals everyone should know. Whether you are a designer, developer or product expert having a general understanding of how version controlling code works is easy.</p>
<div class="flow"><img src="/media/newsletter/git-fundamentals-illustration-git-branch.png"></div>
<p>A decade ago I was working for Martindale-Hubbell, LexisNexis and was teaching our support team how to use Git to push updates for custom websites to our cert and prod environments. This was a gratifying and humbling experience. I had never taught Git before and they had never heard or really known about version control tools.</p>
<p>Code management through version control like Git is important because it allows us to code without fear of loosing previous code. It allows us to innovate by branching knowing we won’t break production code. It allows us to quickly deploy, or revert changes.</p>
<p>Most people look at Git and think it’s a deeply complicated system. There is some magic going on for sure, but one doesn’t need to know all of Git to use it effectively. I would go so far as to say not understanding the fundamentals of Git will make working with other team members nearly impossible, and will not give one the confidence to try new things. Someone has far from code as possible like an executive or product manager should know these fundamentals because it will aid them in knowing what is possible.</p>
<h2>Understanding the fundamentals of Git will make you a better team player</h2>
<ul>
<li>Code typically exists in two locations</li>
<li>Branch for experimentation</li>
<li>Undo mistakes</li>
</ul>
<p>Disclaimer: To be clear, this will not be an exhaustive technical deep dive into Git. I would <a href="https://abookapart.com/products/git-for-humans">recommend getting Git for Humans</a> by <a href="https://twitter.com/ddemaree">David Demaree</a> for a deeper look into Git.</p>
<p>Let’s use an example project that exists on our local machine, and on GitHub. What does that even mean? When a Git repository is initiated, it creates hidden folders on one’s local machine that keep track of changes. These changes can be synced to other computers, and thus hosted in the cloud. <a href="https://github.com/">GitHub</a> is a popular tool for hosting local repositories in a remote location. Remote being the key word, <a href="https://github.com/frankstallone/design-token-tailwind-config-creator">here is an example</a> of a remote repository that one could clone locally to their computer.</p>
<div class="flow"><img src="/media/newsletter/bttf-doc-timeline-skew.jpg"></div>
<small>Caption: Branching in Git is like that scene in Back to the Future 2 where Doc Brown talks about the 1985 alternative world.</small>
<p>In Git, branching is a concept whereby you can create an alternate timeline. Every repository has a main branch. This main branch is typically the production branch. What if we wanted to try and build a fun new feature, but we weren’t sure it is feasible and don’t want to break anything on the production branch? That’s the power of branching. Create a new branch and name it whatever you want. An example branch name might be “feature-fun-experiment”. This code will live in an alternative place on your system. You can go back to the “main” branch, merge that “feature-fun-experiment” into “main”, bring in new changes from “main” to “feature-fun-experiment” or even create a branch from “feature-fun-experiment” to try something else related to that fun experiment. The are entire <a href="https://www.atlassian.com/git/tutorials/comparing-workflows">Git workflows</a> that help teams work together more efficiently and effectively.</p>
<p>Finally the most amazing part about working with version control tools is the ability to undo mistakes. Every single commit made to a Git repository is a snapshot of code in that repository at that point in time. That means all decisions that were made can be revisited, and reverted to if needed. Brought down the production environment by accident? Revert back to a previous commit message in the past and you are back up and running in no time!</p>
<p>I have worked on codebase in production with no version control. It was scary. We called it cowboy coding because it was a little wild. Not having the ability to easily revert back, see previous changes, or try things without copy and pasting files to different folders was time consuming and stressful!</p>
<p>Of course, we only scratched the surface of Git and version control today. There is a lot more to it but with this knowledge you are able to have conversations with your team members and understand what is possible.</p>
<p>That’s all for now. Thanks for reading. Liked, or disliked this newsletter article? Let me know! You can find me on <a href="https://twitter.com/frankstallone">Twitter</a> and <a href="https://twitter.com/frankstallone">LinkedIn</a>. See you online!</p>
