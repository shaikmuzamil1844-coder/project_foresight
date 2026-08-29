import sys
import os

# Ensure the parent of "app" is on the path so imports resolve correctly
# whether run as "backend.app.main" (local) or "app.main" (Vercel serverless)
_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if _root not in sys.path:
    sys.path.insert(0, _root)

from app.main import app  # noqa: F401 – re-exported for Vercel
