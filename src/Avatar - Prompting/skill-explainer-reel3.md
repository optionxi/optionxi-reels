---
name: explainer-reel-style
description: Editing and design language for a vertical (9:16) "UI-in-motion" explainer reel — light grid canvas, word-by-word kinetic captions with selection-box emphasis, a persistent countdown/progress HUD, a "receipt" value-stack, and one dark-mode contrast beat. Use as a STYLE reference when creating, storyboarding, or editing any short vertical tutorial/explainer video, regardless of topic.
---

# Explainer Reel Style — "Clean UI Motion Tutorial"

A style reference extracted from one 74-second vertical tutorial reel. It is about HOW the video is
designed and edited, not WHAT it says. Swap every piece of content; keep the system.

**Confidence key** — `[M]` measured from the file (frame analysis / audio analysis), `[V]` judged by eye from frames,
`[I]` inferred (not directly verifiable, e.g. audio character). Hex values and font names are `[V]` (closest matches,
not extracted from source files).

---

## 1. One-paragraph summary

A talking-head-free, voiceover-driven explainer built entirely from **motion graphics that look like real software UI**
(app windows, cards, folders, chat boxes, checklists) on a pale graph-paper canvas. Every spoken word appears as a
large centered caption at the top of the frame, one to three words at a time, with key terms wrapped in a
design-tool "selection box." Along the bottom, a persistent **HUD** (avatar + label + dark countdown timer) frames the
whole video as a timed challenge, and a **receipt** above it fills in line by line as each step is taught. One
full-frame **dark-mode flip** in the last third highlights the single most important line. The video ends by
resolving the HUD ("DONE"), crossing out a price, and showing a call-to-action card.

## 2. Technical frame `[M]`

| Property | Value |
|---|---|
| Aspect / resolution | 9:16, 1080 × 1920 |
| Frame rate | 30 fps |
| Duration | ~74 s (reel length; 60 s of "countdown" + ~14 s intro/outro) |
| Audio | Stereo AAC, 48 kHz; integrated loudness ≈ −14 LUFS, true peak ≈ −0.1 dBFS, loudness range ≈ 2 LU (very flat/compressed) |

Safe-zone layout (1920 px tall): captions in the top ~8–12 %, hero UI in the middle ~25–65 %, receipt + HUD in the
bottom ~65–95 %. Nothing important sits in the extreme top/bottom ~5 %.

## 3. Structure / pacing

### 3.1 Narrative skeleton (reusable)
1. **Hook (0–~5 s):** busy, blurred "wall" of previews of the finished outcome (many small cards/phones/UI tiles) as
   backdrop; a single sharp **problem card** pops in front (e.g. a product card with a price + lock icon). Backdrop
   blurs and recedes as a big number ("60 SECONDS") lands in a bold blue display type.
2. **Handoff to HUD (~5 s):** the hero element shrinks/slides into the corner and the persistent HUD + price tag
   appear at the bottom. Countdown starts.
3. **Step sequence (~5–44 s, ~8 steps):** each step = one UI scene in the middle of the screen, built piece by piece
   in sync with the narration. Receipt grows one row per step.
4. **Dark emphasis beat (~44–50 s):** background flips to near-black for the "most important" instruction; the key line
   is shown on a paper note with yellow marker highlight.
5. **Remaining steps (~50–66 s):** back to light canvas; faster, denser micro-demos (phone recording → file drop →
   timeline with captions → chat command → fix).
6. **Payoff (~66–70 s):** HUD flips to "DONE", receipt totals to $0.00, price tag gets struck through ("you paid $0"),
   avatar glows center.
7. **CTA (~70–74 s):** a "comment a keyword" card → typed keyword → "Applied ✓ / unlocked" state → follow card.

### 3.2 Pace numbers `[M]`
- **Hard cuts:** essentially none. Only two real cuts in the whole video — light→dark (~43.6 s) and dark→light (~50.1 s).
  Everything else is in-canvas animation (morphs, slides, blur-ins). Style = "one continuous canvas."
