import React from "react";
import {
  AbsoluteFill,
  Easing,
  Sequence,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { loadFont as loadGrotesk } from "@remotion/google-fonts/SpaceGrotesk";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { loadFont as loadMono } from "@remotion/google-fonts/JetBrainsMono";
import { AvatarRig, PoseKey, PoseName } from "./Avatar/avatar-rig-ch2";

/**
 * OptionXi — "How OptionXi works" reel. 1080x1920, 30fps, 900 frames (30s).
 * Usage: <Composition id="OptionXiReel" component={Reel} durationInFrames={900} fps={30} width={1080} height={1920} />
 * Deterministic: only useCurrentFrame / spring / interpolate. Seeded hash instead of random.
 * Needs: npm i @remotion/google-fonts
 * All data shown on screen (prices, repo names) is sample/placeholder.
 */

/* ───────────────────────── theme ───────────────────────── */
const C = {
  bg_base: "#F5F8FE",
  bg_blob_top_left: "#CFE0FF",
  bg_blob_mid_right: "#DCE4FF",
  bg_glow_bottom: "#FFF1B8",
  ink: "#0A0C14",
  accent_blue: "#2457F5",
  accent_blue_soft: "#DCE6FF",
  accent_yellow: "#FFD21F",
  accent_yellow_soft: "#FFF4C2",
  card_bg: "#FFFFFF",
  card_border: "rgba(10,12,20,0.07)",
  dark_card_bg: "#0B0F1E",
  dark_card_text: "#E6EAF5",
  muted_text: "#7A8196",
};
const BRAND = { wordmark: "optionxi", handle: "@optionxi", keyword: "ALGO" };

const GROT = loadGrotesk("normal", { weights: ["700"], subsets: ["latin"] }).fontFamily;
const INTER = loadInter("normal", { weights: ["400", "500", "600"], subsets: ["latin"] }).fontFamily;
const MONO = loadMono("normal", { weights: ["400", "500"], subsets: ["latin"] }).fontFamily;

/* ───────────────────────── script (beats) ───────────────────────── */
type Word = { text: string; frame: number; accent?: boolean };
type Beat = {
  startFrame: number;
  endFrame: number;
  eyebrow: string;
  words: Word[];
  pose: PoseName | [PoseName, PoseName];
  hero: string;
};

// "~word" marks an accent word. 3.5 words/sec, first word 6 frames after the beat starts.
const beat = (
  startFrame: number,
  endFrame: number,
  eyebrow: string,
  text: string,
  hero: string,
  pose: Beat["pose"]
): Beat => ({
  startFrame,
  endFrame,
  eyebrow,
  hero,
  pose,
  words: text
    .split(" ")
    .filter(Boolean)
    .map((t, i) => ({
      text: t.replace("~", ""),
      accent: t.startsWith("~"),
      frame: startFrame + 6 + Math.round((i * 30) / 3.5),
    })),
});

const BEATS: Beat[] = [
  beat(0, 75, "// how it works", "How ~OptionXi actually works", "hook", "wave"),
  beat(75, 165, "// step 1 · live data", "Live data from ~Fyers and ~Upstox", "pipeline", "point"),
  beat(165, 255, "// step 2 · process", "We crunch ~EMA, ~SMA and more", "pipeline", ["talk", "point"]),
  beat(255, 330, "// step 3 · store", "Stored safely in ~Supabase", "pipeline", "idle"),
  beat(330, 420, "// step 4 · front end", "~Flutter app. ~Next.js web.", "devices", "point"),
  beat(420, 495, "// open source", "Both front ends are ~open ~source", "devices", "talk"),
  beat(495, 585, "// custom algos", "Your ~custom ~algo, deployed for you", "algo", ["idle", "point"]),
  beat(585, 660, "// alerts · mood", "Auto ~alerts. Market ~mood prediction.", "alerts", "point"),
  beat(660, 735, "// screeners · scanners", "~Screeners and ~scanners, ready to use", "screeners", ["idle", "point"]),
  beat(735, 810, "// ai analytics", "~AI ~analytics for every stock", "ai", ["talk", "point"]),
  beat(810, 900, "", "", "outro", "wave"),
];

const TIMELINE: PoseKey[] = BEATS.flatMap((b): PoseKey[] =>
  Array.isArray(b.pose)
    ? [
        { frame: b.startFrame, pose: b.pose[0] },
        { frame: Math.round((b.startFrame + b.endFrame) / 2), pose: b.pose[1] },
      ]
    : [{ frame: b.startFrame, pose: b.pose }]
);

/* ───────────────────────── helpers ───────────────────────── */
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ramp = (f: number, a: number, b: number) =>
  interpolate(f, [a, b], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
const win = (f: number, a: number, b: number, d = 6) =>
  Math.min(interpolate(f, [a, a + d], [0, 1], clamp), interpolate(f, [b - d, b], [1, 0], clamp));
const hash = (n: number) => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};
const series = (n: number, seed: number, base: number, drift: number, vol: number) => {
  const out: number[] = [];
  let v = base;
  for (let i = 0; i < n; i++) {
    v += drift + (hash(seed + i * 7.3) - 0.5) * vol;
    out.push(v);
  }
  return out;
};
const toPath = (vals: number[], w: number, h: number, pad = 4) => {
  const mn = Math.min(...vals);
  const mx = Math.max(...vals);
  return vals
    .map((v, i) => `${i ? "L" : "M"}${(i / (vals.length - 1)) * w} ${h - pad - ((v - mn) / (mx - mn || 1)) * (h - 2 * pad)}`)
    .join(" ");
};
const abs = (l: number, t: number, w?: number, h?: number, extra?: React.CSSProperties): React.CSSProperties => ({
  position: "absolute",
  left: l,
  top: t,
  width: w,
  height: h,
  ...extra,
});

const SPR = { damping: 18, stiffness: 140, mass: 0.9 };
const useF = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = (s: number) => Math.max(0, spring({ frame: frame - s, fps, config: SPR }));
  return { frame, pop };
};

const cardStyle: React.CSSProperties = {
  background: C.card_bg,
  borderRadius: 28,
  boxShadow: "0 24px 60px rgba(10,12,20,0.10)",
  border: `1px solid ${C.card_border}`,
};

/* ───────────────────────── primitives ───────────────────────── */
const HERO = { left: 65, top: 422, width: 950, height: 768 };

const Stage: React.FC<{ noOut?: boolean; children?: React.ReactNode }> = ({ noOut, children }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const s = Math.max(0, spring({ frame: frame - 8, fps, config: SPR }));
  const out = noOut ? 0 : interpolate(frame, [durationInFrames - 8, durationInFrames], [0, 1], clamp);
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        opacity: Math.min(1, s) * (1 - out),
        transform: `translateY(${(1 - s) * 40}px) scale(${(0.96 + 0.04 * s) * (1 - 0.03 * out)})`,
        filter: `blur(${out * 10}px)`,
      }}
    >
      {children}
    </div>
  );
};

