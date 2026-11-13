---
name: soft-ui-explainer-reel-style
description: Style spec for a 9:16 kinetic-caption product-explainer reel ("Claude Code Reel 1" look): warm off-white canvas, floating soft-3D UI cards, word-by-word captions with a sans + italic-serif accent, one idea per beat. Use when asked to make a vertical explainer/promo reel, or to match this reference.
---

# Soft-UI Explainer Reel: Style Reference

Derived from a 53.7 s, 1080x1920, 60 fps vertical reel (VP9 + AAC) that explains a developer tool (a Claude "YouTube Agent" skill) to a creator audience. The reel is about 54 caption beats, so it cuts roughly once per second. Narration is a voiceover and everything on screen is timed to it.

Values marked `~` are estimated from frames. They are not read from source files.

## 1. The look in one paragraph
A calm, premium, almost-Apple-ish motion-graphics piece. The background is a warm off-white with faint peach and blush glows in the corners. A bold two-line caption sits in the top ~20% of the frame. Below it, ONE hero object (a floating, soft-shadowed UI card or 3D icon) illustrates the sentence being spoken. There is no clutter and no footage. Everything is a faux-UI "product shot" built from rounded cards, pills, chips and tiny icons. Accent color is used sparingly: one key word per caption gets color or italic serif.

## 2. Spec (JSON)

