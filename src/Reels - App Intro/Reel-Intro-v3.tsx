/**
 * OptionXi — "Learn trading. Risk ₹0." tutorial reel (v3)
 * 1080x1920 · 30fps · 900 frames (30s) · NO screenshots needed
 *
 * STORY (one idea per scene, big text, simple animated mockups)
 * ─────────────────────────────────────────────────────────────
 *   0–90      HOOK        Logo + "Learn trading. Risk ₹0."
 *   90–300    STEP 1      Tap Buy -> price rises -> tap Sell -> virtual profit
 *   300–480   STEP 2      Market mood ring fills to 71% "Likely going up"
 *   480–660   STEP 3      Tap toggle -> bell rings -> notification drops
 *   660–810   OPEN SOURCE Terminal types `git clone ...`
 *   810–900   CTA         Logo, 4.2 rating, 10K+ installs, Play badge
 *
 * NOTE: the "Real market. Fake money." idea scene has been removed.
 *       Composition should be durationInFrames={900}.
 *
 * SAFE ZONE (Instagram): nothing important above y=250 or below y=1580.
 * Set DEBUG_SAFE = true to see the guides.
 *
 * Usage:
 *   import { Reel } from "./Reel-Tutorial";
 *   <Composition id="OptionXiTutorial" component={Reel}
 *     durationInFrames={900} fps={30} width={1080} height={1920} />
 */
import React from "react";
import {
  AbsoluteFill,
  Easing,
  Img,
  Sequence,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

// ───────────────────────── config ─────────────────────────
export const REEL_DURATION = 900;

export const config = {
  durationInFrames: REEL_DURATION,
  fps: 30,
  width: 1080,
  height: 1920,
};


const DEBUG_SAFE = false;
const SAFE = { top: 250, bottom: 1580, side: 60 };

const LOGO = "https://optionxi.com/assets/images/logo_xi.png";
const BADGE =
  "https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png";
const REPO = "github.com/optionxi/optionxi-flutter-community";

// ───────────────────────── tokens ─────────────────────────
const C = {
  bg: "#F6F4EF",
  ink: "#14131A",
  mute: "#6B6B76",
  indigo: "#5B5BF0",
  indigoSoft: "#E8E8FE",
  green: "#10B981",
  greenSoft: "#ECFDF5",
  red: "#F43F5E",
  redSoft: "#FFF1F3",
  amber: "#EAB308",
  card: "#FFFFFF",
  line: "#E7E5DF",
};
const FONT =
  '"Inter", "SF Pro Display", -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';
const MONO =
  '"JetBrains Mono", "SF Mono", Menlo, Consolas, "Courier New", monospace';

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ease = Easing.bezier(0.16, 1, 0.3, 1);
const prog = (f: number, a: number, b: number) =>
  interpolate(f, [a, b], [0, 1], { ...clamp, easing: ease });
const lin = (f: number, a: number, b: number) =>
  interpolate(f, [a, b], [0, 1], clamp);
const inr = (n: number) => Math.round(n).toLocaleString("en-IN");

// ───────────────────────── building blocks ─────────────────────────
const Background: React.FC = () => {
  const f = useCurrentFrame();
  const blob = (x: number, y: number, size: number, color: string, ph: number) => (
    <div
      style={{
        position: "absolute",
        left: x + Math.sin(f / 80 + ph) * 50,
        top: y + Math.cos(f / 100 + ph) * 50,
        width: size,
        height: size,
        borderRadius: "50%",
        background: color,
        filter: "blur(150px)",
        opacity: 0.45,
      }}
    />
  );
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      {blob(-250, 100, 750, "#C7D2FE", 0)}
      {blob(650, 1000, 800, "#FDE2D3", 2)}
      {blob(0, 1500, 600, "#DDD6FE", 4)}
    </AbsoluteFill>
  );
};

