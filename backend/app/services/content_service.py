import json
import re
from datetime import datetime

from sqlalchemy.orm import Session

from app.models import Feed
from app.models import GeneratedContent
from app.services.agent_log_service import AgentLogService
from app.services.llm_service import LLMService


PLATFORMS = [
    "instagram",
    "linkedin",
    "newsletter",
    "blog",
]


class ContentService:

    @staticmethod
    def slugify(value: str):

        slug = re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")
        return slug[:160] or "neem-journeys-story"

    @staticmethod
    def generate(
        db: Session,
        feed_ids: list[int] | None = None
    ):

        query = db.query(Feed).filter(Feed.approval_status == "approved")

        if feed_ids:
            query = query.filter(Feed.id.in_(feed_ids))

        feeds = query.order_by(Feed.approved_at.desc()).all()
        created = []
        skipped = []

        for feed in feeds:
            for platform in PLATFORMS:
                existing = (
                    db.query(GeneratedContent)
                    .filter(
                        GeneratedContent.feed_id == feed.id,
                        GeneratedContent.platform == platform
                    )
                    .first()
                )

                if existing:
                    skipped.append(existing.id)
                    continue

                generated = LLMService.generate_platform_content(feed, platform)
                headline = generated.get("headline") or feed.title
                slug = f"{ContentService.slugify(headline)}-{feed.id}-{platform}"
                keywords = generated.get("keywords", [])
                hashtags = generated.get("hashtags", [])

                content = GeneratedContent(
                    feed_id=feed.id,
                    platform=platform,
                    headline=headline,
                    slug=slug,
                    content=generated.get("content", ""),
                    excerpt=generated.get("excerpt", ""),
                    seo_title=generated.get("seo_title", ""),
                    seo_description=generated.get("seo_description", ""),
                    keywords=json.dumps(keywords),
                    hashtags=json.dumps(hashtags),
                    brand_tone="measured, unhurried, curious",
                    content_style="Neem Journeys editorial",
                    featured_image_prompt=generated.get(
                        "photography_direction",
                        ""
                    ),
                    photography_direction=generated.get(
                        "photography_direction",
                        ""
                    ),
                    source_url=feed.link,
                    suggested_post_time=generated.get("suggested_post_time", ""),
                    status="draft",
                    validation_status="not_checked",
                    created_at=datetime.utcnow(),
                )

                db.add(content)
                db.flush()
                created.append(content.id)

        db.commit()

        AgentLogService.log(
            db,
            "content_agent",
            "generate_content",
            "completed",
            f"Created {len(created)} drafts. Skipped {len(skipped)} existing drafts."
        )

        return {
            "created": created,
            "skipped_existing": skipped,
            "feed_count": len(feeds),
        }

    @staticmethod
    def regenerate(
        db: Session,
        content_id: int,
        regen_type: str
    ):

        content = (
            db.query(GeneratedContent)
            .filter(GeneratedContent.id == content_id)
            .first()
        )

        if not content:
            return None

        if regen_type in ["content", "both"]:
            feed = content.feed
            if feed:
                generated = LLMService.generate_platform_content(feed, content.platform)
                content.headline = generated.get("headline") or feed.title
                content.content = generated.get("content", "")
                content.excerpt = generated.get("excerpt", "")
                content.seo_title = generated.get("seo_title", "")
                content.seo_description = generated.get("seo_description", "")
                content.keywords = json.dumps(generated.get("keywords", []))
                content.hashtags = json.dumps(generated.get("hashtags", []))

        if regen_type in ["image", "both"]:
            from app.services.image_generation_service import ImageGenerationService
            ImageGenerationService.generate_for_content(db, content_id)

        content.validation_status = "not_checked"
        content.validation_issues = None
        content.revision_count = (content.revision_count or 0) + 1

        db.commit()
        db.refresh(content)

        AgentLogService.log(
            db,
            "content_agent",
            "regenerate_content",
            "completed",
            f"Regenerated {regen_type} for content {content.id}."
        )

        return content

    @staticmethod
    def approve(
        db: Session,
        content_id: int,
        approved_by: str,
        scheduled_publish_time=None
    ):

        content = (
            db.query(GeneratedContent)
            .filter(GeneratedContent.id == content_id)
            .first()
        )

        if not content:
            return None

        if content.validation_status not in {
            "passed",
            "needs_human_attention",
        }:
            raise ValueError("Content must pass brand validation before approval.")

        content.status = "approved"
        content.approved_by = approved_by
        content.approved_at = datetime.utcnow()

        if scheduled_publish_time:
            content.scheduled_publish_time = scheduled_publish_time

        db.commit()
        db.refresh(content)

        AgentLogService.log(
            db,
            "human_content_review",
            "approve_content",
            "completed",
            f"Approved content {content.id}."
        )

        return content

    @staticmethod
    def reject(
        db: Session,
        content_id: int,
        reason: str | None = None
    ):

        content = (
            db.query(GeneratedContent)
            .filter(GeneratedContent.id == content_id)
            .first()
        )

        if not content:
            return None

        content.status = "rejected"
        content.validation_issues = reason or content.validation_issues

        db.commit()
        db.refresh(content)

        AgentLogService.log(
            db,
            "human_content_review",
            "reject_content",
            "completed",
            f"Rejected content {content.id}."
        )

        return content
