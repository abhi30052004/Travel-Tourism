import json

from sqlalchemy.orm import Session

from app.models import Feed
from app.services.agent_log_service import AgentLogService
from app.services.scoring_agent_service import ScoringAgentService


class ScoringService:

    @staticmethod
    def _feed_recommendation(feed: Feed):

        if not feed.scoring_breakdown:
            return "review"

        try:
            breakdown = json.loads(feed.scoring_breakdown)
        except json.JSONDecodeError:
            return "review"

        return breakdown.get("recommendation", "review")

    @staticmethod
    def run(
        db: Session,
        limit: int = 10,
        city: str | None = None,
        only_unscored: bool = False
    ):

        query = db.query(Feed).filter(Feed.approval_status == "pending")

        if city:
            query = query.filter(Feed.city == city)

        if only_unscored:
            query = query.filter(Feed.scoring_reason.is_(None))

        if only_unscored:
            candidate_limit = limit
        else:
            candidate_limit = min(
                max(limit * 5, limit),
                50
            )
        feeds = query.order_by(Feed.created_at.desc()).limit(candidate_limit).all()
        scored = []

        for feed in feeds:
            score = ScoringAgentService.score_feed(feed)
            factor_scores = score.get("factor_scores", {})
            recommendation = score.get("recommendation", "review")

            feed.relevance_score = int(score.get("total_score", 0))
            feed.scoring_breakdown = json.dumps(
                {
                    "criteria": factor_scores,
                    "recommendation": recommendation,
                }
            )
            feed.scoring_reason = score.get("reason", "")
            feed.scoring_confidence = float(score.get("confidence", 0))

            if score.get("suggested_category"):
                feed.category = score["suggested_category"]

            scored.append(feed)

        db.commit()

        shortlist = sorted(
            scored,
            key=lambda item: item.relevance_score or 0,
            reverse=True
        )[:limit]

        AgentLogService.log(
            db,
            "scoring_agent",
            "score_pending_feeds",
            "completed",
            f"Scored {len(scored)} feeds and shortlisted {len(shortlist)}."
        )

        return {
            "scored": len(scored),
            "shortlisted": [
                {
                    "id": feed.id,
                    "title": feed.title,
                    "city": feed.city,
                    "category": feed.category,
                    "relevance_score": feed.relevance_score,
                    "reasoning": feed.scoring_reason,
                    "recommendation": ScoringService._feed_recommendation(feed),
                    "source": feed.source_name,
                    "image_url": feed.image_url,
                }
                for feed in shortlist
            ],
        }