const SafeGuide: React.FC = () =>
  DEBUG_SAFE ? (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: SAFE.top, borderTop: "3px dashed red" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: SAFE.bottom, borderTop: "3px dashed red" }} />
      <div style={{ position: "absolute", top: 0, bottom: 0, left: SAFE.side, borderLeft: "3px dashed red" }} />
      <div style={{ position: "absolute", top: 0, bottom: 0, right: SAFE.side, borderRight: "3px dashed red" }} />
    </AbsoluteFill>
  ) : null;

/** Fades a scene in and out. `dur` = scene length in frames. */
const Scene: React.FC<{ dur: number; children: React.ReactNode }> = ({ dur, children }) => {
  const f = useCurrentFrame();
  const o = Math.min(lin(f, 0, 8), 1 - lin(f, dur - 8, dur));
  return <AbsoluteFill style={{ opacity: o }}>{children}</AbsoluteFill>;
};

/** Words spring in one by one. `hl` colours specific words. */
const Words: React.FC<{
  text: string;
  size?: number;
  hl?: Record<string, string>;
  delay?: number;
  weight?: number;
  color?: string;
}> = ({ text, size = 80, hl = {}, delay = 0, weight = 800, color = C.ink }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        gap: `0 ${size * 0.26}px`,
        fontFamily: FONT,
        fontSize: size,
        fontWeight: weight,
        lineHeight: 1.08,
        letterSpacing: -size * 0.025,
        color,
        textAlign: "center",
      }}
    >
      {text.split(" ").map((w, i) => {
        const s = spring({ frame: f - delay - i * 4, fps, config: { damping: 14, stiffness: 120 } });
        const clean = w.replace(/[^\w%₹]/g, "");
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              opacity: s,
              transform: `translateY(${(1 - s) * 40}px) scale(${0.88 + s * 0.12})`,
              filter: `blur(${(1 - s) * 10}px)`,
              color: hl[clean] ?? color,
            }}
          >
            {w}
          </span>
        );
      })}
    </div>
  );
};

const Tag: React.FC<{ text: string; opacity?: number }> = ({ text, opacity = 1 }) => (
  <div style={{ fontFamily: MONO, fontSize: 30, fontWeight: 600, color: C.mute, letterSpacing: 0.5, opacity }}>
    {text}
  </div>
);

/** Caption pinned to the top safe area. Place inside a Scene. */
const Caption: React.FC<{
  tag: string;
  big: string;
  small?: string;
  hl?: Record<string, string>;
}> = ({ tag, big, small, hl }) => {
  const f = useCurrentFrame();
  return (
    <div
      style={{
        position: "absolute",
        top: 268,
        left: 70,
        right: 70,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 14,
      }}
    >
      <Tag text={tag} opacity={prog(f, 0, 12)} />
      <Words text={big} hl={hl} />
      {small && (
        <div style={{ fontFamily: FONT, fontSize: 36, fontWeight: 500, color: C.mute, opacity: prog(f, 16, 32) }}>
          {small}
        </div>
      )}
    </div>
  );
};

/** White rounded mockup card that springs in. */
const Panel: React.FC<{
  x?: number;
  y: number;
  w?: number;
  h?: number;
  at?: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ x = 90, y, w = 900, h, at = 10, children, style }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = Math.min(1, spring({ frame: f - at, fps, config: { damping: 14, stiffness: 100 } }));
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: w,
        height: h,
        boxSizing: "border-box",
        padding: 36,
        borderRadius: 48,
        background: C.card,
        border: `2px solid ${C.line}`,
        boxShadow: "0 40px 80px rgba(20,19,26,.16)",
        fontFamily: FONT,
        opacity: s,
        transform: `translateY(${(1 - s) * 60}px)`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

