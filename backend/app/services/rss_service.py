import re
import feedparser

from datetime import datetime
from sqlalchemy.orm import Session

from app.models import Feed
from app.models import RssSource

ALLOWED_CITIES = {
    "Amsterdam",
    "Paris",
}

MAX_FETCH_ARTICLES = 50
MIN_RSS_RELEVANCE_SCORE = 15

# ==========================================================
# RSS SOURCES
# ==========================================================
RSS_SOURCES = [
    # Amsterdam
    {
        "url": "https://www.iamsterdam.com/en/whats-on/rss",
        "city": "Amsterdam",
        "source": "I Amsterdam",
        "category": "Culture",
    },
    {
        "url": "https://www.rijksmuseum.nl/en/whats-on/feed",
        "city": "Amsterdam",
        "source": "Rijksmuseum",
        "category": "Art",
    },
    {
        "url": "https://www.dutchnews.nl/feed/",
        "city": "Amsterdam",
        "source": "DutchNews",
        "category": "Travel",
    },
    {
        "url": "https://www.dezeen.com/tag/netherlands/feed/",
        "city": "Amsterdam",
        "source": "Dezeen NL",
        "category": "Design",
    },
    {
        "url": "https://www.amsterdamfoodie.nl/feed/",
        "city": "Amsterdam",
        "source": "Amsterdam Foodie",
        "category": "Food",
    },
    {
        "url": "https://www.yourlittleblackbook.me/category/amsterdam/feed/",
        "city": "Amsterdam",
        "source": "Little Black Book",
        "category": "Food",
    },
 
    # Paris
    {
        "url": "https://www.timeout.fr/paris/rss",
        "city": "Paris",
        "source": "Time Out Paris",
        "category": "Events",
    },
    {
        "url": "https://lefooding.com/en/feed",
        "city": "Paris",
        "source": "Le Fooding",
        "category": "Food",
    },
    {
        "url": "https://bonjourparis.com/feed/",
        "city": "Paris",
        "source": "Bonjour Paris",
        "category": "Travel",
    },
    {
        "url": "https://www.louvre.fr/en/rss.xml",
        "city": "Paris",
        "source": "Louvre",
        "category": "Art",
    },
    {
        "url": "https://hipparis.com/feed/",
        "city": "Paris",
        "source": "HiP Paris",
        "category": "Travel",
    },
]
 
