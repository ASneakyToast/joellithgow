---
title: "He's Going the Distance: Making a Minecraft Difficulty Scaling Mod"
description: "What happens when you make a Minecraft mod where the game gets harder the farther you travel from spawn? Zombies. So many zombies. A quick dev journal about building a distance-based difficulty scaler and discovering it's secretly a co-op game."
publishDate: 2025-10-25
author: "Joel Lithgow"
tags: ["minecraft", "modding", "dev-journal", "game-design", "multiplayer", "claude-code"]
draft: false
featured: true
category: "dev-journal"
readingTime: 8
---

## The Song That Launched a Mod

I was coding when "The Distance" by Cake came on. You know the one—*"He's going the distance, he's going for speed..."*

And I thought: what if that was a Minecraft mod? What if the farther you traveled from spawn, the harder the game got? Not just a little harder. Exponentially, absurdly, *ridiculously* harder.

So I made it. And I called it "He's Going the Distance" because sometimes the best project names come from whatever song happens to be playing.

## The Build: Standing on the Shoulders of Mutualisms

This mod came together fast. Way faster than my [previous Minecraft mod about ecological partnerships](./minecraft-mutualism-mod-devlog.md).

Why? Two reasons:

**1. I'd already learned Minecraft's core systems.** The mutualism mod taught me how Fabric works, how game mechanics layer together, how to think about mob behaviors and world generation. That knowledge transferred directly.

**2. This mod is conceptually simpler.** No custom mobs. No new blocks or items. No complex ecological relationships. Just one core mechanic: distance from spawn affects difficulty.

The implementation touches everything—mob health, spawn rates, damage scaling, the works—but it's all variations on a single idea. And once again, Claude Code made it possible. What would have taken me weeks (or months) of researching Minecraft's difficulty systems happened in a few focused sessions.

## The QA Session: Boats, Zombies, and Beautiful Chaos

Here's where it got fun.

A friend was staying over, and I recruited them for playtesting. We loaded up the mod, spawned into the world, and started exploring.

At first, everything seemed normal. Minecraft as usual. But as we traveled farther from spawn—building our way across oceans in boats—the game started to reveal its teeth.

Then we got far enough.

Zombies started spawning *on our boats*. Not near us. Not in the water. Literally materializing on the boat we were riding.

We died. A lot.

But here's the thing: we were laughing the entire time. The absurdity of the escalating difficulty, the chaos of trying to navigate while zombies spawn-killed us—it was exactly the kind of ridiculous gameplay moment I'd hoped for.

## The Design Evolution: Accidentally Making a Co-op Mod

Testing with another person revealed something I hadn't anticipated: this isn't really a single-player mod.

Playing solo, the difficulty curve felt punishing. Too steep. You'd venture out, get overwhelmed, die, and feel frustrated.

Playing co-op? Perfect. The escalating challenge felt like an adventure you were tackling together. The difficulty became a shared obstacle instead of a personal failure.

So I adjusted the scaling. Made it more gradual. Tweaked it shorter and shorter until we found the sweet spot—a difficulty curve that ramped up just fast enough to feel exciting with a partner, but not so fast that it became frustrating.

The mod became tuned for two players almost by accident. And honestly? That's way more interesting than what I originally envisioned.

## What I Learned: Different Kinds of Fun

Building this mod taught me something about my own creative process.

I love both types of modding:
- **Content mods** (like the mutualism mod): Adding new things to the world—mobs, blocks, mechanics, ecological relationships
- **Gameplay mods** (like this one): Tweaking how existing systems work to create new experiences

They scratch different creative itches. Content mods are about world-building and narrative. Gameplay mods are about systems design and balancing.

Right now, I'm enjoying exploring both. Trying different ideas, building quick prototypes, seeing what sticks. I'm not trying to commit to one massive mod project—I'm experimenting until I find something I want to spend serious time on.

And that feels right. This whole return to Minecraft modding isn't about building the perfect mod. It's about rediscovering why I fell in love with game development in the first place.

## The Technical Bit: What Actually Changes

For those curious about implementation, here's what scales with distance from spawn:

- **Mob health**: Farther enemies are tougher to kill
- **Mob spawn rates**: More hostiles appear as you explore
- **Mob damage**: Hits hurt more the farther you are
- **Everything else I could think of**: The mod touches pretty much every difficulty parameter Minecraft exposes

The scaling is gradual now (thanks to playtesting), but venture far enough and you'll absolutely notice the difference.

## What's Next

For now, the mod is "done." Not done-done—there's always more tuning, more features, more polish. But done enough that I'm happy with it.

I'll probably play it with more people, see how it holds up with different group sizes, maybe discover new breaking points or hilarious failure modes.

Eventually I might come back and expand it. Add configuration options for the scaling curve. Implement different difficulty profiles. Who knows.

But right now? I'm ready to start the next experiment. Another mod idea, another gameplay concept, another song-inspired project name.

<!-- TODO: Add screenshots here once captured -->

## Reflections: Speed Running Creative Ideas

What strikes me most about this project is the velocity.

Idea → working prototype → playtested → tuned → "shipped" in a timeframe that would have been impossible for me even a year ago. Not because I'm a better programmer (though I am learning), but because the tools have changed.

Claude Code didn't write this mod for me. It helped me build it. There's a difference. I still made every design decision, tuned every parameter, playtested every iteration. But I didn't have to spend days hunting through Minecraft's source code or deciphering outdated modding tutorials.

It's the same creative flow I found with the mutualism mod, just applied to a different kind of project. And I'm starting to realize: this is how I want to make things. Fast iteration, rapid prototyping, shipping ideas before they have time to get stale.

He's going the distance. He's going for speed.

Turns out that song was more appropriate than I thought.