/** Floating pop-in pill (absolute in scene) */
const TONES = {
  white: { bg: "#fff", fg: C.ink, bd: C.line },
  green: { bg: C.greenSoft, fg: "#047857", bd: "#A7F3D0" },
  indigo: { bg: C.indigoSoft, fg: C.indigo, bd: "#C7C7FB" },
  red: { bg: C.redSoft, fg: "#BE123C", bd: "#FECDD3" },
};
const Chip: React.FC<{
  at: number;
  until?: number;
  x?: number;
  y: number;
  center?: boolean;
  text: string;
  icon?: string;
  tone?: keyof typeof TONES;
  size?: number;
}> = ({ at, until, x = 0, y, center, text, icon, tone = "white", size = 34 }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (f < at || (until !== undefined && f > until)) return null;
  const s = Math.min(1.1, spring({ frame: f - at, fps, config: { damping: 11, stiffness: 150 } }));
  const out = until ? lin(f, until - 8, until) : 0;
  const t = TONES[tone];
  const pill = (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "18px 30px",
        borderRadius: 999,
        background: t.bg,
        color: t.fg,
        border: `2px solid ${t.bd}`,
        boxShadow: "0 18px 40px rgba(20,19,26,.18)",
        fontFamily: FONT,
        fontSize: size,
        fontWeight: 800,
        whiteSpace: "nowrap",
        opacity: Math.min(1, s) * (1 - out),
        transform: `translateY(${(1 - Math.min(1, s)) * 30}px) scale(${0.8 + 0.2 * s})`,
      }}
    >
      {icon && <span>{icon}</span>}
      {text}
    </div>
  );
  if (center) {
    return (
      <div style={{ position: "absolute", left: 0, right: 0, top: y, display: "flex", justifyContent: "center" }}>
        {pill}
      </div>
    );
  }
  return <div style={{ position: "absolute", left: x, top: y }}>{pill}</div>;
};

// ───────────────────────── cursor ─────────────────────────
type KF = { f: number; x: number; y: number; tap?: boolean };

const Cursor: React.FC<{ kf: KF[] }> = ({ kf }) => {
  const f = useCurrentFrame();
  const fs = kf.map((k) => k.f);
  const x = interpolate(f, fs, kf.map((k) => k.x), { ...clamp, easing: ease });
  const y = interpolate(f, fs, kf.map((k) => k.y), { ...clamp, easing: ease });
  const op = Math.min(lin(f, fs[0], fs[0] + 8), 1 - lin(f, fs[fs.length - 1] - 6, fs[fs.length - 1]));
  let dip = 0;
  kf.forEach((k) => {
    if (!k.tap) return;
    const t = (f - k.f) / 10;
    if (t >= 0 && t <= 1) dip = Math.max(dip, Math.sin(Math.PI * t));
  });
  return (
    <>
      {kf.map((k, i) => {
        if (!k.tap) return null;
        const p = prog(f, k.f, k.f + 20);
        if (f < k.f || p >= 1) return null;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: k.x - (14 + 54 * p),
              top: k.y - (14 + 54 * p),
              width: 28 + 108 * p,
              height: 28 + 108 * p,
              borderRadius: "50%",
              border: `4px solid ${C.indigo}`,
              background: "rgba(91,91,240,.12)",
              opacity: 1 - p,
            }}
          />
        );
      })}
      <svg
        width={64}
        height={76}
        viewBox="0 0 30 40"
        style={{
          position: "absolute",
          left: x,
          top: y,
          opacity: op,
          transform: `scale(${1 - dip * 0.15})`,
          transformOrigin: "0 0",
          filter: "drop-shadow(0 6px 10px rgba(0,0,0,.35))",
        }}
      >
        <polygon
          points="0,0 0,30 8,23 14,36 20,33 14,21 25,21"
          fill="#fff"
          stroke="#111"
          strokeWidth={2}
          strokeLinejoin="round"
        />
      </svg>
    </>
  );
};

// ───────────────────────── chart ─────────────────────────
const N = 40;
const SERIES = Array.from({ length: N }, (_, i) => {
  const t = i / (N - 1);
  return Math.min(1, Math.max(0, 0.12 + t * 0.7 + 0.07 * Math.sin(i * 1.3) + 0.04 * Math.sin(i * 3.1)));
});

