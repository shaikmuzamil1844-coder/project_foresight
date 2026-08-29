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

    @app.middleware("http")
    async def catch_exceptions_middleware(request: Request, call_next):
        try:
            return await call_next(request)
        except Exception as exc:
            return JSONResponse(
                status_code=200,
                content={
                    "error": str(exc),
                    "traceback": traceback.format_exc(),
                    "path": request.url.path
                }
            )

except Exception as e:
    app = FastAPI()
    err_str = f"{e}\n{traceback.format_exc()}"

    @app.get("/{full_path:path}")
    @app.post("/{full_path:path}")
    def fallback(full_path: str):
        return {"import_error": err_str}
