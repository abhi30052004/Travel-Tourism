from datetime import datetime
from typing import Any

from pydantic import BaseModel
from pydantic import ConfigDict
from pydantic import Field


class OrmSchema(BaseModel):

    model_config = ConfigDict(from_attributes=True)


class FeedBase(OrmSchema):

    id: int
    title: str
    link: str
    summary: str | None = None
    author: str | None = None
    source_name: str | None = None
    source_url: str | None = None
    image_url: str | None = None
    published_date: str | None = None
    city: str | None = None
    category: str | None = None
    relevance_score: float | None = 0
    scoring_breakdown: str | None = None
    scoring_reason: str | None = None
    scoring_confidence: float | None = 0
    approval_status: str | None = "pending"
    editor_notes: str | None = None
    created_at: datetime | None = None


class FeedApprovalRequest(BaseModel):

    approved_by: str = "editor"
    editor_notes: str | None = None


class FeedRejectionRequest(BaseModel):

    rejected_by: str = "editor"
    rejection_reason: str | None = None


class RssSourceCreate(BaseModel):

    name: str
    url: str
    city: str | None = None
    category: str | None = None
    enabled: bool = True


class RssSourceUpdate(BaseModel):

    name: str | None = None
    url: str | None = None
    city: str | None = None
    category: str | None = None
    enabled: bool | None = None


class FeedNotesRequest(BaseModel):

    editor_notes: str


class ScoringRunRequest(BaseModel):

    limit: int = Field(default=10, ge=1, le=25)
    city: str | None = None
    only_unscored: bool = True


class ScoreResult(BaseModel):

    total_score: float
    factor_scores: dict[str, float]
    reason: str
    suggested_category: str
    confidence: float


class ContentGenerateRequest(BaseModel):

    feed_ids: list[int] | None = None


class ContentRegenerateRequest(BaseModel):

    type: str = "content"


class ContentApprovalRequest(BaseModel):

    approved_by: str = "editor"
    scheduled_publish_time: datetime | None = None


class ContentRejectionRequest(BaseModel):

    rejected_by: str = "editor"
    reason: str | None = None


class GeneratedContentOut(OrmSchema):

    id: int
    feed_id: int
    platform: str
    headline: str
    slug: str | None = None
    content: str
    excerpt: str | None = None
    seo_title: str | None = None
    seo_description: str | None = None
    keywords: str | None = None
    hashtags: str | None = None
    featured_image_prompt: str | None = None
    featured_image_url: str | None = None
    photography_direction: str | None = None
    source_url: str | None = None
    suggested_post_time: str | None = None
    scheduled_publish_time: datetime | None = None
    validation_status: str | None = None
    validation_score: float | None = 0
    validation_issues: str | None = None
    revision_count: int | None = 0
    status: str


class BrandValidationRequest(BaseModel):

    content_ids: list[int] | None = None


class BrandValidationResult(BaseModel):

    content_id: int
    status: str
    score: float
    issues: list[str]
    revised: bool = False


class PublishScheduleItem(BaseModel):

    content_id: int
    platform: str
    scheduled_publish_time: datetime


class PublishScheduleRequest(BaseModel):

    items: list[PublishScheduleItem]


class PublishStatusRequest(BaseModel):

    status: str
    post_url: str | None = None
    external_post_id: str | None = None
    response_message: str | None = None


class PublishLogOut(OrmSchema):

    id: int
    content_id: int
    platform: str
    status: str
    scheduled_publish_time: datetime | None = None
    post_url: str | None = None
    response_message: str | None = None
    published_at: datetime | None = None
    created_at: datetime | None = None


class AgentRunOut(OrmSchema):

    id: int
    agent_name: str
    action: str | None = None
    status: str | None = None
    message: str | None = None
    created_at: datetime | None = None


class AgentResult(BaseModel):

    message: str
    result: dict[str, Any]


class AdminLoginRequest(BaseModel):

    username: str
    password: str


class AdminLoginResponse(BaseModel):

    access_token: str
    token_type: str = "bearer"
    username: str
