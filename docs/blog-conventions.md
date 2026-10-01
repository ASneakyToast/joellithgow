# Blog conventions

How content on joellithgow.com is shaped. For field names and types, `cms/schema.py` is the source of truth. This doc covers the parts the schema can't tell you.

## Which document type?

| You're writing... | Use | Notes |
|---|---|---|
| An opinion, devlog, explainer or write-up | `blog_post` | Pick a `post_type` below |
| A term with a definition, plus your take on it | `definition` | Not a blog post. Lives under `/blog/dictionary/` |
| A case study | `project_page` | |
| A job on the resume | `experience_entry` | |

Spotify dumps and iNaturalist outings are created by the gateways as drafts for review. Don't write those by hand.

## `post_type` for `blog_post`

The values come from the schema: `article`, `thought`, `collection`. What the existing posts do with them:

- **`article`**: longer, structured pieces. About 12 of the current posts.
- **`thought`**: shorter, reflective or in-the-moment posts, such as "Claude Code Interactive Prompts". About 7.
- **`collection`**: lists of links, which use the `links` field (a list of link items). About 4.

New posts default to `has_detail_page: true`. Six of the current posts set it to `false`, mostly short thoughts, so check one of those if you want a post without its own page.

## `definition` structure

- `definition`: the factual definition, in markdown. Keep it neutral.
- `personal_notes`: your take, context, predictions, in markdown. This is where first-person opinion goes.
- `sources`: a list mixing `link` and `citation` entries. Leave it empty rather than inventing a source.

## Voice

Joel's posts, going by the existing ones, are first person, conversational and curious, and they say when something is a guess. Observations come before predictions, and uncertainty is stated openly ("I don't know the answer", "live blogging/QAing, I guess"), so drafts should do the same.

When drafting for Joel:

- Mark places for his own experience with a `[JOEL: ...]` placeholder, and remove them all before publishing.
- Separate what a source says from what Joel thinks. Don't present a guess about someone else's reasoning as fact.
- Paraphrase sources and link them in a `Sources:` list at the end. Keep quotes short.

## Tags

Tags are lowercase and hyphenated. Reuse the existing ones where they fit before inventing new ones. The most common in the current posts: `claude-code`, `tools`, `resources`, `links`, `game-design`, `design`, `ai`. Others include `minecraft`, `modding`, `learning`, `dev-journal`, `cli` and `reflection`.

## Publishing

- Content is published manually from the editor UI (Review & Publish), or via gateway syncs. Gateways create drafts that you review and publish.
- Publishing does not rebuild the site. Use the "Rebuild site" button in the editor toolbar (prod only) to fire the Netlify build.
- The body field is stored as ProseMirror JSON, not markdown, despite its name (`body_markdown`). Check the MCP tool's input schema for how it accepts the body before relying on markdown going in.
