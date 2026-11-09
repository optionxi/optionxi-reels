import React from "react";
import {
  AbsoluteFill,
  Audio,
  Easing,
  Sequence,
  staticFile,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig, CanvasImage,
} from "remotion";

import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { loadFont as loadMono } from "@remotion/google-fonts/JetBrainsMono";
import { loadFont as loadPixel } from "@remotion/google-fonts/PressStart2P";
import { AvatarRig, PoseKey, PoseName } from "../Avatar/avatar-rig";

/**
 * OptionXi — "How it works" explainer reel (9:16, 1080x1920, 30fps, 1350 frames = 45s)
 * Register in Root.tsx:
 *   import { Reel } from "./Reel-How-It-Works";
 *   <Composition id="OptionXiReel" component={Reel} durationInFrames={REEL_DURATION}
 *                fps={30} width={1080} height={1920} />
 * Needs: AvatarRig.tsx next to this file, and `npx remotion add @remotion/google-fonts`.
 * Fully deterministic: only useCurrentFrame / spring / interpolate, seeded hashes.
 */

export const REEL_DURATION = 1350;

export const config = {
  durationInFrames: REEL_DURATION,
  fps: 30,
  width: 1080,
  height: 1920,
};

const { fontFamily: SANS } = loadInter("normal", { weights: ["400", "500", "600", "700", "800"], subsets: ["latin"] });
const { fontFamily: MONO } = loadMono("normal", { weights: ["400", "500"], subsets: ["latin"] });
const { fontFamily: PIXEL } = loadPixel("normal", { subsets: ["latin"] });

/* ───────────────────────── brand ───────────────────────── */
const BRAND = { name: "optionxi", handle: "@optionxi", store: "Google Play", installs: "10k+ installs" };
const C = {
  bg: "#F8F6F2", blobA: "#DDE6F3", blobB: "#E6E0F2", glow: "#F7E7DA",
  ink: "#1C1B22", accent: "#F4714F", accentSoft: "#FCE3DA", card: "#FFFFFF",
  border: "rgba(28,27,34,0.06)", dark: "#1A1A1E", darkText: "#E8E6E1", muted: "#8C8A94", line: "#E4E2E8",
};
const FPS = 30;
const WPS = 3.5;
const OUTRO_START = 1245;

/* ───────────────────────── helpers ───────────────────────── */
const clamp = (v: number) => Math.min(1, Math.max(0, v));
const ease = Easing.out(Easing.cubic);
const hash = (n: number) => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};
const pop = (f: number, start: number, dur = 10) =>
  interpolate(f, [start, start + dur * 0.6, start + dur], [0, 1.25, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
const fadeUp = (f: number, start: number, dur = 6, dy = 14): React.CSSProperties => {
  const p = ease(clamp((f - start) / dur));
  return { opacity: p, transform: `translateY(${(1 - p) * dy}px)` };
};
const typed = (s: string, f: number, start: number, cps = 35) =>
  s.slice(0, Math.max(0, Math.floor(((f - start) * cps) / FPS)));
const caret = (f: number) => (Math.floor(f / 15) % 2 === 0 ? "▌" : " ");

const cardBase: React.CSSProperties = {
  background: C.card,
  borderRadius: 28,
  boxShadow: "0 24px 60px rgba(28,27,34,.08)",
  border: `1px solid ${C.border}`,
  boxSizing: "border-box",
};

/* ───────────────────────── script (beats) ───────────────────────── */
type HeroId =
  | "hook" | "overview" | "pipeline" | "indicators" | "database" | "apps"
  | "features" | "mood" | "algo" | "download" | "outro";

interface Beat {
  id: string;
  start: number;
  end: number;
  eyebrow: string;
  headline: string; // *word* = accent (max 2 words, ≤ 8 words total)
  hero: HeroId;
  step?: string;
  poses: PoseName[];
}

const BEATS: Beat[] = [
  { id: "hook", start: 0, end: 105, eyebrow: "optionxi · under the hood", headline: "How *OptionXi* actually works", hero: "hook", poses: ["wave"] },
  { id: "overview", start: 105, end: 195, eyebrow: "the engine", headline: "Four *steps,* start to finish", hero: "overview", poses: ["talk", "point"] },
  { id: "step1", start: 195, end: 345, eyebrow: "step 1 · live data", headline: "*Python* on cloud pulls live data", hero: "pipeline", step: "Step 1 · Live data", poses: ["point", "idle"] },
  { id: "step2", start: 345, end: 495, eyebrow: "step 2 · processing", headline: "We process it: *EMA,* *SMA,* more", hero: "indicators", step: "Step 2 · Processing", poses: ["point", "idle"] },
  { id: "step3", start: 495, end: 615, eyebrow: "step 3 · storage", headline: "Everything lands in *Supabase*", hero: "database", step: "Step 3 · Storage", poses: ["idle", "point"] },
  { id: "step4", start: 615, end: 765, eyebrow: "step 4 · the apps", headline: "*Flutter* for mobile, *Next.js* for web", hero: "apps", step: "Step 4 · The apps", poses: ["talk", "point"] },
  { id: "features", start: 765, end: 885, eyebrow: "what you get", headline: "Screeners, scanners and *auto* *alerts*", hero: "features", poses: ["idle", "point"] },
  { id: "mood", start: 885, end: 1005, eyebrow: "what you get", headline: "*Market* *mood* and AI analysis", hero: "mood", poses: ["talk", "point"] },
  { id: "algo", start: 1005, end: 1125, eyebrow: "for teams", headline: "Need your own algo? We *deploy* it", hero: "algo", poses: ["point", "idle"] },
  { id: "download", start: 1125, end: OUTRO_START, eyebrow: "try it", headline: "Free on *Google* *Play*", hero: "download", poses: ["talk", "point"] },
  { id: "outro", start: OUTRO_START, end: REEL_DURATION, eyebrow: "", headline: "", hero: "outro", poses: ["wave"] },
];

interface Word { text: string; accent: boolean; frame: number }
const parseHeadline = (s: string, start: number): Word[] =>
  s
    ? s.split(" ").map((t, i) => ({
        text: t.replace(/\*/g, ""),
        accent: t.startsWith("*"),
        frame: start + 6 + Math.round((i * FPS) / WPS), // swap for transcript frames when a voiceover exists
      }))
    : [];

const TIMELINE: PoseKey[] = BEATS.flatMap((b) =>
  b.poses.map((pose, j) => ({
    frame: b.start === 0 && j === 0 ? 0 : b.start + Math.round((j * (b.end - b.start)) / b.poses.length),
    pose,
  }))
);

/* ───────────────────────── primitives ───────────────────────── */
const Card: React.FC<{ style?: React.CSSProperties; children?: React.ReactNode }> = ({ style, children }) => (
  <div style={{ ...cardBase, ...style }}>{children}</div>
);

const Pop: React.FC<{ delay?: number; style?: React.CSSProperties; children?: React.ReactNode }> = ({ delay = 0, style, children }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: f - delay, fps, config: { damping: 18, stiffness: 140, mass: 0.9 } });
  return (
    <div style={{ ...style, opacity: clamp(s), transform: `translateY(${(1 - s) * 40}px) scale(${0.96 + 0.04 * s})` }}>
      {children}
    </div>
  );
};

