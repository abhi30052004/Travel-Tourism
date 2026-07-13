from datetime import datetime

from sqlalchemy import Column
from sqlalchemy import Boolean
from sqlalchemy import Integer
from sqlalchemy import String
from sqlalchemy import Text
from sqlalchemy import Float
from sqlalchemy import DateTime
from sqlalchemy import ForeignKey

from sqlalchemy.orm import relationship

from app.database import Base


# =====================================================
# RSS SOURCES
# =====================================================

class RssSource(Base):

    __tablename__ = "rss_sources"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    name = Column(
        String(255),
        nullable=False
    )

    url = Column(
        String(1000),
        unique=True,
        nullable=False
    )

    city = Column(
        String(100),
        index=True
    )

    category = Column(
        String(100),
        index=True
    )

    enabled = Column(
        Boolean,
        default=True,
        nullable=False
    )

    last_fetched = Column(
        DateTime
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )

    updated_at = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow
    )


# =====================================================
# RSS FEEDS
# =====================================================

class Feed(Base):

    __tablename__ = "feeds"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    # RSS Data
    title = Column(
        String(500),
        nullable=False
    )

    link = Column(
        String(1000),
        unique=True,
        nullable=False
    )

    summary = Column(
        Text
    )

    author = Column(
        String(255)
    )

    source_name = Column(
        String(255)
    )

    source_url = Column(
        String(1000)
    )

    image_url = Column(
        String(1000)
    )

    published_date = Column(
        String(100)
    )

    # Classification
    city = Column(
        String(100),
        index=True
    )

    category = Column(
        String(100),
        index=True
    )

    relevance_score = Column(
        Float,
        default=0
    )

    scoring_breakdown = Column(
        Text
    )

    scoring_reason = Column(
        Text
    )

    scoring_confidence = Column(
        Float,
        default=0
    )

    fetch_status = Column(
        String(100),
        default="fetched"
    )

    editor_notes = Column(
        Text
    )

    # Approval Workflow
    approval_status = Column(
        String(50),
        default="pending"
    )
    # pending
    # approved
    # rejected

    approved_by = Column(
        String(255)
    )

    approved_at = Column(
        DateTime
    )

    rejection_reason = Column(
        Text
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )

    updated_at = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow
    )

    contents = relationship(
        "GeneratedContent",
        back_populates="feed",
        cascade="all, delete-orphan"
    )


# =====================================================
# GENERATED CONTENT
# =====================================================

class GeneratedContent(Base):

    __tablename__ = "generated_content"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    feed_id = Column(
        Integer,
        ForeignKey("feeds.id"),
        nullable=False
    )

    platform = Column(
        String(100),
        default="blog"
    )

    # Generated Article
    headline = Column(
        String(500),
        nullable=False
    )

    slug = Column(
        String(500),
        unique=True
    )

    content = Column(
        Text,
        nullable=False
    )

    excerpt = Column(
        Text
    )

    # SEO
    seo_title = Column(
        String(255)
    )

    seo_description = Column(
        Text
    )

    keywords = Column(
        Text
    )

    hashtags = Column(
        Text
    )

    # Branding
    brand_tone = Column(
        String(100)
    )

    content_style = Column(
        String(100)
    )

    # Images
    featured_image_prompt = Column(
        Text
    )

    featured_image_url = Column(
        String(1000)
    )

    photography_direction = Column(
        Text
    )

    source_url = Column(
        String(1000)
    )

    suggested_post_time = Column(
        String(100)
    )

    scheduled_publish_time = Column(
        DateTime
    )

    # Workflow
    status = Column(
        String(50),
        default="draft"
    )
    # draft
    # pending_review
    # approved
    # rejected
    # published

    approved_by = Column(
        String(255)
    )

    approved_at = Column(
        DateTime
    )

    validation_status = Column(
        String(100),
        default="not_checked"
    )

    validation_score = Column(
        Float,
        default=0
    )

    validation_issues = Column(
        Text
    )

    revision_count = Column(
        Integer,
        default=0
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )

    updated_at = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow
    )

    feed = relationship(
        "Feed",
        back_populates="contents"
    )

    publish_logs = relationship(
        "PublishLog",
        back_populates="content",
        cascade="all, delete-orphan"
    )


# =====================================================
# SOCIAL MEDIA PUBLISH LOGS
# =====================================================

class PublishLog(Base):

    __tablename__ = "publish_logs"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    content_id = Column(
        Integer,
        ForeignKey("generated_content.id"),
        nullable=False
    )

    platform = Column(
        String(100),
        nullable=False
    )
    # linkedin
    # instagram
    # pinterest
    # facebook
    # twitter

    post_url = Column(
        String(1000)
    )

    external_post_id = Column(
        String(255)
    )

    status = Column(
        String(100),
        default="pending"
    )
    # pending
    # published
    # failed

    response_message = Column(
        Text
    )

    scheduled_publish_time = Column(
        DateTime
    )

    published_at = Column(
        DateTime
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )

    content = relationship(
        "GeneratedContent",
        back_populates="publish_logs"
    )


# =====================================================
# AGENT EXECUTION LOGS
# =====================================================

class AgentRun(Base):

    __tablename__ = "agent_runs"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    agent_name = Column(
        String(255),
        nullable=False
    )
    # rss_agent
    # content_agent
    # publishing_agent

    action = Column(
        String(255)
    )

    status = Column(
        String(100)
    )

    message = Column(
        Text
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )
