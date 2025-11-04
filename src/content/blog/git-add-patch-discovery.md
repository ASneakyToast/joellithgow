---
title: "Discovering git add --patch: A Better Way to Split Commits"
description: "That moment when you learn a git feature that makes you wonder how you've been working without it all this time. Here's how I discovered git add -p and why it's now part of my daily workflow."
publishDate: 2025-11-03
author: "Joel Lithgow"
tags: ["git", "workflow", "learning", "tools", "productivity"]
draft: false
featured: true
category: "learning"
readingTime: 5
---

## The Problem

I was staring at a file with multiple unrelated changes. Some were refactoring, some were bug fixes. I wanted to commit them separately—you know, to keep my git history clean and meaningful. But they were all in the same file.

My brain immediately went to what felt like the only option: manually revert the changes I didn't want in the first commit, commit what was left, then painstakingly re-add the reverted changes, and commit again. Or worse, ask Claude to do this tedious dance for me.

It felt wrong, but I didn't know a better way.

## The Discovery

So I asked Claude: "Help me split this into two commits."

Instead of going down the manual revert path I expected, Claude suggested something I'd never heard of:

```bash
git add --patch
```

Wait, what?

I asked for a tutorial, and what I learned absolutely thrilled me. This is one of those moments where you discover something that's been hiding in plain sight, and you can't believe you've been working without it.

## How It Works

`git add --patch` (or `git add -p` for short) lets you interactively stage *parts* of a file, not just the whole thing.

Here's the basic flow:

```bash
git add -p path/to/your/file.js
```

Git shows you each change (called a "hunk") and asks what you want to do with it:

```
Stage this hunk [y,n,q,a,d,s,e,?]?
```

The options are:
- **y** - Yes, stage this hunk
- **n** - No, skip this hunk
- **q** - Quit; don't stage this or any remaining hunks
- **a** - Stage this and all remaining hunks in this file
- **d** - Don't stage this or any remaining hunks in this file
- **s** - Split this hunk into smaller hunks (super useful!)
- **e** - Manually edit this hunk (for when you need surgical precision)
- **?** - Show help

## The Workflow

Now, instead of the manual revert dance, my workflow looks like this:

1. Make all my changes in a file (or multiple files)
2. Run `git add -p`
3. Stage only the hunks related to my first commit
4. `git commit -m "First logical change"`
5. Run `git add -p` again
6. Stage the remaining hunks
7. `git commit -m "Second logical change"`

Clean, surgical, and no reverts necessary.

## Why This Matters

This isn't just about convenience (though it is way more convenient). It's about **commit hygiene**.

Good commits tell a story. They're focused, reviewable, and revertible. When you're mixing concerns in a single commit, you're making life harder for:
- Future you, trying to understand what changed and why
- Your teammates, reviewing your code
- Anyone debugging with `git bisect`
- The person who needs to revert just one of those changes

`git add -p` makes it trivial to maintain good commit hygiene, even when your working process is messy (as it often should be during active development).

## The "Aha!" Moment

What struck me most was the realization that I'd been thinking about staging as an all-or-nothing, file-level operation. `git add file.js` stages the whole file. That's it.

But git is way smarter than that. It understands changes at the *hunk* level—chunks of code that changed together. And with `-p`, you get to decide which hunks belong together in a commit.

It's like discovering that your car has had cruise control all along, but you've been manually maintaining speed with your foot for years.

## Beyond the Basics

Once you're comfortable with the basics, there are some power moves:

**Split hunks that are too big:**
If git groups changes together that you want to separate, use `s` to split the hunk into smaller pieces.

**Edit hunks manually:**
Press `e` to manually edit the diff before staging. This is advanced mode—you're literally editing the patch that will be staged. Use with caution!

**Patch other git operations:**
The `-p` flag works with other commands too:
- `git checkout -p` - selectively discard changes
- `git reset -p` - selectively unstage changes
- `git stash -p` - selectively stash changes

## What I'm Still Learning

I'm still building muscle memory for when to use `-p` vs. just staging whole files. For trivial changes, staging the whole file is fine. But any time I'm touching multiple concerns in one file, `-p` is now my first instinct.

I'm also exploring the manual edit option (`e`) more. It's powerful, but requires understanding how to read and edit unified diff format, which I'm still getting comfortable with.

## Final Thoughts

This is one of those git features that feels like a superpower once you learn it. It's been there all along, waiting to make your workflow better.

The best part? This discovery came from asking Claude a simple question about my workflow. Not "teach me advanced git," but just "help me solve this specific problem." Sometimes the best learning happens when you're just trying to get work done.

Now I'm wondering what other git features I've been missing out on...

---

**What's your favorite git feature that changed your workflow?** I'd love to hear about other people's "how did I not know about this?" moments with version control.

---

*Have you discovered `git add --patch` recently too? Or have you been using it for years and wondering why everyone else manually reverts changes? Either way, I'd love to hear your experience.*
