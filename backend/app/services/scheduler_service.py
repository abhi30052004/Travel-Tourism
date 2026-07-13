from app.config import ENABLE_RSS_SCHEDULER
from app.config import RSS_SCHEDULE_HOUR
from app.config import RSS_SCHEDULE_MINUTE
from app.config import RSS_SCHEDULE_TIMEZONE
from app.database import SessionLocal
from app.models import Feed
from app.services.agent_log_service import AgentLogService
from app.services.rss_service import RSSService
from app.services.scoring_service import ScoringService


class SchedulerService:

    scheduler = None

    @staticmethod
    def run_rss_collector_cycle():

        db = SessionLocal()

        try:
            fetch_result = RSSService.fetch_all(db)
            unscored_count = (
                db.query(Feed)
                .filter(
                    Feed.approval_status == "pending",
                    Feed.scoring_reason.is_(None)
                )
                .count()
            )
            if unscored_count > 0:
                score_result = ScoringService.run(
                    db,
                    limit=unscored_count,
                    only_unscored=True
                )
            else:
                score_result = {
                    "scored": 0,
                    "shortlisted": []
                }
            AgentLogService.log(
                db,
                "scheduler",
                "daily_rss_collector_cycle",
                "completed",
                (
                    f"Daily 09:00 cycle completed. "
                    f"Inserted {fetch_result.get('inserted', 0)} feeds; "
                    f"shortlisted {len(score_result.get('shortlisted', []))} stories."
                )
            )
        except Exception as exc:
            AgentLogService.log(
                db,
                "scheduler",
                "daily_rss_collector_cycle",
                "failed",
                str(exc)
            )
            raise
        finally:
            db.close()

    @staticmethod
    def start():

        if not ENABLE_RSS_SCHEDULER:
            return None

        if SchedulerService.scheduler:
            return SchedulerService.scheduler

        try:
            from apscheduler.schedulers.background import BackgroundScheduler
        except ImportError:
            print(
                "APScheduler is not installed. "
                "Install backend requirements to enable daily RSS scheduling."
            )
            return None

        scheduler = BackgroundScheduler(
            timezone=RSS_SCHEDULE_TIMEZONE
        )
        scheduler.add_job(
            SchedulerService.run_rss_collector_cycle,
            trigger="cron",
            hour=RSS_SCHEDULE_HOUR,
            minute=RSS_SCHEDULE_MINUTE,
            id="daily_rss_collector_cycle",
            replace_existing=True,
        )
        scheduler.start()
        SchedulerService.scheduler = scheduler

        print(
            "Daily RSS Collector scheduled at "
            f"{RSS_SCHEDULE_HOUR:02d}:{RSS_SCHEDULE_MINUTE:02d} "
            f"{RSS_SCHEDULE_TIMEZONE}."
        )

        return scheduler

    @staticmethod
    def shutdown():

        if SchedulerService.scheduler:
            SchedulerService.scheduler.shutdown(wait=False)
            SchedulerService.scheduler = None
