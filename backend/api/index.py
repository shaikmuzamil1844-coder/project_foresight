import sys
import os
import traceback
from fastapi import FastAPI

_base = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if _base not in sys.path:
    sys.path.insert(0, _base)

try:
    from app.main import app
except Exception as e:
    err_str = f"{e}\n{traceback.format_exc()}"
    app = FastAPI()

    @app.get("/{full_path:path}")
    @app.post("/{full_path:path}")
    def fallback(full_path: str):
        return {"error": "Server initialization error", "details": err_str}