const Panel: React.FC<{ t: number; h: number; style?: React.CSSProperties; children?: React.ReactNode }> = ({
  t,
  h,
  style,
  children,
}) => (
  <div style={{ ...cardStyle, position: "absolute", left: 25, top: t, width: 900, height: h, overflow: "hidden", ...style }}>
    {children}
  </div>
);

const V: React.FC<{ o: number; children?: React.ReactNode }> = ({ o, children }) => (
  <div style={{ position: "absolute", inset: 0, opacity: o, pointerEvents: "none" }}>{children}</div>
);

const Tick: React.FC<{ frame: number; at: number; size?: number }> = ({ frame, at, size = 44 }) => {
  const done = frame >= at;
  const s = done ? interpolate(frame - at, [0, 6, 10], [0, 1.25, 1], clamp) : 1;
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        flex: "none",
        background: done ? C.accent_yellow : "transparent",
        border: done ? "none" : "3px solid #D3D9EA",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transform: `scale(${s})`,
      }}
    >
      {done && (
        <svg width={size * 0.55} height={size * 0.55} viewBox="0 0 24 24">
          <path d="M5 12.5l4.5 4.5L19 7" fill="none" stroke={C.ink} strokeWidth={3.4} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </div>
  );
};

const Row: React.FC<{
  frame: number;
  enter: number;
  at: number;
  label: string;
  hint?: string;
  style?: React.CSSProperties;
}> = ({ frame, enter, at, label, hint, style }) => {
  const t = ramp(frame, enter, enter + 8);
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 22,
        opacity: t,
        transform: `translateY(${(1 - t) * 14}px)`,
        fontFamily: INTER,
        fontWeight: 600,
        fontSize: 32,
        color: C.ink,
        ...style,
      }}
    >
      <Tick frame={frame} at={at} />
      <span style={{ flex: 1 }}>{label}</span>
      {hint && <span style={{ fontWeight: 400, fontSize: 26, color: C.muted_text }}>{hint}</span>}
    </div>
  );
};

const Typed: React.FC<{ text: string; start: number; frame: number; cps?: number; caret?: boolean }> = ({
  text,
  start,
  frame,
  cps = 35,
  caret = true,
}) => {
  const n = Math.max(0, Math.min(text.length, Math.floor(((frame - start) * cps) / 30)));
  const on = Math.floor(frame / 15) % 2 === 0;
  return (
    <>
      {text.slice(0, n)}
      {caret && (
        <span
          style={{
            display: "inline-block",
            width: "0.6em",
            height: "1.05em",
            verticalAlign: "text-bottom",
            background: C.accent_yellow,
            opacity: on ? 1 : 0,
            marginLeft: 2,
          }}
        />
      )}
    </>
  );
};

const Cursor: React.FC<{
  frame: number;
  pts: { f: number; x: number; y: number }[];
  clicks?: number[];
}> = ({ frame, pts, clicks = [] }) => {
  const fs = pts.map((p) => p.f);
  const e = { ...clamp, easing: Easing.inOut(Easing.cubic) };
  const x = interpolate(frame, fs, pts.map((p) => p.x), e);
  const y = interpolate(frame, fs, pts.map((p) => p.y), e);
  const o = interpolate(frame, [fs[0] - 6, fs[0]], [0, 1], clamp);
  return (
    <>
      {clicks.map((c, i) => {
        const t = (frame - c) / 12;
        if (t < 0 || t > 1) return null;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: 44,
              height: 44,
              borderRadius: "50%",
              border: `4px solid ${C.accent_blue}`,
              opacity: 0.5 * (1 - t),
              transform: `translate(-50%,-50%) scale(${0.6 + t})`,
              pointerEvents: "none",
            }}
          />
        );
      })}
      <svg width={40} height={40} viewBox="0 0 32 32" style={{ position: "absolute", left: x, top: y, opacity: o, pointerEvents: "none" }}>
        <path d="M2 2 L2 26 L8.5 20.5 L13 31 L17.5 29 L13 18.5 L22 18.5 Z" fill="#fff" stroke={C.ink} strokeWidth={2.4} strokeLinejoin="round" />
      </svg>
    </>
  );
};

const StepPill: React.FC<{ text: string; s: number }> = ({ text, s }) => (
  <div
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 14,
      background: C.ink,
      color: "#fff",
      fontFamily: INTER,
      fontWeight: 600,
      fontSize: 32,
      padding: "16px 32px",
      borderRadius: 999,
      opacity: Math.min(1, s),
      transform: `scale(${0.9 + 0.1 * s})`,
    }}
  >
    <span style={{ width: 14, height: 14, borderRadius: "50%", background: C.accent_yellow }} />
    {text}
  </div>
);

const Chip: React.FC<{ text: string; s: number; style?: React.CSSProperties; dark?: boolean }> = ({ text, s, style, dark }) => (
  <div
    style={{
      position: "absolute",
      background: dark ? C.ink : C.accent_yellow,
      color: dark ? "#fff" : C.ink,
      fontFamily: INTER,
      fontWeight: 600,
      fontSize: 28,
      padding: "12px 24px",
      borderRadius: 999,
      whiteSpace: "nowrap",
      opacity: Math.min(1, s),
      transform: `scale(${0.8 + 0.2 * s})`,
      ...style,
    }}
  >
    {text}
  </div>
);

const Wordmark: React.FC<{ size: number }> = ({ size }) => (
  <div
    style={{
      fontFamily: GROT,
      fontWeight: 700,
      fontSize: size,
      letterSpacing: "-0.03em",
      color: C.ink,
      lineHeight: 1,
      display: "flex",
      alignItems: "baseline",
    }}
  >
    {BRAND.wordmark}
    <span style={{ width: size * 0.17, height: size * 0.17, borderRadius: "50%", background: C.accent_yellow, marginLeft: size * 0.06 }} />
  </div>
);

const Phone: React.FC<{ w: number; h: number; children?: React.ReactNode; style?: React.CSSProperties }> = ({ w, h, children, style }) => (
  <div
    style={{
      width: w,
      height: h,
      borderRadius: 48,
      border: `10px solid ${C.ink}`,
      background: "#fff",
      overflow: "hidden",
      position: "relative",
      boxSizing: "border-box",
      boxShadow: "0 24px 60px rgba(10,12,20,0.14)",
      ...style,
    }}
  >
    <div style={{ position: "absolute", left: "50%", top: 8, width: 80, height: 18, borderRadius: 9, background: C.ink, transform: "translateX(-50%)", zIndex: 5 }} />
    {children}
  </div>
);

