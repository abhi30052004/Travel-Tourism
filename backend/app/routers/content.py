from fastapi import APIRouter
from fastapi import Depends
from fastapi import HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.orm import joinedload

from app.database import get_db
from app.models import GeneratedContent
from app.schemas import ContentApprovalRequest
from app.schemas import ContentGenerateRequest
from app.schemas import ContentRegenerateRequest
from app.schemas import ContentRejectionRequest
from app.services.content_service import ContentService
from app.services.image_generation_service import ImageGenerationService


router = APIRouter(
    prefix="/content",
    tags=["Content Agent"]
)


def serialize_content(content: GeneratedContent):

    return {
        "id": content.id,
        "feed_id": content.feed_id,
        "platform": content.platform,
        "headline": content.headline,
        "slug": content.slug,
        "content": content.content,
        "excerpt": content.excerpt,
        "seo_title": content.seo_title,
        "seo_description": content.seo_description,
        "keywords": content.keywords,
        "hashtags": content.hashtags,
        "featured_image_prompt": content.featured_image_prompt,
        "featured_image_url": content.featured_image_url,
        "source_image_url": content.feed.image_url if content.feed else None,
        "photography_direction": content.photography_direction,
        "source_url": content.source_url,
        "suggested_post_time": content.suggested_post_time,
        "scheduled_publish_time": content.scheduled_publish_time,
        "validation_status": content.validation_status,
        "validation_score": content.validation_score,
        "validation_issues": content.validation_issues,
        "revision_count": content.revision_count,
        "status": content.status,
        "created_at": content.created_at,
    }


@router.post("/generate")
def generate_content(
    payload: ContentGenerateRequest = ContentGenerateRequest(),
    db: Session = Depends(get_db)
):

    result = ContentService.generate(db, feed_ids=payload.feed_ids)

    return {
        "message": "Content generation completed",
        "result": result,
    }


@router.get("/")
def list_content(
    status: str | None = None,
    platform: str | None = None,
    db: Session = Depends(get_db)
):

    query = db.query(GeneratedContent).options(joinedload(GeneratedContent.feed))

    if status:
        query = query.filter(GeneratedContent.status == status)

    if platform:
        query = query.filter(GeneratedContent.platform == platform)

    contents = query.order_by(GeneratedContent.created_at.desc()).all()
    return [serialize_content(content) for content in contents]


@router.post("/{content_id}/generate-image")
def generate_content_image(
    content_id: int,
    db: Session = Depends(get_db)
):

    try:
        content = ImageGenerationService.generate_for_content(db, content_id)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(
            status_code=502,
            detail=f"Image generation failed: {exc}"
        ) from exc

    if not content:
        raise HTTPException(status_code=404, detail="Content not found")

    return {
        "message": "Image generated",
        "content": serialize_content(content),
    }


@router.post("/{content_id}/regenerate")
def regenerate_content_endpoint(
    content_id: int,
    payload: ContentRegenerateRequest = ContentRegenerateRequest(),
    db: Session = Depends(get_db)
):

    try:
        content = ContentService.regenerate(db, content_id, payload.type)
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Regeneration failed: {exc}"
        ) from exc

    if not content:
        raise HTTPException(status_code=404, detail="Content not found")

    return {
        "message": f"Regenerated {payload.type}",
        "content": serialize_content(content),
    }


@router.put("/{content_id}/approve")
def approve_content(
    content_id: int,
    payload: ContentApprovalRequest = ContentApprovalRequest(),
    db: Session = Depends(get_db)
):

    try:
        content = ContentService.approve(
            db,
            content_id,
            payload.approved_by,
            payload.scheduled_publish_time
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    if not content:
        raise HTTPException(status_code=404, detail="Content not found")

    return content


@router.put("/{content_id}/reject")
def reject_content(
    content_id: int,
    payload: ContentRejectionRequest = ContentRejectionRequest(),
    db: Session = Depends(get_db)
):

    content = ContentService.reject(db, content_id, payload.reason)

    if not content:
        raise HTTPException(status_code=404, detail="Content not found")

    return content
