import React from "react";
import {
  AbsoluteFill,
  Audio,
  Easing,
  Freeze,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {loadFont as loadSans} from "@remotion/google-fonts/InterTight";
import {loadFont as loadSerif} from "@remotion/google-fonts/InstrumentSerif";
import {loadFont as loadMono} from "@remotion/google-fonts/JetBrainsMono";

/* ============================================================================
   OptionXi: "Built with AI. Now open source."  (1080x1920, 30 fps)
   REDESIGN v2: dark neon canvas, kinetic captions, tilted floating cards,
   confetti bursts, and an original mascot ("Pip", v3: cream bot + visor face + orange scarf and
   cape) that hops across the screen on a keyframed PATH, reacts with moods
   (smile / wow / focus / cheer / worry / love) and moves with arm swing,
   foot steps and a flowing cape.

   Audio timing, captions (CAP_SRC) and scene cuts are unchanged from v1.
   Edit Pip's route in PATH, his expressions in MOODS.
   ============================================================================ */

export const LOOP_AT = 1000;
export const config = {
  durationInFrames: LOOP_AT + 20,
  fps: 30,
  width: 1080,
  height: 1920,
};

/* ---------- safe area ---------- */
export const DEBUG_SAFE = false;
export const SAFE_PORTRAIT = {top: 250, bottom: 340, side: 60};
export const SAFE_LANDSCAPE = {top: 54, bottom: 54, side: 96};

export const getSafe = ({width, height}: {width: number; height: number}) => {
  const s = height > width ? SAFE_PORTRAIT : SAFE_LANDSCAPE;
  return {
    ...s,
    left: s.side,
    right: width - s.side,
    y0: s.top,
    y1: height - s.bottom,
    w: width - s.side * 2,
    h: height - s.top - s.bottom,
  };
};
const SAFE = getSafe(config);

const SafeGuide: React.FC = () => {
  if (!DEBUG_SAFE) return null;
  return (
    <AbsoluteFill style={{pointerEvents: "none", zIndex: 999}}>
      <div style={{position: "absolute", left: SAFE.left, top: SAFE.y0, width: SAFE.w, height: SAFE.h, border: "3px dashed rgba(255,0,120,.85)"}} />
    </AbsoluteFill>
  );
};

/* ---------- content constants ---------- */
const REPO_WEB = "optionxi-webapp-community";
const REPO_APP = "optionxi-flutter-community";
const STARS = {web: 120, app: 80}; // TODO: set the real star counts
const EXIT = 8;
const LEAD = 2;

/* ---------- layout ---------- */
const CAP_TOP = SAFE.y0;
const CAP_H = 250;
const TAG_TOP = CAP_TOP + CAP_H + 30;
const HERO_TOP = TAG_TOP + 100; // 630
const HERO_H = SAFE.y1 - HERO_TOP; // 950

/* ---------- tokens ---------- */
const C = {
  bg: "#050810",
  ink: "#17151C",
  white: "#FFFFFF",
  lime: "#C6FF3D",
  coral: "#FF6B4A",
  coralHi: "#FF9A76",
  blue: "#4D7CFF",
  sky: "#7DB8FF",
  violet: "#9B6BFF",
  grey: "#8E8C96",
  green: "#2BC48A",
  red: "#F2535A",
  soft: "#F1EFF4",
  tint: "#E8EEFF",
};
const SHADOW = "0 30px 70px rgba(0,0,0,.45), 0 8px 18px rgba(0,0,0,.3)";
const SHADOW_BIG = "0 40px 90px rgba(0,0,0,.55), 0 12px 28px rgba(0,0,0,.35)";

const sans = loadSans("normal", {weights: ["500", "600", "700", "800"], subsets: ["latin", "latin-ext"]}).fontFamily;
const serif = loadSerif("italic", {weights: ["400"], subsets: ["latin", "latin-ext"]}).fontFamily;
const mono = loadMono("normal", {weights: ["500"], subsets: ["latin", "latin-ext"]}).fontFamily;

const clamp = {extrapolateLeft: "clamp", extrapolateRight: "clamp"} as const;
const easeOut = Easing.out(Easing.cubic);

/* ---------- motion helpers ---------- */
const useEnter = (delay = 0) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  return spring({frame: f - delay, fps, config: {damping: 10, stiffness: 130, mass: 0.8}});
};

// Positioned, floating, tilted entrance. x/y are zone coordinates (960 x 950).
const At: React.FC<{
  x: number;
  y: number;
  rot?: number;
  delay?: number;
  dx?: number;
  dy?: number;
  amp?: number;
  phase?: number;
  z?: number;
  children: React.ReactNode;
}> = ({x, y, rot = 0, delay = 0, dx = 0, dy = 90, amp = 8, phase = 0, z = 1, children}) => {
  const f = useCurrentFrame();
  const p = useEnter(delay);
  const bob = Math.sin((f + phase) / 22) * amp;
  const wob = Math.sin((f + phase) / 31) * 1.2;
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        zIndex: z,
        opacity: Math.min(1, p * 2.5),
        transform: `translate(${(1 - p) * dx}px, ${(1 - p) * dy + bob}px) rotate(${rot + wob + (1 - p) * (dx >= 0 ? 10 : -10)}deg) scale(${0.8 + 0.2 * p})`,
      }}
    >
      {children}
    </div>
  );
};

const Pop: React.FC<{delay?: number; x?: number; y?: number; style?: React.CSSProperties; children: React.ReactNode}> = ({
  delay = 0,
  x = 0,
  y = 44,
  style,
  children,
}) => {
  const p = useEnter(delay);
  return (
    <div style={{opacity: Math.min(1, p * 2.2), transform: `translate(${(1 - p) * x}px, ${(1 - p) * y}px) scale(${0.9 + 0.1 * p})`, ...style}}>
      {children}
    </div>
  );
};

const count = (f: number, start: number, dur: number, to: number) =>
  Math.round(interpolate(f, [start, start + dur], [0, to], {...clamp, easing: easeOut}));

const typeText = (s: string, f: number, start: number, perChar: number) =>
  s.slice(0, Math.max(0, Math.floor((f - start) / perChar)));

/* confetti burst, scene-local frames, positioned in zone coordinates */
const BURST_COLORS = [C.lime, C.coral, C.sky, C.violet, "#fff"];
const Burst: React.FC<{delay: number; x: number; y: number; n?: number}> = ({delay, x, y, n = 18}) => {
  const f = useCurrentFrame();
  const t = f - delay;
  if (t < 0 || t > 30) return null;
  const e = easeOut(Math.min(1, t / 24));
  return (
    <div style={{position: "absolute", left: x, top: y, zIndex: 30, pointerEvents: "none"}}>
      {Array.from({length: n}).map((_, i) => {
        const a = (i / n) * Math.PI * 2 + (i % 2) * 0.25;
        const d = (70 + (i % 3) * 55) * e;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              width: i % 3 === 0 ? 16 : 10,
              height: i % 3 === 0 ? 16 : 22,
              borderRadius: i % 3 === 0 ? 8 : 3,
              background: BURST_COLORS[i % BURST_COLORS.length],
              opacity: 1 - t / 30,
              transform: `translate(${Math.cos(a) * d}px, ${Math.sin(a) * d + t * 1.6}px) rotate(${i * 40 + t * 18}deg)`,
            }}
          />
        );
      })}
    </div>
  );
};

/* ---------- UI atoms ---------- */
const Card: React.FC<{style?: React.CSSProperties; children?: React.ReactNode}> = ({style, children}) => (
  <div style={{background: "#fff", borderRadius: 36, boxShadow: SHADOW, boxSizing: "border-box", ...style}}>{children}</div>
);

const Tile: React.FC<{bg: string; size?: number; children?: React.ReactNode}> = ({bg, size = 64, children}) => (
  <div style={{width: size, height: size, borderRadius: size * 0.3, background: bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0}}>
    {children}
  </div>
);

const Mono: React.FC<{size?: number; color?: string; children: React.ReactNode}> = ({size = 18, color = C.grey, children}) => (
  <span style={{fontFamily: mono, fontSize: size, letterSpacing: ".1em", textTransform: "uppercase", color}}>{children}</span>
);

const Pill: React.FC<{bg: string; color: string; size?: number; children: React.ReactNode}> = ({bg, color, size = 22, children}) => (
  <span
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: size * 0.35,
      padding: `${size * 0.32}px ${size * 0.8}px`,
      borderRadius: 999,
      background: bg,
      color,
      fontFamily: sans,
      fontWeight: 700,
      fontSize: size,
      whiteSpace: "nowrap",
    }}
  >
    {children}
  </span>
);

