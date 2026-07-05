FROM python:3.12-slim

# Install uv
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

WORKDIR /app

# Copy astraeus workspace so pyproject.toml's ../astraeus/... paths resolve
# The workspace pyproject.toml is needed so uv treats the packages as workspace members
COPY astraeus/pyproject.toml ./astraeus/pyproject.toml
COPY astraeus/packages/starlette-cms ./astraeus/packages/starlette-cms
COPY astraeus/packages/starlette-editor ./astraeus/packages/starlette-editor
COPY astraeus/packages/starlette-cms-gateways ./astraeus/packages/starlette-cms-gateways

# Copy project manifest and sync deps (including the project itself so entry points register)
COPY joellithgow/pyproject.toml joellithgow/uv.lock* ./joellithgow/
WORKDIR /app/joellithgow
RUN uv sync --no-dev && uv pip install -e .

# Copy CMS source and piccolo migration config
COPY joellithgow/cms/ ./cms/
COPY joellithgow/piccolo_conf.py ./piccolo_conf.py
RUN mkdir -p cms/data

EXPOSE 8000

CMD ["uv", "run", "uvicorn", "cms.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
