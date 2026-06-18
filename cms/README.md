# Astraeus CMS

Headless CMS backend for [joellithgow.com](https://joellithgow.com). Built with Astraeus — a lightweight, self-hosted CMS that exposes content over a REST API consumed by the Astro frontend at build time.

---

## What this is

This directory contains the Astraeus CMS backend that serves as the content source for the portfolio site. The Astro frontend fetches content from the CMS API during the Netlify build, replacing the previous file-based Astro content collections for projects, blog posts, and experience entries.

The `applications` collection remains file-based (local MDX) and is not served through Astraeus.

---

## Local development

### Prerequisites

- Docker and Docker Compose
- Python 3.11+ (for the seed script)

### Start the CMS

```bash
docker compose up -d
```

The CMS will be available at `http://localhost:8000`.

### Environment variables

Copy `.env.example` to `.env` and fill in values:

```bash
cp .env.example .env
```

Key variables:

| Variable | Description |
|---|---|
| `ASTRAEUS_URL` | Base URL of the CMS instance (e.g. `http://localhost:8000`) |
| `ASTRAEUS_API_KEY` | API key for authenticated requests |
| `DATABASE_URL` | Postgres connection string (set automatically by Docker Compose) |

---

## Seeding content

The seed script reads content from the `data/` directory and pushes it to the CMS API.

### Seed all collections

```bash
cd cms
python seed.py
```

### Seed a specific collection

```bash
python seed.py --collection projects
python seed.py --collection blog
python seed.py --collection experience
```

### Data directory layout

```
cms/data/
  projects/      # One JSON file per project
  blog/          # One JSON file per post
  experience/    # One JSON file per role
```

Each file maps directly to the schema defined in `schema.py`.

---

## Verifying seeded documents

After seeding, confirm documents are present via the API:

```bash
# List all projects
curl -s http://localhost:8000/api/projects \
  -H "Authorization: Bearer $ASTRAEUS_API_KEY" | jq '.data | length'

# Fetch a single document by slug
curl -s http://localhost:8000/api/projects/your-slug \
  -H "Authorization: Bearer $ASTRAEUS_API_KEY" | jq .

# List blog posts
curl -s http://localhost:8000/api/blog \
  -H "Authorization: Bearer $ASTRAEUS_API_KEY" | jq '.[].title'

# List experience entries
curl -s http://localhost:8000/api/experience \
  -H "Authorization: Bearer $ASTRAEUS_API_KEY" | jq '.[].company'
```

---

## Netlify webhook

To trigger a Netlify build when content is published in Astraeus:

1. In the Netlify dashboard, go to **Site settings > Build & deploy > Build hooks** and create a new hook. Copy the webhook URL.

2. In the Astraeus admin panel (or via API), register the webhook:

```bash
curl -X POST http://localhost:8000/api/webhooks \
  -H "Authorization: Bearer $ASTRAEUS_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://api.netlify.com/build_hooks/YOUR_HOOK_ID",
    "events": ["document.publish", "document.unpublish", "document.delete"]
  }'
```

3. Publish a document to confirm the hook fires and a Netlify build is triggered.

The build environment variables `ASTRAEUS_URL` and `ASTRAEUS_API_KEY` must be set in the Netlify dashboard under **Site settings > Environment variables** — they are intentionally omitted from `netlify.toml` to avoid committing credentials.

---

## Production deployment

### EC2 (recommended for low traffic)

1. Provision a t3.small or larger instance running Ubuntu 22.04.
2. Install Docker and Docker Compose.
3. Clone this repository and `cd cms`.
4. Copy `.env.example` to `.env` and set production values.
5. Run `docker compose -f docker-compose.prod.yml up -d`.
6. Point a subdomain (e.g. `cms.joellithgow.com`) at the instance and terminate TLS at nginx or via Caddy.

### GCP Cloud Run (serverless option)

1. Build and push the image to Artifact Registry:

```bash
docker build -t gcr.io/YOUR_PROJECT/astraeus-cms .
docker push gcr.io/YOUR_PROJECT/astraeus-cms
```

2. Deploy to Cloud Run with a Cloud SQL Postgres instance as the database backend.
3. Set `ASTRAEUS_URL` in Netlify to the Cloud Run service URL.

---

## Known gaps / future work

| Gap | Phase | Notes |
|---|---|---|
| MCP server integration | Phase 5 | Astraeus MCP server is not yet wired up; Claude Code cannot query CMS content directly during sessions |
| `DateField` serialization | - | Astraeus returns dates as ISO strings; the Astro integration layer must parse them back to `Date` objects to satisfy Zod schemas |
| Media kit / asset management | - | Binary assets (images, videos) are not yet stored in Astraeus; they remain in `public/` in the Astro repo |
| `applications` collection | - | Intentionally kept as local MDX; not migrated to Astraeus |
