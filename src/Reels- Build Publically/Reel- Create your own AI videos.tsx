import React from "react";
import {AbsoluteFill, Audio, Easing, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from "remotion";
import {loadFont as loadSans} from "@remotion/google-fonts/InterTight";
import {loadFont as loadSerif} from "@remotion/google-fonts/InstrumentSerif";
import {loadFont as loadMono} from "@remotion/google-fonts/JetBrainsMono";
import {getSafe} from "../shared/safe-area";

/* ============================================================================
   "Free" reel v3 (68s @ 30fps, 1080x1920). LIGHT background variant.
   Layout (top -> bottom):
     1. kinetic caption (top, auto-fit, inside safe area)
     2. tag pill
     3. hero scene (floating tilted cards, 960 x 640 zone)
     4. Pip (animated mascot, hops along PATH under the hero)
     5. fine print (limits, small text, bottom of safe area)
   ============================================================================ */

const VOICE_FILE: string | null = "audio/free-reel.mp3"; // put the MP3 in public/voice.mp3

const sec = (n: number) => Math.round(n * 30);
/* Beat times were re-synced to the real voiceover MP3 (68.28s). OLD = the first draft's beat edges,
   NEW = where the voice actually changes beats. warp() moves Pip's path, moods and the fine print with them. */
const OLD_EDGES = [0, 3.4, 7.2, 11.8, 16.5, 22, 28, 35, 44, 51, 57, 63, 68];
const NEW_EDGES = [0, 3.25, 7.15, 11.85, 17.35, 22.35, 28.1, 35.6, 44.05, 51.35, 57.4, 63, 68.4];
const warp = (t: number) => {
  for (let i = 0; i < OLD_EDGES.length - 1; i++) {
    if (t <= OLD_EDGES[i + 1]) return NEW_EDGES[i] + ((t - OLD_EDGES[i]) / (OLD_EDGES[i + 1] - OLD_EDGES[i])) * (NEW_EDGES[i + 1] - NEW_EDGES[i]);
  }
  return t;
};
export const config = {durationInFrames: sec(68.4), fps: 30, width: 1080, height: 1920};

const SAFE = getSafe(config);
const SAFE_BOTTOM = (SAFE as any).y1 ?? config.height - 340;

/* ---------- layout ---------- */
const CAP_TOP = SAFE.y0;
const CAP_H = 230;
const TAG_TOP = CAP_TOP + CAP_H + 20;
const HERO_TOP = TAG_TOP + 90;
const HERO_H = 640;
const FINE_TOP = SAFE_BOTTOM - 40;
const EXIT = 8;

/* ---------- tokens (LIGHT) ---------- */
const C = {
  bg: "#F8F6F2",           // light base
  bgAlt: "#FFFFFF",
  blobA: "#DDE6F3",        // soft blue
  blobB: "#E6E0F2",        // soft violet
  blobC: "#F7E7DA",        // warm glow
  ink: "#17151C",          // dark text
  white: "#FFFFFF",
  lime: "#B6E62E",         // lime tuned for white bg (a bit darker than #C6FF3D)
  limeGlow: "rgba(182,230,46,.55)",
  coral: "#F4714F",
  blue: "#4D7CFF",
  sky: "#7DB8FF",
  violet: "#9B6BFF",
  grey: "#8E8C96",
  green: "#2BC48A",
  red: "#F2535A",
  soft: "#F1EFF4",
  tint: "#E8EEFF",
  dark: "#0B0F1E",
  darkText: "#E6EAF5",
  border: "rgba(28,27,34,.08)",
};
const SHADOW = "0 24px 60px rgba(28,27,34,.10), 0 8px 18px rgba(28,27,34,.06)";
const SHADOW_BIG = "0 40px 90px rgba(28,27,34,.14), 0 12px 28px rgba(28,27,34,.08)";

const sans = loadSans("normal", {weights: ["500", "600", "700", "800"], subsets: ["latin", "latin-ext"]}).fontFamily;
const serif = loadSerif("italic", {weights: ["400"], subsets: ["latin", "latin-ext"]}).fontFamily;
const mono = loadMono("normal", {weights: ["500"], subsets: ["latin", "latin-ext"]}).fontFamily;

const clamp = {extrapolateLeft: "clamp", extrapolateRight: "clamp"} as const;
const easeOut = Easing.out(Easing.cubic);
const ramp = (f: number, a: number, b: number) => interpolate(f, [a, b], [0, 1], {...clamp, easing: easeOut});
const typeText = (s: string, f: number, start: number, perChar: number) => s.slice(0, Math.max(0, Math.floor((f - start) / perChar)));

/* ---------- motion helpers ---------- */
const useEnter = (delay = 0) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  return spring({frame: f - delay, fps, config: {damping: 10, stiffness: 130, mass: 0.8}});
};

const At: React.FC<{x: number; y: number; rot?: number; delay?: number; dx?: number; dy?: number; amp?: number; phase?: number; z?: number; children: React.ReactNode}> = ({
  x, y, rot = 0, delay = 0, dx = 0, dy = 90, amp = 7, phase = 0, z = 1, children,
}) => {
  const f = useCurrentFrame();
  const p = useEnter(delay);
  const bob = Math.sin((f + phase) / 22) * amp;
  const wob = Math.sin((f + phase) / 31) * 1.2;
  return (
    <div style={{position: "absolute", left: x, top: y, zIndex: z, opacity: Math.min(1, p * 2.5),
      transform: `translate(${(1 - p) * dx}px, ${(1 - p) * dy + bob}px) rotate(${rot + wob + (1 - p) * (dx >= 0 ? 10 : -10)}deg) scale(${0.8 + 0.2 * p})`}}>
      {children}
    </div>
  );
};

const Pop: React.FC<{delay?: number; y?: number; style?: React.CSSProperties; children: React.ReactNode}> = ({delay = 0, y = 40, style, children}) => {
  const p = useEnter(delay);
  return <div style={{opacity: Math.min(1, p * 2.2), transform: `translateY(${(1 - p) * y}px) scale(${0.9 + 0.1 * p})`, ...style}}>{children}</div>;
};

const BURST_COLORS = [C.lime, C.coral, C.sky, C.violet, C.ink];
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
          <div key={i} style={{position: "absolute", width: i % 3 === 0 ? 16 : 10, height: i % 3 === 0 ? 16 : 22, borderRadius: i % 3 === 0 ? 8 : 3,
            background: BURST_COLORS[i % BURST_COLORS.length], opacity: 1 - t / 30,
            transform: `translate(${Math.cos(a) * d}px, ${Math.sin(a) * d + t * 1.6}px) rotate(${i * 40 + t * 18}deg)`}} />
        );
      })}
    </div>
  );
};