/** Line chart that draws left→right. p = 0..1 */
const LineChart: React.FC<{ w: number; h: number; p: number; color?: string }> = ({ w, h, p, color = C.green }) => {
  const upto = p * (N - 1);
  const k = Math.floor(upto);
  const pts: [number, number][] = [];
  for (let i = 0; i <= k && i < N; i++) pts.push([(i / (N - 1)) * w, h - SERIES[i] * h]);
  if (k < N - 1) {
    const fr = upto - k;
    const v = SERIES[k] + (SERIES[k + 1] - SERIES[k]) * fr;
    pts.push([(upto / (N - 1)) * w, h - v * h]);
  }
  const d = pts.map((q, i) => `${i ? "L" : "M"}${q[0].toFixed(1)},${q[1].toFixed(1)}`).join(" ");
  const area = `${d} L${pts[pts.length - 1][0].toFixed(1)},${h} L0,${h} Z`;
  const head = pts[pts.length - 1];
  return (
    <svg width={w} height={h} style={{ overflow: "visible" }}>
      {[0.25, 0.5, 0.75].map((g) => (
        <line key={g} x1={0} x2={w} y1={h * g} y2={h * g} stroke={C.line} strokeWidth={2} strokeDasharray="8 10" />
      ))}
      <path d={area} fill={color} opacity={0.12} />
      <path d={d} fill="none" stroke={color} strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={head[0]} cy={head[1]} r={16} fill={color} opacity={0.25} />
      <circle cx={head[0]} cy={head[1]} r={9} fill={color} />
    </svg>
  );
};

const Ring: React.FC<{
  pct: number;
  size: number;
  stroke: number;
  color: string;
  track: string;
  children?: React.ReactNode;
}> = ({ pct, size, stroke, color, track, children }) => {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div style={{ width: size, height: size, position: "relative" }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} stroke={track} strokeWidth={stroke} fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={color}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - pct / 100)}
        />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
        {children}
      </div>
    </div>
  );
};

// ───────────────────────── SCENE 0 · hook (0–90) ─────────────────────────
const Hook: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({ frame: f, fps, config: { damping: 9, stiffness: 110 } });
  const pulse = 1 + 0.06 * Math.sin(Math.max(0, f - 40) / 4) * (1 - lin(f, 40, 90));
  return (
    <Scene dur={96}>
      {[0, 1, 2].map((i) => {
        const p = prog(f, 4 + i * 8, 44 + i * 8);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: 540 - 380 * p,
              top: 520 - 380 * p,
              width: 760 * p,
              height: 760 * p,
              borderRadius: "50%",
              border: `3px solid rgba(91,91,240,${0.45 * (1 - p)})`,
            }}
          />
        );
      })}
      <Img
        src={LOGO}
        style={{
          position: "absolute",
          left: 540 - 95,
          top: 425,
          width: 190,
          height: 190,
          objectFit: "contain",
          transform: `scale(${pop})`,
          filter: "drop-shadow(0 20px 50px rgba(91,91,240,.45))",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 680,
          left: 70,
          right: 70,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 8,
        }}
      >
        <Tag text="// free · open source" opacity={prog(f, 10, 24)} />
        <Sequence from={16} layout="none">
          <Words text="Learn trading." size={112} />
        </Sequence>
        <div style={{ transform: `scale(${pulse})` }}>
          <Sequence from={30} layout="none">
            <Words text="Risk ₹0." size={150} hl={{ "₹0": C.indigo }} weight={900} />
          </Sequence>
        </div>
        <div style={{ fontFamily: FONT, fontSize: 42, fontWeight: 500, color: C.mute, marginTop: 14, opacity: prog(f, 52, 70) }}>
          Real market data. Virtual money.
        </div>
      </div>
    </Scene>
  );
};

