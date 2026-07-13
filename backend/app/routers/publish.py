from fastapi import APIRouter
from fastapi import Depends
from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import PublishLog
from app.schemas import PublishScheduleRequest
from app.schemas import PublishStatusRequest
from app.services.publisher_service import PublisherService


router = APIRouter(
    prefix="/publish",
    tags=["Publish Agent"]
)


@router.post("/schedule")
def schedule_publish(
    payload: PublishScheduleRequest,
    db: Session = Depends(get_db)
):

    try:
        result = PublisherService.schedule(db, payload.items)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    return {
        "message": "Content published",
        "result": result,
    }


@router.get("/logs")
def list_publish_logs(db: Session = Depends(get_db)):

    return (
        db.query(PublishLog)
        .order_by(PublishLog.created_at.desc())
        .all()
    )


@router.put("/logs/{log_id}/status")
def update_publish_status(
    log_id: int,
    payload: PublishStatusRequest,
    db: Session = Depends(get_db)
):

    log = PublisherService.update_status(
        db,
        log_id,
        payload.status,
        payload.post_url,
        payload.external_post_id,
        payload.response_message
    )

    if not log:
        raise HTTPException(status_code=404, detail="Publish log not found")

    return log
