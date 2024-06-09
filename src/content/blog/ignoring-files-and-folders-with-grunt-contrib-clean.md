---
isDraft: false
title: 'Ignoring Files and Folders with Grunt Contrib Clean'
publishDate: 01-29-2014
description: 'Bridging backend with frontend'
---

<p>Working with the ever so gifted and talented backend developer Rohit Chopra here at Martindale-Hubbell lately, I find myself pulling together two workflows and trying to make it a symbiotic relationship (if you will). Part of this process requires a bit of trial by fire, which Git is fantastic with as you can easily clean out one's working directory effectively hitting the reset button on situations.</p>
<p>I am working with <a href="https://nodejs.org/" target="_blank" aria-label="Opens in a new tab">Node</a>, mainly for <a href="https://gruntjs.com/" target="_blank" aria-label="Opens in a new tab">Grunt</a> tasks which I have been finding unbelievably useful, and <a href="https://bower.io/" target="_blank" aria-label="Opens in a new tab">Bower</a>. When I can get the syntax correct and things click into place, life is good. This particular post is a quick walk through of my morning's fail and by writing what not to do and what to do I can better articulate the concepts later.</p>
<p>For sake of making things easy, I am using the <a href="https://github.com/gruntjs/grunt-contrib-clean/" target="_blank" aria-label="Opens in a new tab">Grunt Contrib Clean</a> task to clear out all the files in the <code>views/</code> directory, with a caveat. I have one folder in this <code>views/</code> folder, called <code>dev/</code> or <code>views/dev</code> if you will, that I do not want Grunt Clean to delete, nor it's contents. Let's take a look at the original code I thought would accomplish this, and the error of my way.</p>

```javascript
clean: {
	dist: {
		src: ['application/views/*', '!application/views/dev/*']
	},
	options: {
		'no-write': true
	}
},

...

grunt.registerTask('delete', ['clean:dist'])
```

<p>Alright so let me explain what we have here. I am telling Grunt there is a <code>clean:object</code> and that <code>dist:</code> is my name for the operations I would like Grunt Clean to accomplish. Finally we have an option of <code>'no-write'</code> set to true because I did not want this to execute in case I had the wrong syntax. The <code>registerTask</code> line is just registering that <code>'clean:dist'</code> as a task that can be run in terminal using the the <code>grunt delete</code> command. At this point running the <code>grunt delete</code> command in terminal gave me this result:</p>
<img src="/media/newsletter/console.png" alt="Console feedback from grunt delete task" />
<p>This was near as makes no difference, useless to me. Now not knowing <a href="https://github.com/isaacs/minimatch/" target="_blank" aria-label="Opens in a new tab">minimatch</a>, the matching library Grunt uses under the hood to match files, I ended up just removing the option no-write just to see what happens. Basically the first part of <code>src</code> that says <code>applications/views/*</code> removed all files in the <code>views/</code> folder &amp; all of the sub-folders. The second part of that line <code>!applications/views/dev/*</code> was ignored completely (at least as it was intended). So let's try something else.</p>

```javascript
clean: {
	dist: {
		src: ['application/views/**', '!application/views/dev/**']
	}
},

...

grunt.registerTask('delete', ['clean:dist'])</pre>
```

<p>This completely deleted the entire <code>views/</code> folder, which included it's contents and the <code>dev/views</code> folder. This is how my backwards brain works, and maybe a bit embarrassingly so. I thought, "Well if two asterisks remove's the entire folder, and ! is exclude, maybe..." and I proceeded to try the following code.</p>

```javascript
clean: {
	dist: {
		src: ['application/views/*', '!application/views/dev/**']
	}
},

...

grunt.registerTask('delete', ['clean:dist'])</pre>
```

<p>Perfect!! This did exactly what I intended it to! It removed the contents of the <code>views/</code> folder, all of the sub-folders and their contents, except the <code>views/dev</code> folder and it's contents. All of this took a matter of 20 minutes, but it led to some fun conversations on the <abbr title="Internet Relay Chat">IRC</abbr> freenode #grunt channel, a place where others ask for help and advice, and I am always thankful for their lovely help. I now have a Grunt Clean task that properly removes the files and folders I want, and excludes the files and folders I ask of it. Now this is not typically my approach, I am one of the few who actually reads the docs that comes with all my electronics, and the same for code, but this was more fun. =D</p>
