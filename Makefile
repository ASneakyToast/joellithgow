EC2_HOST    := joellithgow-cms
BACKUP_DIR  := $(HOME)/backups
LOCAL_BACKUP := /tmp/joellithgow-latest.db.gz

# ── Local dev ────────────────────────────────────────────────────────────────

## Start local CMS + Astro dev server (assumes db-sync has been run at least once)
.PHONY: dev
dev: cms-up
	bun run dev

## Start the local CMS container (without Astro)
.PHONY: cms-up
cms-up:
	docker compose -f docker-compose.local.yml up -d
	@echo "⏳ Waiting for CMS to be ready..."
	@until curl -s -o /dev/null http://localhost:8001/ 2>/dev/null; do sleep 0.5; done
	@echo "✅ CMS local running at http://localhost:8001"

## Stop the local CMS container
.PHONY: cms-down
cms-down:
	docker compose -f docker-compose.local.yml down

## Pull the latest prod backup from EC2 and restore into the local CMS container
## Prod is the content home now, so this pulls real content (staging is scratch/empty)
.PHONY: db-sync
db-sync: cms-up
	@echo "⬇️  Pulling latest prod backup from $(EC2_HOST)..."
	scp $(EC2_HOST):~/backups/latest.db.gz $(LOCAL_BACKUP)
	@echo "🔄 Restoring into cms-local..."
	@CONTAINER=$$(docker compose -f docker-compose.local.yml ps -q cms-local); \
	gunzip -c $(LOCAL_BACKUP) > /tmp/joellithgow-restore.db; \
	docker cp /tmp/joellithgow-restore.db $$CONTAINER:/app/joellithgow/cms/data/content.db; \
	rm -f /tmp/joellithgow-restore.db
	@docker compose -f docker-compose.local.yml restart cms-local
	@make cms-migrate
	@make cms-webhook-local
	@echo "✅ Local DB restored (prod) and cms-local restarted"

## Pull the live staging DB from EC2 and restore locally. NOTE: staging is currently
## empty/scratch — use `make db-sync` (prod) for real content unless you've populated staging.
.PHONY: db-sync-staging
db-sync-staging: cms-up
	@echo "⬇️  Pulling staging DB from $(EC2_HOST)..."
	@ssh $(EC2_HOST) "docker exec joellithgow-cms-staging-1 cat /app/joellithgow/cms/data/content.db" \
		| gzip > $(LOCAL_BACKUP)
	@echo "🔄 Restoring into cms-local..."
	@CONTAINER=$$(docker compose -f docker-compose.local.yml ps -q cms-local); \
	gunzip -c $(LOCAL_BACKUP) > /tmp/joellithgow-restore.db; \
	docker cp /tmp/joellithgow-restore.db $$CONTAINER:/app/joellithgow/cms/data/content.db; \
	rm -f /tmp/joellithgow-restore.db
	@docker compose -f docker-compose.local.yml restart cms-local
	@make cms-migrate
	@make cms-webhook-local
	@echo "✅ Local DB restored (staging) and cms-local restarted"

## Register the local dev reload webhook on the local CMS (re-run after db-sync wipes it)
## Enables: publish in inline editor → browser auto-reloads at localhost:4321
.PHONY: cms-webhook-local
cms-webhook-local:
	@curl -sf -X POST http://localhost:8001/api/webhooks \
		-H "Authorization: Bearer local-secret" \
		-H "Content-Type: application/json" \
		-d '{"url":"http://host.docker.internal:4322/__cms-reload","events":["document.published","changeset.published"]}' \
		| grep -q '"active":true' && echo "✅ Local reload webhook registered" \
		|| echo "⚠️  Already registered or CMS not running"

## Run pending Piccolo migrations on the local CMS container
## Fakes migrations for tables that already exist (safe to run on a restored DB)
.PHONY: cms-migrate
cms-migrate:
	@echo "🔄 Running migrations on cms-local..."
	@CONTAINER=$$(docker compose -f docker-compose.local.yml ps -q cms-local); \
	docker exec $$CONTAINER sh -c " \
		uv run piccolo migrations forwards starlette_cms --fake 2>/dev/null | grep -q 'already complete' && \
		uv run piccolo migrations forwards starlette_cms 2>&1 | grep -v 'already exists' || true \
	" 2>&1 || \
	docker exec $$CONTAINER sh -c " \
		for id in \$$(uv run piccolo migrations check 2>&1 | awk '/False/{print \$$1}'); do \
			uv run piccolo migrations forwards starlette_cms --migration_id=\$$id --fake 2>/dev/null || \
			uv run piccolo migrations forwards starlette_cms --migration_id=\$$id 2>/dev/null || true; \
		done \
	"
	@echo "✅ Migrations complete"

