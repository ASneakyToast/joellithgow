---
title: "Deterministic Code vs. LLM Reasoning"
description: "A recurring question as I work more with AI automation: what should be a hardcoded script and what should Claude handle?"
publishDate: 2026-02-25
author: "Joel Lithgow"
tags: ["ai", "automation", "development", "claude", "reflection"]
type: "article"
draft: true
hasDetailPage: true
readingTime: 6
---

> "This is exactly the kind of thing that should be deterministic code with clear state transitions, not LLM reasoning."

That line came from Claude — while helping me build tooling for this very site. It stopped me mid-flow. Not because it was wrong, but because it was *so clearly right*, and I hadn't thought to draw that line myself.

The more I work with LLMs as part of my development workflow, the more this question keeps surfacing: **when should something be a script, and when should it be a prompt?**

## The pattern

It shows up everywhere. Building a content pipeline? You could write a deterministic state machine that moves drafts through stages, or you could let an LLM decide what happens next based on context. Parsing structured data? Regex and validators are battle-tested, but an LLM can handle the messy edge cases that break your parser.

Every project I touch right now has some version of this tension in it.

## The spectrum

It's not a binary choice. There's a whole spectrum:

- **Pure deterministic code** — State machines, switch statements, explicit routing. No ambiguity. You know exactly what happens for every input.
- **LLM with tools** — The model reasons about *what* to do, but executes through well-defined tool calls. Structured inputs, structured outputs, bounded actions.
- **Full LLM reasoning** — The model handles the entire decision and output. Maximum flexibility, minimum predictability.

Most interesting work lives somewhere in the middle.

## When deterministic wins

Some things just shouldn't involve an LLM:

- **State transitions** — If a draft can only move from `review` → `published` → `archived`, encode that. Don't ask a model.
- **File operations** — Moving, renaming, copying files based on known rules. Deterministic every time.
- **Routing and dispatch** — Matching a request to a handler. This is a lookup, not a reasoning task.
- **Known transformations** — Slugifying a title, formatting a date, converting units. These have one correct answer.

The common thread: **if the rules are known and complete, write them down as code.**

## When LLMs win

And some things are genuinely better with reasoning:

- **Ambiguous inputs** — User messages that could mean three different things. An LLM can navigate that; a switch statement can't.
- **Creative decisions** — Tone, phrasing, structure. Anywhere the "right answer" is subjective.
- **Natural language understanding** — Extracting intent from unstructured text, summarising, classifying without a predefined taxonomy.
- **Adaptive workflows** — When the next step depends on understanding context that's hard to formalise.

The common thread: **if you can't write a complete spec, you probably need reasoning.**

## The grey area

This is where it gets interesting — and where I plan to go deeper.

What about tasks that are *mostly* deterministic but have occasional edge cases? What about workflows where the happy path is a state machine but the error recovery needs judgment? What about the meta-question: should the *decision of which approach to use* itself be made by an LLM?

I want to map this out properly. Diagrams. Real examples from projects I've built. Decision frameworks that are actually useful.

*More to come.*

## Open questions

Things I'm still working through:

- How do you test the boundary between deterministic and LLM-driven code?
- What's the cost model look like when you factor in API calls vs. maintenance burden of complex state machines?
- Is there a reliable heuristic for "this is too ambiguous for code" vs. "you just haven't thought hard enough about the spec"?
- How does this change as models get better? Does the boundary shift?

This is a living document. I'll update it as I build more and learn more.
