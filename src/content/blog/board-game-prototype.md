---
title: "Building a Quick Board Game Helper with Claude Code"
description: "A 30-minute prototype to solve the handwriting problem in a party game."
publishDate: 2024-11-27
tags: ["claude-code", "ai-tools", "prototyping"]
type: "article"
draft: false
readingTime: 3
---

My brother and I were playing an old board game with some friends the other night. The core mechanic is simple: everyone writes an answer on a piece of paper, then the person who's "it" tries to guess which answer belongs to which player. It's the kind of game that's been around forever, and it's fun because you're trying to write something that sounds like someone else, or throw people off your trail.

The problem? Handwriting.

After a few rounds, everyone starts recognizing each other's handwriting. My brother's chicken scratch, my all-caps habit, a friend's distinctive cursive - it doesn't take long before you're not really guessing based on the content anymore.

## The Workarounds

My brother came up with a few solutions on the spot. We could use a shared Google Doc where everyone types their answer in a numbered slot. Or Google Slides, where each person adds to a different slide. Both work, but they're a bit clunky - you're passing a laptop around, or dealing with everyone typing at once, and there's no good way to do the reveal.

That's when I figured I could probably just build something quick.

## 30 Minutes Later

I opened Claude Code and described what I needed: a simple web app where players connect from their phones, submit their answers privately, and then the host can reveal the answers one by one to guess who wrote what. After the guessing, they can reveal the actual matches.

It took about 30 minutes to get a working prototype. Nothing fancy - just the core loop:

1. Host creates a game, gets a code to share
2. Players join on their phones and enter their name
3. Everyone submits their answer
4. Host sees all the answers (anonymized) and guesses
5. Reveal who actually wrote what

That was it. We used it for the rest of the night and it worked fine.

## Learning Along the Way

One thing I've noticed with using AI coding tools is how they lower the friction for trying new things. I'd never used Railway before this - it was just the first hosting option Claude suggested that seemed reasonable for a quick websocket app. I'm familiar with websockets conceptually, but I hadn't actually built something with them in this particular way. Neither of those things slowed me down much because I wasn't learning them in isolation; I was learning them while solving a specific problem.

That's the part I find useful. Not that AI wrote the code for me, but that the gap between "I think I could build this" and actually having something working is shorter now.

## That's It

I was pretty confident going in that I could pull this off with Claude Code, and it worked out. Not a groundbreaking moment, just a practical one. We played the game, the app did its job, and nobody could guess based on handwriting anymore.

<!-- TODO: Add photos from game night and screenshots of the app -->
