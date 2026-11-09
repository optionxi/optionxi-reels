# Prompt: build a Remotion explainer reel in this style

Paste this whole file to the LLM, together with `reel-style-spec.json` and `AvatarRig.tsx` (and my own avatar code if I attach it).

---

You are building a vertical (9:16, 1080x1920, 30fps) explainer reel in **Remotion** (React + TypeScript).

## What to follow
- `reel-style-spec.json` is the source of truth for layout, motion, components and scene flow. Read it fully before writing code.
- Keep the **structure and motion language** of the spec exactly: the eyebrow + headline at the top, one hero UI card in the middle, a full-body presenter avatar at the bottom, a wordmark beside the avatar, and a soft pastel gradient background.
- **Replace** everything under `brand` (colors, fonts, wordmark, handle) and `content` with the values I give below. Do not copy the reference's topic, wording or brand.
- The avatar is in `AvatarRig.tsx`. It is already Remotion-ready (pure function of `useCurrentFrame`). Use it as is. If I give you a different avatar, keep its group ids and pivots (`#upper`, `#armL/#foreL`, `#armR/#foreR`, `#fingerL/#fingerR`, `#head`) so the poses keep working.

## The look in one paragraph
Light, airy, warm off-white background with faint lavender and peach blurred blobs. Dark ink headlines in a bold neutral sans, with one or two keywords in a single coral accent colour. A small monospace lowercase eyebrow above the headline (`// step 2 · make the folder`). Under it, a white rounded UI card with a soft shadow showing a believable fake interface (file explorer, chat box, checklist, dark prompt card, dropdown, API-key page, phone mockup). The cursor glides in and clicks, text types, checklist items tick one by one. A flat-vector presenter stands at the bottom and changes pose (idle, talk, point, wave) to match what is being said. Nothing cuts hard. Cards spring in and blur-fade out.

## The flow in one paragraph
Hook with a collage of past work and a dark terminal title, avatar waving. Promise ("I'll show you step by step"). A numbered overview checklist. Then one section per step: a black "Step N · Topic" pill, followed by an animated fake UI that performs that step. Finish with a big tick, a phone mockup showing the result, a "free guide, comment KEYWORD" call to action, and a big centered wordmark with the avatar waving.

## Build rules
1. Deterministic only: `useCurrentFrame`, `useVideoConfig`, `spring`, `interpolate`. No CSS transitions, `setTimeout`, `requestAnimationFrame`, or `Math.random()` (use seeded hashes).
2. Build each entry in `components` once as a reusable component, then compose scenes from them.
3. Persistent layer (background, avatar, wordmark, headline) lives outside the per-scene `<Sequence>`s.
4. Put the script in `data/script.ts` as beats: `{ startFrame, endFrame, eyebrow, words: [{ text, frame, accent? }], hero, pose }`. Generate the avatar `timeline` from the beats.
5. Headlines reveal word by word, synced to the voiceover transcript if I supply one, otherwise 3.5 words per second.
6. English only. Max 8 words per headline.
7. Fake UIs are built from HTML/CSS, not screenshots.
8. Finish by running `npx remotion render` for a test still of 3 frames per scene, view them, and fix overlaps (cards must never cover the avatar's head or the wordmark).

## My project (fill this in)
- Topic / title: …
- Number of steps and what each step is: …
- Brand name (wordmark): …
- Handle: …
- CTA keyword: …
- Accent colour (hex): …
- Background tints (hex, optional): …
- Voiceover file / transcript (optional): …
- Target length: … seconds
- Avatar: use my attached avatar code / use the default `AvatarRig.tsx`

Start by listing the beats you will build (id, time range, headline, hero component, avatar pose), wait for my OK if anything is unclear, then build.