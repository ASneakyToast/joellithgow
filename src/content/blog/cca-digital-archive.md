---
title: "Preserving CCA's Digital Presence"
description: "Exploring ways to archive California College of the Arts' website as the institution closes its doors."
publishDate: 2026-01-23
author: "Joel Lithgow"
tags: ["wagtail", "django", "archival", "static-sites", "cca"]
type: "thought"
draft: false
featured: false
readingTime: 2
hasDetailPage: false
---

CCA is closing, and with it goes a website I helped build and maintain for years. There's something bittersweet about watching an institution wind down—but also something urgent about making sure its digital presence doesn't just vanish.

I've been exploring options for archiving the main site. Since it's built on Wagtail/Django, I came across [wagtail-bakery](https://www.joelsleppy.com/blog/baking-a-static-site-from-wagtail-cms/)—a tool that "bakes" a dynamic CMS into static HTML files. The idea is elegant: run Wagtail locally with SQLite for content storage, then generate static files ready for cheap, permanent hosting. Best of both worlds—the richness of a full CMS for editing, with the durability and simplicity of static files for preservation.

Still figuring out if this is the right approach, or if something like HTTrack makes more sense for pure archival. But the goal is the same: keep the digital history alive even after the physical institution is gone.
