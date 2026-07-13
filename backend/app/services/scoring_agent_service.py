import json
import re
from datetime import datetime
from datetime import timezone
from email.utils import parsedate_to_datetime

from app.config import CLAUDE_API_KEY
from app.config import CLAUDE_MODEL
from app.config import LLM_PROVIDER
from app.config import OPENAI_API_KEY
from app.config import OPENAI_MODEL


SCORING_SYSTEM_PROMPT = """
# Role
You are a senior editorial scoring agent for Neem Journeys, a slow travel brand that curates cultural, gastronomic, design and artistic experiences in Amsterdam and Paris.

Your sole task is to evaluate a single news article or blog post and return a structured JSON score. You do not summarise, rewrite, or comment on the article beyond what the JSON schema requires.

# Brand brief
Neem Journeys speaks to culturally curious, affluent travellers (35-55) who prefer depth over speed. The brand voice is measured, unhurried and literate. Content must feel like a recommendation from a well-travelled friend - never promotional, never rushed.

# Scoring rubric (total: 100 points)
Score each criterion as an integer within its stated range. Do not exceed the maximum for any criterion.

1. brand_alignment     max 35  - Does the topic sit within slow travel, culture, food, design or art in Amsterdam or Paris? Is the tone compatible with Neem Journeys' editorial voice?
2. audience_relevance   max 20  - Would a 35-55 culturally curious, financially comfortable traveller care about this? Would it inspire, inform or delight them?
3. originality          max 15  - Is this a fresh angle, an underreported story, or a niche discovery? Penalise heavily recycled news or generic city guides.
4. timeliness           max 10  - Is the article current (within 7 days), upcoming (event or opening), or genuinely evergreen? Penalise stale or dated content.
5. visual_potential    max 10  - Does this story lend itself to strong photography or visual storytelling for Instagram? Interiors, landscapes, food, art and architecture score highest.
6. content_potential   max 5   - Can this story be expanded into a newsletter editorial, a blog guide or a LinkedIn piece? Does it have substance beyond a headline?
7. source_authority    max 5   - Is the source a recognised publication, cultural institution, official tourism body, or respected independent voice? Penalise anonymous or low-credibility sources.

# Output rules
- Return ONLY valid JSON. No preamble, no explanation, no markdown fences.
- All integer values. No floats.
- total_score must equal the arithmetic sum of all seven criteria scores.
- recommendation must be exactly one of: "publish" | "review" | "reject"
  - "publish"  -> total_score >= 75
  - "review"   -> total_score 50-74
  - "reject"   -> total_score < 50
- reason must be 1-2 sentences maximum. Plain English. No bullet points.
""".strip()