// ───────────────────────── SCENE 1 · step 1 trade (210f) ─────────────────────────
const TRADE_KF: KF[] = [
  { f: 20, x: 860, y: 1500 },
  { f: 55, x: 300, y: 1190 },
  { f: 60, x: 300, y: 1190, tap: true }, // Buy
  { f: 120, x: 760, y: 1220 },
  { f: 150, x: 760, y: 1190 },
  { f: 155, x: 760, y: 1190, tap: true }, // Sell
  { f: 200, x: 860, y: 1500 },
];

const Trade: React.FC = () => {
  const f = useCurrentFrame();
  const bought = f >= 60;
  const sold = f >= 155;
  const p = lin(f, 10, 155);
  const price = bought ? interpolate(f, [60, 150], [2950, 3075], clamp) : 2950;
  const pnl = sold ? 1250 : Math.max(0, (price - 2950) * 10);
  const buyPress = f >= 60 && f < 70 ? 0.94 : 1;
  const sellPress = f >= 155 && f < 165 ? 0.94 : 1;
  return (
    <Scene dur={210}>
      <Caption tag="// step 1 · practice trade" big="Pick a stock. Buy. Sell." small="Just like real. No real money." hl={{ Buy: C.green, Sell: C.red }} />

      <Panel y={560} h={780} at={8}>
        {/* header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <div
              style={{
                width: 76,
                height: 76,
                borderRadius: 24,
                background: C.indigoSoft,
                color: C.indigo,
                fontSize: 40,
                fontWeight: 900,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              R
            </div>
            <div>
              <div style={{ fontSize: 38, fontWeight: 900 }}>RELIANCE</div>
              <div style={{ fontSize: 24, fontWeight: 600, color: C.mute }}>NSE · Practice</div>
            </div>
          </div>
          <div style={{ fontSize: 52, fontWeight: 900, color: price > 2950 ? C.green : C.ink }}>₹{inr(price)}</div>
        </div>

        <div style={{ marginTop: 40 }}>
          <LineChart w={828} h={320} p={p} />
        </div>

        {/* Buy / Sell buttons */}
        <div style={{ position: "absolute", left: 40, right: 40, top: 570, display: "flex", gap: 36 }}>
          <div
            style={{
              flex: 1,
              height: 120,
              borderRadius: 34,
              background: bought ? "#A7F3D0" : C.green,
              color: bought ? "#047857" : "#fff",
              fontSize: 46,
              fontWeight: 900,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transform: `scale(${buyPress})`,
            }}
          >
            {bought ? "Bought ✓" : "BUY"}
          </div>
          <div
            style={{
              flex: 1,
              height: 120,
              borderRadius: 34,
              background: sold ? "#FECDD3" : C.red,
              color: sold ? "#BE123C" : "#fff",
              fontSize: 46,
              fontWeight: 900,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transform: `scale(${sellPress})`,
            }}
          >
            {sold ? "Sold ✓" : "SELL"}
          </div>
        </div>
      </Panel>

      <Chip at={66} until={150} y={700} x={150} icon="🛒" text="Bought 10 shares" tone="indigo" />
      <Chip at={100} until={150} y={790} x={560} icon="⬆" text={`+₹${inr(pnl)}`} tone="green" size={30} />
      <Chip at={162} y={1400} center icon="💰" text="+₹1,250 virtual profit" tone="green" size={44} />

      <Cursor kf={TRADE_KF} />
    </Scene>
  );
};