const Flow: React.FC<{ x1: number; y1: number; x2: number; y2: number; frame: number; start: number; k?: number }> = ({
  x1, y1, x2, y2, frame, start, k = 3,
}) => (
  <>
    {Array.from({ length: k }).map((_, i) => {
      const t = (((frame - start) * 0.022 + i / k) % 1 + 1) % 1;
      return (
        <circle
          key={i}
          cx={x1 + (x2 - x1) * t}
          cy={y1 + (y2 - y1) * t}
          r={8}
          fill={C.accent_yellow}
          stroke="rgba(10,12,20,0.2)"
          strokeWidth={1.5}
          opacity={frame > start ? Math.min(1, t * 6) * Math.min(1, (1 - t) * 6) : 0}
        />
      );
    })}
  </>
);

/* ───────────────────────── persistent layer ───────────────────────── */
const Background: React.FC = () => {
  const frame = useCurrentFrame();
  const d = Math.sin((frame / 30) * ((2 * Math.PI) / 10)) * 20;
  const boost = 1 + 0.25 * ramp(frame, 810, 840);
  return (
    <AbsoluteFill style={{ background: C.bg_base }}>
      <div style={{ position: "absolute", left: -170 + d, top: -120 - d, width: 650, height: 650, borderRadius: "50%", background: `radial-gradient(circle, ${C.bg_blob_top_left} 0%, rgba(207,224,255,0) 70%)`, opacity: 0.75 * boost, filter: "blur(20px)" }} />
      <div style={{ position: "absolute", right: -150 - d, top: 680 + d, width: 560, height: 560, borderRadius: "50%", background: `radial-gradient(circle, ${C.bg_blob_mid_right} 0%, rgba(220,228,255,0) 70%)`, opacity: 0.55 * boost, filter: "blur(20px)" }} />
      <div style={{ position: "absolute", left: 110, top: 1500, width: 860, height: 500, borderRadius: "50%", background: `radial-gradient(ellipse, ${C.bg_glow_bottom} 0%, rgba(255,241,184,0) 70%)`, opacity: Math.min(1, boost) }} />
    </AbsoluteFill>
  );
};

const Headline: React.FC = () => {
  const frame = useCurrentFrame();
  const b = BEATS.find((x) => frame >= x.startFrame && frame < x.endFrame) ?? BEATS[BEATS.length - 1];
  const out = interpolate(frame, [b.endFrame - 4, b.endFrame], [1, 0], clamp);
  return (
    <>
      <div style={{ position: "absolute", left: 54, top: 163, fontFamily: MONO, fontSize: 26, color: C.muted_text, opacity: out * ramp(frame, b.startFrame, b.startFrame + 6) }}>
        {b.eyebrow}
      </div>
      <div style={{ position: "absolute", left: 54, top: 202, width: 972, fontFamily: GROT, fontWeight: 700, fontSize: 84, lineHeight: 1.05, letterSpacing: "-0.02em", color: C.ink, opacity: out }}>
        {b.words.map((w, i) => {
          const t = ramp(frame, w.frame, w.frame + 6);
          return (
            <span key={i} style={{ display: "inline-block", marginRight: "0.26em", opacity: t, transform: `translateY(${(1 - t) * 14}px)`, color: w.accent ? C.accent_blue : C.ink }}>
              {w.text}
            </span>
          );
        })}
      </div>
    </>
  );
};

/* ───────────────────────── scene 1 · hook ───────────────────────── */
const FONT: Record<string, string[]> = {
  O: ["01110", "10001", "10001", "10001", "10001", "10001", "01110"],
  P: ["11110", "10001", "10001", "11110", "10000", "10000", "10000"],
  T: ["11111", "00100", "00100", "00100", "00100", "00100", "00100"],
  I: ["01110", "00100", "00100", "00100", "00100", "00100", "01110"],
  N: ["10001", "11001", "10101", "10101", "10011", "10001", "10001"],
  X: ["10001", "10001", "01010", "00100", "01010", "10001", "10001"],
};

const PixelTitle: React.FC<{ text: string; frame: number; start: number; cell: number }> = ({ text, frame, start, cell }) => {
  const letters = text.split("");
  return (
    <svg width={(letters.length * 6 - 1) * cell} height={7 * cell}>
      {letters.map((ch, li) => {
        const o = ramp(frame, start + li * 3, start + li * 3 + 6);
        return (
          <g key={li} opacity={o}>
            {FONT[ch].flatMap((row, r) =>
              row.split("").map((bit, c) =>
                bit === "1" ? (
                  <rect key={`${r}-${c}`} x={(li * 6 + c) * cell + 1} y={r * cell + 1} width={cell - 2} height={cell - 2} rx={2} fill={C.accent_yellow} />
                ) : null
              )
            )}
          </g>
        );
      })}
    </svg>
  );
};

const MiniPhone: React.FC<{ seed: number }> = ({ seed }) => (
  <div style={{ width: 230, height: 420, borderRadius: 34, background: "#fff", border: `1px solid ${C.card_border}`, boxShadow: "0 16px 40px rgba(10,12,20,0.10)", padding: 18, boxSizing: "border-box" }}>
    <div style={{ width: 80, height: 12, borderRadius: 6, background: C.accent_blue_soft, marginBottom: 16 }} />
    <svg width={194} height={130} viewBox="0 0 194 130">
      <path d={toPath(series(18, seed, 100, 2, 16), 194, 130, 10)} fill="none" stroke={C.accent_blue} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
    {[0, 1, 2, 3].map((i) => (
      <div key={i} style={{ display: "flex", justifyContent: "space-between", marginTop: 16 }}>
        <div style={{ width: 70 + hash(seed + i) * 40, height: 12, borderRadius: 6, background: "#E6EAF5" }} />
        <div style={{ width: 36, height: 12, borderRadius: 6, background: i % 2 ? "#E6EAF5" : C.accent_yellow_soft }} />
      </div>
    ))}
  </div>
);

