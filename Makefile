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

## Pull the latest backup from EC2 and restore into the local CMS container
.PHONY: db-sync
db-sync: cms-up
	@echo "⬇️  Pulling latest backup from $(EC2_HOST)..."
	scp $(EC2_HOST):~/backups/latest.db.gz $(LOCAL_BACKUP)
	@echo "🔄 Restoring into cms-local..."
	@CONTAINER=$$(docker compose -f docker-compose.local.yml ps -q cms-local); \
	gunzip -c $(LOCAL_BACKUP) > /tmp/joellithgow-restore.db; \
	docker cp /tmp/joellithgow-restore.db $$CONTAINER:/app/joellithgow/cms/data/content.db; \
	rm -f /tmp/joellithgow-restore.db
	@docker compose -f docker-compose.local.yml restart cms-local
	@echo "✅ Local DB restored and cms-local restarted"

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
	@echo "  make db-sync          Pull latest EC2 backup → restore local DB"
	@echo "  make cms-build        Rebuild local CMS image"
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
