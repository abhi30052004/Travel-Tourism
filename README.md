# City Canvas

City Canvas is a travel content automation platform for Neem Journeys / Virtual Holidays. It combines a public travel website with an admin dashboard and AI-assisted editorial pipeline for collecting RSS travel stories, scoring them, generating platform-specific posts, validating brand tone, generating campaign images, and preparing content for publishing.

The project is built as a full-stack application:

- `frontend/` is a Next.js application for the public travel website and admin UI.
- `backend/` is a FastAPI application that owns the database, RSS ingestion, AI scoring, content generation, image generation, validation, publishing logs, and scheduler.

## What Problem This Solves

Travel brands need a steady stream of timely, high-quality content, but the manual workflow is slow:

1. Find relevant city stories from trusted sources.
2. Filter out weak, off-brand, stale, or irrelevant articles.
3. Score the best ideas for editorial value.
4. Generate posts for multiple platforms.
5. Review tone, quality, and brand fit.
6. Create supporting campaign images.
7. Approve, schedule, and track publishing.

City Canvas automates the repetitive parts while keeping human approval in the loop. Editors can review AI-scored RSS stories, approve only the useful ones, generate draft posts, validate brand quality, and manage publishing from one dashboard.

## Core Workflow

```text
RSS sources
  -> feedparser fetches articles
  -> duplicate and relevance filtering
  -> AI scoring
  -> AI-approved review queue
  -> human approval/rejection
  -> AI post generation
  -> brand validation
  -> human post approval
  -> image generation
  -> publishing log / schedule
```

## Current Main Features

- Public travel website with destination, package, blog, contact, and marketing pages.
- Admin authentication with token-based session storage.
- RSS collection for Amsterdam and Paris travel/culture sources.
- AI scoring with `publish`, `review`, and `reject` recommendations.
- Dashboard split between:
  - total fetched RSS rows
  - AI-approved feed items
  - AI-rejected feed items
  - human approval pending
  - human approved
  - human rejected
- Manual RSS fetch and score action.
- Daily scheduled RSS collector at `09:00 Asia/Kolkata`.
- Human approval queue for RSS articles.
- Multi-platform content generation for Instagram, LinkedIn, newsletter, and blog.
- Brand validation and revision pass.
- AI image generation for content posters.
- Publishing logs and scheduling state.
- Agent run logging for auditability.

## Tech Stack

### Frontend

- Next.js 13
- React 18
- TypeScript
- Tailwind CSS
- Radix UI primitives
- Lucide icons
- Supabase client and example Supabase functions/migrations

### Backend

- FastAPI
- SQLAlchemy
- SQLite by default, PostgreSQL-compatible through `DATABASE_URL`
- Pydantic
- feedparser
- APScheduler
- OpenAI / Anthropic through LangChain wrappers
- OpenAI image generation API

## Repository Structure

```text
City-Canvas/
  README.md
  .gitignore
  backend/
    .env
    requirements.txt
    travel_agent.db
    generated_media/
    app/
      main.py
      config.py
      database.py
      models.py
      schemas.py
      routers/
      services/
      utils/
  frontend/
    package.json
    package-lock.json
    next.config.js
    netlify.toml
    postcss.config.js
    tailwind.config.ts
    tsconfig.json
    components.json
    app/
    components/
    hooks/
    lib/
    supabase/
```

## Backend File Guide

### `backend/requirements.txt`

Python dependencies for the FastAPI backend.

Important packages:

- `fastapi`: API framework.
- `uvicorn`: ASGI server.
- `sqlalchemy`: ORM/database layer.
- `pydantic`: request/response schemas.
- `python-dotenv`: loads `backend/.env`.
- `feedparser`: RSS parsing.
- `APScheduler`: in-process scheduled jobs.
- `langchain-openai`, `langchain-anthropic`: LLM integrations.
- `openai`: direct image generation client.
- `psycopg[binary]`: PostgreSQL support.

### `backend/.env`

