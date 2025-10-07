---
title: "Full Circle: From Java Tutorials to Vibe Coding a Minecraft Mutualism Mod"
description: "After years away, I'm back to where I started: making Minecraft mods. This time with Claude Code, a book about ecological partnerships, and a few hours of pure creative flow."
publishDate: 2025-10-06
author: "Joel Lithgow"
tags: ["minecraft", "modding", "dev-journal", "game-design", "ecology", "claude-code"]
draft: false
featured: true
category: "dev-journal"
readingTime: 10
links:
  - url: "https://www.goodreads.com/book/show/222139804-the-call-of-the-honeyguide"
    title: "The Call of the Honeyguide by Rob Dunn"
    description: "Explores how mutualisms—reciprocal relationships between species—shape life and evolution. The inspiration behind the Symbiotic Survival mod."
    tags: ["ecology", "mutualism", "science", "biology", "inspiration"]
    dateAdded: 2025-10-06
    category: "Books"
  - url: "https://github.com/ASneakyToast/minecraft-mutualisms-mod"
    title: "Symbiotic Survival - Minecraft Mod"
    description: "The Minecraft mod itself - teaching ecological mutualism through gameplay. Built with Claude Code using the Fabric mod loader for Minecraft Java 1.21+."
    tags: ["minecraft", "modding", "open-source", "game-development", "fabric"]
    dateAdded: 2025-10-06
    category: "Projects"
---

## Where It Started

I got into programming because of Minecraft.

I went to art school, not CS. In high school, there was a comp sci teacher—when I asked if I could join his class (even while helping one of his students with their homework), he said my grades were too bad. No bootcamp either. Just me, YouTube, and a lot of Buckey's Java tutorials. I learned just enough to make some custom blocks, items, and armor.

After all these years—after professional development work, web apps, CMS projects, everything—I'm back. And it feels awesome.

## The Spark: A Book About Partnerships

I've been reading ["The Call of the Honeyguide" by Rob Dunn](https://www.hachettebookgroup.com/titles/rob-dunn/the-call-of-the-honeyguide/9781541605756/), and it's been a real inspiration recently. The book is about mutualisms—the reciprocal relationships between species where everyone benefits.

The title comes from a partnership in nature: In sub-Saharan Africa, the greater honeyguide bird has evolved a specific call—used *only* to attract humans. The bird leads people to beehives because it wants the wax inside, but it can't access the hive on its own. Humans get honey, the bird gets wax. Everyone wins.

I've been experimenting with clay and ceramics lately, trying to find a way to combine that with the ideas from this book—but I haven't found a compelling idea yet. About Minecraft, both wanting to play it and rethink about making mods, the two ideas just overlapped perfectly. So I went for it.

## The Vibe Code Session

Here's the wild part: I went from idea to working prototype in just a few hours.

How? Claude Code and pure creative flow—vibe coding. But don't get me wrong, there was planning. Claude and I sat down and talked through different types of mutualisms before we even discussed turning it into a Minecraft mod. The planning and architecture documents were all part of the vibe coding process.

The experience was insane. I haven't touched Minecraft modding in years, and getting up to speed with the modern Fabric toolchain and current Java practices would have taken me 2-3 years of learning. But in just one night, Claude helped me navigate it all—the development environment, the game mechanics, everything. It felt like pair programming with someone who had infinite patience for my "what if we tried this?" ideas.

## The Assets: Textures and Models

Here's something I didn't expect: Claude Desktop also generated all the visual assets.

Block textures, item sprites, mob models—everything. I just gave it technical requirements: "16x16 pixels, PNG format, filename should be `honeyguide_egg.png`" and it would spit out pixel art. No style direction, no references, no iterations. Just worked first try.

Are they amazing? No. They're fine. Functional placeholders that get the job done. The kind of thing I'd normally spend hours hunting through asset packs or attempting (badly) in a pixel art editor. But for rapid prototyping? Perfect. I can see them getting better with more iteration or if I spent time refining the prompts, but honestly, I didn't need to.

The fact that I could go from "I need a yucca moth sprite" to having one in my inventory system in minutes meant I never lost momentum. No context switching to art tools, no breaking flow to find temporary assets. Just describe what I needed and keep building.

![All the custom blocks, items, and mobs in the Symbiotic Survival creative inventory](/assets/images/projects/minecraft-mod-creative-inventory.png)

## What We Built: Symbiotic Survival

