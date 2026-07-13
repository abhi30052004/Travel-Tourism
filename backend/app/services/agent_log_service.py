from sqlalchemy.orm import Session

from app.models import AgentRun


class AgentLogService:

    @staticmethod
    def log(
        db: Session,
        agent_name: str,
        action: str,
        status: str,
        message: str
    ):

        run = AgentRun(
            agent_name=agent_name,
            action=action,
            status=status,
            message=message
        )

        db.add(run)
        db.commit()
        db.refresh(run)

        return run