Local backend configuration. Do not commit real API keys.

Expected variables:

```env
APP_NAME="Travel Content Agent"
DATABASE_URL="sqlite:///./travel_agent.db"

LLM_PROVIDER="openai"
OPENAI_API_KEY=""
OPENAI_MODEL=""
OPENAI_IMAGE_MODEL="gpt-image-1"

CLAUDE_API_KEY=""
CLAUDE_MODEL=""

ADMIN_USERNAME="admin"
ADMIN_PASSWORD="admin123"
ADMIN_API_TOKEN="dev-admin-token"

ENABLE_RSS_SCHEDULER="true"
RSS_SCHEDULE_HOUR="9"
RSS_SCHEDULE_MINUTE="0"
RSS_SCHEDULE_TIMEZONE="Asia/Kolkata"

FRONTEND_URLS="http://localhost:3000,http://127.0.0.1:3000"
```

Security note: if real keys have ever been committed or shared, rotate them.

### `backend/travel_agent.db`

Local SQLite database. It stores feeds, generated content, publish logs, and agent logs.

This file is useful for local development but should normally be ignored for production deployments.

### `backend/generated_media/`

Generated media output folder. AI-generated images are saved under:

```text
backend/generated_media/images/
```

The backend exposes this through `/media`.

### `backend/app/main.py`

FastAPI application entrypoint.

Responsibilities:

- Creates database tables.
- Runs SQLite schema upgrade helper.
- Configures CORS.
- Mounts generated media at `/media`.
- Registers all routers.
- Starts and stops the RSS scheduler on app startup/shutdown.
- Provides `/` and `/health` endpoints.

### `backend/app/config.py`

Central configuration module.

Responsibilities:

- Loads `backend/.env`.
- Resolves the database URL.
- Defines LLM provider/model settings.
- Defines image model settings.
- Defines admin credentials and token defaults.
- Defines scheduler settings.
- Defines allowed frontend origins.

### `backend/app/database.py`

Database setup.

Responsibilities:

- Creates SQLAlchemy engine.
- Creates `SessionLocal`.
- Provides FastAPI `get_db()` dependency.
- Defines declarative `Base`.
- Includes a lightweight SQLite schema migration helper for newly added columns.

### `backend/app/models.py`

SQLAlchemy database models.

Main tables:

- `Feed`: scraped RSS article with city/category, AI score, approval state, and editor notes.
- `GeneratedContent`: AI-generated posts/blog/newsletter copy derived from approved feeds.
- `PublishLog`: publishing status per generated content item and platform.
- `AgentRun`: audit log for RSS, scoring, content, validation, scheduler, and publishing actions.

### `backend/app/schemas.py`

Pydantic request and response models.

Includes schemas for:

- Feed approval/rejection.
- Scoring runs.
- Content generation.
- Content approval/rejection.
- Brand validation.
- Publish scheduling.
- Publish status updates.
- Agent run output.
- Admin login.

## Backend Routers

### `backend/app/routers/auth.py`

Admin authentication routes.

Typical responsibilities:

- Login.
- Verify current admin session.
- Protect admin-only API routes.

### `backend/app/routers/feeds.py`

RSS feed API.

Important behavior:

- `POST /rss-feeds/fetch`: fetches RSS, stores new articles, scores all pending unscored articles, and returns dashboard counts.
- `GET /rss-feeds/`: lists feeds with filters for city, human status, scored-only mode, and AI status.
- `GET /rss-feeds/summary/counts`: returns the six dashboard counters.
- `PUT /rss-feeds/{feed_id}/approve`: human-approves an RSS article and triggers content generation plus brand validation.
- `PUT /rss-feeds/{feed_id}/reject`: human-rejects an RSS article.

AI pass-to-screen rule:

- Show all scored feeds with score greater than `75`.
- If fewer than `15` feeds are above `75`, show the top `15` scored feeds.
- Everything scored but outside that selected set is treated as AI rejected for dashboard/filtering purposes.

