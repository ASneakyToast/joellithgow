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
	@echo "✅ CMS local running at http://localhost:8001"

## Stop the local CMS container
.PHONY: cms-down
cms-down:
	docker compose -f docker-compose.local.yml down

## Pull the latest prod backup from EC2 and restore into the local CMS container
## Note: prod DB is intentionally empty before launch — use db-sync-staging for content
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

## Pull the live staging DB from EC2 and restore locally — use this to get real content
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
		-d '{"url":"http://localhost:4321/__cms-reload","events":["document.published","changeset.published"]}' \
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

## Rebuild the local CMS Docker image (after Dockerfile or CMS source changes)
.PHONY: cms-build
cms-build:
	docker compose -f docker-compose.local.yml build

# ── EC2 / Production ─────────────────────────────────────────────────────────

## SSH into the EC2 instance
.PHONY: ssh
ssh:
	ssh $(EC2_HOST)

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
	@echo "  make db-sync          Pull latest prod backup → restore local DB (usually empty)"
	@echo "  make db-sync-staging  Pull live staging DB → restore local (has real content)"
	@echo "  make cms-migrate      Run pending migrations on local CMS container"
	@echo "  make cms-build        Rebuild local CMS image"
	@echo "  make cms-webhook-local  Re-register local reload webhook (auto-runs after db-sync)"
	@echo ""
	@echo "EC2 / Production"
	@echo "  make ssh              SSH into EC2"
	@echo "  make backup           Backup prod DB on EC2 right now"
	@echo "  make staging-restore  Restore latest backup into staging + restart"
	@echo "  make staging-restart  Restart staging container only"
	@echo "  make prod-restart     Restart prod container"
	@echo "  make cron-install     Install nightly 2am backup cron on EC2"
	@echo "  make cron-list        Show EC2 crontab"
	@echo ""