- **Scene (UI vignette) length:** ~2–5 s each; roughly one new idea every 2–3 s.
- **Caption cadence:** ~285 caption changes in 74 s ≈ **3.8 per second**; median gap between changes **0.23 s**, 10th–90th
  percentile 0.13–0.43 s. Matches fast spoken delivery (~3–4 words/sec).
- **Motion energy:** highest in the first 5 s (hook), around the two dark transitions, and the final CTA; lowest (calm
  "reading" stretches) in the 10–35 s middle where UI is being assembled step by step.
- **Audio gaps:** only a handful of ≤0.3 s breaths in the first ~23 s; after that voice is essentially continuous. No
  dead air anywhere.

## 4. Visual design

### 4.1 Backgrounds `[M]/[V]`
- **Light mode (≈90 % of runtime):** near-white `#FDFDFD`–`#FCFCFC` with a **faint light-grey square grid**
  (cells ≈ 90–100 px at 1080 wide, hairline lines), like graph paper or a design-tool canvas. Very subtle — never competes.
- **Dark mode (one beat):** near-black `#101010` with a **sparse dot grid** (dots ≈ 80 px apart, ~8–10 % brightness).
- Hero cards sit on soft **drop shadows** (large blur, low opacity) so they float above the grid.
- Corners/edges stay clean; no vignette, no gradients on the canvas (a soft radial glow appears only behind the
  avatar at the payoff).

### 4.2 Palette `[V]` (approximate)
| Role | Approx. value | Used for |
|---|---|---|
| Canvas | `#FDFDFD` / `#101010` | background light / dark |
| Ink | `#111111`–`#1A1A1A` | primary text |
| Muted ink | `#8A8A8A`–`#9A9A9A` | already-spoken caption words, secondary labels |
| Brand blue | `#2F6FE4`–`#3B76E8` | folders, buttons, big numerals, selection-box outline, avatar ring |
| Pale blue | `#DCE6FB`–`#E4ECFC` | selection-box fill, chips, card headers |
| Warm terracotta / orange | `#D9704F`–`#E0805A` | one brand logo mark; use sparingly as the "source app" color |
| Success green | `#2FA36B`–`#35A874` | "FREE" stamps, status dot, timer digits, "Ready" pill |
| Cream paper | `#FBF8F1`–`#F6F2E8` | receipt / note paper |
| Price-tag yellow | `#FBE9B8` w/ `#E3B24A` border | hanging tag |
| Highlighter yellow | `#FFE14A`–`#FFD84D` | marker highlight on the key sentence |
| Alert red | `#E5484D`-ish | rotated "stamp" label, strike-through, REC badge |

Rule of thumb: **monochrome base + one dominant accent (blue) + tiny, meaningful accents (green = free/done, red =
warning/stamp, yellow = highlight).** No more than 2 accent hues on screen at once.

### 4.3 Composition
- Center-aligned, symmetric hero card (width ≈ 65–80 % of frame) in the middle third.
- Cards are rounded rectangles (radius ≈ 20–28 px), 1 px light border, soft shadow, realistic "app window" chrome
  (traffic-light dots, tabs, sidebar, fake file names).
- Content is deliberately **simplified UI** (real-looking labels, few elements, large hit areas) so it reads on a phone.
- Illustrated avatar: flat black line-art portrait in a circle with a blue ring — a recurring brand "face" instead of
  a real person on camera.
- Layers: (back) blurred preview wall → (mid) active UI card → (front) receipt + HUD, always anchored bottom.

## 5. Typography `[V]`

Closest-match families (use these or equivalents):

| Role | Style | Closest fonts |
|---|---|---|
| Captions & UI labels | Clean geometric/neo-grotesque sans, regular + bold | Manrope, Plus Jakarta Sans, Inter |
| Emphasis words (serif italic) | High-contrast italic serif, slightly condensed | Instrument Serif Italic, Newsreader Italic |
| Receipt / system labels | Monospace, small caps feel, wide tracking | IBM Plex Mono, JetBrains Mono, DM Mono |
| Big numerals & prices | Heavy rounded-geometric sans (ExtraBold) | Manrope ExtraBold / Plus Jakarta 800 |
| Timer digits | Monospace, green on near-black pill | JetBrains Mono / Space Mono |