// ───────────────────────── SCENE 2 · step 2 mood (180f) ─────────────────────────
const Mood: React.FC = () => {
  const f = useCurrentFrame();
  const pct = interpolate(f, [14, 80], [0, 71], { ...clamp, easing: ease });
  return (
    <Scene dur={180}>
      <Caption tag="// step 2 · market mood" big="Up or down today?" small="One look. One answer." hl={{ Up: C.indigo, down: C.red }} />

      <Panel
        y={620}
        h={760}
        at={8}
        style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 26 }}
      >
        <Ring pct={pct} size={430} stroke={40} color={C.indigo} track={C.indigoSoft}>
          <span style={{ fontSize: 130, fontWeight: 900, letterSpacing: -4 }}>{Math.round(pct)}%</span>
        </Ring>
        <div style={{ fontSize: 56, fontWeight: 900, opacity: prog(f, 70, 88) }}>Likely going up ↗</div>

        {/* 12 voters, 11 say up */}
        <div style={{ display: "flex", gap: 14, marginTop: 8 }}>
          {Array.from({ length: 12 }, (_, i) => {
            const at = 80 + i * 4;
            const up = i < 11;
            const k = Math.min(1, Math.max(0, (f - at) / 8));
            return (
              <div
                key={i}
                style={{
                  width: 50,
                  height: 50,
                  borderRadius: 25,
                  background: k > 0 ? (up ? C.indigo : C.red) : "#E5E7EB",
                  color: "#fff",
                  fontSize: 28,
                  fontWeight: 900,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transform: `scale(${0.7 + 0.3 * k})`,
                }}
              >
                {k > 0 ? (up ? "↑" : "↓") : ""}
              </div>
            );
          })}
        </div>
      </Panel>

      <Chip at={130} y={1430} center icon="🗳️" text="11 of 12 signals say up" tone="indigo" />
    </Scene>
  );
};

// ───────────────────────── SCENE 3 · step 3 alerts (180f) ─────────────────────────
const ALERT_KF: KF[] = [
  { f: 20, x: 860, y: 1250 },
  { f: 48, x: 850, y: 905 },
  { f: 52, x: 850, y: 905, tap: true }, // toggle
  { f: 100, x: 900, y: 1000 },
  { f: 125, x: 940, y: 1250 },
];

