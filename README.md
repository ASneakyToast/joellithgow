# joellithgow.com

Personal portfolio site for Joel Lithgow — creative technologist. Built with Astro (SSG) and backed by a self-hosted headless CMS called [Astraeus](https://github.com/ASneakyToast/astraeus).

---

## Architecture

```
LAPTOP (MacBook)
├── Local CMS (uv run --reload)    ─── for feature dev
├── git push → GitHub               ─── code deploys
└── cms.joellithgow.com/editor     ─── content editing

HOMELAB (Hermes PC)
├── Hermes (AI agent)
│     ├── via MCP → content ops + DB management + backups
│     └── Hermes cron → nightly backup (scheduled)
└── git push → GitHub

EC2 (t3.micro, us-east-2)
├── nginx (SSL termination)
├── cms-prod        :8000  — production CMS         (Docker)
├── cms-staging     :8001  — staging CMS             (Docker)
├── cms-mcp         :8002  — MCP + SRE tools (prod)  (Docker)
└── cms-mcp-staging :8003  — MCP + SRE tools (staging)(Docker)

NETLIFY
├── Production: astro build → dist → thisisahousegallery.com
├── Staging preview: auto-built per PR
└── Content webhook: CMS publish → triggers rebuild
```

- **Frontend**: Astro 5 static site, deployed to Netlify. Fetches CMS content at build time via Astro Content Layer loaders.
- **CMS**: Astraeus (starlette-cms) running in Docker on EC2. REST API + editor UI + MCP server.
- **MCP Server**: Runs as a Docker sidecar. Exposes content management tools + SRE tools (backup, health, migrate, export). Accessible over `streamable-http` so Hermes connects natively.
- **Gateways**: Python workers that pull external data (Spotify liked tracks, iNaturalist observations) into the CMS.

---

## Project structure

```
joellithgow/
├── cms/                        # Astraeus CMS backend
│   ├── main.py                 # App entrypoint — wires CMS + editor + gateways
│   ├── schema.py               # Document type definitions
│   ├── seed.py                 # One-time seed script (MD/MDX → CMS API)
│   ├── mcp_server.py           # MCP + SRE server (sidecar)
│   └── gateways/               # External data sync workers
│       ├── spotify_liked_dump.py
│       └── inaturalist_field_trips.py
├── nginx/
│   └── cms.conf                # Nginx reverse proxy for prod/staging/MCP
├── scripts/
│   └── backfill_slugs.py       # One-time migration helper
├── src/                        # Astro frontend
├── Makefile                    # Dev + deploy automation
├── Dockerfile                  # CMS Docker image (multi-stage, self-contained)
├── docker-compose.yml          # prod + staging + MCP sidecars
├── piccolo_conf.py             # Piccolo ORM config
├── pyproject.toml              # Python project manifest
└── .env.example                # Required environment variables
```

---

## Local development

### Prerequisites

```bash
# macOS (Homebrew)
brew install uv node

# Then clone both repos side-by-side:
git clone git@github.com:ASneakyToast/joellithgow.git
git clone git@github.com:ASneakyToast/astraeus.git   # sibling dir
```

### Run the CMS locally (hot-reload)

```bash
cd joellithgow
cp .env.example .env       # fill in CMS_API_KEY

# One-time: install deps (starlette-cms from ../astraeus, editable)
uv sync

# Start CMS with hot-reload
make dev-cms
# → Available at http://localhost:8000
# → Auto-restarts on any change to astraeus/packages/starlette-cms/ or cms/
```

### Run the Astro frontend

```bash
npm install
make dev-astro
# → Available at http://localhost:4321
```

### Run the MCP server locally (sudo Hermes test)

```bash
# Point at the local CMS
CMS_URL=http://localhost:8000 CMS_API_KEY=dev-secret \
  uv run python -m cms.mcp_server --transport sse --port 8002
```

### Seed content (first time)

```bash
uv run python -m cms.seed \
  --cms-url http://localhost:8000 \
  --api-key <CMS_API_KEY>
```

---

## Deployment (one command)

### Backend code changes (starlette-cms or CMS itself)

```bash
# Edit → commit → push → deploy
git add -A && git commit -m "fix: ..." && git push

# One command deploy to staging:
make ec2-deploy

# One command deploy to production:
make ec2-prod
```

**What `make ec2-deploy` does:**
1. SSM send-command: `git pull` on both `astraeus/` and `joellithgow/`
2. SSM send-command: `docker compose up -d --build cms-staging cms-mcp-staging`
3. Done. ~30 seconds total.

Deploying a known-good change takes zero SSH, zero tunnels, zero browser sessions.

### Frontend code changes

```bash
git push
# → Netlify auto-builds deploy preview for PRs
# → Merge to main → Netlify auto-builds prod
```

### Content changes (auto-deploy via webhooks)

When you publish a document in the CMS editor:

```
CMS publish → webhook → Netlify build hook → rebuild → deploy
```

This works for both staging and prod independently. No manual rebuild needed.

---

## MCP Server (for AI agents)

The MCP server runs on EC2 as a Docker sidecar on port 8002 (prod) and 8003 (staging), proxied through nginx at `cms.joellithgow.com/mcp`.

### Tools available

**Content tools (from starlette-cms):**
- `list_block_types` — discover document types
- `get_block_schema` — see a type's fields
- `list_documents` — search/filter content
- `get_document` — fetch by ID
- `create_document` — create drafts
- `update_document` — edit content
- `delete_document` — remove content
- `publish_document` — make public
- `unpublish_document` — revert to draft

**SRE tools (EC2-specific):**
- `get_system_health` — disk usage, DB size, container status
- `backup_database` — snapshot + compress + upload to S3
- `run_migration` — apply pending Piccolo migrations
- `export_all_content` — dump all published docs as JSON (for Astro builds)

### Register in Hermes

```yaml
# ~/.hermes/config.yaml
mcp_servers:
  cms-prod:
    url: "https://cms.joellithgow.com/mcp"
    headers:
      Authorization: "Bearer ${CMS_API_KEY}"
  cms-staging:
    url: "https://cms-staging.joellithgow.com/mcp"
    headers:
      Authorization: "Bearer ${CMS_STAGING_API_KEY}"
```

---

## Makefile targets

| Target | What |
|---|---|
| `dev-cms` | Run CMS locally with hot-reload |
| `dev-astro` | Run Astro dev server |
| `lint` | Run Python + JS linters |
| `ec2-pull` | `git pull` both repos on EC2 |
| `ec2-build SERVICE=cms-staging` | Build + restart one service |
| `ec2-deploy` | Full staging deploy (pull + build + restart) |
| `ec2-prod` | Full production deploy |
| `backup-staging` | Snapshot staging DB (local, no S3) |
| `backup-prod` | Snapshot prod DB (local, no S3) |
| `db-sync` | Copy prod DB to local (via SSM tunnel) |
| `health URL=http://localhost:8000` | Quick health check |
| `help` | Show this help |

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

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | Astro 5, TypeScript, CSS custom properties |
| CMS | Astraeus (starlette-cms), Python 3.12, SQLite |
| Package manager (Python) | uv |
| Containers | Docker, Compose |
| Compute | EC2 t3.micro (us-east-2) |
| Proxy | Nginx + Let's Encrypt |
| Hosting | Netlify (frontend), EC2 (CMS) |
| MCP | streamable-http, FastMCP |
| Gateways | Spotipy (Spotify), iNaturalist v1 API |

---

**Joel Lithgow** — [joellithgow.com](https://joellithgow.com) · [LinkedIn](https://linkedin.com/in/joellithgow) · [GitHub](https://github.com/ASneakyToast)