### 5.1 Caption specification `[M]/[V]`
- **Position:** horizontally centered, vertical center ≈ **y 170–215 px of 1920 (≈ top 9–11 %)**. Never moves.
- **Size:** ≈ 56–64 px x-height-appropriate (cap height ≈ 45 px) — large enough to read at arm's length; single line only.
- **Chunking:** 1–3 words on screen at once; the phrase **builds word by word**, earlier words in the phrase turn
  **muted grey** while the newest word is **full-ink black**.
- **Phrase turnover:** when a phrase ends, the whole line blurs/fades out (≈ 4–6 frames) and the next phrase blurs in —
  no vertical scrolling, no multi-line blocks.
- **Emphasis system (rotate between three, ~1 per phrase on key nouns/verbs):**
  1. **Selection box** — word wrapped in a pale-blue rounded rectangle with 1 px blue border and **small blue corner
     handle dots** (looks like a text layer selected in a design tool). Signature element.
  2. **Bold weight** — plain weight → bold on the key word.
  3. **Serif italic swap** — key word re-set in elegant italic serif (often *inside* a selection box).
- **Dark section variant:** captions invert — muted words light grey, key word white; selection box becomes navy
  fill with lighter-blue outline.
- **Last-phrase hold:** captions linger ~0.2–0.4 s past the final spoken word before fading.

### 5.2 Other text
- **Hero card titles:** bold sans, 40–48 px, left-aligned inside the card.
- **Chips/badges:** small pill, pale fill, 20–24 px bold ("Builds the video", "FREE", "Sent").
- **Big numerals:** huge (≈ 250–300 px), brand blue, tight; a small all-caps tracked sublabel under it.
- **Key sentence on paper note:** very large black bold sans (≈ 60 px) with **yellow marker highlight** behind the
  most important clause; a small blue pill label ("★ MOST IMPORTANT LINE") sits above.

## 6. Persistent HUD system `[V]`

Elements that stay on screen for most of the video and act as the "frame":
1. **Bottom pill card:** rounded white card with soft shadow; thin black **progress bar** across its top; left: green
   status dot + label (e.g. `FREE SETUP`) + small handle in grey mono; right: **dark rounded-square timer** with
   glowing **green mono digits**.
2. **Timer behaviour `[M]`:** real-time countdown from `0:60` to `0:00`, one tick per second, decrementing in sync
   with actual elapsed time (≈ 2 s per 2 s of video). Final state flips to `DONE` in green. Near the dark beat the
   timer dims along with the card.
3. **Avatar bubble:** circular, blue ring, sits left of the pill and **hops** to follow the active element (e.g. rides
   along the download bar, slides to center at the payoff).
4. **Receipt/ticket (value stack):** cream paper slip with jagged torn edge and a mono title, `N items · handle`.
   Lines appear as **numbered rows (01–05)** with dotted leaders and green `FREE` stamps (slightly rotated); small
   tool icons fan in on certain lines. Only the latest ~3 rows are visible, older rows scroll up under the HUD. At the
   payoff it adds `TOTAL $0.00`.
5. **Hanging price tag:** yellow tag on a string, pinned top-right of the receipt, bobbing gently; at the end the price is
   struck through in red and relabelled ("you paid $0").
   - *Generic idea:* the persistent, ironic "anchor price" + running total turns a tutorial into a value story.

## 7. Motion graphics & effects `[V]`

- **Entrances:** cards fade + rise ~20–30 px with a slight scale-up (≈ 95 → 100 %) and ease-out; list rows
  cascade in with ~0.15–0.25 s stagger (sequential build = skeleton rows fill with real content).
- **Exits / scene change:** current card **blurs and fades** (≈ 0.2–0.3 s) while the next card is already scaling in —
  overlap, not sequence. Backdrop "wall" of tiles blur-defocuses and scales slightly.