```json
{
  "format": {
    "aspect": "9:16",
    "resolution": [1080, 1920],
    "fps": 60,
    "duration_s": "~50-60 for a full explainer",
    "audio": "continuous voiceover, mean ~-17 dB, peaks ~-1 dB; no visible music or SFX cues; captions are the only text layer carrying the script"
  },

  "canvas": {
    "background": "#F7F5F6 base (warm off-white, never pure white)",
    "glows": "very soft blurred radial washes in blush/peach (#F4E7DF, #F5EFEE) drifting in the corners/edges; they shift slightly between beats",
    "vignette": "none; depth comes from card shadows, not darkening",
    "safe_areas": {
      "caption_zone": "top ~8-22% of height, centered",
      "hero_zone": "center ~30-75% of height",
      "bottom": "~20% kept mostly empty (platform UI safe area)"
    }
  },

  "palette": {
    "ink": "#1C1A1F (headline text, dark chips, code pills)",
    "accent_serif_rust": "~#B2563B (italic serif accent words)",
    "accent_blue": "~#2F6A8C steel/teal blue (accent words, primary buttons, waveform blocks, 'Tests' chips)",
    "accent_coral": "~#E8765A (secondary chip, FREE/skill-count badges, orange thumbnails)",
    "brand_red": "~#D6211F to #E84B41 (YouTube red, 'Hook' chip, virality icon)",
    "mascot_orange": "~#F2562B (pixel-creature app icon)",
    "bitcoin_orange": "~#F0A030",
    "neutral_grey_label": "~#9A9A9E (tiny uppercase labels)",
    "card_white": "#FFFFFF at ~95-100%, with grey-blue gradient headers on 'channel' cards",
    "rule": "neutral surfaces + ink do 90% of the work; ONE saturated accent per beat"
  },

  "typography": {
    "caption_sans": {
      "family": "geometric/grotesk sans, similar to Inter Tight / Plus Jakarta Sans / Manrope",
      "weight": "700-800",
      "size_px": "~90-100 on a 1080 canvas",
      "tracking": "tight (about -2%)",
      "color": "#1C1A1F",
      "align": "center, 1-2 lines, max ~3-4 words per line"
    },
    "caption_accent_serif": {
      "family": "high-contrast italic serif, similar to Instrument Serif / Playfair Display Italic / Newsreader Italic",
      "weight": "400-500 italic",
      "size": "same cap-height as sans or slightly larger",
      "color": "rust #B2563B or the blue accent",
      "usage": "exactly 1 word per caption block (e.g. 'Bitcoin', 'easier', 'build', 'comment', 'week', 'watching', 'craziest', 'voice', 'toolkit', 'worked')"
    },
    "caption_accent_sans_color": {
      "usage": "alternate with the serif accent: a SANS word recolored in blue or red (e.g. 'YouTube', 'Claude', 'titles', 'videos', 'virality skill.'), sometimes on a faint tinted highlight pill behind the word"
    },
    "ui_text": "same sans family, 500-600 weight, ~24-34 px inside cards",
    "mono": "monospace (JetBrains Mono / SF Mono style) for slash-commands (/yt-script), view counts, code pills, tiny uppercase field labels (HOOK, SCRIPT, TITLE, STRUCTURE, EDIT LIST)",
    "microcopy": "tiny grey uppercase mono labels (~14-18 px, wide tracking) inside cards"
  },

  "caption_behavior": {
    "unit": "one clause per beat, about 3-8 words, split into 2 lines",
    "reveal": "word-by-word, one word every ~0.2-0.35 s, synced to the voiceover. Each word fades + rises ~10-20 px with a slight blur-to-sharp.",
    "line_layout": "lines are center-aligned and re-center as words arrive, so earlier words may nudge sideways",
    "hold": "the full line holds ~0.3-0.6 s",
    "exit": "no hard cut. The old caption block blurs and fades while the NEXT block's first word is already fading in over it (overlap ~0.15-0.25 s). The result is a brief ghosted double-text moment.",
    "sentence_continuation": "a sentence is split across many blocks ('Building your YouTube channel now' / 'is like buying Bitcoin' / 'in 2010 -') and each block starts mid-sentence. Trailing dash or comma shows continuation.",
    "emphasis_pattern": "every block carries ONE colored/serif-italic key word on the semantically important noun or verb",
    "punctuation": "kept (commas, periods, em dashes) so captions read like a script",
    "no_karaoke_bar": "no progress highlight or box behind every word; only select key words get a tinted pill"
  },

  "hero_objects": {
    "style": "soft-3D / neumorphic-glass UI: white rounded rectangles (radius ~28-40 px) with a thin top highlight, a large soft drop shadow (blur ~40-60 px, y-offset ~20-30, ~8-12% ink) and a tight contact shadow beneath",
    "types": [
      "channel card (grey-blue gradient header, round avatar, name line, red 'Create channel' button, 3 empty tile placeholders)",
      "glossy 3D icons: YouTube play button, gold bitcoin coin, rounded-square app icon with the pixel-creature mascot, red trending-arrow tile",
      "command cards (/yt-script, /yt-package, /yt-edit, /yt-plan, /yt-comment) with a header row: small blue icon tile + mono command name + status pill (Draft, 12:48, Fits your 6 hrs)",
      "mini-widgets: thumbnail 16:9 cards with flat illustrated person + coffee cup; waveform clip blocks; weekly calendar strip with icon chips; comment thread with Question pill and Edit/Review buttons; chips row (Hook / Tests / Twist / Verdict)",
      "badges: tilted 'FREE', '11 skills', '21 hook formulas' tags that slap onto a card (rotated ~8-12 degrees, saturated fill, heavy shadow)",
      "small label pills like 'Illustrative example · Brew Lab' above mock content"
    ],
    "consistency": "same corner radii, same shadow recipe, same icon-tile language across all cards. Icons sit in 56-72 px rounded tiles, blue for tools/commands, orange/coral for idea or hook, red for upload/viral.",
    "content_rule": "mock UI contains plausible, specific text (e.g. '$90 vs $900', 'Grinder settings, explained', '412K views'). It is never lorem ipsum."
  },

  "motion": {
    "feel": "smooth, springy, slightly overshooting; objects feel physical and weighty (drop-in with shadow growth)",
    "easing": "ease-out-back / spring (stiffness medium, light overshoot ~4-8%) for entrances; ease-in-out for repositioning",
    "entrances": [
      "card rises from ~40 px below + scale 0.92 to 1.0 with fade, shadow expands",
      "icon pops (scale 0.6 to 1.05 to 1.0)",
      "badge slaps in with rotation and overshoot",
      "items cascade in with ~60-100 ms stagger (e.g. grid of 11 skill chips, 6 thumbnails)"
    ],
    "exits": "hero object swaps by a quick blur + fade + slight scale-down while the next one enters (~0.25-0.4 s). Often the object MORPHS or re-uses the same card (channel card stays while YouTube logo swaps to bitcoin, then back).",
    "persistent_anchor": "one element (the channel card, mascot tile) persists across several beats and shrinks/moves down to become a secondary element, giving visual continuity.",
    "ambient": "tiny sparkles/4-point stars, soft pulse rings (thin coral circle that expands and fades around the icon), faint particle dots, slow drifting background glow",
    "ui_simulation": "typed text with a blinking caret, a mouse cursor that glides to a button and 'clicks' (button presses, then state changes), selection boxes with corner handles appearing around a thumbnail, a cursor that moves over the item being named",
    "camera": "none; flat, front-on layout; at most subtle scale push (1.00 to 1.04) on the hero over a beat",
    "layout_transitions": "items reorganize with smooth FLIP-style movement (e.g. icons fan out into a radial orbit around the mascot, then collapse into a single column/stack)"
  },

  "pacing": {
    "cut_rate": "a new caption block about every 0.8-1.1 s; hero visual changes every ~2-4 s, often mid-sentence",
    "rhythm": "caption words drive the clock. Visuals are keyed to the keyword (when 'Bitcoin' is said the coin pops; when 'eleven' is said the 11-skill grid builds; when 'FREE' is said the badge slaps).",
    "no_dead_air": "something is always moving: typing, drifting glow, cursor, stagger; stills never exceed ~0.5 s",
    "speed_ramps": "none. Time is constant; 'speed' comes from the word cadence and staggered entrances.",
    "scene_structure": "see narrative_arc below"
  },

  "narrative_arc": [
    {"t": "0-8 s", "beat": "HOOK / analogy", "pattern": "'Building your YouTube channel now is like buying Bitcoin in 2010, and it's easier than ever to get started.' Uses a familiar icon swap (YT logo to coin) on top of the same channel card."},
    {"t": "8-17 s", "beat": "REVEAL the product", "pattern": "'Because Claude can now plan and build your entire channel. It's called YouTube Agent Skill.' Mascot icon + pulse ring; Plan / Build chips orbit; install card with a mono command pill."},
    {"t": "17-23 s", "beat": "VALUE STAMP", "pattern": "'It's free, and it brings eleven specialized skills into Claude.' FREE badge slap, then the 11-chip grid."},
    {"t": "23-45 s", "beat": "FEATURE TOUR", "pattern": "'One does X. One does Y. Another does Z. And one plans...' Repeated anaphora ('One... / Another... / And one...'). Each feature = one command card with a mini-demo (typing, thumbnail, waveform, comment reply, weekly plan, next video/hook/retention timeline)."},
    {"t": "45-50 s", "beat": "STAR FEATURE", "pattern": "'But the craziest is the virality skill.' Big glossy red icon + pulse ring, then a worked example (grid of competitor thumbnails with views, median line, then extracting title / hook / structure chips)."},
    {"t": "50-55 s", "beat": "OUTCOME + CTA", "pattern": "'...create video ideas in your voice, for your audience. From your next idea to your next upload, that's a lot of work you'd have to figure out alone. Comment YOUTUBE and I'll send you the toolkit.' Orbit of 6 workflow icons around mascot, then a comment-box UI with the keyword typed in and a 'Skill, 11 skills, free' folder card below."}
  ],

  "rhetoric": {
    "voice": "casual, confident, second person ('your channel', 'your voice')",
    "devices": ["analogy hook", "anaphora ('One... One... Another... And one...')", "number-led specificity ('eleven', 'twenty-one')", "worked example with realistic data", "single CTA via a comment keyword"],
    "numbers": "numbers are spelled out in the captions ('eleven', 'twenty-one') while the badge shows the digits (11, 21)"
  },

  "do": [
    "Keep one hero object per beat and make it match the spoken noun",
    "Use exactly one accent word per caption (italic serif OR colored sans)",
    "Reuse the same card recipe so it looks like one UI system",
    "Overlap caption exit with the next caption entry; blur-fade, never hard cut",
    "Write specific, believable mock content",
    "Let a persistent element carry continuity between beats"
  ],
  "dont": [
    "No stock footage, no photos, no talking head",
    "No pure white or pure black backgrounds, no hard drop shadows",
    "No more than 2 accent colors in a single frame (besides brand-colored icons)",
    "No long paragraphs of caption text (max ~8 words per block)",
    "No fast spins/glitches/zoom punches; motion stays smooth and weighty"
  ]
}
```

## 3. How to use this skill
When asked to produce a reel "in this style":
1. Write the script as short clauses of 3-8 words (use an analogy hook, anaphora feature tour, a worked example, and a one-keyword CTA).
2. For each clause, pick ONE hero object that visualizes the key noun. Build it from the card system above.
3. Mark one accent word per clause (alternate serif-italic rust, blue sans, and a tinted pill for variety).
4. Time captions word by word to the voiceover and overlap exits and entrances.

## 4. Caveats
- Exact font names, hex values and timings are visual estimates, not extracted from source files. Treat them as "close enough" and confirm against the video when fidelity matters.
- The video has no on-screen music or SFX data that I could analyze beyond overall loudness; audio mood is not described here.