### `backend/app/routers/scoring.py`

Runs the scoring agent manually.

Used when an admin wants to score pending RSS feed rows outside the automatic fetch workflow.

### `backend/app/routers/content.py`

Content generation and content-level operations.

Main endpoints:

- Generate content from approved feeds.
- List generated content.
- Generate an image for a content item.
- Approve generated content.
- Reject generated content.

### `backend/app/routers/validation.py`

Brand validation API.

Runs brand/tone checks on generated content and records validation status, score, and issues.

### `backend/app/routers/publish.py`

Publishing workflow API.

Current behavior marks content as published/queued in local logs. External platform API posting is not fully configured.

### `backend/app/routers/agent_runs.py`

Returns agent activity logs for dashboard audit/history.

## Backend Services

### `backend/app/services/rss_service.py`

RSS ingestion service.

Responsibilities:

- Defines RSS source URLs for Amsterdam and Paris.
- Uses `feedparser` to parse feeds.
- Cleans article HTML.
- Detects city and category.
- Calculates initial travel relevance.
- Filters out politics, crime, war, finance, generic news, traffic, and other off-brand items.
- Deduplicates by link.
- Inserts `Feed` rows with `approval_status="pending"`.

### `backend/app/services/scoring_agent_service.py`

AI scoring engine.

Responsibilities:

- Sends feed articles to the configured LLM.
- Scores articles across editorial criteria:
  - brand alignment
  - audience relevance
  - originality
  - timeliness
  - visual potential
  - content potential
  - source authority
- Returns a `total_score`, `recommendation`, reason, and confidence.
- Falls back to local keyword scoring if the LLM provider is unavailable.

Recommendation rules:

```text
publish: score >= 75
review:  score 50-74
reject:  score < 50
```

### `backend/app/services/scoring_service.py`

Coordinates scoring for pending feeds.

Responsibilities:

- Selects pending feeds.
- Calls `ScoringAgentService`.
- Stores score, breakdown, recommendation, reason, confidence, and category updates.
- Returns a shortlist ordered by score.
- Logs scoring agent activity.

### `backend/app/services/content_service.py`

Generates platform-specific content.

Platforms:

- Instagram
- LinkedIn
- Newsletter
- Blog

Responsibilities:

- Finds approved feeds.
- Prevents duplicate generated content for the same feed/platform pair.
- Calls `LLMService.generate_platform_content`.
- Stores `GeneratedContent` drafts.
- Supports human approval/rejection of generated posts.

### `backend/app/services/llm_service.py`

LLM prompt and content-generation layer.

Responsibilities:

- Creates platform-specific prompts.
- Calls the configured LLM provider.
- Produces structured content fields like headline, copy, excerpt, SEO metadata, hashtags, keywords, photography direction, and suggested post time.

### `backend/app/services/brand_validation_service.py`

Validates generated content against brand guidelines.

Responsibilities:

- Checks tone, claims, structure, and brand fit.
- Updates validation status.
- Can revise content once if validation fails.
- Moves passed/attention-needed content into `pending_review`.

### `backend/app/services/image_generation_service.py`

Generates campaign/poster images for generated content.

Responsibilities:

- Builds a detailed visual prompt from generated content and its source feed.
- Calls OpenAI image generation.
- Saves image bytes to `backend/generated_media/images/`.
- Updates `GeneratedContent.featured_image_url`.
- Logs image generation.

### `backend/app/services/publisher_service.py`

Publishing/scheduling service.

Current behavior:

- Requires generated content to be human-approved before scheduling.
- Creates or updates `PublishLog`.
- Marks content as published locally.
- Notes that external platform API posting is not configured.

This is currently a local publishing simulation/logging layer, not a full social network integration.

### `backend/app/services/scheduler_service.py`

Daily RSS scheduler.

Responsibilities:

- Starts an APScheduler background job if enabled.
- Runs the RSS collector at configured cron time.
- Defaults to `09:00 Asia/Kolkata`.
- Fetches RSS.
- Scores all pending unscored RSS rows.
- Logs scheduler success/failure.

Important production note: this is an in-process scheduler. If the backend runs with multiple workers, each worker may start its own scheduler unless controlled.

### `backend/app/services/auth_service.py`

Admin authentication helper.

Handles configured username/password/token checks used by admin routes.

### `backend/app/services/agent_log_service.py`

Small logging service for writing `AgentRun` rows.

Used by RSS, scoring, content generation, image generation, validation, scheduler, and publishing services.

## Frontend File Guide

### `frontend/package.json`

Frontend dependencies and scripts.

Useful scripts:

```bash
npm run dev
npm run build
npm run start
npm run typecheck
npm run lint
```

### `frontend/next.config.js`

Next.js configuration.

### `frontend/tailwind.config.ts`

Tailwind CSS theme and design tokens.

### `frontend/postcss.config.js`

PostCSS setup for Tailwind.

### `frontend/tsconfig.json`

TypeScript compiler configuration.

### `frontend/netlify.toml`

Netlify deployment configuration.

### `frontend/components.json`

UI component configuration for the component system used in `components/ui`.

### `frontend/app/layout.tsx`

Root app layout.

### `frontend/app/globals.css`

Global CSS and Tailwind layer definitions.

### `frontend/app/page.tsx`

Public homepage.

Composes:

- `Navbar`
- `HeroSection`
- `DestinationsSection`
- `PackagesSection`
- `WhyUsSection`
- `TestimonialsSection`
- `BlogSection`
- `NewsletterSection`
- `Footer`

### Public Website Pages

- `frontend/app/about/page.tsx`: about page.
- `frontend/app/contact/page.tsx`: contact page.
- `frontend/app/destinations/page.tsx`: destination overview.
- `frontend/app/destinations/amsterdam/page.tsx`: Amsterdam page.
- `frontend/app/destinations/paris/page.tsx`: Paris page.
- `frontend/app/experiences/page.tsx`: experience listing/marketing page.
- `frontend/app/blog/page.tsx`: blog listing.
- `frontend/app/blog/[slug]/page.tsx`: blog detail route.

### Admin Pages

- `frontend/app/admin/layout.tsx`: protected admin shell/sidebar.
- `frontend/app/admin/login/page.tsx`: admin login.
- `frontend/app/admin/page.tsx`: admin dashboard.
- `frontend/app/admin/rss/page.tsx`: RSS fetch, AI scoring, human feed approval, AI rejected feed view.
- `frontend/app/admin/verification/page.tsx`: feed verification queue.
- `frontend/app/admin/content/page.tsx`: content generation/admin content view.
- `frontend/app/admin/approval/page.tsx`: generated post approval workflow.
- `frontend/app/admin/publishing/page.tsx`: publishing logs/scheduling.
- `frontend/app/admin/analytics/page.tsx`: analytics screen.
- `frontend/app/admin/settings/page.tsx`: admin settings screen.

### Frontend API Proxy Routes

- `frontend/app/api/rss/route.ts`: frontend route for RSS-related backend call.
- `frontend/app/api/content/route.ts`: frontend route for content-related backend call.
- `frontend/app/api/publish/route.ts`: frontend route for publish-related backend call.

### `frontend/lib/admin-api.ts`

Frontend API client for the FastAPI backend.

Responsibilities:

- Stores/clears admin auth token.
- Calls login/session endpoints.
- Fetches feeds, feed counts, generated content, publish logs, and agent runs.
- Runs RSS fetch, scoring, validation, image generation, approvals, rejections, and scheduling.
- Resolves backend media URLs.

### `frontend/lib/supabase.ts`

Supabase client setup.

### `frontend/lib/database.types.ts`

TypeScript database definitions for the Supabase schema.

### `frontend/lib/utils.ts`

Shared frontend utility helpers.

### `frontend/hooks/use-toast.ts`

Toast notification hook.