/** Absolute card that sits under the StepPill (hero zone is 950 x 768). */
const StepCard: React.FC<{ h: number; children?: React.ReactNode }> = ({ h, children }) => (
  <Pop delay={22} style={{ ...cardBase, position: "absolute", left: 0, top: 90, width: 950, height: h, overflow: "hidden" }}>
    {children}
  </Pop>
);

const StepPill: React.FC<{ label: string }> = ({ label }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 0, display: "flex", justifyContent: "center", ...fadeUp(f, 0, 8) }}>
      <div style={{ background: C.ink, color: "#fff", borderRadius: 999, padding: "18px 38px", fontSize: 32, fontWeight: 600, display: "flex", alignItems: "center", gap: 14 }}>
        <span style={{ width: 14, height: 14, borderRadius: 7, background: C.accent }} />
        {label}
      </div>
    </div>
  );
};

/** Hero zone wrapper: card_in spring, card_out blur-fade (last 8 frames of the beat). */
const HeroFrame: React.FC<{ dur: number; delay?: number; children?: React.ReactNode }> = ({ dur, delay = 8, children }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: f - delay, fps, config: { damping: 18, stiffness: 140, mass: 0.9 } });
  const out = clamp((f - (dur - 8)) / 8);
  return (
    <div
      style={{
        position: "absolute", left: 65, top: 422, width: 950, height: 768,
        opacity: clamp(s) * (1 - out),
        transform: `translateY(${(1 - s) * 40}px) scale(${(0.96 + 0.04 * s) * (1 - 0.03 * out)})`,
        filter: `blur(${out * 10}px)`,
      }}
    >
      {children}
    </div>
  );
};

const CheckMark: React.FC<{ p: number }> = ({ p }) => (
  <svg width="30" height="30" viewBox="0 0 24 24" style={{ transform: `scale(${p})` }}>
    <path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="#fff" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

interface RowDef { label: string; hint?: string }
const Rows: React.FC<{ f: number; rows: RowDef[]; numbered?: boolean; t0?: number; tickAt?: number; tickGap?: number }> = ({
  f, rows, numbered, t0 = 14, tickAt = 40, tickGap = 12,
}) => (
  <div>
    {rows.map((r, i) => {
      const p = pop(f, tickAt + i * tickGap, 10);
      const done = !numbered && p > 0;
      return (
        <div key={i} style={{ display: "flex", alignItems: "center", height: 80, ...fadeUp(f, t0 + i * 5) }}>
          <div
            style={{
              width: 52, height: 52, borderRadius: 26, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center",
              background: numbered ? C.ink : done ? C.accent : "transparent",
              border: numbered || done ? "none" : `3px solid ${C.line}`,
              color: "#fff", fontWeight: 700, fontSize: 28,
            }}
          >
            {numbered ? i + 1 : done ? <CheckMark p={p} /> : null}
          </div>
          <div style={{ marginLeft: 26, fontSize: 40, fontWeight: 600, color: C.ink, flex: 1 }}>{r.label}</div>
          {r.hint && <div style={{ fontSize: 28, color: C.muted }}>{r.hint}</div>}
        </div>
      );
    })}
  </div>
);

const CardTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ fontSize: 24, fontWeight: 600, letterSpacing: "0.14em", color: C.muted, textTransform: "uppercase" }}>{children}</div>
);

const Cursor: React.FC<{ f: number; from: [number, number]; to: [number, number]; start: number; dur: number }> = ({ f, from, to, start, dur }) => {
  const p = ease(clamp((f - start) / dur));
  const x = from[0] + (to[0] - from[0]) * p;
  const y = from[1] + (to[1] - from[1]) * p + Math.sin(p * Math.PI) * -40; // gentle bezier-like arc
  const c = clamp((f - (start + dur)) / 12);
  return (
    <>
      {c > 0 && c < 1 && (
        <div style={{ position: "absolute", left: to[0] - 30, top: to[1] - 30, width: 60, height: 60, borderRadius: 30, border: `4px solid ${C.accent}`, opacity: 0.5 * (1 - c), transform: `scale(${0.6 + c})` }} />
      )}
      <svg width="40" height="40" viewBox="0 0 28 34" style={{ position: "absolute", left: x, top: y, opacity: f >= start - 4 ? 1 : 0, filter: "drop-shadow(0 4px 6px rgba(0,0,0,.25))" }}>
        <path d="M2 2 L2 26 L9 20 L14 31 L19 29 L14 18 L23 18 Z" fill={C.ink} stroke="#fff" strokeWidth="2" strokeLinejoin="round" />
      </svg>
    </>
  );
};

