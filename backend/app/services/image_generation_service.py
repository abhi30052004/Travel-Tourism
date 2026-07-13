import base64
import uuid

from sqlalchemy.orm import Session

from app.config import BACKEND_DIR
from app.config import OPENAI_API_KEY
from app.config import OPENAI_IMAGE_MODEL
from app.models import GeneratedContent
from app.services.agent_log_service import AgentLogService


MEDIA_DIR = BACKEND_DIR / "generated_media"
IMAGE_DIR = MEDIA_DIR / "images"

PLATFORM_IMAGE_SIZES = {
    "instagram": "1024x1024",
    "linkedin": "1024x1024",
    "newsletter": "1024x1024",
    "blog": "1024x1024",
}


class ImageGenerationService:

    @staticmethod
    def generate_for_content(db: Session, content_id: int):

        content = (
            db.query(GeneratedContent)
            .filter(GeneratedContent.id == content_id)
            .first()
        )

        if not content:
            return None

        prompt = ImageGenerationService._build_prompt(content)
        image_bytes = ImageGenerationService._generate_image_bytes(
            prompt,
            content.platform
        )
        image_url = ImageGenerationService._save_image(
            image_bytes,
            content_id
        )

        content.featured_image_prompt = prompt
        content.featured_image_url = image_url

        db.commit()
        db.refresh(content)

        AgentLogService.log(
            db,
            "image_generation_agent",
            "generate_content_image",
            "completed",
            f"Generated image for content {content.id}."
        )

        return content

    @staticmethod
    def _build_prompt(content: GeneratedContent):

        feed = content.feed
        city = feed.city if feed else ""
        category = feed.category if feed else ""
        source_name = feed.source_name if feed else ""
        source_summary = feed.summary if feed else ""
        source_image_url = feed.image_url if feed else ""

        return f"""
Create one premium brand travel poster for Neem Journeys.

Use the visual language of a polished European travel campaign poster: a
structured editorial collage with one large hero destination image, two to four
supporting realistic photo panels, clean dividers, and restrained information
blocks. The composition should feel compatible with the Neem Journeys
website/admin UI, but the colour palette must come from the original story
and visual subject, not from a fixed brand palette.

Adaptive colour direction:
- Derive the main colours from the content itself: city atmosphere,
  architecture, materials, weather, season, food, art, interiors, landscape,
  and any original RSS/source image context.
- If the story suggests concrete, brick, canal water, museum interiors,
  evening light, gardens, food, or local street scenes, let those natural
  colours lead the poster.
- Use brand styling only as a restraint: elegant spacing, premium contrast,
  editorial hierarchy, and quiet accent lines.
- Avoid forcing forest green, gold, cream, teal, orange, purple gradients, or
  any single fixed palette unless those colours genuinely fit the story.
- Avoid neon, over-saturated tourist-brochure colours, and artificial colour
  grading.

The poster must feel premium, realistic, and editorial rather than cartoonish.
Use photorealistic Amsterdam/Paris travel imagery, natural light, considered
architecture/material detail, and a measured slow-travel mood.

Image ratio:
- Generate a moderate square 1:1 brand poster.
- Keep the important title, brand mark, destination panels and visual subject
  inside a central safe area so the poster still works when previewed in a
  gentle 4:5 frame.
- Avoid very tall infographic layouts and avoid wide landscape banner layouts.

Typography and layout:
- Include simple, bold poster typography only where useful.
- Use short, legible text such as "NEEM JOURNEYS", the city name, and a concise
  headline inspired by the content.
- Use an elegant serif feel for large headings and a clean modern sans-serif
  feel for small labels, echoing the website's Playfair Display + Inter style.
- Use square or lightly rounded card edges, subtle borders, quiet divider
  lines, soft shadows, and calm spacing like the admin interface.
- Avoid tiny paragraph text, fake itinerary tables, dense fine print, QR codes,
  watermarks, external logos, and unreadable text.
- Do not copy the reference image exactly; use it only as a rough multi-panel
  poster layout reference while applying the Neem Journeys palette and tone.

Avoid fantasy lighting, exaggerated colours, generic stock-photo posing, and
identifiable faces unless the source material clearly requires people.

Content:
Headline: {content.headline}
Platform: {content.platform}
City: {city or ""}
Category: {category or ""}
Source: {source_name or ""}
Original source image URL: {source_image_url or ""}
Photography direction: {content.photography_direction or ""}
Source summary: {source_summary or ""}
Generated copy excerpt: {(content.content or "")[:1600]}

Visual goal:
Generate a relevant brand poster that supports the content and Neem Journeys'
measured, unhurried, culturally literate brand voice. It should look like a
finished campaign visual an editor could review before publishing.
""".strip()

    @staticmethod
    def _generate_image_bytes(prompt: str, platform: str):

        if not OPENAI_API_KEY:
            raise ValueError("OPENAI_API_KEY is required for image generation.")

        from openai import OpenAI

        client = OpenAI(api_key=OPENAI_API_KEY)
        result = client.images.generate(
            model=OPENAI_IMAGE_MODEL,
            prompt=prompt,
            size=PLATFORM_IMAGE_SIZES.get(platform, "1536x1024"),
            quality="medium",
            n=1,
        )
        encoded_image = result.data[0].b64_json

        if not encoded_image:
            raise ValueError("OpenAI did not return image data.")

        return base64.b64decode(encoded_image)

    @staticmethod
    def _save_image(image_bytes: bytes, content_id: int):

        IMAGE_DIR.mkdir(parents=True, exist_ok=True)
        filename = f"content-{content_id}-{uuid.uuid4().hex}.png"
        path = IMAGE_DIR / filename
        path.write_bytes(image_bytes)

        return f"/media/images/{filename}"
