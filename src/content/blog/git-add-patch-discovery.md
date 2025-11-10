---
title: "Learning Faster, Not Less: How AI Helped Me Discover git add --patch"
description: "I asked Claude for help splitting a commit. What I got wasn't just a solution—it was a git feature that changed my workflow and a reminder that AI tools can accelerate learning rather than replace it."
publishDate: 2025-11-03
author: "Joel Lithgow"
tags: ["git", "workflow", "learning", "ai"]
type: "thought"
draft: false
featured: true
readingTime: 2
hasDetailPage: false
---

I was staring at a file with multiple unrelated changes—some refactoring, some bug fixes. I wanted to commit them separately to keep my git history clean. But they were all in the same file.

My brain went to what felt like the only option: manually revert changes, commit, then painstakingly re-add them. Or worse, ask Claude to automate this tedious dance for me.

## The Unexpected Teaching Moment

So I asked Claude: "Help me split this into two commits."

Here's what I half-expected: a series of commands to execute. Do the work for me.

Instead, Claude pointed me to something I didn't know existed:

```bash
git add --patch
```

It lets you interactively stage *parts* of a file, not just the whole thing. You review each change and decide what goes in which commit. Clean, surgical, no reverts necessary.

## Using Tools to Accelerate Learning

What struck me wasn't just the git feature (though it's now muscle memory). It was the realization about how I was learning.

Claude didn't do the work for me—it pointed me to a capability that made me more capable going forward. I didn't just get a solution; I got knowledge I'll use forever.

I could have spent hours reading git documentation and maybe never stumbled on this feature. Or I could ask a question when I hit a real problem and learn about it in context, immediately applicable.

There's a narrative that AI tools make you think less, learn less, become more dependent. I get the concern. But this showed me something different: the gap between having a question and finding relevant knowledge went from hours (or never) to seconds. The understanding still had to happen. The practice still had to happen. It just happened faster and in the exact moment I needed it.

Maybe the question isn't whether using AI makes you learn less, but whether you're using it in ways that build capability or just solve immediate problems.

This built capability.

---

**What's something you learned through AI tools that you might never have discovered otherwise?**
