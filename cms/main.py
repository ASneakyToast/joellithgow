"""
CMS application entrypoint.

Wires the CMS instance, registers document types from schema.py,
and mounts everything under the Starlette app lifespan.
"""
import os
from starlette.applications import Starlette
from starlette_cms import CMS
from cms.schema import register_documents

DATABASE_URL = os.environ.get("DATABASE_URL", "sqlite:///./cms/data/content.db")
API_KEY = os.environ.get("CMS_API_KEY", "dev-secret")

cms = CMS(
    database_url=DATABASE_URL,
    auth="apikey",
    api_key=API_KEY,
    read_auth=False,
)

register_documents(cms)

app = Starlette(lifespan=cms.lifespan)
app.mount("/", app=cms.app)