class ScoringAgentService:

    provider_disabled = False

    @staticmethod
    def score_feed(feed):

        response = ScoringAgentService._score_with_ai(feed)

        if response:
            return response

        return ScoringAgentService._fallback_score(feed)

    @staticmethod
    def _score_with_ai(feed):

        if ScoringAgentService.provider_disabled:
            return None

        prompt = ScoringAgentService._build_user_prompt(feed)

        try:
            if LLM_PROVIDER == "claude":
                raw = ScoringAgentService._invoke_claude(prompt)
            else:
                raw = ScoringAgentService._invoke_openai(prompt)

            if not raw:
                return None

            parsed = ScoringAgentService._extract_json(raw)
            return ScoringAgentService._normalise_score(parsed)
        except Exception as exc:
            print(f"Scoring agent AI request failed, using fallback: {exc}")
            return None

    @staticmethod
    def _build_user_prompt(feed):

        return f"""
Score the following article for Neem Journeys editorial relevance.

SOURCE:     {feed.source_name or ""}
CITY:       {feed.city or ""}
CATEGORY:  {feed.category or ""}
PUBLISHED: {feed.published_date or ""}
TITLE:     {feed.title}
SUMMARY:   {feed.summary or ""}
URL:       {feed.link}

Return ONLY this JSON object with no other text:

{{
  "brand_alignment":   <0-35>,
  "audience_relevance": <0-20>,
  "originality":        <0-15>,
  "timeliness":         <0-10>,
  "visual_potential":   <0-10>,
  "content_potential":  <0-5>,
  "source_authority":   <0-5>,
  "total_score":         <0-100>,
  "recommendation":     "publish" | "review" | "reject",
  "reason":             "1-2 sentence plain English explanation"
}}
""".strip()

    @staticmethod
    def _invoke_openai(prompt: str):

        if not OPENAI_API_KEY:
            return None

        from langchain_core.messages import HumanMessage
        from langchain_core.messages import SystemMessage
        from langchain_openai import ChatOpenAI

        llm = ChatOpenAI(
            api_key=OPENAI_API_KEY,
            model=OPENAI_MODEL,
            temperature=0,
            max_tokens=700,
        )
        response = llm.invoke(
            [
                SystemMessage(content=SCORING_SYSTEM_PROMPT),
                HumanMessage(content=prompt),
            ]
        )

        return response.content

    @staticmethod
    def _invoke_claude(prompt: str):

        if not CLAUDE_API_KEY:
            return None

        from langchain_anthropic import ChatAnthropic
        from langchain_core.messages import HumanMessage
        from langchain_core.messages import SystemMessage

        llm = ChatAnthropic(
            anthropic_api_key=CLAUDE_API_KEY,
            model=CLAUDE_MODEL,
            temperature=0,
            max_tokens=700,
        )
        response = llm.invoke(
            [
                SystemMessage(content=SCORING_SYSTEM_PROMPT),
                HumanMessage(content=prompt),
            ]
        )

        return response.content

    @staticmethod
    def _extract_json(text: str):

        try:
            return json.loads(text)
        except json.JSONDecodeError:
            pass

        match = re.search(r"\{.*\}", text, re.DOTALL)

        if not match:
            raise ValueError("Scoring agent response did not contain JSON")

        return json.loads(match.group(0))

    @staticmethod
    def _normalise_score(response):

        scores = {
            "brand_alignment": ScoringAgentService._bounded_int(
                response.get("brand_alignment"),
                35
            ),
            "audience_relevance": ScoringAgentService._bounded_int(
                response.get("audience_relevance"),
                20
            ),
            "originality": ScoringAgentService._bounded_int(
                response.get("originality"),
                15
            ),
            "timeliness": ScoringAgentService._bounded_int(
                response.get("timeliness"),
                10
            ),
            "visual_potential": ScoringAgentService._bounded_int(
                response.get("visual_potential"),
                10
            ),
            "content_potential": ScoringAgentService._bounded_int(
                response.get("content_potential"),
                5
            ),
            "source_authority": ScoringAgentService._bounded_int(
                response.get("source_authority"),
                5
            ),
        }
        total = sum(scores.values())

        return {
            "total_score": total,
            "factor_scores": scores,
            "recommendation": ScoringAgentService._recommendation(total),
            "reason": ScoringAgentService._short_reason(
                response.get("reason", "")
            ),
            "confidence": 0.9,
        }

    @staticmethod
    def _fallback_score(feed):

        text = f"{feed.title} {feed.summary or ''}".lower()
        source = (feed.source_name or "").lower()
        city = (feed.city or "").lower()
        category = (feed.category or "").lower()

        brand_terms = [
            "art",
            "artist",
            "architecture",
            "atelier",
            "cafe",
            "culture",
            "design",
            "dining",
            "exhibition",
            "food",
            "gallery",
            "gastronomy",
            "heritage",
            "interior",
            "museum",
            "neighbourhood",
            "neighborhood",
            "restaurant",
            "slow travel",
        ]
        generic_penalty_terms = [
            "hacked",
            "airline",
            "strike",
            "traffic",
            "crime",
            "accident",
            "stock",
            "football",
        ]
        visual_terms = [
            "architecture",
            "art",
            "design",
            "gallery",
            "garden",
            "hotel",
            "interior",
            "museum",
            "restaurant",
            "studio",
        ]
        authoritative_terms = [
            "museum",
            "official",
            "tourism",
            "dezeen",
            "timeout",
            "iamsterdam",
            "paris je t'aime",
            "paris tourist",
            "rietveld",
            "rijksmuseum",
            "louvre",
        ]

        brand_hits = sum(1 for term in brand_terms if term in text)
        visual_hits = sum(1 for term in visual_terms if term in text)
        penalty_hits = sum(1 for term in generic_penalty_terms if term in text)

        city_fit = city in {"amsterdam", "paris"} or "amsterdam" in text or "paris" in text
        category_fit = category in {
            "art",
            "culture",
            "design",
            "events",
            "food",
            "travel",
        }

        brand_alignment = min(35, 8 + brand_hits * 6)
        if city_fit:
            brand_alignment += 7
        if category_fit:
            brand_alignment += 5
        brand_alignment = max(0, min(35, brand_alignment - penalty_hits * 8))

        audience_relevance = min(20, 6 + brand_hits * 3 + (5 if city_fit else 0))
        audience_relevance = max(0, audience_relevance - penalty_hits * 4)

        originality = 8 + min(7, visual_hits * 2)
        if any(term in text for term in ["hidden", "new", "opening", "niche", "studio"]):
            originality = min(15, originality + 3)
        originality = max(0, originality - penalty_hits * 3)

        timeliness = ScoringAgentService._fallback_timeliness(feed)
        visual_potential = min(10, (6 if feed.image_url else 3) + visual_hits * 2)
        content_potential = min(5, 2 + (1 if len(text) > 180 else 0) + (2 if brand_hits >= 2 else 0))
        source_authority = 3
        if any(term in source for term in authoritative_terms):
            source_authority = 5
        elif source:
            source_authority = 4

        scores = {
            "brand_alignment": int(brand_alignment),
            "audience_relevance": int(audience_relevance),
            "originality": int(originality),
            "timeliness": int(timeliness),
            "visual_potential": int(visual_potential),
            "content_potential": int(content_potential),
            "source_authority": int(source_authority),
        }
        total = sum(scores.values())

        return {
            "total_score": total,
            "factor_scores": scores,
            "recommendation": ScoringAgentService._recommendation(total),
            "reason": (
                "Logic fallback score based on city fit, cultural keywords, freshness, "
                "visual cues and source authority."
            ),
            "confidence": 0.55,
        }

    @staticmethod
    def _fallback_timeliness(feed):

        if not feed.published_date:
            return 6

        try:
            parsed = parsedate_to_datetime(str(feed.published_date))
        except (TypeError, ValueError):
            try:
                parsed = datetime.fromisoformat(
                    str(feed.published_date).replace("Z", "+00:00")
                )
            except ValueError:
                return 8

        if parsed.tzinfo is None:
            parsed = parsed.replace(tzinfo=timezone.utc)

        now = datetime.now(timezone.utc)
        age_days = max(0, (now - parsed).days)

        if age_days <= 7:
            return 10

        if age_days <= 30:
            return 7

        return 5

    @staticmethod
    def _bounded_int(value, maximum):

        try:
            numeric = int(round(float(value)))
        except (TypeError, ValueError):
            numeric = 0

        return max(0, min(maximum, numeric))

    @staticmethod
    def _recommendation(total: int):

        if total >= 75:
            return "publish"

        if total >= 50:
            return "review"

        return "reject"

    @staticmethod
    def _short_reason(reason: str):

        cleaned = " ".join(str(reason or "").split())

        if not cleaned:
            return "The article was scored against Neem Journeys editorial fit, audience relevance, freshness and source authority."

        sentences = re.split(r"(?<=[.!?])\s+", cleaned)
        return " ".join(sentences[:2])
