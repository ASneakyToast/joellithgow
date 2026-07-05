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
┌────────────────────▼────────────────────────────┐
│  Astraeus CMS (EC2 / Docker)                     │
│  cms-prod  :8000  ←── nginx → cms.joellithgow.com│
│  cms-staging :8001 ←─────── local / direct       │
└─────────────────────────────────────────────────┘
```

- **Frontend**: Astro 5 static site, deployed to Netlify. Fetches all content via Astro Content Layer loaders at build time — no client-side CMS calls.
- **CMS**: Astraeus (starlette-cms) running in Docker on EC2. Exposes a REST API. Content is published manually via the editor UI or gateway syncs.
- **Gateways**: Python workers that pull external data (Spotify liked tracks, iNaturalist observations) into the CMS as draft documents for review and publish.

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
├── docker-compose.yml          # cms-prod (:8000) + cms-staging (:8001)
├── piccolo_conf.py             # Piccolo ORM config for SQLite migrations
├── pyproject.toml              # Python project manifest (uv workspace member)
└── .env.example                # Required environment variables
```

---

## Local development

### Prerequisites

- Node.js 18+
- Docker and Docker Compose
- The [astraeus](https://github.com/ASneakyToast/astraeus) monorepo checked out as a sibling directory (`../astraeus/`)

### Start the CMS

```bash
cp .env.example .env
# Fill in CMS_API_KEY and CMS_STAGING_API_KEY

docker compose up -d
# cms-staging available at http://localhost:8001
```

### Start the Astro frontend

```bash
npm install
npm run dev
# Frontend available at http://localhost:4321
# Set ASTRAEUS_URL=http://localhost:8001 and ASTRAEUS_API_KEY=<staging key> in .env
```

### Seed content (first time only)

```bash
uv run python -m cms.seed \
  --cms-url http://localhost:8001 \
  --api-key <CMS_STAGING_API_KEY>
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

## Deployment

The CMS runs on EC2 behind Nginx. See `cms/README.md` for full deployment instructions.

The Astro frontend deploys automatically to Netlify on push to `main`. The build requires `ASTRAEUS_URL` and `ASTRAEUS_API_KEY` set in the Netlify environment variables dashboard.

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