const Burst: React.FC<{ f: number; t0: number; cx: number; cy: number }> = ({ f, t0, cx, cy }) => (
  <>
    {Array.from({ length: 12 }, (_, i) => {
      const a = (i / 12) * Math.PI * 2 + hash(i) * 0.5;
      const p = ease(clamp((f - t0) / 24));
      const d = 70 + hash(i + 3) * 80;
      return (
        <div key={i} style={{ position: "absolute", left: cx + Math.cos(a) * d * p - 6, top: cy + Math.sin(a) * d * p - 6, width: 12, height: 12, borderRadius: 6, background: C.accent, opacity: f >= t0 ? 1 - p : 0 }} />
      );
    })}
  </>
);

const Chip: React.FC<{ f: number; t0: number; dark?: boolean; style?: React.CSSProperties; children: React.ReactNode }> = ({ f, t0, dark, style, children }) => {
  const p = pop(f, t0, 12);
  return (
    <div style={{ position: "absolute", padding: "14px 28px", borderRadius: 999, fontSize: 30, fontWeight: 600, whiteSpace: "nowrap", background: dark ? C.ink : C.accent, color: "#fff", opacity: clamp(p), transform: `scale(${p})`, boxShadow: "0 14px 30px rgba(28,27,34,.15)", ...style }}>
      {children}
    </div>
  );
};

/* ───────────────────────── persistent layer ───────────────────────── */
const Background: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const dx = Math.sin((t * Math.PI * 2) / 10) * 20;
  const dy = Math.cos((t * Math.PI * 2) / 10) * 20;
  const boost = 1 + 0.25 * ease(clamp((f - OUTRO_START) / 20));
  return (
    <AbsoluteFill style={{ background: C.bg, overflow: "hidden" }}>
      <div style={{ position: "absolute", left: -220 + dx, top: -160 + dy, width: 660, height: 660, borderRadius: "50%", background: `radial-gradient(circle, ${C.blobA} 0%, transparent 70%)`, opacity: Math.min(1, 0.7 * boost), filter: "blur(40px)" }} />
      <div style={{ position: "absolute", left: 720 - dx, top: 620 + dy, width: 540, height: 540, borderRadius: "50%", background: `radial-gradient(circle, ${C.blobB} 0%, transparent 70%)`, opacity: Math.min(1, 0.5 * boost), filter: "blur(40px)" }} />
      <div style={{ position: "absolute", left: 108, top: 1400, width: 864, height: 620, borderRadius: "50%", background: `radial-gradient(ellipse, ${C.glow} 0%, transparent 70%)`, opacity: Math.min(1, 0.9 * boost) }} />
    </AbsoluteFill>
  );
};

const Headline: React.FC = () => {
  const f = useCurrentFrame();
  const b = BEATS.find((x) => f >= x.start && f < x.end) ?? BEATS[BEATS.length - 1];
  const words = parseHeadline(b.headline, b.start);
  const out = b.id === "outro" ? 0 : clamp((f - (b.end - 4)) / 4);
  return (
    <>
      <div style={{ position: "absolute", left: 54, top: 163, fontFamily: MONO, fontSize: 26, color: C.muted, opacity: ease(clamp((f - b.start) / 6)) * (1 - out) }}>
        {b.eyebrow ? `// ${b.eyebrow}` : ""}
      </div>
      <div style={{ position: "absolute", left: 54, top: 202, width: 972, fontSize: 80, fontWeight: 800, letterSpacing: "-0.02em", lineHeight: 1.08, color: C.ink, opacity: 1 - out }}>
        {words.map((w, i) => (
          <span key={i} style={{ display: "inline-block", marginRight: "0.26em", color: w.accent ? C.accent : C.ink, ...fadeUp(f, w.frame, 6, 14) }}>
            {w.text}
          </span>
        ))}
      </div>
    </>
  );
};

const Wordmark: React.FC = () => {
  const f = useCurrentFrame();
  const op = ease(clamp(f / 12)) * (1 - clamp((f - (OUTRO_START - 8)) / 8));
  return (
    <div style={{ position: "absolute", right: 54, top: 1344, fontSize: 46, fontWeight: 700, letterSpacing: "-0.03em", color: C.ink, opacity: op }}>
      {BRAND.name}
    </div>
  );
};

/* ───────────────────────── hero scenes ───────────────────────── */
/* 1 · Hook: collage + terminal */
const MiniScreen: React.FC<{ label: string; i: number }> = ({ label, i }) => (
  <div style={{ ...cardBase, width: 300, height: 420, padding: 24 }}>
    <div style={{ fontSize: 28, fontWeight: 700 }}>{label}</div>
    {[0, 1, 2, 3].map((k) => (
      <div key={k} style={{ marginTop: 18, height: 52, borderRadius: 14, background: k === 0 ? C.accentSoft : "#F1EFF4", width: `${60 + hash(i * 7 + k) * 40}%` }} />
    ))}
    <div style={{ marginTop: 22, height: 90, borderRadius: 16, background: "#F1EFF4" }} />
  </div>
);

