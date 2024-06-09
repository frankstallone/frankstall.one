---
isDraft: false
title: 'Internet Explorer 10 and Adobe Flash'
publishDate: 10-23-2012
description: 'Lately there has been a lot of buzz about what Microsoft is doing with Internet Explorer 10 in Windows 8. '
---

<p>Lately there has been a lot of buzz about what Microsoft is doing with Internet Explorer 10 in Windows 8. First, from what I am reading, Internet Explorer 10 is going to be exclusive to Windows 8, even if you attempt to download IE10 Preview you are brought to a screen that says,</p>
<blockquote>
<p><strong>Internet Explorer 10 Preview</strong></p>
<div>Released May 31st 2012</div>
<div>- installed with <strong>Windows 8 Release Preview</strong> -</div>
</blockquote>
<p>Of course this is not the most user friendly scenario  who really wants to download Windows 8 Release Preview and install an entire OS just to test their websites in IE10.</p>
<h2>Dual OS UI's</h2>
<p>Getting beyond the obvious frustrations, there are two versions of IE10 in Windows 8. To explain this, we need to say there are two user interfaces in Windows 8. The new UI is based on the <a title="Wikipedia Article on Metro (design language)" href="https://en.wikipedia.org/wiki/Metro_(design_language)" target="_blank" aria-label="Opens in a new tab">Metro design language</a>, adapted from a mobile interface which most people have seen at this point. The second is an emulation of Windows 7. Each of these two UI's have their own specific IE10, and they are probably visually different and apparently react differently on the web, fun.</p>
<h2>Developers Dance</h2>
<p>Adobe's opened up their source code for Flash to Microsoft, which makes sense because IE10 is coming <em>with Adobe Flash installed by default</em>. How Microsoft is handling Flash in the browser is the most interesting part, apparently the Metro style Windows UI will have a Compatibility View (CV) white list that websites hosting flash files need to be on in order to have their flash files view able. The IE10 in Windows 7 emulation mode will support flash, without the (CV) white list being applicable.</p>
<h2>Good intentions, with drawbacks</h2>
<p>This is most confusing and although I think Microsoft's intent is purely positive, it creates a situation where I am being asked how to handle legacy sites in the new Windows 8 world. There is more that can be done by adding header HTTP headers or META tag's to one's websites, more of that can be read at on MSDN's blog article, <a title="MSDN Article for Web Developers and IE10" href="https://msdn.microsoft.com/en-us/library/ie/jj193557%28v=vs.85%29.aspx" target="_blank" aria-label="Opens in a new tab">Developer guidance for websites with content for Adobe Flash Player in Windows 8</a>.</p>
<h3>TL;DR</h3>
<p>Have flash on your site now? It's probably being hosted on a whitelisted site and will work, if you host your own you'll need to be on Microsoft's whitelist to get your Flash working.</p>
