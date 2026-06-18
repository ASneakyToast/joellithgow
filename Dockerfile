FROM python:3.12-slim

WORKDIR /app

# Install dependencies
COPY cms/requirements.txt ./cms/requirements.txt
RUN pip install --no-cache-dir -r cms/requirements.txt

# Copy CMS source
COPY cms/ ./cms/

# Create data directory for SQLite
RUN mkdir -p cms/data

EXPOSE 8000

CMD ["uvicorn", "cms.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