CATEGORY_KEYWORDS = {

    "Attractions": [
        "attraction",
        "landmark",
        "must visit",
        "tourist spot",
        "things to do",
        "monument"
    ],

    "Museums": [
        "museum",
        "gallery",
        "exhibition",
        "art collection",
        "cultural center"
    ],

    "Food & Dining": [
        "restaurant",
        "cafe",
        "food",
        "dining",
        "chef",
        "brunch",
        "local cuisine"
    ],

    "Hotels & Stays": [
        "hotel",
        "hostel",
        "stay",
        "resort",
        "accommodation",
        "boutique hotel"
    ],

    "Events & Festivals": [
        "festival",
        "event",
        "concert",
        "show",
        "celebration",
        "market"
    ],

    "City Guides": [
        "guide",
        "itinerary",
        "travel tips",
        "weekend trip",
        "travel guide",
        "city guide"
    ],

    "Local Experiences": [
        "hidden gems",
        "local experience",
        "neighborhood",
        "walking tour",
        "canal cruise",
        "food tour"
    ]
}
CITY_KEYWORDS = {

    "Amsterdam": [
        "amsterdam",
        "netherlands",
        "dutch",
        "rijksmuseum",
        "van gogh museum",
        "jordaan",
        "canal cruise",
        "anne frank",
        "dam square",
        "museumplein",
        "heineken experience"
    ],

    "Paris": [
        "paris",
        "france",
        "french",
        "eiffel tower",
        "louvre",
        "montmartre",
        "versailles",
        "seine",
        "notre dame",
        "latin quarter",
        "arc de triomphe",
        "champs elysees"
    ]
}
TRAVEL_KEYWORDS = [

    "travel",
    "tourism",
    "tourist",
    "destination",
    "trip",
    "holiday",
    "vacation",

    "museum",
    "gallery",
    "landmark",
    "attraction",

    "hotel",
    "hostel",
    "accommodation",

    "restaurant",
    "cafe",
    "food tour",

    "city guide",
    "travel guide",
    "itinerary",

    "things to do",
    "best places",
    "must visit",

    "walking tour",
    "canal cruise",
    "river cruise",

    "hidden gems",
    "local experience",

    "weekend in amsterdam",
    "weekend in paris",

    "eiffel tower",
    "louvre",
    "montmartre",

    "rijksmuseum",
    "van gogh museum",
    "anne frank house"
]
EXCLUDED_KEYWORDS = [

    # Politics
    "election",
    "politics",
    "government",
    "minister",
    "president",
    "parliament",

    # Crime
    "crime",
    "murder",
    "arrest",
    "police",
    "court",
    "lawsuit",

    # Economy
    "stock market",
    "inflation",
    "economy",
    "tax",
    "investment",
    "finance",

    # Conflict
    "war",
    "military",
    "weapon",
    "missile",
    "conflict",

    # General News
    "covid",
    "pandemic",
    "breaking news",
    "political crisis",
    "job cuts",
    "layoff",
    "layoffs",
    "redundancy",
    "profit",
    "earnings",
    "shares",
    "football",
    "traffic",
    "accident",
]
class RSSService:

    # ======================================================
    # CLEAN HTML
    # ======================================================

    @staticmethod
    def clean_html(text: str) -> str:

        if not text:
            return ""

        return re.sub(
            r"<[^>]+>",
            "",
            text
        ).strip()

    # ======================================================
    # EXCLUDED CONTENT CHECK
    # ======================================================

    @staticmethod
    def is_excluded(text: str) -> bool:

        text = text.lower()

        for keyword in EXCLUDED_KEYWORDS:

            if keyword in text:
                return True

        return False

    # ======================================================
    # CITY DETECTION
    # ======================================================

    @staticmethod
    def detect_city(text: str):

        text = text.lower()

        city_scores = {}

        for city, keywords in CITY_KEYWORDS.items():

            score = 0

            for keyword in keywords:

                score += text.count(keyword)

            city_scores[city] = score

        best_city = max(
            city_scores,
            key=city_scores.get
        )

        if city_scores[best_city] > 0:
            return best_city

        return None

    # ======================================================
    # CATEGORY DETECTION
    # ======================================================

    @staticmethod
    def detect_category(text: str):

        text = text.lower()

        best_category = "City Guides"
        highest_score = 0

        for category, keywords in CATEGORY_KEYWORDS.items():

            score = 0

            for keyword in keywords:

                score += text.count(keyword)

            if score > highest_score:

                highest_score = score
                best_category = category

        return best_category

    # ======================================================
    # TRAVEL SCORE
    # ======================================================

    @staticmethod
    def travel_score(text: str) -> int:

        text = text.lower()

        score = 0

        # Travel keywords

        for keyword in TRAVEL_KEYWORDS:

            if keyword in text:
                score += 5

        # City keywords

        for keywords in CITY_KEYWORDS.values():

            for keyword in keywords:

                if keyword in text:
                    score += 10

        # Category keywords

        for keywords in CATEGORY_KEYWORDS.values():

            for keyword in keywords:

                if keyword in text:
                    score += 3

        return score

    # ======================================================
    # TRAVEL VALIDATION
    # ======================================================

    @staticmethod
    def is_travel_related(text: str) -> bool:

        score = RSSService.travel_score(text)

        return score >= MIN_RSS_RELEVANCE_SCORE

    # ======================================================
    # RELEVANCE SCORE
    # ======================================================

    @staticmethod
    def calculate_relevance(text: str):

        score = RSSService.travel_score(text)

        return min(score, 100)

    # ======================================================
    # IMAGE EXTRACTION
    # ======================================================

    @staticmethod
    def extract_image(entry):

        if hasattr(entry, "media_content"):

            media = entry.media_content

            if media:
                return media[0].get("url")

        if hasattr(entry, "media_thumbnail"):

            media = entry.media_thumbnail

            if media:
                return media[0].get("url")

        if hasattr(entry, "links"):

            for link in entry.links:

                if link.get(
                    "type",
                    ""
                ).startswith("image"):

                    return link.get("href")

        return None

    # ======================================================
    # CREATE ARTICLE
    # ======================================================

    @staticmethod
    def create_article(
        entry,
        source_name,
        source_url=None,
        forced_city=None
    ):

        title = entry.get(
            "title",
            ""
        )

        summary = RSSService.clean_html(
            entry.get(
                "summary",
                ""
            )
        )

        combined_text = (
            f"{title} {summary}"
        )

        if RSSService.is_excluded(
            combined_text
        ):
            return None

        if not RSSService.is_travel_related(
            combined_text
        ):
            return None

        detected_city = RSSService.detect_city(
            combined_text
        )

        city = forced_city

        if detected_city:
            city = detected_city

        if city not in ALLOWED_CITIES:
            return None

        relevance_score = RSSService.calculate_relevance(
            combined_text
        )

        if relevance_score < MIN_RSS_RELEVANCE_SCORE:
            return None

        category = (
            RSSService.detect_category(
                combined_text
            )
        )

        return {

            "title": title,

            "summary": summary,

            "link": entry.get(
                "link",
                ""
            ),

            "author": entry.get(
                "author",
                "Unknown"
            ),

            "published_date": entry.get(
                "published",
                ""
            ),

            "source_name": source_name,

            "source_url": source_url,

            "city": city,

            "category": category,

            "image_url": (
                RSSService.extract_image(
                    entry
                )
            ),

            "relevance_score": relevance_score
        }

    # ======================================================
    # FETCH & STORE
    # ======================================================

    @staticmethod
    def ensure_default_sources(
        db: Session
    ):

        existing_count = db.query(RssSource).count()

        if existing_count > 0:
            return

        for source in RSS_SOURCES:

            db.add(
                RssSource(
                    name=source["source"],
                    url=source["url"],
                    city=source.get("city"),
                    category=source.get("category"),
                    enabled=True
                )
            )

        db.commit()

    @staticmethod
    def get_sources(
        db: Session,
        enabled_only: bool = False
    ):

        RSSService.ensure_default_sources(db)

        query = db.query(RssSource)

        if enabled_only:
            query = query.filter(RssSource.enabled.is_(True))

        return (
            query
            .order_by(
                RssSource.city.asc(),
                RssSource.name.asc()
            )
            .all()
        )

    @staticmethod
    def fetch_and_store(
        db: Session
    ):

        candidates = []
        inserted = 0
        skipped = 0

        sources = RSSService.get_sources(
            db,
            enabled_only=True
        )

        for source in sources:

            try:

                feed = feedparser.parse(
                    source.url
                )

                print(
                    f"\nProcessing {source.name}"
                )

                print(
                    f"Entries Found: {len(feed.entries)}"
                )

                for entry in feed.entries:

                    article = (
                        RSSService.create_article(
                            entry,
                            source.name,
                            source.url,
                            source.city
                        )
                    )

                    if not article:

                        skipped += 1
                        continue

                    candidates.append(article)

            except Exception as e:

                print(
                    f"RSS ERROR -> {source.url}"
                )

                print(str(e))

            finally:

                source.last_fetched = datetime.utcnow()

        candidates = sorted(
            candidates,
            key=lambda article: article["relevance_score"],
            reverse=True
        )

        seen_links = set()

        for article in candidates:

            if inserted >= MAX_FETCH_ARTICLES:
                skipped += 1
                continue

            if article["link"] in seen_links:
                skipped += 1
                continue

            seen_links.add(article["link"])

            existing = (

                db.query(Feed)

                .filter(
                    Feed.link ==
                    article["link"]
                )

                .first()
            )

            if existing:

                skipped += 1
                continue

            feed_row = Feed(

                title=article["title"],

                link=article["link"],

                summary=article["summary"],

                author=article["author"],

                source_name=article["source_name"],

                source_url=article["source_url"],

                image_url=article["image_url"],

                published_date=article["published_date"],

                city=article["city"],

                category=article["category"],

                relevance_score=article["relevance_score"],

                approval_status="pending"
            )

            db.add(feed_row)

            inserted += 1

        try:

            db.commit()

        except Exception as e:

            db.rollback()

            print(
                "DATABASE COMMIT FAILED"
            )

            print(str(e))

            raise

        return {

            "inserted": inserted,

            "skipped": skipped,

            "candidate_count": len(candidates),

            "max_articles": MAX_FETCH_ARTICLES,

            "min_relevance_score": MIN_RSS_RELEVANCE_SCORE
        }

    # ======================================================
    # HELPERS
    # ======================================================

    @staticmethod
    def fetch_all(
        db: Session
    ):

        return RSSService.fetch_and_store(
            db
        )

    @staticmethod
    def get_all_feeds(
        db: Session
    ):

        return (

            db.query(Feed)

            .order_by(
                Feed.created_at.desc()
            )

            .all()
        )

    @staticmethod
    def get_city_feeds(
        db: Session,
        city: str
    ):

        return (

            db.query(Feed)

            .filter(
                Feed.city == city
            )

            .order_by(
                Feed.created_at.desc()
            )

            .all()
        )
