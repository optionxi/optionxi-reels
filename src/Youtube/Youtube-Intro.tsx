/**
 * OptionXi — Play Store app demo (no voiceover)
 * 1920×1080 · 30 fps · 1770 frames (59 s) · single file, zero extra deps
 *
 * Look: one consistent white canvas + brand blue (#1431C8). Scene changes are
 * blue "slab" wipes. Every claim is shown on screen, so it works muted.
 *
 * Script (what the viewer reads):
 *  0:00  HOOK       "Most new traders lose money."  →  "What if you could practice first?"
 *  0:04  BRAND      OptionXi · Learn the market before you risk a rupee · Free · Open source · Android + Web
 *  0:08  PRACTICE   ₹3,00,000 virtual money → pick a stock → buy → sell → +₹850, zero real risk
 *  0:20  FIND       Screeners · Top Picks · Volume Jumps
 *  0:26  OPTIONS    Option chain + OI buildup decoded (long/short buildup, covering, unwinding)
 *  0:31  ALERTS     Set a price, get pinged · Nifty / Bank Nifty breakouts
 *  0:36  AI         AI index mood gauge + plain-language "why" chat
 *  0:42  PROVE IT   Strategy backtest + Trade journal calendar
 *  0:47  PLATFORMS  Android app + Web version
 *  0:51  CTA        Practice first. Risk later. · Google Play · optionxi.com
 */
import React, {useEffect, useState} from "react";
import {
  AbsoluteFill,
  Easing,
  Img,
  Sequence,
  continueRender,
  delayRender,
  interpolate,
  interpolateColors,
  spring,
  Audio,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

export const config = {
  durationInFrames: 1770,
  fps: 30,
  width: 1920,
  height: 1080,
};

const W = config.width;
const H = config.height;
const TOTAL = config.durationInFrames;

/* ------------------------------------------------------------------ */
/*  Tokens                                                             */
/* ------------------------------------------------------------------ */
const C = {
  bg: "#FFFFFF",
  panel: "#F5F7FD",
  ink: "#0A1240",
  cobalt: "#1431C8",
  deep: "#0B1B7A",
  soft: "#E8ECFF",
  mute: "#5B6280",
  line: "#E3E7F2",
  green: "#16A34A",
  greenSoft: "#DCFCE7",
  red: "#E5484D",
  redSoft: "#FDE8E8",
  amber: "#F59E0B",
  violet: "#7C5CFC",
  sky: "#0EA5E9",
  pink: "#EC4899",
  white: "#FFFFFF",
};

const DISPLAY = '"Bricolage Grotesque", "Inter", "Arial Black", sans-serif';
const UI = '"Figtree", "Inter", system-ui, sans-serif';

/* ------------------------------------------------------------------ */
/*  Motion helpers                                                     */
/* ------------------------------------------------------------------ */
const clampX = {extrapolateLeft: "clamp", extrapolateRight: "clamp"} as const;
const OUT = Easing.bezier(0.16, 1, 0.3, 1);
const INOUT = Easing.bezier(0.7, 0, 0.2, 1);
const POP = Easing.out(Easing.back(2.2));

const p = (f: number, a: number, b: number, easing: (t: number) => number = OUT) =>
  interpolate(f, [a, b], [0, 1], {...clampX, easing});

const SOFT = {damping: 22, stiffness: 160, mass: 0.8};
const BOUNCY = {damping: 11, stiffness: 130, mass: 0.9};
const PHONE_IN = {damping: 18, stiffness: 90, mass: 1};

const fmtIN = (n: number, d = 0) =>
  n.toLocaleString("en-IN", {minimumFractionDigits: d, maximumFractionDigits: d});

const hash = (i: number) => {
  const s = Math.sin(i * 12.9898) * 43758.5453;
  return s - Math.floor(s);
};

/* ------------------------------------------------------------------ */
/*  Fonts                                                              */
/* ------------------------------------------------------------------ */
const FONT_CSS =
  "https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,200..800&family=Figtree:wght@400..800&display=block";

const useFonts = () => {
  const [handle] = useState(() => delayRender("Loading fonts"));
  useEffect(() => {
    let called = false;
    const done = () => {
      if (!called) {
        called = true;
        continueRender(handle);
      }
    };
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = FONT_CSS;
    link.onload = () => {
      Promise.all([
        document.fonts.load('800 80px "Bricolage Grotesque"'),
        document.fonts.load('700 30px "Figtree"'),
      ])
        .then(done)
        .catch(done);
    };
    link.onerror = done;
    document.head.appendChild(link);
    return () => {
      link.remove();
    };
  }, [handle]);
};

/* ------------------------------------------------------------------ */
/*  Shared building blocks                                             */
/* ------------------------------------------------------------------ */
const Backdrop: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{background: C.bg}}>
      <div
        style={{
          position: "absolute",
          left: -350 + Math.sin(f / 70) * 60,
          top: 380 + Math.cos(f / 90) * 50,
          width: 1100,
          height: 1100,
          background: "radial-gradient(closest-side, rgba(20,49,200,.10), rgba(20,49,200,0))",
        }}
      />
      <div
        style={{
          position: "absolute",
          right: -400 + Math.cos(f / 80) * 60,
          top: -420 + Math.sin(f / 60) * 50,
          width: 1200,
          height: 1200,
          background: "radial-gradient(closest-side, rgba(20,49,200,.09), rgba(20,49,200,0))",
        }}
      />
      <AbsoluteFill
        style={{
          backgroundImage: "radial-gradient(rgba(10,18,64,.10) 2px, transparent 2px)",
          backgroundSize: "64px 64px",
          backgroundPosition: `${(f * 0.4) % 64}px ${(f * 0.4) % 64}px`,
        }}
      />
    </AbsoluteFill>
  );
};

/** Kinetic text: each word rises out of a mask. */
const Rise: React.FC<{
  lines: string[];
  at: number;
  size: number;
  color?: string;
  colors?: string[];
  out?: number;
  stagger?: number;
  weight?: number;
  align?: "left" | "center";
}> = ({lines, at, size, color = C.ink, colors, out, stagger = 3, weight = 800, align = "left"}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  let n = 0;
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: align === "center" ? "center" : "flex-start",
        fontFamily: DISPLAY,
        fontWeight: weight,
        fontSize: size,
        lineHeight: 1.04,
        letterSpacing: -size * 0.035,
      }}
    >
      {lines.map((line, li) => (
        <div
          key={li}
          style={{display: "flex", columnGap: size * 0.24, whiteSpace: "nowrap", color: colors?.[li] ?? color}}
        >
          {line.split(" ").map((w, wi) => {
            const k = n++;
            const inP = spring({frame: f - at - k * stagger, fps, config: SOFT});
            const outP = out === undefined ? 0 : spring({frame: f - out - k * 2, fps, config: SOFT});
            const y = (1 - inP) * 110 - outP * 110;
            return (
              <span
                key={wi}
                style={{
                  display: "inline-block",
                  overflow: "hidden",
                  padding: `0 ${size * 0.04}px ${size * 0.16}px`,
                  margin: `0 ${-size * 0.04}px ${-size * 0.16}px`,
                }}
              >
                <span style={{display: "inline-block", transform: `translateY(${y}%)`}}>{w}</span>
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
};

const Sub: React.FC<{children: React.ReactNode; at?: number; max?: number; size?: number; center?: boolean}> = ({
  children,
  at = 24,
  max = 740,
  size = 38,
  center = false,
}) => {
  const f = useCurrentFrame();
  const v = p(f, at, at + 16);
  return (
    <div
      style={{
        marginTop: 26,
        fontFamily: UI,
        fontSize: size,
        fontWeight: 600,
        lineHeight: 1.32,
        color: C.mute,
        maxWidth: max,
        textAlign: center ? "center" : "left",
        opacity: v,
        transform: `translateY(${(1 - v) * 20}px)`,
      }}
    >
      {children}
    </div>
  );
};

const Eyebrow: React.FC<{n: string; label: string; at?: number}> = ({n, label, at = 0}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame: f - at, fps, config: SOFT});
  return (
    <div
      style={{
        alignSelf: "flex-start",
        display: "inline-flex",
        alignItems: "center",
        gap: 14,
        padding: "9px 24px 9px 9px",
        borderRadius: 999,
        background: C.soft,
        color: C.cobalt,
        fontFamily: UI,
        fontWeight: 800,
        fontSize: 24,
        letterSpacing: 2,
        marginBottom: 28,
        opacity: Math.min(1, s * 2),
        transform: `translateX(${(1 - s) * -50}px)`,
      }}
    >
      <span
        style={{
          width: 40,
          height: 40,
          borderRadius: 20,
          background: C.cobalt,
          color: C.white,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 20,
          letterSpacing: 0,
        }}
      >
        {n}
      </span>
      {label}
    </div>
  );
};

const Card: React.FC<{style?: React.CSSProperties; children?: React.ReactNode}> = ({style, children}) => (
  <div
    style={{
      background: C.white,
      borderRadius: 32,
      border: `2px solid ${C.line}`,
      boxShadow: "0 30px 70px rgba(20,49,200,.10), 0 8px 20px rgba(10,18,64,.06)",
      boxSizing: "border-box",
      ...style,
    }}
  >
    {children}
  </div>
);

const TEXT_W = 800;
const VIS_W = 840;

const Layout: React.FC<{flip?: boolean; text: React.ReactNode; visual: React.ReactNode}> = ({
  flip = false,
  text,
  visual,
}) => (
  <>
    <div
      style={{
        position: "absolute",
        top: 0,
        height: H,
        width: TEXT_W,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        ...(flip ? {right: 130} : {left: 130}),
      }}
    >
      {text}
    </div>
    <div
      style={{
        position: "absolute",
        top: 0,
        height: H,
        width: VIS_W,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        ...(flip ? {left: 100} : {right: 100}),
      }}
    >
      {visual}
    </div>
  </>
);

const LOGO_URL = "https://optionxi.com/assets/images/logo_xi.png";

/** Transparent OptionXi logo (no box behind it) */
const Logo: React.FC<{size?: number}> = ({size = 120}) => (
  <Img
    src={LOGO_URL}
    style={{
      width: size,
      height: size,
      objectFit: "contain",
      display: "block",
      filter: `drop-shadow(0 ${size * 0.12}px ${size * 0.2}px rgba(20,49,200,.28))`,
    }}
  />
);

/** Shows its children only between `from` and `to` (local frames), fading out cleanly so beats never overlap. */
const Beat: React.FC<{to?: number; children: React.ReactNode}> = ({to, children}) => {
  const f = useCurrentFrame();
  if (to !== undefined && f > to + 14) return null;
  const o = to === undefined ? 1 : 1 - p(f, to, to + 10, Easing.linear);
  return <div style={{position: "absolute", left: 0, top: 0, opacity: o}}>{children}</div>;
};

const Check: React.FC<{s?: number; c?: string}> = ({s = 16, c = "#fff"}) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12.5l4.5 4.5L19 7.5" />
  </svg>
);

const Cross: React.FC<{s?: number; c?: string}> = ({s = 16, c = "#fff"}) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={3.5} strokeLinecap="round">
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
);

const Bell: React.FC<{s?: number; c?: string; angle?: number}> = ({s = 24, c = C.amber, angle = 0}) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <g transform={`rotate(${angle} 12 3)`}>
      <path d="M6 9a6 6 0 0 1 12 0c0 6 2 7 2 7H4s2-1 2-7" />
      <path d="M10 20a2 2 0 0 0 4 0" />
    </g>
  </svg>
);

const Chip: React.FC<{
  text: string;
  bg: string;
  color: string;
  s: number;
  size?: number;
  style?: React.CSSProperties;
}> = ({text, bg, color, s, size = 28, style}) => (
  <div
    style={{
      position: "absolute",
      padding: "12px 24px",
      borderRadius: 999,
      background: bg,
      color,
      fontFamily: UI,
      fontWeight: 800,
      fontSize: size,
      whiteSpace: "nowrap",
      boxShadow: "0 18px 40px rgba(10,18,64,.18)",
      opacity: Math.min(1, s * 2),
      transform: `scale(${0.5 + 0.5 * s})`,
      zIndex: 30,
      ...style,
    }}
  >
    {text}
  </div>
);

/** Animated line chart that draws up to progress t (0–1) */
const LineChart: React.FC<{
  data: number[];
  w: number;
  h: number;
  t: number;
  color: string;
  id: string;
  sw?: number;
  area?: boolean;
}> = ({data, w, h, t, color, id, sw = 4, area = false}) => {
  const n = data.length;
  const head = t * (n - 1);
  const i0 = Math.floor(head);
  const pts: [number, number][] = [];
  for (let i = 0; i <= i0 && i < n; i++) pts.push([(i / (n - 1)) * w, h - data[i] * h]);
  if (i0 < n - 1) {
    const fr = head - i0;
    pts.push([((i0 + fr) / (n - 1)) * w, h - (data[i0] + (data[i0 + 1] - data[i0]) * fr) * h]);
  }
  const d = pts.map((q, i) => `${i ? "L" : "M"}${q[0].toFixed(1)} ${q[1].toFixed(1)}`).join(" ");
  const last = pts[pts.length - 1];
  return (
    <svg width={w} height={h} style={{overflow: "visible", display: "block"}}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={color} stopOpacity={0.26} />
          <stop offset="1" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      {area && pts.length > 1 && <path d={`${d} L${last[0]} ${h} L0 ${h} Z`} fill={`url(#${id})`} />}
      <path d={d} fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" />
      {t > 0 && <circle cx={last[0]} cy={last[1]} r={sw * 1.7} fill={color} />}
    </svg>
  );
};

/** y value (0..1) of a data series at fraction x (0..1) */
const yAt = (data: number[], x: number) => {
  const pos = Math.max(0, Math.min(1, x)) * (data.length - 1);
  const i = Math.floor(pos);
  const j = Math.min(data.length - 1, i + 1);
  return data[i] + (data[j] - data[i]) * (pos - i);
};

/* ------------------------------------------------------------------ */
/*  Phone                                                              */
/* ------------------------------------------------------------------ */
const PW = 400;
const PH = 820;

const Phone: React.FC<{children: React.ReactNode}> = ({children}) => (
  <div
    style={{
      width: PW,
      height: PH,
      borderRadius: 62,
      background: C.ink,
      padding: 14,
      boxSizing: "border-box",
      boxShadow: "0 60px 120px rgba(10,18,64,.30), inset 0 0 0 2px #2B3254",
    }}
  >
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        borderRadius: 50,
        overflow: "hidden",
        background: C.panel,
        fontFamily: UI,
        color: C.ink,
      }}
    >
      {children}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: 12,
          width: 104,
          height: 30,
          marginLeft: -52,
          borderRadius: 20,
          background: "#05070F",
          zIndex: 60,
        }}
      />
    </div>
  </div>
);

