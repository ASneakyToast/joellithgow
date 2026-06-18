FROM python:3.12-slim

WORKDIR /app

# Copy starlette-cms from local monorepo and install it first
COPY starlette_cms_local/ ./starlette_cms_local/
RUN pip install --no-cache-dir ./starlette_cms_local/

# Install remaining dependencies (starlette-cms already satisfied above)
COPY cms/requirements.txt ./cms/requirements.txt
RUN grep -v "starlette-cms" cms/requirements.txt | pip install --no-cache-dir -r /dev/stdin

# Copy CMS source
COPY cms/ ./cms/

# Create data directory for SQLite
RUN mkdir -p cms/data

EXPOSE 8000

CMD ["uvicorn", "cms.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
