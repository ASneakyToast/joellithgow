---
paths:
  - "src/content/applications/**"
---

# Applications Content — Workflow Instructions

## Schema Reference

The source of truth for all application fields lives in code — do not duplicate schema definitions here.

- **`src/content/config.ts`** (~lines 125-210) — defines `applicationStatusEnum`, `interviewRoundSchema`, `statusEventSchema`, and the full `applicationSchema`
- **`src/utils/applicationStatus.ts`** — status groupings (active vs closed), display labels, and color mappings
- **`src/utils/applicationFlow.ts`** — Sankey diagram data transformation for visualizing application flow

## Creating New Applications

**File naming:** `{company}-{position-slug}.mdx` (all lowercase, hyphen-separated)

**Required frontmatter:**
```yaml
company: "Company Name"
position: "Job Title"
location: "City, State (Remote/Hybrid/Onsite)"
jobUrl: "https://..."
status: "draft"
statusHistory:
  - status: "draft"
    date: YYYY-MM-DD  # today's date
```

**Recommended fields:** `salary`, `deadline`, `fit`, `description`, `featured`, `public`

**Optional sections:** `resume` and `coverLetter` — populate these as the application develops. Not needed at creation time.

## Updating Status

- **Always append** to `statusHistory` — never remove or overwrite existing entries
- **Update the top-level `status`** field to match the latest entry
- **Use today's date** for new `statusHistory` entries

**Typical progression:** `draft` > `applied` > `interviewing` > `offered` / `rejected` / `withdrawn` / `ghosted`

**Interview rounds:** When setting status to `interviewing`, include the `round` field:
```yaml
- status: "interviewing"
  date: YYYY-MM-DD
  round: "phone-screen"  # or: recruiter-call, technical, take-home, onsite, hiring-manager, team-panel, final, other
```

**Notes:** Use the optional `notes` field for context (e.g., rejection reason, interviewer names, next steps).

## Cleanup / Archival

- Set `public: false` to hide an application from the site
- Set `featured: false` to remove from featured display
- Terminal statuses (`rejected`, `withdrawn`, `ghosted`) don't need further updates
- **Never delete application files** — they feed the Sankey flow visualization