const HookHero: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const cards = [
    { l: "Screeners", x: 20, y: 20, r: -9 },
    { l: "Market mood", x: 330, y: 0, r: 4 },
    { l: "Alerts", x: 630, y: 30, r: 10 },
    { l: "Scanners", x: 90, y: 330, r: 6 },
    { l: "AI analysis", x: 560, y: 320, r: -7 },
  ];
  const t = spring({ frame: f - 22, fps, config: { damping: 18, stiffness: 140, mass: 0.9 } });
  return (
    <>
      {cards.map((c, i) => {
        const s = spring({ frame: f - 6 - i * 4, fps, config: { damping: 16, stiffness: 120, mass: 0.9 } });
        return (
          <div key={i} style={{ position: "absolute", left: c.x, top: c.y, opacity: clamp(s), transform: `translateY(${(1 - s) * 50}px) rotate(${c.r}deg)` }}>
            <MiniScreen label={c.l} i={i} />
          </div>
        );
      })}
      <div style={{ position: "absolute", left: 75, top: 190, width: 800, height: 380, borderRadius: 28, background: C.dark, boxShadow: "0 30px 70px rgba(28,27,34,.25)", opacity: clamp(t), transform: `translateY(${(1 - t) * 40}px) scale(${0.96 + 0.04 * t})`, padding: 36, boxSizing: "border-box" }}>
        <div style={{ display: "flex", gap: 10 }}>
          {["#4a4a52", "#4a4a52", "#4a4a52"].map((c, i) => <span key={i} style={{ width: 16, height: 16, borderRadius: 8, background: c }} />)}
        </div>
        <div style={{ fontFamily: PIXEL, color: C.accent, fontSize: 62, lineHeight: 1.35, marginTop: 34, letterSpacing: 4 }}>
          OPTION<br />XI
        </div>
        <div style={{ fontFamily: MONO, color: C.darkText, fontSize: 30, marginTop: 30 }}>
          {"> "}{typed("how does it work?", f, 40, 18)}<span style={{ color: C.accent }}>{caret(f)}</span>
        </div>
      </div>
      <Chip f={f} t0={50} style={{ left: 600, top: 150, transform: `scale(${pop(f, 50, 12)}) rotate(4deg)` }}>{BRAND.installs}</Chip>
      {Array.from({ length: 9 }, (_, i) => (
        <div key={i} style={{ position: "absolute", left: hash(i) * 930, top: 768 - ((f * 1.6 + hash(i + 9) * 768) % 768), width: 10, height: 10, borderRadius: 5, background: C.accent, opacity: f > 20 ? 0.5 : 0 }} />
      ))}
    </>
  );
};

/* 2 · Overview */
const OverviewHero: React.FC = () => (
  <Pop delay={0} style={{ ...cardBase, position: "absolute", left: 0, top: 40, width: 950, padding: 44 }}>
    <OverviewInner />
  </Pop>
);
const OverviewInner: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <>
      <CardTitle>4 steps</CardTitle>
      <div style={{ marginTop: 18 }}>
        <Rows f={f} numbered t0={14} rows={[
          { label: "Live data", hint: "Fyers + Upstox" },
          { label: "Processing", hint: "EMA, SMA, more" },
          { label: "Storage", hint: "Supabase" },
          { label: "Apps", hint: "Flutter + Next.js" },
        ]} />
      </div>
    </>
  );
};

