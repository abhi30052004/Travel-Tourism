---
version: alpha
name: Africa Safari Trips
description: A warm, adventure-led travel brand with bold calls to action, earthy surfaces, and playful editorial accents.
colors:
  primary: "#cc4b25"
  secondary: "#e4a435"
  tertiary: "#f0e2c9"
  neutral: "#ffffff"
  surface: "#f7f2ea"
  on-surface: "#3d1f17"
  error: "#b3261e"
  border: "#e5e7eb"
  muted: "#6f5a52"
  dark-surface: "#4a241a"
  accent-ink: "#2f1a13"
typography:
  headline-display:
    fontFamily: Museo Sans
    fontSize: 36px
    fontWeight: 700
    lineHeight: 43px
    letterSpacing: 0px
  headline-lg:
    fontFamily: Museo Sans
    fontSize: 30px
    fontWeight: 700
    lineHeight: 43px
    letterSpacing: 0.225em
  headline-md:
    fontFamily: Museo Sans
    fontSize: 21px
    fontWeight: 400
    lineHeight: 22.5px
    letterSpacing: 0px
  headline-sm:
    fontFamily: Dk Liquid Embrace
    fontSize: 25px
    fontWeight: 400
    lineHeight: 36px
    letterSpacing: 0.06em
  body-lg:
    fontFamily: Museo Sans
    fontSize: 18px
    fontWeight: 400
    lineHeight: 32px
    letterSpacing: 0.07em
  body-md:
    fontFamily: Museo Sans
    fontSize: 16px
    fontWeight: 400
    lineHeight: 28px
    letterSpacing: 0.04em
  body-sm:
    fontFamily: Museo Sans
    fontSize: 14px
    fontWeight: 400
    lineHeight: 24px
    letterSpacing: 0.03em
  label-lg:
    fontFamily: Museo Sans
    fontSize: 14px
    fontWeight: 900
    lineHeight: 1.2
    letterSpacing: 0.04em
  label-md:
    fontFamily: Museo Sans
    fontSize: 12px
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: 0.08em
  label-sm:
    fontFamily: Museo Sans
    fontSize: 11px
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: 0.08em
  eyebrow:
    fontFamily: Museo Sans
    fontSize: 10px
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: 0.12em
rounded:
  none: 0px
  sm: 4px
  md: 8px
  lg: 12px
  xl: 24px
  full: 9999px
spacing:
  xs: 6px
  sm: 16px
  md: 24px
  lg: 32px
  xl: 48px
  gutter: 24px
  section: 64px
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.neutral}"
    typography: "{typography.label-lg}"
    rounded: "{rounded.full}"
    padding: "16px 28px"
    height: "55px"
  button-secondary:
    backgroundColor: "{colors.neutral}"
    textColor: "{colors.secondary}"
    typography: "{typography.label-lg}"
    rounded: "{rounded.full}"
    padding: "16px 28px"
    height: "55px"
  button-link:
    backgroundColor: "transparent"
    textColor: "{colors.primary}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.none}"
    padding: "0px"
  card:
    backgroundColor: "{colors.neutral}"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.md}"
    padding: "16px"
  input:
    backgroundColor: "{colors.neutral}"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.none}"
    height: "40px"
    padding: "0px 12px"
  chip:
    backgroundColor: "{colors.secondary}"
    textColor: "{colors.accent-ink}"
    typography: "{typography.label-md}"
    rounded: "{rounded.full}"
    padding: "6px 12px"
  topbar:
    backgroundColor: "{colors.dark-surface}"
    textColor: "{colors.neutral}"
  hero-panel:
    backgroundColor: "{colors.dark-surface}"
    textColor: "{colors.neutral}"
    rounded: "{rounded.none}"
    padding: "32px"
---

# Africa Safari Trips

## Overview

Africa Safari Trips feels warm, confident, and highly promotional, with a clear emphasis on trust and conversion. The experience balances practical trip-planning with adventurous storytelling, combining earthy neutrals, strong orange accents, and a playful handwritten display style for emphasis. It is designed for travelers who want reassurance, expertise, and an easy path to booking, while still feeling inspired by the destination.

## Colors