const Alerts: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const on = lin(f, 52, 62);
  const ring = f >= 90 ? Math.sin((f - 90) * 1.2) * 22 * (1 - lin(f, 90, 140)) : 0;
  const n = spring({ frame: f - 92, fps, config: { damping: 12, stiffness: 120 } });
  return (
    <Scene dur={180}>
      <Caption tag="// step 3 · alerts" big="Get told. Don't watch." small="Set it once. Phone does the rest." hl={{ told: C.green }} />

      <Panel y={600} h={460} at={8}>
        <div style={{ display: "flex", justifyContent: "center", fontSize: 140, transform: `rotate(${ring}deg)`, transformOrigin: "50% 10%" }}>
          🔔
        </div>
        <div
          style={{
            position: "absolute",
            left: 36,
            right: 36,
            top: 250,
            height: 130,
            borderRadius: 32,
            background: "#F7F7FB",
            border: `2px solid ${C.line}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 34px",
            boxSizing: "border-box",
          }}
        >
          <div>
            <div style={{ fontSize: 34, fontWeight: 900 }}>Nifty up-chance above 70%</div>
            <div style={{ fontSize: 24, fontWeight: 600, color: C.mute }}>Alert me</div>
          </div>
          <div
            style={{
              width: 130,
              height: 72,
              borderRadius: 36,
              background: on > 0.5 ? C.green : "#D1D5DB",
              position: "relative",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: 6,
                left: 6 + on * 58,
                width: 60,
                height: 60,
                borderRadius: 30,
                background: "#fff",
                boxShadow: "0 4px 10px rgba(0,0,0,.25)",
              }}
            />
          </div>
        </div>
      </Panel>

      {/* notification drops in */}
      {f >= 92 && (
        <div
          style={{
            position: "absolute",
            left: 90,
            top: 1110,
            width: 900,
            boxSizing: "border-box",
            padding: "26px 30px",
            borderRadius: 40,
            background: "#fff",
            border: `3px solid ${C.green}`,
            boxShadow: "0 30px 70px rgba(20,19,26,.28)",
            display: "flex",
            alignItems: "center",
            gap: 24,
            fontFamily: FONT,
            opacity: Math.min(1, n),
            transform: `translateY(${(1 - Math.min(1.1, n)) * -160}px)`,
          }}
        >
          <Img src={LOGO} style={{ width: 90, height: 90, objectFit: "contain", borderRadius: 22 }} />
          <div>
            <div style={{ fontSize: 24, color: C.mute, fontWeight: 700 }}>OPTIONXI · now</div>
            <div style={{ fontSize: 36, fontWeight: 900, lineHeight: 1.2 }}>Nifty up chance is above 70%</div>
          </div>
        </div>
      )}

      <Chip at={125} y={1350} x={90} text="Screeners" tone="white" size={32} />
      <Chip at={138} y={1350} x={380} text="Option chain" tone="white" size={32} />
      <Chip at={151} y={1350} x={720} text="Alerts" tone="green" size={32} />

      <Cursor kf={ALERT_KF} />
    </Scene>
  );
};

// ───────────────────────── SCENE 4 · open source (150f) ─────────────────────────
const OpenSource: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const cmd = `git clone https://${REPO}.git`;
  const typed = cmd.slice(0, Math.floor(prog(f, 30, 100) * cmd.length));
  const cardS = Math.min(1, spring({ frame: f - 14, fps, config: { damping: 14, stiffness: 100 } }));
  const pills = [
    { t: "MIT license", at: 80 },
    { t: "Flutter app", at: 96 },
    { t: "Contributions welcome", at: 112 },
  ];
  return (
    <Scene dur={150}>
      <Caption tag="// open source" big="Free. Open code." small="Anyone can check it. Anyone can help." hl={{ Open: C.indigo }} />
      <div
        style={{
          position: "absolute",
          top: 700,
          left: 70,
          right: 70,
          padding: 38,
          borderRadius: 36,
          background: C.ink,
          color: "#fff",
          boxShadow: "0 40px 80px rgba(20,19,26,.35)",
          opacity: cardS,
          transform: `translateY(${(1 - cardS) * 60}px)`,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
          <div style={{ fontFamily: MONO, fontSize: 22, letterSpacing: 2, color: "rgba(255,255,255,.55)" }}>TERMINAL</div>
          <div style={{ fontFamily: FONT, fontSize: 22, fontWeight: 800, background: C.indigo, padding: "8px 20px", borderRadius: 999 }}>
            {typed.length >= cmd.length ? "Copied ✓" : "Copy"}
          </div>
        </div>
        <div style={{ fontFamily: MONO, fontSize: 32, lineHeight: 1.5, wordBreak: "break-all", minHeight: 150 }}>
          <span style={{ color: "#A5B4FC" }}>$ </span>
          {typed}
          <span style={{ opacity: Math.floor(f / 8) % 2 === 0 ? 1 : 0, color: "#A5B4FC" }}>▌</span>
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          top: 1060,
          left: 70,
          right: 70,
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: 18,
        }}
      >
        {pills.map((p) => {
          const k = Math.min(1, spring({ frame: f - p.at, fps, config: { damping: 9, stiffness: 160 } }));
          const on = f >= p.at;
          return (
            <div
              key={p.t}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "16px 28px",
                borderRadius: 999,
                background: "#fff",
                border: `2px solid ${C.line}`,
                fontFamily: FONT,
                fontSize: 32,
                fontWeight: 800,
                opacity: on ? k : 0.0,
                transform: `scale(${0.8 + 0.2 * k})`,
                boxShadow: "0 14px 30px rgba(20,19,26,.12)",
              }}
            >
              <span style={{ color: C.green }}>✓</span>
              {p.t}
            </div>
          );
        })}
      </div>
    </Scene>
  );
};

