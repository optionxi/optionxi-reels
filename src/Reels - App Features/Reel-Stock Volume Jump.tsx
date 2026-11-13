/**
 * OptionXi — "Volume Jumps" · Instagram Reel
 * 1080×1920 · 30 fps · 900 frames (30 s) · single file, zero extra deps
 *
 * STORY (plain-language)
 *  1. HOOK       0–4 s     "The price moves last. The crowd moves first."  (dots rush into a stock)
 *  2. THE IDEA   4–10 s    "Volume = how many people are trading." Bars stay calm → one explodes to 6.2×.
 *  3. DIRECTION  10–14 s   "Which way did it go?" Buyers rushing in ↑ / sellers rushing out ↓.
 *  4. IN THE APP 14–22 s   Phone: live Volume Jumps card → View all → replay any past day → Strict / Relaxed.
 *  5. COMING SOON 22–26 s  Pick your number (8×, 30× …) → get a notification.
 *  6. CTA        26–30 s   "Volume Jumps. Live now." + Play Store badge.
 *
 * Safe space comes from shared/safe-area.tsx. Set DEBUG_SAFE = true there to see it.
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
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {getSafe, SafeGuide} from "../shared/safe-area";

export const config = {
  durationInFrames: 900,
  fps: 30,
  width: 1080,
  height: 1920,
};
const SAFE = getSafe(config);

/* ------------------------------------------------------------------ */
/*  Tokens                                                             */
/* ------------------------------------------------------------------ */
const C = {
  cobalt: "#2A3BFF",
  ink: "#0B1020",
  paper: "#F4F6FB",
  white: "#FFFFFF",
  sun: "#FFD23F",
  green: "#12B76A",
  red: "#F04438",
  mute: "#5B6280",
  line: "#E3E7F2",
};

const DISPLAY = '"Bricolage Grotesque", "Noto Sans", "Arial Black", sans-serif';
const UI = '"Figtree", "Noto Sans", system-ui, sans-serif';

const LOGO = "https://optionxi.com/assets/images/logo_xi.png";
const BADGE = "https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png";

const R = 18; // circle-wipe length between scenes

/* ------------------------------------------------------------------ */
/*  Motion helpers                                                     */
/* ------------------------------------------------------------------ */
const clampX = {extrapolateLeft: "clamp", extrapolateRight: "clamp"} as const;
const OUT = Easing.bezier(0.16, 1, 0.3, 1);
const INOUT = Easing.bezier(0.7, 0, 0.2, 1);

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
/*  Fonts (loaded once, render waits for them)                         */
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
/*  Building blocks                                                    */
/* ------------------------------------------------------------------ */
const Band: React.FC<{top: number; children: React.ReactNode}> = ({top, children}) => (
  <div
    style={{
      position: "absolute",
      top,
      left: 0,
      width: config.width,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
    }}
  >
    {children}
  </div>
);

const Stack: React.FC<{children: React.ReactNode}> = ({children}) => (
  <div style={{position: "absolute", inset: 0, display: "flex", justifyContent: "center"}}>{children}</div>
);

