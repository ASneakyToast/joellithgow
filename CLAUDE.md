# joellithgow.com — Claude Code context

Personal portfolio site for Joel Lithgow. Astro SSG frontend + self-hosted Astraeus CMS on EC2.

---

## Key commands

```bash
make dev              # start local CMS + Astro HMR (run db-sync first if DB is stale)
make db-sync          # pull latest prod backup from EC2 → restore local CMS container
make backup           # trigger a prod DB backup on EC2 right now
make staging-restore  # restore latest backup into EC2 staging + restart it
make staging-restart  # restart staging container only (no DB change)
make ssh              # ssh joellithgow-cms shortcut
make webhooks         # list registered CMS webhooks across prod + staging
make mcp-deploy       # build + start the MCP sidecars on EC2 (content :8002, gateway :8003)
make caddy-deploy     # ship Caddyfile to EC2 + reload

bun run build         # production Astro build
bun run preview       # preview the build locally
```

## Architecture

```
Netlify (Astro SSG)
  └── fetches from ASTRAEUS_URL at build time
        ├── local dev:  http://localhost:8001  (docker-compose.local.yml)
        ├── staging:    https://cms-staging.joellithgow.com  (:8001 on EC2)
        └── prod:       https://cms.joellithgow.com  (:8000 on EC2)

EC2 (joellithgow-cms SSH alias) — Caddy fronts :80/:443 (auto-TLS), proxies:
  ├── joellithgow-cms-prod-1        → port 8000 → cms.joellithgow.com
  ├── joellithgow-cms-staging-1     → port 8001 → cms-staging.joellithgow.com
  ├── joellithgow-cms-mcp-1         → 127.0.0.1:8002 → cms.joellithgow.com/mcp        (content MCP)
  ├── joellithgow-cms-gateway-mcp-1 → 127.0.0.1:8003 → cms.joellithgow.com/gateways   (gateway MCP)
  └── ~/backups/latest.db.gz        ← nightly cron at 2am UTC
```

## DB / backup flow

Prod is the source of truth for backups. The backup is a gzipped raw SQLite binary.

```
make backup           →  EC2: docker cp prod container → ~/backups/content-TIMESTAMP.db.gz
                                                       → symlink ~/backups/latest.db.gz

make db-sync          →  scp latest.db.gz from EC2
                      →  gunzip + docker cp into local cms-local container
                      →  restart cms-local

make staging-restore  →  ssh: restore-db.sh latest.db.gz → staging container
                      →  docker restart staging
```

**Note:** prod is the content home (holds the live docs); staging is currently empty/scratch. Use `make db-sync` (prod backup → local) to get real content locally — `make db-sync-staging` pulls staging, which is empty unless you repopulate it.

## Rebuilding the site

The Astro frontend is rebuilt on Netlify. There is **no** auto-rebuild on publish (the old CMS webhook was removed). Trigger a build manually with the **"Rebuild site"** button in the editor toolbar — prod only; it POSTs `/api/rebuild`, which fires the Netlify build hook from `NETLIFY_BUILD_HOOK_URL`. Run `make webhooks` to list any registered webhooks.

## MCP servers

`starlette-cms` exposes MCP via a standalone `build_mcp_server()` FastMCP builder — it is **not**
mounted in-process on the CMS app. So MCP runs as its own process:

- **Local / Claude Code** — stdio launcher, no deploy needed:
  `uv run python -m cms.mcp_server` (defaults to `CMS_URL=https://cms.joellithgow.com`).
- **Remote (the hermes content bot, remote Claude)** — two HTTP sidecar containers, loopback-bound,
  fronted by Caddy:
  - `cms-mcp` → `127.0.0.1:8002` → `cms.joellithgow.com/mcp` — content CRUD/publish tools.
  - `cms-gateway-mcp` → `127.0.0.1:8003` → `cms.joellithgow.com/gateways` — Spotify/iNat sync tools.
    (Caddy rewrites `/gateways` → `/mcp` since the MCP server serves at `/mcp`.)