- **Primary (#cc4b25):** A saturated burnt-orange used for the main call to action, key highlights, and brand energy. It reads as warm, urgent, and distinctly travel-oriented.
- **Secondary (#e4a435):** A golden safari tone used for supporting emphasis, outlines, and smaller action cues. It adds optimism without competing with the primary accent.
- **Tertiary (#f0e2c9):** A soft sand-beige that supports warm sections and subtle surfaces. It helps bridge the bright accents with the earthier palette.
- **Surface (#f7f2ea):** A pale cream background for content areas, giving the layout a sunlit, airy feeling.
- **On-surface (#3d1f17):** The core text color, a deep cocoa brown that feels richer and softer than pure black. It supports the brand’s natural, grounded tone.
- **Dark-surface (#4a241a):** A dark coffee-brown used for panels and top bars, creating strong contrast while staying within the earthy palette.
- **Muted (#6f5a52):** A subdued brown-gray for secondary text and less prominent UI details.
- **Border (#e5e7eb):** A light neutral border for cards and form fields, keeping UI separation clean and understated.
- **Neutral (#ffffff):** White is used for cards, fields, and primary text-on-accent contrast.
- **Error (#b3261e):** A restrained alert red for validation states, kept separate from the warmer brand orange.

## Typography

The system uses two distinct voices: Museo Sans for almost all interface copy and Dk Liquid Embrace for expressive, decorative moments. Museo Sans carries the functional load with strong weights, clean proportions, and a slightly condensed, travel-poster feel at larger sizes. The decorative script is reserved for inspirational subheads and slogan-like lines, where its hand-drawn texture adds personality.

Headlines are bold and confident, especially the 36px display style and the 30px uppercase-style section headings with generous letter spacing. Body text is sized for readability at 18px and 16px, with comfortable line heights for long-form travel copy. Labels and buttons rely on heavy weights and tighter sizes to create clear hierarchy in booking forms and navigation. Uppercase treatment and expanded letter spacing are common in navigation, field labels, and promotional headings.

## Layout

The layout uses a wide, fixed-max-width presentation with strong horizontal structure and a prominent hero area. Content is layered in panels over photographic backgrounds, with clear right-side conversion modules and centered editorial sections below. Spacing is moderate and consistent, using a rhythm built around 6px, 16px, 24px, 32px, and 48px increments.

Sections breathe through generous vertical padding, but the interface never feels sparse; it stays information-rich and action-oriented. Cards and form surfaces typically use compact internal padding, while large blocks like hero panels and promotional bands rely on broader spacing to establish hierarchy. The overall grid favors clarity and booking efficiency over experimental asymmetry.

## Elevation & Depth

Depth is created mostly through contrast, layering, and subtle shadows rather than heavy surface treatment. White cards float above photography and darker panels, while borders and tonal separation provide definition in form elements. Shadows are present but restrained, used to lift interactive containers without making the interface feel glossy or overly material.

The brand’s hero composition depends on stacking: background image, overlay content, then modal or booking panel. This produces a practical, conversion-led hierarchy that is easy to scan. Flat elements are preferred inside forms, with visual emphasis reserved for primary actions and featured content blocks.

## Shapes

The shape language is rounded but disciplined. Buttons are fully pill-shaped, giving the interface a friendly, approachable feel, while cards and modal surfaces use modest 8px rounding for a cleaner content container. Inputs are mostly square or minimally rounded, which reinforces usability and keeps data entry crisp.

Overall, the system mixes soft friendliness with operational clarity. Rounded pills signal primary actions, while simpler rectangular fields preserve the brand’s practical travel-planning tone.

## Components

Buttons are the most expressive component in the system. `button-primary` is a filled orange pill with bold white text, meant for the main booking action and other high-priority conversion moments. `button-secondary` uses a white fill with golden text and border, suitable for supportive or lower-priority actions. `button-link` should stay minimal and inline, used for legal links, details toggles, and secondary navigation.

Cards, including the core `card` pattern, should remain white with a light border and 8px radius. They should feel informational and trustworthy rather than luxurious or shadow-heavy. For cards over photography, keep text dark brown and avoid decorative treatments that reduce readability.

Inputs should be compact, white, and utilitarian. Use simple rectangular fields with clear borders or tonal dividers, and reserve accent color for icons, labels, or focus states rather than field backgrounds. Booking forms should prioritize legibility and quick scanning over visual flourish.

Chips and badges can use the secondary golden tone to indicate trust signals, ratings, or quick facts. They should stay small, rounded, and bold enough to read at a glance. Navigation items and utility links should use compact uppercase or semi-uppercase styling with clear spacing.

The hero booking panel should use `hero-panel` with the dark-surface color, creating a strong contrast anchor beside the photo. Keep its internal spacing generous enough for stacked fields and a clear CTA. The top utility bar should use `topbar` to preserve the brand’s dark, premium header strip.

## Do's and Don'ts

- Do use warm earth tones and strong orange accents to reinforce the safari/travel identity.
- Do keep primary calls to action pill-shaped, bold, and highly visible.
- Do preserve generous line heights in body copy so long travel descriptions remain easy to read.
- Do keep form fields simple and functional, with minimal rounding and clear borders.
- Don't introduce cool, corporate blues or sterile grays that break the brand warmth.
- Don't overuse shadows, glass effects, or glossy gradients; rely on contrast and layering instead.
- Don't use the decorative script font for long paragraphs or form labels.
- Don't make secondary buttons compete with the primary booking action.