const StarIcon: React.FC<{s?: number; c?: string}> = ({s = 22, c = C.ink}) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill={c}>
    <polygon points="12,2 15.1,8.6 22.3,9.5 17,14.5 18.4,21.7 12,18.2 5.6,21.7 7,14.5 1.7,9.5 8.9,8.6" />
  </svg>
);
const ForkIcon: React.FC<{s?: number; c?: string}> = ({s = 22, c = C.ink}) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={2} strokeLinecap="round">
    <circle cx="6" cy="5" r="2.5" />
    <circle cx="18" cy="5" r="2.5" />
    <circle cx="12" cy="19" r="2.5" />
    <path d="M6 7.5v2a3 3 0 0 0 3 3h6a3 3 0 0 0 3-3v-2M12 12.5v4" />
  </svg>
);
const CheckIcon: React.FC<{s?: number; c?: string}> = ({s = 30, c = "#fff"}) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12.5l4.5 4.5L19 7.5" />
  </svg>
);
const UpIcon: React.FC<{s?: number; c?: string}> = ({s = 18, c = C.green}) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill={c}>
    <path d="M12 4l9 15H3z" />
  </svg>
);

const Caret: React.FC<{h?: number}> = ({h = 36}) => {
  const f = useCurrentFrame();
  return <span style={{display: "inline-block", width: 3, height: h, marginLeft: 4, background: C.blue, verticalAlign: "middle", opacity: Math.floor(f / 8) % 2 === 0 ? 1 : 0}} />;
};

const Cursor: React.FC<{from: [number, number]; to: [number, number]; start: number; end: number}> = ({from, to, start, end}) => {
  const f = useCurrentFrame();
  const e = {...clamp, easing: Easing.inOut(Easing.cubic)};
  const x = interpolate(f, [start, end], [from[0], to[0]], e);
  const y = interpolate(f, [start, end], [from[1], to[1]], e);
  const o = interpolate(f, [start - 6, start, end + 14, end + 22], [0, 1, 1, 0], clamp);
  return (
    <svg width={46} height={46} viewBox="0 0 24 24" style={{position: "absolute", left: x, top: y, opacity: o, zIndex: 20, filter: "drop-shadow(0 6px 8px rgba(0,0,0,.25))"}}>
      <path d="M3 2l0 18 5-5 4 9 3-1.5-4-9h7z" fill={C.ink} stroke="#fff" strokeWidth={1.4} strokeLinejoin="round" />
    </svg>
  );
};

const Badge: React.FC<{text: string; delay: number; rot?: number; bg?: string; color?: string}> = ({text, delay, rot = -8, bg = C.lime, color = C.ink}) => {
  const p = useEnter(delay);
  return (
    <div
      style={{
        display: "inline-block",
        background: bg,
        color,
        fontFamily: sans,
        fontWeight: 800,
        fontSize: 36,
        letterSpacing: ".04em",
        padding: "14px 30px",
        borderRadius: 18,
        boxShadow: `${SHADOW_BIG}, 0 0 60px rgba(198,255,61,.35)`,
        opacity: Math.min(1, p * 3),
        transform: `rotate(${rot - (1 - p) * 30}deg) scale(${0.3 + 0.7 * p})`,
      }}
    >
      {text}
    </div>
  );
};

/* ---------- canvas: dark, glowing, alive ---------- */
const SPARKS: [number, number, number, number][] = [
  [90, 120, 34, 0],
  [930, 200, 26, 2],
  [60, 900, 28, 4],
  [980, 1050, 36, 1],
  [120, 1700, 30, 3],
  [920, 1730, 26, 5],
];

const Canvas: React.FC = () => {
  const f = useCurrentFrame();
  const t = (f / config.durationInFrames) * Math.PI * 2;
  const blob = (size: number, color: string, style: React.CSSProperties) => (
    <div style={{position: "absolute", width: size, height: size, borderRadius: "50%", background: `radial-gradient(circle, ${color} 0%, rgba(0,0,0,0) 65%)`, ...style}} />
  );
  return (
    <AbsoluteFill style={{background: C.bg}}>
      {blob(1300, "rgba(40,90,255,.45)", {left: -480 + 100 * Math.sin(t), top: -380 + 80 * Math.cos(t)})}
      {blob(1300, "rgba(20,60,200,.38)", {right: -520 + 90 * Math.cos(t), bottom: -420 + 100 * Math.sin(t)})}
      {blob(900, "rgba(60,140,255,.22)", {left: 300 + 120 * Math.cos(t * 2), top: 800 + 150 * Math.sin(t * 2)})}
      <AbsoluteFill
        style={{
          backgroundImage: "radial-gradient(rgba(255,255,255,.16) 2px, transparent 2px)",
          backgroundSize: "70px 70px",
          backgroundPosition: `${(f * 0.6) % 70}px ${(f * 0.9) % 70}px`,
          opacity: 0.55,
        }}
      />
      {SPARKS.map(([x, y, s, ph], i) => (
        <svg
          key={i}
          width={s}
          height={s}
          viewBox="0 0 24 24"
          style={{position: "absolute", left: x, top: y, opacity: 0.35 + 0.5 * Math.max(0, Math.sin(t * 6 + ph)), transform: `scale(${0.8 + 0.3 * Math.sin(t * 6 + ph)}) rotate(${f * 1.5}deg)`}}
        >
          <path d="M12 0C13 8 16 11 24 12C16 13 13 16 12 24C11 16 8 13 0 12C8 11 11 8 12 0Z" fill={C.lime} />
        </svg>
      ))}
    </AbsoluteFill>
  );
};

/* ---------- captions (word-by-word, one accent word each) ----------
   *word* = italic serif accent, ~word~ = lime marker accent, | = line break */
type Tok = {t: string; k?: "serif" | "blue"};
const parse = (s: string): Tok[][] =>
  s.split("|").map((line) =>
    line
      .trim()
      .split(" ")
      .map((w): Tok => {
        if (w.startsWith("*")) return {t: w.replace(/\*/g, ""), k: "serif"};
        if (w.startsWith("~")) return {t: w.replace(/~/g, ""), k: "blue"};
        return {t: w};
      })
  );