- **Highlights / pointer:** UI selection states (blue ring on a dropdown, tab pill switching Cloud ⇄ Local), progress
  bars filling (e.g. `1 %` → bar), counters ticking (`0 % → 53 %`), spinners on list rows, check-circle completing.
- **Typing & chat:** an input bar types text char-by-char, a send button pulses, a "Fixing it…" status chip then a
  "Hook bigger" chip appears and the target element visibly changes (proof of result).
- **Micro-demos:** phone mockup recording (REC badge), file icon dropping into folder, timeline with waveform/caption
  blocks/music lane, a "dead-air cut" tag — each ~2–3 s, simplified, no real screen recordings.
- **Stamp animation:** a rotated outlined red label ("NO MANUAL INSTALLS") slams in with a tiny overshoot over the
  list.
- **Counting & numeric motion:** large numbers and percentages animate rather than pop.
- **Text-based drama:** "Got a code?" card with serif-italic word, input focus ring → typed keyword → green check +
  "Applied".
- **No** glitch effects, no film grain, no lens flares, no shake. Polish comes from clean easing and layering.

## 8. Transitions between scenes `[M]/[V]`

| Transition | Where used | Look |
|---|---|---|
| **Blur-through / morph (default)** | Nearly every scene change | Old card blurs+fades while new card scales in; HUD stays locked |
| **Defocus backdrop → sharp hero** | Hook | Wall of tiles goes soft, hero card crisp |
| **Hard background flip** (light → dark) | ~43.6 s | Instant swap, HUD dims, one-beat emphasis |
| **Flip back** (dark → light) | ~50.1 s | Instant swap on a narrated beat |
| **Element handoff** | Hook → HUD | A hero card shrinks into the corner and *becomes* a HUD element |
| **Grow / shrink-to-slot** | Receipt rows, tool icons | Items scale from a slot into their list position |

Principle: **the canvas never "cuts" — objects transform into the next scene's objects.** The only true cuts are the
background-color flips, and they are timed to the most important instruction.

## 9. Zoom, camera and framing `[V]`

- There is **no real camera**. "Camera" movement is simulated by scaling cards/groups (subtle 95 → 100 % push-ins on
  entrance; shrink-and-slide when a card becomes a HUD element).
- No whip pans, no dolly zooms, no digital punch-ins on text. Scale changes are < ~10 % except for the hook number
  and the payoff avatar glow.
- Vertical layout is **fixed**: nothing slides off-screen sideways; scenes swap in place.

## 10. Audio & sound design `[M]` + `[I]`

Measured:
- Mastered **hot and flat**: ≈ −14 LUFS integrated, LRA ≈ 2 LU, peak ≈ −0.1 dBFS (typical social-video loudness).
- Speech-band (≈ 0.5–4 kHz) energy dominates; there is a persistent low-band bed (≈ 10–30 % energy below 500 Hz /
  below 150 Hz) throughout — consistent with a **soft music bed under continuous voiceover**.
- Voice is nearly continuous after ~23 s (no dead air).

Inferred (not directly heard — verify by ear when reusing):
- Voice-over is the only narrative layer; text on screen is an exact word-for-word transcript of it.
- Light UI-click/pop/whoosh effects likely accompany card entrances and tab switches; keep them quiet, short (< 0.3 s),
  and aligned to the animation frame where the element lands.
- The countdown timer would be best reinforced with a subtle tick or none — avoid anything that fights the voice.

**Sync rules to copy:** caption word appears on (or a frame before) the spoken word; UI element lands on the frame its
noun is spoken; the dark flip lands on the first word of the emphasized sentence; the final "DONE" lands on the final
payoff word.

## 11. Rules to reuse this style on any topic