const HookScene: React.FC = () => {
  const { frame, pop } = useF();
  return (
    <Stage>
      {Array.from({ length: 8 }).map((_, i) => {
        const s = pop(4 + i * 3);
        return (
          <div key={i} style={{ position: "absolute", left: 20 + i * 88, top: 20 + (i % 2) * 36 + (1 - s) * 40, transform: `rotate(${(i - 3.5) * 7}deg)`, opacity: Math.min(1, s) }}>
            <MiniPhone seed={i * 11 + 3} />
          </div>
        );
      })}
      {Array.from({ length: 7 }).map((_, i) => {
        const y = 700 - ((frame * 1.6 + hash(i) * 700) % 700);
        const sz = 8 + hash(i + 9) * 8;
        return <div key={i} style={{ position: "absolute", left: 40 + hash(i + 3) * 860, top: y, width: sz, height: sz, borderRadius: 3, background: C.accent_yellow, opacity: 0.8 * Math.min(1, y / 100) }} />;
      })}
      <div style={{ ...abs(55, 250, 840, 400), background: C.dark_card_bg, borderRadius: 28, boxShadow: "0 30px 70px rgba(10,12,20,0.28)", transform: `scale(${0.94 + 0.06 * pop(10)})`, opacity: Math.min(1, pop(10)) }}>
        <div style={{ display: "flex", gap: 10, padding: "22px 26px" }}>
          {[0, 1, 2].map((i) => (
            <span key={i} style={{ width: 14, height: 14, borderRadius: "50%", background: "rgba(230,234,245,0.25)" }} />
          ))}
        </div>
        <div style={{ ...abs(44, 100), }}>
          <PixelTitle text="OPTIONXI" frame={frame} start={14} cell={16} />
        </div>
        <div style={{ ...abs(44, 262), fontFamily: MONO, fontSize: 34, color: "#7F9DFF" }}>
          <Typed text="> explain optionxi" start={30} frame={frame} caret={false} />
          <span style={{ display: "inline-block", width: 18, height: 34, background: "#7F9DFF", verticalAlign: "text-bottom", marginLeft: 6, opacity: Math.floor(frame / 15) % 2 === 0 ? 1 : 0 }} />
        </div>
      </div>
    </Stage>
  );
};

/* ───────────────────────── scene 2 · pipeline (steps 1–3) ───────────────────────── */
const CL = series(16, 3, 200, 5, 30);
const OP = CL.map((v, i) => (i ? CL[i - 1] : v - 4));
const HI = CL.map((v, i) => Math.max(v, OP[i]) + 4 + hash(i * 3.1) * 10);
const LO = CL.map((v, i) => Math.min(v, OP[i]) - 4 - hash(i * 5.7) * 10);
const CMN = Math.min(...LO);
const CMX = Math.max(...HI);
const CY = (v: number) => 320 - ((v - CMN) / (CMX - CMN)) * 290;
const CX = (i: number) => 30 + i * 50;
const EMA: number[] = [];
CL.forEach((v, i) => EMA.push(i ? EMA[i - 1] + 0.3 * (v - EMA[i - 1]) : v));
const SMA = CL.map((_, i) => {
  const s = CL.slice(Math.max(0, i - 4), i + 1);
  return s.reduce((a, b) => a + b, 0) / s.length;
});
const line = (vals: number[]) => vals.map((v, i) => `${i ? "L" : "M"}${CX(i)} ${CY(v)}`).join(" ");

