import json
import re

from app.config import CLAUDE_API_KEY
from app.config import CLAUDE_MODEL
from app.config import LLM_PROVIDER
from app.config import OPENAI_API_KEY
from app.config import OPENAI_MODEL


PLATFORM_WORD_LIMITS = {
    "instagram": (150, 220),
    "linkedin": (250, 350),
    "newsletter": (300, 500),
    "blog": (700, 900),
}



PLATFORM_SPECS = {
    "instagram": (
        "150-220 words, sensory present-tense caption, three hashtag sets, "
        "one quiet call to action."
    ),
    "linkedin": (
        "250-350 words, thoughtful professional post about a culture or "
        "travel trend."
    ),
    "newsletter": (
        "300-500 words, warm editorial dispatch, no exclamation marks."
    ),
    "blog": (
        "700-900 words, SEO-considered guide or essay with practical details, "
        "no exclamation marks."
    ),
}


class LLMService:

    provider_disabled = False

    @staticmethod
    def _extract_json(text: str):

        try:
            return json.loads(text)
        except json.JSONDecodeError:
            pass

        match = re.search(r"\{.*\}", text, re.DOTALL)

        if not match:
            raise ValueError("LLM response did not contain JSON")

        return json.loads(match.group(0))

    @staticmethod
    def complete_json(prompt: str, max_tokens: int = 1800):

        if LLMService.provider_disabled:
            return None

        if LLM_PROVIDER == "openai":
            return LLMService._complete_openai_json(prompt, max_tokens)

        if LLM_PROVIDER == "claude":
            return LLMService._complete_claude_json(prompt, max_tokens)

        return None

    @staticmethod
    def _complete_openai_json(prompt: str, max_tokens: int):

        if not OPENAI_API_KEY:
            return None

        try:
            from langchain_core.messages import HumanMessage
            from langchain_core.messages import SystemMessage
            from langchain_openai import ChatOpenAI

            llm = ChatOpenAI(
                api_key=OPENAI_API_KEY,
                model=OPENAI_MODEL,
                temperature=0.3,
                max_tokens=max_tokens,
            )
            response = llm.invoke(
                [
                    SystemMessage(
                        content=(
                            "You are an editorial AI for Neem Journeys. "
                            "Return valid JSON only."
                        )
                    ),
                    HumanMessage(content=prompt),
                ]
            )

            return LLMService._extract_json(response.content)
        except Exception as exc:
            print(f"LangChain OpenAI request failed, using fallback: {exc}")
            return None

    @staticmethod
    def _complete_claude_json(prompt: str, max_tokens: int):

        if not CLAUDE_API_KEY:
            return None

        try:
            from langchain_anthropic import ChatAnthropic
            from langchain_core.messages import HumanMessage
            from langchain_core.messages import SystemMessage

            llm = ChatAnthropic(
                anthropic_api_key=CLAUDE_API_KEY,
                model=CLAUDE_MODEL,
                temperature=0.3,
                max_tokens=max_tokens,
            )
            response = llm.invoke(
                [
                    SystemMessage(
                        content=(
                            "You are an editorial AI for Neem Journeys. "
                            "Return valid JSON only."
                        )
                    ),
                    HumanMessage(content=prompt),
                ]
            )

            return LLMService._extract_json(response.content)
        except Exception as exc:
            print(f"LangChain Claude request failed, using fallback: {exc}")
            return None

    @staticmethod
    def generate_platform_content(feed, platform: str):

        minimum_words, maximum_words = PLATFORM_WORD_LIMITS[platform]

        prompt = f"""
Create {platform} content for Neem Journeys from the approved RSS feed story.

Brand voice:
- Measured, unhurried, curious and culturally literate.
- Written for affluent travellers aged 35-55 who care about culture, food,
  architecture, art, design, neighbourhood life and slow travel.
- Editorial and observant, never promotional, rushed or shouty.

Rules:
- Always refer to the brand as "Neem Journeys".
- Use European English spelling.
- Avoid superlatives such as best, greatest, most incredible.
- Do not invent facts beyond the RSS source material and editor notes.
- The content field must be between {minimum_words} and {maximum_words} words.
- Include a photography_direction field.
- Include source attribution.

Return strict JSON only with:
headline, content, excerpt, seo_title, seo_description, keywords array, hashtags array,
photography_direction, suggested_post_time.

Platform spec: {PLATFORM_SPECS[platform]}

RSS source story:
Title: {feed.title}
Summary: {feed.summary or ""}
City: {feed.city or ""}
Category: {feed.category or ""}
Source: {feed.source_name or ""}
Published: {feed.published_date or ""}
URL: {feed.link}
Editor notes: {feed.editor_notes or ""}
"""

        response = LLMService.complete_json(prompt, max_tokens=2600)

        if response:
            return LLMService._enforce_platform_word_limit(
                response,
                platform,
                prompt
            )

        return LLMService._fallback_content(feed, platform)

    @staticmethod
    def _word_count(text: str):

        return len(re.findall(r"\b\w+\b", text or ""))

    @staticmethod
    def _enforce_platform_word_limit(response, platform: str, source_prompt: str):

        content = response.get("content", "")
        minimum_words, maximum_words = PLATFORM_WORD_LIMITS[platform]
        word_count = LLMService._word_count(content)

        if minimum_words <= word_count <= maximum_words:
            return response

        repaired = LLMService._repair_platform_word_limit(
            response,
            platform,
            source_prompt,
            word_count
        )

        if repaired:
            repaired_count = LLMService._word_count(repaired.get("content", ""))

            if minimum_words <= repaired_count <= maximum_words:
                return repaired

            response = repaired

        if LLMService._word_count(response.get("content", "")) > maximum_words:
            response["content"] = LLMService._trim_to_word_limit(
                response.get("content", ""),
                maximum_words
            )
            response["excerpt"] = response.get("excerpt") or response["content"][:240]
            response["seo_description"] = (
                response.get("seo_description")
                or response["content"][:300]
            )

        return response

    @staticmethod
    def _repair_platform_word_limit(
        response,
        platform: str,
        source_prompt: str,
        actual_words: int
    ):

        minimum_words, maximum_words = PLATFORM_WORD_LIMITS[platform]
        repair_prompt = f"""
The previous {platform} draft had {actual_words} words in the content field.
Revise it so the content field is between {minimum_words} and {maximum_words}
words. Keep the same Neem Journeys brand voice, source attribution, European
English, JSON schema and factual limits.

Original instruction:
{source_prompt}

Previous JSON:
{json.dumps(response)}
"""

        return LLMService.complete_json(repair_prompt, max_tokens=2200)

    @staticmethod
    def _trim_to_word_limit(text: str, maximum_words: int):

        matches = list(re.finditer(r"\b\w+\b", text or ""))

        if len(matches) <= maximum_words:
            return text

        end_index = matches[maximum_words - 1].end()
        trimmed = text[:end_index].rstrip(" ,;:-")

        if not trimmed.endswith((".", "?", "!")):
            trimmed = f"{trimmed}."

        return trimmed

    @staticmethod
    def revise_content(content, issues: list[str]):

        prompt = f"""
Revise this Neem Journeys {content.platform} draft so it passes brand validation.

Issues:
{json.dumps(issues)}

Rules:
- Always use "Neem Journeys".
- European English.
- Remove hype and superlatives.
- Newsletter and Blog must not use exclamation marks.
- Include photography direction.

Return strict JSON only with: headline, content, excerpt, seo_title, seo_description,
keywords array, hashtags array, photography_direction, suggested_post_time.

Current headline: {content.headline}
Current draft:
{content.content}
"""

        response = LLMService.complete_json(prompt, max_tokens=2600)

        if response:
            return response

        revised_text = content.content
        replacements = {
            "best": "carefully chosen",
            "Best": "Carefully chosen",
            "greatest": "notable",
            "Greatest": "Notable",
            "most incredible": "memorable",
            "Most incredible": "Memorable",
            "color": "colour",
            "neighborhood": "neighbourhood",
            "center": "centre",
            "traveling": "travelling",
        }

        for old, new in replacements.items():
            revised_text = revised_text.replace(old, new)

        revised_text = re.sub(
            r"\bNeem\b(?!\s+Journeys)",
            "Neem Journeys",
            revised_text
        )

        if content.platform in {"newsletter", "blog"}:
            revised_text = revised_text.replace("!", ".")

        return {
            "headline": content.headline,
            "content": revised_text,
            "excerpt": content.excerpt or revised_text[:240],
            "seo_title": content.seo_title,
            "seo_description": content.seo_description,
            "keywords": [],
            "hashtags": [],
            "photography_direction": content.photography_direction
            or "Editorial destination photography with natural light and local detail.",
            "suggested_post_time": content.suggested_post_time,
        }

    @staticmethod
    def _fallback_content(feed, platform: str):

        suggested_times = {
            "instagram": "Tuesday 19:00",
            "linkedin": "Wednesday 08:00",
            "newsletter": "Thursday 09:00",
            "blog": "Thursday 10:00",
        }
        hashtags = {
            "instagram": [
                f"#{feed.city or 'SlowTravel'}",
                "#CultureTravel",
                "#NeemJourneys",
            ],
            "linkedin": ["#TravelCulture", "#EditorialTravel", "#NeemJourneys"],
            "newsletter": ["Neem Journeys"],
            "blog": ["slow travel", feed.city or "Europe", "culture"],
        }

        city = feed.city or "European"
        summary = feed.summary or (
            "The story offers a useful point of entry into local culture, design, food, "
            "or the small rituals that shape a city."
        )

        base_paragraphs = [
            (
                f"Neem Journeys is watching this story because it speaks to the quieter "
                f"texture of {city} travel: culture, place, and the kind of detail that "
                f"rewards an unhurried visit."
            ),
            summary,
            (
                "For travellers who prefer to understand a city rather than rush through it, "
                "this is a useful starting point for a more considered itinerary."
            ),
        ]

        platform_paragraphs = {
            "instagram": [
                (
                    "Imagine arriving with time enough to notice the light, the materials, "
                    "and the small local habits around the story."
                ),
                "Save this for a slower city day with room for curiosity.",
            ],
            "linkedin": [
                (
                    "For travel brands, stories like this are a reminder that destination "
                    "content does not need to chase volume. It can build authority by reading "
                    "the city carefully and connecting cultural detail to traveller intent."
                ),
                (
                    "Neem Journeys can use this angle to frame travel as cultural literacy: "
                    "not simply where to go, but how to arrive with context."
                ),
            ],
            "newsletter": [
                (
                    "There is a particular pleasure in following a city through one local "
                    "story at a time. It lets the itinerary stay human, shaped by texture "
                    "rather than urgency."
                ),
                (
                    f"In {city}, this piece could become a dispatch that sits beside a cafe "
                    "recommendation, a gallery note, or a short neighbourhood walk."
                ),
                (
                    "The editorial opportunity is to invite the reader into the scene, then "
                    "leave them with one practical reason to look a little closer."
                ),
            ],
            "blog": [
                (
                    "A Neem Journeys blog version should open with the atmosphere of the place, "
                    "then move into context: why the story matters now, who it is for, and how "
                    "a traveller might fold it into a slower day."
                ),
                (
                    f"For {city}, the practical layer matters. Add nearby streets, museum or "
                    "restaurant references where relevant, seasonal timing, and a note on when "
                    "to arrive so the experience feels spacious rather than scheduled to the edge."
                ),
                (
                    "The piece should avoid ranking language. Instead of declaring something "
                    "essential, it should show the reader what makes the detail worth noticing: "
                    "craft, history, hospitality, design, food culture, or the rhythm of a local "
                    "neighbourhood."
                ),
                (
                    "Close with a quiet planning note from Neem Journeys, connecting the article "
                    "back to the brand's role as a curator of thoughtful city travel."
                ),
            ],
        }

        body = (
            f"{feed.title}\n\n"
            + "\n\n".join(base_paragraphs + platform_paragraphs[platform])
            + f"\n\nSource: {feed.link}"
        )

        return {
            "headline": feed.title,
            "content": body,
            "excerpt": (feed.summary or body)[:240],
            "seo_title": f"{feed.title} | Neem Journeys",
            "seo_description": (feed.summary or body)[:300],
            "keywords": [
                feed.city or "Europe",
                feed.category or "culture",
                "slow travel",
                "Neem Journeys",
            ],
            "hashtags": hashtags[platform],
            "photography_direction": (
                "Natural-light editorial image showing local texture, architecture, "
                "or a close cultural detail connected to the story."
            ),
            "suggested_post_time": suggested_times[platform],
        }
