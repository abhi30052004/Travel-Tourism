import json
import re

from sqlalchemy.orm import Session

from app.models import GeneratedContent
from app.services.agent_log_service import AgentLogService
from app.services.llm_service import LLMService


BANNED_SUPERLATIVES = [
    "best",
    "greatest",
    "most incredible",
    "unbeatable",
    "ultimate",
]

AMERICAN_TO_EUROPEAN = {
    "color": "colour",
    "colors": "colours",
    "neighborhood": "neighbourhood",
    "neighborhoods": "neighbourhoods",
    "center": "centre",
    "centers": "centres",
    "traveling": "travelling",
    "traveler": "traveller",
    "travelers": "travellers",
}

PLATFORM_WORD_LIMITS = {
    "instagram": (80, 260),
    "linkedin": (120, 420),
    "newsletter": (180, 620),
    "blog": (250, 1100),
}


class BrandValidationService:

    @staticmethod
    def run(
        db: Session,
        content_ids: list[int] | None = None
    ):

        query = db.query(GeneratedContent).filter(
            GeneratedContent.status.in_(["draft", "pending_review"])
        )

        if content_ids:
            query = query.filter(GeneratedContent.id.in_(content_ids))

        contents = query.order_by(GeneratedContent.created_at.desc()).all()
        results = []

        for content in contents:
            result = BrandValidationService.validate_content(content)

            if result["status"] == "failed" and content.revision_count < 1:
                revised = LLMService.revise_content(
                    content,
                    result["issues"]
                )
                BrandValidationService.apply_revision(content, revised)
                content.revision_count = (content.revision_count or 0) + 1
                result = BrandValidationService.validate_content(content)
                result["revised"] = True

            content.validation_status = result["status"]
            content.validation_score = result["score"]
            content.validation_issues = json.dumps(result["issues"])

            if result["status"] in {"passed", "needs_human_attention"}:
                content.status = "pending_review"

            results.append(
                {
                    "content_id": content.id,
                    "status": result["status"],
                    "score": result["score"],
                    "issues": result["issues"],
                    "revised": result.get("revised", False),
                }
            )

        db.commit()

        AgentLogService.log(
            db,
            "brand_validation_agent",
            "validate_content",
            "completed",
            f"Validated {len(results)} content drafts."
        )

        return {
            "validated": len(results),
            "results": results,
        }

    @staticmethod
    def validate_content(content):

        issues = []
        text = f"{content.headline}\n{content.content}"
        lower_text = text.lower()

        if "neem journeys" not in lower_text:
            issues.append("Brand name must appear as 'Neem Journeys'.")

        if re.search(r"\bNeem\b(?!\s+Journeys)", text):
            issues.append("Do not shorten the brand name to 'Neem'.")

        for phrase in BANNED_SUPERLATIVES:
            if phrase in lower_text:
                issues.append(f"Remove banned superlative: {phrase}.")

        for american, european in AMERICAN_TO_EUROPEAN.items():
            if re.search(rf"\b{american}\b", lower_text):
                issues.append(
                    f"Use European English spelling: {european}."
                )

        exclamation_count = text.count("!")

        if content.platform in {"newsletter", "blog"} and exclamation_count:
            issues.append("Newsletter and Blog drafts must not use exclamation marks.")

        if content.platform == "instagram" and exclamation_count > 1:
            issues.append("Instagram drafts allow one exclamation mark maximum.")

        minimum, maximum = PLATFORM_WORD_LIMITS.get(
            content.platform,
            (50, 1200)
        )
        word_count = len(re.findall(r"\b\w+\b", content.content or ""))

        if word_count < minimum:
            issues.append(
                f"{content.platform} draft is too short: {word_count} words."
            )

        if word_count > maximum:
            issues.append(
                f"{content.platform} draft is too long: {word_count} words."
            )

        if not content.photography_direction:
            issues.append("Photography direction is required.")

        score = max(0, 100 - (len(issues) * 15))

        if score >= 90:
            status = "passed"
        elif score >= 60:
            status = "needs_human_attention"
        else:
            status = "failed"

        return {
            "status": status,
            "score": float(score),
            "issues": issues,
            "revised": False,
        }

    @staticmethod
    def apply_revision(content, revised):

        content.headline = revised.get("headline") or content.headline
        content.content = revised.get("content") or content.content
        content.excerpt = revised.get("excerpt") or content.excerpt
        content.seo_title = revised.get("seo_title") or content.seo_title
        content.seo_description = (
            revised.get("seo_description") or content.seo_description
        )
        content.keywords = json.dumps(revised.get("keywords", []))
        content.hashtags = json.dumps(revised.get("hashtags", []))
        content.photography_direction = (
            revised.get("photography_direction")
            or content.photography_direction
        )
        content.featured_image_prompt = content.photography_direction
        content.suggested_post_time = (
            revised.get("suggested_post_time")
            or content.suggested_post_time
        )