const SrcChip: React.FC<{ label: string; sub: string; s: number; top: number }> = ({ label, sub, s, top }) => (
  <div style={{ ...abs(40, top, 250, 96), background: "#fff", border: `1px solid ${C.card_border}`, borderRadius: 24, boxShadow: "0 10px 26px rgba(10,12,20,0.07)", display: "flex", alignItems: "center", gap: 16, padding: "0 20px", boxSizing: "border-box", opacity: Math.min(1, s), transform: `translateX(${(1 - s) * -30}px)` }}>
    <div style={{ width: 52, height: 52, borderRadius: 16, background: C.accent_blue_soft, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <svg width={30} height={30} viewBox="0 0 24 24">
        <path d="M2 14l5-5 4 4 5-7 6 6" fill="none" stroke={C.accent_blue} strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
    <div>
      <div style={{ fontFamily: INTER, fontWeight: 600, fontSize: 30, color: C.ink }}>{label}</div>
      <div style={{ fontFamily: INTER, fontSize: 22, color: C.muted_text }}>{sub}</div>
    </div>
  </div>
);

const DATA_ROWS = [
  ["RELIANCE", "2,948.10", "2,931.40"],
  ["TCS", "3,812.55", "3,790.20"],
  ["INFY", "1,654.30", "1,661.85"],
  ["HDFCBANK", "1,721.40", "1,708.95"],
  ["SBIN", "812.70", "805.10"],
];

const PipelineScene: React.FC = () => {
  const { frame, pop } = useF();
  const stage = frame < 90 ? 0 : frame < 180 ? 1 : 2;
  const pill = ["Step 1 · Live data", "Step 2 · Process", "Step 3 · Store"][stage];
  const st = [0, 90, 180][stage];
  const cardO = frame < 90 ? ramp(frame, 14, 26) : 1;
  const selected = frame >= 62 && frame < 90;
  return (
    <Stage>
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, display: "flex", justifyContent: "center" }}>
        <StepPill text={pill} s={pop(st === 0 ? 8 : st)} />
      </div>
      <Panel t={90} h={640} style={{ opacity: cardO }}>
        {/* view 1 · live data */}
        <V o={win(frame, -6, 92)}>
          <SrcChip label="Fyers API" sub="live market feed" s={pop(16)} top={120} />
          <SrcChip label="Upstox API" sub="live market feed" s={pop(22)} top={340} />
          <svg width={900} height={640} style={{ position: "absolute", inset: 0 }}>
            <path d="M290 168 L560 300" stroke={C.accent_blue_soft} strokeWidth={5} strokeLinecap="round" />
            <path d="M290 388 L560 340" stroke={C.accent_blue_soft} strokeWidth={5} strokeLinecap="round" />
            <Flow x1={290} y1={168} x2={560} y2={300} frame={frame} start={26} />
            <Flow x1={290} y1={388} x2={560} y2={340} frame={frame} start={30} />
          </svg>
          <div style={{ ...abs(560, 220, 300, 200), background: C.dark_card_bg, borderRadius: 26, padding: 26, boxSizing: "border-box", color: C.dark_card_text, outline: selected ? `5px solid ${C.accent_yellow}` : "none", outlineOffset: 4, opacity: Math.min(1, pop(20)), transform: `scale(${0.9 + 0.1 * pop(20)})` }}>
            <div style={{ fontFamily: MONO, fontSize: 22, color: "#8A93AD" }}>cloud server</div>
            <div style={{ fontFamily: GROT, fontWeight: 700, fontSize: 58, marginTop: 8 }}>Python</div>
            <div style={{ fontFamily: INTER, fontSize: 24, color: "#8A93AD", marginTop: 6 }}>pulls live ticks</div>
          </div>
          <div style={{ ...abs(0, 540, 900), textAlign: "center", fontFamily: INTER, fontSize: 28, color: C.muted_text }}>Live market data, straight from your broker APIs</div>
          <Cursor frame={frame} pts={[{ f: 30, x: 760, y: 580 }, { f: 60, x: 790, y: 380 }]} clicks={[62]} />
        </V>

        {/* view 2 · process */}
        <V o={win(frame, 88, 184)}>
          <svg width={820} height={340} style={abs(40, 20)}>
            {CL.map((v, i) => {
              const s = ramp(frame, 96 + i * 2, 104 + i * 2);
              const up = v >= OP[i];
              return (
                <g key={i} opacity={s}>
                  <line x1={CX(i)} x2={CX(i)} y1={CY(HI[i])} y2={CY(LO[i])} stroke={up ? C.ink : "#9AA2B8"} strokeWidth={3} />
                  <rect x={CX(i) - 12} y={CY(Math.max(v, OP[i]))} width={24} height={Math.max(4, Math.abs(CY(v) - CY(OP[i])))} rx={4} fill={up ? C.ink : "#B9C0D4"} />
                </g>
              );
            })}
            <path d={line(EMA)} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - ramp(frame, 118, 148)} fill="none" stroke={C.accent_blue} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" />
            <path d={line(SMA)} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - ramp(frame, 126, 156)} fill="none" stroke={C.accent_yellow} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <div style={{ ...abs(44, 372), display: "flex", gap: 36, fontFamily: INTER, fontSize: 26, color: C.muted_text, alignItems: "center" }}>
            <span style={{ display: "flex", alignItems: "center", gap: 10 }}><span style={{ width: 28, height: 6, borderRadius: 3, background: C.accent_blue }} />EMA</span>
            <span style={{ display: "flex", alignItems: "center", gap: 10 }}><span style={{ width: 28, height: 6, borderRadius: 3, background: C.accent_yellow, border: "1px solid rgba(10,12,20,0.15)" }} />SMA</span>
          </div>
          {["EMA 20", "SMA 50", "RSI 14", "MACD"].map((l, i) => (
            <div key={l} style={{ ...abs(40 + (i % 2) * 430, 430 + Math.floor(i / 2) * 92, 410, 76), background: "#F5F8FE", borderRadius: 20, padding: "0 22px", boxSizing: "border-box", display: "flex", alignItems: "center" }}>
              <Row frame={frame} enter={124 + i * 12} at={130 + i * 12} label={l} hint="ready" style={{ flex: 1, fontSize: 30 }} />
            </div>
          ))}
        </V>

        {/* view 3 · store */}
        <V o={win(frame, 180, 270)}>
          <div style={{ ...abs(40, 240, 200, 110), background: C.dark_card_bg, borderRadius: 24, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: GROT, fontWeight: 700, fontSize: 42, color: C.dark_card_text, opacity: Math.min(1, pop(184)) }}>Python</div>
          <svg width={900} height={640} style={{ position: "absolute", inset: 0 }}>
            <path d="M244 295 L316 295" stroke={C.accent_blue_soft} strokeWidth={5} strokeLinecap="round" />
            <Flow x1={244} y1={295} x2={316} y2={295} frame={frame} start={190} k={2} />
          </svg>
          <div style={{ ...abs(320, 36, 540, 568), background: "#F3F6FF", borderRadius: 24, border: `1px solid ${C.card_border}`, boxSizing: "border-box", padding: 26, opacity: Math.min(1, pop(186)), transform: `scale(${0.95 + 0.05 * pop(186)})` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ width: 52, height: 52, borderRadius: 16, background: C.accent_blue_soft, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width={28} height={28} viewBox="0 0 24 24" fill="none" stroke={C.accent_blue} strokeWidth={2.4}>
                  <ellipse cx="12" cy="6" rx="8" ry="3" />
                  <path d="M4 6v12c0 1.7 3.6 3 8 3s8-1.3 8-3V6M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3" />
                </svg>
              </div>
              <div>
                <div style={{ fontFamily: GROT, fontWeight: 700, fontSize: 36, color: C.ink }}>Supabase</div>
                <div style={{ fontFamily: INTER, fontSize: 22, color: C.muted_text }}>PostgreSQL</div>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr 1fr", fontFamily: MONO, fontSize: 20, color: C.muted_text, marginTop: 30, paddingBottom: 10, borderBottom: `2px solid ${C.card_border}` }}>
              <span>symbol</span><span>ema 20</span><span>sma 50</span>
            </div>
            {DATA_ROWS.map((r, i) => {
              const t = ramp(frame, 196 + i * 8, 206 + i * 8);
              return (
                <div key={r[0]} style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr 1fr", height: 66, alignItems: "center", fontFamily: MONO, fontSize: 24, color: C.ink, borderBottom: `1px solid ${C.card_border}`, opacity: t, transform: `translateX(${(1 - t) * 30}px)` }}>
                  <span style={{ fontWeight: 500 }}>{r[0]}</span><span>{r[1]}</span><span>{r[2]}</span>
                </div>
              );
            })}
            <div style={{ ...abs(26, 506), fontFamily: INTER, fontSize: 20, color: C.muted_text }}>sample data</div>
            <Chip text="Saved ✓" s={pop(236)} style={{ right: 26, top: 494, fontSize: 24, padding: "8px 20px" }} />
          </div>
        </V>
      </Panel>
    </Stage>
  );
};

/* ───────────────────────── scene 3 · devices + open source ───────────────────────── */
const WATCH = [
  ["RELIANCE", "2,948", "+1.2%"],
  ["TCS", "3,812", "+0.6%"],
  ["INFY", "1,654", "-0.4%"],
  ["SBIN", "812", "+0.9%"],
];

const REPOS = [
  ["optionxi-app", "Flutter · Android app"],
  ["optionxi-web", "Next.js · Web app"],
];

