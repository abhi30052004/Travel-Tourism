from fastapi import APIRouter
from fastapi import Depends
from fastapi import HTTPException

from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Feed
from app.models import RssSource
from app.schemas import FeedApprovalRequest
from app.schemas import RssSourceCreate
from app.schemas import RssSourceUpdate
from app.services.rss_service import RSSService
from app.services.scoring_service import ScoringService
from app.services.content_service import ContentService
from app.services.brand_validation_service import BrandValidationService


router = APIRouter(
    prefix="/rss-feeds",
    tags=["RSS Feeds"]
)


AI_APPROVAL_SCORE = 75
MIN_AI_APPROVED_FEEDS = 15


def get_ai_approved_ids(db: Session):

    scored_feeds = (
        db.query(Feed.id, Feed.relevance_score)
        .filter(Feed.scoring_reason.isnot(None))
        .order_by(
            Feed.relevance_score.desc(),
            Feed.created_at.desc()
        )
        .all()
    )

    high_scored_ids = [
        feed_id
        for feed_id, score in scored_feeds
        if (score or 0) > AI_APPROVAL_SCORE
    ]

    if len(high_scored_ids) >= MIN_AI_APPROVED_FEEDS:
        return set(high_scored_ids)

    return {
        feed_id
        for feed_id, _score in scored_feeds[:MIN_AI_APPROVED_FEEDS]
    }


def build_feed_counts(db: Session):

    total_fetched = db.query(Feed).count()
    ai_approved_ids = get_ai_approved_ids(db)
    scored_count = (
        db.query(Feed)
        .filter(Feed.scoring_reason.isnot(None))
        .count()
    )

    human_counts = {
        "pending": 0,
        "approved": 0,
        "rejected": 0,
    }

    if ai_approved_ids:
        rows = (
            db.query(Feed.approval_status)
            .filter(Feed.id.in_(ai_approved_ids))
            .all()
        )

        for status, in rows:
            if status in human_counts:
                human_counts[status] += 1

    return {
        "total": total_fetched,
        "ai_approved": len(ai_approved_ids),
        "ai_rejected": max(scored_count - len(ai_approved_ids), 0),
        "pending": human_counts["pending"],
        "approved": human_counts["approved"],
        "rejected": human_counts["rejected"],
    }


# ======================================================
# FETCH RSS
# ======================================================

@router.post("/fetch")
def fetch_rss_feeds(
    db: Session = Depends(get_db)
):

    result = RSSService.fetch_all(db)
    inserted = int(result.get("inserted", 0))
    unscored_count = (
        db.query(Feed)
        .filter(
            Feed.approval_status == "pending",
            Feed.scoring_reason.is_(None)
        )
        .count()
    )

    if unscored_count > 0:
        scoring = ScoringService.run(
            db,
            limit=unscored_count,
            only_unscored=True
        )
    else:
        scoring = {
            "scored": 0,
            "shortlisted": []
        }

    result["scoring"] = scoring
    result["unscored_pending_before_scoring"] = unscored_count
    result["counts"] = build_feed_counts(db)

    return {
        "message": "RSS fetched successfully",
        "result": result
    }


# ======================================================
# RSS SOURCES
# ======================================================

@router.get("/sources")
def list_rss_sources(
    db: Session = Depends(get_db)
):

    return RSSService.get_sources(db)


@router.post("/sources")
def create_rss_source(
    payload: RssSourceCreate,
    db: Session = Depends(get_db)
):

    existing = (
        db.query(RssSource)
        .filter(RssSource.url == payload.url)
        .first()
    )

    if existing:
        raise HTTPException(
            status_code=400,
            detail="RSS source URL already exists"
        )

    source = RssSource(
        name=payload.name,
        url=payload.url,
        city=payload.city,
        category=payload.category,
        enabled=payload.enabled
    )

    db.add(source)
    db.commit()
    db.refresh(source)

    return source


@router.put("/sources/{source_id}")
def update_rss_source(
    source_id: int,
    payload: RssSourceUpdate,
    db: Session = Depends(get_db)
):

    source = (
        db.query(RssSource)
        .filter(RssSource.id == source_id)
        .first()
    )

    if not source:
        raise HTTPException(
            status_code=404,
            detail="RSS source not found"
        )

    updates = payload.model_dump(exclude_unset=True)

    if "url" in updates:
        duplicate = (
            db.query(RssSource)
            .filter(
                RssSource.url == updates["url"],
                RssSource.id != source_id
            )
            .first()
        )

        if duplicate:
            raise HTTPException(
                status_code=400,
                detail="RSS source URL already exists"
            )

    for field, value in updates.items():
        setattr(source, field, value)

    db.commit()
    db.refresh(source)

    return source


@router.delete("/sources/{source_id}")
def delete_rss_source(
    source_id: int,
    db: Session = Depends(get_db)
):

    source = (
        db.query(RssSource)
        .filter(RssSource.id == source_id)
        .first()
    )

    if not source:
        raise HTTPException(
            status_code=404,
            detail="RSS source not found"
        )

    db.delete(source)
    db.commit()

    return {
        "message": "RSS source removed"
    }


# ======================================================
# ALL FEEDS
# ======================================================