const usePhoneMotion = (delay = 4) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const rise = spring({frame: f - delay, fps, config: PHONE_IN});
  const bob = Math.sin(f / 18) * 7;
  return `perspective(1800px) translateY(${(1 - rise) * 1000 + bob}px) rotateZ(${(1 - rise) * 8}deg) rotateY(${
    -7 + (1 - rise) * -14
  }deg)`;
};

const STOCKS = [
  {t: "HDFCBANK", n: "HDFC Bank", pr: 1742.1, c: 0.2},
  {t: "WELCORP", n: "Welspun Corp", pr: 812.4, c: 2.36},
  {t: "INFY", n: "Infosys", pr: 1890.55, c: -0.6},
];

/** Phone home screen: virtual balance + watchlist. `f` is a local frame. */
const Watchlist: React.FC<{f: number}> = ({f}) => {
  const cash = Math.round(1000000 * p(f, 10, 52, Easing.out(Easing.cubic)));
  const hot = p(f, 62, 70);
  return (
    <div style={{position: "absolute", inset: 0, background: C.panel}}>
      <div style={{position: "absolute", left: 24, top: 62, fontSize: 30, fontWeight: 800}}>Practice</div>
      <div
        style={{
          position: "absolute",
          right: 22,
          top: 68,
          padding: "6px 14px",
          borderRadius: 999,
          background: C.soft,
          color: C.cobalt,
          fontSize: 14,
          fontWeight: 800,
        }}
      >
        Virtual mode
      </div>
      <div
        style={{
          position: "absolute",
          left: 18,
          right: 18,
          top: 112,
          height: 108,
          borderRadius: 24,
          background: C.cobalt,
          color: C.white,
        }}
      >
        <div style={{position: "absolute", left: 22, top: 16, fontSize: 15, fontWeight: 600, opacity: 0.8}}>Virtual balance</div>
        <div style={{position: "absolute", left: 22, top: 40, fontSize: 40, fontWeight: 800, letterSpacing: -1}}>
          ₹{fmtIN(cash)}
        </div>
      </div>
      <div style={{position: "absolute", left: 24, top: 238, fontSize: 14, fontWeight: 800, color: C.mute}}>Watchlist</div>
      {STOCKS.map((s, i) => {
        const o = p(f, 22 + i * 6, 38 + i * 6);
        const up = s.c >= 0;
        const isHot = i === 1;
        return (
          <div
            key={s.t}
            style={{
              position: "absolute",
              left: 14,
              right: 14,
              top: 266 + i * 86 + (1 - o) * 30,
              height: 76,
              borderRadius: 20,
              border: `1.5px solid ${C.line}`,
              background: isHot ? interpolateColors(hot, [0, 1], [C.white, "#E4E8FF"]) : C.white,
              opacity: o,
              display: "flex",
              alignItems: "center",
              padding: "0 16px",
              gap: 12,
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                background: C.soft,
                color: C.cobalt,
                fontWeight: 800,
                fontSize: 20,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {s.t[0]}
            </div>
            <div style={{flex: 1}}>
              <div style={{fontSize: 17, fontWeight: 800}}>{s.t}</div>
              <div style={{fontSize: 13, color: C.mute, fontWeight: 500}}>{s.n}</div>
            </div>
            <div style={{textAlign: "right"}}>
              <div style={{fontSize: 17, fontWeight: 700}}>{fmtIN(s.pr, 2)}</div>
              <div style={{fontSize: 13, fontWeight: 700, color: up ? C.green : C.red}}>
                {up ? "▲ +" : "▼ "}
                {s.c}%
              </div>
            </div>
          </div>
        );
      })}
      <div
        style={{
          position: "absolute",
          left: 18,
          right: 18,
          top: 548,
          height: 86,
          borderRadius: 20,
          background: C.white,
          border: `1.5px solid ${C.line}`,
          padding: "16px 18px",
          boxSizing: "border-box",
          opacity: p(f, 40, 56),
        }}
      >
        <div style={{fontSize: 12, fontWeight: 700, color: C.mute}}>Today's lesson</div>
        <div style={{fontSize: 19, fontWeight: 800, marginTop: 4}}>Reading a breakout</div>
      </div>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: 84,
          background: C.white,
          borderTop: `1.5px solid ${C.line}`,
          display: "flex",
          justifyContent: "space-around",
          paddingTop: 14,
        }}
      >
        {["Home", "Tools", "Learn", "Rank"].map((l, i) => (
          <div key={l} style={{display: "flex", flexDirection: "column", alignItems: "center", gap: 6}}>
            <div style={{width: 22, height: 22, borderRadius: 7, background: i === 0 ? C.cobalt : "#CBD1E4"}} />
            <div style={{fontSize: 12, fontWeight: 700, color: i === 0 ? C.cobalt : C.mute}}>{l}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  SCENE 1 — Hook                                                     */
/* ------------------------------------------------------------------ */
type Cd = {o: number; c: number; h: number; l: number};
const DOWN: Cd[] = [
  {o: 30, c: 36, h: 38, l: 28},
  {o: 36, c: 34, h: 40, l: 32},
  {o: 34, c: 42, h: 44, l: 33},
  {o: 42, c: 47, h: 50, l: 41},
  {o: 47, c: 45, h: 51, l: 43},
  {o: 45, c: 54, h: 56, l: 44},
  {o: 54, c: 59, h: 61, l: 52},
  {o: 59, c: 57, h: 63, l: 55},
  {o: 57, c: 66, h: 68, l: 56},
  {o: 66, c: 72, h: 74, l: 64},
  {o: 72, c: 70, h: 76, l: 68},
  {o: 70, c: 78, h: 80, l: 69},
  {o: 78, c: 60, h: 79, l: 58},
  {o: 60, c: 44, h: 62, l: 42},
  {o: 44, c: 30, h: 46, l: 28},
];
const UP: Cd[] = [
  {o: 30, c: 34, h: 36, l: 28},
  {o: 34, c: 32, h: 37, l: 30},
  {o: 32, c: 40, h: 42, l: 31},
  {o: 40, c: 46, h: 48, l: 39},
  {o: 46, c: 44, h: 49, l: 42},
  {o: 44, c: 53, h: 55, l: 43},
  {o: 53, c: 58, h: 60, l: 51},
  {o: 58, c: 56, h: 61, l: 54},
  {o: 56, c: 66, h: 68, l: 55},
  {o: 66, c: 72, h: 74, l: 64},
  {o: 72, c: 70, h: 75, l: 68},
  {o: 70, c: 80, h: 82, l: 69},
  {o: 80, c: 86, h: 88, l: 78},
  {o: 86, c: 84, h: 89, l: 82},
  {o: 84, c: 94, h: 96, l: 83},
];

const Candles: React.FC<{data: Cd[]; shown: number; w: number; h: number}> = ({data, shown, w, h}) => {
  const slot = w / data.length;
  const y = (v: number) => h - 20 - ((v - 24) / 74) * (h - 40);
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      {[0, 1, 2, 3].map((i) => (
        <line key={i} x1={0} x2={w} y1={30 + i * ((h - 60) / 3)} y2={30 + i * ((h - 60) / 3)} stroke={C.line} />
      ))}
      {data.map((k, i) => {
        const part = Math.max(0, Math.min(1, shown - i));
        if (part <= 0) return null;
        const cur = k.o + (k.c - k.o) * part;
        const up = k.c >= k.o;
        const col = up ? C.green : C.red;
        const cx = i * slot + slot / 2;
        const top = Math.min(y(k.o), y(cur));
        const hh = Math.max(4, Math.abs(y(k.o) - y(cur)));
        return (
          <g key={i} opacity={Math.min(1, part * 2)}>
            <line x1={cx} x2={cx} y1={y(k.h)} y2={y(k.l)} stroke={col} strokeWidth={3} />
            <rect x={cx - 11} y={top} width={22} height={hh} rx={4} fill={col} />
          </g>
        );
      })}
    </svg>
  );
};

const SceneHook: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const B = 68;
  const enter = spring({frame: f - 2, fps, config: PHONE_IN});
  const swap = p(f, B - 4, B + 6);
  const crash = interpolate(f, [6, 46], [0, 15], clampX);
  const rise = interpolate(f, [B + 4, B + 50], [0, 15], clampX);
  const badgeA = spring({frame: f - 40, fps, config: BOUNCY});
  const badgeB = spring({frame: f - B - 30, fps, config: BOUNCY});
  const bob = Math.sin(f / 16) * 6;

  return (
    <Layout
      text={
        <div style={{position: "relative", height: 420}}>
          <div style={{position: "absolute", left: 0, top: 0}}>
            <Rise lines={["Most new", "traders lose", "money."]} colors={[C.ink, C.ink, C.red]} at={2} out={B - 6} size={124} />
          </div>
          <div style={{position: "absolute", left: 0, top: 0}}>
            <Rise
              lines={["What if you", "could practice", "first?"]}
              colors={[C.ink, C.ink, C.cobalt]}
              at={B + 2}
              size={112}
            />
          </div>
        </div>
      }
      visual={
        <div
          style={{
            position: "relative",
            transform: `perspective(1800px) translateX(${(1 - enter) * 600}px) translateY(${bob}px) rotateY(${
              -8 + (1 - enter) * -18
            }deg)`,
          }}
        >
          <Card style={{width: 760, padding: 40}}>
            <div style={{display: "flex", justifyContent: "space-between", alignItems: "center", fontFamily: UI, marginBottom: 12}}>
              <span style={{fontSize: 30, fontWeight: 800}}>NIFTY 50</span>
              <span style={{fontSize: 28, fontWeight: 800, color: swap > 0.5 ? C.green : f > 40 ? C.red : C.green}}>
                {swap > 0.5 ? "▲ Practice mode" : f > 40 ? "▼ 3.8%" : "▲ 2.1%"}
              </span>
            </div>
            <div style={{position: "relative", width: 640, height: 400}}>
              <div style={{position: "absolute", inset: 0, opacity: 1 - swap}}>
                <Candles data={DOWN} shown={crash} w={640} h={400} />
              </div>
              <div style={{position: "absolute", inset: 0, opacity: swap}}>
                <Candles data={UP} shown={rise} w={640} h={400} />
              </div>
            </div>
          </Card>
          <Chip
            text="−₹12,400"
            bg={C.red}
            color={C.white}
            s={badgeA * (1 - swap)}
            size={46}
            style={{right: -30, top: -34, fontFamily: DISPLAY}}
          />
          <Chip
            text="₹0 at risk"
            bg={C.green}
            color={C.white}
            s={badgeB}
            size={42}
            style={{right: -30, top: -34, fontFamily: DISPLAY}}
          />
        </div>
      }
    />
  );
};

/* ------------------------------------------------------------------ */
/*  SCENE 2 — Brand                                                    */
/* ------------------------------------------------------------------ */
const SceneBrand: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const logo = spring({frame: f, fps, config: {damping: 12, stiffness: 120}});
  const bar = p(f, 78, 96);
  const pills = ["Free to start", "Open source", "Android + Web"];

  return (
    <AbsoluteFill style={{alignItems: "center", justifyContent: "center"}}>
      <div style={{position: "relative", width: 170, height: 170, marginBottom: 20}}>
        {[0, 0.5].map((o, i) => {
          const q = f < 6 ? 0 : (((f - 6) / 54 + o) % 1);
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                inset: 0,
                borderRadius: "50%",
                border: `4px solid ${C.cobalt}`,
                opacity: (1 - q) * 0.35,
                transform: `scale(${1 + q * 1.9})`,
              }}
            />
          );
        })}
        <div style={{transform: `scale(${logo}) rotate(${(1 - logo) * -80}deg)`}}>
          <Logo size={170} />
        </div>
      </div>
      <Rise lines={["OptionXi"]} at={10} size={130} align="center" />
      <div style={{height: 14}} />
      <Rise lines={["Learn the market before"]} at={46} size={72} align="center" weight={700} />
      <div style={{position: "relative", padding: "0 26px", marginTop: 4}}>
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 10,
            bottom: 2,
            background: C.soft,
            borderRadius: 20,
            transformOrigin: "left center",
            transform: `scaleX(${bar})`,
          }}
        />
        <div style={{position: "relative"}}>
          <Rise lines={["you risk a rupee."]} at={70} size={72} align="center" weight={700} color={C.cobalt} />
        </div>
      </div>
      <div style={{display: "flex", gap: 18, marginTop: 56}}>
        {pills.map((t, i) => {
          const s = spring({frame: f - 94 - i * 7, fps, config: SOFT});
          return (
            <div
              key={t}
              style={{
                padding: "16px 32px",
                borderRadius: 999,
                background: C.white,
                border: `2px solid ${C.line}`,
                boxShadow: "0 10px 30px rgba(20,49,200,.08)",
                fontFamily: UI,
                fontWeight: 800,
                fontSize: 32,
                color: C.ink,
                opacity: s,
                transform: `translateY(${(1 - s) * 40}px)`,
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              <span style={{width: 14, height: 14, borderRadius: 7, background: i === 1 ? C.green : C.cobalt}} />
              {t}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */
/*  SCENE 3 — Practice trading                                         */
/* ------------------------------------------------------------------ */
const DETAIL_DATA = [
  0.3, 0.34, 0.28, 0.33, 0.36, 0.31, 0.35, 0.4, 0.37, 0.42, 0.39, 0.44, 0.41, 0.46, 0.43, 0.48, 0.52, 0.5, 0.57, 0.62,
  0.6, 0.68, 0.74, 0.82,
];

const DetailScreen: React.FC<{f: number}> = ({f}) => {
  const d = p(f, 76, 96);
  const climb = p(f, 176, 198, Easing.inOut(Easing.cubic));
  const t = interpolate(f, [100, 140, 176, 198], [0, 0.5, 0.5, 1], clampX);
  const price = 812.4 + 8.5 * climb;
  const pnl = Math.round(850 * climb);
  const lesson = 1 - p(f, 176, 184);
  const pos = p(f, 178, 188);
  const sold = p(f, 200, 206);
  const toast = p(f, 206, 220);
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: C.panel,
        transform: `translateX(${(1 - d) * 372}px)`,
        boxShadow: "-20px 0 40px rgba(0,0,0,.10)",
      }}
    >
      <div style={{position: "absolute", left: 20, top: 56, fontSize: 36, fontWeight: 500, color: C.mute}}>‹</div>
      <div style={{position: "absolute", left: 56, top: 66, fontSize: 20, fontWeight: 800}}>WELCORP</div>
      <div
        style={{
          position: "absolute",
          right: 22,
          top: 66,
          padding: "5px 12px",
          borderRadius: 999,
          background: C.soft,
          color: C.cobalt,
          fontSize: 13,
          fontWeight: 800,
        }}
      >
        Virtual
      </div>
      <div style={{position: "absolute", left: 24, top: 112, fontSize: 46, fontWeight: 800, letterSpacing: -1}}>
        ₹{fmtIN(price, 2)}
      </div>
      <div style={{position: "absolute", left: 26, top: 170, fontSize: 17, fontWeight: 700, color: C.green}}>
        ▲ +{(2.36 + 1.05 * climb).toFixed(2)}% today
      </div>
      <div style={{position: "absolute", left: 21, top: 214}}>
        <LineChart data={DETAIL_DATA} w={330} h={220} t={t} color={C.green} id="d1" area />
      </div>
      <div style={{position: "absolute", left: 24, right: 24, top: 458, display: "flex", justifyContent: "space-between"}}>
        {[
          ["Open", "793.0"],
          ["High", "821.2"],
          ["Volume", "2.4×"],
        ].map(([k, v]) => (
          <div key={k} style={{width: 100}}>
            <div style={{fontSize: 13, color: C.mute, fontWeight: 600}}>{k}</div>
            <div style={{fontSize: 20, fontWeight: 800}}>{v}</div>
          </div>
        ))}
      </div>
      <div
        style={{
          position: "absolute",
          left: 20,
          right: 20,
          top: 540,
          height: 100,
          borderRadius: 20,
          background: C.white,
          border: `1.5px solid ${C.line}`,
          padding: "16px 18px",
          boxSizing: "border-box",
          opacity: lesson,
        }}
      >
        <div style={{fontSize: 12, fontWeight: 700, color: C.mute}}>Today's lesson</div>
        <div style={{fontSize: 20, fontWeight: 800, marginTop: 4}}>Reading a breakout</div>
      </div>
      <div
        style={{
          position: "absolute",
          left: 20,
          right: 20,
          top: 540,
          height: 100,
          borderRadius: 20,
          background: C.greenSoft,
          border: `1.5px solid ${C.green}`,
          padding: "16px 18px",
          boxSizing: "border-box",
          opacity: pos,
        }}
      >
        <div style={{fontSize: 13, fontWeight: 700, color: "#067647"}}>Holding 100 shares</div>
        <div style={{fontSize: 30, fontWeight: 800, color: C.green, marginTop: 2}}>+₹{fmtIN(pnl)}</div>
      </div>
      <div
        style={{
          position: "absolute",
          left: 20,
          top: 700,
          width: 172,
          height: 64,
          borderRadius: 20,
          background: C.green,
          color: C.white,
          fontSize: 20,
          fontWeight: 800,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        Buy
      </div>
      <div
        style={{
          position: "absolute",
          left: 202,
          top: 700,
          width: 170 - 2,
          height: 64,
          borderRadius: 20,
          boxSizing: "border-box",
          border: `2.5px solid ${C.red}`,
          background: interpolateColors(sold, [0, 1], [C.white, C.red]),
          color: interpolateColors(sold, [0, 1], [C.red, C.white]),
          fontSize: 20,
          fontWeight: 800,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {sold > 0.5 ? "Sold ✓" : "Sell"}
      </div>
      <div
        style={{
          position: "absolute",
          left: 16,
          right: 16,
          top: 52,
          height: 70,
          borderRadius: 22,
          background: C.ink,
          color: C.white,
          padding: "0 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          opacity: Math.min(1, toast * 2),
          transform: `translateY(${(1 - toast) * -100}px)`,
          zIndex: 20,
        }}
      >
        <span style={{fontSize: 17, fontWeight: 800}}>Sold WELCORP ✓</span>
        <span style={{fontSize: 19, fontWeight: 800, color: "#6EE7A0"}}>+₹850</span>
      </div>
    </div>
  );
};

const BuySheet: React.FC<{f: number}> = ({f}) => {
  const b = p(f, 120, 138) * (1 - p(f, 172, 186));
  const done = p(f, 158, 166);
  const glow = f < 140 ? 0 : 0.5 + 0.5 * Math.sin((f - 140) * 0.3);
  if (f < 118 || f > 190) return null;
  return (
    <>
      <div style={{position: "absolute", inset: 0, background: `rgba(5,7,15,${0.38 * b})`, zIndex: 8}} />
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 420,
          height: 372,
          background: C.white,
          borderRadius: "34px 34px 0 0",
          transform: `translateY(${(1 - b) * 400}px)`,
          zIndex: 9,
        }}
      >
        <div style={{position: "absolute", left: 26, top: 30, fontSize: 24, fontWeight: 800}}>Buy WELCORP</div>
        <div style={{position: "absolute", left: 26, top: 64, fontSize: 13, color: C.mute, fontWeight: 600}}>Market · Virtual</div>
        <div style={{position: "absolute", left: 26, right: 26, top: 98, height: 48, display: "flex", alignItems: "center", justifyContent: "space-between"}}>
          <div style={{fontSize: 16, fontWeight: 600}}>Quantity</div>
          <div
            style={{
              width: 140,
              height: 44,
              borderRadius: 14,
              border: `1.5px solid ${C.line}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-around",
              fontSize: 20,
              fontWeight: 800,
            }}
          >
            <span style={{color: C.mute}}>−</span>100<span style={{color: C.cobalt}}>+</span>
          </div>
        </div>
        <div style={{position: "absolute", left: 26, right: 26, top: 160, display: "flex", justifyContent: "space-between", fontSize: 16, fontWeight: 600}}>
          <span>Est. cost</span>
          <span style={{fontWeight: 800}}>₹81,240</span>
        </div>
        <div
          style={{
            position: "absolute",
            left: 20,
            right: 20,
            top: 204,
            height: 68,
            borderRadius: 18,
            background: "rgba(22,163,74,.10)",
            boxShadow: `0 0 0 ${3 * glow}px ${C.amber}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 20px",
            boxSizing: "border-box",
          }}
        >
          <span style={{fontSize: 16, fontWeight: 700, color: "#067647"}}>Real money at risk</span>
          <span style={{fontSize: 32, fontWeight: 800, color: C.green}}>₹0</span>
        </div>
        <div
          style={{
            position: "absolute",
            left: 24,
            right: 24,
            top: 296,
            height: 62,
            borderRadius: 20,
            background: interpolateColors(done, [0, 1], [C.cobalt, C.green]),
            color: C.white,
            fontSize: 20,
            fontWeight: 800,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {done > 0.5 ? "Bought ✓" : "Confirm buy"}
        </div>
      </div>
    </>
  );
};

const Finger: React.FC<{f: number}> = ({f}) => {
  const T = [56, 74, 98, 110, 116, 146, 154, 186, 198, 212];
  const X = [320, 186, 186, 106, 106, 186, 186, 286, 286, 330];
  const Y = [600, 367, 367, 732, 732, 747, 747, 732, 732, 600];
  const x = interpolate(f, T, X, {...clampX, easing: INOUT});
  const y = interpolate(f, T, Y, {...clampX, easing: INOUT});
  const win = (a: number, b: number) => p(f, a, a + 6) * (1 - p(f, b - 6, b));
  const opacity = Math.max(win(56, 104), win(112, 170), win(180, 222));
  const taps = [74, 116, 154, 198];
  const press = Math.max(
    ...taps.map((tp) => {
      const d = f - tp;
      return d < 0 || d > 10 ? 0 : Math.sin((d / 10) * Math.PI);
    }),
  );
  return (
    <div style={{position: "absolute", inset: 0, zIndex: 40, pointerEvents: "none"}}>
      {taps.map((tp) => {
        const d = f - tp;
        if (d < 0 || d > 18) return null;
        const size = 40 + d * 6;
        return (
          <div
            key={tp}
            style={{
              position: "absolute",
              left: x - size / 2,
              top: y - size / 2,
              width: size,
              height: size,
              borderRadius: "50%",
              border: `3px solid ${C.cobalt}`,
              opacity: (1 - d / 18) * 0.7,
            }}
          />
        );
      })}
      <div
        style={{
          position: "absolute",
          left: x - 29,
          top: y - 29,
          width: 58,
          height: 58,
          borderRadius: "50%",
          background: "rgba(10,18,64,.28)",
          border: "3px solid rgba(255,255,255,.95)",
          boxSizing: "border-box",
          opacity,
          transform: `scale(${1 - 0.22 * press})`,
        }}
      />
    </div>
  );
};

const ScenePractice: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const motion = usePhoneMotion(4);
  const real = spring({frame: f - 24, fps, config: BOUNCY});
  const zero = spring({frame: f - 134, fps, config: BOUNCY});
  const profit = spring({frame: f - 212, fps, config: BOUNCY});
  const bt = f - 212;

  const rows = ["Real market data", "Zero real money", "Climb the leaderboard"];

  return (
    <Layout
      text={
        <>
          <Eyebrow n="1" label="PRACTICE TRADING" />
          <div style={{position: "relative", height: 440}}>
            <Beat to={74}>
              <Rise lines={["Start with", "₹3,00,000 of", "virtual money."]} colors={[C.ink, C.cobalt, C.ink]} at={2} size={104} />
              <Sub at={20}>Real Indian market data. No risk, no pressure.</Sub>
            </Beat>
            {f >= 80 && (
              <Sequence from={80} layout="none">
                <Beat to={104}>
                  <Rise lines={["Pick a stock.", "Tap buy."]} colors={[C.ink, C.cobalt]} at={2} size={124} />
                  <Sub at={20}>Practice with live prices and see exactly what happens.</Sub>
                </Beat>
              </Sequence>
            )}
            {f >= 192 && (
              <Sequence from={192} layout="none">
                <Beat>
                  <Rise lines={["Sell. Learn.", "Repeat."]} colors={[C.ink, C.green]} at={2} size={124} />
                  <Sub at={20}>Build real skill before a single real rupee is on the line.</Sub>
                </Beat>
              </Sequence>
            )}
          </div>
          <div style={{display: "flex", flexWrap: "wrap", gap: 12, marginTop: 28}}>
            {rows.map((t, i) => {
              const s = spring({frame: f - 100 - i * 8, fps, config: SOFT});
              return (
                <div
                  key={t}
                  style={{
                    padding: "10px 20px",
                    borderRadius: 999,
                    background: C.white,
                    border: `2px solid ${C.line}`,
                    fontFamily: UI,
                    fontWeight: 700,
                    fontSize: 24,
                    color: C.ink,
                    opacity: s,
                    transform: `translateY(${(1 - s) * 20}px)`,
                  }}
                >
                  {t}
                </div>
              );
            })}
          </div>
        </>
      }
      visual={
        <div style={{position: "relative", width: PW, height: PH, transform: motion}}>
          <Chip text="Live NSE prices" bg={C.white} color={C.cobalt} s={real} size={24} style={{left: -250, top: 150, border: `2px solid ${C.line}`}} />
          <Chip text="₹0 at risk" bg={C.green} color={C.white} s={zero} size={28} style={{left: -240, top: 470}} />
          <Chip text="+₹850 profit" bg={C.green} color={C.white} s={profit} size={34} style={{right: -250, top: 300}} />
          {bt >= 0 && bt < 26 && (
            <div
              style={{
                position: "absolute",
                right: -60,
                top: 340,
                width: 40 + bt * 14,
                height: 40 + bt * 14,
                marginRight: -(40 + bt * 14) / 2,
                marginTop: -(40 + bt * 14) / 2,
                borderRadius: "50%",
                border: `4px solid ${C.green}`,
                opacity: (1 - bt / 26) * 0.7,
              }}
            />
          )}
          <Phone>
            <Watchlist f={f} />
            <DetailScreen f={f} />
            <BuySheet f={f} />
            <Finger f={f} />
          </Phone>
        </div>
      }
    />
  );
};

/* ------------------------------------------------------------------ */
/*  SCENE 4 — Find stocks                                              */
/* ------------------------------------------------------------------ */
const TILE = 214;
const IN = 174;

const ScreenerAnim: React.FC<{f: number}> = ({f}) => {
  const scan = p(f, 4, 50, INOUT);
  const match = [true, false, true, false];
  const bw = [0.9, 0.62, 0.8, 0.5];
  return (
    <div style={{position: "absolute", inset: 20}}>
      {match.map((m, i) => {
        const scanned = scan > (i + 0.5) / 4;
        const col = !scanned ? "rgba(10,18,64,.22)" : m ? C.green : "rgba(10,18,64,.10)";
        return (
          <div key={i} style={{position: "absolute", left: 0, right: 0, top: i * 43, height: 32, display: "flex", alignItems: "center", gap: 12}}>
            <div style={{width: 26, height: 26, borderRadius: 13, background: col, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0}}>
              {scanned && m && <Check s={15} />}
            </div>
            <div style={{height: 11, borderRadius: 6, width: `${bw[i] * 100}%`, background: col}} />
          </div>
        );
      })}
      <div
        style={{
          position: "absolute",
          left: -8,
          right: -8,
          top: scan * IN - 2,
          height: 4,
          borderRadius: 2,
          background: `linear-gradient(90deg, rgba(22,163,74,0), ${C.green}, rgba(22,163,74,0))`,
          opacity: scan > 0 && scan < 1 ? 1 : 0,
        }}
      />
    </div>
  );
};

const PickRow: React.FC<{top: number; w: number; dots: {c: string; s: number}[]; glow?: number; star?: number}> = ({
  top,
  w,
  dots,
  glow = 0,
  star = 0,
}) => (
  <div style={{position: "absolute", left: 0, right: 0, top, height: 50}}>
    <div
      style={{
        height: 50,
        borderRadius: 12,
        padding: "0 12px",
        display: "flex",
        alignItems: "center",
        gap: 6,
        boxSizing: "border-box",
        background: interpolateColors(glow, [0, 1], [C.white, "#FCE7F3"]),
        border: `2px solid ${interpolateColors(glow, [0, 1], [C.line, C.pink])}`,
      }}
    >
      <div style={{flex: 1}}>
        <div style={{height: 10, borderRadius: 5, width: `${w * 100}%`, background: "rgba(10,18,64,.2)"}} />
      </div>
      {dots.map((d, i) => (
        <div key={i} style={{width: 14, height: 14, borderRadius: 7, background: d.c, transform: `scale(${d.s})`}} />
      ))}
    </div>
    {star > 0 && (
      <div
        style={{
          position: "absolute",
          top: -12,
          right: -10,
          width: 30,
          height: 30,
          borderRadius: 15,
          background: C.pink,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transform: `scale(${star})`,
          color: C.white,
          fontSize: 17,
          fontWeight: 900,
        }}
      >
        ★
      </div>
    )}
  </div>
);

const TopPicksAnim: React.FC<{f: number}> = ({f}) => {
  const slot = 62;
  const d = [p(f, 6, 16, POP), p(f, 18, 28, POP), p(f, 30, 40, POP)];
  const move = p(f, 44, 66, Easing.inOut(Easing.cubic));
  const glow = p(f, 66, 76);
  const star = p(f, 66, 78, POP);
  const dim = "rgba(10,18,64,.28)";
  return (
    <div style={{position: "absolute", inset: 20}}>
      <PickRow top={move * slot} w={0.6} dots={[{c: dim, s: 1}]} />
      <PickRow top={(1 + move) * slot} w={0.75} dots={[{c: dim, s: 1}]} />
      <PickRow
        top={2 * (1 - move) * slot}
        w={0.85}
        glow={glow}
        star={star}
        dots={[
          {c: C.green, s: d[0]},
          {c: C.cobalt, s: d[1]},
          {c: C.amber, s: d[2]},
        ]}
      />
    </div>
  );
};

const VolumeAnim: React.FC<{f: number}> = ({f}) => {
  const bars = [0.22, 0.3, 0.24, 0.32, 0.26, 0.28, 0.22, 0.3, 0.24];
  const spike = p(f, 8, 34);
  const row = p(f, 40, 54);
  return (
    <div style={{position: "absolute", inset: 20}}>
      <div style={{display: "flex", alignItems: "flex-end", gap: 6, height: 100}}>
        {bars.map((b, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              height: 100 * (i === 5 ? b + (0.95 - b) * spike : b),
              borderRadius: 4,
              background: i === 5 ? interpolateColors(spike, [0, 1], [C.line, C.green]) : C.line,
            }}
          />
        ))}
      </div>
      <div
        style={{
          marginTop: 18,
          height: 48,
          borderRadius: 12,
          border: `2px solid ${C.green}`,
          background: C.white,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 10px",
          fontSize: 14,
          fontWeight: 800,
          opacity: row,
          transform: `translateY(${(1 - row) * 10}px)`,
        }}
      >
        <span>RELIANCE</span>
        <span style={{color: C.green}}>6.2× +2.4%</span>
      </div>
    </div>
  );
};

const FindCard: React.FC<{
  i: number;
  title: string;
  desc: string;
  tint: string;
  anim: (f: number) => React.ReactNode;
}> = ({i, title, desc, tint, anim}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const d = 46 + i * 30;
  const s = spring({frame: f - d, fps, config: {damping: 14, stiffness: 120, mass: 0.9}});
  return (
    <Card
      style={{
        width: 800,
        height: 250,
        padding: "0 28px 0 18px",
        display: "flex",
        alignItems: "center",
        gap: 26,
        opacity: Math.min(1, s * 2),
        transform: `translateX(${(1 - s) * 300}px) scale(${0.94 + 0.06 * s})`,
      }}
    >
      <div style={{position: "relative", width: TILE, height: TILE, borderRadius: 24, background: tint, flexShrink: 0}}>
        {anim(Math.max(0, f - d - 8))}
      </div>
      <div>
        <div style={{fontFamily: DISPLAY, fontWeight: 800, fontSize: 40, letterSpacing: -1}}>{title}</div>
        <div style={{fontFamily: UI, fontWeight: 500, fontSize: 24, lineHeight: 1.32, color: C.mute, marginTop: 8}}>{desc}</div>
      </div>
    </Card>
  );
};

const SceneFind: React.FC = () => (
  <Layout
    flip
    text={
      <>
        <Eyebrow n="2" label="FIND STOCKS" />
        <Rise lines={["Let the app", "scan for you."]} colors={[C.ink, C.cobalt]} at={2} size={112} />
        <Sub>Screeners, top picks and volume jumps surface the stocks that matter.</Sub>
      </>
    }
    visual={
      <div style={{display: "flex", flexDirection: "column", gap: 28}}>
        <FindCard i={0} title="Screeners" desc="Ready-made filters scan the market for breakouts and volume. No setup." tint="#E8F8EF" anim={(ff) => <ScreenerAnim f={ff} />} />
        <FindCard i={1} title="Top Picks" desc="Stocks flagged by several screeners rank higher, so the strongest ideas rise." tint="#FDE9F3" anim={(ff) => <TopPicksAnim f={ff} />} />
        <FindCard i={2} title="Volume Jumps" desc="Catch the sudden volume rush as it starts, and see which way price moved." tint="#FEF3DC" anim={(ff) => <VolumeAnim f={ff} />} />
      </div>
    }
  />
);

/* ------------------------------------------------------------------ */
/*  SCENE 5 — Options                                                  */
/* ------------------------------------------------------------------ */
const STRIKES = ["24,600", "24,700", "24,800", "24,900", "25,000"];
const CALLS = [0.9, 0.7, 0.45, 0.25, 0.15];
const PUTS = [0.15, 0.3, 0.5, 0.75, 0.9];

const OI = [
  {label: "LONG BUILDUP", color: C.green, text: "OI up, price up: buyers are adding."},
  {label: "SHORT BUILDUP", color: C.red, text: "OI up, price down: sellers are adding."},
  {label: "SHORT COVERING", color: C.sky, text: "OI down, price up: sellers are exiting."},
  {label: "LONG UNWINDING", color: C.amber, text: "OI down, price down: buyers are exiting."},
];

const SceneOptions: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const enter = spring({frame: f - 4, fps, config: {damping: 14, stiffness: 110, mass: 0.9}});
  const grow = p(f, 8, 42, Easing.out(Easing.cubic));
  const scan = p(f, 46, 100, Easing.inOut(Easing.cubic));
  const scanning = f > 46;
  const active = Math.round(scan * 4);
  const oiAt = Math.min(3, Math.floor(Math.max(0, f - 56) / 22));
  const oiOn = f >= 56;

  return (
    <Layout
      text={
        <>
          <Eyebrow n="3" label="OPTIONS" />
          <Rise lines={["Read option chain", "like a pro."]} colors={[C.ink, C.cobalt]} at={2} size={112} />
          <Sub>Calls, puts and open interest, explained in plain words.</Sub>
        </>
      }
      visual={
        <div style={{display: "flex", flexDirection: "column", gap: 22, opacity: Math.min(1, enter * 2), transform: `translateY(${(1 - enter) * 120}px)`}}>
          <Card style={{width: 840, padding: "26px 30px 22px"}}>
            <div style={{display: "flex", alignItems: "center", justifyContent: "space-between", fontFamily: UI, marginBottom: 14}}>
              <span style={{fontSize: 24, fontWeight: 800, color: C.green}}>CALL</span>
              <span style={{padding: "6px 18px", borderRadius: 999, background: C.soft, color: C.cobalt, fontSize: 22, fontWeight: 800}}>
                NIFTY · Option chain
              </span>
              <span style={{fontSize: 24, fontWeight: 800, color: C.red}}>PUT</span>
            </div>
            {STRIKES.map((s, i) => (
              <div
                key={s}
                style={{
                  height: 76,
                  margin: "3px 0",
                  borderRadius: 16,
                  display: "flex",
                  alignItems: "center",
                  background: scanning && i === active ? "rgba(20,49,200,.09)" : "transparent",
                }}
              >
                <div style={{flex: 1, display: "flex", justifyContent: "flex-end", paddingRight: 8}}>
                  <div style={{width: `${CALLS[i] * grow * 100}%`, height: 20, borderRadius: 10, background: C.green}} />
                </div>
                <div
                  style={{
                    width: 130,
                    height: 44,
                    borderRadius: 14,
                    background: i === 2 ? C.cobalt : C.panel,
                    color: i === 2 ? C.white : C.ink,
                    fontFamily: UI,
                    fontWeight: 800,
                    fontSize: 24,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {s}
                </div>
                <div style={{flex: 1, display: "flex", justifyContent: "flex-start", paddingLeft: 8}}>
                  <div style={{width: `${PUTS[i] * grow * 100}%`, height: 20, borderRadius: 10, background: C.red}} />
                </div>
              </div>
            ))}
          </Card>

          <div style={{display: "flex", gap: 14, width: 840}}>
            {OI.map((o, i) => {
              const on = oiOn && i === oiAt;
              const s = spring({frame: f - 50 - i * 5, fps, config: SOFT});
              return (
                <div
                  key={o.label}
                  style={{
                    flex: 1,
                    height: 84,
                    borderRadius: 20,
                    background: on ? o.color : C.white,
                    color: on ? C.white : C.ink,
                    border: `2px solid ${on ? o.color : C.line}`,
                    boxShadow: on ? `0 16px 34px ${o.color}55` : "0 8px 20px rgba(10,18,64,.06)",
                    fontFamily: UI,
                    fontWeight: 800,
                    fontSize: 19,
                    letterSpacing: 0.3,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    textAlign: "center",
                    padding: "0 8px",
                    opacity: s,
                    transform: `translateY(${(1 - s) * 30}px) scale(${on ? 1.05 : 1})`,
                  }}
                >
                  {o.label}
                </div>
              );
            })}
          </div>
          <div style={{height: 40, textAlign: "center", fontFamily: UI, fontWeight: 700, fontSize: 28, color: C.mute, opacity: p(f, 56, 66)}}>
            {OI[oiAt].text}
          </div>
        </div>
      }
    />
  );
};

/* ------------------------------------------------------------------ */
/*  SCENE 6 — Alerts                                                   */
/* ------------------------------------------------------------------ */
const ALERT_DATA = [
  0.32, 0.36, 0.3, 0.38, 0.42, 0.37, 0.45, 0.5, 0.46, 0.53, 0.49, 0.56, 0.6, 0.57, 0.63, 0.66, 0.64, 0.71, 0.78, 0.84,
];
const A_LEVEL = 0.68;
const A_LOW = 0.26;
const A_W = 780;
const A_H = 300;
const DRAW_A = 14;
const DRAW_B = 80;
const CROSS_T = 16.571 / 19;
const CROSS_F = DRAW_A + CROSS_T * (DRAW_B - DRAW_A);

const SceneAlerts: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const enter = spring({frame: f - 4, fps, config: {damping: 14, stiffness: 110, mass: 0.9}});
  const t = p(f, DRAW_A, DRAW_B, Easing.linear);
  const crossed = f >= CROSS_F;
  const k = Math.max(0, f - CROSS_F);
  const toggle = p(f, 6, 16);
  const banner = spring({frame: f - CROSS_F - 1, fps, config: {damping: 14, stiffness: 140, mass: 0.8}});
  const bell = crossed ? Math.sin(k * 0.9) * 22 * Math.exp(-k / 12) : 0;
  const ring = crossed ? Math.min(1, k / 22) : 0;
  const levelY = A_H - A_LEVEL * A_H;
  const lowY = A_H - A_LOW * A_H;
  const c1 = spring({frame: f - 84, fps, config: BOUNCY});
  const c2 = spring({frame: f - 96, fps, config: BOUNCY});
  const crossX = CROSS_T * A_W;

  return (
    <Layout
      flip
      text={
        <>
          <Eyebrow n="4" label="ALERTS" />
          <Rise lines={["Set a price.", "Skip the staring."]} colors={[C.ink, C.cobalt]} at={2} size={100} />
          <Sub>Get notified the second a stock or index crosses your level.</Sub>
        </>
      }
      visual={
        <div style={{display: "flex", flexDirection: "column", gap: 24, opacity: Math.min(1, enter * 2), transform: `translateY(${(1 - enter) * 120}px)`}}>
          <div style={{position: "relative"}}>
            <Card style={{width: 840, height: 520, padding: "28px 30px"}}>
              <div style={{display: "flex", justifyContent: "space-between", alignItems: "center", fontFamily: UI}}>
                <div>
                  <div style={{fontSize: 30, fontWeight: 800}}>RELIANCE</div>
                  <div style={{fontSize: 44, fontWeight: 800, letterSpacing: -1, color: crossed ? C.green : C.ink}}>
                    {crossed ? "₹1,852" : "₹1,840"}
                  </div>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    padding: "12px 18px",
                    borderRadius: 20,
                    background: C.panel,
                    border: `2px solid ${C.line}`,
                    fontSize: 22,
                    fontWeight: 700,
                  }}
                >
                  <Bell s={26} c={C.cobalt} />
                  Alert above ₹1,850
                  <div style={{width: 54, height: 32, borderRadius: 16, background: interpolateColors(toggle, [0, 1], ["#CBD1E4", C.green]), position: "relative"}}>
                    <div style={{position: "absolute", top: 3, left: 3 + toggle * 22, width: 26, height: 26, borderRadius: 13, background: C.white, boxShadow: "0 2px 6px rgba(0,0,0,.25)"}} />
                  </div>
                </div>
              </div>
              <div style={{position: "relative", width: A_W, height: A_H, marginTop: 44}}>
                <div style={{position: "absolute", left: 0, right: 0, top: levelY, borderTop: `3px dashed ${C.cobalt}`, opacity: p(f, 8, 18)}} />
                <div style={{position: "absolute", right: 0, top: levelY - 34, padding: "3px 12px", borderRadius: 10, background: C.cobalt, color: C.white, fontFamily: UI, fontWeight: 800, fontSize: 18, opacity: p(f, 8, 18)}}>
                  HIGH ₹1,850
                </div>
                <div style={{position: "absolute", left: 0, right: 0, top: lowY, borderTop: `3px dashed ${C.red}`, opacity: p(f, 12, 22)}} />
                <div style={{position: "absolute", right: 0, top: lowY + 6, padding: "3px 12px", borderRadius: 10, background: C.red, color: C.white, fontFamily: UI, fontWeight: 800, fontSize: 18, opacity: p(f, 12, 22)}}>
                  LOW ₹1,790
                </div>
                <LineChart data={ALERT_DATA} w={A_W} h={A_H} t={t} color={crossed ? C.green : C.ink} id="al" sw={5} />
                {crossed && ring < 1 && (
                  <div
                    style={{
                      position: "absolute",
                      left: crossX - (20 + ring * 70),
                      top: levelY - (20 + ring * 70),
                      width: 40 + ring * 140,
                      height: 40 + ring * 140,
                      borderRadius: "50%",
                      border: `4px solid ${C.green}`,
                      opacity: (1 - ring) * 0.8,
                    }}
                  />
                )}
              </div>
            </Card>
            <div
              style={{
                position: "absolute",
                left: 40,
                right: 40,
                top: -44,
                height: 100,
                borderRadius: 26,
                background: C.ink,
                color: C.white,
                boxShadow: "0 24px 50px rgba(10,18,64,.35)",
                display: "flex",
                alignItems: "center",
                gap: 18,
                padding: "0 26px",
                fontFamily: UI,
                opacity: Math.min(1, banner * 3),
                transform: `translateY(${(1 - banner) * -160}px)`,
                zIndex: 10,
              }}
            >
              <div style={{width: 56, height: 56, borderRadius: 28, background: "rgba(245,158,11,.2)", display: "flex", alignItems: "center", justifyContent: "center"}}>
                <Bell s={32} c={C.amber} angle={bell} />
              </div>
              <div style={{flex: 1}}>
                <div style={{fontSize: 26, fontWeight: 800}}>RELIANCE crossed ₹1,850</div>
                <div style={{fontSize: 20, opacity: 0.7, fontWeight: 500}}>Your alert triggered</div>
              </div>
              <div style={{fontSize: 20, opacity: 0.6, fontWeight: 600}}>now</div>
            </div>
          </div>

          <div style={{display: "flex", gap: 18}}>
            {[
              {t: "NIFTY broke day high", c: C.green, bg: C.greenSoft, a: "▲", s: c1},
              {t: "BANKNIFTY broke day low", c: C.red, bg: C.redSoft, a: "▼", s: c2},
            ].map((it) => (
              <div
                key={it.t}
                style={{
                  flex: 1,
                  height: 80,
                  borderRadius: 22,
                  background: it.bg,
                  border: `2px solid ${it.c}`,
                  color: it.c,
                  fontFamily: UI,
                  fontWeight: 800,
                  fontSize: 24,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 12,
                  opacity: Math.min(1, it.s * 2),
                  transform: `translateY(${(1 - it.s) * 40}px) scale(${0.9 + 0.1 * it.s})`,
                }}
              >
                <span style={{fontSize: 28}}>{it.a}</span>
                {it.t}
              </div>
            ))}
          </div>
        </div>
      }
    />
  );
};

/* ------------------------------------------------------------------ */
/*  SCENE 7 — AI                                                       */
/* ------------------------------------------------------------------ */
const polar = (cx: number, cy: number, r: number, a: number): [number, number] => [
  cx + r * Math.sin((a * Math.PI) / 180),
  cy - r * Math.cos((a * Math.PI) / 180),
];
const arc = (a0: number, a1: number, r: number) => {
  const [x0, y0] = polar(110, 110, r, a0);
  const [x1, y1] = polar(110, 110, r, a1);
  return `M${x0} ${y0} A${r} ${r} 0 0 1 ${x1} ${y1}`;
};

const AI_TEXT = "Banks led the move, and buyers outnumbered sellers. In simple words: confidence is high today.";

const SceneAI: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const e1 = spring({frame: f - 4, fps, config: {damping: 14, stiffness: 110, mass: 0.9}});
  const e2 = spring({frame: f - 96, fps, config: {damping: 14, stiffness: 110, mass: 0.9}});
  const think = p(f, 36, 76, Easing.linear);
  const settle = p(f, 76, 94, Easing.out(Easing.back(1.6)));
  const wobble = Math.sin(think * Math.PI * 6) * 0.12 * (1 - settle);
  const value = Math.max(0, Math.min(1, 0.5 + wobble + 0.32 * settle));
  const ang = -90 + value * 180;
  const bars = [0, 1, 2].map((i) => p(f, 84 + i * 8, 102 + i * 8));
  const badge = spring({frame: f - 102, fps, config: BOUNCY});
  const q = spring({frame: f - 106, fps, config: SOFT});
  const typing = f >= 120 && f < 134;
  const chars = Math.floor(interpolate(f, [134, 180], [0, AI_TEXT.length], clampX));
  const spin = f * 0.2;

  const signals: [string, number, string][] = [
    ["Trend", 0.85, C.green],
    ["Momentum", 0.78, C.green],
    ["Open interest", 0.55, C.amber],
  ];

  return (
    <Layout
      text={
        <>
          <Eyebrow n="5" label="AI TOOLS" />
          <Rise lines={["AI that explains", "every move."]} colors={[C.ink, C.cobalt]} at={2} size={100} />
          <Sub>Ask why. Get an answer you actually understand.</Sub>
        </>
      }
      visual={
        <div style={{display: "flex", flexDirection: "column", gap: 26}}>
          <Card style={{width: 840, height: 400, padding: "26px 30px", opacity: Math.min(1, e1 * 2), transform: `translateY(${(1 - e1) * 100}px)`}}>
            <div style={{display: "flex", alignItems: "center", gap: 12, fontFamily: UI}}>
              <span style={{padding: "6px 16px", borderRadius: 999, background: C.soft, color: C.cobalt, fontWeight: 800, fontSize: 22}}>NIFTY</span>
              <span style={{fontWeight: 800, fontSize: 24, color: C.mute}}>AI mood</span>
              <svg width={26} height={26} viewBox="0 0 24 24" style={{transform: `rotate(${spin}rad)`}}>
                <path d="M12 0C13 8 16 11 24 12C16 13 13 16 12 24C11 16 8 13 0 12C8 11 11 8 12 0Z" fill={C.violet} />
              </svg>
            </div>
            <div style={{display: "flex", alignItems: "center", gap: 28, marginTop: 14}}>
              <svg width={440} height={256} viewBox="0 0 220 128">
                <path d={arc(-90, -31, 90)} stroke={C.red} strokeWidth={22} fill="none" />
                <path d={arc(-29, 29, 90)} stroke={C.amber} strokeWidth={22} fill="none" />
                <path d={arc(31, 90, 90)} stroke={C.green} strokeWidth={22} fill="none" />
                <g transform={`rotate(${ang} 110 110)`}>
                  <line x1={110} y1={110} x2={110} y2={36} stroke={C.ink} strokeWidth={6} strokeLinecap="round" />
                </g>
                <circle cx={110} cy={110} r={11} fill={C.ink} />
              </svg>
              <div style={{flex: 1, display: "flex", flexDirection: "column", gap: 20}}>
                {signals.map(([label, v, col], i) => (
                  <div key={label}>
                    <div style={{fontFamily: UI, fontSize: 20, fontWeight: 700, color: C.mute, marginBottom: 6}}>{label}</div>
                    <div style={{height: 14, borderRadius: 7, background: C.line}}>
                      <div style={{width: `${v * bars[i] * 100}%`, height: "100%", borderRadius: 7, background: col}} />
                    </div>
                  </div>
                ))}
                <div
                  style={{
                    alignSelf: "flex-start",
                    padding: "8px 22px",
                    borderRadius: 12,
                    background: C.green,
                    color: C.white,
                    fontFamily: DISPLAY,
                    fontWeight: 800,
                    fontSize: 30,
                    opacity: Math.min(1, badge * 2),
                    transform: `scale(${0.4 + 0.6 * badge})`,
                    transformOrigin: "left center",
                  }}
                >
                  BULLISH
                </div>
              </div>
            </div>
          </Card>

          <Card style={{width: 840, height: 380, padding: "26px 30px", opacity: Math.min(1, e2 * 2), transform: `translateY(${(1 - e2) * 100}px)`}}>
            <div style={{display: "flex", flexDirection: "column", gap: 18, fontFamily: UI}}>
              <div
                style={{
                  alignSelf: "flex-end",
                  padding: "16px 26px",
                  borderRadius: "26px 26px 6px 26px",
                  background: C.cobalt,
                  color: C.white,
                  fontSize: 28,
                  fontWeight: 700,
                  opacity: Math.min(1, q * 2),
                  transform: `translateY(${(1 - q) * 30}px)`,
                }}
              >
                Why is Nifty up today?
              </div>
              {typing && (
                <div style={{display: "flex", gap: 8, padding: "18px 22px", borderRadius: 24, background: C.panel, alignSelf: "flex-start"}}>
                  {[0, 1, 2].map((i) => (
                    <div key={i} style={{width: 13, height: 13, borderRadius: 7, background: C.mute, transform: `translateY(${Math.sin(f / 3 + i) * -5}px)`}} />
                  ))}
                </div>
              )}
              {f >= 134 && (
                <div
                  style={{
                    maxWidth: 700,
                    padding: "20px 26px",
                    borderRadius: "26px 26px 26px 6px",
                    background: C.panel,
                    border: `2px solid ${C.line}`,
                    fontSize: 28,
                    lineHeight: 1.38,
                    fontWeight: 500,
                    minHeight: 130,
                  }}
                >
                  {AI_TEXT.slice(0, chars)}
                </div>
              )}
            </div>
          </Card>
        </div>
      }
    />
  );
};

/* ------------------------------------------------------------------ */
/*  SCENE 8 — Backtest + Journal                                       */
/* ------------------------------------------------------------------ */
const BT_DATA = [
  0.3, 0.34, 0.4, 0.52, 0.6, 0.5, 0.46, 0.42, 0.5, 0.62, 0.7, 0.66, 0.6, 0.55, 0.58, 0.64, 0.72, 0.8, 0.76, 0.7, 0.78,
  0.86, 0.92, 0.95,
];
const BT_X = [0.22, 0.52, 0.78];
const BT_HIT = [true, false, true];
const BW = 356;
const BH = 290;

const JOURNAL = [
  0, 1, 0, 2, 1, 0, 0, 1, -1, 2, 1, 0, 2, 1, 0, 2, 1, -1, 2, 2, 1, 1, 0, 2, 1, 2, -1, 2,
];

const SceneProve: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const e1 = spring({frame: f - 4, fps, config: {damping: 14, stiffness: 110, mass: 0.9}});
  const e2 = spring({frame: f - 56, fps, config: {damping: 14, stiffness: 110, mass: 0.9}});

  // backtest
  const draw = p(f, 14, 60, Easing.inOut(Easing.cubic));
  const sig = BT_X.map((_, i) => p(f, 30 + i * 12, 40 + i * 12, POP));
  const res = BT_X.map((_, i) => p(f, 70 + i * 12, 80 + i * 12, POP));
  const acc = p(f, 70, 108, Easing.out(Easing.cubic));
  const accNum = Math.round(67 * acc);

  // journal
  const reveal = p(f, 64, 120);
  const isSell = f >= 84;
  const swap = p(f, 84, 92, POP);
  const today = p(f, 118, 130, POP);
  const total = p(f, 128, 142, POP);
  const cell = 40;
  const gap = 8;
  const past = 27;

  return (
    <Layout
      flip
      text={
        <>
          <Eyebrow n="6" label="PROVE IT" />
          <Rise lines={["Test the idea.", "Track the trade."]} colors={[C.ink, C.cobalt]} at={2} size={100} />
          <Sub>Backtest your rules, then journal every trade on a P&amp;L calendar.</Sub>
        </>
      }
      visual={
        <div style={{display: "flex", gap: 28}}>
          {/* Backtest */}
          <Card style={{width: 410, height: 640, padding: "28px 26px", opacity: Math.min(1, e1 * 2), transform: `translateY(${(1 - e1) * 120}px)`}}>
            <div style={{fontFamily: DISPLAY, fontWeight: 800, fontSize: 34, letterSpacing: -1}}>Strategy Backtest</div>
            <div style={{display: "inline-block", marginTop: 10, padding: "5px 14px", borderRadius: 999, background: C.soft, color: C.cobalt, fontFamily: UI, fontWeight: 800, fontSize: 18}}>
              SMA &gt; EMA · 5 min
            </div>
            <div style={{position: "relative", width: BW, height: BH, marginTop: 28}}>
              {BT_X.map((x, i) => {
                if (res[i] <= 0) return null;
                return (
                  <div
                    key={i}
                    style={{
                      position: "absolute",
                      left: x * BW,
                      top: 0,
                      width: BW * 0.16,
                      height: BH,
                      background: BT_HIT[i] ? "rgba(22,163,74,.12)" : "rgba(229,72,77,.12)",
                      opacity: res[i],
                    }}
                  />
                );
              })}
              <LineChart data={BT_DATA} w={BW} h={BH} t={draw} color={C.green} id="bt" sw={5} />
              {BT_X.map((x, i) => {
                if (sig[i] <= 0) return null;
                const cy = BH - yAt(BT_DATA, x) * BH;
                const cx = x * BW;
                const col = BT_HIT[i] ? C.green : C.red;
                return (
                  <React.Fragment key={i}>
                    <div style={{position: "absolute", left: cx - 11, top: cy - 11, width: 22, height: 22, borderRadius: 11, background: C.cobalt, border: "4px solid #fff", boxSizing: "border-box", transform: `scale(${sig[i]})`}} />
                    {res[i] > 0 && (
                      <div style={{position: "absolute", left: cx - 18, top: cy - 58, width: 36, height: 36, borderRadius: 18, background: col, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${res[i]})`}}>
                        {BT_HIT[i] ? <Check s={20} /> : <Cross s={20} />}
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
            <div style={{marginTop: 26, height: 14, borderRadius: 7, background: C.line}}>
              <div style={{width: `${0.67 * acc * 100}%`, height: "100%", borderRadius: 7, background: C.green}} />
            </div>
            <div style={{display: "flex", alignItems: "baseline", gap: 12, marginTop: 14}}>
              <span style={{fontFamily: DISPLAY, fontWeight: 800, fontSize: 64, color: C.green, letterSpacing: -2}}>{accNum}%</span>
              <span style={{fontFamily: UI, fontWeight: 600, fontSize: 22, color: C.mute}}>of signals followed through</span>
            </div>
          </Card>

          {/* Journal */}
          <Card style={{width: 410, height: 640, padding: "28px 26px", opacity: Math.min(1, e2 * 2), transform: `translateY(${(1 - e2) * 120}px)`}}>
            <div style={{fontFamily: DISPLAY, fontWeight: 800, fontSize: 34, letterSpacing: -1}}>Trade Journal</div>
            <div style={{display: "flex", alignItems: "center", gap: 14, marginTop: 18, height: 60}}>
              <div
                style={{
                  width: 78,
                  height: 44,
                  borderRadius: 12,
                  background: (isSell ? C.red : C.cobalt) + "22",
                  border: `2px solid ${isSell ? C.red : C.cobalt}`,
                  color: isSell ? C.red : C.cobalt,
                  fontFamily: UI,
                  fontWeight: 800,
                  fontSize: 20,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transform: `scale(${isSell ? 0.8 + 0.2 * swap : 1})`,
                }}
              >
                {isSell ? "SELL" : "BUY"}
              </div>
              <div style={{flex: 1}}>
                <div style={{height: 12, borderRadius: 6, width: "85%", background: "rgba(10,18,64,.3)"}} />
                <div style={{height: 9, borderRadius: 5, width: "50%", background: "rgba(10,18,64,.14)", marginTop: 9}} />
              </div>
            </div>
            <div style={{position: "relative", width: 7 * cell + 6 * gap, height: 4 * cell + 3 * gap, margin: "30px auto 0"}}>
              {JOURNAL.map((v, i) => {
                const col = i % 7;
                const row = Math.floor(i / 7);
                const left = col * (cell + gap);
                const top = row * (cell + gap);
                const isToday = i === past;
                const s = isToday ? today : Math.max(0, Math.min(1, reveal * past - i));
                const color = v < 0 ? C.red : v === 1 ? "rgba(22,163,74,.45)" : C.green;
                return (
                  <React.Fragment key={i}>
                    <div style={{position: "absolute", left, top, width: cell, height: cell, borderRadius: 10, background: C.panel}} />
                    {v !== 0 && s > 0 && (
                      <div
                        style={{
                          position: "absolute",
                          left,
                          top,
                          width: cell,
                          height: cell,
                          borderRadius: 10,
                          background: color,
                          transform: `scale(${isToday ? Math.min(1.25, s) : Easing.out(Easing.back(1.8))(s)})`,
                          boxShadow: isToday ? `0 0 18px ${C.green}` : "none",
                        }}
                      />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
            <div style={{display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 34}}>
              <span style={{fontFamily: UI, fontWeight: 600, fontSize: 22, color: C.mute}}>This month</span>
              <span
                style={{
                  padding: "10px 22px",
                  borderRadius: 14,
                  background: C.green,
                  color: C.white,
                  fontFamily: DISPLAY,
                  fontWeight: 800,
                  fontSize: 36,
                  opacity: Math.min(1, total * 2),
                  transform: `scale(${0.4 + 0.6 * total})`,
                  transformOrigin: "right center",
                }}
              >
                +₹2,450
              </span>
            </div>
          </Card>
        </div>
      }
    />
  );
};

/* ------------------------------------------------------------------ */
/*  SCENE 9 — Platforms                                                */
/* ------------------------------------------------------------------ */
const WEB_DATA = [0.28, 0.34, 0.3, 0.4, 0.36, 0.46, 0.44, 0.54, 0.5, 0.6, 0.58, 0.68, 0.66, 0.78, 0.84];

const ScenePlatforms: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const ph = spring({frame: f - 14, fps, config: PHONE_IN});
  const br = spring({frame: f - 26, fps, config: PHONE_IN});
  const l1 = spring({frame: f - 60, fps, config: BOUNCY});
  const l2 = spring({frame: f - 70, fps, config: BOUNCY});
  const t = p(f, 40, 90, Easing.inOut(Easing.cubic));
  const bob = Math.sin(f / 18) * 6;

  return (
    <AbsoluteFill>
      <div style={{position: "absolute", left: 0, top: 80, width: W, display: "flex", flexDirection: "column", alignItems: "center"}}>
        <Rise lines={["On Android and on the web."]} at={2} size={96} align="center" colors={[C.ink]} />
        <Sub center at={18} max={1200} size={36}>
          Start on whichever you like. Same practice mode, same tools.
        </Sub>
      </div>

      {/* phone */}
      <div style={{position: "absolute", left: 350, top: 380, width: 280, height: 574}}>
        <div
          style={{
            width: PW,
            height: PH,
            transform: `perspective(1600px) translateY(${(1 - ph) * 700 + bob}px) rotateY(${(1 - ph) * -30}deg) scale(0.7)`,
            transformOrigin: "top left",
            opacity: Math.min(1, ph * 2),
          }}
        >
          <Phone>
            <Watchlist f={f} />
          </Phone>
        </div>
      </div>

      {/* browser */}
      <div
        style={{
          position: "absolute",
          left: 720,
          top: 400,
          width: 960,
          height: 540,
          opacity: Math.min(1, br * 2),
          transform: `perspective(1800px) translateX(${(1 - br) * 500}px) translateY(${-bob}px) rotateY(${(1 - br) * 22}deg)`,
        }}
      >
        <Card style={{width: 960, height: 540, overflow: "hidden", borderRadius: 28}}>
          <div style={{height: 60, display: "flex", alignItems: "center", gap: 16, padding: "0 22px", background: C.panel, borderBottom: `2px solid ${C.line}`}}>
            <div style={{display: "flex", gap: 8}}>
              {["#F4B8AE", "#F2DCA2", "#BCDDBF"].map((c) => (
                <span key={c} style={{width: 14, height: 14, borderRadius: 7, background: c}} />
              ))}
            </div>
            <div style={{flex: 1, height: 34, borderRadius: 17, background: C.white, border: `2px solid ${C.line}`, display: "flex", alignItems: "center", padding: "0 18px", fontFamily: UI, fontSize: 20, fontWeight: 600, color: C.mute}}>
              optionxi.com
            </div>
          </div>
          <div style={{display: "flex", height: 480}}>
            <div style={{width: 190, borderRight: `2px solid ${C.line}`, padding: "22px 16px", display: "flex", flexDirection: "column", gap: 10, fontFamily: UI}}>
              <Logo size={46} />
              {["Dashboard", "Tools", "Practice", "Alerts"].map((s, i) => (
                <div key={s} style={{padding: "10px 14px", borderRadius: 12, background: i === 0 ? C.soft : "transparent", color: i === 0 ? C.cobalt : C.mute, fontWeight: 700, fontSize: 20}}>
                  {s}
                </div>
              ))}
            </div>
            <div style={{flex: 1, padding: 24, fontFamily: UI}}>
              <div style={{display: "flex", gap: 18}}>
                <div style={{width: 250, height: 100, borderRadius: 20, background: C.cobalt, color: C.white, padding: "16px 20px", boxSizing: "border-box"}}>
                  <div style={{fontSize: 16, opacity: 0.8, fontWeight: 600}}>Virtual balance</div>
                  <div style={{fontSize: 34, fontWeight: 800, marginTop: 4}}>₹3,00,000</div>
                </div>
                <div style={{flex: 1, height: 100, borderRadius: 20, background: C.greenSoft, color: "#067647", padding: "16px 20px", boxSizing: "border-box"}}>
                  <div style={{fontSize: 16, fontWeight: 700}}>Today's P&amp;L</div>
                  <div style={{fontSize: 34, fontWeight: 800, color: C.green, marginTop: 4}}>+₹{fmtIN(Math.round(2450 * t))}</div>
                </div>
              </div>
              <div style={{marginTop: 20, borderRadius: 20, border: `2px solid ${C.line}`, padding: "16px 20px"}}>
                <div style={{fontSize: 18, fontWeight: 800, marginBottom: 8}}>NIFTY 50</div>
                <LineChart data={WEB_DATA} w={480} h={150} t={t} color={C.green} id="web" area sw={4} />
              </div>
            </div>
          </div>
        </Card>
      </div>

      <div style={{position: "absolute", left: 350, top: 968, width: 280, display: "flex", justifyContent: "center"}}>
        <Chip text="Android app" bg={C.cobalt} color={C.white} s={l1} size={26} style={{position: "relative"}} />
      </div>
      <div style={{position: "absolute", left: 720, top: 968, width: 960, display: "flex", justifyContent: "center"}}>
        <Chip text="Web version · optionxi.com" bg={C.white} color={C.cobalt} s={l2} size={26} style={{position: "relative", border: `2px solid ${C.line}`}} />
      </div>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */
/*  SCENE 10 — CTA                                                     */
/* ------------------------------------------------------------------ */
const CONFETTI = [C.cobalt, "#FFD23F", "#6F8BFF", C.green, C.pink];

const SceneCTA: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const logo = spring({frame: f, fps, config: {damping: 12, stiffness: 120}});
  const stats = spring({frame: f - 56, fps, config: BOUNCY});
  const count = Math.round(10000 * p(f, 60, 100, Easing.out(Easing.cubic)));
  const rating = (4.2 * p(f, 60, 100, Easing.out(Easing.cubic))).toFixed(1);
  const btn = spring({frame: f - 74, fps, config: BOUNCY});
  const url = p(f, 138, 152);
  const pulse = 1 + (f > 100 ? Math.sin(f / 7) * 0.02 : 0);
  const bt = f - 98;

  return (
    <AbsoluteFill style={{alignItems: "center", justifyContent: "center"}}>
      {f >= 74 &&
        Array.from({length: 34}).map((_, i) => {
          const tt = f - 74;
          const a = hash(i) * Math.PI * 2;
          const sp = 8 + hash(i + 50) * 15;
          const x = W / 2 + Math.cos(a) * sp * tt * 1.6;
          const y = 360 + Math.sin(a) * sp * tt * 1.1 + tt * tt * 0.5;
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: x,
                top: y,
                width: 14,
                height: 22,
                borderRadius: 4,
                background: CONFETTI[i % CONFETTI.length],
                opacity: Math.max(0, 1 - tt / 46),
                transform: `rotate(${i * 50 + tt * 20}deg)`,
              }}
            />
          );
        })}

      <div style={{transform: `scale(${logo}) rotate(${(1 - logo) * -90}deg)`}}>
        <Logo size={130} />
      </div>
      <div style={{height: 24}} />
      <Rise lines={["Practice first."]} at={0} size={124} align="center" />
      <Rise lines={["Risk later."]} at={32} size={124} align="center" color={C.cobalt} />

      <div style={{display: "flex", gap: 20, marginTop: 40, opacity: Math.min(1, stats * 2), transform: `translateY(${(1 - stats) * 30}px)`}}>
        {[
          ["★ " + rating, "on Google Play"],
          [fmtIN(count) + "+", "traders installed"],
        ].map(([a, b]) => (
          <div
            key={b}
            style={{
              padding: "14px 32px",
              borderRadius: 22,
              background: C.white,
              border: `2px solid ${C.line}`,
              boxShadow: "0 10px 30px rgba(20,49,200,.08)",
              display: "flex",
              alignItems: "baseline",
              gap: 14,
            }}
          >
            <span style={{fontFamily: DISPLAY, fontWeight: 800, fontSize: 46, color: C.cobalt, letterSpacing: -1}}>{a}</span>
            <span style={{fontFamily: UI, fontWeight: 600, fontSize: 24, color: C.mute}}>{b}</span>
          </div>
        ))}
      </div>

      <div style={{position: "relative", marginTop: 40}}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 22,
            padding: "20px 48px",
            borderRadius: 26,
            background: C.ink,
            color: C.white,
            fontFamily: UI,
            opacity: Math.min(1, btn * 2),
            transform: `translateY(${(1 - btn) * 50}px) scale(${(0.7 + 0.3 * btn) * pulse})`,
            boxShadow: "0 26px 60px rgba(10,18,64,.35)",
          }}
        >
          <svg width={56} height={56} viewBox="0 0 24 24">
            <path d="M4 2.5v19l8-9.5z" fill="#34D399" />
            <path d="M4 2.5l12 6.8-4 2.7z" fill="#60A5FA" />
            <path d="M4 21.5l12-6.8-4-2.7z" fill="#F87171" />
            <path d="M16 9.3l4 2.7-4 2.7-4-2.7z" fill="#FBBF24" />
          </svg>
          <div>
            <div style={{fontSize: 20, fontWeight: 600, opacity: 0.8, letterSpacing: 2}}>GET IT ON</div>
            <div style={{fontSize: 44, fontWeight: 800, letterSpacing: -0.5, lineHeight: 1}}>Google Play</div>
          </div>
        </div>
        {bt >= 0 && bt < 24 && (
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              width: 100 + bt * 30,
              height: 100 + bt * 30,
              marginLeft: -(100 + bt * 30) / 2,
              marginTop: -(100 + bt * 30) / 2,
              borderRadius: "50%",
              border: `4px solid ${C.cobalt}`,
              opacity: (1 - bt / 24) * 0.6,
            }}
          />
        )}
      </div>

      <div style={{marginTop: 28, fontFamily: UI, fontWeight: 800, fontSize: 38, color: C.cobalt, opacity: url, transform: `translateY(${(1 - url) * 14}px)`}}>
        optionxi.com
      </div>
      <div style={{marginTop: 10, fontFamily: UI, fontWeight: 500, fontSize: 22, color: C.mute, opacity: url}}>
        Educational use only · Virtual trading · Not investment advice
      </div>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */
/*  Chrome (logo, chapter chips, progress) + wipes                     */
/* ------------------------------------------------------------------ */
const CHAPTERS = [
  {n: "Practice", a: 255, b: 612},
  {n: "Find", a: 612, b: 792},
  {n: "Options", a: 792, b: 942},
  {n: "Alerts", a: 942, b: 1080},
  {n: "AI", a: 1080, b: 1278},
  {n: "Prove", a: 1278, b: 1432},
];

const Chrome: React.FC = () => {
  const f = useCurrentFrame();
  const show = p(f, 271, 291) * (1 - p(f, 1420, 1432));
  return (
    <>
      <div
        style={{
          position: "absolute",
          left: 60,
          right: 60,
          top: 34,
          height: 56,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          opacity: show,
          transform: `translateY(${(1 - show) * -20}px)`,
        }}
      >
        <div style={{display: "flex", alignItems: "center", gap: 14}}>
          <div style={{transform: "scale(1)"}}>
            <Logo size={48} />
          </div>
          <span style={{fontFamily: DISPLAY, fontWeight: 800, fontSize: 32, letterSpacing: -1, color: C.ink}}>OptionXi</span>
        </div>
        <div style={{display: "flex", gap: 10}}>
          {CHAPTERS.map((c) => {
            const on = f >= c.a && f < c.b;
            return (
              <div
                key={c.n}
                style={{
                  padding: "8px 20px",
                  borderRadius: 999,
                  fontFamily: UI,
                  fontWeight: 800,
                  fontSize: 20,
                  background: on ? C.cobalt : "transparent",
                  color: on ? C.white : C.mute,
                  border: `2px solid ${on ? C.cobalt : C.line}`,
                }}
              >
                {c.n}
              </div>
            );
          })}
        </div>
      </div>
      <div style={{position: "absolute", left: 0, bottom: 0, height: 6, width: W, background: "rgba(20,49,200,.08)"}}>
        <div style={{height: "100%", width: `${(f / TOTAL) * 100}%`, background: C.cobalt}} />
      </div>
    </>
  );
};

const Wipes: React.FC<{bounds: number[]}> = ({bounds}) => {
  const f = useCurrentFrame();
  const layers = [
    {c: "#6F8BFF", o: -3},
    {c: C.deep, o: 3},
    {c: C.cobalt, o: 0},
  ];
  return (
    <>
      {bounds.map((b) =>
        layers.map((L, i) => {
          const a = b + L.o - 14;
          const e = b + L.o + 14;
          if (f < a || f > e) return null;
          const x = interpolate(f, [a, e], [-100, 100], {...clampX, easing: INOUT});
          return <AbsoluteFill key={`${b}-${i}`} style={{background: L.c, transform: `translateX(${x}%)`}} />;
        }),
      )}
    </>
  );
};

/* ------------------------------------------------------------------ */
/*  Root                                                               */
/* ------------------------------------------------------------------ */
const SCENES: {name: string; from: number; dur: number; delay: number; el: React.ReactNode}[] = [
  {name: "Hook", from: 0, dur: 120, delay: 0, el: <SceneHook />},
  {name: "Brand", from: 120, dur: 135, delay: 10, el: <SceneBrand />},
  {name: "Practice", from: 255, dur: 357, delay: 10, el: <ScenePractice />},
  {name: "Find", from: 612, dur: 180, delay: 10, el: <SceneFind />},
  {name: "Options", from: 792, dur: 150, delay: 10, el: <SceneOptions />},
  {name: "Alerts", from: 942, dur: 138, delay: 10, el: <SceneAlerts />},
  {name: "AI", from: 1080, dur: 198, delay: 10, el: <SceneAI />},
  {name: "Prove", from: 1278, dur: 154, delay: 10, el: <SceneProve />},
  {name: "Platforms", from: 1432, dur: 116, delay: 10, el: <ScenePlatforms />},
  {name: "CTA", from: 1548, dur: 222, delay: 10, el: <SceneCTA />},
];

const BOUNDS = SCENES.slice(1).map((s) => s.from);

export const PlayStoreDemo: React.FC = () => {
  useFonts();
  return (
    <AbsoluteFill style={{fontFamily: UI}}>
      <Backdrop />
      <Audio src={staticFile("audio/youtube audio.mp3")} />
      {SCENES.map((s) => (
        <Sequence key={s.name} name={s.name} from={s.from} durationInFrames={s.dur}>
          <Sequence from={s.delay}>{s.el}</Sequence>
        </Sequence>
      ))}
      <Chrome />
      <Wipes bounds={BOUNDS} />
    </AbsoluteFill>
  );
};

export const Reel = PlayStoreDemo;
export const YoutubeVideoIntro = PlayStoreDemo;
export default PlayStoreDemo;