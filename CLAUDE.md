# joellithgow.com — Claude Code context

Personal portfolio site for Joel Lithgow. Astro SSG frontend + self-hosted Astraeus CMS on a k3s cluster (`jlithgow-ops`). EC2 is a fallback until retired.

---

## Where prod runs

Since 2026-10-01 prod (`cms.joellithgow.com`) runs in the k3s cluster, managed in `~/Code/personal/jlithgow-ops` (`cluster/apps/astraeus-cms/`), **not on EC2**. EC2 still runs the old prod stack as a fallback and serves `cms-staging`, but gets no prod traffic and its data is stale.

- **Deploy CMS code:** merge to `main` (`build-cms.yml` pushes `ghcr.io/asneakytoast/joellithgow-cms:astraeus-<sha>`), then bump the image pin in jlithgow-ops (`deployment.yaml`, `mcp.yaml`) and merge. Argo syncs it. Never `make prod-deploy` for this — it targets EC2.
- **Config / secrets:** `secrets.enc.yaml` (sops) in jlithgow-ops. Pods read it as plain env vars, so after a change run `kubectl -n astraeus rollout restart deploy/astraeus-cms`.
- **Backups:** Litestream streams `content.db` to R2 (`jlithgow-ops-backups`, `astraeus-cms/prod/content.db`) and restores it into an empty volume on pod start.
- **EC2-only `make` targets** (`db-sync`, `backup`, `prod-deploy`, `prod-restart`, `mcp-deploy`, `caddy-deploy`, `cron-install`, `staging-*`) act on the fallback box. `make db-sync` pulls EC2's *stale* backup, not live prod, until it is repointed at R2.

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
        └── prod:       https://cms.joellithgow.com  (k3s cluster)

k3s cluster (jlithgow-ops, namespace astraeus) — Cloudflare Tunnel into ClusterIP services:
  ├── astraeus-cms     → :8000 → cms.joellithgow.com   (Litestream sidecar → R2, continuous)
  └── mcp-proxy        → :8080 → cms.joellithgow.com/mcp*   (Caddy, bearer-token gate)
        ├── cms-mcp          :8002 → /mcp          (content MCP)
        └── cms-gateway-mcp  :8003 → /mcp/gateway  (gateway MCP)

EC2 (joellithgow-cms SSH alias) — fallback until retired; staging still lives here:
  ├── joellithgow-cms-prod-1, -mcp-1, -gateway-mcp-1 → old prod stack, stale data, no traffic
  ├── joellithgow-cms-staging-1     → port 8001 → cms-staging.joellithgow.com
  └── ~/backups/latest.db.gz        ← nightly cron at 2am UTC (backs up the stale EC2 DB)
```

## DB / backup flow

**This flow covers the EC2 fallback box, whose DB has been stale since the 2026-10-01 cutover.** Live prod is backed up by Litestream to R2 (see *Where prod runs*). To get live prod locally, `litestream restore` from the R2 replica (credentials in jlithgow-ops `litestream-secrets.enc.yaml`) until `make db-sync` is repointed.

The EC2 backup is a gzipped raw SQLite binary.

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
- **Remote (the hermes content bot, remote Claude)** — two HTTP Deployments in the cluster behind
  `mcp-proxy` (Caddy):
  - `cms-mcp` → `cms.joellithgow.com/mcp` — content CRUD/publish tools.
  - `cms-gateway-mcp` → `cms.joellithgow.com/mcp/gateway` — Spotify/iNat sync tools.
    (Caddy rewrites `/mcp/gateway` → `/mcp` since the MCP server serves at `/mcp`. It is not
    `/gateways`: the CMS serves the gateway admin UI there.)

Deploy: they run the same image as the CMS, so a tool change ships with the image-pin bump in
jlithgow-ops (see *Where prod runs*). The `mcp-deploy` / `caddy-deploy` targets only touch the EC2 fallback.

**Auth model** (important — the `/mcp` + `/mcp/gateway` routes are public):
- The CMS API uses `auth="apikey"` with `read_auth=False` — **writes need `CMS_API_KEY`; reads are
  intentionally public** (the static site needs them).
- The editor/gateway **shell pages are session-login gated** (`check_session_auth`, users from
  `CMS_ADMIN_USERS`) — they'd otherwise leak the api-key in their HTML. See `cms/main.py`.
- The MCP routes are **write-capable**, so `mcp-proxy` **bearer-token gates** `/mcp` + `/mcp/gateway`
  against `MCP_TOKEN`, held in jlithgow-ops `mcp-proxy-secrets.enc.yaml` (sops) — **never committed
  in plaintext**. The sidecars are ClusterIP-only and the tunnel sends only `/mcp*` to the proxy, so
  the gate can't be bypassed. Give the same token to hermes and any MCP client as
  `Authorization: Bearer <token>`. Keep the gate's `respond 401` inside the `route` block in the
  proxy's Caddyfile: outside it, Caddy runs `handle` first and the gate silently never runs.
- **OAuth, for the Claude app connector.** The mobile connector form has no bearer-token field, only
  OAuth client details, so `cms/oauth.py` is a small single-user OAuth server: one pre-registered
  client, the CMS login as the sign-in step (`/oauth/authorize` → `/api/auth/login`), and stateless
  HMAC-signed tokens (rotate `OAUTH_SIGNING_SECRET` to revoke everything). `mcp-proxy` calls
  `/oauth/verify` before proxying; the static bearer tokens still work for hermes. It needs
  `OAUTH_CLIENT_ID`, `OAUTH_CLIENT_SECRET`, `OAUTH_SIGNING_SECRET` and `CMS_SESSION_SECRET`; with any
  unset the routes aren't mounted. Tests: `uv run --with pytest pytest tests/`.

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
docker-compose.yml              # EC2 fallback: cms-prod (:8000) + cms-staging (:8001) + MCP sidecars (:8002/:8003)
Dockerfile                      # CMS image — multi-stage, clones astraeus at build (ASTRAEUS_REF)
Caddyfile                       # EC2 fallback reverse proxy; the live one is jlithgow-ops mcp-proxy
scripts/
  backup-prod-db.sh             # runs on EC2 (fallback) — backs up its prod container → ~/backups/
  restore-db.sh                 # runs on EC2 — restores .db.gz into a container
cms/
  main.py                       # CMS app entrypoint
  schema.py                     # document type definitions
  seed.py                       # one-time seed (MD/MDX → CMS API)
  oauth.py                      # OAuth server for the MCP connectors (Claude app)
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
