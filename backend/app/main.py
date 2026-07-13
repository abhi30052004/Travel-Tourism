from app.config import APP_NAME
from app.config import BACKEND_DIR
from app.config import FRONTEND_URLS
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.database import Base
from app.database import ensure_database_schema
from app.database import engine

from app.routers.agent_runs import router as agent_runs_router
from app.routers.auth import require_admin
from app.routers.auth import router as auth_router
from app.routers.content import router as content_router
from app.routers.feeds import router as feeds_router
from app.routers.publish import router as publish_router
from app.routers.scoring import router as scoring_router
from app.routers.validation import router as validation_router
from app.services.scheduler_service import SchedulerService
from fastapi import Depends


# Create tables
Base.metadata.create_all(bind=engine)
ensure_database_schema()

app = FastAPI(
    title=APP_NAME,
    description="Travel Content Agent API",
    version="1.0.0"
)

# =====================================
# CORS
# =====================================
print("===================================")
print("Allowed CORS origins:", FRONTEND_URLS)
print("===================================")

app.add_middleware(
    CORSMiddleware,
    allow_origins=FRONTEND_URLS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

media_dir = BACKEND_DIR / "generated_media"
media_dir.mkdir(parents=True, exist_ok=True)
app.mount(
    "/media",
    StaticFiles(directory=media_dir),
    name="media"
)

# =====================================
# Routers
# =====================================

app.include_router(auth_router)
app.include_router(feeds_router, dependencies=[Depends(require_admin)])
app.include_router(scoring_router, dependencies=[Depends(require_admin)])
app.include_router(content_router, dependencies=[Depends(require_admin)])
app.include_router(validation_router, dependencies=[Depends(require_admin)])
app.include_router(publish_router, dependencies=[Depends(require_admin)])
app.include_router(agent_runs_router, dependencies=[Depends(require_admin)])


@app.get("/")
def root():
    return {
        "application": APP_NAME,
        "status": "running",
        "docs": "/docs"
    }


@app.get("/health")
def health():
    return {
        "status": "healthy"
    }


@app.on_event("startup")
def start_scheduler():

    SchedulerService.start()


@app.on_event("shutdown")
def stop_scheduler():

    SchedulerService.shutdown()
