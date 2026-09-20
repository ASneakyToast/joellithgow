FROM python:3.12-slim AS builder

# Install uv + git (git needed for path-dependency sources)
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/
RUN apt-get update && apt-get install -y git && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# ------------------------------------------------------------------
# Clone astraeus so pyproject.toml's ../astraeus/... paths resolve
# ------------------------------------------------------------------
# Uses the default branch; to pin, change to:
#   RUN git clone --depth 1 --branch v0.5.0 https://github.com/ASneakyToast/astraeus.git
RUN git clone --depth 1 https://github.com/ASneakyToast/astraeus.git

# Copy project manifest and sync deps
COPY joellithgow/pyproject.toml joellithgow/uv.lock* ./joellithgow/
WORKDIR /app/joellithgow
RUN uv sync --no-dev

# ------------------------------------------------------------------
# Runtime stage — discard build-only deps (git, apt artifacts)
# ------------------------------------------------------------------
FROM python:3.12-slim

COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

WORKDIR /app

# Copy the fully-synced venv + astraeus from builder
COPY --from=builder /app/astraeus ./astraeus
COPY --from=builder /app/joellithgow/.venv ./joellithgow/.venv
COPY --from=builder /app/joellithgow/pyproject.toml /app/joellithgow/uv.lock* ./joellithgow/

# Copy CMS source and piccolo migration config
COPY joellithgow/cms/ ./joellithgow/cms/
COPY joellithgow/piccolo_conf.py ./joellithgow/piccolo_conf.py
COPY joellithgow/scripts/ ./joellithgow/scripts/
RUN mkdir -p /app/joellithgow/cms/data

WORKDIR /app/joellithgow
ENV PATH="/app/joellithgow/.venv/bin:$PATH"

EXPOSE 8000

CMD ["uv", "run", "uvicorn", "cms.main:app", "--host", "0.0.0.0", "--port", "8000"]