const DevicesScene: React.FC = () => {
  const { frame, pop } = useF();
  const starred = frame >= 138;
  return (
    <Stage>
      {/* A · front ends */}
      <V o={win(frame, -6, 96)}>
        <div style={{ position: "absolute", left: 0, right: 0, top: 0, display: "flex", justifyContent: "center" }}>
          <StepPill text="Step 4 · Front end" s={pop(8)} />
        </div>
        <div style={{ ...abs(375, 84, 200, 64), background: C.dark_card_bg, borderRadius: 20, color: C.dark_card_text, fontFamily: GROT, fontWeight: 700, fontSize: 32, display: "flex", alignItems: "center", justifyContent: "center", opacity: Math.min(1, pop(14)) }}>Supabase</div>
        <svg width={950} height={768} style={{ position: "absolute", inset: 0 }}>
          <path d="M475 148 L215 200" stroke={C.accent_blue_soft} strokeWidth={5} strokeLinecap="round" />
          <path d="M475 148 L660 250" stroke={C.accent_blue_soft} strokeWidth={5} strokeLinecap="round" />
          <Flow x1={475} y1={148} x2={215} y2={200} frame={frame} start={24} k={2} />
          <Flow x1={475} y1={148} x2={660} y2={250} frame={frame} start={28} k={2} />
        </svg>
        <div style={{ ...abs(70, 200), opacity: Math.min(1, pop(18)), transform: `translateY(${(1 - pop(18)) * 30}px)` }}>
          <Phone w={290} h={490}>
            <div style={{ padding: "44px 18px 0" }}>
              <div style={{ fontFamily: GROT, fontWeight: 700, fontSize: 28, color: C.ink }}>optionxi</div>
              <div style={{ fontFamily: INTER, fontSize: 18, color: C.muted_text, marginBottom: 14 }}>Watchlist</div>
              {WATCH.map((r, i) => (
                <div key={r[0]} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 74, borderBottom: `1px solid ${C.card_border}`, opacity: ramp(frame, 26 + i * 5, 34 + i * 5) }}>
                  <div>
                    <div style={{ fontFamily: INTER, fontWeight: 600, fontSize: 22, color: C.ink }}>{r[0]}</div>
                    <div style={{ fontFamily: MONO, fontSize: 18, color: C.muted_text }}>{r[1]}</div>
                  </div>
                  <div style={{ fontFamily: INTER, fontWeight: 600, fontSize: 18, padding: "5px 12px", borderRadius: 999, background: r[2].startsWith("+") ? C.accent_yellow : "#E6EAF5", color: C.ink }}>{r[2]}</div>
                </div>
              ))}
            </div>
          </Phone>
        </div>
        <div style={{ ...abs(70, 700, 290), textAlign: "center", fontFamily: INTER, fontWeight: 600, fontSize: 26, color: C.ink, opacity: ramp(frame, 30, 40) }}>Flutter · Google Play</div>
        <div style={{ ...abs(400, 250, 520, 380), ...cardStyle, overflow: "hidden", opacity: Math.min(1, pop(24)), transform: `translateY(${(1 - pop(24)) * 30}px)` }}>
          <div style={{ height: 48, background: "#F0F3FA", display: "flex", alignItems: "center", gap: 8, padding: "0 16px" }}>
            {[0, 1, 2].map((i) => (<span key={i} style={{ width: 12, height: 12, borderRadius: "50%", background: "#CBD2E4" }} />))}
            <span style={{ marginLeft: 14, flex: 1, height: 26, borderRadius: 13, background: "#fff", fontFamily: MONO, fontSize: 15, color: C.muted_text, display: "flex", alignItems: "center", padding: "0 12px" }}>optionxi</span>
          </div>
          <div style={{ display: "flex", padding: 18, gap: 16 }}>
            <div style={{ width: 70 }}>
              {[0, 1, 2, 3].map((i) => (<div key={i} style={{ height: 14, borderRadius: 7, background: i === 0 ? C.accent_blue_soft : "#E6EAF5", marginBottom: 18 }} />))}
            </div>
            <div style={{ flex: 1 }}>
              <svg width={380} height={140} viewBox="0 0 380 140">
                <path d={toPath(series(20, 41, 100, 2.2, 14), 380, 140, 10)} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - ramp(frame, 36, 70)} fill="none" stroke={C.accent_blue} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <div style={{ display: "flex", gap: 12, marginTop: 14 }}>
                {[0, 1, 2].map((i) => (<div key={i} style={{ flex: 1, height: 70, borderRadius: 16, background: i === 1 ? C.accent_yellow_soft : "#F5F8FE" }} />))}
              </div>
            </div>
          </div>
        </div>
        <div style={{ ...abs(400, 648, 520), textAlign: "center", fontFamily: INTER, fontWeight: 600, fontSize: 26, color: C.ink, opacity: ramp(frame, 36, 46) }}>Next.js · Web</div>
      </V>

      {/* B · open source */}
      <V o={win(frame, 90, 175)}>
        <Panel t={70} h={560}>
          <div style={{ ...abs(36, 34), display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ background: C.accent_yellow, color: C.ink, fontFamily: INTER, fontWeight: 600, fontSize: 28, padding: "10px 24px", borderRadius: 999 }}>Open source</div>
            <div style={{ fontFamily: INTER, fontSize: 26, color: C.muted_text }}>Public on GitHub</div>
          </div>
          {REPOS.map((r, i) => {
            const t = Math.min(1, ramp(frame, 98 + i * 8, 112 + i * 8));
            return (
              <div key={r[0]} style={{ ...abs(36, 130 + i * 164, 828, 136), border: `2px solid ${C.card_border}`, borderRadius: 24, boxSizing: "border-box", padding: "0 28px", display: "flex", alignItems: "center", gap: 20, opacity: t, transform: `translateY(${(1 - t) * 20}px)` }}>
                <svg width={44} height={44} viewBox="0 0 24 24" fill="none" stroke={C.ink} strokeWidth={2} strokeLinecap="round">
                  <circle cx="6" cy="5" r="2.2" /><circle cx="6" cy="19" r="2.2" /><circle cx="18" cy="8" r="2.2" />
                  <path d="M6 7.2v9.6M18 10.2c0 4-6 3-12 6.6" />
                </svg>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: MONO, fontWeight: 500, fontSize: 34, color: C.ink }}>{r[0]}</div>
                  <div style={{ fontFamily: INTER, fontSize: 24, color: C.muted_text }}>{r[1]}</div>
                </div>
                <div style={{ fontFamily: INTER, fontWeight: 600, fontSize: 26, padding: "12px 26px", borderRadius: 999, border: i === 0 && starred ? "none" : `2px solid ${C.ink}`, background: i === 0 && starred ? C.accent_yellow : "#fff", color: C.ink }}>
                  {i === 0 && starred ? "★ Starred" : "☆ Star"}
                </div>
              </div>
            );
          })}
          <div style={{ ...abs(0, 480, 900), textAlign: "center", fontFamily: INTER, fontSize: 28, color: C.muted_text, opacity: ramp(frame, 120, 132) }}>Fork it. Change it. Ship your own.</div>
          <Cursor frame={frame} pts={[{ f: 108, x: 560, y: 470 }, { f: 134, x: 770, y: 200 }]} clicks={[138]} />
        </Panel>
      </V>
    </Stage>
  );
};