Deploy: `make mcp-deploy` (build + start the sidecars on EC2) and `make caddy-deploy` (ship
`Caddyfile` + reload). The sidecar code is bind-mounted (`./cms`), so tool changes go live with
`git pull` + `docker restart` like the rest of the CMS; only Dockerfile/dep changes need a rebuild.

**Auth model** (important — the `/mcp` + `/gateways` routes are public):
- The CMS API uses `auth="apikey"` with `read_auth=False` — **writes need `CMS_API_KEY`; reads are
  intentionally public** (the static site needs them).
- The editor/gateway **shell pages are session-login gated** (`check_session_auth`, users from
  `CMS_ADMIN_USERS`) — they'd otherwise leak the api-key in their HTML. See `cms/main.py`.
- The MCP routes are **write-capable**, so Caddy **bearer-token gates** `/mcp` + `/gateways` against
  `{env.MCP_TOKEN}`, set server-side in `/etc/caddy/mcp.env` (see the `Caddyfile` header for the
  one-time setup) — **never committed**. Sidecars bind to loopback, so Caddy is the only path in and
  the gate can't be bypassed. Give the same token to hermes and any MCP client as
  `Authorization: Bearer <token>`.

## Environment

`.env` controls which CMS Astro talks to. Defaults to local:

```
ASTRAEUS_URL=http://localhost:8001   # local dev default
ASTRAEUS_API_KEY=local-secret        # matches docker-compose.local.yml default
```

Prod/staging keys are commented out in `.env` — uncomment to point Astro at them.

## Project layout (key files)

```
Makefile                        # all dev/ops commands — start here
docker-compose.local.yml        # local CMS only (cms-local on :8001)
docker-compose.yml              # EC2: cms-prod (:8000) + cms-staging (:8001) + MCP sidecars (:8002/:8003)
Dockerfile                      # CMS image — multi-stage, clones astraeus at build (ASTRAEUS_REF)
Caddyfile                       # EC2 reverse proxy (Caddy): / → CMS, /mcp + /gateways → sidecars (token-gated)
scripts/
  backup-prod-db.sh             # runs on EC2 — backs up prod container → ~/backups/
  restore-db.sh                 # runs on EC2 — restores .db.gz into a container
cms/
  main.py                       # CMS app entrypoint
  schema.py                     # document type definitions
  seed.py                       # one-time seed (MD/MDX → CMS API)
  mcp_server.py                 # content MCP (stdio local / streamable-http sidecar :8002)
  gateway_mcp_server.py         # gateway MCP sidecar (:8003) — sync tools
  gateways/                     # Spotify + iNaturalist sync workers
src/lib/
  astraeus-loader.ts            # paginated HTTP loader for Astro Content Layer
  astraeus-types.ts             # TypeScript interfaces mirroring CMS schemas
  astraeus.ts                   # public API shim (delegates to getCollection)
src/content/config.ts           # collection definitions + Zod schemas
```

## Content collections

| Collection | CMS doc type | Notes |
|---|---|---|
| `blog` | `blog_post` | Articles, link collections |
| `projects` | `project_page` | Case studies |
| `experience` | `experience_entry` | Work history |
| `spotifyDumps` | `spotify_liked_dump` | Gateway-sourced |
| `inaturalistOutings` | `inaturalist_outing` | Gateway-sourced |
| `applications` | Local MDX | Not in CMS — intentional |

## Gotchas

- The Docker **image** no longer needs a sibling astraeus checkout — the multi-stage Dockerfile clones astraeus (pinned by `ASTRAEUS_REF`) at build time. **Local dev** (`docker-compose.local.yml`) still bind-mounts `../astraeus/`, so the sibling checkout is still required for `make dev`.
- `bun run dev` hangs if the CMS is unreachable — always run `make cms-up` or `make dev` instead of bare `bun run dev`.
- The content loader returns `[]` silently if `ASTRAEUS_API_KEY` is unset — useful for skipping CMS during pure frontend work.
- Docker Desktop on Mac: volume paths (`/var/lib/docker/volumes/...`) are inside a VM — always use `docker cp` to move files in/out of containers, never direct volume path access.