/* 3 · Step 1 — live data pipeline */
const PipelineCard: React.FC = () => {
  const f = useCurrentFrame();
  const lanes = [{ y0: 140, y1: 240 }, { y0: 340, y1: 320 }];
  const logs = ["$ python live_feed.py", "✓ fyers connected", "✓ upstox connected"];
  const ticks = [["NIFTY 50", 24800], ["BANKNIFTY", 52400], ["RELIANCE", 1420]] as const;
  return (
    <StepCard h={560}>
      {["Fyers API", "Upstox API"].map((n, i) => (
        <div key={n} style={{ position: "absolute", left: 40, top: 90 + i * 200, width: 300, height: 100, borderRadius: 24, background: "#F6F5F8", border: `1px solid ${C.line}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 34, fontWeight: 600, ...fadeUp(f, 30 + i * 6) }}>
          {n}
        </div>
      ))}
      <svg width={950} height={560} style={{ position: "absolute", left: 0, top: 0 }}>
        {lanes.map((l, i) => (
          <g key={i}>
            <line x1={340} y1={l.y0} x2={520} y2={l.y1} stroke={C.line} strokeWidth={4} strokeDasharray="10 10" />
            {[0, 1, 2, 3].map((k) => {
              const p = (Math.max(0, f - 36) * 0.018 + k / 4 + i * 0.12) % 1;
              return <circle key={k} cx={340 + 180 * p} cy={l.y0 + (l.y1 - l.y0) * p} r={9} fill={C.accent} opacity={f > 36 ? Math.sin(p * Math.PI) : 0} />;
            })}
          </g>
        ))}
      </svg>
      <div style={{ position: "absolute", left: 520, top: 60, width: 390, height: 440, borderRadius: 24, background: C.dark, padding: 28, boxSizing: "border-box", ...fadeUp(f, 32) }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, color: C.darkText, fontSize: 26, fontWeight: 600 }}>
          <span style={{ width: 14, height: 14, borderRadius: 7, background: C.accent }} />Python · cloud
        </div>
        <div style={{ marginTop: 24, fontFamily: MONO, fontSize: 21, color: C.darkText, lineHeight: 1.9 }}>
          {logs.map((l, i) => <div key={i} style={{ ...fadeUp(f, 44 + i * 10, 5, 8) }}>{l}</div>)}
          {ticks.map(([s, base], i) => (
            <div key={s} style={{ color: "#A9A6B0", ...fadeUp(f, 76 + i * 8, 5, 8) }}>
              {s} <span style={{ color: C.darkText }}>{(base + hash(i + Math.floor(f / 6)) * base * 0.004).toFixed(2)}</span>
            </div>
          ))}
        </div>
      </div>
    </StepCard>
  );
};

/* 4 · Step 2 — indicators */
const IndicatorCard: React.FC = () => {
  const f = useCurrentFrame();
  const N = 44;
  const price = Array.from({ length: N }, (_, i) => 100 + i * 0.5 + Math.sin(i / 3.2) * 4 + (hash(i) - 0.5) * 5);
  const ema: number[] = [];
  price.forEach((p, i) => ema.push(i ? p * 0.18 + ema[i - 1] * 0.82 : p));
  const sma = price.map((_, i) => {
    const s = price.slice(Math.max(0, i - 9), i + 1);
    return s.reduce((a, b) => a + b, 0) / s.length;
  });
  const lo = Math.min(...price) - 2;
  const hi = Math.max(...price) + 2;
  const path = (a: number[]) => a.map((v, i) => `${i ? "L" : "M"}${(i / (N - 1)) * 870} ${230 - ((v - lo) / (hi - lo)) * 230}`).join(" ");
  const draw = (start: number, dur: number) => 1 - ease(clamp((f - start) / dur));
  return (
    <StepCard h={650}>
      <div style={{ position: "absolute", left: 40, top: 34 }}><CardTitle>Computing indicators</CardTitle></div>
      <div style={{ position: "absolute", left: 40, top: 76, width: 870 }}>
        <Rows f={f} t0={28} tickAt={64} tickGap={14} rows={[{ label: "EMA" }, { label: "SMA" }, { label: "Other indicators" }]} />
      </div>
      <svg width={870} height={230} style={{ position: "absolute", left: 40, top: 360, overflow: "visible" }}>
        <path d={path(price)} pathLength={1} strokeDasharray={1} strokeDashoffset={draw(32, 32)} fill="none" stroke="#CFCBD6" strokeWidth={4} strokeLinecap="round" />
        <path d={path(sma)} pathLength={1} strokeDasharray={1} strokeDashoffset={draw(78, 30)} fill="none" stroke={C.ink} strokeWidth={4} strokeLinecap="round" />
        <path d={path(ema)} pathLength={1} strokeDasharray={1} strokeDashoffset={draw(64, 30)} fill="none" stroke={C.accent} strokeWidth={6} strokeLinecap="round" />
      </svg>
      <div style={{ position: "absolute", left: 40, top: 600, display: "flex", gap: 30, fontFamily: MONO, fontSize: 22, color: C.muted, ...fadeUp(f, 70) }}>
        <span>— price</span><span style={{ color: C.accent }}>— ema</span><span style={{ color: C.ink }}>— sma</span>
      </div>
    </StepCard>
  );
};

/* 5 · Step 3 — Supabase table */
const DatabaseCard: React.FC = () => {
  const f = useCurrentFrame();
  const rows = [["NIFTY 50", 24800], ["BANKNIFTY", 52400], ["RELIANCE", 1420], ["TCS", 3980], ["INFY", 1810], ["HDFCBANK", 1720]] as const;
  const cols = [330, 190, 170, 170];
  const cell = (i: number): React.CSSProperties => ({ width: cols[i], textAlign: i ? "right" : "left", flexShrink: 0 });
  return (
    <StepCard h={600}>
      <div style={{ position: "absolute", left: 40, top: 32, right: 40, display: "flex", alignItems: "center", gap: 16 }}>
        <svg width="40" height="44" viewBox="0 0 40 44" fill="none" stroke={C.ink} strokeWidth="3">
          <ellipse cx="20" cy="9" rx="15" ry="6" /><path d="M5 9v26c0 3.3 6.7 6 15 6s15-2.7 15-6V9" /><path d="M5 22c0 3.3 6.7 6 15 6s15-2.7 15-6" />
        </svg>
        <div style={{ fontFamily: MONO, fontSize: 28, fontWeight: 500, flex: 1 }}>supabase · stock_data</div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 24, color: C.accent, fontWeight: 600 }}>
          <span style={{ width: 14, height: 14, borderRadius: 7, background: C.accent, opacity: 0.5 + 0.5 * Math.sin(f / 4) }} />live
        </div>
      </div>
      <div style={{ position: "absolute", left: 40, top: 104, width: 870 }}>
        <div style={{ display: "flex", fontFamily: MONO, fontSize: 22, color: C.muted, paddingBottom: 14, borderBottom: `2px solid ${C.line}` }}>
          {["symbol", "price", "ema", "sma"].map((h, i) => <div key={h} style={cell(i)}>{h}</div>)}
        </div>
        {rows.map(([s, base], i) => {
          const v = base * (1 + (hash(i * 5 + Math.floor(f / 15)) - 0.5) * 0.004);
          return (
            <div key={s} style={{ display: "flex", alignItems: "center", height: 72, borderBottom: `1px solid ${C.line}`, fontSize: 30, ...fadeUp(f, 34 + i * 8) }}>
              <div style={{ ...cell(0), fontWeight: 600 }}>{s}</div>
              <div style={{ ...cell(1), fontFamily: MONO }}>{v.toFixed(1)}</div>
              <div style={{ ...cell(2), fontFamily: MONO, color: C.accent }}>{(base * (0.993 + hash(i) * 0.006)).toFixed(1)}</div>
              <div style={{ ...cell(3), fontFamily: MONO, color: C.muted }}>{(base * (0.985 + hash(i + 4) * 0.006)).toFixed(1)}</div>
            </div>
          );
        })}
      </div>
    </StepCard>
  );
};

/* 6 · Step 4 — apps */
const AppsCard: React.FC = () => {
  const f = useCurrentFrame();
  const drawA = 1 - ease(clamp((f - 36) / 22));
  const bars = (n: number, o: number) => Array.from({ length: n }, (_, k) => (
    <div key={k} style={{ height: 26, borderRadius: 8, marginTop: 14, background: k === 0 ? C.accentSoft : "#F1EFF4", width: `${55 + hash(k + o) * 45}%` }} />
  ));
  return (
    <StepCard h={660}>
      <div style={{ position: "absolute", left: 345, top: 20, width: 260, height: 64, borderRadius: 32, background: C.ink, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, fontWeight: 600, ...fadeUp(f, 28) }}>
        Supabase
      </div>
      <svg width={950} height={200} style={{ position: "absolute", left: 0, top: 0 }}>
        <path d="M475 84 L185 140" pathLength={1} strokeDasharray={1} strokeDashoffset={drawA} stroke={C.accent} strokeWidth={4} fill="none" />
        <path d="M475 84 L625 160" pathLength={1} strokeDasharray={1} strokeDashoffset={drawA} stroke={C.accent} strokeWidth={4} fill="none" />
      </svg>
      <div style={{ position: "absolute", left: 60, top: 140, width: 250, height: 380, borderRadius: 40, border: `8px solid ${C.ink}`, background: C.bg, padding: 22, boxSizing: "border-box", ...fadeUp(f, 46) }}>
        <div style={{ fontSize: 24, fontWeight: 700 }}>{BRAND.name}</div>
        {bars(6, 1)}
      </div>
      <div style={{ position: "absolute", left: 60, top: 532, width: 250, textAlign: "center", fontSize: 24, color: C.muted, ...fadeUp(f, 56) }}>Flutter · Google Play</div>
      <div style={{ position: "absolute", left: 360, top: 160, width: 530, height: 330, borderRadius: 24, border: `2px solid ${C.line}`, background: "#fff", overflow: "hidden", ...fadeUp(f, 52) }}>
        <div style={{ height: 48, background: "#F6F5F8", display: "flex", alignItems: "center", gap: 8, padding: "0 18px" }}>
          {[0, 1, 2].map((k) => <span key={k} style={{ width: 12, height: 12, borderRadius: 6, background: "#D9D7DE" }} />)}
        </div>
        <div style={{ padding: "6px 26px" }}>{bars(6, 7)}</div>
      </div>
      <div style={{ position: "absolute", left: 360, top: 504, width: 530, textAlign: "center", fontSize: 24, color: C.muted, ...fadeUp(f, 62) }}>Next.js · web</div>
      <Chip f={f} t0={80} dark style={{ left: 190, top: 582 }}>{"</>"} Both front ends are open source</Chip>
    </StepCard>
  );
};

/* 7 · Features: screeners, scanners, alerts */
const ICONS: Record<string, React.ReactNode> = {
  Screeners: <path d="M4 5h16l-6 7v6l-4 2v-8z" />,
  Scanners: <><circle cx="12" cy="12" r="3" /><circle cx="12" cy="12" r="8" /><path d="M12 12l6-6" /></>,
  "Auto alerts": <path d="M12 3a6 6 0 0 0-6 6v4l-2 3h16l-2-3V9a6 6 0 0 0-6-6zM10 19a2 2 0 0 0 4 0" />,
};
const FeaturesHero: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const items = [["Screeners", "Filter stocks fast"], ["Scanners", "Live breakout scans"], ["Auto alerts", "Get pinged instantly"]];
  const toast = spring({ frame: f - 62, fps, config: { damping: 16, stiffness: 120, mass: 0.9 } });
  return (
    <>
      {items.map(([t, s], i) => (
        <Pop key={t} delay={10 + i * 5} style={{ ...cardBase, position: "absolute", left: i * 330, top: 60, width: 290, height: 340, padding: 30 }}>
          <div style={{ width: 96, height: 96, borderRadius: 48, background: C.accentSoft, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={C.accent} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{ICONS[t]}</svg>
          </div>
          <div style={{ marginTop: 34, fontSize: 38, fontWeight: 700, lineHeight: 1.1 }}>{t}</div>
          <div style={{ marginTop: 10, fontSize: 26, color: C.muted }}>{s}</div>
        </Pop>
      ))}
      <div style={{ position: "absolute", left: 0, right: 0, top: 470, display: "flex", justifyContent: "center", opacity: clamp(toast), transform: `translateY(${(1 - toast) * 40}px)` }}>
        <div style={{ background: C.ink, color: "#fff", borderRadius: 24, padding: "24px 36px", fontSize: 30, display: "flex", alignItems: "center", gap: 18 }}>
          <span style={{ width: 16, height: 16, borderRadius: 8, background: C.accent }} />
          RELIANCE crossed above its EMA · now
        </div>
      </div>
    </>
  );
};

/* 8 · Market mood + AI analysis */
const MoodHero: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const needle = interpolate(spring({ frame: f - 22, fps, config: { damping: 14, stiffness: 90 } }), [0, 1], [-75, 38]);
  const pt = (deg: number, r: number) => [180 + r * Math.cos((deg * Math.PI) / 180), 190 + r * Math.sin((deg * Math.PI) / 180)];
  const arc = (a: number, b: number) => { const [x0, y0] = pt(a, 140); const [x1, y1] = pt(b, 140); return `M${x0} ${y0} A140 140 0 0 1 ${x1} ${y1}`; };
  const lines = ["Trading above its EMA", "Volume is picking up", "Trend looks positive"];
  return (
    <>
      <Pop delay={4} style={{ ...cardBase, position: "absolute", left: 0, top: 40, width: 440, height: 520, padding: 36 }}>
        <CardTitle>Market mood</CardTitle>
        <svg width={360} height={220} viewBox="0 0 360 220" style={{ marginTop: 40 }}>
          <path d={arc(180, 240)} stroke="#EDEBF1" strokeWidth={26} fill="none" strokeLinecap="round" />
          <path d={arc(246, 294)} stroke={C.accentSoft} strokeWidth={26} fill="none" strokeLinecap="round" />
          <path d={arc(300, 360)} stroke={C.accent} strokeWidth={26} fill="none" strokeLinecap="round" />
          <g transform={`rotate(${needle} 180 190)`}>
            <line x1={180} y1={190} x2={180} y2={80} stroke={C.ink} strokeWidth={8} strokeLinecap="round" />
          </g>
          <circle cx={180} cy={190} r={16} fill={C.ink} />
        </svg>
        <div style={{ marginTop: 14, fontSize: 64, fontWeight: 800, color: C.accent, textAlign: "center", ...fadeUp(f, 50) }}>Bullish</div>
        <div style={{ fontSize: 26, color: C.muted, textAlign: "center", ...fadeUp(f, 56) }}>Prediction for today</div>
      </Pop>
      <Pop delay={16} style={{ ...cardBase, position: "absolute", left: 480, top: 40, width: 470, height: 520, padding: 36 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <CardTitle>AI analysis</CardTitle>
          <div style={{ background: C.accentSoft, color: C.accent, borderRadius: 999, padding: "8px 18px", fontSize: 24, fontWeight: 600 }}>RELIANCE</div>
        </div>
        <div style={{ marginTop: 30 }}>
          {lines.map((l, i) => {
            const p = pop(f, 48 + i * 14, 10);
            return (
              <div key={l} style={{ display: "flex", alignItems: "center", gap: 18, height: 96, opacity: clamp(p), fontSize: 32, fontWeight: 500 }}>
                <div style={{ width: 44, height: 44, borderRadius: 22, background: C.accent, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><CheckMark p={Math.min(p, 1.25) * 0.8} /></div>
                {l}
              </div>
            );
          })}
        </div>
      </Pop>
    </>
  );
};

/* 9 · Custom algo deployment */
const AlgoHero: React.FC = () => {
  const f = useCurrentFrame();
  const code = 'def my_algo(d):\n  if d.ema > d.sma:\n    return "BUY"';
  const swap = clamp((f - 74) / 10);
  return (
    <>
      <Pop delay={2} style={{ position: "absolute", left: 0, top: 40, width: 950, height: 500, borderRadius: 28, background: C.dark, boxShadow: "0 24px 60px rgba(28,27,34,.18)", padding: 40, boxSizing: "border-box", opacity: 1 - swap, filter: `blur(${swap * 10}px)` } as React.CSSProperties}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: 22, letterSpacing: "0.14em", color: "#8D8A95", fontWeight: 600 }}>YOUR STRATEGY</div>
          <div style={{ background: C.accent, color: "#fff", borderRadius: 999, padding: "12px 34px", fontSize: 28, fontWeight: 600, transform: `scale(${f >= 70 && f < 76 ? 0.94 : 1})` }}>Deploy</div>
        </div>
        <div style={{ marginTop: 40, fontFamily: MONO, fontSize: 38, color: C.darkText, whiteSpace: "pre", lineHeight: 1.7 }}>
          {typed(code, f, 10)}<span style={{ color: C.accent }}>{caret(f)}</span>
        </div>
      </Pop>
      {f < 90 && <Cursor f={f} from={[520, 420]} to={[830, 70]} start={50} dur={20} />}
      {f >= 74 && (
        <div style={{ ...cardBase, position: "absolute", left: 0, top: 40, width: 950, padding: 44, opacity: swap, transform: `scale(${0.97 + 0.03 * swap})` }}>
          <CardTitle>Deployed on {BRAND.name} cloud</CardTitle>
          <div style={{ marginTop: 18 }}>
            <Rows f={f} t0={80} tickAt={88} tickGap={10} rows={[{ label: "Strategy received" }, { label: "Deployed on cloud" }, { label: "Running live" }]} />
          </div>
        </div>
      )}
    </>
  );
};

/* 10 · Download / result */
const DownloadHero: React.FC = () => {
  const f = useCurrentFrame();
  const big = pop(f, 30, 14);
  return (
    <>
      <Pop delay={4} style={{ position: "absolute", left: 305, top: 40, width: 340, height: 680, borderRadius: 52, border: `10px solid ${C.ink}`, background: C.bg, padding: 28, boxSizing: "border-box", boxShadow: "0 30px 60px rgba(28,27,34,.15)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: 30, fontWeight: 700, letterSpacing: "-0.03em" }}>{BRAND.name}</div>
          <div style={{ background: C.accentSoft, color: C.accent, borderRadius: 999, padding: "4px 14px", fontSize: 20, fontWeight: 600 }}>Bullish</div>
        </div>
        {[0, 1, 2, 3, 4].map((k) => (
          <div key={k} style={{ ...cardBase, marginTop: 18, height: 84, borderRadius: 20, padding: 16, display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: 22, background: k === 0 ? C.accent : "#F1EFF4" }} />
            <div style={{ flex: 1 }}>
              <div style={{ height: 14, borderRadius: 7, background: "#E9E7EE", width: `${60 + hash(k) * 40}%` }} />
              <div style={{ height: 12, borderRadius: 6, background: "#F1EFF4", marginTop: 10, width: "45%" }} />
            </div>
          </div>
        ))}
      </Pop>
      <div style={{ position: "absolute", left: 730, top: 40, width: 140, height: 140, borderRadius: 70, background: C.accent, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${big})`, opacity: clamp(big) }}>
        <svg width="80" height="80" viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </div>
      <Burst f={f} t0={34} cx={800} cy={110} />
      <Chip f={f} t0={46} style={{ left: 640, top: 470 }}>{BRAND.installs}</Chip>
      <Chip f={f} t0={58} dark style={{ left: 10, top: 300 }}>Free to download</Chip>
    </>
  );
};

/* 11 · Outro */
const Outro: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: f - 4, fps, config: { damping: 16, stiffness: 120, mass: 0.9 } });
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 430, display: "flex", flexDirection: "column", alignItems: "center", opacity: clamp(s), transform: `translateY(${(1 - s) * 40}px) scale(${0.94 + 0.06 * s})` }}>
      <div style={{ fontSize: 170, fontWeight: 800, letterSpacing: "-0.05em", color: C.ink, lineHeight: 1 }}>
        option<span style={{ color: C.accent }}>xi</span>
      </div>
      <div style={{ marginTop: 34, fontSize: 46, fontWeight: 600, color: C.ink }}>
        Free on <span style={{ color: C.accent }}>{BRAND.store}</span>
      </div>
      <div style={{ marginTop: 14, fontSize: 30, color: C.muted, fontFamily: MONO }}>Follow {BRAND.handle}</div>
      <div style={{ marginTop: 60, display: "flex", gap: 24, ...fadeUp(f, 24, 10, 30) }}>
        <div style={{ background: C.ink, color: "#fff", borderRadius: 999, padding: "24px 44px", fontSize: 34, fontWeight: 600 }}>Follow {BRAND.handle}</div>
        <div style={{ ...cardBase, borderRadius: 999, padding: "16px 20px 16px 40px", fontSize: 34, fontWeight: 600, display: "flex", alignItems: "center", gap: 18 }}>
          Get it on <span style={{ background: C.accent, color: "#fff", borderRadius: 999, padding: "8px 26px" }}>{BRAND.store}</span>
        </div>
      </div>
    </div>
  );
};

