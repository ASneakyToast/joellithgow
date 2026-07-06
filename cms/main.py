"""
CMS application entrypoint.

Wires the CMS instance, registers document types from schema.py,
and mounts everything under the Starlette app lifespan.
"""
import json
import os
from starlette.applications import Starlette
from starlette.routing import Mount
from starlette_cms import CMS
from starlette_editor import Editor
from starlette_cms_gateways.admin import GatewayAdmin
from starlette_chat import ChatAPI, register_blocks
from starlette_chat.providers.openai import OpenAICompatibleProvider
from cms.schema import register_documents

DATABASE_URL = os.environ.get("DATABASE_URL", "sqlite:///./cms/data/content.db")
API_KEY = os.environ.get("CMS_API_KEY", "dev-secret")

# Session auth for the inline editor.
# CMS_SESSION_SECRET: random secret for signing session tokens.
# CMS_ADMIN_USERS: JSON object mapping username → bcrypt hash, e.g.
#   {"joel": "$2b$12$..."}
SESSION_SECRET = os.environ.get("CMS_SESSION_SECRET")
_admin_users_raw = os.environ.get("CMS_ADMIN_USERS")
ADMIN_USERS: dict[str, str] | None = json.loads(_admin_users_raw) if _admin_users_raw else None

# CORS origins for the inline editor embed script.
# Allows the Astro site to make credentialed cross-origin requests to the CMS.
# CMS_CORS_ORIGINS: comma-separated list, e.g. "http://localhost:4321,https://joellithgow.com"
_cors_raw = os.environ.get("CMS_CORS_ORIGINS", "")
CORS_ORIGINS: list[str] = [o.strip() for o in _cors_raw.split(",") if o.strip()]

cms = CMS(
    database_url=DATABASE_URL,
    auth="apikey",
    api_key=API_KEY,
    read_auth=False,
    mount_path="/",
    session_secret=SESSION_SECRET,
    admin_users=ADMIN_USERS,
    cors_origins=CORS_ORIGINS,
)

register_documents(cms)
register_blocks(cms)  # chat block types — must come before cms.app is accessed

editor = Editor(cms=cms)
gateway_admin = GatewayAdmin(cms=cms)

# LM Studio (local) or OpenAI — set OPENAI_API_KEY + OPENAI_BASE_URL to override.
# Defaults to LM Studio at http://localhost:1234/v1.
_chat_base_url = os.environ.get("OPENAI_BASE_URL", "http://localhost:1234/v1")
_chat_api_key = os.environ.get("OPENAI_API_KEY", "lm-studio")
_chat_model = os.environ.get("CHAT_MODEL", "local-model")
_cms_base_url = os.environ.get("CMS_BASE_URL", "http://localhost:8000")

chat = ChatAPI(
    cms_base_url=_cms_base_url,
    cms_api_key=API_KEY,
    provider=OpenAICompatibleProvider(
        base_url=_chat_base_url,
        api_key=_chat_api_key,
        default_model=_chat_model,
    ),
)

app = Starlette(
    routes=[
        Mount("/editor", app=editor.app),
        Mount("/gateways", app=gateway_admin.app),
        Mount("/chat", app=chat.app),
        Mount("/", app=cms.app),
    ],
    lifespan=cms.lifespan,
)
