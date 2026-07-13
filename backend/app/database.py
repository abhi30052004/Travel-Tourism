from sqlalchemy import create_engine
from sqlalchemy import text
from sqlalchemy.orm import declarative_base
from sqlalchemy.orm import sessionmaker

from app.config import DATABASE_URL


# ===========================================================
# Engine
# ===========================================================

if DATABASE_URL.startswith("sqlite"):

    engine = create_engine(
        DATABASE_URL,
        connect_args={
            "check_same_thread": False
        },
        echo=False
    )

else:

    engine = create_engine(
        DATABASE_URL,
        pool_pre_ping=True,
        echo=False
    )


# ===========================================================
# Session
# ===========================================================

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

Base = declarative_base()


# ===========================================================
# Dependency
# ===========================================================

def get_db():

    db = SessionLocal()

    try:
        yield db

    finally:
        db.close()


# ===========================================================
# SQLite Schema Upgrades
# ===========================================================

def ensure_database_schema():

    # This migration helper is only needed for SQLite.
    # PostgreSQL should use SQLAlchemy models / Alembic migrations.
    if not DATABASE_URL.startswith("sqlite"):
        return

    table_columns = {
        "feeds": {
            "scoring_breakdown": "TEXT",
            "scoring_reason": "TEXT",
            "scoring_confidence": "FLOAT DEFAULT 0",
            "fetch_status": "VARCHAR(100) DEFAULT 'fetched'",
            "editor_notes": "TEXT",
        },
        "generated_content": {
            "platform": "VARCHAR(100) DEFAULT 'blog'",
            "hashtags": "TEXT",
            "featured_image_url": "VARCHAR(1000)",
            "photography_direction": "TEXT",
            "source_url": "VARCHAR(1000)",
            "suggested_post_time": "VARCHAR(100)",
            "scheduled_publish_time": "DATETIME",
            "validation_status": "VARCHAR(100) DEFAULT 'not_checked'",
            "validation_score": "FLOAT DEFAULT 0",
            "validation_issues": "TEXT",
            "revision_count": "INTEGER DEFAULT 0",
        },
        "publish_logs": {
            "scheduled_publish_time": "DATETIME",
        },
    }

    with engine.begin() as connection:

        for table_name, columns in table_columns.items():

            try:

                existing_columns = {
                    row[1]
                    for row in connection.execute(
                        text(f"PRAGMA table_info({table_name})")
                    )
                }

            except Exception:

                # Table doesn't exist yet.
                continue

            for column_name, column_type in columns.items():

                if column_name in existing_columns:
                    continue

                connection.execute(
                    text(
                        f"""
                        ALTER TABLE {table_name}
                        ADD COLUMN {column_name} {column_type}
                        """
                    )
                )

                print(
                    f"Added column '{column_name}' "
                    f"to table '{table_name}'"
                )
