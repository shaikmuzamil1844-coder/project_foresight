import sys
import os

_base = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if _base not in sys.path:
    sys.path.insert(0, _base)

try:
    from app.main import app
except Exception as e:
    import traceback
    err_str = f"{e}\n{traceback.format_exc()}"
    from fastapi import FastAPI
    app = FastAPI()

    @app.get("/{full_path:path}")
    @app.post("/{full_path:path}")
    def error_fallback(full_path: str):
        return {"status": "import_error", "detail": err_str}
