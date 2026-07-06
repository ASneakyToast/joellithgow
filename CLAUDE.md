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

EC2 (joellithgow-cms SSH alias)
  ├── joellithgow-cms-prod-1     → port 8000 → cms.joellithgow.com
  ├── joellithgow-cms-staging-1  → port 8001 → cms-staging.joellithgow.com
  └── ~/backups/latest.db.gz     ← nightly cron at 2am UTC
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

**Note:** prod DB is intentionally empty during development — all live content is in staging. Seed prod before launch.

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
docker-compose.yml              # EC2: cms-prod (:8000) + cms-staging (:8001)
Dockerfile                      # CMS image (uv + starlette-cms workspace)
scripts/
  backup-prod-db.sh             # runs on EC2 — backs up prod container → ~/backups/
  restore-db.sh                 # runs on EC2 — restores .db.gz into a container
cms/
  main.py                       # CMS app entrypoint
  schema.py                     # document type definitions
  seed.py                       # one-time seed (MD/MDX → CMS API)
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

- The astraeus monorepo must be checked out as a sibling directory (`../astraeus/`) — the Dockerfile copies from it at build time.
- `bun run dev` hangs if the CMS is unreachable — always run `make cms-up` or `make dev` instead of bare `bun run dev`.
- The content loader returns `[]` silently if `ASTRAEUS_API_KEY` is unset — useful for skipping CMS during pure frontend work.
- Docker Desktop on Mac: volume paths (`/var/lib/docker/volumes/...`) are inside a VM — always use `docker cp` to move files in/out of containers, never direct volume path access.
