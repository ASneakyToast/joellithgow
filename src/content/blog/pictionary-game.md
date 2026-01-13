---
title: "Building a Better Pictionary for Family Game Night"
description: "I got tired of getting out-shouted playing Netflix Pictionary, so I built my own version with typed answers, custom words, and an AI that draws."
publishDate: 2025-12-26
author: "Joel Lithgow"
tags: ["side-project", "game-design", "family", "multiplayer"]
type: "article"
draft: false
featured: false
readingTime: 4
image:
  src: "/assets/images/blog/pictionary-lithgowRules-snowman.png"
  alt: "Screenshot of the Pictionary game showing a hand-drawn snowman with a timer, scores, and team information"
---

My family loves playing Netflix's Pictionary game. We'll pull it up on the TV, pass a phone around for drawing, and spend an hour yelling guesses at the screen while someone frantically scribbles.

It's fun. But there's a problem.

## The Shouting Problem

Some people are just louder than others. And when you're playing a game where the first person to shout the correct answer wins, the loud people dominate. Every. Single. Time.

I noticed I'd sometimes just... not guess. Not because I didn't know the answer, but because I couldn't compete with the speed-shouters. The people who machine-gun twenty guesses in three seconds while the rest of us are still processing the drawing.

I wasn't alone in this. I'd catch other family members going quiet too, watching instead of playing.

Looking back, I think what I wanted was to make the game more accessible. To give everyone—not just the fastest, loudest person in the room—a fair shot at guessing.

## So I Built My Own

Over the winter break, I threw together a custom Pictionary game. The idea was simple: what if you could *type* your answers instead of shouting them?

With typed answers, you're not competing on volume. Everyone submits their guess, the system checks it, and the first correct answer wins. Quiet people can play. Introverts can play. People who need an extra second to think can play.

I added a few other features while I was at it:

- **Multiple guessing modes**: Typing for fair competition, buzzing for buzzer-style gameplay, or classic shouting for when you want chaos
- **Custom word entry**: Players can submit their own words, so you can add inside jokes and family-specific references
- **Team modes**: 2, 3, or 4 teams, plus free-for-all
- **AI bot players**: For when you need an extra person (more on this below)

The result is live at [pictionary.joellithgow.com](https://pictionary.joellithgow.com).

## The AI That Draws

This is the part that got weird and fun.

I built two types of AI bots that can join the game as players. When it's their turn to draw, they actually draw—stroke by stroke, just like a human would.

One bot uses GPT-4o to generate drawings. I prompt it with a word, it returns a description of shapes (circles, rectangles, paths), and I convert those into animated strokes. It's like watching an AI think through how to represent "elephant" or "birthday party" in simple shapes.

The other bot pulls from pre-defined drawings when the AI is unavailable or slow.

Building these bots was mostly for my own entertainment during solo dev time, but they're actually useful when you have an odd number of players.

## The Holiday Test

I was excited to play it with the family over the holidays. We loaded it up, everyone joined the room on their phones, and...

We hit bugs. Immediately.

Turns out I'd never actually tested it with more than one real person. Multiplayer games have this pesky requirement where you need multiple players to properly test them. Who knew.

We played for a bit, laughed at the jank, and I took notes on what was broken. Classic MVP experience: ship it, watch it break, fix it, repeat.

I've since worked out the major bugs, and I'm excited for next time we all gather. The game actually works now.

## What I Learned

The best part of this project wasn't the code—it was the speed. I went from "what if I could type answers?" to a working prototype in a few days. Then from prototype to a real game over a couple weeks of evening sessions.

That's the magic of side projects. No stakeholder reviews. No sprint planning. No waiting for approvals. Just an idea, a laptop, and the freedom to build something dumb and fun for the people you love.

I'm excited to make more multiplayer games. There's something deeply satisfying about building something your friends and family actually use—even if the first session is mostly debugging in real-time while everyone watches.

---

If you want to try it: [pictionary.joellithgow.com](https://pictionary.joellithgow.com)

Fair warning: the servers aren't heavily load-tested. But if you want to solve the shouting problem at your next game night, give it a shot.