### `frontend/components/`

Public site sections and shared components:

- `Navbar.tsx`: public navigation.
- `HeroSection.tsx`: homepage hero.
- `DestinationsSection.tsx`: destination previews.
- `PackagesSection.tsx`: travel package section.
- `WhyUsSection.tsx`: value proposition section.
- `TestimonialsSection.tsx`: testimonials.
- `BlogSection.tsx`: blog preview section.
- `NewsletterSection.tsx`: newsletter signup section.
- `ImageSliderSection.tsx`: visual slider.
- `Footer.tsx`: public footer.

### `frontend/components/ui/`

Reusable UI primitives based on Radix UI patterns:

- accordions
- alerts
- avatars
- badges
- buttons
- cards
- dialogs
- dropdowns
- forms
- inputs
- labels
- menus
- popovers
- progress
- selects
- sheets
- skeletons
- sliders
- switches
- tables
- tabs
- textareas
- toast/sonner
- tooltips

### `frontend/supabase/`

Supabase-specific assets:

- `migrations/20260604054317_create_travel_platform_schema.sql`: SQL schema for a Supabase version of the travel platform.
- `functions/rss-agent/index.ts`: Supabase edge function for RSS collection.
- `functions/content-generator/index.ts`: Supabase edge function for content generation.
- `functions/publish-agent/index.ts`: Supabase edge function for publishing.

The current local FastAPI backend is the main active backend path, while these Supabase files appear to represent an alternate or earlier deployment architecture.

## Database Tables

### `feeds`

Stores RSS articles.

Important fields:

- `title`
- `link`
- `summary`
- `source_name`
- `image_url`
- `published_date`
- `city`
- `category`
- `relevance_score`
- `scoring_breakdown`
- `scoring_reason`
- `scoring_confidence`
- `approval_status`
- `approved_by`
- `approved_at`
- `rejection_reason`

### `generated_content`

Stores generated content drafts and approved posts.

Important fields:

- `feed_id`
- `platform`
- `headline`
- `slug`
- `content`
- `excerpt`
- `seo_title`
- `seo_description`
- `keywords`
- `hashtags`
- `featured_image_prompt`
- `featured_image_url`
- `photography_direction`
- `source_url`
- `suggested_post_time`
- `scheduled_publish_time`
- `status`
- `validation_status`
- `validation_score`
- `validation_issues`
- `revision_count`

### `publish_logs`

Stores publishing state.

Important fields:

- `content_id`
- `platform`
- `status`
- `scheduled_publish_time`
- `post_url`
- `external_post_id`
- `response_message`
- `published_at`

### `agent_runs`

Stores operational logs.

Important fields:

- `agent_name`
- `action`
- `status`
- `message`
- `created_at`

## Local Setup

### 1. Clone and enter the project

```bash
git clone <repo-url>
cd City-Canvas
```

### 2. Backend setup

From the project root:

```bash
cd backend
python -m venv .venv
```

On Windows PowerShell:

