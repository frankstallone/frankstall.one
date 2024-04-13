---
isDraft: false
title: 'Faster websites with the Picture element'
publishDate: 04-07-2024
description: 'How to create faster websites with the Picture element. Who cares though? Honestly, why even bother talking about performance? Sure there are studies that have shown that lack of performance has cost larger organizations tons of money, and images are the most popular resource type on the web, but does that matter to the user? '
image: /media/newsletter/faster-websites-with-the-picture-element.png
---

Today I am going to talk about web performance for images. There are two main pet projects I’ve had throughout my web career. The first is web accessibility, and the second is web performance.

Both are challenging to master, and to be clear, neither of which am I a master of. However, over the years I have learned a thing or two about both, and I wanted to write an accessible small guide to web performance to share some insights.

Who cares though? Honestly, why even bother talking about performance? Sure [there are](https://www.cloudflare.com/learning/performance/more/website-performance-conversion-rates/) studies that have shown that lack of performance has cost larger organizations tons of money, and images are [the most popular resource type on the web](https://httparchive.org/reports/state-of-images?lens=top1k), but does that matter to the user? Yeah, it does.

Google considers [site performance as a ranking factor](https://developer.chrome.com/blog/search-ads-speed/). Good website performance can improve your users experiences when using your website. This is an element that speaks positively or negatively to your brand.

> When **real** users have a slow experience on mobile, they're much less likely to find what they are looking for or purchase from you in the future. For many sites this equates to a huge missed opportunity, especially when more than half of visits are abandoned if a mobile page takes over 3 seconds to load. &mdash; [Addy Osmani](https://developer.chrome.com/authors/addyosmani/), [Speed is now a landing page factor for Google Search and Ads](https://developer.chrome.com/blog/search-ads-speed/)

It’s easy to overcomplicate things on the web. Using React to build a marketing site is in most cases complete overkill. Most people fail at optimizing images no their website because it’s hard. There are different file types, optimization strategies, and if you have to do this manually it can be a on going affair.

## Leverage automation to optimize once

- <a href="#file-types-and-fallbacks">File types and fallbacks</a>
- <a href="#the-picture-element-is-intimidating">The Picture element is intimidating</a>
- <a href="#automation-opportunities">Automation opportunities</a>

### File types and fallbacks

When we talk about images we are talking about `png`, `gif`, `jpg`, `jpeg`, `webp`, `avif`, `jxl`, `ico`, or `svg` file extensions or a [MIME type](https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types) containing `image`. Let’s at the bulk of the heavy image file types we see on the web. Those are `png`, `jpg`, and `jpeg`. These have more modern image formats that can be used on the web that provide much better compression. The current batch are `webp`, `avif`, and `jxl`. They are file types that be up to 35% smaller in size without loosing information.

Well then — what’s the problem? Why wouldn’t we all simply convert to these today and call it a day? Browser support for these file types varies. You’ll want to know what is best for your audience, but suffice to say there are strategies that can create fallbacks. That means you can have your traditional `jpg` and the more modern `webp` and `avif` files, served in order by lightest to heaviest, and the browser will do the heavy lifting of using the best match.

### The Picture element is intimidating

The best way I have found that allows me to tell the browser to match the best file format and sizes are with the `<picture>` HTML element, the `srcset` and `sizes` HTML attributes. With the `<picture>` element one can have multiple `<source>` children enclosed within. Each of those `<source>`elements can have one, or more, `srcset` attributes that point to a specific file, and [refer to a width descriptor](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/img#srcset). This width descriptor coincides with the `sizes` [media condition](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/img#sizes).

Typically this is a tiered strategy where you start with a `<source>` for a highly optimized and maybe less supported image type like `jxl` or `avif`. Below that might be a `<source>` with another optimized image type that has wider adoption like `webp`. Finally, you want to have a fallback image type for older browsers using the `<img>` element.

```html
<picture>
  <source
    srcset="
      /media/filename.avif  300w,
      /media/filename.avif  500w,
      /media/filename.avif 2000w
    "
    type="image/avif"
    sizes="(max-width: 360px) 300px, (max-width: 720px) 500px, 2000px"
  />
  <source
    srcset="
      /media/filename.webp  300w,
      /media/filename.webp  500w,
      /media/filename.webp 2000w
    "
    type="image/webp"
    sizes="(max-width: 360px) 300px, (max-width: 720px) 500px, 2000px"
  />
  <img
    src="/media/filename.jpg"
    srcset="
      /media/filename.jpg  300w,
      /media/filename.jpg  500w,
      /media/filename.jpg 2000w
    "
    sizes="(max-width: 360px) 300px, (max-width: 720px) 500px, 2000px"
    alt="Description of the image."
    width="2000"
    height="1333"
    loading="lazy"
    decoding="async"
  />
</picture>
```

You may have noticed the `<img>` tag has a `src`, and `srcset`. Older browsers that know how to handle the ladder will, if not they’ll fall back to the former. Again we see the `sizes` attribute to coordinate with the `srcset` width descriptors. Finally we see `loading` and `decoding` attributes. These may be inferred automatically by some browsers, but if you have images that are not needed immediately when the webpage loads, set those to `lazy` and `async` respectively. `eager` and `sync` are the attribute values to use for ‘above the fold’ images.

### Automation opportunities

For traditional files, software like [ImageOptim](https://imageoptim.com/) can help you perform lossless or lossy image compression. Lossless is a data compression method with no loss of information. Lossy is a data compression approach that can greatly decrease the file size with a varying degree of loosing information.

Using a program like ImageOptim is a manual process. There are other services out there like [Cloudinary](https://cloudinary.com/documentation/responsive_images#dynamic_image_transformation%E2%80%8B%E2%80%8B) that provides an API to transform and optimize your images. What I love about Astro, a wonderful web framework, is that [it has a Picture component](https://docs.astro.build/en/guides/images/#picture-) that lifts a lot of the work of creating a single `<picture>` element.

### Summary

That was a lot! Let’s recap by summarizing that there are methods for a web app or marketing pages to implement highly optimized images that will load extremely fast on modern browsers for our users in different contexts. They include fallbacks for older browsers to ensure those users are not left behind. We dived into a code example and I left some MDN docs for those who want to read more about it. Now you’re a little bit more knowledgeable about the world of image optimization on the web!

Is this topic interesting? Would you like to learn more about anything in particular related to this? Drop me a line here or on social media and let me know.
