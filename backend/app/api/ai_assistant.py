from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

try:
    from backend.app.core.database import get_db
    from backend.app.models.schemas import AIQueryRequest, AIQueryResponse
    from backend.app.services.ai_service import AIAssistantService
except ImportError:
    from app.core.database import get_db
    from app.models.schemas import AIQueryRequest, AIQueryResponse
    from app.services.ai_service import AIAssistantService

router = APIRouter(prefix="/assistant", tags=["AI Assistant"])


@router.post("/query", response_model=AIQueryResponse)
def ask_foresight(payload: AIQueryRequest, db: Session = Depends(get_db)):
    res = AIAssistantService.answer_query(payload.prompt, db)
    return AIQueryResponse(answer=res["answer"], summary_data=res.get("summary_data"))
