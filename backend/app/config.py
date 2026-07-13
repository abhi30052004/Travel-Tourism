from dotenv import load_dotenv
import os
from pathlib import Path

BACKEND_DIR = Path(__file__).resolve().parents[1]
DEFAULT_DATABASE_URL = f"sqlite:///{(BACKEND_DIR / 'travel_agent.db').as_posix()}"

load_dotenv(BACKEND_DIR / ".env")


def resolve_database_url(value: str | None):

    if not value:
        return DEFAULT_DATABASE_URL

    sqlite_prefix = "sqlite:///"

    if not value.startswith(sqlite_prefix):
        return value

    sqlite_path = value[len(sqlite_prefix):]

    if not sqlite_path or Path(sqlite_path).is_absolute():
        return value

    resolved_path = (BACKEND_DIR / sqlite_path).resolve()
    return f"{sqlite_prefix}{resolved_path.as_posix()}"


DATABASE_URL = resolve_database_url(os.getenv("DATABASE_URL"))

LLM_PROVIDER = os.getenv(
    "LLM_PROVIDER",
    "openai"
).lower()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

OPENAI_MODEL = os.getenv(
    "OPENAI_MODEL",
    "gpt-5.4"
)

OPENAI_IMAGE_MODEL = os.getenv(
    "OPENAI_IMAGE_MODEL",
    "gpt-image-1"
)

CLAUDE_MODEL = os.getenv(
    "CLAUDE_MODEL",
    "claude-sonnet-4-20250514"
)

CLAUDE_API_KEY = os.getenv("CLAUDE_API_KEY")

APP_NAME = os.getenv(
    "APP_NAME",
    "Travel Content Agent"
)
FRONTEND_URLS = [
    "https://city-canvas.vercel.app",
    *[
        url.strip()
        for url in os.getenv(
            "FRONTEND_URLS",
            "http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000,http://127.0.0.1:3000"
        ).split(",")
        if url.strip()
    ]
]
ADMIN_USERNAME = os.getenv(
    "ADMIN_USERNAME",
    "admin"
)

ADMIN_PASSWORD = os.getenv(
    "ADMIN_PASSWORD",
    "admin123"
)

ADMIN_API_TOKEN = os.getenv(
    "ADMIN_API_TOKEN",
    "dev-admin-token"
)

ENABLE_RSS_SCHEDULER = os.getenv(
    "ENABLE_RSS_SCHEDULER",
    "true"
).lower() == "true"

RSS_SCHEDULE_HOUR = int(
    os.getenv(
        "RSS_SCHEDULE_HOUR",
        "9"
    )
)

RSS_SCHEDULE_MINUTE = int(
    os.getenv(
        "RSS_SCHEDULE_MINUTE",
        "0"
    )
)

RSS_SCHEDULE_TIMEZONE = os.getenv(
    "RSS_SCHEDULE_TIMEZONE",
    "Asia/Kolkata"
)
