---
isDraft: false
title: 'CSS Resets, meet Normalize.css'
publishDate: 12-28-2011
description: 'My perspective of CSS Resets and Normalize.css from 2011'
subtitle: 'My perspective of CSS Resets and Normalize.css from 2011'
---

<p>What is a <acronym title="Cascading Stylesheet">CSS</acronym> Reset? The purpose of a <acronym title="Cascading Stylesheet">CSS</acronym> Reset was to start with a clean slate, or consistent baseline between all browsers when starting a new web development project. The idea can be summed up nicely by Jonathon Snook:</p>
<blockquote>
<p><q>In case you've never heard of such a thing, a <acronym title="Cascading Stylesheet">CSS</acronym> Reset is designed to set a number of element styles to a specific baseline that creates consistency across various browsers.</q> <cite>— Jonathon Snook, <a href="https://snook.ca/archives/html_and_css/no_css_reset/" target="_blank" aria-label="Opens in new tab">No <acronym title="Cascading Stylesheet">CSS</acronym> Reset</a></cite></p>
</blockquote>
<p>Over the years there have been many resets, all of which I would at some point try and read more about. The asterisk or star rest is one I never was keen on; it uses <a href="https://stackoverflow.com/questions/1714096/why-is-the-css-star-selector-considered-harmful" target="_blank" aria-label="Opens in new tab">a lot of browser muscle</a>, therefore slows the browser down, to go through every <acronym title="Hypertext Markup Language">HTML</acronym> element and set it's <code>margin</code> and <code>padding</code>. On the form field front, removing the <code>margin</code> and <code>padding</code>can cause ill effects as well.</p>

```css
* {
  margin: 0;
  padding: 0;
}
```

<h2>Build Up</h2>
<p>Eric Meyer came up with a <a href="https://meyerweb.com/eric/tools/css/reset/" target="_blank" aria-label="Opens in new tab"><acronym title="Cascading Stylesheet">CSS</acronym> Reset</a>, and has revisisted it many times over the years. I've used Erics for years, and even <a href="https://meyerweb.com/eric/thoughts/2011/01/10/reset-2-0b2-paring-down/#comment-527635" target="_blank" aria-label="Opens in new tab">argued ideology with changes made</a>, because “what” to actually reset is always a good argument. Some people, like <a href="https://snook.ca/" target="_blank" aria-label="Opens in new tab">Jonathon Snook</a>, decided not to use a <acronym title="Cascading Stylesheet">CSS</acronym> reset at all and I feel like that is the right choice for what he is doing. If you strip <code>margin</code>, <code>padding</code> and other <acronym title="Cascading Stylesheet">CSS</acronym> from the native browsers control, you have to build it back up.</p>
<h3>Boiling Up</h3>
<p>I have been a bit proponate of the work the team over at <a href="https://html5boilerplate.com/" target="_blank" aria-label="Opens in new tab">HTML5 Boilerplate</a> have been doing; talk about years of knowledge being pooled into a cauldron to make the best starting place for every project, with modification of course, and out comes the HTML5 Boilerplate. These guys are awesome, I've learned so much, but back on track version 1.0 used a modified version of Eric Meyer's Reset, modified by <a href="https://twitter.com/#!/Rich_Clark" target="_blank" aria-label="Opens in new tab">Richard Clark</a>, called the <a href="https://html5doctor.com/html-5-reset-stylesheet/" target="_blank" aria-label="Opens in new tab">HTML5 Reset Stylesheet</a>. This offered more build up on top of the stipping out of elements Eric Meyer's reset performed, and added HTML5 elements. On top of that the HTML5 Boilerplate added even more build up to normalize what resets ripped out, or even better to stabilize what one saw from one browser to the next (huge feats in the form arena). Using best practices the build up was fantastic, how could it get any better?</p>
<h2>Video killed the radio star</h2>
<p>At the end of the day, really what we are trying to accomplish is consistency. By resettings the browsers natural <acronym title="Cascading Stylesheet">CSS</acronym> but overriding it and building it back up we are just looking for a way to see things more consistenty as we view a site from one browser to the next. With upwards towards 10 browsers at any one point in time, in multiple operating system environments, this isn't asking too much. So unlike a browser reset, work on a <a href="https://necolas.github.com/normalize.css/" target="_blank" aria-label="Opens in new tab">Normalize.css</a> started appearing and eventually become baked into version 2.0 of the HTML5 Boilerplate.</p>
<h3>Who are these guys?</h3>
<p><a href="https://nicolasgallagher.com/" target="_blank" aria-label="Opens in new tab">Nicolas Gallagher</a> and <a href="https://twitter.com/jon_neal" target="_blank" aria-label="Opens in new tab">Jonathon Neal</a> took the approach of a global reset differntly, looking at browser default <acronym title="Cascading Stylesheet">CSS</acronym> styling as a blessing and decided to just slightly modify that existing code and make it better with some new best practices.</p>
<ul>
<li>Will it work for every project?
<ul>
<li>No.</li>
</ul>
</li>
<li>Does it really kill off the CSS Reset?
<ul>
<li>Not for everyone, but it has for me.</li>
</ul>
</li>
<li>Will Jonathon Snook use it?
<ul>
<li>Probably not.</li>
</ul>
</li>
<li>Is it a good start for future proofing?
<ul>
<li>Hard to tell.</li>
</ul>
</li>
</ul>
<p>With the advent of Mobile First mentality, presumably this is still a good starting place as mobile browsers are moving closer to desktop browser capability. I can say that I for one will start my projects with Normalize.css, and this is the first time in years I'll be moving from Eric Meyer's Reset so that says a lot for what Nicolas and Jonathon have accomplished because I feel they have hit the nail on the head of what I want to accomplish with a baseline set of styles. As always, figure out what your projects requirements are and see if it makes sense to use Noramlize.css, Eric Meyer's Reset, or even HTML5Boilerplate.</p>
