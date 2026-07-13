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


def seed_initial_data(db):
    import json
    from app.models import Destination, Package, DiscoverPage

    # 1. Seed Destinations & Packages
    if db.query(Destination).count() == 0:
        print("Seeding initial destinations and packages...")
        dest_data = {
            "kenya": {
                "name": "Kenya Safaris",
                "tagline": "Witness the Great Migration & Meet the Maasai Warriors",
                "desc": "Kenya is the historical home of the East African safari. From the rolling savannahs of the Masai Mara to the iconic backdrop of Mount Kilimanjaro in Amboseli, Kenya offers unparalleled wildlife viewing and rich tribal culture.",
                "image": "https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1200&q=80",
                "packages": [
                    {
                        "name": "12-Day Classic Kenya & Tanzania Signature Safari",
                        "duration": "12 Days",
                        "price": 4950,
                        "image": "https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=600&q=80",
                        "highlights": "Masai Mara Wildebeest Crossing, Serengeti Game Drive, Ngorongoro Crater Tour"
                    },
                    {
                        "name": "7-Day Amboseli & Masai Mara Wildlife Adventure",
                        "duration": "7 Days",
                        "price": 3200,
                        "image": "https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=600&q=80",
                        "highlights": "Mt Kilimanjaro Views, Big Five Spotting, Maasai Village Visit"
                    }
                ]
            },
            "uganda": {
                "name": "Uganda Safaris",
                "tagline": "Track Mountain Gorillas in the Impenetrable Forest",
                "desc": "Known as the Pearl of Africa, Uganda is home to over half of the world's remaining mountain gorillas. Trek deep into the rainforests of Bwindi or trace the source of the River Nile at Jinja.",
                "image": "https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=1200&q=80",
                "packages": [
                    {
                        "name": "10-Day Primates & Wilderness Trekking Experience",
                        "duration": "10 Days",
                        "price": 5200,
                        "image": "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=600&q=80",
                        "highlights": "Bwindi Gorilla Permit Included, Kibale Chimpanzee Tracking, Queen Elizabeth Savannah Safari"
                    }
                ]
            },
            "south-africa": {
                "name": "South Africa Holidays",
                "tagline": "Cosmopolitan Cities, Cape Winelands & Kruger Wildlife",
                "desc": "South Africa offers a diverse blend of modern cosmopolitan experiences in Cape Town, whale watching along the Garden Route, wine tours in Stellenbosch, and world-class safaris in Kruger National Park.",
                "image": "https://images.unsplash.com/photo-1580618672591-eb180b1a973f?auto=format&fit=crop&w=1200&q=80",
                "packages": [
                    {
                        "name": "9-Day Cape Town, Winelands & Kruger Safari Tour",
                        "duration": "9 Days",
                        "price": 3800,
                        "image": "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=600&q=80",
                        "highlights": "Table Mountain Cableway, Stellenbosch Wine Tasting, Kruger Open-Vehicle Safari Drives"
                    }
                ]
            }
        }

        for dest_id, dest_info in dest_data.items():
            dest = Destination(
                id=dest_id,
                name=dest_info["name"],
                tagline=dest_info["tagline"],
                desc=dest_info["desc"],
                image=dest_info["image"]
            )
            db.add(dest)
            db.flush()  # to make sure dest.id is associated

            for pkg_info in dest_info["packages"]:
                pkg = Package(
                    destination_id=dest.id,
                    name=pkg_info["name"],
                    duration=pkg_info["duration"],
                    price=pkg_info["price"],
                    image=pkg_info["image"],
                    highlights=pkg_info["highlights"]
                )
                db.add(pkg)
        db.commit()

    # 2. Seed Discover Pages
    if db.query(DiscoverPage).count() == 0:
        print("Seeding initial discover pages...")
        disc_data = {
            "gorilla-trekking": {
                "title": "Gorilla Trekking",
                "tagline": "Misty mountains, primeval forests, and the experience of a lifetime.",
                "heroImage": "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80",
                "content": "Gorilla trekking is one of Africa's most intimate and profound wildlife encounters. Walking through the misty mountain slopes of Bwindi Impenetrable Forest or Volcanoes National Park to stand meters away from a family of mountain gorillas is a privilege that stays with you forever.",
                "subSections": json.dumps([
                    {
                        "title": "Gorillas Are Fascinating",
                        "desc": "Mountain gorillas share 98% of their DNA with humans. Seeing them interact, play, groom, and care for their infants in their natural habitat feels incredibly familiar and moving.",
                        "image": "https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=600&q=80"
                    },
                    {
                        "title": "Get to know the Gorillas",
                        "desc": "Gorilla groups are led by a dominant male, the silverback, named for the gray hair that develops on his back as he matures. They are highly social, gentle giants who live in tight-knit family units.",
                        "image": "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=600&q=80"
                    }
                ]),
                "rules": json.dumps([
                    "Maintain a minimum distance of 7 meters (21 feet) from the gorillas.",
                    "Do not visit if you are sick or carry contagious illnesses (colds, flu).",
                    "Avoid direct eye contact with the silverback; lower your eyes if he approaches.",
                    "No flash photography; switch off all sound prompts on your device."
                ]),
                "tips": json.dumps([
                    "Book permits 6 to 12 months in advance as daily slots are strictly limited.",
                    "Wear sturdy walking boots, thick trousers, and garden gloves to navigate thorns.",
                    "Bring waterproof layers; rainforest weather is highly unpredictable."
                ])
            },
            "national-parks": {
                "title": "National Parks",
                "tagline": "Explore the richest conservation sanctuaries in East & Southern Africa.",
                "heroImage": "https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1200&q=80",
                "content": "African National Parks represent the gold standard of global wildlife conservation. From the iconic Masai Mara and Serengeti plains to the massive herds of elephants in Amboseli and Kruger National Park.",
                "subSections": json.dumps([
                    {
                        "title": "Maasai Mara National Reserve",
                        "desc": "Famous for the annual Great Wildebeest Migration, the Mara is home to dense lion prides, cheetahs, and rich grasslands.",
                        "image": "https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=600&q=80"
                    }
                ]),
                "rules": json.dumps([
                    "Always stay inside your safari vehicle unless at designated picnic spots.",
                    "Do not litter or make loud noises that could disturb the wildlife."
                ]),
                "tips": json.dumps([
                    "The best game viewing occurs during the golden hours of sunrise and sunset.",
                    "Always travel with an experienced accredited driver guide."
                ])
            }
        }

        for disc_id, disc_info in disc_data.items():
            disc = DiscoverPage(
                id=disc_id,
                title=disc_info["title"],
                tagline=disc_info["tagline"],
                heroImage=disc_info["heroImage"],
                content=disc_info["content"],
                subSections=disc_info["subSections"],
                rules=disc_info["rules"],
                tips=disc_info["tips"]
            )
            db.add(disc)
        db.commit()