/* ───────────────────────── scene 4 · custom algo ───────────────────────── */
const AlgoScene: React.FC = () => {
  const { frame, pop } = useF();
  const code = "entry = ema20 > sma50\nexit  = stop 1.5%\nrun   = on our cloud";
  return (
    <Stage>
      <Panel t={60} h={640}>
        <div style={{ ...abs(0, 0, 900, 290), background: C.dark_card_bg, boxSizing: "border-box", padding: 34 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontFamily: MONO, fontSize: 22, letterSpacing: "0.08em", color: "#8A93AD" }}>CUSTOM ALGO · YOURS</div>
            <div style={{ background: C.accent_yellow, color: C.ink, fontFamily: INTER, fontWeight: 600, fontSize: 24, padding: "8px 24px", borderRadius: 999, transform: `scale(${frame >= 32 && frame < 38 ? 0.94 : 1})` }}>Deploy</div>
          </div>
          <div style={{ marginTop: 28, fontFamily: MONO, fontSize: 32, lineHeight: 1.5, color: C.dark_card_text, whiteSpace: "pre-wrap" }}>
            <Typed text={code} start={6} frame={frame} />
          </div>
        </div>
        <div style={{ ...abs(0, 290, 900, 350), padding: "30px 40px", boxSizing: "border-box", display: "flex", flexDirection: "column", gap: 24 }}>
          <Row frame={frame} enter={34} at={38} label="Backtested on past data" />
          <Row frame={frame} enter={42} at={50} label="Deployed on our cloud" />
          <Row frame={frame} enter={50} at={62} label="Alerts switched on" />
          <Row frame={frame} enter={58} at={74} label="Running for you" hint="live" />
        </div>
        <Cursor frame={frame} pts={[{ f: 8, x: 520, y: 470 }, { f: 30, x: 800, y: 50 }]} clicks={[34]} />
      </Panel>
    </Stage>
  );
};

/* ───────────────────────── scene 5 · alerts + mood ───────────────────────── */
const arc = (cx: number, cy: number, r: number, a0: number, a1: number) => {
  const p = (a: number) => [cx + r * Math.cos((a * Math.PI) / 180), cy + r * Math.sin((a * Math.PI) / 180)];
  const [x0, y0] = p(a0);
  const [x1, y1] = p(a1);
  return `M${x0} ${y0} A${r} ${r} 0 0 1 ${x1} ${y1}`;
};

const POPUPS = [
  ["Alert", "RELIANCE crossed its 20 EMA"],
  ["Scanner", "4 stocks match your setup"],
  ["Mood", "Market looks bullish today"],
];

const AlertsScene: React.FC = () => {
  const { frame, pop } = useF();
  const theta = ((180 + 180 * (0.15 + 0.67 * pop(30))) * Math.PI) / 180;
  const cx = 180;
  const cy = 430;
  return (
    <Stage>
      <div style={abs(285, 64)}>
        <Phone w={380} h={640}>
          {POPUPS.map((p, i) => {
            const s = pop(8 + i * 14);
            return (
              <div key={i} style={{ ...abs(8, 44 + i * 92, 344, 76), background: "#fff", borderRadius: 22, boxShadow: "0 10px 28px rgba(10,12,20,0.14)", border: `1px solid ${C.card_border}`, display: "flex", alignItems: "center", gap: 14, padding: "0 16px", boxSizing: "border-box", opacity: Math.min(1, s), transform: `translateY(${(1 - s) * -40}px)`, zIndex: 3 }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: C.accent_yellow, flex: "none" }} />
                <div>
                  <div style={{ fontFamily: INTER, fontWeight: 600, fontSize: 20, color: C.ink }}>{p[0]}</div>
                  <div style={{ fontFamily: INTER, fontSize: 17, color: C.muted_text }}>{p[1]}</div>
                </div>
              </div>
            );
          })}
          <svg width={360} height={620} style={{ position: "absolute", inset: 0, opacity: ramp(frame, 20, 30) }}>
            <path d={arc(cx, cy, 120, 180, 240)} fill="none" stroke="#E3E7F2" strokeWidth={24} strokeLinecap="round" />
            <path d={arc(cx, cy, 120, 244, 296)} fill="none" stroke={C.accent_blue_soft} strokeWidth={24} strokeLinecap="round" />
            <path d={arc(cx, cy, 120, 300, 360)} fill="none" stroke={C.accent_blue} strokeWidth={24} strokeLinecap="round" />
            <line x1={cx} y1={cy} x2={cx + 98 * Math.cos(theta)} y2={cy + 98 * Math.sin(theta)} stroke={C.ink} strokeWidth={8} strokeLinecap="round" />
            <circle cx={cx} cy={cy} r={14} fill={C.ink} />
          </svg>
          <div style={{ ...abs(0, 462, 360), textAlign: "center", fontFamily: INTER, fontSize: 22, color: C.muted_text, opacity: ramp(frame, 24, 34) }}>Market mood today</div>
          <div style={{ ...abs(130, 504), background: C.accent_yellow, color: C.ink, fontFamily: INTER, fontWeight: 600, fontSize: 26, padding: "8px 26px", borderRadius: 999, opacity: ramp(frame, 50, 60) }}>Bullish</div>
        </Phone>
      </div>
      <Chip text="Auto alerts" s={pop(14)} style={{ left: 40, top: 160 }} />
      <Chip text="Mood prediction" s={pop(34)} style={{ left: 690, top: 380 }} dark />
    </Stage>
  );
};

/* ───────────────────────── scene 6 · screeners + scanners ───────────────────────── */
const MATCHES = ["RELIANCE", "TCS", "INFY", "SBIN"];

const ScreenersScene: React.FC = () => {
  const { frame, pop } = useF();
  const scan = frame >= 38;
  return (
    <Stage>
      <Panel t={70} h={600}>
        <div style={{ ...abs(36, 34), display: "flex", gap: 14 }}>
          {["Screeners", "Scanners"].map((l, i) => {
            const active = (i === 0) !== scan;
            return (
              <div key={l} style={{ fontFamily: INTER, fontWeight: 600, fontSize: 28, padding: "12px 30px", borderRadius: 999, background: active ? C.ink : "#F0F3FA", color: active ? "#fff" : C.muted_text }}>{l}</div>
            );
          })}
        </div>
        <V o={win(frame, -6, 44)}>
          <div style={{ ...abs(40, 150, 820), display: "flex", flexDirection: "column", gap: 34 }}>
            <Row frame={frame} enter={6} at={12} label="Breakout above 20-day high" />
            <Row frame={frame} enter={14} at={22} label="RSI below 30" hint="oversold" />
            <Row frame={frame} enter={22} at={32} label="Volume 2x average" />
          </div>
          <div style={{ ...abs(40, 440, 820), fontFamily: INTER, fontSize: 28, color: C.muted_text }}>Ready-made, or build your own.</div>
        </V>
        <V o={win(frame, 38, 100)}>
          <div style={{ ...abs(40, 150, 820), fontFamily: INTER, fontWeight: 600, fontSize: 32, color: C.ink }}>Scanning the market live</div>
          <div style={{ ...abs(40, 214, 820, 16), borderRadius: 8, background: C.accent_blue_soft, overflow: "hidden" }}>
            <div style={{ width: `${ramp(frame, 40, 60) * 100}%`, height: "100%", background: C.accent_yellow }} />
          </div>
          <div style={{ ...abs(40, 270, 820), display: "flex", flexWrap: "wrap", gap: 18 }}>
            {MATCHES.map((m, i) => {
              const s = pop(58 + i * 4);
              return (
                <div key={m} style={{ fontFamily: MONO, fontWeight: 500, fontSize: 30, padding: "16px 30px", borderRadius: 20, background: C.accent_yellow, color: C.ink, opacity: Math.min(1, s), transform: `scale(${0.8 + 0.2 * s})` }}>{m}</div>
              );
            })}
          </div>
          <div style={{ ...abs(40, 440, 820), fontFamily: INTER, fontSize: 28, color: C.muted_text, opacity: ramp(frame, 62, 72) }}>4 stocks match. Sample results.</div>
        </V>
      </Panel>
    </Stage>
  );
};