## Seed ModelConfig + SystemPrompt for AI chat (run once after cms-up)
.PHONY: chat-seed
chat-seed:
	docker exec $$(docker compose -f docker-compose.local.yml ps -q cms-local) \
		uv run python -m cms.seed \
		--cms-url http://localhost:8000 \
		--api-key $${CMS_API_KEY:-local-secret} \
		--chat-config

## Rebuild the local CMS Docker image (after Dockerfile or CMS source changes)
.PHONY: cms-build
cms-build:
	docker compose -f docker-compose.local.yml build

# ── EC2 / Production ─────────────────────────────────────────────────────────

## SSH into the EC2 instance
.PHONY: ssh
ssh:
	ssh $(EC2_HOST)

## List CMS webhook rows across prod + staging (read-only)
.PHONY: webhooks
webhooks:
	@ssh $(EC2_HOST) 'bash -s' < scripts/list-webhooks.sh

## Trigger a backup of the prod DB on EC2 right now
.PHONY: backup
backup:
	ssh $(EC2_HOST) "cd ~/joellithgow && bash scripts/backup-prod-db.sh"

## Restore the latest prod backup into staging on EC2 and restart the container
.PHONY: staging-restore
staging-restore:
	ssh $(EC2_HOST) "cd ~/joellithgow && bash scripts/restore-db.sh \$$HOME/backups/latest.db.gz joellithgow-cms-staging-1"
	ssh $(EC2_HOST) "docker restart joellithgow-cms-staging-1"
	@echo "✅ Staging restored from latest backup and restarted"

## Restart the staging CMS container on EC2
.PHONY: staging-restart
staging-restart:
	ssh $(EC2_HOST) "docker restart joellithgow-cms-staging-1"
	@echo "✅ Staging restarted"

## Restart the prod CMS container on EC2
.PHONY: prod-restart
prod-restart:
	ssh $(EC2_HOST) "docker restart joellithgow-cms-prod-1"
	@echo "✅ Prod restarted"

# ── Deploying astraeus changes ───────────────────────────────────────────────
#
# The image is built in CI and pulled here. The box has 908MB of RAM; building
# on it ran `git clone` plus a full `uv sync` alongside the running services and
# OOM-killed BuildKit repeatedly.
#
# A deploy is therefore: trigger the build, wait for it, pull, restart. The
# astraeus commit is baked into the image as $ASTRAEUS_REF, so `deployed-ref`
# can report what is actually running.

ASTRAEUS_REPO := https://github.com/ASneakyToast/astraeus

## Build the CMS image in CI against the latest astraeus main, and wait for it
.PHONY: image-build
image-build:
	@REF=$$(git ls-remote $(ASTRAEUS_REPO) main | cut -f1); \
	test -n "$$REF" || { echo "❌ could not resolve astraeus main — network?"; exit 1; }; \
	echo "🔖 astraeus ref: $$REF"; \
	gh workflow run build-cms.yml -f astraeus_ref=$$REF; \
	echo "⏳ waiting for the run to start..."; sleep 8; \
	gh run watch $$(gh run list --workflow=build-cms.yml --limit 1 --json databaseId --jq '.[0].databaseId') --exit-status

## Pull the freshly built image on EC2 and restart a service
.PHONY: pull-restart-%
pull-restart-%:
	ssh $(EC2_HOST) "cd ~/joellithgow && git pull && docker compose pull cms-$* && docker compose up -d cms-$*"
	@$(MAKE) --no-print-directory disk-reclaim

## Drop images and build cache the running containers no longer reference.
## The box has an 8.6G disk and every deploy leaves the previous image behind;
## without this a pull eventually fails mid-extract with "no space left".
.PHONY: disk-reclaim
disk-reclaim:
	@ssh $(EC2_HOST) 'docker image prune -af >/dev/null 2>&1; \
	  docker builder prune -af >/dev/null 2>&1; \
	  df -h / | awk "NR==2 {printf \"disk: %s used of %s (%s)\\n\", \$$3, \$$2, \$$5}"'

## Build in CI, then deploy to staging (:8001)
.PHONY: staging-deploy
staging-deploy: image-build pull-restart-staging
	@echo "✅ Staging updated on $(EC2_HOST):8001"

## Build in CI, then deploy to prod (:8000)
.PHONY: prod-deploy
prod-deploy: image-build pull-restart-prod
	@echo "✅ Prod updated on $(EC2_HOST):8000"

## Deploy an already-built image without rebuilding (e.g. prod after staging)
.PHONY: prod-deploy-nobuild
prod-deploy-nobuild: pull-restart-prod
	@echo "✅ Prod updated from the current latest image"

## Stop staging. It exists to smoke-test a deploy, not to run continuously —
## leave it stopped between uses so it costs nothing on a small box.
.PHONY: staging-stop
staging-stop:
	ssh $(EC2_HOST) "cd ~/joellithgow && docker compose stop cms-staging"
	@echo "✅ Staging stopped"