**Do**
- Run the voiceover first; build captions from word timestamps; build scenes to the narration beats.
- Use one UI-metaphor per beat (window, list, folder, chat, timeline, form, receipt).
- Keep the HUD + receipt + price-tag trio (or a swap-in: progress bar + running checklist + anchor stat).
- Reserve dark mode for exactly one moment of maximum importance.
- Keep palette to neutral + one accent + tiny semantic colors.
- Hold each scene for 2–5 s; stagger-in items in the order they are spoken.
- End with a state change (timer → DONE, price → crossed out) before the CTA.

**Don't**
- Don't use hard cuts between content scenes, jump cuts on a talking head, or stock footage.
- Don't show more than ~3 words of caption at once or more than one caption line.
- Don't add third accent colors, gradients on the canvas, shaky cameras, or decorative particles.
- Don't let UI text be smaller than ~20 px at 1080 wide — it must read on a phone.

## 12. Machine-readable tokens (paste into a prompt/spec)

```json
{
  "format": { "aspect": "9:16", "size": [1080, 1920], "fps": 30, "duration_s": 74 },
  "pacing": {
    "hard_cuts": 2,
    "scene_len_s": [2, 5],
    "caption_changes_per_s": 3.8,
    "caption_gap_median_s": 0.23,
    "transition_default": "blur-through morph, 0.2-0.3s overlap"
  },
  "backgrounds": {
    "light": { "color": "#FDFDFD", "pattern": "square grid hairline, ~95px, very faint" },
    "dark":  { "color": "#101010", "pattern": "dot grid ~80px, ~8% brightness", "use": "one emphasis beat only" }
  },
  "palette": {
    "ink": "#111111", "muted": "#8E8E8E", "blue": "#2F6FE4", "blue_pale": "#DDE7FB",
    "green": "#2FA36B", "orange_brand": "#DA7352", "paper": "#FAF7EF",
    "tag_yellow": "#FBE9B8", "highlighter": "#FFE14A", "red": "#E5484D"
  },
  "type": {
    "caption": "Manrope/Inter 600-700, ~60px, centered, y~190",
    "emphasis_serif": "Instrument Serif Italic",
    "mono": "IBM Plex Mono / JetBrains Mono",
    "numerals": "Manrope ExtraBold"
  },
  "caption": {
    "words_on_screen": [1, 3],
    "newest_word": "ink", "older_words": "muted",
    "emphasis_modes": ["selection-box with corner handles", "bold", "serif-italic"],
    "phrase_out": "blur + fade 4-6 frames",
    "dark_variant": "light-grey/white text, navy selection box"
  },
  "hud": {
    "elements": ["avatar circle (blue ring)", "bottom pill with progress bar", "dark mono countdown timer (green digits)",
                 "cream receipt with numbered rows + FREE stamps", "hanging price tag (struck through at end)"],
    "timer": "real-time countdown, 1 tick/s, ends on DONE"
  },
  "motion": {
    "entrance": "fade + rise 20-30px + scale 95->100%, ease-out",
    "list_stagger_s": [0.15, 0.25],
    "stamps": "rotated outlined label, slam with small overshoot",
    "camera": "none; simulated by card scaling only"
  },
  "audio": {
    "loudness_lufs": -14, "true_peak_dbfs": -0.1, "lra_lu": 2,
    "layers": ["continuous voiceover", "low music bed (inferred)", "light UI sfx (inferred)"]
  },
  "structure": ["hook wall + problem card", "handoff to HUD", "step scenes with receipt build",
                "dark emphasis beat", "fast micro-demos", "payoff (DONE, $0, strike price)", "comment-keyword CTA"]
}
```

## 13. How to use this file
- **Creating a new video:** give me this file plus your script/topic and say which sections to follow (e.g. "follow
  sections 3–8, change the palette accent to green, no dark beat").
- **Editing existing footage/graphics:** ask me to restyle captions per §5.1 or add the HUD per §6.
- **Remotion / HTML-to-video builds:** §12 tokens map directly to CSS variables and animation constants; keep durations
  in frames at 30 fps (e.g. caption fade ≈ 4–6 frames, card entrance ≈ 8–12 frames, stagger ≈ 5–8 frames).