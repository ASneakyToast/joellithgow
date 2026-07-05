"""
Piccolo configuration for the joellithgow deployer project.

Used by the ``piccolo`` CLI when running migrations::

    # Fresh install:
    piccolo migrations forwards starlette_cms

    # Existing install (one-time fake to register existing schema):
    piccolo migrations forwards --fake starlette_cms
"""

import os

from piccolo.conf.apps import AppRegistry
from piccolo.engine.sqlite import SQLiteEngine

DB = SQLiteEngine(
    path=os.environ.get("SQLITE_PATH", "cms/data/content.db")
)

APP_REGISTRY = AppRegistry(apps=["starlette_cms.piccolo_app"])