```powershell
.\.venv\Scripts\Activate.ps1
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Create/edit `backend/.env`:

```env
APP_NAME="Travel Content Agent"
DATABASE_URL="sqlite:///./travel_agent.db"
LLM_PROVIDER="openai"
OPENAI_API_KEY="your-api-key"
OPENAI_MODEL="your-chat-model"
OPENAI_IMAGE_MODEL="gpt-image-1"
ADMIN_USERNAME="admin"
ADMIN_PASSWORD="admin123"
ADMIN_API_TOKEN="dev-admin-token"
FRONTEND_URLS="http://localhost:3000,http://127.0.0.1:3000"
ENABLE_RSS_SCHEDULER="true"
RSS_SCHEDULE_HOUR="9"
RSS_SCHEDULE_MINUTE="0"
RSS_SCHEDULE_TIMEZONE="Asia/Kolkata"
```

Run the backend:

```bash
uvicorn app.main:app --reload
```

Backend URLs:

```text
API:  http://127.0.0.1:8000
Docs: http://127.0.0.1:8000/docs
Health: http://127.0.0.1:8000/health
```

### 3. Frontend setup

From the project root:

```bash
cd frontend
npm install
npm run dev
```

Frontend URL:

```text
http://localhost:3000
```

Admin dashboard:

```text
http://localhost:3000/admin
```

## Environment Variables

### Backend

| Variable | Purpose |
| --- | --- |
| `APP_NAME` | API title/name. |
| `DATABASE_URL` | Database connection string. Defaults to local SQLite if omitted. |
| `LLM_PROVIDER` | AI provider selector, usually `openai` or `claude`. |
| `OPENAI_API_KEY` | OpenAI API key for scoring/content/image generation. |
| `OPENAI_MODEL` | Chat model for text generation. |
| `OPENAI_IMAGE_MODEL` | Image model for poster generation. |
| `CLAUDE_API_KEY` | Anthropic key if using Claude. |
| `CLAUDE_MODEL` | Claude model name. |
| `ADMIN_USERNAME` | Admin login username. |
| `ADMIN_PASSWORD` | Admin login password. |
| `ADMIN_API_TOKEN` | Bearer token used after login. |
| `FRONTEND_URLS` | Comma-separated CORS origins. |
| `ENABLE_RSS_SCHEDULER` | Enables/disables daily RSS scheduler. |
| `RSS_SCHEDULE_HOUR` | Scheduler hour. |
| `RSS_SCHEDULE_MINUTE` | Scheduler minute. |
| `RSS_SCHEDULE_TIMEZONE` | Scheduler timezone. |

### Frontend

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_BACKEND_API_URL` | Backend API base URL. Defaults to `http://127.0.0.1:8000`. |

## API Authentication

Most backend admin routes are protected with `require_admin`.

Typical frontend flow:

1. Admin logs in through `/admin/login`.
2. Frontend stores token in local storage.
3. `frontend/lib/admin-api.ts` sends the token as a bearer token.
4. Protected API routes verify the token.

## Important API Endpoints

### General

```text
GET /
GET /health
```

### Auth

```text
POST /auth/login
GET /auth/me
```

### RSS

```text
POST /rss-feeds/fetch
GET /rss-feeds/
GET /rss-feeds/summary/counts
GET /rss-feeds/{feed_id}
PUT /rss-feeds/{feed_id}/approve
PUT /rss-feeds/{feed_id}/reject
```

Useful query parameters for `GET /rss-feeds/`:

```text
city=Paris
status=pending
limit=100
scored_only=true
ai_status=approved
ai_status=rejected
```

### Scoring

```text
POST /scoring/run
```

### Content

```text
POST /content/generate
GET /content/
POST /content/{content_id}/generate-image
PUT /content/{content_id}/approve
PUT /content/{content_id}/reject
```

### Brand Validation

```text
POST /brand-validation/run
```

### Publishing

```text
POST /publish/schedule
GET /publish/logs
PUT /publish/logs/{log_id}/status
```

### Agent Runs

```text
GET /agent-runs/
```

## RSS and Scoring Rules

RSS collection:

- Fetches hardcoded Amsterdam and Paris sources from `RSS_SOURCES`.
- Extracts title, summary, link, author, source, image, date, city, and category.
- Filters out irrelevant or risky topics.
- Prevents duplicate rows by article link.

Scoring:

- All pending unscored feeds are scored after fetch.
- Scores are saved into the `feeds` table.
- The admin screen separates:
  - `Total fetched`: all feed rows.
  - `AI approved`: scored feeds selected for human review.
  - `AI rejected`: scored feeds outside the selected review set.

Screening rule:

```text
Show all articles with score > 75.
If fewer than 15 pass that threshold, show the top 15 scored articles.
```

## Daily RSS Scheduler

The backend starts a daily RSS collector on FastAPI startup if:

```env
ENABLE_RSS_SCHEDULER="true"
```

