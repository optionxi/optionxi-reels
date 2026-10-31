# OptionXi Reel

Instagram Reels for promoting the [OptionXi](https://optionxi.com) app, built with [Remotion](https://www.remotion.dev/) (React + TypeScript). Every video is code, so it can be tweaked, re-rendered and shared like any other project.

<!-- Add a preview GIF here -->
<!-- ![Preview](./assets/preview.gif) -->

## Videos

| Composition | Topic | Source | Watch |
|---|---|---|---|
| `OptionXiReel-Intro` | Practice trading feature | [`src/Reel-Intro.tsx`](./src/Reel-Intro.tsx) | _Instagram link_ |
| `OptionXiReel-Screeners` | Stock screeners (AI picks, ready-made, custom) | [`src/Reel-Screeners.tsx`](./src/Reel-Screeners.tsx) | _Instagram link_ |

Final renders are attached to [GitHub Releases](../../releases), not committed to git.

## Tech stack

- [Remotion](https://www.remotion.dev/) 4 for rendering video from React
- React 18 + TypeScript
- `@remotion/google-fonts` for fonts
- GSAP-style timing and Framer Motion-style animation, written with Remotion's `interpolate` / `spring`
- Format: Instagram Reel, 9:16 (1080 x 1920), with safe-space margins for the Instagram UI

## Project structure

```
optionxi-reel/
├── public/                  # Static assets: logo, phone screenshots, audio
├── src/
│   ├── index.ts             # Remotion entry point
│   ├── Root.tsx             # Registers all compositions
│   ├── Reel-Intro.tsx       # Practice trading reel
│   └── Reel-Screeners.tsx   # Screeners reel
├── out/                     # Rendered videos (git-ignored)
├── safe-screen/
│   └── instagram-reels-safe-zone.png   # Overlay to check safe areas in Premiere
├── remotion.config.ts
├── package.json
└── tsconfig.json
```

## Getting started

```bash
git clone https://github.com/<your-username>/optionxi-reel.git
cd optionxi-reel
npm install
npm run dev        # opens Remotion Studio with live preview
```

## Rendering

```bash
# Render a specific composition
npx remotion render src/index.ts OptionXiReel-Intro out/OptionXiReel-Intro.mp4
npx remotion render src/index.ts OptionXiReel-Screeners out/OptionXiReel-Screeners.mp4

# Smaller file for sharing (higher CRF = smaller file)
npx remotion render src/index.ts OptionXiReel-Intro out/intro-small.mp4 --crf=28

# Export a single frame (thumbnail / check layout)
npx remotion still src/index.ts OptionXiReel-Intro out/frame.png --frame=300

# Type check
npm run typecheck
```

> The composition IDs above must match the `id` values registered in `src/Root.tsx`.

## How these videos are made

The whole pipeline, from idea to Instagram:

```
Screenplay -> Accept -> Remotion video -> Tweak -> Render -> Script from video -> ElevenLabs -> Premiere mix + safe-zone check -> Auto-caption -> Edits app / Instagram
```

1. **Screenplay.** Give the AI the product context (GitHub repo + website) and ask it to plan the screenplay first. Review it and confirm before any code is written.
2. **Accept the screenplay.** Only once it looks right, move on to building.
3. **Create the video in Remotion.** Generate the compositions with phone mockups, short text and Instagram safe-space margins.
4. **Tweak.** Preview in Remotion Studio (`npm run dev`) and ask the AI for changes: timing, text, layout, animations.
5. **Render the video** to `out/*.mp4`.
6. **Generate the voiceover script from the finished video.** Give the Remotion video (or its source) to the AI and ask for a script that matches the on-screen timing, ready to paste into ElevenLabs.
7. **Generate the audio** in [ElevenLabs](https://elevenlabs.io) from that script.
8. **Mix in Premiere Pro** (or any editor): the render plus the ElevenLabs voiceover. Then run the [safe-zone check](#instagram-safe-zone-check) before exporting.
9. **Caption** the mixed video with [auto-caption.app](https://auto-caption.app/). Do this after the mix so the captions are generated from the final voiceover.
10. **Post.** Either finish in a mobile editing app (Instagram Edits: music, trims) and then post, or upload straight to Instagram.

## Instagram safe-zone check

Instagram covers parts of a Reel with its own UI (username and caption at the bottom, buttons on the right, header at the top). Anything important placed there gets hidden.

[`safe-screen/instagram-reels-safe-zone.png`](./safe-screen/instagram-reels-safe-zone.png) is a 9:16 overlay that shows these areas. Use it in Premiere to confirm nothing important is covered:

1. Import the PNG into your Premiere project.
2. Place it on the **top video track** above the whole timeline, stretched to the full sequence length.
3. Scrub through the video and check that logos, text, phone mockups and captions stay inside the safe area.
4. If anything is covered, fix it in Remotion (or move the captions), then re-render.
5. **Disable or delete the overlay track before exporting.** Otherwise it gets burned into the final video.

Tip: keep captions inside the safe area too. auto-caption.app lets you adjust caption position, so move them up if they sit under Instagram's caption area.

## Prompts used

Reuse these as starting points for new videos.

### 1. Initial prompt

```text
create a screen play for posting on social media, instagram size, with html and play,
to promote the optionxi app on playstore, about the practice trading feature

https://github.com/optionxi/optionxi-flutter-community, and optionxi.com to get context,
after generating the screenplay, generate the html, before that confirm
```

### 2. Improve the design

```text
add remotion, modern, give more time to optionxi, add phone mockups, more text
use safe space for insta reels
```

### 3. Generate the voiceover script (after the video is rendered)

```text
find the timing, add script, so i can paste to eleven labs, to generate audio
```

### 4. Skills / libraries to mention

```text
GSAP
Framer motion
```

### 5. Full example prompt (Screeners reel)

```text
use remotion, instagram, with safe space, framer, create a video for explaining the tool,
in option Xi https://github.com/optionxi/optionxi-flutter-community

add phone mockups, phone screenshots, i can add later

the tool is, screeners, finding
1- AI picked stocks, which multiple screeners have filtered
2- Screeners - where there are volume, high break screeners, to find the stocks
3- custom screeners, where you can create your own filters, to find the specific
   stocks, like 4ema > 20ema, like that

everything in less words, layman terms, less cultured,
create a screen play for posting on social media

use playstore, 4.2 rating, 10k installs
https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png

logo icon https://optionxi.com/assets/images/logo_xi.png
first plan the screenplay, then output the remotion,

use skills GSAP for timing.
```

## Tips

- **Plan first, code second.** Always ask for the screenplay and confirm it before generating Remotion code.
- **Keep text short** and in simple words. Reels are watched on mute half the time.
- **Safe space.** Keep key text and logos away from the top, bottom and right edges where Instagram overlays its UI. Verify with the overlay in `safe-screen/`.
- **Captions last.** Generate captions only after the final mix, and keep them inside the safe area.
- **Phone mockups.** Drop screenshots into `public/` and reference them with `staticFile()`.
- **Pin package versions.** Remotion packages must all be on the same version (currently `4.0.539`).
- **Don't commit renders.** `out/` is git-ignored. Attach final videos to a GitHub Release instead.

## Download the videos

Rendered videos live under [Releases](../../releases). Each video has its own tag, for example `v001-intro`.

## License

MIT. Feel free to fork, learn from the code, and make your own reels.

---

Made for [OptionXi](https://optionxi.com): open-source analytics and virtual trading.