const CapInner: React.FC<{text: string; dur: number; w: number[]; instant?: number}> = ({text, dur, w, instant = 0}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const lines = parse(text);
  const maxLen = Math.max(...lines.map((l) => l.map((x) => x.t).join(" ").length));
  const size = Math.min(96, SAFE.w / (maxLen * 0.52));
  const out = interpolate(f, [dur, dur + EXIT], [1, 0], clamp);
  let n = 0;
  return (
    <div
      style={{
        position: "absolute",
        left: SAFE.left,
        width: SAFE.w,
        top: CAP_TOP,
        height: CAP_H,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        fontFamily: sans,
        fontWeight: 800,
        letterSpacing: "-0.02em",
        fontSize: size,
        lineHeight: 1.1,
        color: C.white,
        textAlign: "center",
        opacity: out,
        filter: `blur(${(1 - out) * 12}px)`,
        textShadow: "0 6px 30px rgba(0,0,0,.5)",
      }}
    >
      {lines.map((ws, li) => (
        <div key={li} style={{display: "flex", gap: size * 0.26, justifyContent: "center", whiteSpace: "nowrap"}}>
          {ws.map((word, wi) => {
            const i = n++;
            const t0 = w[i] - LEAD;
            const p = i < instant ? 1 : spring({frame: f - t0, fps, config: {damping: 9, stiffness: 190, mass: 0.6}});
            const accent: React.CSSProperties =
              word.k === "serif"
                ? {fontFamily: serif, fontStyle: "italic", fontWeight: 400, color: C.lime, fontSize: size * 1.16, letterSpacing: 0, textShadow: "0 0 40px rgba(198,255,61,.55)"}
                : word.k === "blue"
                ? {color: C.ink, background: C.lime, padding: "0 .22em", borderRadius: ".22em", transform: "rotate(-2deg)", textShadow: "none"}
                : {};
            return (
              <span
                key={wi}
                style={{
                  display: "inline-block",
                  opacity: Math.min(1, p * 2),
                  transform: `translateY(${(1 - p) * 40}px) scale(${0.6 + 0.4 * p}) ${word.k === "blue" ? "rotate(-2deg)" : ""}`,
                  filter: `blur(${Math.max(0, 1 - p) * 6}px)`,
                  ...accent,
                  ...(word.k === "blue" ? {transform: `translateY(${(1 - p) * 40}px) scale(${0.6 + 0.4 * p}) rotate(-2deg)`} : {}),
                }}
              >
                {word.t}
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
};

/* Spoken onset of every word, SECONDS from the start of the mp3. */
const CAP_SRC: {text: string; w: number[]; instant?: number}[] = [
  {text: "I built a full|stock app with *AI.*", w: [0.05, 0.29, 0.53, 0.77, 1.0, 1.24, 1.48, 1.72], instant: 3},
  {text: "Then I|*open-sourced* it.", w: [3.01, 3.24, 3.47, 4.19]},
  {text: "*AI* wrote almost|all of it.", w: [4.86, 5.27, 5.48, 5.89, 6.05, 6.3]},
  {text: "I *directed* it,", w: [6.88, 7.0, 7.45]},
  {text: "tested and *fixed* it.", w: [7.82, 8.38, 8.55, 8.86]},
  {text: "Now ~10,000~ installs.", w: [9.58, 10.16, 11.02]},
  {text: "The *full* web app|and the Flutter app", w: [12.06, 12.27, 12.48, 12.66, 12.9, 13.08, 13.2, 13.62]},
  {text: "are *open* source.", w: [13.88, 14.03, 14.34]},
  {text: "Read how it's *built,*", w: [15.16, 15.36, 15.52, 15.69]},
  {text: "*Fork* it, ship|your own.", w: [16.31, 16.55, 17.0, 17.23, 17.45]},
  {text: "Built *solo.*", w: [18.16, 18.52]},
  {text: "Flutter for *mobile,*", w: [19.43, 19.76, 19.9]},
  {text: "~Next.js~ for web,", w: [20.58, 21.5, 21.72]},
  {text: "*Supabase*|underneath.", w: [22.35, 23.0]},
  {text: "Learn the market|with *virtual* money,", w: [24.07, 24.27, 24.44, 24.8, 25.02, 25.4]},
  {text: "before risking|a *rupee.*", w: [25.97, 26.4, 26.74, 26.88]},
  {text: "Fork it. Break it.|Make it *better.*", w: [27.67, 27.99, 28.43, 28.73, 29.2, 29.42, 29.6]},
  {text: "Comment ~REPO~", w: [30.33, 30.88]},
  {text: "and I'll send|you the link.", w: [31.17, 31.3, 31.48, 31.68, 31.8, 31.92]},
];

type CapDef = {at: number; dur: number; text: string; w: number[]; instant?: number};

const CAPS: CapDef[] = CAP_SRC.map((c, i) => {
  const words = parse(c.text).flat().length;
  if (words !== c.w.length) {
    throw new Error(`Caption "${c.text}" has ${words} words but ${c.w.length} timings`);
  }
  const abs = c.w.map((s) => Math.round(s * config.fps));
  const at = Math.max(0, abs[0] - LEAD);
  const nxt = CAP_SRC[i + 1];
  const end = nxt ? Math.round(nxt.w[0] * config.fps) - LEAD : LOOP_AT;
  return {text: c.text, instant: c.instant, at, dur: end - at, w: abs.map((a) => a - at)};
});

const CapBlock: React.FC<CapDef> = ({at, dur, ...rest}) => (
  <Sequence from={at} durationInFrames={dur + EXIT}>
    <CapInner dur={dur} {...rest} />
  </Sequence>
);

/* ---------- scene plumbing ---------- */
const Fade: React.FC<{dur: number; children: React.ReactNode}> = ({dur, children}) => {
  const f = useCurrentFrame();
  const o = interpolate(f, [dur, dur + EXIT], [1, 0], clamp);
  const punch = interpolate(f, [0, 12], [1.07, 1], {...clamp, easing: easeOut});
  return (
    <AbsoluteFill style={{opacity: o, filter: `blur(${(1 - o) * 10}px)`, transform: `scale(${punch})`}}>{children}</AbsoluteFill>
  );
};

const Part: React.FC<{from: number; dur: number; children: React.ReactNode}> = ({from, dur, children}) => (
  <Sequence from={from} durationInFrames={dur + EXIT}>
    <Fade dur={dur}>{children}</Fade>
  </Sequence>
);

// Free-form hero area: children are absolutely positioned in a 960 x 950 box.
const Zone: React.FC<{children: React.ReactNode}> = ({children}) => (
  <div style={{position: "absolute", left: SAFE.left, top: HERO_TOP, width: SAFE.w, height: HERO_H}}>{children}</div>
);

const Tag: React.FC<{text: string}> = ({text}) => (
  <div style={{position: "absolute", left: SAFE.left, width: SAFE.w, top: TAG_TOP, display: "flex", justifyContent: "center"}}>
    <Pop delay={6} y={24}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          background: "rgba(255,255,255,.09)",
          border: "1px solid rgba(255,255,255,.2)",
          boxShadow: SHADOW,
          borderRadius: 999,
          padding: "18px 36px",
          fontFamily: sans,
          fontWeight: 600,
          fontSize: 30,
          color: C.white,
        }}
      >
        <span style={{width: 14, height: 14, borderRadius: 7, background: C.lime, boxShadow: "0 0 16px #C6FF3D"}} />
        {text}
      </div>
    </Pop>
  </div>
);

/* ============================== PIP, the mascot ==============================
   v3: cream bot, dark visor face, orange scarf + same-orange cape. No purple.
   Emotion is drawn on the visor (eyes + mouth) AND in the body (head tilt,
   arm poses). Movement: hop-stretch along PATH, arms swing while travelling,
   feet step, cape streams behind him, antenna lags. PATH / MOODS are yours. */
const PATH: [number, number, number, number, number][] = [
  [0, 150, 1480, 0.95, -6],
  [30, 150, 1470, 1.0, -4],
  [96, 200, 1500, 1.0, -8],
  [112, 830, 1480, 1.15, 12],
  [144, 830, 1480, 1.05, 8],
  [172, 940, 930, 0.8, 10],
  [198, 940, 930, 0.8, -10],
  [212, 120, 1530, 0.9, -8],
  [255, 520, 1530, 1.0, 0],
  [300, 880, 1540, 1.1, 6],
  [335, 540, 1500, 1.3, 0],
  [360, 540, 1480, 1.1, 0],
  [398, 900, 1440, 1.0, 10],
  [440, 150, 1440, 1.0, -10],
  [453, 150, 1500, 1.0, -8],
  [505, 840, 1470, 1.1, 10],
  [540, 540, 1520, 1.0, 0],
  [560, 860, 720, 0.9, 8],
  [585, 150, 1520, 0.95, -8],
  [625, 540, 1520, 1.0, 0],
  [665, 900, 1520, 1.0, 8],
  [705, 540, 1500, 1.2, 0],
  [740, 850, 1450, 1.0, 8],
  [775, 780, 1100, 0.9, 12],
  [805, 540, 1440, 1.15, 0],
  [840, 900, 1500, 1.0, 8],
  [875, 150, 1500, 1.1, -10],
  [905, 540, 1500, 1.2, 0],
  [925, 540, 1330, 1.1, 0],
  [950, 840, 1330, 1.1, 8],
  [970, 540, 1500, 1.4, 0],
  [1000, 150, 1480, 0.95, -6],
];

type Mood = "smile" | "wow" | "focus" | "cheer" | "worry" | "love";
const MOODS: [number, Mood][] = [
  [0, "smile"], [96, "wow"], [112, "cheer"], [144, "smile"], [172, "focus"], [212, "smile"], [300, "wow"],
  [335, "cheer"], [360, "smile"], [398, "cheer"], [453, "smile"], [505, "wow"], [543, "smile"], [705, "cheer"],
  [720, "smile"], [775, "worry"], [805, "cheer"], [828, "smile"], [853, "wow"], [876, "love"], [890, "cheer"], [908, "smile"],
  [940, "cheer"], [966, "love"], [1000, "smile"],
];

const ease = Easing.inOut(Easing.cubic);
const samplePath = (f: number) => {
  const k = PATH;
  if (f <= k[0][0]) return {x: k[0][1], y: k[0][2], s: k[0][3], r: k[0][4]};
  for (let i = 0; i < k.length - 1; i++) {
    if (f <= k[i + 1][0]) {
      const [f0, x0, y0, s0, r0] = k[i];
      const [f1, x1, y1, s1, r1] = k[i + 1];
      const t = (f - f0) / (f1 - f0);
      const e = ease(t);
      const hop = 4 * t * (1 - t) * Math.min(55, Math.hypot(x1 - x0, y1 - y0) * 0.1);
      return {x: x0 + (x1 - x0) * e, y: y0 + (y1 - y0) * e - hop, s: s0 + (s1 - s0) * e, r: r0 + (r1 - r0) * e};
    }
  }
  const l = k[k.length - 1];
  return {x: l[1], y: l[2], s: l[3], r: l[4]};
};

/* ---- Pip artwork (viewBox 300 x 340) ---- */
const PIP_W = "#FFF6EC";
const lidStyle = (w = 11) => ({stroke: PIP_W, strokeWidth: w, strokeLinecap: "round" as const, fill: "none"});
const HEART = "M0 7 C-15 -4 -11 -15 0 -8 C11 -15 15 -4 0 7Z";

const PipFace: React.FC<{mood: Mood; f: number; look: number; lookY: number}> = ({mood, f, look, lookY}) => {
  const L = 118;
  const R = 182;
  const y = 122;
  const blink = f % 96 < 4 ? 0.1 : 1;
  const pulse = 1 + 0.025 * Math.sin(f / 10);
  let face: React.ReactNode;
  switch (mood) {
    case "wow":
      face = (
        <>
          <circle cx={L} cy={y} r={17} fill={PIP_W} />
          <circle cx={R} cy={y} r={17} fill={PIP_W} />
          <circle cx={L + 5 + look * 4} cy={y - 6 + lookY * 3} r={5.5} fill="#0c0b12" />
          <circle cx={R + 5 + look * 4} cy={y - 6 + lookY * 3} r={5.5} fill="#0c0b12" />
          <ellipse cx={150} cy={158} rx={9} ry={11} fill={PIP_W} />
        </>
      );
      break;
    case "focus":
      face = (
        <>
          <path d={`M100 ${y + 2} L134 ${y - 3}`} {...lidStyle()} />
          <path d={`M166 ${y - 3} L200 ${y + 2}`} {...lidStyle()} />
          <path d="M135 158 H165" {...lidStyle(7)} />
        </>
      );
      break;
    case "cheer":
      face = (
        <>
          <path d={`M99 ${y + 10} Q${L} ${y - 22} 137 ${y + 10}`} {...lidStyle()} />
          <path d={`M163 ${y + 10} Q${R} ${y - 22} 201 ${y + 10}`} {...lidStyle()} />
          <path d="M126 146 Q150 178 174 146 Z" fill={PIP_W} />
        </>
      );
      break;
    case "worry":
      face = (
        <>
          <circle cx={L + look * 3} cy={y + 4} r={11} fill={PIP_W} />
          <circle cx={R + look * 3} cy={y + 4} r={11} fill={PIP_W} />
          <path d={`M98 ${y - 18} L136 ${y - 28}`} {...lidStyle(6)} />
          <path d={`M164 ${y - 28} L202 ${y - 18}`} {...lidStyle(6)} />
          <path d="M134 162 Q142 152 150 160 T166 160" {...lidStyle(6)} />
        </>
      );
      break;
    case "love":
      face = (
        <>
          <g transform={`translate(${L} ${y}) scale(${1.9 * pulse})`}>
            <path d={HEART} fill="#FF7A9C" />
          </g>
          <g transform={`translate(${R} ${y}) scale(${1.9 * pulse})`}>
            <path d={HEART} fill="#FF7A9C" />
          </g>
          <path d="M134 150 Q150 166 166 150" {...lidStyle(7)} />
        </>
      );
      break;
    default:
      face = (
        <>
          <path d={`M100 ${y + 8} Q${L} ${y - 16} 136 ${y + 8}`} {...lidStyle()} />
          <path d={`M164 ${y + 8} Q${R} ${y - 16} 200 ${y + 8}`} {...lidStyle()} />
          <path d="M138 150 Q150 160 162 150" {...lidStyle(6)} />
        </>
      );
  }
  return <g transform={`translate(${look * 4} ${lookY * 3}) translate(0 ${y}) scale(1 ${blink}) translate(0 ${-y})`}>{face}</g>;
};

const ARM_R: Record<Mood, number> = {cheer: -6, love: 14, wow: -14, smile: 34, focus: 60, worry: 56};
const ARM_L: Record<Mood, number> = {cheer: 62, love: 28, wow: 46, smile: 4, focus: -10, worry: 40};
const TILT: Record<Mood, number> = {cheer: 0, love: 6, wow: 0, smile: 0, focus: 0, worry: -5};

const PipArt: React.FC<{mood: Mood; f: number; vx: number; vy: number; speed: number; look: number; lookY: number}> = ({mood, f, vx, vy, speed, look, lookY}) => {
  const swing = 0;
  const air = 0;
  const lively = mood === "cheer" || mood === "love";
  const waveR = lively ? Math.sin(f / 16) * 6 : Math.sin(f / 22) * 2;
  const armR = ARM_R[mood] + waveR + swing * 34;
  const armL = ARM_L[mood] + Math.sin(f / 24) * 2;
  const capeSkew = Math.max(-7, Math.min(7, -vx * 0.25)) + Math.sin(f / 18) * 1.2;
  const capeStretch = 1 + Math.sin(f / 18) * 0.01;
  const antRot = Math.sin(f / 20) * 2;
  const tilt = TILT[mood] * 0.6;
  const fl = swing * 8;
  const flY = -Math.max(0, swing) * 10 - air * 8;
  const frY = -Math.max(0, -swing) * 10 - air * 8;
  const spark = false;
  const warm = mood === "cheer" || mood === "love";
  const sparkC = mood === "love" ? "#FF7A9C" : "#FFD84D";
  const cheek = warm ? 0.6 : 0.38;
  return (
    <svg width={220} height={249} viewBox="0 0 300 340" style={{position: "absolute", left: 0, top: 0, overflow: "visible"}}>
      <defs>
        <radialGradient id="pipSkin" cx=".3" cy=".22" r="1">
          <stop offset="0" stopColor="#FFEADF" />
          <stop offset=".55" stopColor="#F3CDBE" />
          <stop offset="1" stopColor="#D9A08E" />
        </radialGradient>
        <radialGradient id="pipSkinB" cx=".3" cy=".2" r="1">
          <stop offset="0" stopColor="#FBE0D3" />
          <stop offset=".6" stopColor="#EDBFAE" />
          <stop offset="1" stopColor="#D49884" />
        </radialGradient>
        <linearGradient id="pipVisor" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2d2a37" />
          <stop offset=".5" stopColor="#14131b" />
          <stop offset="1" stopColor="#0a0910" />
        </linearGradient>
        <linearGradient id="pipScarf" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFA063" />
          <stop offset="1" stopColor="#E8601F" />
        </linearGradient>
        <linearGradient id="pipCape" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#F58443" />
          <stop offset="1" stopColor="#E8601F" />
        </linearGradient>
        <filter id="pipGlow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="3" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* cape, streams opposite to travel */}
      <g transform={`translate(150 204) skewX(${capeSkew}) scale(1 ${capeStretch}) translate(-150 -204)`}>
        <path d="M86 204 Q34 252 44 322 Q74 300 100 324 Q126 302 150 326 Q174 302 200 324 Q226 300 256 322 Q266 252 214 204 Z" fill="url(#pipCape)" />
        <path d="M100 214 Q72 262 80 314 Q104 298 124 316 Q116 262 118 218 Z" fill="#B8420F" opacity={0.35} />
        <path d="M200 214 Q228 262 220 314 Q196 298 176 316 Q184 262 182 218 Z" fill="#B8420F" opacity={0.35} />
        <path d="M92 210 Q50 254 56 304" stroke="#FF9A63" strokeWidth={4} fill="none" strokeLinecap="round" opacity={0.55} />
      </g>

      {/* feet */}
      {/* <ellipse cx={112 + fl} cy={298 + flY} rx={34} ry={20} fill="url(#pipSkinB)" />
      <ellipse cx={188 - fl} cy={298 + frY} rx={34} ry={20} fill="url(#pipSkinB)" /> */}

      {/* left arm */}
      <g transform={`rotate(${armL} 100 238)`}>
        <path d="M100 238 Q62 250 52 276" stroke="#E7B7A5" strokeWidth={32} strokeLinecap="round" fill="none" />
        <path d="M100 232 Q64 243 54 266" stroke="#F8D9CB" strokeWidth={9} strokeLinecap="round" fill="none" opacity={0.7} />
      </g>

      {/* body */}
      <ellipse cx={150} cy={252} rx={62} ry={58} fill="url(#pipSkinB)" />
      <ellipse cx={124} cy={232} rx={20} ry={9} fill="#fff" opacity={0.35} transform="rotate(-24 124 232)" />

      {/* right arm */}
      <g transform={`rotate(${armR} 200 232)`}>
        <path d="M200 232 Q238 226 252 184" stroke="#E7B7A5" strokeWidth={32} strokeLinecap="round" fill="none" />
        <path d="M200 226 Q236 220 248 186" stroke="#F8D9CB" strokeWidth={9} strokeLinecap="round" fill="none" opacity={0.7} />
      </g>

      {/* scarf */}
      <path d="M84 196 Q150 238 216 196 L224 224 Q150 266 76 224 Z" fill="url(#pipScarf)" />
      <path d="M92 204 Q150 240 208 204" stroke="#FFC08F" strokeWidth={4} fill="none" strokeLinecap="round" opacity={0.7} />

      {/* head group (tilts with emotion) */}
      <g transform={`rotate(${tilt} 150 214)`}>
        <g transform={`rotate(${antRot} 150 42)`}>
          <line x1={150} y1={42} x2={150} y2={22} stroke="#D9A08E" strokeWidth={7} strokeLinecap="round" />
          <circle cx={150} cy={18} r={10} fill="#FF7A3D" />
          <circle cx={147} cy={15} r={3.5} fill="#FFC08F" />
        </g>
        <rect x={40} y={38} width={220} height={176} rx={84} fill="url(#pipSkin)" />
        <ellipse cx={96} cy={62} rx={38} ry={11} fill="#fff" opacity={0.45} transform="rotate(-16 96 62)" />
        <rect x={62} y={64} width={176} height={118} rx={58} fill="url(#pipVisor)" />
        <path d="M86 78 Q130 66 172 74" stroke="#fff" strokeWidth={4} strokeLinecap="round" fill="none" opacity={0.16} />
        <g filter="url(#pipGlow)">
          <PipFace mood={mood} f={f} look={look} lookY={lookY} />
        </g>
        <ellipse cx={80} cy={156} rx={11} ry={6} fill="#FF6B8A" opacity={cheek} />
        <ellipse cx={220} cy={156} rx={11} ry={6} fill="#FF6B8A" opacity={cheek} />
        {mood === "worry" && <path d={`M240 70 Q250 90 240 98 Q230 90 240 70Z`} fill="#7DB8FF" />}
      </g>

      {/* sparkles for happy moods */}
      {spark &&
        [[266, 66, 0], [34, 86, 2], [274, 190, 4]].map(([x, yy, ph], i) => (
          <path
            key={i}
            transform={`translate(${x} ${yy}) scale(${0.55 + 0.35 * Math.sin(f / 4 + ph)}) rotate(${f * 2}) translate(-12 -12)`}
            d="M12 0C13 8 16 11 24 12C16 13 13 16 12 24C11 16 8 13 0 12C8 11 11 8 12 0Z"
            fill={sparkC}
          />
        ))}
    </svg>
  );
};

const Pip: React.FC = () => {
  const f = useCurrentFrame();
  const p = samplePath(f);
  const a = samplePath(f - 2);
  const b = samplePath(f + 2);
  const vx = b.x - a.x;
  const vy = b.y - a.y;
  const speed = Math.hypot(vx, vy) / 4;
  const stretch = Math.min(0.07, speed / 180);
  let mood: Mood = "smile";
  for (const [mf, m] of MOODS) if (f >= mf) mood = m;

  const bob = Math.sin(f / 14) * 3;
  const look = Math.max(-1, Math.min(1, vx / 14));
  const lookY = Math.max(-1, Math.min(1, vy / 14));
  
  return (
    <div
      style={{
        position: "absolute",
        left: p.x - 110,
        top: p.y - 150 + bob,
        width: 220,
        height: 249,
        zIndex: 50,
        pointerEvents: "none",
        transformOrigin: "50% 90%",
        transform: `rotate(${p.r * 0.3 + Math.max(-4, Math.min(4, vx * 0.15))}deg) scale(${p.s * (1 - stretch * 0.6)}, ${p.s * (1 + stretch)})`,
        filter: "drop-shadow(0 24px 24px rgba(0,0,0,.45))",
      }}
    >
      <PipArt mood={mood} f={f} vx={vx} vy={vy} speed={speed} look={look} lookY={lookY} />
    </div>
  );
};

/* ---------- phone mockup + screens ---------- */
const PW = 340;
const PH = 690;

const Phone: React.FC<{scale?: number; children: React.ReactNode}> = ({scale = 1, children}) => (
  <div style={{width: PW * scale, height: PH * scale}}>
    <div style={{width: PW, height: PH, transform: `scale(${scale})`, transformOrigin: "top left", background: "#050408", borderRadius: 52, padding: 9, boxSizing: "border-box", boxShadow: `${SHADOW_BIG}, 0 0 0 2px rgba(255,255,255,.12)`}}>
      <div style={{position: "relative", width: "100%", height: "100%", background: "#F6F7F9", borderRadius: 43, overflow: "hidden", fontFamily: sans}}>
        {children}
        <div style={{position: "absolute", top: 10, left: "50%", marginLeft: -45, width: 90, height: 24, borderRadius: 12, background: "#050408"}} />
      </div>
    </div>
  </div>
);

const STOCKS = [
  ["TATASTEEL", "Tata Steel", "142.30", "+2.4"],
  ["RELIANCE", "Reliance Ind.", "2,918.55", "+0.8"],
  ["HDFCBANK", "HDFC Bank", "1,612.10", "-0.6"],
  ["INFY", "Infosys", "1,884.75", "+1.3"],
  ["SBIN", "State Bank", "812.40", "-1.1"],
];

const StocksScreen: React.FC<{d?: number}> = ({d = 0}) => (
  <div style={{padding: "50px 16px 0"}}>
    <div style={{display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14}}>
      <div style={{fontWeight: 800, fontSize: 26, color: C.ink}}>OptionXi</div>
      <Pill bg={C.tint} color={C.blue} size={13}>Practice</Pill>
    </div>
    <Pop delay={d - 8} y={20}>
      <div style={{background: C.ink, borderRadius: 22, padding: "18px 20px", marginBottom: 18}}>
        <div style={{fontSize: 12, color: "#A9A6AC", fontWeight: 600}}>Virtual cash</div>
        <div style={{fontSize: 32, fontWeight: 700, color: "#fff", margin: "2px 0"}}>₹1,00,000</div>
        <div style={{fontSize: 13, fontWeight: 700, color: "#6FD3A5"}}>+₹2,450 today</div>
      </div>
    </Pop>
    <div style={{fontSize: 14, fontWeight: 700, color: C.grey, marginBottom: 10}}>Watchlist</div>
    {STOCKS.map(([sym, name, price, chg], i) => (
      <Pop key={sym} delay={d + i * 5} y={24}>
        <div style={{background: "#fff", borderRadius: 18, padding: "12px 14px", marginBottom: 10, display: "flex", justifyContent: "space-between", alignItems: "center"}}>
          <div>
            <div style={{fontSize: 15, fontWeight: 700, color: C.ink}}>{sym}</div>
            <div style={{fontSize: 11, color: C.grey, fontWeight: 500}}>{name}</div>
          </div>
          <div style={{textAlign: "right"}}>
            <div style={{fontSize: 15, fontWeight: 600, color: C.ink}}>{price}</div>
            <div style={{fontSize: 12, fontWeight: 700, color: chg.startsWith("+") ? C.green : C.red}}>{chg}%</div>
          </div>
        </div>
      </Pop>
    ))}
  </div>
);

const SCAN: [string, number, boolean][] = [
  ["TATASTEEL", 0.9, true],
  ["INFY", 0.7, true],
  ["SBIN", 0.55, false],
  ["HDFCBANK", 0.42, false],
  ["RELIANCE", 0.3, true],
];

const ScanRow: React.FC<{sym: string; pct: number; bull: boolean; delay: number}> = ({sym, pct, bull, delay}) => {
  const p = useEnter(delay);
  return (
    <div style={{background: "#fff", borderRadius: 18, padding: "13px 14px", marginBottom: 10, opacity: Math.min(1, p * 2), transform: `translateY(${(1 - p) * 20}px)`}}>
      <div style={{display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8}}>
        <div style={{fontSize: 15, fontWeight: 700, color: C.ink}}>{sym}</div>
        <Pill bg={bull ? "#E4F4EC" : "#FBE9E7"} color={bull ? C.green : C.red} size={11}>{bull ? "Bullish" : "Bearish"}</Pill>
      </div>
      <div style={{display: "flex", alignItems: "center", gap: 10}}>
        <div style={{flex: 1, height: 8, borderRadius: 4, background: C.soft, overflow: "hidden"}}>
          <div style={{width: `${pct * 100 * Math.min(1, p)}%`, height: "100%", background: bull ? C.green : C.red}} />
        </div>
        <div style={{fontFamily: mono, fontSize: 12, color: C.grey}}>{(2 + pct * 4).toFixed(1)}x</div>
      </div>
    </div>
  );
};

const ScannerScreen: React.FC<{d?: number}> = ({d = 0}) => (
  <div style={{padding: "50px 16px 0"}}>
    <div style={{display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16}}>
      <div style={{fontWeight: 800, fontSize: 26, color: C.ink}}>Scanner</div>
      <Pill bg="#FCEDE8" color={C.coral} size={13}>Volume Jump</Pill>
    </div>
    {SCAN.map(([sym, pct, bull], i) => (
      <ScanRow key={sym} sym={sym} pct={pct} bull={bull} delay={d + i * 6} />
    ))}
  </div>
);

const AlertBanner: React.FC<{delay: number}> = ({delay}) => {
  const p = useEnter(delay);
  return (
    <div style={{position: "absolute", top: 44, left: 12, right: 12, zIndex: 5, background: "#fff", borderRadius: 22, boxShadow: SHADOW_BIG, padding: "12px 14px", display: "flex", alignItems: "center", gap: 12, transform: `translateY(${(1 - p) * -140}px)`, opacity: Math.min(1, p * 3)}}>
      <Tile bg={C.coral} size={40}>
        <span style={{color: "#fff", fontWeight: 800, fontSize: 20}}>!</span>
      </Tile>
      <div>
        <div style={{fontFamily: mono, fontSize: 11, color: C.grey}}>OptionXi · now</div>
        <div style={{fontSize: 15, fontWeight: 700, color: C.ink}}>TATASTEEL crossed day high</div>
      </div>
    </div>
  );
};

/* ---------- cards ---------- */
const RepoCard: React.FC<{name: string; lang: string; langColor: string; w: number; fs: number; tile?: number; stars?: number}> = ({name, lang, langColor, w, fs, tile = 60, stars}) => (
  <Card style={{width: w, padding: 28}}>
    <div style={{display: "flex", alignItems: "center", gap: 18}}>
      <Tile bg={C.ink} size={tile}>
        <span style={{fontFamily: mono, color: "#fff", fontSize: tile * 0.4}}>{"</>"}</span>
      </Tile>
      <div style={{minWidth: 0}}>
        <div style={{fontFamily: mono, fontSize: 18, color: C.grey}}>optionxi /</div>
        <div style={{fontWeight: 800, fontSize: fs, color: C.ink, letterSpacing: "-0.02em"}}>{name}</div>
      </div>
    </div>
    <div style={{display: "flex", gap: 12, marginTop: 20, alignItems: "center", flexWrap: "wrap"}}>
      <Pill bg={C.tint} color={C.blue} size={20}>Public</Pill>
      <Pill bg={C.soft} color={C.ink} size={20}>
        <span style={{width: 12, height: 12, borderRadius: 6, background: langColor}} />
        {lang}
      </Pill>
      {stars === undefined ? (
        <Pill bg={C.soft} color={C.ink} size={20}>Open source</Pill>
      ) : (
        <>
          <Pill bg={C.soft} color={C.ink} size={20}>
            <StarIcon s={18} c={C.coral} /> {stars}
          </Pill>
          <Pill bg={C.soft} color={C.ink} size={20}>
            <ForkIcon s={18} /> Fork
          </Pill>
        </>
      )}
    </div>
  </Card>
);

const StarsCard: React.FC = () => {
  const f = useCurrentFrame();
  const p = interpolate(f, [0, 70], [0, 1], {...clamp, easing: easeOut});
  return (
    <Card style={{width: 540, padding: 28}}>
      <div style={{display: "flex", alignItems: "center", justifyContent: "space-between"}}>
        <Mono>GitHub stars</Mono>
        <StarIcon s={34} c={C.coral} />
      </div>
      <div style={{fontWeight: 800, fontSize: 96, color: C.ink, letterSpacing: "-0.03em", lineHeight: 1.05}}>{Math.round(p * STARS.web)}</div>
      <svg width={484} height={90} viewBox="0 0 504 90" style={{marginTop: 6}}>
        <path d="M0 82 C80 80 140 72 200 56 S330 40 400 22 S480 8 504 4" fill="none" stroke={C.blue} strokeWidth={6} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} />
      </svg>
    </Card>
  );
};

/* ============================ SCENE HEROES ============================
   Zone coordinates: 960 x 950. Delays are scene-local frames. */

// 1. HOOK
const Hero1: React.FC = () => (
  <Zone>
    <At x={90} y={170} rot={-5} delay={-6} dy={160} amp={10}>
      <Phone scale={0.98}>
        <StocksScreen d={34} />
      </Phone>
    </At>
    <At x={330} y={0} rot={3} delay={-12} dx={160} dy={0} z={2} phase={10}>
      <RepoCard name={REPO_WEB} lang="TypeScript" langColor={C.blue} w={620} fs={32} />
    </At>
    <At x={420} y={330} rot={-3} delay={-12} dx={200} dy={40} z={3} phase={30}>
      <StarsCard />
    </At>
    <At x={640} y={-30} rot={7} delay={100} dy={-60} z={6} amp={5}>
      <Badge text="Open source" delay={0} rot={0} />
    </At>
    <Burst delay={104} x={780} y={10} />
  </Zone>
);

// 2. PROCESS
const PromptCard: React.FC = () => {
  const f = useCurrentFrame();
  const shown = typeText("Build a virtual trading screen for NSE stocks", f, 4, 0.8);
  const press = interpolate(f, [50, 53, 58], [1, 0.94, 1], clamp);
  const built = f >= 53;
  return (
    <Card style={{width: 880, height: 250, padding: 32, position: "relative"}}>
      <div style={{display: "flex", alignItems: "center", gap: 14, marginBottom: 14}}>
        <Tile bg={C.blue} size={44}>
          <span style={{color: "#fff", fontFamily: mono, fontSize: 20}}>&gt;_</span>
        </Tile>
        <Mono>Prompt</Mono>
      </div>
      <div style={{fontWeight: 600, fontSize: 34, color: C.ink, lineHeight: 1.25, paddingRight: 40}}>
        {shown}
        {!built && <Caret h={34} />}
      </div>
      <div style={{position: "absolute", right: 32, bottom: 28, width: 190, height: 64, borderRadius: 20, background: built ? C.ink : C.blue, color: "#fff", fontWeight: 700, fontSize: 28, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${press})`}}>
        {built ? "Built" : "Build"}
      </div>
      <Cursor from={[860, 330]} to={[775, 185]} start={34} end={50} />
    </Card>
  );
};

const Chip: React.FC<{label: string; y: number; delay: number; rot: number}> = ({label, y, delay, rot}) => (
  <At x={540} y={y} rot={rot} delay={delay} dx={220} dy={0} phase={delay}>
    <Card style={{width: 380, padding: "20px 26px", display: "flex", alignItems: "center", gap: 18, borderRadius: 30}}>
      <Tile bg={C.blue} size={56}>
        <CheckIcon />
      </Tile>
      <div style={{fontWeight: 700, fontSize: 38, color: C.ink}}>{label}</div>
    </Card>
  </At>
);

const InstallsCard: React.FC = () => {
  const f = useCurrentFrame();
  const n = count(f, 161, 26, 10000);
  return (
    <Card style={{width: 400, padding: 30}}>
      <Mono>Google Play</Mono>
      <div style={{fontWeight: 800, fontSize: 80, color: C.ink, letterSpacing: "-0.03em", margin: "6px 0 0"}}>{n.toLocaleString("en-US")}+</div>
      <div style={{fontWeight: 600, fontSize: 30, color: C.grey}}>installs</div>
    </Card>
  );
};

const Hero2: React.FC = () => {
  const f = useCurrentFrame();
  const chipsOut = interpolate(f, [145, 153], [1, 0], clamp);
  return (
    <Zone>
      <At x={40} y={0} rot={-1.5} delay={0} dy={-80} amp={5}>
        <PromptCard />
      </At>
      <At x={50} y={300} rot={-4} delay={50} dy={160} amp={9} phase={12}>
        <Phone scale={0.78}>
          <StocksScreen d={58} />
        </Phone>
      </At>
      <div style={{opacity: chipsOut}}>
        <Chip label="Directed" y={340} delay={62} rot={3} />
        <Chip label="Tested" y={470} delay={88} rot={-2.5} />
        <Chip label="Fixed" y={600} delay={110} rot={2.5} />
      </div>
      <At x={500} y={420} rot={3} delay={157} dx={200} dy={40} z={4}>
        <InstallsCard />
      </At>
      <Burst delay={160} x={700} y={420} />
    </Zone>
  );
};

// 3a. PROOF
const Hero3A: React.FC = () => (
  <Zone>
    <At x={30} y={50} rot={-3} delay={2} dx={-240} dy={0} amp={9}>
      <RepoCard name={REPO_WEB} lang="TypeScript" langColor={C.blue} w={880} fs={42} tile={84} stars={STARS.web} />
    </At>
    <At x={50} y={400} rot={2.5} delay={35} dx={240} dy={0} amp={9} phase={25}>
      <RepoCard name={REPO_APP} lang="Dart" langColor={C.coral} w={880} fs={42} tile={84} stars={STARS.app} />
    </At>
    <At x={620} y={-10} rot={8} delay={58} dy={-60} z={6}>
      <Badge text="Open source" delay={0} rot={0} />
    </At>
    <Burst delay={60} x={760} y={20} n={22} />
  </Zone>
);

const Callout: React.FC<{title: string; sub: string; bg: string}> = ({title, sub, bg}) => (
  <Card style={{width: 270, padding: "22px 24px", borderRadius: 30}}>
    <Tile bg={bg} size={52} />
    <div style={{fontWeight: 800, fontSize: 32, color: C.ink, marginTop: 14}}>{title}</div>
    <div style={{fontWeight: 500, fontSize: 22, color: C.grey}}>{sub}</div>
  </Card>
);

// 3b. PROOF
const Hero3B: React.FC = () => (
  <Zone>
    <At x={310} y={90} rot={2} delay={0} dy={140} amp={10}>
      <Phone>
        <ScannerScreen d={12} />
        <AlertBanner delay={54} />
      </Phone>
    </At>
    <At x={0} y={250} rot={-6} delay={14} dx={-200} dy={0} z={3} phase={20}>
      <Callout title="Scanner" sub="Volume Jump" bg={C.blue} />
    </At>
    <At x={690} y={80} rot={6} delay={56} dx={200} dy={0} z={3} phase={40}>
      <Callout title="Alert" sub="Sent to phone" bg={C.coral} />
    </At>
  </Zone>
);

// 4. STACK
const MiniScreen: React.FC<{kind: "mobile" | "web" | "db"; delay: number}> = ({kind, delay}) => {
  const p = Math.min(1, useEnter(delay + 8));
  if (kind === "mobile") {
    return (
      <div style={{width: 84, height: 140, borderRadius: 20, border: `5px solid ${C.ink}`, padding: 10, boxSizing: "border-box"}}>
        {[1, 0.7, 0.85].map((w, i) => (
          <div key={i} style={{height: 18, borderRadius: 6, background: C.soft, marginBottom: 8, width: `${w * 100 * p}%`}} />
        ))}
      </div>
    );
  }
  if (kind === "web") {
    return (
      <div style={{width: 230, height: 140, borderRadius: 16, border: "2px solid #E3DFE1", overflow: "hidden", background: "#fff"}}>
        <div style={{height: 28, background: C.soft, display: "flex", alignItems: "center", gap: 6, paddingLeft: 10}}>
          {[0, 1, 2].map((i) => (
            <span key={i} style={{width: 9, height: 9, borderRadius: 5, background: "#D8D3D6"}} />
          ))}
        </div>
        <div style={{display: "flex", alignItems: "flex-end", gap: 12, padding: "0 20px", height: 100}}>
          {[0.5, 0.8, 0.6, 1, 0.75].map((h, i) => (
            <div key={i} style={{flex: 1, height: 80 * h * p, borderRadius: 6, background: C.ink, opacity: 0.85}} />
          ))}
        </div>
      </div>
    );
  }
  return (
    <div style={{width: 230}}>
      {[0, 1, 2].map((r) => (
        <div key={r} style={{height: 36, borderRadius: 10, background: C.soft, marginBottom: 10, display: "flex", gap: 8, padding: 9, boxSizing: "border-box", opacity: Math.min(1, p * 3 - r * 0.4)}}>
          {[0.3, 0.45, 0.25].map((w, i) => (
            <div key={i} style={{width: `${w * 100}%`, borderRadius: 5, background: "#DAD5D8"}} />
          ))}
        </div>
      ))}
    </div>
  );
};

const StackCard: React.FC<{kind: "mobile" | "web" | "db"; name: string; sub: string; bg: string; delay: number}> = ({kind, name, sub, bg, delay}) => (
  <Card style={{width: 860, height: 214, padding: "0 40px", display: "flex", alignItems: "center", gap: 30}}>
    <Tile bg={bg} size={112}>
      <svg width={58} height={58} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        {kind === "mobile" && (
          <>
            <rect x="7" y="2.5" width="10" height="19" rx="2.5" />
            <path d="M11 18.5h2" />
          </>
        )}
        {kind === "web" && (
          <>
            <rect x="2.5" y="4" width="19" height="16" rx="2.5" />
            <path d="M2.5 9h19" />
          </>
        )}
        {kind === "db" && (
          <>
            <ellipse cx="12" cy="6" rx="7.5" ry="3" />
            <path d="M4.5 6v6c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3V6M4.5 12v6c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3v-6" />
          </>
        )}
      </svg>
    </Tile>
    <div style={{flex: 1}}>
      <div style={{fontWeight: 800, fontSize: 60, color: C.ink, letterSpacing: "-0.02em"}}>{name}</div>
      <div style={{fontWeight: 500, fontSize: 28, color: C.grey}}>{sub}</div>
    </div>
    <MiniScreen kind={kind} delay={delay} />
  </Card>
);

const Hero4: React.FC = () => (
  <Zone>
    <At x={380} y={-10} rot={-6} delay={10} dy={-60} z={6}>
      <Badge text="1 developer" delay={0} rot={0} />
    </At>
    <At x={20} y={90} rot={-2} delay={37} dx={-300} dy={0} amp={7}>
      <StackCard kind="mobile" name="Flutter" sub="Mobile app" bg={C.blue} delay={37} />
    </At>
    <At x={80} y={340} rot={2} delay={71} dx={300} dy={0} amp={7} phase={20}>
      <StackCard kind="web" name="Next.js" sub="Web app" bg={C.ink} delay={71} />
    </At>
    <At x={20} y={590} rot={-1.5} delay={125} dx={-300} dy={0} amp={7} phase={40}>
      <StackCard kind="db" name="Supabase" sub="Database" bg={C.coral} delay={125} />
    </At>
    <Burst delay={125} x={480} y={700} />
  </Zone>
);

// 5a. WHY
const Hero5A: React.FC = () => {
  const f = useCurrentFrame();
  const press = interpolate(f, [55, 58, 63], [1, 0.95, 1], clamp);
  const placed = f >= 58;
  const draw = interpolate(f, [4, 50], [0, 1], {...clamp, easing: easeOut});
  return (
    <Zone>
      <At x={40} y={0} rot={-1.5} delay={0} dy={120} amp={6}>
        <Card style={{width: 880, height: 518, padding: 36, position: "relative"}}>
          <div style={{height: 64, display: "flex", justifyContent: "space-between", alignItems: "center"}}>
            <div style={{display: "flex", alignItems: "center", gap: 18}}>
              <Tile bg={C.blue} size={64}>
                <svg width={34} height={34} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 17l6-6 4 4 8-8" />
                </svg>
              </Tile>
              <div>
                <div style={{fontWeight: 800, fontSize: 40, color: C.ink, lineHeight: 1}}>TATASTEEL</div>
                <Mono size={16}>NSE · Virtual</Mono>
              </div>
            </div>
            <div style={{textAlign: "right"}}>
              <Mono size={16}>Virtual cash</Mono>
              <div style={{fontWeight: 700, fontSize: 34, color: C.ink}}>₹1,00,000</div>
            </div>
          </div>
          <svg width={808} height={170} viewBox="0 0 808 170" style={{marginTop: 24, display: "block"}}>
            <path d="M0 140 C60 130 100 150 160 120 S260 90 320 100 S430 60 500 70 S620 30 700 40 S780 20 808 14" fill="none" stroke={C.ink} strokeWidth={5} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - draw} />
          </svg>
          <div style={{height: 56, marginTop: 24, display: "flex", alignItems: "center", justifyContent: "space-between"}}>
            <Mono size={20}>Quantity</Mono>
            <div style={{background: C.soft, borderRadius: 18, padding: "10px 36px", fontWeight: 800, fontSize: 32, color: C.ink}}>10</div>
          </div>
          <div style={{height: 84, marginTop: 24, borderRadius: 26, background: placed ? C.ink : C.blue, color: "#fff", fontWeight: 700, fontSize: 36, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${press})`}}>
            {placed ? "Order placed" : "Buy · virtual"}
          </div>
          <Cursor from={[760, 560]} to={[450, 455]} start={28} end={52} />
        </Card>
      </At>
      <At x={170} y={560} rot={2} delay={59} dy={80} z={4} phase={15}>
        <Card style={{padding: "22px 36px", borderRadius: 30, display: "flex", alignItems: "center", gap: 18}}>
          <Tile bg={C.blue} size={52}>
            <CheckIcon s={28} />
          </Tile>
          <div style={{fontWeight: 700, fontSize: 32, color: C.ink}}>Virtual order placed</div>
          <Mono size={16}>no real money</Mono>
        </Card>
      </At>
      <Burst delay={60} x={480} y={440} />
    </Zone>
  );
};

// 5b. WHY: leaderboard
const LB = [
  {n: "Aarav", s0: 0, s1: 0, v: 8.1, c: "#C9D8E0"},
  {n: "Meera", s0: 1, s1: 1, v: 7.4, c: "#EBD3CA"},
  {n: "Rohan", s0: 2, s1: 3, v: 5.6, c: "#D6D9C8"},
  {n: "Isha", s0: 3, s1: 4, v: 5.0, c: "#E3D0DC"},
  {n: "Kabir", s0: 4, s1: 5, v: 4.1, c: "#D4D0E4"},
  {n: "You", s0: 5, s1: 2, v: 6.2, c: C.blue},
];
const ROW_H = 108;

const Hero5B: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = spring({frame: f - 23, fps, config: {damping: 15, stiffness: 90, mass: 0.9}});
  return (
    <Zone>
      <At x={40} y={0} rot={1.5} delay={0} dy={120} amp={5}>
        <Card style={{width: 880, padding: 32}}>
          <div style={{height: 84, display: "flex", alignItems: "center", justifyContent: "space-between"}}>
            <div>
              <div style={{fontWeight: 800, fontSize: 44, color: C.ink}}>Leaderboard</div>
              <Mono size={16}>Virtual trading · this week</Mono>
            </div>
            <Pop delay={56} y={20}>
              <Pill bg="#E4F4EC" color={C.green} size={26}>
                <UpIcon s={22} /> 3 places
              </Pill>
            </Pop>
          </div>
          <div style={{position: "relative", height: ROW_H * 6}}>
            {LB.map((r) => {
              const y = interpolate(t, [0, 1], [r.s0 * ROW_H, r.s1 * ROW_H]);
              const you = r.n === "You";
              const rank = Math.round(y / ROW_H) + 1;
              const val = you ? 3.4 + (r.v - 3.4) * Math.min(1, Math.max(0, t)) : r.v;
              return (
                <div key={r.n} style={{position: "absolute", top: y, left: 0, right: 0, height: 94, borderRadius: 26, background: you ? C.tint : "#fff", border: you ? `2px solid ${C.blue}` : "2px solid transparent", boxSizing: "border-box", display: "flex", alignItems: "center", gap: 20, padding: "0 26px", zIndex: you ? 3 : 1, transform: you ? `scale(${1 + 0.03 * Math.sin(Math.min(1, t) * Math.PI)})` : undefined}}>
                  <div style={{fontFamily: mono, fontSize: 28, color: C.grey, width: 64}}>#{rank}</div>
                  <div style={{width: 54, height: 54, borderRadius: 27, background: r.c}} />
                  <div style={{flex: 1, fontWeight: 700, fontSize: 36, color: C.ink}}>{r.n}</div>
                  <div style={{fontWeight: 800, fontSize: 34, color: C.green}}>+{val.toFixed(1)}%</div>
                </div>
              );
            })}
          </div>
        </Card>
      </At>
      <Burst delay={30} x={480} y={330} n={22} />
    </Zone>
  );
};

// 6a. CTA
const Hero6A: React.FC = () => {
  const f = useCurrentFrame();
  const typed = typeText("REPO", f, 14, 3);
  const press = interpolate(f, [30, 33, 37], [1, 0.9, 1], clamp);
  const posted = f >= 33;
  return (
    <Zone>
      <At x={40} y={60} rot={-1.5} delay={0} dy={100} amp={5}>
        <Card style={{width: 880, padding: 36}}>
          <Mono size={18}>Comments</Mono>
          <div style={{display: "flex", alignItems: "center", gap: 20, marginTop: 20}}>
            <div style={{width: 64, height: 64, borderRadius: 32, background: "#E5E1E3"}} />
            <div style={{flex: 1, height: 76, borderRadius: 38, background: C.soft, padding: "0 30px", display: "flex", alignItems: "center", fontWeight: 700, fontSize: 36, color: C.ink}}>
              {posted ? "" : typed}
              {!posted && <Caret />}
              {!posted && typed === "" && <span style={{color: C.grey, fontWeight: 500}}>Add a comment…</span>}
            </div>
            <div style={{fontWeight: 800, fontSize: 34, color: C.blue, opacity: typed.length === 4 ? 1 : 0.35, transform: `scale(${press})`}}>Post</div>
          </div>
          <Pop delay={36} y={24}>
            <div style={{display: "flex", alignItems: "center", gap: 20, marginTop: 34}}>
              <div style={{width: 64, height: 64, borderRadius: 32, background: "#E5E1E3"}} />
              <div>
                <Mono size={16}>you</Mono>
                <div style={{fontWeight: 800, fontSize: 38, color: C.ink}}>REPO</div>
              </div>
            </div>
          </Pop>
          <Pop delay={46} y={24}>
            <div style={{display: "flex", alignItems: "center", gap: 20, marginTop: 24, marginLeft: 60}}>
              <Tile bg={C.ink} size={56}>
                <span style={{fontFamily: mono, color: "#fff", fontSize: 22}}>{"</>"}</span>
              </Tile>
              <div style={{fontWeight: 600, fontSize: 32, color: C.ink}}>Link sent</div>
              <CheckIcon s={30} c={C.green} />
            </div>
          </Pop>
        </Card>
      </At>
      <Burst delay={47} x={480} y={420} n={22} />
    </Zone>
  );
};

// 6b. END CARD
const Hero6B: React.FC = () => (
  <Zone>
    <At x={40} y={0} rot={-2} delay={0} dy={100} amp={6}>
      <Card style={{width: 880, padding: "44px 44px"}}>
        <Mono size={18}>Open source · GitHub</Mono>
        {[REPO_WEB, REPO_APP].map((r, i) => (
          <div key={r} style={{marginTop: i === 0 ? 22 : 30}}>
            <div style={{fontFamily: mono, fontSize: 24, color: C.grey}}>optionxi /</div>
            <div style={{fontWeight: 800, fontSize: 50, color: C.ink, letterSpacing: "-0.02em"}}>{r}</div>
          </div>
        ))}
      </Card>
    </At>
    <At x={40} y={400} rot={2} delay={10} dy={100} amp={6} phase={20}>
      <Card style={{width: 880, padding: "36px 44px", display: "flex", alignItems: "center", justifyContent: "space-around"}}>
        <div style={{textAlign: "center"}}>
          <div style={{display: "flex", alignItems: "center", gap: 14, justifyContent: "center"}}>
            <span style={{fontWeight: 800, fontSize: 96, color: C.ink, letterSpacing: "-0.03em"}}>4.2</span>
            <StarIcon s={54} c={C.coral} />
          </div>
          <Mono size={18}>Play Store rating</Mono>
        </div>
        <div style={{width: 2, height: 120, background: C.soft}} />
        <div style={{textAlign: "center"}}>
          <div style={{fontWeight: 800, fontSize: 96, color: C.ink, letterSpacing: "-0.03em"}}>10K+</div>
          <Mono size={18}>Installs</Mono>
        </div>
      </Card>
    </At>
    <Burst delay={14} x={480} y={380} n={26} />
  </Zone>
);

/* ---------- loop: last 20 frames settle back into frame 0 ---------- */
const HOOK_TAG = "Built with AI. Now open source.";

const LoopIn: React.FC = () => {
  const f = useCurrentFrame();
  const o = interpolate(f, [0, 19], [0, 1], clamp);
  return (
    <AbsoluteFill style={{opacity: o}}>
      <Freeze frame={0}>
        <Canvas />
        <Tag text={HOOK_TAG} />
        <Hero1 />
        <CapInner text={CAPS[0].text} dur={CAPS[0].dur} w={CAPS[0].w} instant={CAPS[0].instant} />
        <Pip />
      </Freeze>
    </AbsoluteFill>
  );
};

/* ================================ REEL ================================ */
const SCENE_PROCESS = 144;
const SCENE_PROOF = 360;
const SCENE_PROOF_B = 453;
const SCENE_STACK = 543;
const SCENE_WHY = 720;
const SCENE_WHY_B = 828;
const SCENE_CTA = 908;
const SCENE_CTA_B = 966;

const TAGS: {from: number; dur: number; text: string}[] = [
  {from: 0, dur: SCENE_PROCESS, text: HOOK_TAG},
  {from: SCENE_PROCESS, dur: SCENE_PROOF - SCENE_PROCESS, text: "Not a 10-person team. Just AI."},
  {from: SCENE_PROOF, dur: SCENE_STACK - SCENE_PROOF, text: "Web app + Flutter app: open source"},
  {from: SCENE_STACK, dur: SCENE_WHY - SCENE_STACK, text: "Flutter · Next.js · Supabase"},
  {from: SCENE_WHY, dur: SCENE_CTA - SCENE_WHY, text: "Learn the market before you risk a rupee"},
  {from: SCENE_CTA, dur: LOOP_AT - SCENE_CTA, text: "Comment “REPO” for the link"},
];

export const Reel: React.FC = () => (
  <AbsoluteFill style={{fontFamily: sans}}>
    <Canvas />
    <Audio src={staticFile("audio/open source audio.mp3")} />

    {TAGS.map((t) => (
      <Part key={t.from} from={t.from} dur={t.dur}>
        <Tag text={t.text} />
      </Part>
    ))}

    <Part from={0} dur={SCENE_PROCESS}><Hero1 /></Part>
    <Part from={SCENE_PROCESS} dur={SCENE_PROOF - SCENE_PROCESS}><Hero2 /></Part>
    <Part from={SCENE_PROOF} dur={SCENE_PROOF_B - SCENE_PROOF}><Hero3A /></Part>
    <Part from={SCENE_PROOF_B} dur={SCENE_STACK - SCENE_PROOF_B}><Hero3B /></Part>
    <Part from={SCENE_STACK} dur={SCENE_WHY - SCENE_STACK}><Hero4 /></Part>
    <Part from={SCENE_WHY} dur={SCENE_WHY_B - SCENE_WHY}><Hero5A /></Part>
    <Part from={SCENE_WHY_B} dur={SCENE_CTA - SCENE_WHY_B}><Hero5B /></Part>
    <Part from={SCENE_CTA} dur={SCENE_CTA_B - SCENE_CTA}><Hero6A /></Part>
    <Part from={SCENE_CTA_B} dur={LOOP_AT - SCENE_CTA_B}><Hero6B /></Part>

    {CAPS.map((c) => (
      <CapBlock key={c.at} {...c} />
    ))}

    <Pip />

    <Sequence from={LOOP_AT} durationInFrames={20}>
      <LoopIn />
    </Sequence>

    <SafeGuide />
  </AbsoluteFill>
);

export default Reel;