# ──────────────────────────────────────────────────────────────────────────────
# joellithgow — Makefile
#
# Targets:
#   dev-cms       Run CMS locally with hot-reload for development
#   dev-astro     Run Astro frontend dev server (points at local CMS)
#   lint          Run Python + JS linters
#   ec2-pull      Pull latest code on EC2 (requires `aws` + valid profile)
#   ec2-build     Build + restart a single service on EC2
#   ec2-deploy    Full deploy: pull + build + restart staging
#   ec2-prod      Full deploy: pull + build + restart production
#   backup-staging   Snapshot staging DB locally (no S3)
#   backup-prod      Snapshot prod DB locally (no S3)
#   db-sync      Copy prod DB to local (for testing against real data)
#   health       Quick MCP health check via curl
#
# AWS credentials:
#   Requires `~/.aws/credentials` with a [hermes-agent] profile that has
#   ssm:SendCommand + ssm:StartSession permissions.
# ──────────────────────────────────────────────────────────────────────────────

SHELL := /bin/bash
INSTANCE_ID := i-055cca1a96c896e7f
AWS_REGION := us-east-2
AWS_PROFILE := hermes-agent
SSM_OPTS := --instance-ids $(INSTANCE_ID) --document-name AWS-RunShellScript --profile $(AWS_PROFILE) --region $(AWS_REGION)

# ── Dev ──────────────────────────────────────────────────────────────────────

.PHONY: dev-cms
dev-cms:  ## Run CMS locally with hot-reload
	uv run uvicorn cms.main:app --reload --port 8000

.PHONY: dev-astro
dev-astro:  ## Run Astro frontend (points at localhost CMS for dev)
	ASTRAEUS_URL=http://localhost:8000 npm run dev

.PHONY: lint
lint:  ## Run all linters
	cd .. && uv run ruff check joellithgow/cms/
	cd .. && uv run ruff format --check joellithgow/cms/
	npm run lint

# ── EC2 Deploy (SSM send-command) ──────────────────────────────────────────

.PHONY: ec2-pull
ec2-pull:  ## Pull latest code on EC2 (both repos)
	@echo "Pulling latest code on EC2..."
	aws ssm send-command \
		$(SSM_OPTS) \
		--parameters commands=[
			"cd /app/astraeus && git pull",
			"cd /app/joellithgow && git pull"
		] \
		--query Command.CommandId --output text

.PHONY: ec2-build
ec2-build:  ## Build + restart ONE service (usage: make ec2-build SERVICE=cms-staging)
	@test -n "$(SERVICE)" || { echo "Usage: make ec2-build SERVICE=cms-staging"; exit 1; }
	aws ssm send-command \
		$(SSM_OPTS) \
		--parameters commands=[
			"cd /app && docker compose -f joellithgow/docker-compose.yml up -d --build $(SERVICE)"
		] \
		--query Command.CommandId --output text

.PHONY: ec2-deploy
ec2-deploy: ec2-pull  ## Full staging deploy: pull + build + restart
	aws ssm send-command \
		$(SSM_OPTS) \
		--parameters commands=[
			"cd /app && docker compose -f joellithgow/docker-compose.yml up -d --build cms-staging cms-mcp-staging"
		] \
		--query Command.CommandId --output text
	@echo "⏳ Deploy triggered. Wait ~30s then verify with: make health URL=http://cms-staging.joellithgow.com:8001"

.PHONY: ec2-prod
ec2-prod: ec2-pull  ## Full prod deploy: pull + build + restart
	aws ssm send-command \
		$(SSM_OPTS) \
		--parameters commands=[
			"cd /app && docker compose -f joellithgow/docker-compose.yml up -d --build cms-prod cms-mcp"
		] \
		--query Command.CommandId --output text
	@echo "🚀 Prod deploy triggered."

# ── Database ─────────────────────────────────────────────────────────────────

.PHONY: db-sync
db-sync:  ## Copy prod DB to local for testing
	@echo "Use SSM to stream the prod DB..."
	aws ssm start-session \
		--target $(INSTANCE_ID) \
		--profile $(AWS_PROFILE) \
		--region $(AWS_REGION) \
		--document-name AWS-StartPortForwardingSessionToRemoteHost \
		--parameters '{"host":["localhost"],"portNumber":["8000"],"localPortNumber":["9999"]}'

.PHONY: backup-staging
backup-staging:  ## Snapshot staging DB locally (no S3 upload needed)
	docker compose exec cms-staging \
		uv run python -c "
import shutil, time
from pathlib import Path
src=Path('/app/joellithgow/cms/data/content.db')
dst=Path('/app/joellithgow/cms/data/backups/')
dst.mkdir(parents=True, exist_ok=True)
backup=dst/f'content_{time.strftime(\"%Y%m%d_%H%M%S\")}.db'
shutil.copy2(src, backup)
print(f'✅ Backed up to {backup}')
"

.PHONY: backup-prod
backup-prod:  ## Snapshot prod DB locally
	docker compose exec cms-prod \
		uv run python -c "
import shutil, time
from pathlib import Path
src=Path('/app/joellithgow/cms/data/content.db')
dst=Path('/app/joellithgow/cms/data/backups/')
dst.mkdir(parents=True, exist_ok=True)
backup=dst/f'content_{time.strftime(\"%Y%m%d_%H%M%S\")}.db'
shutil.copy2(src, backup)
print(f'✅ Backed up to {backup}')
"

# ── Health ───────────────────────────────────────────────────────────────────-

.PHONY: health
health:  ## Quick health check (override URL for staging: make health URL=http://localhost:8000)
	@URL=$(or $(URL),https://cms.joellithgow.com)
	@echo "Checking $${URL}..."
	curl -s -o /dev/null -w "%{http_code}" $${URL}/api/schema 2>/dev/null || echo "(unreachable)"

# ── Misc ─────────────────────────────────────────────────────────────────────

.PHONY: clean
clean:  ## Clean build artifacts
	rm -rf dist/ .astro/

.PHONY: help
help:  ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-18s\033[0m %s\n", $$1, $$2}'