// ───────────────────────── SCENE 5 · CTA (90f) ─────────────────────────
const Outro: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const logoS = spring({ frame: f, fps, config: { damping: 9, stiffness: 100 } });
  const starFill = prog(f, 12, 40) * (4.2 / 5);
  const installs = Math.round(prog(f, 18, 46) * 10);
  const badgeS = Math.min(1, spring({ frame: f - 40, fps, config: { damping: 12 } }));
  const glow = 0.6 + 0.4 * Math.sin(f / 8);
  const box: React.CSSProperties = {
    width: 400,
    padding: "26px 0",
    borderRadius: 32,
    background: "#fff",
    border: `2px solid ${C.line}`,
    boxShadow: "0 24px 50px rgba(20,19,26,.12)",
    textAlign: "center",
  };
  return (
    <Scene dur={96}>
      <div
        style={{
          position: "absolute",
          top: 300,
          left: 0,
          right: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          fontFamily: FONT,
          color: C.ink,
        }}
      >
        <Img
          src={LOGO}
          style={{
            width: 180,
            height: 180,
            objectFit: "contain",
            transform: `scale(${logoS}) rotate(${(1 - logoS) * -30}deg)`,
            filter: `drop-shadow(0 20px ${50 * glow}px rgba(91,91,240,.5))`,
          }}
        />
        <div style={{ marginTop: 26 }}>
          <Sequence from={8} layout="none">
            <Words text="Try it. It's free." size={96} hl={{ free: C.indigo }} />
          </Sequence>
        </div>

        <div style={{ display: "flex", gap: 28, marginTop: 64, opacity: prog(f, 10, 22) }}>
          <div style={box}>
            <div style={{ fontSize: 80, fontWeight: 900, lineHeight: 1 }}>{(starFill * 5).toFixed(1)}</div>
            <div style={{ position: "relative", display: "inline-block", fontSize: 46, letterSpacing: 4, marginTop: 8 }}>
              <span style={{ color: "#E5E7EB" }}>★★★★★</span>
              <span
                style={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  width: `${starFill * 100}%`,
                  overflow: "hidden",
                  whiteSpace: "nowrap",
                  color: C.amber,
                }}
              >
                ★★★★★
              </span>
            </div>
            <div style={{ fontSize: 24, color: C.mute, marginTop: 4, fontWeight: 600 }}>Play Store rating</div>
          </div>
          <div style={{ ...box, display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <div style={{ fontSize: 80, fontWeight: 900, lineHeight: 1 }}>{installs}K+</div>
            <div style={{ fontSize: 24, color: C.mute, marginTop: 8, minHeight: 44, fontWeight: 600 }}>Installs</div>
          </div>
        </div>

        <div
          style={{
            marginTop: 60,
            opacity: badgeS,
            transform: `translateY(${(1 - badgeS) * 60}px) scale(${0.9 + 0.1 * badgeS})`,
          }}
        >
          <Img src={BADGE} style={{ width: 560 }} />
        </div>
        <div style={{ marginTop: 24, fontSize: 32, fontWeight: 700, color: C.indigo, opacity: prog(f, 46, 60) }}>
          Search “OptionXi” on Google Play
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          bottom: 360,
          left: 80,
          right: 80,
          textAlign: "center",
          fontFamily: FONT,
          fontSize: 22,
          color: C.mute,
          opacity: prog(f, 56, 72),
        }}
      >
        Practice trading uses virtual money. Not investment advice.
      </div>
    </Scene>
  );
};

// ───────────────────────── root ─────────────────────────
export const REEL_FRAMES = 900;

export const Reel: React.FC = () => (
  <AbsoluteFill style={{ background: C.bg }}>
    <Background />

    <Sequence from={0} durationInFrames={96}>
      <Hook />
    </Sequence>
    <Sequence from={90} durationInFrames={210}>
      <Trade />
    </Sequence>
    <Sequence from={300} durationInFrames={180}>
      <Mood />
    </Sequence>
    <Sequence from={480} durationInFrames={180}>
      <Alerts />
    </Sequence>
    <Sequence from={660} durationInFrames={150}>
      <OpenSource />
    </Sequence>
    <Sequence from={810} durationInFrames={90}>
      <Outro />
    </Sequence>

    <SafeGuide />
  </AbsoluteFill>
);

export default Reel;