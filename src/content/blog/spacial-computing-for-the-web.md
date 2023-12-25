---
isDraft: false
title: 'Spacial computing for the web'
publishDate: 07-22-2023
description: 'The world of Virtual Reality or VR goggles has existed for some time. Most of the recent devices have focused on gaming. Apple’s new Vision Pro mixed reality headset aims more squarely at getting things done, with a twist.'
image: /media/newsletter/spacial-computing-for-the-web.png
---

<p>Today I am going to talk about spacial computing and specifically what it means for the web. The world of Virtual Reality or VR goggles has existed for some time. Most of the recent devices have focused on gaming. Apple’s new Vision Pro mixed reality headset aims more squarely at getting things done, with a twist of entertainment. One of those use cases is web browsing with Safari.</p>
<img src="/media/newsletter/screenshot-safari-spacial-computing.png">
<p>What change is required for current designers and developers working on the web? If you have a career as a designer or a developer, this is relevant because you’ll want to ensure your products or services work correctly in this new space. If you are a product manager, you’ll want to anticipate what your customers might find useful in this technology, rally the team and come up with a strategy for the future.</p>
<p>Early in my career I worked with talented designers who came from the print world and had no interest in understanding the differences between the print medium and the web medium. This caused wasteful arguments about how websites (at the time) did not need to look the same on every browser. It was also cumbersome for their careers when responsive web design became the norm and their skills did not translate well. They needed to adapt to this new medium or they were going to be left behind. Nobody wants to work with someone stuck in the past.</p>
<p>New technologies come and go. We never know ahead of time which are going to take off. We don’t know if mixed reality headsets are the next greatest thing, only time will tell, but if it is — what can we do to be ready?</p>
<h2>Shocker: Utilizing web standards is they key to success</h2>
<ul>
<li>New interactions currently map to existing paradigms</li>
<li>Success looks like leaning on todays best practices</li>
<li>What to look forward to with this new type of interaction</li>
</ul>
<p>From what information we have today issued by Apple from <a href="https://developer.apple.com/wwdc23/">WWDC23</a> sessions, we can gain a lot of insight into what this new platform is capable of, and how that translates to the web today. The good news is these new interactions currently map to existing paradigms. Success relies on following good web standards.</p>
<p>Let’s talk about the new interactions. When wearing the Vision Pro headset, and viewing a Safari page, how do we interact with the page? The device is driven by eye and hand gestures. There are two ways to interact. The first is simply by reaching out and touching the page. Apple calls this a direct gesture. The other is by looking at an area, and using various hand gestures. Apple calls this an indirect gesture. The latter is what Apple presumes most people will do as it is more effortless. Those who have had 30 minute demos also have shared that indirect gestures were easy to pick up.</p>
<img src="/media/newsletter/spacial-comuting-concept-direct-gestures.png">
<img src="/media/newsletter/spacial-comuting-concept-indirect-gestures.png">
<small>An Illustration of Vision Pro indirect hand gestures <a href="https://www.macrumors.com/2023/06/08/apple-vision-pro-gestures/" >from MacRumors</a></small>
<p>Whether a user is interacting with the website using direct or indirect gestures, they will perform the same actions. Directly tapping on a link will click that link. Looking at a link and pinching will also click that link. Safari will the user a highlight around the link you are looking at to aid in navigating. Direct and indirect actions are all mapped to JavaScript’s current <code>pointerdown</code> <code>pointermove</code> and <code>pointerup</code> events.</p>
<p>For security reasons Apple has decided not to share with the browser where you are looking. This is similar to iOS and iPadOS devices. Media queries for <code>pointer: coarse</code> and <code>hover: none</code> are the same with visionOS Safari as they are for iOS and iPadOS Safari. Apple will have a visionOS <a href="https://developer.apple.com/documentation/visionOS/interacting-with-your-app-in-the-visionos-simulator">simulator in Xcode</a>, (currently in a beta version), where hovering will simulate highlighting, and clicking will simulate a tap.</p>
<p>In the future we’ll see an new CSS and pointer events as the platform continues to progress. It’s nice to know that good web standards, and accessibility practices are the baseline for good hygiene when designing and developing on the web for this new spacial computing platform. That makes me more hopeful for it’s future.</p>
<p>This is only one small use case for this new device. I’ll be interested in seeing spacial computing takes off!</p>
<p>That’s it for today! Do you think this whole spacial computing is a fad, or the next greatest thing? I am curious what your thoughts are.</p>
