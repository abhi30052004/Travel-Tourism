from fastapi import APIRouter
from fastapi import Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas import ScoringRunRequest
from app.services.scoring_service import ScoringService


router = APIRouter(
    prefix="/scoring",
    tags=["Scoring Agent"]
)


@router.post("/run")
def run_scoring(
    payload: ScoringRunRequest = ScoringRunRequest(),
    db: Session = Depends(get_db)
):

    result = ScoringService.run(
        db,
        limit=payload.limit,
        city=payload.city,
        only_unscored=payload.only_unscored
    )

    return {
        "message": "Scoring completed",
        "result": result,
    }