/* ───────────────────────── scene router ───────────────────────── */
const BODIES: Record<Exclude<HeroId, "outro">, React.FC> = {
  hook: HookHero, overview: OverviewHero, pipeline: PipelineCard, indicators: IndicatorCard,
  database: DatabaseCard, apps: AppsCard, features: FeaturesHero, mood: MoodHero, algo: AlgoHero, download: DownloadHero,
};

const SceneFor: React.FC<{ beat: Beat }> = ({ beat }) => {
  if (beat.hero === "outro") return <Outro />;
  const Body = BODIES[beat.hero];
  return (
    <HeroFrame dur={beat.end - beat.start} delay={beat.step ? 2 : 6}>
      {beat.step && <StepPill label={beat.step} />}
      <Body />
    </HeroFrame>
  );
};


const SFX: [string, number, number?][] = [
  // beat whooshes
  ...[0,105,195,345,495,615,765,885,1005,1125].map((f) => ["whoosh", f, 0.5] as [string, number, number]),
  // hook
  ["pop",6],["pop",14],["pop",22],["type",40,0.4],["pop",50],
  // overview rows
  ["tick",125],["tick",130],["tick",135],["tick",140],
  // step 1
  ["pop",219],["pop",225],["pop",231],["tick",239],["tick",249],["tick",259],
  // step 2
  ["tick",409],["tick",423],["tick",437],
  // step 3 rows
  ...[0,1,2,3,4,5].map((i) => ["tick", 529 + i * 8, 0.35] as [string, number, number]),
  // step 4
  ["pop",651],["pop",667],["pop",695],
  // features
  ["pop",775],["pop",780],["pop",785],["ding",827],
  // mood
  ["whoosh",907,0.3],["hit",935],["tick",933],["tick",947],["tick",961],
  // algo
  ["type",1015,0.4],["click",1075],["whoosh",1079,0.4],["tick",1093],["tick",1103],["tick",1113],
  // download
  ["success",1155],["pop",1171],["pop",1183],
  // outro
  ["hit",1245],["pop",1269],
];