/* ---------- UI atoms ---------- */
const Card: React.FC<{style?: React.CSSProperties; children?: React.ReactNode}> = ({style, children}) => (
  <div style={{background: "#fff", borderRadius: 36, boxShadow: SHADOW, boxSizing: "border-box", border: `1px solid ${C.border}`, ...style}}>{children}</div>
);
const Tile: React.FC<{bg: string; size?: number; children?: React.ReactNode}> = ({bg, size = 64, children}) => (
  <div style={{width: size, height: size, borderRadius: size * 0.3, background: bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0}}>{children}</div>
);
const Mono: React.FC<{size?: number; color?: string; children: React.ReactNode}> = ({size = 18, color = C.grey, children}) => (
  <span style={{fontFamily: mono, fontSize: size, letterSpacing: ".1em", textTransform: "uppercase", color}}>{children}</span>
);
const Pill: React.FC<{bg: string; color: string; size?: number; style?: React.CSSProperties; children: React.ReactNode}> = ({bg, color, size = 22, style, children}) => (
  <span style={{display: "inline-flex", alignItems: "center", gap: size * 0.35, padding: `${size * 0.32}px ${size * 0.8}px`, borderRadius: 999, background: bg, color, fontFamily: sans, fontWeight: 700, fontSize: size, whiteSpace: "nowrap", ...style}}>{children}</span>
);
const CheckIcon: React.FC<{s?: number; c?: string}> = ({s = 30, c = "#fff"}) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
);
const Cross: React.FC<{size?: number}> = ({size = 52}) => (
  <div style={{width: size, height: size, borderRadius: "50%", flexShrink: 0, background: "#FDE3E4", color: C.red, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: size * 0.48}}>✕</div>
);
const Tick: React.FC<{at: number; size?: number}> = ({at, size = 44}) => {
  const f = useCurrentFrame();
  const done = f >= at;
  const s = done ? interpolate(f - at, [0, 8, 14], [0, 1.2, 1], clamp) : 1;
  return (
    <div style={{width: size, height: size, borderRadius: "50%", flexShrink: 0, background: done ? C.lime : "transparent", border: done ? "none" : "3px solid #D3D9EA", display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${s})`}}>
      {done && <CheckIcon s={size * 0.55} c={C.ink} />}
    </div>
  );
};
const Caret: React.FC<{h?: number}> = ({h = 30}) => {
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
const Badge: React.FC<{text: string; delay: number; rot?: number; bg?: string; color?: string; size?: number}> = ({text, delay, rot = -8, bg = C.lime, color = C.ink, size = 36}) => {
  const p = useEnter(delay);
  return (
    <div style={{display: "inline-block", background: bg, color, fontFamily: sans, fontWeight: 800, fontSize: size, letterSpacing: ".04em", padding: "14px 30px", borderRadius: 18,
      boxShadow: `${SHADOW_BIG}, 0 0 60px ${C.limeGlow}`, opacity: Math.min(1, p * 3), transform: `rotate(${rot - (1 - p) * 30}deg) scale(${0.3 + 0.7 * p})`}}>{text}</div>
  );
};
const FileChip: React.FC<{name: string; w?: number; fs?: number; dashed?: boolean}> = ({name, w = 250, fs = 20, dashed}) => (
  <div style={{width: w, height: 56, borderRadius: 16, background: "#fff", border: dashed ? "2px dashed #B9BFD3" : `1px solid ${C.border}`, boxShadow: "0 8px 20px rgba(28,27,34,0.08)", display: "flex", alignItems: "center", gap: 12, padding: "0 16px", boxSizing: "border-box"}}>
    <div style={{width: 18, height: 24, borderRadius: 5, background: C.blue, flexShrink: 0}} />
    <div style={{fontFamily: mono, fontWeight: 700, fontSize: fs, whiteSpace: "nowrap", color: C.ink}}>{name}</div>
  </div>
);
const Dots: React.FC = () => (
  <div style={{display: "flex", gap: 9}}>{["#F4B8AE", "#F2DCA2", "#BCDDBF"].map((c) => <span key={c} style={{width: 14, height: 14, borderRadius: 7, background: c}} />)}</div>
);
const Browser: React.FC<{url: string; w?: number; h: number; children?: React.ReactNode}> = ({url, w = 880, h, children}) => (
  <Card style={{width: w, height: h, overflow: "hidden", display: "flex", flexDirection: "column"}}>
    <div style={{height: 64, flexShrink: 0, display: "flex", alignItems: "center", gap: 16, padding: "0 24px", borderBottom: `1px solid ${C.border}`, background: "#FAFBFE"}}>
      <Dots />
      <div style={{flex: 1, height: 36, borderRadius: 18, background: C.soft, fontFamily: mono, fontSize: 20, color: C.grey, display: "flex", alignItems: "center", padding: "0 20px"}}>{url}</div>
    </div>
    <div style={{flex: 1, position: "relative"}}>{children}</div>
  </Card>
);
const Wave: React.FC<{f: number; n?: number; w?: number; h?: number; color?: string}> = ({f, n = 28, w = 260, h = 90, color = C.blue}) => (
  <div style={{display: "flex", alignItems: "center", gap: 5, width: w, height: h}}>
    {Array.from({length: n}, (_, i) => (
      <div key={i} style={{flex: 1, borderRadius: 4, background: color, height: `${18 + Math.abs(Math.sin(i * 1.3 + f / 7)) * Math.abs(Math.cos(i * 0.37)) * 82}%`}} />
    ))}
  </div>
);

const RowCard: React.FC<{bg: string; icon: string; name: string; note?: string; noteBg?: string; noteColor?: string; w?: number; h?: number; dashed?: boolean; tickAt?: number; sub?: string}> = ({
  bg, icon, name, note, noteBg = C.tint, noteColor = C.blue, w = 860, h = 120, dashed, tickAt, sub,
}) => (
  <Card style={{width: w, height: h, padding: "0 34px", display: "flex", alignItems: "center", gap: 26, border: dashed ? "3px dashed rgba(77,124,255,.55)" : `1px solid ${C.border}`, background: dashed ? "rgba(255,255,255,.94)" : "#fff"}}>
    <Tile bg={bg} size={72}><span style={{fontFamily: mono, color: "#fff", fontSize: 26, fontWeight: 700}}>{icon}</span></Tile>
    <div style={{flex: 1, minWidth: 0}}>
      <div style={{fontFamily: mono, fontWeight: 700, fontSize: 34, color: C.ink, whiteSpace: "nowrap"}}>{name}</div>
      {sub && <div style={{fontWeight: 500, fontSize: 24, color: C.grey, marginTop: 2}}>{sub}</div>}
    </div>
    {note && <Pill bg={noteBg} color={noteColor} size={24}>{note}</Pill>}
    {tickAt !== undefined && <Tick at={tickAt} size={46} />}
  </Card>
);

/* ---------- canvas (LIGHT) ---------- */
const SPARKS: [number, number, number, number][] = [[90, 120, 34, 0], [930, 200, 26, 2], [60, 900, 28, 4], [980, 1050, 36, 1], [120, 1700, 30, 3], [920, 1730, 26, 5]];
const Canvas: React.FC = () => {
  const f = useCurrentFrame();
  const t = (f / config.durationInFrames) * Math.PI * 2;
  const blob = (size: number, color: string, style: React.CSSProperties) => (
    <div style={{position: "absolute", width: size, height: size, borderRadius: "50%", background: `radial-gradient(circle, ${color} 0%, rgba(0,0,0,0) 65%)`, ...style}} />
  );
  return (
    <AbsoluteFill style={{background: C.bg}}>
      {/* soft pastel blobs — same drift as the dark version, just pastel */}
      {blob(1300, C.blobA, {left: -480 + 100 * Math.sin(t * 3), top: -380 + 80 * Math.cos(t * 3)})}
      {blob(1300, C.blobB, {right: -520 + 90 * Math.cos(t * 3), bottom: -420 + 100 * Math.sin(t * 3)})}
      {blob(900, C.blobC, {left: 300 + 120 * Math.cos(t * 6), top: 800 + 150 * Math.sin(t * 6)})}
      {/* dot grid — dark dots on light, low opacity */}
      <AbsoluteFill style={{backgroundImage: "radial-gradient(rgba(28,27,34,.10) 2px, transparent 2px)", backgroundSize: "70px 70px", backgroundPosition: `${(f * 0.6) % 70}px ${(f * 0.9) % 70}px`, opacity: 0.6}} />
      {/* lime sparkles — slightly darker + a soft halo so they read on white */}
      {SPARKS.map(([x, y, s, ph], i) => (
        <svg key={i} width={s} height={s} viewBox="0 0 24 24" style={{position: "absolute", left: x, top: y, opacity: 0.45 + 0.4 * Math.max(0, Math.sin(f / 9 + ph)), transform: `scale(${0.8 + 0.3 * Math.sin(f / 9 + ph)}) rotate(${f * 1.5}deg)`, filter: `drop-shadow(0 0 10px ${C.limeGlow})`}}>
          <path d="M12 0C13 8 16 11 24 12C16 13 13 16 12 24C11 16 8 13 0 12C8 11 11 8 12 0Z" fill={C.lime} />
        </svg>
      ))}
    </AbsoluteFill>
  );
};

/* ---------- script ---------- */
type Beat = {a: number; b: number; tag: string; cap: string; vo: string};
const BEATS: Beat[] = [
  {a: 0, b: 3.25, tag: "The hook", cap: "Everyone says|*free.*", vo: "Everyone says free. Free this, free that."},
  {a: 3.25, b: 7.15, tag: "The usual catch", cap: "Then you see|*Claude Code.*", vo: "Then Claude Code. Pro only. Twenty dollars a month."},
  {a: 7.15, b: 11.85, tag: "The real receipt", cap: "Only *Claude* *web.*|Actually ~₹0.~", vo: "This reel used only Claude web. Free plan. Zero rupees."},
  {a: 11.85, b: 17.35, tag: "The stack", cap: "The whole|*stack.*", vo: "The stack: Claude web, a skill, ElevenLabs for voice, Remotion for code."},
  {a: 17.35, b: 22.35, tag: "Setup · 3 commands", cap: "Clone the|*repo.*", vo: "Clone the open source repo. Three commands: clone, install, run. Studio's live."},
  {a: 22.35, b: 28.1, tag: "The files", cap: "Just ~three~ files|do the *work.*", vo: "Three files do the real work. A style skill. The reel list. And the safe zone."},
  {a: 28.1, b: 35.6, tag: "Step 1 · Skill", cap: "Reference in,|*skill* out.", vo: "Step one: give Claude a reference reel, it writes the skill. No reference? It designs one."},
  {a: 35.6, b: 44.05, tag: "Step 2 · Claude web", cap: "Drop the files.|One *prompt.*", vo: "Step two: open Claude web. Drop in the skill, reel list, and safe zone. One prompt: hook first, one TSX. Send."},
  {a: 44.05, b: 51.35, tag: "Step 3 · Studio", cap: "Preview in|*Studio.*", vo: "Step three: preview it in Studio. Scrub the timeline, tweak any text, color, or timing you like."},
  {a: 51.35, b: 57.4, tag: "Step 3 · Voice", cap: "Add the|*voice.*", vo: "ElevenLabs adds the voice, also free. Paste the script, export the MP3, drop it in."},
  {a: 57.4, b: 63, tag: "Step 4 · Post", cap: "Check the|*safe* *zone.*", vo: "Step four: check the safe zone. Text inside, captions clear, overlay off. Then post."},
  {a: 63, b: 68.4, tag: "Open source", cap: "It's actually|*free.*", vo: "And yes, it's actually free. Link in bio, go build one."},
];

/* ---------- captions ---------- */
type Tok = {t: string; k?: "serif" | "mark"};
const parse = (s: string): Tok[][] =>
  s.split("|").map((line) =>
    line.trim().split(" ").map((w): Tok => {
      if (w.startsWith("*")) return {t: w.replace(/\*/g, ""), k: "serif"};
      if (w.startsWith("~")) return {t: w.replace(/~/g, ""), k: "mark"};
      return {t: w};
    })
  );

const Caption: React.FC<{text: string; dur: number}> = ({text, dur}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const lines = parse(text);
  const maxLen = Math.max(...lines.map((l) => l.map((x) => x.t).join(" ").length));
  const size = Math.min(100, SAFE.w / (maxLen * 0.52));
  const out = interpolate(f, [dur, dur + EXIT], [1, 0], clamp);
  let n = 0;
  return (
    <div style={{position: "absolute", left: SAFE.left, width: SAFE.w, top: CAP_TOP, height: CAP_H, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center",
      fontFamily: sans, fontWeight: 800, letterSpacing: "-0.02em", fontSize: size, lineHeight: 1.1, color: C.ink, textAlign: "center", opacity: out,
      filter: `blur(${(1 - out) * 12}px)`, textShadow: "0 4px 20px rgba(255,255,255,.6)"}}>
      {lines.map((ws, li) => (
        <div key={li} style={{display: "flex", gap: size * 0.26, justifyContent: "center", whiteSpace: "nowrap"}}>
          {ws.map((w, wi) => {
            const i = n++;
            const p = spring({frame: f - (2 + i * 6), fps, config: {damping: 9, stiffness: 190, mass: 0.6}});
            const accent: React.CSSProperties =
              w.k === "serif" ? {fontFamily: serif, fontStyle: "italic", fontWeight: 400, color: C.coral, fontSize: size * 1.16, letterSpacing: 0}
              : w.k === "mark" ? {color: C.ink, background: C.lime, padding: "0 .22em", borderRadius: ".22em", textShadow: "none"} : {};
            return (
              <span key={wi} style={{display: "inline-block", opacity: Math.min(1, p * 2), filter: `blur(${Math.max(0, 1 - p) * 6}px)`,
                transform: `translateY(${(1 - p) * 40}px) scale(${0.6 + 0.4 * p}) ${w.k === "mark" ? "rotate(-2deg)" : ""}`, ...accent}}>{w.t}</span>
            );
          })}
        </div>
      ))}
    </div>
  );
};

/* ---------- scene plumbing ---------- */
const Fade: React.FC<{dur: number; children: React.ReactNode}> = ({dur, children}) => {
  const f = useCurrentFrame();
  const o = interpolate(f, [dur, dur + EXIT], [1, 0], clamp);
  const punch = interpolate(f, [0, 12], [1.05, 1], {...clamp, easing: easeOut});
  return <AbsoluteFill style={{opacity: o, filter: `blur(${(1 - o) * 10}px)`, transform: `scale(${punch})`}}>{children}</AbsoluteFill>;
};
const Part: React.FC<{from: number; dur: number; children: React.ReactNode}> = ({from, dur, children}) => (
  <Sequence from={from} durationInFrames={dur + EXIT}><Fade dur={dur}>{children}</Fade></Sequence>
);
const Zone: React.FC<{children: React.ReactNode}> = ({children}) => (
  <div style={{position: "absolute", left: SAFE.left, top: HERO_TOP, width: SAFE.w, height: HERO_H}}>{children}</div>
);
const Tag: React.FC<{text: string}> = ({text}) => (
  <div style={{position: "absolute", left: SAFE.left, width: SAFE.w, top: TAG_TOP, display: "flex", justifyContent: "center"}}>
    <Pop delay={6} y={24}>
      <div style={{display: "flex", alignItems: "center", gap: 16, background: "rgba(255,255,255,.85)", border: "1px solid rgba(28,27,34,.10)", boxShadow: SHADOW, borderRadius: 999, padding: "16px 34px", fontFamily: sans, fontWeight: 600, fontSize: 30, color: C.ink}}>
        <span style={{width: 14, height: 14, borderRadius: 7, background: C.coral, boxShadow: `0 0 16px ${C.coral}`}} />
        {text}
      </div>
    </Pop>
  </div>
);

const FinePrint: React.FC = () => {
  const f = useCurrentFrame();
  const o = ramp(f, sec(warp(7.6)), sec(warp(8.4)));
  return (
    <div style={{position: "absolute", left: SAFE.left, width: SAFE.w, top: FINE_TOP, textAlign: "center", fontFamily: mono, fontSize: 20, letterSpacing: ".04em", color: "rgba(28,27,34,.55)", opacity: o}}>
      free-tier limits · Claude resets every 5 hrs · ElevenLabs ≈ 10 min voice / month
    </div>
  );
};

/* ============================== PIP ============================== */
const k = (s: number, x: number, y: number, sc = 1, r = 0): [number, number, number, number, number] => [sec(warp(s)), x, y, sc, r];
const PATH = [
  k(0, 150, 1430, 1, -4), k(2.2, 170, 1430, 1, -4),
  k(3.4, 540, 1420, 1.1, 0), k(5, 860, 1430, 1, 8), k(7.2, 860, 1430, 1, 8),
  k(7.7, 540, 1390, 1.2, 0), k(9.2, 540, 1420, 1.1, 0), k(11.4, 160, 1430, 1, -8),
  k(13.2, 520, 1430, 1, 0), k(15.6, 860, 1430, 1, 8), k(17, 860, 1430, 1, 8),
  k(18.6, 300, 1430, 1, -8), k(20.6, 520, 1420, 1, 0), k(23, 860, 1430, 1, 8),
  k(25.2, 540, 1430, 1, 0), k(27.6, 160, 1430, 1, -8), k(30.2, 520, 1430, 1, 0),
  k(33.2, 860, 1430, 1, 8), k(35, 700, 1430, 1, 4), k(37, 160, 1430, 1, -8),
  k(40, 860, 1430, 1, 8), k(43, 540, 1420, 1.1, 0), k(45.5, 160, 1430, 1, -8),
  k(49, 700, 1430, 1, 4), k(51.4, 300, 1420, 1.05, 0), k(54, 860, 1430, 1, 8),
  k(56.6, 540, 1420, 1.05, 0), k(58.4, 160, 1430, 1, -8), k(60.6, 860, 1430, 1, 8),
  k(62.4, 540, 1390, 1.3, 0), k(64.4, 540, 1420, 1.2, 0), k(68, 540, 1420, 1.25, 0),
];
type Mood = "smile" | "wow" | "focus" | "cheer" | "worry" | "love";
const MOODS: [number, Mood][] = [
  [0, "focus"], [3.4, "worry"], [7.4, "cheer"], [9.6, "smile"], [16.5, "focus"], [22, "smile"], [28, "focus"],
  [31, "smile"], [35, "smile"], [38, "focus"], [44, "wow"], [47, "smile"], [51, "cheer"], [54, "smile"],
  [57, "focus"], [60.4, "smile"], [63, "love"], [66, "cheer"],
].map(([s, m]) => [sec(warp(s as number)), m as Mood]);

const ease = Easing.inOut(Easing.cubic);
const samplePath = (f: number) => {
  if (f <= PATH[0][0]) return {x: PATH[0][1], y: PATH[0][2], s: PATH[0][3], r: PATH[0][4]};
  for (let i = 0; i < PATH.length - 1; i++) {
    if (f <= PATH[i + 1][0]) {
      const [f0, x0, y0, s0, r0] = PATH[i];
      const [f1, x1, y1, s1, r1] = PATH[i + 1];
      const t = (f - f0) / (f1 - f0);
      const e = ease(t);
      const hop = 4 * t * (1 - t) * Math.min(55, Math.hypot(x1 - x0, y1 - y0) * 0.1);
      return {x: x0 + (x1 - x0) * e, y: y0 + (y1 - y0) * e - hop, s: s0 + (s1 - s0) * e, r: r0 + (r1 - r0) * e};
    }
  }
  const l = PATH[PATH.length - 1];
  return {x: l[1], y: l[2], s: l[3], r: l[4]};
};

const PIP_W = "#FFF6EC";
const lidStyle = (w = 11) => ({stroke: PIP_W, strokeWidth: w, strokeLinecap: "round" as const, fill: "none"});
const HEART = "M0 7 C-15 -4 -11 -15 0 -8 C11 -15 15 -4 0 7Z";

const PipFace: React.FC<{mood: Mood; f: number; look: number; lookY: number}> = ({mood, f, look, lookY}) => {
  const L = 118, R = 182, y = 122;
  const blink = f % 96 < 4 ? 0.1 : 1;
  const pulse = 1 + 0.025 * Math.sin(f / 10);
  let face: React.ReactNode;
  switch (mood) {
    case "wow":
      face = (<><circle cx={L} cy={y} r={17} fill={PIP_W} /><circle cx={R} cy={y} r={17} fill={PIP_W} />
        <circle cx={L + 5 + look * 4} cy={y - 6 + lookY * 3} r={5.5} fill="#0c0b12" /><circle cx={R + 5 + look * 4} cy={y - 6 + lookY * 3} r={5.5} fill="#0c0b12" />
        <ellipse cx={150} cy={158} rx={9} ry={11} fill={PIP_W} /></>);
      break;
    case "focus":
      face = (<><path d={`M100 ${y + 2} L134 ${y - 3}`} {...lidStyle()} /><path d={`M166 ${y - 3} L200 ${y + 2}`} {...lidStyle()} /><path d="M135 158 H165" {...lidStyle(7)} /></>);
      break;
    case "cheer":
      face = (<><path d={`M99 ${y + 10} Q${L} ${y - 22} 137 ${y + 10}`} {...lidStyle()} /><path d={`M163 ${y + 10} Q${R} ${y - 22} 201 ${y + 10}`} {...lidStyle()} /><path d="M126 146 Q150 178 174 146 Z" fill={PIP_W} /></>);
      break;
    case "worry":
      face = (<><circle cx={L + look * 3} cy={y + 4} r={11} fill={PIP_W} /><circle cx={R + look * 3} cy={y + 4} r={11} fill={PIP_W} />
        <path d={`M98 ${y - 18} L136 ${y - 28}`} {...lidStyle(6)} /><path d={`M164 ${y - 28} L202 ${y - 18}`} {...lidStyle(6)} />
        <path d="M134 162 Q142 152 150 160 T166 160" {...lidStyle(6)} /></>);
      break;
    case "love":
      face = (<><g transform={`translate(${L} ${y}) scale(${1.9 * pulse})`}><path d={HEART} fill="#FF7A9C" /></g><g transform={`translate(${R} ${y}) scale(${1.9 * pulse})`}><path d={HEART} fill="#FF7A9C" /></g>
        <path d="M134 150 Q150 166 166 150" {...lidStyle(7)} /></>);
      break;
    default:
      face = (<><path d={`M100 ${y + 8} Q${L} ${y - 16} 136 ${y + 8}`} {...lidStyle()} /><path d={`M164 ${y + 8} Q${R} ${y - 16} 200 ${y + 8}`} {...lidStyle()} /><path d="M138 150 Q150 160 162 150" {...lidStyle(6)} /></>);
  }
  return <g transform={`translate(${look * 4} ${lookY * 3}) translate(0 ${y}) scale(1 ${blink}) translate(0 ${-y})`}>{face}</g>;
};

const ARM_R: Record<Mood, number> = {cheer: -6, love: 14, wow: -14, smile: 34, focus: 60, worry: 56};
const ARM_L: Record<Mood, number> = {cheer: 62, love: 28, wow: 46, smile: 4, focus: -10, worry: 40};
const TILT: Record<Mood, number> = {cheer: 0, love: 6, wow: 0, smile: 0, focus: 0, worry: -5};

const PipArt: React.FC<{mood: Mood; f: number; vx: number; look: number; lookY: number}> = ({mood, f, vx, look, lookY}) => {
  const lively = mood === "cheer" || mood === "love";
  const armR = ARM_R[mood] + (lively ? Math.sin(f / 16) * 6 : Math.sin(f / 22) * 2);
  const armL = ARM_L[mood] + Math.sin(f / 24) * 2;
  const capeSkew = Math.max(-7, Math.min(7, -vx * 0.25)) + Math.sin(f / 18) * 1.2;
  const antRot = Math.sin(f / 20) * 2;
  const tilt = TILT[mood] * 0.6;
  const cheek = lively ? 0.6 : 0.38;
  return (
    <svg width={220} height={249} viewBox="0 0 300 340" style={{position: "absolute", left: 0, top: 0, overflow: "visible"}}>
      <defs>
        <radialGradient id="pipSkin" cx=".3" cy=".22" r="1"><stop offset="0" stopColor="#FFEADF" /><stop offset=".55" stopColor="#F3CDBE" /><stop offset="1" stopColor="#D9A08E" /></radialGradient>
        <radialGradient id="pipSkinB" cx=".3" cy=".2" r="1"><stop offset="0" stopColor="#FBE0D3" /><stop offset=".6" stopColor="#EDBFAE" /><stop offset="1" stopColor="#D49884" /></radialGradient>
        <linearGradient id="pipVisor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#2d2a37" /><stop offset=".5" stopColor="#14131b" /><stop offset="1" stopColor="#0a0910" /></linearGradient>
        <linearGradient id="pipScarf" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#FFA063" /><stop offset="1" stopColor="#E8601F" /></linearGradient>
        <linearGradient id="pipCape" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#F58443" /><stop offset="1" stopColor="#E8601F" /></linearGradient>
        <filter id="pipGlow" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="3" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
      </defs>
      <g transform={`translate(150 204) skewX(${capeSkew}) translate(-150 -204)`}>
        <path d="M86 204 Q34 252 44 322 Q74 300 100 324 Q126 302 150 326 Q174 302 200 324 Q226 300 256 322 Q266 252 214 204 Z" fill="url(#pipCape)" />
        <path d="M100 214 Q72 262 80 314 Q104 298 124 316 Q116 262 118 218 Z" fill="#B8420F" opacity={0.35} />
        <path d="M200 214 Q228 262 220 314 Q196 298 176 316 Q184 262 182 218 Z" fill="#B8420F" opacity={0.35} />
      </g>
      <g transform={`rotate(${armL} 100 238)`}>
        <path d="M100 238 Q62 250 52 276" stroke="#E7B7A5" strokeWidth={32} strokeLinecap="round" fill="none" />
        <path d="M100 232 Q64 243 54 266" stroke="#F8D9CB" strokeWidth={9} strokeLinecap="round" fill="none" opacity={0.7} />
      </g>
      <ellipse cx={150} cy={252} rx={62} ry={58} fill="url(#pipSkinB)" />
      <ellipse cx={124} cy={232} rx={20} ry={9} fill="#fff" opacity={0.35} transform="rotate(-24 124 232)" />
      <g transform={`rotate(${armR} 200 232)`}>
        <path d="M200 232 Q238 226 252 184" stroke="#E7B7A5" strokeWidth={32} strokeLinecap="round" fill="none" />
        <path d="M200 226 Q236 220 248 186" stroke="#F8D9CB" strokeWidth={9} strokeLinecap="round" fill="none" opacity={0.7} />
      </g>
      <path d="M84 196 Q150 238 216 196 L224 224 Q150 266 76 224 Z" fill="url(#pipScarf)" />
      <path d="M92 204 Q150 240 208 204" stroke="#FFC08F" strokeWidth={4} fill="none" strokeLinecap="round" opacity={0.7} />
      <g transform={`rotate(${tilt} 150 214)`}>
        <g transform={`rotate(${antRot} 150 42)`}>
          <line x1={150} y1={42} x2={150} y2={22} stroke="#D9A08E" strokeWidth={7} strokeLinecap="round" />
          <circle cx={150} cy={18} r={10} fill="#FF7A3D" /><circle cx={147} cy={15} r={3.5} fill="#FFC08F" />
        </g>
        <rect x={40} y={38} width={220} height={176} rx={84} fill="url(#pipSkin)" />
        <ellipse cx={96} cy={62} rx={38} ry={11} fill="#fff" opacity={0.45} transform="rotate(-16 96 62)" />
        <rect x={62} y={64} width={176} height={118} rx={58} fill="url(#pipVisor)" />
        <path d="M86 78 Q130 66 172 74" stroke="#fff" strokeWidth={4} strokeLinecap="round" fill="none" opacity={0.16} />
        <g filter="url(#pipGlow)"><PipFace mood={mood} f={f} look={look} lookY={lookY} /></g>
        <ellipse cx={80} cy={156} rx={11} ry={6} fill="#FF6B8A" opacity={cheek} />
        <ellipse cx={220} cy={156} rx={11} ry={6} fill="#FF6B8A" opacity={cheek} />
        {mood === "worry" && <path d="M240 70 Q250 90 240 98 Q230 90 240 70Z" fill="#7DB8FF" />}
      </g>
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
    <div style={{position: "absolute", left: p.x - 110, top: p.y - 150 + bob, width: 220, height: 249, zIndex: 50, pointerEvents: "none", transformOrigin: "50% 90%",
      transform: `rotate(${p.r * 0.3 + Math.max(-4, Math.min(4, vx * 0.15))}deg) scale(${p.s * (1 - stretch * 0.6)}, ${p.s * (1 + stretch)})`, filter: "drop-shadow(0 20px 24px rgba(28,27,34,.22))"}}>
      <PipArt mood={mood} f={f} vx={vx} look={look} lookY={lookY} />
    </div>
  );
};

/* ============================ HERO SCENES ============================ */
const FreeChip: React.FC<{text: string}> = ({text}) => (
  <Card style={{padding: "14px 34px", borderRadius: 28}}>
    <span style={{fontWeight: 800, fontSize: 54, color: C.ink, letterSpacing: "-0.02em"}}>{text}</span>
    <span style={{fontWeight: 800, fontSize: 54, color: C.coral}}>*</span>
  </Card>
);
const Hero1: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <Zone>
      <At x={30} y={30} rot={-6} delay={4} dy={120}><FreeChip text="100% FREE" /></At>
      <At x={440} y={0} rot={5} delay={14} dy={120} phase={10}><FreeChip text="Free forever" /></At>
      <At x={60} y={190} rot={-3} delay={24} dy={120} phase={20}><FreeChip text="No credit card" /></At>
      <At x={500} y={210} rot={4} delay={34} dy={120} phase={30}><FreeChip text="Free AI video" /></At>
      <At x={20} y={380} rot={3} delay={44} dy={120} phase={40}><FreeChip text="Unlimited" /></At>
      <At x={420} y={400} rot={-4} delay={54} dy={120} phase={50}><FreeChip text="Free trial" /></At>
      <div style={{position: "absolute", left: 0, right: 0, top: 570, textAlign: "center", fontFamily: mono, fontSize: 28, letterSpacing: ".12em", color: C.coral, opacity: ramp(f, 66, 80)}}>* TERMS APPLY</div>
      <Burst delay={8} x={480} y={300} n={14} />
    </Zone>
  );
};

const Hero2: React.FC = () => {
  const f = useCurrentFrame();
  const strike = ramp(f, 52, 70);
  return (
    <Zone>
      <At x={40} y={50} rot={-2} delay={4} dy={100}>
        <Card style={{width: 880, padding: "40px 44px"}}>
          <div style={{display: "flex", alignItems: "center", gap: 28}}>
            <Tile bg={C.ink} size={120}><span style={{fontFamily: mono, color: C.lime, fontSize: 46, fontWeight: 700}}>&gt;_</span></Tile>
          <div style={{position: "relative", display: "inline-block"}}>
  <Mono size={20}>The usual</Mono>
  <div style={{
    position: "relative",
    display: "inline-block",
    fontWeight: 800,
    fontSize: 84,
    color: strike > 0.5 ? C.grey : C.ink,
    letterSpacing: "-0.03em",
    lineHeight: 1.05,
  }}>
    Claude Code
    <div style={{
      position: "absolute",
      left: 0,
      top: "50%",
      transform: "translateY(-50%)",
      height: 8,                 // or reduce to 6 for a slimmer strike
      borderRadius: 4,
      background: C.red,
      width: `${strike * 100}%`,
      pointerEvents: "none",
    }} />
  </div>
</div>
          </div>
          <div style={{display: "flex", gap: 16, marginTop: 30}}>
            <Pill bg="#FDE3E4" color={C.red} size={30}>Needs Pro</Pill>
            <Pill bg="#FDE3E4" color={C.red} size={30}>$20 / month</Pill>
          </div>
        </Card>
      </At>
      <At x={150} y={400} rot={2} delay={30} dy={100} phase={20}>
        <Card style={{padding: "24px 40px", borderRadius: 30, display: "flex", alignItems: "center", gap: 20}}>
          <Cross size={56} />
          <div style={{fontWeight: 800, fontSize: 42, color: C.ink}}>Not on the free plan</div>
        </Card>
      </At>
      <At x={620} y={-10} rot={8} delay={16} dy={-60} z={6}><Badge text="The catch" delay={0} rot={0} bg={C.coral} color="#fff" size={32} /></At>
    </Zone>
  );
};

const Hero3: React.FC = () => {
  const f = useCurrentFrame();
  const lines: [string, string, number, boolean][] = [["Claude web · Free plan", "₹0", 12, false], ["ElevenLabs · Free plan", "₹0", 26, false], ["Claude Code", "not used", 40, true]];
  return (
    <Zone>
      <At x={90} y={20} rot={-2} delay={4} dy={100} amp={5}>
        <Card style={{width: 780, padding: "30px 40px 34px"}}>
          <div style={{display: "flex", justifyContent: "space-between", alignItems: "center"}}>
            <Mono size={20}>Receipt · this reel</Mono><Mono size={16}>no card on file</Mono>
          </div>
          <div style={{height: 1, background: C.border, margin: "18px 0 8px"}} />
          {lines.map(([n, p, t, dim]) => {
            const o = ramp(f, t, t + 12);
            return (
              <div key={n} style={{display: "flex", justifyContent: "space-between", alignItems: "center", height: 66, opacity: o, transform: `translateX(${(1 - o) * -20}px)`, fontWeight: 700, fontSize: 32, color: dim ? C.grey : C.ink}}>
                <span>{n}</span><span style={{fontFamily: mono}}>{p}</span>
              </div>
            );
          })}
          <div style={{height: 2, background: C.ink, margin: "10px 0 14px", opacity: ramp(f, 54, 62)}} />
          <div style={{display: "flex", justifyContent: "space-between", alignItems: "baseline", opacity: ramp(f, 54, 70)}}>
            <span style={{fontWeight: 700, fontSize: 34}}>Total</span>
            <span style={{fontWeight: 800, fontSize: 110, letterSpacing: "-0.04em"}}>₹0.00</span>
          </div>
        </Card>
      </At>
      <At x={560} y={-30} rot={8} delay={76} dy={-60} z={6}><Badge text="ACTUALLY FREE" delay={0} rot={0} /></At>
      <At x={60} y={520} rot={-3} delay={96} dy={80} z={4}>
        <Card style={{padding: "16px 30px", borderRadius: 26, display: "flex", alignItems: "center", gap: 16}}>
          <Cross size={44} /><div style={{fontWeight: 700, fontSize: 30, color: C.ink}}>Claude Code · not used</div>
        </Card>
      </At>
      <Burst delay={78} x={720} y={30} n={22} />
    </Zone>
  );
};

const Hero4: React.FC = () => (
  <Zone>
    <At x={50} y={0} rot={-2} delay={4} dx={-300} dy={0}><RowCard bg={C.blue} icon="AI" name="Claude web" note="free plan" /></At>
    <At x={50} y={140} rot={2} delay={22} dx={300} dy={0} phase={15}><RowCard bg={C.violet} icon="SK" name="Skill + one prompt" note="free" /></At>
    <At x={50} y={280} rot={-1.5} delay={40} dx={-300} dy={0} phase={30}><RowCard bg={C.coral} icon="EL" name="ElevenLabs voice" note="free plan" /></At>
    <At x={50} y={420} rot={2} delay={58} dx={300} dy={0} phase={45}><RowCard bg={C.ink} icon="</>" name="Reel code (React)" note="open source" /></At>
    <At x={230} y={575} rot={-1} delay={84} dy={40} z={3}>
      <div style={{display: "flex", alignItems: "center", gap: 14}}>
        <Cross size={44} /><span style={{fontWeight: 800, fontSize: 34, color: C.ink}}>Claude Code · not used</span>
      </div>
    </At>
  </Zone>
);

const Hero5: React.FC = () => {
  const f = useCurrentFrame();
  const cmds: [string, number, string][] = [["git clone optionxi-reels", 24, "✓ cloned"], ["npm install", 70, "✓ packages installed"], ["npm run dev", 116, "▸ Studio on localhost:3000"]];
  const active = f < 70 ? 0 : f < 116 ? 1 : 2;
  return (
    <Zone>
      <At x={40} y={0} rot={-1.5} delay={2} dy={90} amp={4}>
        <Card style={{width: 880, padding: "26px 32px", display: "flex", alignItems: "center", gap: 20}}>
          <Tile bg={C.ink} size={70}><span style={{fontFamily: mono, color: "#fff", fontSize: 28}}>{"</>"}</span></Tile>
          <div style={{flex: 1}}>
            <div style={{fontFamily: mono, fontSize: 18, color: C.grey}}>optionxi /</div>
            <div style={{fontWeight: 800, fontSize: 46, color: C.ink, letterSpacing: "-0.02em"}}>optionxi-reels</div>
          </div>
          <Pill bg={C.tint} color={C.blue} size={22}>Public</Pill><Pill bg={C.soft} color={C.ink} size={22}>Open source</Pill>
        </Card>
      </At>
      <At x={40} y={200} rot={1} delay={14} dy={90} amp={4} phase={20}>
        <div style={{width: 880, height: 320, boxSizing: "border-box", borderRadius: 30, background: C.dark, border: "1px solid rgba(255,255,255,.14)", boxShadow: SHADOW_BIG, padding: "20px 32px", fontFamily: mono, fontSize: 26, color: C.darkText, lineHeight: 1.55}}>
          <div style={{display: "flex", gap: 9, marginBottom: 10}}>{[0, 1, 2].map((i) => <span key={i} style={{width: 13, height: 13, borderRadius: "50%", background: "rgba(230,234,245,.25)"}} />)}</div>
          {cmds.map(([c, t, o]) => f >= t && (
            <div key={c}>
              <div><span style={{color: "#8FB0FF"}}>$ </span>{typeText(c, f, t, 1.3)}</div>
              {f > t + c.length * 1.3 + 8 && <div style={{color: C.lime}}>{o}</div>}
            </div>
          ))}
        </div>
      </At>
      <div style={{position: "absolute", left: 0, right: 0, top: 550, display: "flex", justifyContent: "center", gap: 16}}>
        {["1 · clone", "2 · install", "3 · run"].map((l, i) => (
          <Pop key={l} delay={30 + i * 8} y={16}>
            <Pill bg={i === active ? C.coral : C.soft} color={i === active ? "#fff" : C.ink} size={30}>{l}</Pill>
          </Pop>
        ))}
      </div>
    </Zone>
  );
};

const Hero6: React.FC = () => (
  <Zone>
    <At x={50} y={0} rot={-1.5} delay={6} dx={-260} dy={0}><RowCard bg={C.violet} icon="md" name="reel-style-skill.md" note="style skill" tickAt={40} /></At>
    <At x={50} y={150} rot={1.5} delay={30} dx={260} dy={0} phase={20}><RowCard bg={C.blue} icon="tsx" name="Root.tsx" note="reel list" tickAt={64} /></At>
    <At x={50} y={300} rot={-1.5} delay={54} dx={-260} dy={0} phase={40}><RowCard bg={C.coral} icon="tsx" name="safe-area.tsx" note="safe zone" tickAt={88} /></At>
    <At x={50} y={450} rot={1} delay={90} dy={70} phase={60}><RowCard bg={C.grey} icon="tsx" name="reference.tsx" note="optional" noteBg="#EEF1F8" noteColor={C.grey} dashed sub="nice to have, not required" /></At>
    <Burst delay={90} x={480} y={440} n={14} />
  </Zone>
);

const Hero7: React.FC = () => {
  const f = useCurrentFrame();
  const md = ["name: reel-style-skill", "format: 9:16 · 1080×1920", "palette · type · motion", "safe zone · hook first"];
  const arrow = ramp(f, 70, 84);
  return (
    <Zone>
      <At x={40} y={0} rot={-1} delay={2} dy={80} amp={3}>
        <div style={{width: 880, height: 124, boxSizing: "border-box", borderRadius: 28, background: C.dark, border: "1px solid rgba(255,255,255,.14)", boxShadow: SHADOW, padding: "18px 32px", fontFamily: mono, fontSize: 26, color: C.darkText}}>
          <div style={{display: "flex", gap: 9, marginBottom: 12}}>{[0, 1, 2].map((i) => <span key={i} style={{width: 13, height: 13, borderRadius: "50%", background: "rgba(230,234,245,.25)"}} />)}</div>
          <span style={{color: "#8FB0FF"}}>$ </span>{typeText('yt-dlp "<reel-url>" -o reference.mp4', f, 14, 1)}{f < 60 && <Caret h={26} />}
        </div>
      </At>
      <At x={20} y={170} rot={-3} delay={58} dy={90} phase={10}>
        <Card style={{width: 280, height: 300, padding: 24, textAlign: "center"}}>
          <div style={{height: 170, borderRadius: 20, background: `linear-gradient(135deg, ${C.tint}, #AFC4FF)`, display: "flex", alignItems: "center", justifyContent: "center"}}>
            <div style={{width: 0, height: 0, borderTop: "26px solid transparent", borderBottom: "26px solid transparent", borderLeft: "42px solid #fff"}} />
          </div>
          <div style={{fontFamily: mono, fontSize: 24, fontWeight: 700, marginTop: 22, color: C.ink}}>reference.mp4</div>
        </Card>
      </At>
      <div style={{position: "absolute", left: 310, top: 260, width: 110, textAlign: "center", opacity: arrow, zIndex: 3}}>
        <div style={{fontWeight: 800, fontSize: 26, color: C.coral}}>Claude</div>
        <div style={{fontSize: 56, color: C.coral, lineHeight: 1, transform: `translateX(${(1 - arrow) * -14}px)`}}>→</div>
      </div>
      <At x={430} y={170} rot={3} delay={88} dy={90} phase={30}>
        <Card style={{width: 500, height: 300, padding: "30px 32px"}}>
          <div style={{fontFamily: mono, fontSize: 25, fontWeight: 700, color: C.ink}}>reel-style-skill.md</div>
          <div style={{height: 1, background: C.border, margin: "16px 0"}} />
          {md.map((l, i) => {
            const p = ramp(f, 100 + i * 12, 112 + i * 12);
            return <div key={l} style={{fontFamily: mono, fontSize: 22, lineHeight: 1.9, color: "#4A5068", opacity: p, transform: `translateY(${(1 - p) * 10}px)`}}>{l}</div>;
          })}
        </Card>
      </At>
      <At x={130} y={520} rot={-1} delay={140} dy={60} z={4}>
        <div style={{padding: "16px 34px", borderRadius: 999, border: `3px dashed ${C.coral}`, background: "rgba(244,113,79,.08)", fontWeight: 700, fontSize: 30, color: C.coral, whiteSpace: "nowrap"}}>
          No reference? Claude designs it pro.
        </div>
      </At>
    </Zone>
  );
};

const PROMPT = "use the skill + these files. hook first, then one TSX. instagram safe area.";
const Hero8: React.FC = () => {
  const f = useCurrentFrame();
  const send = interpolate(f, [190, 194, 200], [1, 0.88, 1], clamp);
  const sent = f >= 196;
  return (
    <Zone>
      <At x={40} y={0} rot={-1} delay={2} dy={90} amp={4}>
        <Browser url="claude.ai/new" h={600}>
          {!sent && <div style={{position: "absolute", top: 36, left: 0, right: 0, textAlign: "center", fontWeight: 800, fontSize: 52, color: C.ink}}>What are we making?</div>}
          {sent && (
            <Pop delay={198} y={20} style={{position: "absolute", top: 30, left: 40, right: 40, display: "flex", alignItems: "center", gap: 22}}>
              <div style={{width: 64, height: 64, borderRadius: 32, background: "#E8765A", flexShrink: 0}} />
              <div>
                <div style={{fontWeight: 700, fontSize: 30, color: C.ink}}>Here's your hook, then the TSX.</div>
                <div style={{marginTop: 10}}><FileChip name="Reel-Free.tsx" w={300} /></div>
              </div>
            </Pop>
          )}
          <div style={{position: "absolute", left: 36, top: 130, width: 808, height: 330, borderRadius: 28, background: "#FAFBFE", border: `1px solid ${C.border}`, boxShadow: "0 10px 30px rgba(28,27,34,0.06)"}} />
          <div style={{position: "absolute", left: 60, top: 154, display: "flex", gap: 16}}>
            {["reel-skill.md", "Root.tsx", "safe-area.tsx"].map((n, i) => {
              const t = ramp(f, 20 + i * 24, 40 + i * 24);
              return <div key={n} style={{opacity: t, transform: `translateY(${(1 - t) * -50}px)`}}><FileChip name={n} /></div>;
            })}
          </div>
          {f > 100 && (
            <div style={{position: "absolute", left: 60, top: 240, width: 700, fontSize: 28, lineHeight: 1.4, color: C.ink, fontWeight: 500}}>
              {typeText(PROMPT, f, 100, 1.1)}{f < 190 && <Caret h={28} />}
            </div>
          )}
          <div style={{position: "absolute", left: 764, top: 378, width: 64, height: 64, borderRadius: 32, background: C.ink, color: "#fff", fontSize: 34, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${send})`}}>↑</div>
          <Cursor from={[640, 500]} to={[780, 400]} start={170} end={190} />
        </Browser>
      </At>
      <Burst delay={200} x={480} y={200} n={18} />
    </Zone>
  );
};

const TRACKS: [string, [number, number][]][] = [["Captions", [[0, 22], [24, 18], [44, 24], [70, 26]]], ["Hero", [[0, 30], [32, 26], [60, 40]]], ["Pip", [[0, 100]]]];
const TRACK_COL = [C.blue, "#9DB8F0", C.coral];
const Hero9: React.FC = () => {
  const f = useCurrentFrame();
  const play = interpolate(f, [30, 190], [0.04, 0.94], clamp);
  return (
    <Zone>
      <At x={40} y={10} rot={1} delay={2} dy={90} amp={4}>
        <Browser url="localhost:3000/FreeReel" h={590}>
          <div style={{display: "flex", height: 340}}>
            <div style={{width: 210, borderRight: `1px solid ${C.border}`, background: "#FAFBFE", padding: "22px 16px"}}>
              <Mono size={14}>Compositions</Mono>
              <div style={{fontFamily: mono, fontSize: 22, fontWeight: 700, background: C.tint, borderRadius: 10, padding: "9px 12px", marginTop: 14, color: C.ink}}>FreeReel</div>
              <div style={{fontFamily: mono, fontSize: 22, color: C.grey, padding: "9px 12px"}}>OpenSource</div>
            </div>
            <div style={{flex: 1, display: "flex", alignItems: "center", justifyContent: "center"}}>
              <div style={{position: "relative", width: 170, height: 302, borderRadius: 18, background: C.bg, overflow: "hidden", boxShadow: SHADOW, border: `1px solid ${C.border}`}}>
                <div style={{position: "absolute", left: 10, right: 10, top: 40, bottom: 54, border: "2px dashed rgba(242,83,90,.8)", textAlign: "center", paddingTop: 12, fontWeight: 800, fontSize: 24, color: C.ink, lineHeight: 1.1}}>
                  Everyone<br />says <span style={{fontFamily: serif, fontStyle: "italic", fontWeight: 400, color: C.coral, fontSize: 30}}>free.</span>
                </div>
                <div style={{position: "absolute", left: 50, bottom: 70, width: 70, height: 70, borderRadius: 35, background: C.coral, opacity: 0.9, transform: `translateY(${Math.sin(f / 8) * -5}px)`}} />
              </div>
            </div>
          </div>
          <div style={{padding: "14px 28px 0"}}>
            <div style={{position: "relative"}}>
              {TRACKS.map(([name, blocks], ti) => (
                <div key={name} style={{position: "relative", height: 40, marginBottom: 12}}>
                  <div style={{position: "absolute", left: 0, top: 8, width: 100, fontFamily: mono, fontSize: 16, color: C.grey}}>{name}</div>
                  <div style={{position: "absolute", left: 100, right: 0, top: 0, height: 36}}>
                    {blocks.map(([s, w], bi) => (
                      <div key={bi} style={{position: "absolute", top: 0, height: 36, borderRadius: 8, left: `${s}%`, width: `${w}%`, background: TRACK_COL[ti], opacity: 0.92}} />
                    ))}
                  </div>
                </div>
              ))}
              <div style={{position: "absolute", top: -8, bottom: 0, width: 3, borderRadius: 2, background: C.red, left: `calc(100px + (100% - 100px) * ${play})`}} />
            </div>
          </div>
        </Browser>
      </At>
    </Zone>
  );
};

const Hero10: React.FC = () => {
  const f = useCurrentFrame();
  const script: [string, string][] = [["0:00", "Everyone says free."], ["0:03", "Then you see Claude Code."], ["0:07", "This one's only Claude web."]];
  const bar = ramp(f, 100, 140);
  return (
    <Zone>
      <At x={40} y={10} rot={-1.5} delay={2} dy={90} amp={4}>
        <Card style={{width: 880, height: 270, padding: "28px 36px"}}>
          <div style={{display: "flex", justifyContent: "space-between", alignItems: "center"}}>
            <div style={{fontWeight: 800, fontSize: 40, color: C.ink}}>ElevenLabs</div>
            <Mono size={16}>Free plan · 10k credits / mo</Mono>
          </div>
          <div style={{display: "flex", alignItems: "center", gap: 28, marginTop: 16}}>
            <div style={{flex: 1}}>
              {script.map(([t, l], i) => {
                const p = ramp(f, 16 + i * 14, 28 + i * 14);
                return <div key={t} style={{fontFamily: mono, fontSize: 23, lineHeight: 1.9, opacity: p, color: C.ink}}><span style={{color: C.blue, fontWeight: 700}}>{t}</span>  {l}</div>;
              })}
            </div>
            <Wave f={f} />
          </div>
        </Card>
      </At>
      <At x={560} y={290} rot={4} delay={80} dy={-60} z={5}><FileChip name="voice.mp3" w={300} fs={24} /></At>
      <At x={40} y={370} rot={1} delay={96} dy={80} amp={4} phase={20}>
        <Card style={{width: 880, height: 170, padding: "24px 36px"}}>
          <Mono size={16}>Studio · timeline</Mono>
          <div style={{position: "relative", height: 36, marginTop: 20}}>
            <div style={{position: "absolute", left: 0, top: 0, width: 100, fontFamily: mono, fontSize: 16, color: C.grey, lineHeight: "36px"}}>Voice</div>
            <div style={{position: "absolute", left: 110, top: 0, height: 36, borderRadius: 8, background: C.ink, width: `${bar * 720}px`}} />
          </div>
          <div style={{position: "relative", height: 36, marginTop: 12}}>
            <div style={{position: "absolute", left: 0, top: 0, width: 100, fontFamily: mono, fontSize: 16, color: C.grey, lineHeight: "36px"}}>Captions</div>
            <div style={{position: "absolute", left: 110, top: 0, height: 36, borderRadius: 8, background: C.blue, width: 720}} />
          </div>
        </Card>
      </At>
      <At x={160} y={575} rot={-1} delay={130} dy={40} z={4}>
        <Pill bg={C.soft} color={C.ink} size={22} style={{border: `1px solid ${C.border}`}}>free voice · non-commercial · credit ElevenLabs</Pill>
      </At>
    </Zone>
  );
};

const Hero11: React.FC = () => {
  const f = useCurrentFrame();
  const press = interpolate(f, [120, 123, 129], [1, 0.9, 1], clamp);
  const posted = f >= 123;
  const checks: [string, number][] = [["Text and logos inside the safe area", 26], ["Captions above Instagram's caption", 52], ["Overlay track switched off", 78]];
  return (
    <Zone>
      <At x={40} y={0} rot={-1.5} delay={4} dy={90} amp={4}>
        <Card style={{width: 880, padding: "22px 36px"}}>
          {checks.map(([c, t]) => (
            <div key={c} style={{display: "flex", alignItems: "center", gap: 22, height: 86}}>
              <Tick at={t} size={50} />
              <div style={{fontWeight: 700, fontSize: 33, color: C.ink}}>{c}</div>
            </div>
          ))}
        </Card>
      </At>
      <At x={40} y={350} rot={1.5} delay={96} dy={90} amp={4} phase={20}>
        <Card style={{width: 880, height: 190, padding: "0 36px", display: "flex", alignItems: "center", gap: 28}}>
          <div style={{width: 94, height: 150, borderRadius: 16, background: C.bg, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, color: C.coral, fontSize: 22, border: `1px solid ${C.border}`}}>free.</div>
          <div style={{flex: 1}}>
            <Mono size={16}>New reel</Mono>
            <div style={{fontWeight: 800, fontSize: 38, marginTop: 6, color: C.ink}}>Everyone says free.</div>
          </div>
          <Pill bg={posted ? C.green : C.ink} color="#fff" size={32} style={{transform: `scale(${press})`}}>{posted ? "Posted" : "Share"}</Pill>
        </Card>
      </At>
      <Burst delay={124} x={780} y={440} n={22} />
    </Zone>
  );
};

const Hero12: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <Zone>
      <At x={40} y={50} rot={-2} delay={2} dy={90} amp={5}>
        <Card style={{width: 880, padding: "40px 48px"}}>
          <Mono size={18}>Open source · GitHub</Mono>
          <div style={{fontFamily: mono, fontSize: 28, color: C.grey, marginTop: 16}}>optionxi /</div>
          <div style={{fontWeight: 800, fontSize: 84, color: C.ink, letterSpacing: "-0.03em", lineHeight: 1.05}}>optionxi-reels</div>
          <div style={{fontWeight: 500, fontSize: 30, color: C.grey, marginTop: 12}}>Instagram Reels, written as code.</div>
          <div style={{display: "flex", gap: 12, marginTop: 26}}>
            {["Public", "MIT", "Remotion", "React"].map((t) => <Pill key={t} bg={C.soft} color={C.ink} size={22}>{t}</Pill>)}
          </div>
        </Card>
      </At>
      <At x={640} y={-20} rot={8} delay={24} dy={-60} z={6}><Badge text="FREE*" delay={0} rot={0} size={50} /></At>
      <At x={290} y={400} rot={-2} delay={46} dy={60} z={4}><Pill bg={C.coral} color="#fff" size={38}>Link in bio</Pill></At>
      <div style={{position: "absolute", left: 0, right: 0, top: 540, textAlign: "center", fontFamily: mono, fontSize: 22, color: "rgba(28,27,34,.6)", opacity: ramp(f, 60, 76)}}>*ElevenLabs free voice: non-commercial, credit them.</div>
      <Burst delay={26} x={780} y={40} n={22} />
    </Zone>
  );
};

const HEROES: React.FC[] = [Hero1, Hero2, Hero3, Hero4, Hero5, Hero6, Hero7, Hero8, Hero9, Hero10, Hero11, Hero12];

/* ================================ REEL ================================ */
export const Reel: React.FC = () => (
  <AbsoluteFill style={{fontFamily: sans}}>
    <Canvas />
    {VOICE_FILE ? <Audio src={staticFile(VOICE_FILE)} /> : null}

    {BEATS.map((b, i) => {
      const from = sec(b.a);
      const last = i === BEATS.length - 1;
      const dur = sec(b.b) - from - (last ? 0 : 0);
      const Hero = HEROES[i];
      return (
        <React.Fragment key={i}>
          <Part from={from} dur={dur}><Tag text={b.tag} /></Part>
          <Part from={from} dur={dur}><Hero /></Part>
          <Sequence from={from} durationInFrames={dur + EXIT}><Caption text={b.cap} dur={dur} /></Sequence>
        </React.Fragment>
      );
    })}

    <FinePrint />
    <Pip />
  </AbsoluteFill>
);

export default Reel;