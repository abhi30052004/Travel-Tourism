from fastapi import APIRouter
from fastapi import Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import AgentRun


router = APIRouter(
    prefix="/agent-runs",
    tags=["Agent Runs"]
)


@router.get("/")
def list_agent_runs(db: Session = Depends(get_db)):

    return (
        db.query(AgentRun)
        .order_by(AgentRun.created_at.desc())
        .all()
    )