/** Kinetic text: each word rises out of a mask. `out` makes it leave upward. */
const Rise: React.FC<{
  lines: string[];
  at: number;
  size: number;
  color?: string;
  colors?: string[];
  out?: number;
  stagger?: number;
  weight?: number;
}> = ({lines, at, size, color = C.ink, colors, out, stagger = 3, weight = 800}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  let n = 0;
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
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

/** Circle-wipe scene shell */
const Scene: React.FC<{bg: string; origin?: [number, number]; children: React.ReactNode}> = ({
  bg,
  origin,
  children,
}) => {
  const f = useCurrentFrame();
  const wiping = origin !== undefined && f < R;
  const r = p(f, 0, R, INOUT) * 2400;
  return (
    <AbsoluteFill
      style={{
        background: bg,
        overflow: "hidden",
        clipPath: wiping && origin ? `circle(${r}px at ${origin[0]}px ${origin[1]}px)` : undefined,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

/** The "quiet bars → one spikes → 6×" icon. */
const SpikeIcon: React.FC<{
  size: number;
  start?: number;
  loop?: number;
  base?: string;
  hi?: string;
  tile?: string;
  badgeBg?: string;
  badgeFg?: string;
}> = ({
  size,
  start = 0,
  loop = 100,
  base = "rgba(42,59,255,.45)",
  hi = C.green,
  tile = "rgba(42,59,255,.12)",
  badgeBg = C.green,
  badgeFg = "#fff",
}) => {
  const f = useCurrentFrame();
  const g = Math.max(0, f - start);
  const t = (g % loop) / loop;
  const up = p(t, 0.1, 0.4, Easing.out(Easing.back(2)));
  const badge = p(t, 0.4, 0.55, Easing.out(Easing.back(2)));
  const out = 1 - p(t, 0.9, 1);
  const bars = [0.35, 0.5, 0.4, 0.45, 0.38];
  return (
    <div style={{position: "relative", width: size, height: size}}>
      <div
        style={{
          width: size,
          height: size,
          boxSizing: "border-box",
          borderRadius: size * 0.28,
          background: tile,
          padding: size * 0.18,
          display: "flex",
          alignItems: "flex-end",
          gap: size * 0.03,
          opacity: out,
        }}
      >
        {bars.map((b, i) => {
          const h = i === 2 ? b + (1 - b) * up : b;
          return (
            <div
              key={i}
              style={{
                flex: 1,
                height: `${h * 100}%`,
                borderRadius: size * 0.04,
                background: i === 2 ? interpolateColors(Math.max(0, Math.min(1, up)), [0, 1], [base, hi]) : base,
              }}
            />
          );
        })}
      </div>
      <div
        style={{
          position: "absolute",
          top: -size * 0.12,
          right: -size * 0.2,
          padding: `${size * 0.03}px ${size * 0.09}px`,
          background: badgeBg,
          borderRadius: size * 0.14,
          color: badgeFg,
          fontFamily: UI,
          fontWeight: 800,
          fontSize: size * 0.26,
          transform: `scale(${badge * out})`,
        }}
      >
        6×
      </div>
    </div>
  );
};

const Pill: React.FC<{text: string; bg: string; color: string; style?: React.CSSProperties}> = ({
  text,
  bg,
  color,
  style,
}) => (
  <div
    style={{
      padding: "6px 12px",
      borderRadius: 999,
      background: bg,
      color,
      fontSize: 12,
      fontWeight: 700,
      whiteSpace: "nowrap",
      ...style,
    }}
  >
    {text}
  </div>
);

/* ------------------------------------------------------------------ */
/*  Phone mockup                                                       */
/* ------------------------------------------------------------------ */
const PW = 390;
const PH = 820;
const BZ = 14;
const PHONE_LEFT = (config.width - (PW + BZ * 2)) / 2;
const PHONE_TOP = 580;

const StatusBar: React.FC = () => (
  <div style={{position: "absolute", top: 0, left: 0, right: 0, height: 54, zIndex: 25, pointerEvents: "none"}}>
    <div style={{position: "absolute", left: 34, top: 16, fontSize: 16, fontWeight: 700}}>9:41</div>
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
      }}
    />
    <div
      style={{
        position: "absolute",
        right: 30,
        top: 16,
        fontSize: 14,
        fontWeight: 700,
        display: "flex",
        gap: 6,
        alignItems: "center",
      }}
    >
      5G
      <span
        style={{
          width: 24,
          height: 12,
          borderRadius: 4,
          border: `2px solid ${C.ink}`,
          boxSizing: "border-box",
          position: "relative",
          display: "inline-block",
        }}
      >
        <span style={{position: "absolute", top: 1.5, left: 1.5, bottom: 1.5, right: 5, background: C.ink, borderRadius: 1.5}} />
      </span>
    </div>
  </div>
);

const PhoneShell: React.FC<{children: React.ReactNode; scale?: number}> = ({children, scale = 1.06}) => (
  <div
    style={{
      width: PW + BZ * 2,
      height: PH + BZ * 2,
      padding: BZ,
      boxSizing: "border-box",
      borderRadius: 68,
      background: "#05070F",
      boxShadow: "0 60px 110px rgba(0,0,0,.45), inset 0 0 0 2px #2B3254",
      transform: `scale(${scale})`,
      transformOrigin: "50% 0%",
    }}
  >
    <div
      style={{
        position: "relative",
        width: PW,
        height: PH,
        borderRadius: 54,
        overflow: "hidden",
        background: C.paper,
        fontFamily: UI,
        color: C.ink,
      }}
    >
      {children}
      <StatusBar />
    </div>
  </div>
);

/** Finger / tap indicator. Coordinates are inside the phone screen. */
const Finger: React.FC<{
  T: number[];
  X: number[];
  Y: number[];
  taps: number[];
  show: [number, number][];
}> = ({T, X, Y, taps, show}) => {
  const f = useCurrentFrame();
  const x = interpolate(f, T, X, {...clampX, easing: INOUT});
  const y = interpolate(f, T, Y, {...clampX, easing: INOUT});
  const win = (a: number, b: number) => p(f, a, a + 6) * (1 - p(f, b - 6, b));
  const opacity = Math.max(...show.map(([a, b]) => win(a, b)));
  const press = Math.max(
    ...taps.map((t) => {
      const d = f - t;
      return d < 0 || d > 10 ? 0 : Math.sin((d / 10) * Math.PI);
    }),
  );
  return (
    <div style={{position: "absolute", inset: 0, zIndex: 40, pointerEvents: "none"}}>
      {taps.map((t) => {
        const d = f - t;
        if (d < 0 || d > 18) return null;
        const size = 40 + d * 6;
        return (
          <div
            key={t}
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
          background: "rgba(11,16,32,.30)",
          border: "3px solid rgba(255,255,255,.92)",
          boxSizing: "border-box",
          opacity,
          transform: `scale(${1 - 0.22 * press})`,
        }}
      />
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  Shared stock row data                                              */
/* ------------------------------------------------------------------ */
type Row = {t: string; r: number; up: boolean; sub: string; price: number; pct: number};

const fmtPct = (n: number) => `${n >= 0 ? "+" : ""}${n.toFixed(1)}%`;

/** Big card used on the cobalt/sun scenes (outside the phone). */
const BigRow: React.FC<{d: Row; top: number; at: number}> = ({d, top, at}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame: f - at, fps, config: BOUNCY});
  const col = d.up ? C.green : C.red;
  return (
    <div
      style={{
        position: "absolute",
        left: SAFE.left,
        top,
        width: SAFE.w,
        boxSizing: "border-box",
        padding: "30px 34px",
        borderRadius: 40,
        background: C.white,
        display: "flex",
        alignItems: "center",
        gap: 26,
        boxShadow: "0 24px 50px rgba(11,16,32,.18)",
        opacity: Math.min(1, s * 2),
        transform: `translateY(${(1 - s) * 120}px) scale(${0.92 + 0.08 * s})`,
      }}
    >
      <div
        style={{
          width: 104,
          height: 104,
          borderRadius: 28,
          background: `${col}22`,
          color: col,
          fontFamily: DISPLAY,
          fontWeight: 800,
          fontSize: 54,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {d.t[0]}
      </div>
      <div style={{flex: 1, minWidth: 0}}>
        <div style={{display: "flex", alignItems: "center", gap: 16}}>
          <span style={{fontFamily: UI, fontWeight: 800, fontSize: 48, color: C.ink}}>{d.t}</span>
          <span
            style={{
              fontFamily: UI,
              fontWeight: 800,
              fontSize: 34,
              color: col,
              background: `${col}22`,
              borderRadius: 14,
              padding: "4px 14px",
            }}
          >
            {d.up ? "▲" : "▼"} {d.r.toFixed(1)}×
          </span>
        </div>
        <div style={{fontFamily: UI, fontWeight: 600, fontSize: 30, color: C.mute, marginTop: 6}}>{d.sub}</div>
      </div>
      <div style={{textAlign: "right", fontFamily: UI}}>
        <div style={{fontWeight: 800, fontSize: 46, color: C.ink}}>₹{fmtIN(d.price, 2)}</div>
        <div style={{fontWeight: 800, fontSize: 36, color: col, marginTop: 2}}>{fmtPct(d.pct)}</div>
      </div>
    </div>
  );
};

const Tag: React.FC<{text: string; bg: string; fg?: string; top: number; at: number}> = ({
  text,
  bg,
  fg = C.white,
  top,
  at,
}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame: f - at, fps, config: SOFT});
  return (
    <div
      style={{
        position: "absolute",
        left: SAFE.left + 8,
        top,
        padding: "10px 26px",
        borderRadius: 999,
        background: bg,
        color: fg,
        fontFamily: UI,
        fontWeight: 800,
        fontSize: 30,
        letterSpacing: 1.5,
        opacity: s,
        transform: `translateX(${(1 - s) * -60}px)`,
      }}
    >
      {text}
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  SCENE 1 — Hook: the crowd arrives first                            */
/* ------------------------------------------------------------------ */
const CX = config.width / 2;
const CY = 1190;
const RUSH = 64;

const Hook: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const pop = spring({frame: f - 12, fps, config: BOUNCY});
  const pulse = f < 56 ? 0 : Math.max(0, Math.sin(((f - 56) / 14) * Math.PI)) * (f < 98 ? 1 : 0);

  return (
    <>
      <Band top={SAFE.y0}>
        <div style={{position: "relative", width: config.width, height: 360}}>
          <Stack>
            <Rise lines={["The price", "moves last."]} at={6} out={50} size={112} color={C.paper} />
          </Stack>
          <Stack>
            <Rise lines={["The crowd", "moves first."]} colors={[C.paper, C.sun]} at={56} size={116} />
          </Stack>
        </div>
      </Band>

      {/* quiet phase: a few people wander near the stock */}
      {Array.from({length: 6}, (_, i) => {
        const a = (i / 6) * Math.PI * 2 + 0.3;
        const bob = Math.sin((f + i * 17) / 14) * 7;
        return (
          <div
            key={`q${i}`}
            style={{
              position: "absolute",
              left: CX + Math.cos(a) * 240 - 13,
              top: CY + Math.sin(a) * 190 + bob - 13,
              width: 26,
              height: 26,
              borderRadius: 13,
              background: C.paper,
              opacity: 0.8 * p(f, 12 + i * 3, 22 + i * 3),
            }}
          />
        );
      })}

      {/* rush phase: the crowd floods in */}
      {Array.from({length: RUSH}, (_, i) => {
        const a = hash(i + 3) * Math.PI * 2;
        const b = hash(i + 51) * Math.PI * 2;
        const sR = 1100 + hash(i + 9) * 300;
        const eR = 210 + hash(i + 21) * 150;
        const d0 = 58 + hash(i + 40) * 26;
        const t = p(f, d0, d0 + 26, Easing.out(Easing.cubic));
        const sx = CX + Math.cos(a) * sR;
        const sy = CY + Math.sin(a) * sR * 0.55;
        const ex = CX + Math.cos(b) * eR;
        const ey = CY + Math.sin(b) * eR * 0.75;
        const size = 22 + hash(i + 70) * 12;
        return (
          <div
            key={`r${i}`}
            style={{
              position: "absolute",
              left: sx + (ex - sx) * t - size / 2,
              top: sy + (ey - sy) * t - size / 2,
              width: size,
              height: size,
              borderRadius: size / 2,
              background: i % 7 === 0 ? C.sun : C.paper,
              opacity: Math.min(1, t * 5) * 0.95,
            }}
          />
        );
      })}

      <div
        style={{
          position: "absolute",
          left: CX - 100,
          top: CY - 100,
          transform: `scale(${(0.5 + 0.5 * pop) * (1 + 0.06 * pulse)})`,
          opacity: p(f, 12, 18),
        }}
      >
        <SpikeIcon
          size={200}
          start={56}
          loop={140}
          base="rgba(255,255,255,.55)"
          hi={C.sun}
          tile="rgba(255,255,255,.16)"
          badgeBg={C.sun}
          badgeFg={C.ink}
        />
      </div>
    </>
  );
};

/* ------------------------------------------------------------------ */
/*  SCENE 2 — The idea: volume = crowd size                            */
/* ------------------------------------------------------------------ */
const BARS = [0.34, 0.42, 0.36, 0.46, 0.4, 0.38, 0.44, 0.35, 0.41, 0.37, 0.43, 0.39];
const SPIKE_I = 8;
const CH_H = 400;

const Idea: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const spike = p(f, 100, 134, Easing.out(Easing.back(1.4)));
  const ratio = (1 + 5.2 * Math.max(0, Math.min(1, spike))).toFixed(1);
  const stamp = spring({frame: f - 142, fps, config: BOUNCY});
  const card = spring({frame: f - 14, fps, config: SOFT});

  return (
    <>
      <Band top={SAFE.y0}>
        <div style={{position: "relative", width: config.width, height: 290}}>
          <Stack>
            <Rise lines={["Volume = how many", "people are trading."]} at={6} out={84} size={80} color={C.ink} />
          </Stack>
          <Stack>
            <Rise lines={["Then suddenly,", "everyone shows up."]} colors={[C.ink, C.cobalt]} at={92} size={90} />
          </Stack>
        </div>
      </Band>

      <div
        style={{
          position: "absolute",
          left: SAFE.left,
          top: 690,
          width: SAFE.w,
          boxSizing: "border-box",
          padding: "34px 36px 30px",
          borderRadius: 44,
          background: C.white,
          border: `2px solid ${C.line}`,
          boxShadow: "0 30px 70px rgba(42,59,255,.12)",
          opacity: Math.min(1, card * 2),
          transform: `translateY(${(1 - card) * 80}px)`,
        }}
      >
        <div style={{display: "flex", alignItems: "baseline", justifyContent: "space-between", fontFamily: UI}}>
          <span style={{fontWeight: 800, fontSize: 40}}>RELIANCE</span>
          <span style={{fontWeight: 600, fontSize: 28, color: C.mute}}>today</span>
        </div>

        <div style={{position: "relative", height: CH_H + 90, marginTop: 8}}>
          <div style={{position: "absolute", left: 0, right: 0, bottom: CH_H * 0.52, borderTop: `3px dashed ${C.mute}66`}} />
          <div
            style={{
              position: "absolute",
              left: 0,
              bottom: CH_H * 0.52 + 10,
              fontFamily: UI,
              fontSize: 26,
              fontWeight: 700,
              color: C.mute,
            }}
          >
            usual
          </div>

          <div style={{position: "absolute", left: 0, right: 0, bottom: 0, height: CH_H, display: "flex", alignItems: "flex-end", gap: 12}}>
            {BARS.map((b, i) => {
              const rise = p(f, 8 + i * 3, 32 + i * 3);
              const isS = i === SPIKE_I;
              const h = isS ? (b + (0.95 - b) * spike) * rise : b * rise;
              return (
                <div key={i} style={{flex: 1, height: "100%", position: "relative"}}>
                  <div
                    style={{
                      position: "absolute",
                      bottom: 0,
                      left: 0,
                      right: 0,
                      height: h * CH_H,
                      borderRadius: 12,
                      background: isS
                        ? interpolateColors(Math.max(0, Math.min(1, spike)), [0, 1], ["#C9CFE6", C.green])
                        : "#C9CFE6",
                    }}
                  />
                  {isS && (
                    <div
                      style={{
                        position: "absolute",
                        bottom: h * CH_H + 12,
                        left: "50%",
                        transform: "translateX(-50%)",
                        whiteSpace: "nowrap",
                        fontFamily: DISPLAY,
                        fontWeight: 800,
                        fontSize: 64,
                        letterSpacing: -2,
                        color: C.green,
                        opacity: Math.max(0, Math.min(1, spike)),
                      }}
                    >
                      {ratio}×
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div
            style={{
              position: "absolute",
              left: 6,
              top: 14,
              padding: "12px 24px",
              borderRadius: 16,
              background: C.sun,
              color: C.ink,
              fontFamily: UI,
              fontWeight: 800,
              fontSize: 36,
              letterSpacing: 1,
              opacity: Math.min(1, stamp * 2),
              transform: `rotate(-6deg) scale(${stamp})`,
              transformOrigin: "0% 50%",
            }}
          >
            VOLUME JUMP
          </div>
        </div>

        <div style={{fontFamily: UI, fontWeight: 600, fontSize: 28, color: C.mute, textAlign: "center"}}>
          Each bar = a few minutes of trading
        </div>
      </div>
    </>
  );
};

/* ------------------------------------------------------------------ */
/*  SCENE 3 — Direction: buyers or sellers?                            */
/* ------------------------------------------------------------------ */
const UP_ROW: Row = {t: "RELIANCE", r: 6.2, up: true, sub: "10:42 AM", price: 2948, pct: 2.4};
const DN_ROW: Row = {t: "TATASTEEL", r: 7.8, up: false, sub: "11:15 AM", price: 138.2, pct: -1.9};

const Direction: React.FC = () => (
  <>
    <Band top={SAFE.y0}>
      <Rise lines={["Which way", "did it go?"]} at={6} size={104} color={C.ink} />
    </Band>

    <Tag text="RISING · BUYERS RUSHING IN" bg={C.green} top={600} at={22} />
    <BigRow d={UP_ROW} top={670} at={26} />

    <Tag text="FALLING · SELLERS RUSHING OUT" bg={C.red} top={960} at={52} />
    <BigRow d={DN_ROW} top={1030} at={56} />

    <Band top={1330}>
      <Rise lines={["Bigger × = bigger rush."]} at={80} size={60} color={C.ink} weight={700} />
    </Band>
  </>
);

/* ------------------------------------------------------------------ */
/*  SCENE 4 — In the app (phone)                                       */
/* ------------------------------------------------------------------ */
const ROWH = 74;

const NEW_ROW: Row = {t: "RELIANCE", r: 6.2, up: true, sub: "2:11 PM · just now", price: 2948, pct: 2.4};
const FEED: Row[] = [
  {t: "ICICIBANK", r: 5.4, up: true, sub: "2:05 PM · 3 min ago", price: 1312.4, pct: 1.8},
  {t: "SBIN", r: 6.9, up: false, sub: "1:58 PM · 10 min ago", price: 812.15, pct: -1.4},
  {t: "INFY", r: 5.1, up: true, sub: "1:40 PM · 28 min ago", price: 1884, pct: 2.1},
];

const MiniRow: React.FC<{d: Row; top: number; bg?: string; opacity?: number; h?: number}> = ({
  d,
  top,
  bg = "transparent",
  opacity = 1,
  h = ROWH,
}) => {
  const col = d.up ? C.green : C.red;
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top,
        height: h,
        boxSizing: "border-box",
        padding: "0 16px",
        display: "flex",
        alignItems: "center",
        gap: 12,
        background: bg,
        opacity,
      }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: 11,
          background: `${col}22`,
          color: col,
          fontWeight: 800,
          fontSize: 17,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {d.t[0]}
      </div>
      <div style={{flex: 1, minWidth: 0}}>
        <div style={{display: "flex", alignItems: "center", gap: 7}}>
          <span style={{fontSize: 15, fontWeight: 800}}>{d.t}</span>
          <span
            style={{
              fontSize: 11,
              fontWeight: 800,
              color: col,
              background: `${col}22`,
              borderRadius: 6,
              padding: "2px 6px",
            }}
          >
            {d.up ? "▲" : "▼"} {d.r.toFixed(1)}×
          </span>
        </div>
        <div style={{fontSize: 11.5, color: C.mute, fontWeight: 500, marginTop: 3}}>{d.sub}</div>
      </div>
      <div style={{textAlign: "right"}}>
        <div style={{fontSize: 14, fontWeight: 800}}>₹{fmtIN(d.price, 2)}</div>
        <div style={{fontSize: 12, fontWeight: 700, color: col, marginTop: 2}}>{fmtPct(d.pct)}</div>
      </div>
    </div>
  );
};

const LiveDot: React.FC = () => {
  const f = useCurrentFrame();
  const q = 0.4 + 0.6 * (1 - Math.abs(((f % 48) / 48) * 2 - 1));
  return (
    <div
      style={{
        width: 8,
        height: 8,
        borderRadius: 4,
        background: C.green,
        boxShadow: `0 0 ${8 * q}px ${3 * q}px ${C.green}88`,
      }}
    />
  );
};

const HomeScreen: React.FC = () => {
  const f = useCurrentFrame();
  const s = p(f, 54, 72, INOUT);
  const glow = 1 - p(f, 72, 104);
  const all: Row[] = [NEW_ROW, ...FEED];
  return (
    <div style={{position: "absolute", inset: 0, background: C.paper}}>
      <div style={{position: "absolute", left: 24, top: 66, fontSize: 28, fontWeight: 800}}>Home</div>
      <Img src={LOGO} style={{position: "absolute", right: 22, top: 66, width: 38, height: 38, borderRadius: 10, objectFit: "contain"}} />

      {/* the Volume Jumps card */}
      <div
        style={{
          position: "absolute",
          left: 14,
          right: 14,
          top: 118,
          height: 64 + ROWH * 3,
          borderRadius: 24,
          background: C.white,
          border: `1.5px solid ${C.line}`,
          overflow: "hidden",
        }}
      >
        <div style={{position: "absolute", left: 14, top: 12, width: 40, height: 40}}>
          <SpikeIcon size={40} />
        </div>
        <div style={{position: "absolute", left: 66, top: 11, fontSize: 16, fontWeight: 800}}>Volume Jumps</div>
        <div style={{position: "absolute", left: 66, top: 36, display: "flex", alignItems: "center", gap: 6}}>
          <LiveDot />
          <span style={{fontSize: 11.5, color: C.mute, fontWeight: 500}}>Sudden volume stocks</span>
        </div>
        <div style={{position: "absolute", right: 16, top: 22, fontSize: 13, fontWeight: 800, color: C.cobalt}}>View all</div>
        <div style={{position: "absolute", left: 0, right: 0, top: 63, height: 1.5, background: C.line}} />

        <div style={{position: "absolute", left: 0, right: 0, top: 64, height: ROWH * 3, overflow: "hidden"}}>
          {all.map((d, k) => {
            const y = (k - 1 + s) * ROWH;
            const isNew = k === 0;
            const isLast = k === 3;
            return (
              <React.Fragment key={d.t}>
                <MiniRow
                  d={d}
                  top={y}
                  opacity={isNew ? s : isLast ? 1 - s : 1}
                  bg={isNew ? `rgba(18,183,106,${0.14 * glow})` : "transparent"}
                />
                {!isLast && (
                  <div style={{position: "absolute", left: 16, right: 16, top: y + ROWH - 1, height: 1.5, background: C.line}} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* placeholder content below, so it feels like a real home screen */}
      {[0, 1].map((i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: 14,
            right: 14,
            top: 420 + i * 126,
            height: 108,
            borderRadius: 22,
            background: C.white,
            border: `1.5px solid ${C.line}`,
          }}
        >
          <div style={{position: "absolute", left: 18, top: 20, width: 120, height: 14, borderRadius: 7, background: C.line}} />
          <div style={{position: "absolute", left: 18, top: 48, width: 250, height: 11, borderRadius: 6, background: "#EEF1F8"}} />
          <div style={{position: "absolute", left: 18, top: 70, width: 190, height: 11, borderRadius: 6, background: "#EEF1F8"}} />
        </div>
      ))}

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
        {["Home", "Stocks", "Learn", "More"].map((l, i) => (
          <div key={l} style={{display: "flex", flexDirection: "column", alignItems: "center", gap: 6}}>
            <div style={{width: 22, height: 22, borderRadius: 7, background: i === 0 ? C.cobalt : "#CBD1E4"}} />
            <div style={{fontSize: 12, fontWeight: 700, color: i === 0 ? C.cobalt : C.mute}}>{l}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

const STD_ROWS: Row[] = [
  {t: "WELCORP", r: 7.4, up: true, sub: "Spotted at 9:48 AM", price: 812.4, pct: 2.4},
  {t: "RELIANCE", r: 6.2, up: true, sub: "Spotted at 10:42 AM", price: 2948, pct: 1.4},
  {t: "SBIN", r: 6.9, up: false, sub: "Spotted at 11:20 AM", price: 812.15, pct: -1.4},
];
const STRICT_ROWS: Row[] = [
  {t: "WELCORP", r: 9.1, up: true, sub: "Spotted at 9:48 AM", price: 812.4, pct: 2.4},
  {t: "SBIN", r: 8.3, up: false, sub: "Spotted at 11:20 AM", price: 812.15, pct: -1.4},
];
const SENS = ["Relaxed", "Standard", "Strict"];
const SEG_W = 100;
const SEG_X = 16;

const HistoryScreen: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const d = p(f, 106, 132);
  const changed = f >= 196;
  const count = changed ? 5 : 12;
  const pop = changed ? spring({frame: f - 196, fps, config: BOUNCY}) : 1;
  const sw = p(f, 196, 210);
  const thumb = interpolate(f, [0, 192, 206], [1, 1, 2], {...clampX, easing: INOUT});
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: C.paper,
        transform: `translateX(${(1 - d) * PW}px)`,
        boxShadow: "-20px 0 40px rgba(0,0,0,.12)",
      }}
    >
      <div style={{position: "absolute", left: 18, top: 60, fontSize: 34, fontWeight: 500, color: C.mute}}>‹</div>
      <div style={{position: "absolute", left: 52, top: 66, fontSize: 20, fontWeight: 800}}>Volume Jump</div>

      <div
        style={{
          position: "absolute",
          left: 14,
          right: 14,
          top: 108,
          height: 62,
          borderRadius: 18,
          background: C.white,
          border: `1.5px solid ${C.line}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 20px",
          fontSize: 18,
          fontWeight: 800,
        }}
      >
        <span style={{color: C.mute, fontSize: 24}}>‹</span>
        <span>Thu, 12 Nov 2026</span>
        <span style={{color: C.mute, fontSize: 24}}>›</span>
      </div>

      <div style={{position: "absolute", left: 22, top: 190, display: "flex", alignItems: "baseline", gap: 10}}>
        <span
          style={{
            fontFamily: DISPLAY,
            fontWeight: 800,
            fontSize: 58,
            lineHeight: 1,
            letterSpacing: -2,
            color: C.cobalt,
            display: "inline-block",
            transform: `scale(${0.75 + 0.25 * pop})`,
            transformOrigin: "0% 100%",
          }}
        >
          {count}
        </span>
        <span style={{fontSize: 19, fontWeight: 700}}>stocks had a rush</span>
      </div>

      <div style={{position: "absolute", left: 14, right: 14, top: 272, height: 3 * 76}}>
        {STD_ROWS.map((r, i) => (
          <div
            key={r.t}
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: i * 78,
              height: 70,
              borderRadius: 18,
              background: C.white,
              border: `1.5px solid ${C.line}`,
              opacity: 1 - sw,
              overflow: "hidden",
            }}
          >
            <MiniRow d={r} top={0} h={67} />
          </div>
        ))}
        {STRICT_ROWS.map((r, i) => (
          <div
            key={r.t}
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: i * 78,
              height: 70,
              borderRadius: 18,
              background: C.white,
              border: `1.5px solid ${C.line}`,
              opacity: sw,
              overflow: "hidden",
            }}
          >
            <MiniRow d={r} top={0} h={67} />
          </div>
        ))}
      </div>

      <div
        style={{
          position: "absolute",
          left: 14,
          right: 14,
          top: 548,
          borderRadius: 18,
          background: "rgba(42,59,255,.08)",
          padding: "14px 16px",
          boxSizing: "border-box",
        }}
      >
        <div style={{fontSize: 14, fontWeight: 800, color: C.cobalt}}>Tip</div>
        <div style={{fontSize: 14.5, fontWeight: 500, color: C.mute, marginTop: 3, lineHeight: 1.35}}>
          Strict shows fewer, bigger rushes. Relaxed shows more.
        </div>
      </div>

      {/* sensitivity bar */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: 130,
          background: C.white,
          borderTop: `1.5px solid ${C.line}`,
        }}
      >
        <div style={{position: "absolute", left: 18, top: 14, fontSize: 11, letterSpacing: 1.2, fontWeight: 800, color: C.mute}}>
          SENSITIVITY
        </div>
        <div
          style={{
            position: "absolute",
            left: SEG_X,
            top: 36,
            width: SEG_W * 3,
            height: 48,
            borderRadius: 999,
            border: `1.5px solid ${C.line}`,
            boxSizing: "border-box",
            background: C.paper,
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 3,
              left: 3 + thumb * ((SEG_W * 3 - 6) / 3),
              width: (SEG_W * 3 - 6) / 3,
              height: 39,
              borderRadius: 999,
              background: C.cobalt,
            }}
          />
          {SENS.map((s, i) => (
            <div
              key={s}
              style={{
                position: "absolute",
                top: 0,
                left: i * SEG_W,
                width: SEG_W,
                height: 45,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 14,
                fontWeight: 800,
                color: Math.round(thumb) === i ? C.white : C.mute,
              }}
            >
              {s}
            </div>
          ))}
        </div>
        <svg
          width={26}
          height={26}
          viewBox="0 0 24 24"
          fill="none"
          stroke={C.cobalt}
          strokeWidth={2.2}
          strokeLinecap="round"
          style={{position: "absolute", right: 22, top: 47}}
        >
          <path d="M4 7h9M17 7h3M4 17h3M11 17h9" />
          <circle cx={15} cy={7} r={2} />
          <circle cx={9} cy={17} r={2} />
        </svg>
      </div>
    </div>
  );
};

const InApp: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const rise = spring({frame: f - 6, fps, config: PHONE_IN});

  return (
    <>
      <div
        style={{
          position: "absolute",
          left: -100,
          top: 640,
          width: 1280,
          height: 1280,
          background: "radial-gradient(closest-side, rgba(42,59,255,.55), rgba(42,59,255,0))",
        }}
      />

      <Band top={SAFE.y0}>
        <div style={{position: "relative", width: config.width, height: 290}}>
          <Stack>
            <Rise lines={["Spot them", "as they happen."]} at={14} out={96} size={92} color={C.paper} />
          </Stack>
          <Stack>
            <Rise lines={["Replay any", "past day."]} at={112} out={176} size={96} color={C.paper} />
          </Stack>
          <Stack>
            <Rise lines={["Strict or relaxed?", "Your call."]} colors={[C.paper, C.sun]} at={184} size={88} />
          </Stack>
        </div>
      </Band>

      <div
        style={{
          position: "absolute",
          left: PHONE_LEFT,
          top: PHONE_TOP,
          transform: `translateY(${(1 - rise) * 1000}px)`,
        }}
      >
        <PhoneShell>
          <HomeScreen />
          <HistoryScreen />
          <Finger
            T={[80, 98, 114, 176, 190, 212]}
            X={[330, 342, 310, 320, 266, 266]}
            Y={[560, 150, 300, 640, 748 + 0, 748]}
            taps={[100, 192]}
            show={[
              [82, 114],
              [178, 214],
            ]}
          />
        </PhoneShell>
      </div>
    </>
  );
};

/* ------------------------------------------------------------------ */
/*  SCENE 5 — Coming soon: your own alert number                       */
/* ------------------------------------------------------------------ */
const CHIPS = [8, 15, 30];

const Notif: React.FC<{at: number; top: number; title: string; sub: string}> = ({at, top, title, sub}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame: f - at, fps, config: {damping: 14, stiffness: 140, mass: 0.8}});
  return (
    <div
      style={{
        position: "absolute",
        left: SAFE.left,
        top,
        width: SAFE.w,
        boxSizing: "border-box",
        padding: "26px 30px",
        borderRadius: 38,
        background: C.white,
        boxShadow: "0 26px 60px rgba(5,7,15,.35)",
        display: "flex",
        alignItems: "center",
        gap: 24,
        opacity: Math.min(1, s * 3),
        transform: `translateY(${(1 - s) * -170}px)`,
      }}
    >
      <Img src={LOGO} style={{width: 92, height: 92, borderRadius: 24, objectFit: "contain", flexShrink: 0}} />
      <div style={{flex: 1, minWidth: 0, fontFamily: UI}}>
        <div style={{display: "flex", justifyContent: "space-between", fontSize: 24, fontWeight: 700, color: C.mute}}>
          <span>OPTIONXI</span>
          <span>now</span>
        </div>
        <div style={{fontSize: 37, fontWeight: 800, color: C.ink, marginTop: 4, whiteSpace: "nowrap"}}>{title}</div>
        <div style={{fontSize: 30, fontWeight: 600, color: C.mute, marginTop: 4}}>{sub}</div>
      </div>
    </div>
  );
};

const Alerts: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const card = spring({frame: f - 16, fps, config: SOFT});
  const sel = f < 74 ? 0 : 2;
  const selAt = f < 74 ? 20 : 74;
  const chipPop = spring({frame: f - selAt, fps, config: BOUNCY});
  const k = f < 84 ? Math.max(0, f - 44) : f - 88;
  const ring = (f >= 44 && f < 74) || f >= 88 ? Math.sin(k * 1.6) * 20 * Math.exp(-k / 9) : 0;

  return (
    <>
      <Band top={SAFE.y0}>
        <div
          style={{
            padding: "12px 34px",
            borderRadius: 999,
            background: C.sun,
            color: C.ink,
            fontFamily: UI,
            fontWeight: 800,
            fontSize: 32,
            letterSpacing: 4,
            transform: `scale(${spring({frame: f - 2, fps, config: BOUNCY})})`,
          }}
        >
          COMING SOON
        </div>
      </Band>

      <Band top={350}>
        <Rise lines={["Pick a number.", "Get pinged."]} colors={[C.paper, C.sun]} at={8} size={96} />
      </Band>

      <div
        style={{
          position: "absolute",
          left: SAFE.left,
          top: 610,
          width: SAFE.w,
          boxSizing: "border-box",
          padding: "30px 32px 28px",
          borderRadius: 40,
          background: C.white,
          fontFamily: UI,
          opacity: Math.min(1, card * 2),
          transform: `translateY(${(1 - card) * 80}px)`,
        }}
      >
        <div style={{display: "flex", alignItems: "center", gap: 18}}>
          <div
            style={{
              width: 66,
              height: 66,
              borderRadius: 33,
              background: "rgba(42,59,255,.12)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transform: `rotate(${ring}deg)`,
            }}
          >
            <svg width={36} height={36} viewBox="0 0 24 24" fill="none" stroke={C.cobalt} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 9a6 6 0 0 1 12 0c0 6 2 7 2 7H4s2-1 2-7" />
              <path d="M10 20a2 2 0 0 0 4 0" />
            </svg>
          </div>
          <div style={{fontSize: 36, fontWeight: 800, color: C.ink}}>Alert me when volume hits</div>
        </div>

        <div style={{display: "flex", gap: 18, marginTop: 26}}>
          {CHIPS.map((c, i) => {
            const on = sel === i;
            return (
              <div
                key={c}
                style={{
                  flex: 1,
                  height: 118,
                  borderRadius: 30,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: DISPLAY,
                  fontWeight: 800,
                  fontSize: 64,
                  letterSpacing: -2,
                  background: on ? C.cobalt : C.paper,
                  color: on ? C.white : C.mute,
                  border: `2px solid ${on ? C.cobalt : C.line}`,
                  transform: `scale(${on ? 0.9 + 0.1 * chipPop : 1})`,
                }}
              >
                {c}×
              </div>
            );
          })}
        </div>
        <div style={{marginTop: 18, textAlign: "center", fontSize: 28, fontWeight: 600, color: C.mute}}>
          or type any number you like
        </div>
      </div>

      <Notif at={44} top={950} title="RELIANCE jumped 8× normal volume" sub="Up 2.4% · tap to view" />
      <Notif at={88} top={1150} title="TATAMOTORS jumped 30× normal volume" sub="Up 4.1% · tap to view" />
    </>
  );
};

/* ------------------------------------------------------------------ */
/*  SCENE 6 — CTA                                                      */
/* ------------------------------------------------------------------ */
const Cta: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const icon = spring({frame: f - 4, fps, config: BOUNCY});
  const sub = p(f, 38, 54);
  const badge = spring({frame: f - 62, fps, config: BOUNCY});
  const tapD = f - 96;
  const dip = tapD >= 0 && tapD < 10 ? Math.sin((tapD / 10) * Math.PI) * 0.05 : 0;
  const url = p(f, 72, 86);
  const pills = ["Live feed", "Replay any day", "Alerts soon"];

  return (
    <>
      <Band top={SAFE.y0 + 10}>
        <div style={{transform: `scale(${icon})`}}>
          <SpikeIcon size={190} loop={90} />
        </div>
      </Band>

      <Band top={560}>
        <Rise lines={["Volume Jumps."]} at={12} size={128} color={C.ink} />
      </Band>

      <Band top={740}>
        <div
          style={{
            fontFamily: UI,
            fontWeight: 600,
            fontSize: 46,
            color: C.mute,
            opacity: sub,
            transform: `translateY(${(1 - sub) * 20}px)`,
          }}
        >
          See the crowd first.
        </div>
      </Band>

      <Band top={850}>
        <div style={{display: "flex", gap: 14}}>
          {pills.map((t, i) => {
            const s = spring({frame: f - 44 - i * 6, fps, config: SOFT});
            return (
              <div
                key={t}
                style={{
                  padding: "16px 26px",
                  borderRadius: 999,
                  background: i === 2 ? C.sun : C.white,
                  border: `2px solid ${i === 2 ? C.sun : C.line}`,
                  fontFamily: UI,
                  fontWeight: 700,
                  fontSize: 30,
                  color: C.ink,
                  opacity: s,
                  transform: `translateY(${(1 - s) * 40}px)`,
                  whiteSpace: "nowrap",
                }}
              >
                {t}
              </div>
            );
          })}
        </div>
      </Band>

      <Band top={1020}>
        <div style={{position: "relative", transform: `scale(${(0.6 + 0.4 * badge) * (1 - dip)})`, opacity: p(f, 62, 68)}}>
          <Img src={BADGE} style={{width: 640, height: "auto", display: "block"}} />
          {tapD >= 0 && tapD < 22 && (
            <div
              style={{
                position: "absolute",
                left: "50%",
                top: "50%",
                width: 60 + tapD * 10,
                height: 60 + tapD * 10,
                marginLeft: -(60 + tapD * 10) / 2,
                marginTop: -(60 + tapD * 10) / 2,
                borderRadius: "50%",
                border: `4px solid ${C.cobalt}`,
                opacity: (1 - tapD / 22) * 0.7,
              }}
            />
          )}
        </div>
      </Band>

      <Band top={1330}>
        <div
          style={{
            fontFamily: UI,
            fontWeight: 800,
            fontSize: 44,
            color: C.cobalt,
            opacity: url,
            transform: `translateY(${(1 - url) * 16}px)`,
          }}
        >
          optionxi.com
        </div>
      </Band>

      <Band top={1396}>
        <div style={{fontFamily: UI, fontWeight: 500, fontSize: 24, color: C.mute, opacity: url, textAlign: "center"}}>
          Sample data shown · Educational use only · Not investment advice
        </div>
      </Band>
    </>
  );
};

/* ------------------------------------------------------------------ */
/*  Root                                                               */
/* ------------------------------------------------------------------ */
export const Reel: React.FC = () => {
  useFonts();

  const scenes: {name: string; from: number; dur: number; bg: string; origin?: [number, number]; el: React.ReactNode}[] = [
    {name: "Hook", from: 0, dur: 110, bg: C.cobalt, el: <Hook />},
    {name: "Idea", from: 110, dur: 190, bg: C.paper, origin: [CX, CY], el: <Idea />},
    {name: "Direction", from: 300, dur: 110, bg: C.sun, origin: [CX, 1000], el: <Direction />},
    {name: "InApp", from: 410, dur: 250, bg: C.ink, origin: [CX, 1030], el: <InApp />},
    {name: "Alerts", from: 660, dur: 130, bg: C.cobalt, origin: [CX, 760], el: <Alerts />},
    {name: "CTA", from: 790, dur: 110, bg: C.paper, origin: [CX, 1180], el: <Cta />},
  ];

  return (
    <AbsoluteFill style={{background: C.cobalt, fontFamily: UI}}>
      {scenes.map((s, i) => (
        <Sequence
          key={s.name}
          name={s.name}
          from={s.from}
          durationInFrames={s.dur + (i < scenes.length - 1 ? R : 0)}
        >
          <Scene bg={s.bg} origin={s.origin}>
            {s.el}
          </Scene>
        </Sequence>
      ))}
      <SafeGuide />
    </AbsoluteFill>
  );
};

export default Reel;