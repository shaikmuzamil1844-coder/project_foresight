import sys
import os
import traceback
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

_base = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if _base not in sys.path:
    sys.path.insert(0, _base)

try:
    from app.main import app
except Exception as e:
    app = FastAPI()
    err_msg = f"{e}\n{traceback.format_exc()}"
    @app.get("/{full_path:path}")
    def fallback(full_path: str):
        return {"import_error": err_msg}
