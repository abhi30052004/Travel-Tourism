from datetime import datetime

from sqlalchemy.orm import Session

from app.models import GeneratedContent
from app.models import PublishLog
from app.services.agent_log_service import AgentLogService


class PublisherService:

    @staticmethod
    def schedule(db: Session, items):

        created_logs = []

        for item in items:
            content = (
                db.query(GeneratedContent)
                .filter(GeneratedContent.id == item.content_id)
                .first()
            )

            if not content:
                raise ValueError(f"Content {item.content_id} was not found.")

            if content.status != "approved":
                raise ValueError(
                    f"Content {item.content_id} must be human-approved before scheduling."
                )

            if content.validation_status not in {
                "passed",
                "needs_human_attention",
            }:
                raise ValueError(
                    f"Content {item.content_id} must pass brand validation before scheduling."
                )

            content.scheduled_publish_time = item.scheduled_publish_time
            existing_log = (
                db.query(PublishLog)
                .filter(
                    PublishLog.content_id == content.id,
                    PublishLog.platform == item.platform,
                    PublishLog.status.in_(
                        ["queued", "manual_publish_required", "published"]
                    )
                )
                .first()
            )

            if existing_log:
                existing_log.scheduled_publish_time = item.scheduled_publish_time
                existing_log.status = "published"
                existing_log.published_at = datetime.utcnow()
                existing_log.response_message = (
                    "Auto-published after human approval. External platform "
                    "API posting is not configured."
                )
                log = existing_log
            else:
                log = PublishLog(
                    content_id=content.id,
                    platform=item.platform,
                    status="published",
                    scheduled_publish_time=item.scheduled_publish_time,
                    published_at=datetime.utcnow(),
                    response_message=(
                        "Auto-published after human approval. External platform "
                        "API posting is not configured."
                    ),
                )
                db.add(log)
                db.flush()

            content.status = "published"
            created_logs.append(log.id)

        db.commit()

        AgentLogService.log(
            db,
            "publish_agent",
            "schedule",
            "completed",
            f"Auto-published {len(created_logs)} publish items."
        )

        return {
            "published": created_logs,
            "mode": "auto_publish_after_approval",
        }

    @staticmethod
    def update_status(
        db: Session,
        log_id: int,
        status: str,
        post_url: str | None = None,
        external_post_id: str | None = None,
        response_message: str | None = None
    ):

        log = (
            db.query(PublishLog)
            .filter(PublishLog.id == log_id)
            .first()
        )

        if not log:
            return None

        log.status = status
        log.post_url = post_url or log.post_url
        log.external_post_id = external_post_id or log.external_post_id
        log.response_message = response_message or log.response_message

        if status == "published":
            log.published_at = datetime.utcnow()
            log.content.status = "published"

        db.commit()
        db.refresh(log)

        AgentLogService.log(
            db,
            "publish_agent",
            "update_status",
            "completed",
            f"Updated publish log {log.id} to {status}."
        )

        return log