@router.get("/")
def get_all_feeds(
    city: str | None = None,
    status: str | None = None,
    limit: int = 15,
    scored_only: bool = False,
    ai_status: str | None = None,
    db: Session = Depends(get_db)
):

    query = db.query(Feed)

    ai_approved_ids = get_ai_approved_ids(db)

    if ai_status == "approved":
        if not ai_approved_ids:
            return []

        query = query.filter(Feed.id.in_(ai_approved_ids))

    if ai_status == "rejected":
        query = query.filter(Feed.scoring_reason.isnot(None))

        if ai_approved_ids:
            query = query.filter(Feed.id.notin_(ai_approved_ids))

    if city:
        query = query.filter(Feed.city == city)

    if status:
        query = query.filter(Feed.approval_status == status)

    if scored_only:
        query = query.filter(Feed.scoring_reason.isnot(None))

    if limit < 1:
        limit = 15

    limit = min(limit, 100)

    feeds = (
        query
        .order_by(
            Feed.relevance_score.desc(),
            Feed.created_at.desc()
        )
        .limit(limit)
        .all()

    )

    return feeds


# ======================================================
# FEED STATUS SUMMARY
# ======================================================

@router.get("/summary/counts")
def get_feed_counts(
    db: Session = Depends(get_db)
):

    return build_feed_counts(db)


# ======================================================
# FEED DETAILS
# ======================================================

@router.get("/{feed_id}")
def get_feed_by_id(
    feed_id: int,
    db: Session = Depends(get_db)
):

    feed = (

        db.query(Feed)

        .filter(
            Feed.id == feed_id
        )

        .first()

    )

    if not feed:

        raise HTTPException(
            status_code=404,
            detail="Feed not found"
        )

    return feed


# ======================================================
# PENDING FEEDS
# ======================================================

@router.get("/status/pending")
def get_pending_feeds(
    db: Session = Depends(get_db)
):

    return (

        db.query(Feed)

        .filter(
            Feed.approval_status == "pending"
        )

        .order_by(
            Feed.created_at.desc()
        )

        .all()

    )


# ======================================================
# APPROVED FEEDS
# ======================================================

@router.get("/status/approved")
def get_approved_feeds(
    db: Session = Depends(get_db)
):

    return (

        db.query(Feed)

        .filter(
            Feed.approval_status == "approved"
        )

        .order_by(
            Feed.created_at.desc()
        )

        .all()

    )


# ======================================================
# REJECTED FEEDS
# ======================================================

@router.get("/status/rejected")
def get_rejected_feeds(
    db: Session = Depends(get_db)
):

    return (

        db.query(Feed)

        .filter(
            Feed.approval_status == "rejected"
        )

        .order_by(
            Feed.created_at.desc()
        )

        .all()

    )


# ======================================================
# CITY FILTER
# ======================================================

@router.get("/city/{city}")
def get_city_feeds(
    city: str,
    db: Session = Depends(get_db)
):

    feeds = (

        db.query(Feed)

        .filter(
            Feed.city.ilike(city)
        )

        .order_by(
            Feed.created_at.desc()
        )

        .all()

    )

    return feeds


# ======================================================
# SOURCE FILTER
# ======================================================

@router.get("/source/{source_name}")
def get_source_feeds(
    source_name: str,
    db: Session = Depends(get_db)
):

    feeds = (

        db.query(Feed)

        .filter(
            Feed.source_name.ilike(
                f"%{source_name}%"
            )
        )

        .order_by(
            Feed.created_at.desc()
        )

        .all()

    )

    return feeds


# ======================================================
# APPROVE
# ======================================================

@router.put("/{feed_id}/approve")
def approve_feed(
    feed_id: int,
    payload: FeedApprovalRequest = FeedApprovalRequest(),
    db: Session = Depends(get_db)
):

    feed = (

        db.query(Feed)

        .filter(
            Feed.id == feed_id
        )

        .first()

    )

    if not feed:

        raise HTTPException(
            status_code=404,
            detail="Feed not found"
        )

    feed.approval_status = "approved"
    feed.approved_by = payload.approved_by

    if payload.editor_notes:
        feed.editor_notes = payload.editor_notes

    db.commit()

    db.refresh(feed)

    generation = ContentService.generate(
        db,
        feed_ids=[feed.id]
    )
    created_ids = generation.get("created", [])

    validation = {
        "validated": 0,
        "results": []
    }

    if created_ids:
        validation = BrandValidationService.run(
            db,
            content_ids=created_ids
        )

    return {
        "message": "Feed approved",
        "feed": feed,
        "content_generation": generation,
        "brand_validation": validation,
    }


# ======================================================
# REJECT
# ======================================================

@router.put("/{feed_id}/reject")
def reject_feed(
    feed_id: int,
    reason: str = "",
    db: Session = Depends(get_db)
):

    feed = (

        db.query(Feed)

        .filter(
            Feed.id == feed_id
        )

        .first()

    )

    if not feed:

        raise HTTPException(
            status_code=404,
            detail="Feed not found"
        )

    feed.approval_status = "rejected"

    feed.rejection_reason = reason

    db.commit()

    db.refresh(feed)

    return {
        "message": "Feed rejected",
        "feed": feed
    }
