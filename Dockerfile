FROM python:3.12-slim

# Install uv
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

WORKDIR /app

# Copy astraeus packages so pyproject.toml's ../astraeus/... paths resolve
COPY astraeus/packages/starlette-cms ./astraeus/packages/starlette-cms
COPY astraeus/packages/starlette-editor ./astraeus/packages/starlette-editor

# Copy project manifest and sync deps
COPY joellithgow/pyproject.toml joellithgow/uv.lock* ./joellithgow/
WORKDIR /app/joellithgow
RUN uv sync --no-dev

# Copy CMS source
COPY joellithgow/cms/ ./cms/
RUN mkdir -p cms/data

EXPOSE 8000

CMD ["uv", "run", "uvicorn", "cms.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