Default schedule:

```text
09:00 Asia/Kolkata
```

Configured by:

```env
RSS_SCHEDULE_HOUR="9"
RSS_SCHEDULE_MINUTE="0"
RSS_SCHEDULE_TIMEZONE="Asia/Kolkata"
```

Important note: APScheduler runs inside the backend process. If the server is not running at the scheduled time, the job will not run. In multi-worker deployments, guard against duplicate scheduler instances.

## Content Generation Rules

When a human approves an RSS article:

1. The feed status becomes `approved`.
2. The content service generates drafts for:
   - Instagram
   - LinkedIn
   - Newsletter
   - Blog
3. Brand validation runs for generated drafts.
4. Validated posts move toward the human post approval queue.

Generated content is not automatically sent to social platforms.

## Image Generation

Images are generated per content item through:

```text
POST /content/{content_id}/generate-image
```

The image prompt uses:

- content headline
- platform
- city
- category
- source name
- source image URL
- photography direction
- source summary
- generated copy excerpt

Output:

```text
backend/generated_media/images/content-<id>-<uuid>.png
```

Served at:

```text
/media/images/<filename>
```

## Publishing Behavior

Current publishing is a local workflow simulation/logging layer.

It can:

- create/update publish logs
- mark content as published
- store scheduled publish time
- store response messages

It does not currently post to real LinkedIn, Instagram, newsletter, or blog APIs.

## Useful Development Commands

### Backend

```bash
cd backend
uvicorn app.main:app --reload
```

Compile-check Python:

```bash
python -m compileall app
```

Clear local app data from SQLite:

```powershell
python -c "import sqlite3; db='backend/travel_agent.db'; tables=('publish_logs','generated_content','feeds','agent_runs'); conn=sqlite3.connect(db); conn.execute('PRAGMA foreign_keys=OFF'); [conn.execute(f'DELETE FROM {t}') for t in tables]; exists=conn.execute(\"SELECT 1 FROM sqlite_master WHERE type='table' AND name='sqlite_sequence'\").fetchone(); [conn.execute('DELETE FROM sqlite_sequence WHERE name=?',(t,)) for t in tables] if exists else None; conn.commit(); conn.close(); print('Cleared all app data from', db)"
```

### Frontend

```bash
cd frontend
npm run dev
npm run typecheck
npm run build
```

## Deployment Notes

### Frontend

The frontend is configured for Next.js and includes `netlify.toml`, so it can be deployed to Netlify or another Next-compatible host.

Set:

```env
NEXT_PUBLIC_BACKEND_API_URL="https://your-backend-url"
```

### Backend

Deploy with an ASGI server such as Uvicorn/Gunicorn.

Recommended production improvements:

- Use PostgreSQL instead of SQLite.
- Use a real secret manager for API keys.
- Replace default admin credentials.
- Consider a dedicated cron/worker instead of in-process APScheduler.
- Add external publishing integrations.
- Add structured migrations such as Alembic.

## Known Limitations

- Publishing currently marks posts as published locally; external platform posting is not configured.
- The scheduler only runs while the backend process is alive.
- SQLite is fine locally but not ideal for concurrent production workflows.
- Content generation and image generation are synchronous request-time operations.
- Multiple backend workers may duplicate scheduler jobs unless guarded.
- Supabase files exist but the active backend path is FastAPI.

## Recommended Next Improvements

- Add Celery/RQ/Dramatiq background workers for generation, validation, and images.
- Add job status tracking for long-running tasks.
- Add Alembic migrations.
- Add tests for RSS scoring, feed counts, approval transitions, and content generation.
- Add pagination for feed and content lists.
- Add real social platform publishing integrations.
- Add role-based admin permissions.
- Add secret rotation and deployment-specific `.env.example`.

## Project Purpose in One Sentence

City Canvas helps a travel brand turn raw city RSS stories into scored, human-reviewed, brand-safe, multi-platform travel content with less manual effort and better editorial control.