const Sfx: React.FC = () => (
  <>
    {SFX.map(([name, from, vol = 0.7], i) => (
      <Sequence key={i} from={from} durationInFrames={90}>
        <Audio src={staticFile(`sfx/${name}.mp3`)} volume={vol} />
      </Sequence>
    ))}
  </>
);

/* ───────────────────────── composition ───────────────────────── */
export const Reel: React.FC = () => (
  <>
    <AbsoluteFill style={{ fontFamily: SANS, background: C.bg }}>
      <Background />
      <Sfx />
      <Headline />
      {BEATS.map((b) => (
        <Sequence key={b.id} from={b.start} durationInFrames={b.end - b.start}>
          <SceneFor beat={b} />
        </Sequence>
      ))}
      {/* avatar: bottom-center, y 66–98% of frame; hero zone ends at 62% so cards never cover the head */}
      <div style={{ position: "absolute", left: 340, top: 1280, width: 400, height: 600 }}>
        <AvatarRig timeline={TIMELINE} />
      </div>
      <Wordmark />
    </AbsoluteFill>
    <CanvasImage
      src={staticFile("instagram-reels-safe-zone.png")}
      from={51}
      style={{ position: "absolute" }}
    />
    <CanvasImage
      src={staticFile("instagram-reels-safe-zone.png")}
      style={{ position: "absolute", width: 1080, height: 1920 }}
    />
  </>
);

export default Reel;