## Report the astraeus commit each running container was built against.
## Reads the ASTRAEUS_REF baked in at build time — the runtime image has no git,
## and a registry-pulled image carries no .git at all.
.PHONY: deployed-ref
deployed-ref:
	@ssh $(EC2_HOST) 'for c in joellithgow-cms-prod-1 joellithgow-cms-staging-1; do \
	  printf "%-34s" "$$c"; \
	  ref=$$(docker exec "$$c" printenv ASTRAEUS_REF 2>/dev/null | cut -c1-7); \
	  echo "$${ref:-unknown (stopped, or image predates the baked ref)}"; \
	done'
	@printf "%-34s%s\n" "astraeus main (latest)" "$$(git ls-remote $(ASTRAEUS_REPO) main | cut -c1-7)"

## Build + (re)start the MCP sidecars on EC2. First run builds the self-contained
## image (Dockerfile change); later runs pick up ./cms edits after the git pull.
.PHONY: mcp-deploy
mcp-deploy:
	ssh $(EC2_HOST) "cd ~/joellithgow && git pull && docker compose up -d --build cms-mcp cms-gateway-mcp"
	@echo "✅ MCP sidecars built + running on $(EC2_HOST) (loopback :8002 content, :8003 gateway)"

## Deploy the Caddyfile to EC2 and reload. The MCP bearer token lives server-side
## in /etc/caddy/mcp.env (see the Caddyfile header for one-time setup) — not managed
## here. Reload uses the running Caddy's env, so the token stays applied.
.PHONY: caddy-deploy
caddy-deploy:
	scp Caddyfile $(EC2_HOST):/tmp/Caddyfile
	ssh $(EC2_HOST) "sudo cp /tmp/Caddyfile /etc/caddy/Caddyfile && sudo caddy validate --adapter caddyfile --config /etc/caddy/Caddyfile && sudo systemctl reload caddy"
	@echo "✅ Caddyfile deployed + reloaded on $(EC2_HOST)"

## Install the nightly backup cron on EC2 (runs at 2am UTC)
.PHONY: cron-install
cron-install:
	ssh $(EC2_HOST) '(crontab -l 2>/dev/null | grep -v backup-prod-db; echo "0 2 * * * cd ~/joellithgow && bash scripts/backup-prod-db.sh >> ~/backups/backup.log 2>&1") | crontab -'
	@echo "✅ Nightly backup cron installed on $(EC2_HOST) (2am UTC)"

## Show cron jobs on EC2
.PHONY: cron-list
cron-list:
	ssh $(EC2_HOST) "crontab -l"

# ── Help ─────────────────────────────────────────────────────────────────────

.PHONY: help
help:
	@echo ""
	@echo "Local dev"
	@echo "  make dev              Start CMS + Astro HMR"
	@echo "  make cms-up           Start local CMS only"
	@echo "  make cms-down         Stop local CMS"
	@echo "  make db-sync          Pull latest prod backup → restore local DB (real content)"
	@echo "  make db-sync-staging  Pull live staging DB → restore local (staging is scratch/empty)"
	@echo "  make cms-migrate      Run pending migrations on local CMS container"
	@echo "  make cms-build        Rebuild local CMS image"
	@echo "  make chat-seed        Seed system_prompt + model_config for AI chat (run once)"
	@echo "  make cms-webhook-local  Re-register local reload webhook (auto-runs after db-sync)"
	@echo ""
	@echo "EC2 / Production"
	@echo "  make ssh              SSH into EC2"
	@echo "  make webhooks         List CMS webhook rows across prod + staging"
	@echo "  make backup           Backup prod DB on EC2 right now"
	@echo "  make staging-restore  Restore latest backup into staging + restart"
	@echo "  make staging-restart  Restart staging container only"
	@echo "  make prod-restart     Restart prod container (does NOT pick up astraeus changes)"
	@echo ""
	@echo "Deploying astraeus changes"
	@echo "  make deployed-ref     Show which astraeus commit each container is running"
	@echo "  make image-build      Build the CMS image in CI against latest astraeus main"
	@echo "  make staging-deploy   Build in CI + deploy to staging (:8001)"
	@echo "  make prod-deploy      Build in CI + deploy to prod (:8000)"
	@echo "  make prod-deploy-nobuild  Deploy the current image to prod without rebuilding"
	@echo "  make staging-stop     Stop staging when done smoke-testing"
	@echo "  make disk-reclaim     Drop unreferenced images + build cache on EC2"
	@echo "  make mcp-deploy       Build + start MCP sidecars on EC2 (content :8002, gateway :8003)"
	@echo "  make caddy-deploy     Deploy Caddyfile to EC2 + reload"
	@echo "  make cron-install     Install nightly 2am backup cron on EC2"
	@echo "  make cron-list        Show EC2 crontab"
	@echo ""