The mod is called [Symbiotic Survival](https://github.com/ASneakyToast/minecraft-mutualisms-mod), and it's about teaching players that understanding and preserving natural partnerships is more rewarding than exploitation.

### The Honeyguide

The star of the show—these birds lead players to bee nests, just like their real-world counterparts. But here's where it gets interesting for game design:

**You don't learn this through a tutorial.** You learn it by watching.

Bee keeper villagers interact with honeyguides naturally. You see them following the bird, harvesting honey, and sharing larvae as a reward. The honeyguide remembers this positive interaction.

Then you see a pillager encounter a honeyguide. The bird tries to lead them to honey, but they just attack it. No honey, no understanding, no mutualism.

Players learn the mechanic through emergent storytelling, not UI pop-ups.

### Biome-Specific Mutualists

Each biome has its own pollinator-plant partnership:
- Fig wasps in jungle biomes
- Yucca moths in desert regions
- And eight more unique pairs across the world

Here's the core mechanic that makes it work: **Destroy the pollinator's home (nest, hive, etc.), and the nearby tree stops producing fruit.**

Want sustainable resources? Preserve the partnership. It's ecology 101 through gameplay consequences.

![Custom mutualism tree towering over the forest](/assets/images/projects/minecraft-mod-tree.png)

## What This Taught Me About Game Design

Building this reminded me why games are such powerful teaching tools. Nobody wants to read a textbook about fig wasps and their obligate mutualism with fig trees. But make it a game mechanic where destroying the wasp nest means no more figs? Suddenly players *care* about fig wasps.

The villager and pillager interactions added another digestible layer to the game. Players can learn by watching NPCs interact with the honeyguide, seeing the difference between cooperation and conflict play out organically.

## Unexpected Discovery: How Claude Codes Differently for Games

Here's something I didn't expect: Claude Code approaches game development *completely differently* than web development.

In all my web projects—portfolio sites, CMS work, API development—Claude tends to go straight to production-ready code. Clean, complete implementations. When it says something is "done," it's done.

But with Minecraft modding? It's working in a fundamentally different mode.

### The Incremental Approach

Claude's strategy for this mod has been relentlessly incremental:
- Make sure a single block loads before worrying about the whole tree system
- Get items rendering properly before even touching mob spawning logic
- Test one mechanic in isolation before building the next layer

At first I thought this was just being cautious. But then I realized: it's actually the right approach for game development. Game mechanics need to be *felt* and *tested* iteratively in ways that web features don't.

### The TODO Philosophy

Here's where it gets interesting: Claude leaves TODOs *everywhere*.

```java
// TODO: Implement proper particle effects for pollination
// TODO: Add sound effects for honeyguide calls
// TODO: Optimize tree search algorithm for large forests
```

And then it marks the feature as "completed."

My web dev brain initially rebelled at this. "That's not done! There are TODOs!" But for rapid prototyping? This is actually ideal. The core mechanic works. The polish can come later. Claude's definition of "completion" in this context means "working prototype, next chunk unlocked."

I definitely prefer this for the creative exploration phase—but it requires vigilance. You need to know the difference between "works well enough to test the next idea" and "actually production ready."

### The Refactoring Moment

The tradeoff hit me when I discovered leaves were withering away even though they were attached to wood blocks.

Bug, right? Turns out: not exactly.

Through investigation, I found that Claude had set up our custom blocks using generic Minecraft block models—enough to get them rendering and testable, but not properly inheriting from the specialized `PillarBlock` and `LeavesBlock` classes they needed.

It was intentionally halfway. Test first, refactor to spec later.

So I spent time refactoring tree blocks to properly extend `PillarBlock`, leaves to inherit from `LeavesBlock`, getting all the proper behaviors instead of generic placeholders. Not hard, but something I hadn't expected to do after Claude said the blocks were "working."

### Different Domains, Different Workflows

What I'm learning: this placeholder-heavy, chunk-at-a-time approach actually makes sense for game development in a way it doesn't for web.

With web apps, you generally want components to be production-ready before you build the next layer on top. But with game mechanics, you need to *play* with rough implementations to know if they're even fun before you polish them.

The honeyguide's pathfinding didn't need to be perfect to test whether the "follow the bird" mechanic was engaging. The tree-pollinator relationship didn't need optimized neighbor-searching algorithms to validate that "destroy nest → no fruit" was the right game feel.

Claude seems to understand this implicitly. Or maybe game development just naturally encourages this workflow, and Claude adapts to it.

Either way: if you're using Claude Code for game development, embrace the TODOs. Embrace the placeholders. They're not tech debt—they're creative scaffolding.

Just remember to come back and actually implement them eventually.

## More Screenshots

<div class="image-row">
<img src="/assets/images/projects/minecraft-mod-landscape.png" alt="Landscape showing custom trees alongside vanilla Minecraft biomes" />
<img src="/assets/images/projects/minecraft-mod-pollinators.png" alt="Biome-specific pollinators on their hive blocks" />
</div>

<div class="image-row">
<img src="/assets/images/projects/minecraft-mod-hives.png" alt="Different pollinator species with their hive blocks" />
<img src="/assets/images/projects/minecraft-mod-in-world.png" alt="Custom mutualism trees and blocks in the Minecraft world" />
</div>

## What's Next

Right now, it's a prototype. The honeyguide works, the basic pollination mechanics are in, and the emergent villager behavior is *chef's kiss*. But there's so much more I want to add:

- **More complex mutualism chains**: What if trees that depend on bird pollinators also provide fruit that feeds those birds? Break the chain anywhere and everything suffers.
- **Seasonal behaviors**: Migration patterns, seasonal blooms, hibernation cycles
- **Player education mechanics**: Maybe an in-game journal that fills in with observations, like Breath of the Wild's Hyrule Compendium
- **Consequences for restoration**: If you've damaged an ecosystem, can you restore the mutualism? What does that look like mechanically?

But honestly? Even if I just polish what exists now, I'm proud of it. It's a full circle moment—returning to where I started as a developer, but with years of experience and new tools that let me build in hours what would have taken weeks before.
