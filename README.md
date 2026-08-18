# joellithgow.com

Personal portfolio site for Joel Lithgow — creative technologist. Built with Astro (SSG) and backed by a self-hosted headless CMS called [Astraeus](https://github.com/ASneakyToast/astraeus).

---

## Architecture

```
┌─────────────────────────────────────────────────┐
│  Netlify (static hosting)                        │
│  Astro SSG — fetches content from CMS at build   │
└────────────────────┬────────────────────────────┘
                     │ ASTRAEUS_URL (build-time)
         ┌───────────┼───────────────┐
         ▼           ▼               ▼
    localhost:8001  cms-staging     cms-prod
    (local dev)     .joellithgow    .joellithgow
                    .com            .com
                    (EC2 :8001)     (EC2 :8000)
```

- **Frontend**: Astro 5 static site, deployed to Netlify. Fetches all content via Astro Content Layer loaders at build time — no client-side CMS calls.
- **CMS**: Astraeus (starlette-cms) running in Docker on EC2. Exposes a REST API. Content is published manually via the editor UI or gateway syncs.
- **Gateways**: Python workers that pull external data (Spotify liked tracks, iNaturalist observations) into the CMS as draft documents for review and publish.
- **Backups**: Prod DB backed up nightly (2am UTC) to `~/backups/` on EC2 as a gzipped SQLite binary. Local dev and staging restore from this file.

---

## Project structure

```
joellithgow/
├── cms/                        # Astraeus CMS backend
│   ├── main.py                 # App entrypoint — wires CMS + editor + gateways
│   ├── schema.py               # Document type definitions
│   ├── seed.py                 # One-time seed script (MD/MDX → CMS API)
│   ├── mcp_server.py           # MCP server for Claude Code sessions
│   └── gateways/               # External data sync workers
│       ├── spotify_liked_dump.py
│       └── inaturalist_field_trips.py
├── nginx/
│   └── cms.conf                # Nginx reverse proxy for prod + staging subdomains
├── scripts/
│   ├── backup-prod-db.sh       # EC2: backup prod container → ~/backups/latest.db.gz
│   ├── restore-db.sh           # EC2: restore .db.gz into a named container
│   ├── backfill_slugs.py       # One-time migration helper
│   └── sync-starlette-cms.sh   # Dev helper: sync local astraeus package
├── src/
│   ├── content/
│   │   ├── config.ts           # Astro Content Layer collection definitions + Zod schemas
│   │   └── applications/       # Local MDX (not in CMS — intentional)
│   ├── lib/
│   │   ├── astraeus-loader.ts  # Raw HTTP loader (paginated) for Content Layer
│   │   ├── astraeus-types.ts   # TypeScript interfaces mirroring CMS schemas
│   │   └── astraeus.ts         # Public API shim — delegates to getCollection()
│   ├── components/             # Astro UI components
│   ├── pages/                  # Route pages
│   └── styles/                 # Global CSS + theme system
├── Dockerfile                  # CMS image (uv + starlette-cms workspace)
├── docker-compose.yml          # EC2: cms-prod (:8000) + cms-staging (:8001)
├── docker-compose.local.yml    # Local dev: cms-local (:8001)
├── Makefile                    # Dev/ops commands — start here
├── piccolo_conf.py             # Piccolo ORM config for SQLite migrations
├── pyproject.toml              # Python project manifest (uv workspace member)
└── .env.example                # Required environment variables
```

---

## Local development

### Prerequisites

- [Bun](https://bun.sh)
- Docker and Docker Compose
- The [astraeus](https://github.com/ASneakyToast/astraeus) monorepo checked out as a sibling directory (`../astraeus/`)

### First-time setup

```bash
cp .env.example .env
# .env is pre-configured for local dev — no changes needed to get started

bun install
```

### Daily workflow

```bash
make db-sync   # pull latest prod backup from EC2 → restore local CMS
               # skip this if you synced recently and don't need fresh content

make dev       # start local CMS (http://localhost:8001) + Astro HMR (http://localhost:4321)
```

`make dev` starts both processes together. If you want them separately:

```bash
make cms-up    # CMS only
bun run dev    # Astro only (requires cms-up to be running)
```

### Rebuild the CMS image

Only needed after changes to `Dockerfile`, `cms/`, or the astraeus packages:

```bash
make cms-build
```

---

## Content collections

| Collection | Source | Notes |
|---|---|---|
| `blog` | Astraeus CMS (`blog_post`) | Articles, thoughts, link collections |
| `projects` | Astraeus CMS (`project_page`) | Case studies with body blocks |
| `experience` | Astraeus CMS (`experience_entry`) | Work history |
| `applications` | Local MDX (`src/content/applications/`) | Not in CMS — intentional |

Gateway-sourced content (Spotify dumps, iNat outings) lives in the CMS as additional document types and is merged into the blog index at build time.

---

## Operations

All ops commands run through `make`. Run `make help` to see the full list.

### Backups

Prod DB is backed up nightly at 2am UTC to `~/backups/` on EC2 as `latest.db.gz` (gzipped SQLite binary). To trigger a backup immediately:

```bash
make backup
```

### Syncing environments

```bash
make db-sync          # EC2 latest backup → local dev container
make staging-restore  # EC2 latest backup → staging container + restart
make staging-restart  # restart staging container only (no DB change)
```

To get staging/local in sync with prod *right now*: run `make backup` first, then the restore command.

### SSH access

```bash
make ssh   # → ssh joellithgow-cms
```

### Cron (already installed)

Nightly backup cron is installed on EC2 (`crontab -l` to verify). To reinstall: `make cron-install`.

---

## Deployment

The CMS runs on EC2 behind Nginx. See `nginx/cms.conf` for the reverse proxy config and `cms/README.md` for full deployment instructions.

The Astro frontend deploys automatically to Netlify on push to `main`. The build requires `ASTRAEUS_URL` and `ASTRAEUS_API_KEY` set in Netlify environment variables.

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | Astro 5, TypeScript, CSS custom properties |
| CMS | Astraeus (starlette-cms), Python 3.12, SQLite |
| Package manager (Python) | uv |
| Infrastructure | Docker, Nginx, EC2 |
| Hosting | Netlify (frontend), EC2 (CMS) |
| Gateways | Spotipy (Spotify), iNaturalist v1 API |

---

**Joel Lithgow** — [joellithgow.com](https://joellithgow.com) · [LinkedIn](https://linkedin.com/in/joellithgow) · [GitHub](https://github.com/ASneakyToast)