/* ───────────────────────── scene 7 · AI analytics ───────────────────────── */
const AIScene: React.FC = () => {
  const { frame, pop } = useF();
  const path = toPath(series(24, 77, 100, 2.4, 16), 828, 170, 10);
  return (
    <Stage>
      <Panel t={60} h={640}>
        <div style={{ ...abs(36, 30, 828), display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ width: 56, height: 56, borderRadius: 16, background: C.accent_blue_soft }} />
            <div>
              <div style={{ fontFamily: GROT, fontWeight: 700, fontSize: 38, color: C.ink }}>RELIANCE</div>
              <div style={{ fontFamily: INTER, fontSize: 22, color: C.muted_text }}>NSE</div>
            </div>
          </div>
          <div style={{ fontFamily: MONO, fontWeight: 500, fontSize: 36, color: C.ink }}>₹2,948.10</div>
        </div>
        <svg width={828} height={170} style={abs(36, 120)}>
          <defs>
            <linearGradient id="aifill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={C.accent_blue} stopOpacity={0.18} />
              <stop offset="100%" stopColor={C.accent_blue} stopOpacity={0} />
            </linearGradient>
          </defs>
          <path d={`${path} L828 170 L0 170 Z`} fill="url(#aifill)" opacity={ramp(frame, 14, 34)} />
          <path d={path} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - ramp(frame, 6, 30)} fill="none" stroke={C.accent_blue} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <div style={{ ...abs(36, 316, 828, 170), background: C.accent_blue_soft, borderRadius: 24, boxSizing: "border-box", padding: 26, opacity: ramp(frame, 22, 32) }}>
          <div style={{ fontFamily: INTER, fontWeight: 600, fontSize: 24, color: C.accent_blue, marginBottom: 12 }}>✦ AI analysis</div>
          <div style={{ fontFamily: INTER, fontSize: 32, lineHeight: 1.35, color: C.ink }}>
            <Typed text="Trend is up. Momentum is building above the 20 EMA." start={30} frame={frame} />
          </div>
        </div>
        <div style={{ ...abs(36, 520), display: "flex", gap: 16 }}>
          {["Trend · Up", "Momentum · Strong", "Risk · Medium"].map((t, i) => {
            const s = pop(58 + i * 5);
            return (
              <div key={t} style={{ background: C.accent_yellow, color: C.ink, fontFamily: INTER, fontWeight: 600, fontSize: 26, padding: "12px 24px", borderRadius: 999, opacity: Math.min(1, s), transform: `scale(${0.8 + 0.2 * s})` }}>{t}</div>
            );
          })}
        </div>
      </Panel>
    </Stage>
  );
};

/* ───────────────────────── scene 8 · outro ───────────────────────── */
const OutroScene: React.FC = () => {
  const { pop } = useF();
  const s = pop(6);
  return (
    <Stage noOut>
      <div style={{ ...abs(0, 70, 950), display: "flex", justifyContent: "center", opacity: Math.min(1, s), transform: `scale(${0.85 + 0.15 * s})` }}>
        <Wordmark size={160} />
      </div>
     <div style={{ ...abs(0, 300, 950), textAlign: "center", fontFamily: INTER, fontWeight: 600, fontSize: 42, color: C.ink, opacity: Math.min(1, pop(16)) }}>
        Download <span style={{ color: C.accent_blue }}>Free</span> from Play Store
      </div>
      <div style={{ ...abs(0, 380, 950), textAlign: "center", fontFamily: INTER, fontSize: 28, color: C.muted_text, opacity: Math.min(1, pop(22)) }}>
        Get it on Google Play · Follow {BRAND.handle}
      </div>
      <div style={{ ...abs(0, 560, 950), display: "flex", justifyContent: "center", gap: 22, transform: `translateY(${(1 - pop(30)) * 60}px)`, opacity: Math.min(1, pop(30)) }}>
        <div style={{ background: C.ink, color: "#fff", fontFamily: INTER, fontWeight: 600, fontSize: 32, padding: "22px 40px", borderRadius: 999 }}>Follow {BRAND.handle}</div>
        <div style={{ background: "#fff", border: `1px solid ${C.card_border}`, color: C.ink, fontFamily: INTER, fontWeight: 600, fontSize: 32, padding: "14px 18px 14px 40px", borderRadius: 999, display: "flex", alignItems: "center", gap: 16 }}>
          Comment
          <span style={{ background: C.accent_yellow, color: C.ink, padding: "8px 24px", borderRadius: 999 }}>{BRAND.keyword}</span>
        </div>
      </div>
    </Stage>
  );
};

/* ───────────────────────── composition ───────────────────────── */
const SCENES: { from: number; to: number; El: React.FC }[] = [
  { from: 0, to: 75, El: HookScene },
  { from: 75, to: 330, El: PipelineScene },
  { from: 330, to: 495, El: DevicesScene },
  { from: 495, to: 585, El: AlgoScene },
  { from: 585, to: 660, El: AlertsScene },
  { from: 660, to: 735, El: ScreenersScene },
  { from: 735, to: 810, El: AIScene },
  { from: 810, to: 900, El: OutroScene },
];

export const Reel: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: C.bg_base, overflow: "hidden" }}>
      <Background />

      {SCENES.map((s, i) => (
        <Sequence key={i} from={s.from} durationInFrames={s.to - s.from}>
          <div style={{ position: "absolute", ...HERO }}>
            <s.El />
          </div>
        </Sequence>
      ))}

      <Headline />

      {/* avatar: y 66%–98%, bottom-center */}
      <div style={{ position: "absolute", left: (1080 - 397) / 2, top: 1267, width: 397, height: 595 }}>
        <AvatarRig timeline={TIMELINE} />
      </div>

      {/* wordmark beside avatar; replaced by the big one in the outro */}
      <div style={{ position: "absolute", right: 54, top: 1340, opacity: 1 - ramp(frame, 806, 816) }}>
        <Wordmark size={46} />
      </div>
    </AbsoluteFill>
  );
};

export default Reel;