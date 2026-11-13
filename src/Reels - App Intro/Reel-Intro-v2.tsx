/**
 * OptionXi — "Learn the market before you risk a rupee."
 * Instagram Reel · 1080×1920 · 30 fps · 900 frames (30 s) · single file, zero extra deps
 *
 * Instagram safe space from shared/safe-area.tsx. Set DEBUG_SAFE = true there to see it.
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
  star: "#FFB400",
};

const DISPLAY = '"Bricolage Grotesque", "Noto Sans", "Arial Black", sans-serif';
const UI = '"Figtree", "Noto Sans", system-ui, sans-serif';

const LOGO = "https://optionxi.com/assets/images/logo_xi.png";
const BADGE = "https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png";

const R = 18;

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
/*  Small building blocks                                              */
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

/** Rupee sign drawn as SVG so it never depends on font coverage */
const RupeeMark: React.FC<{h: number; color: string; stroke?: number}> = ({h, color, stroke = 3.4}) => (
  <svg viewBox="6 4 30 38" height={h} width={(h * 30) / 38} style={{display: "block", overflow: "visible"}}>
    <g fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 8H31" />
      <path d="M10 16H31" />
      <path d="M10 8H17A8 8 0 0 1 17 24H10L25 38" />
    </g>
  </svg>
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
  align?: "center" | "left";
}> = ({lines, at, size, color = C.ink, colors, out, stagger = 3, weight = 800, align = "center"}) => {
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
          <stop offset="0" stopColor={color} stopOpacity={0.28} />
          <stop offset="1" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      {area && pts.length > 1 && <path d={`${d} L${last[0]} ${h} L0 ${h} Z`} fill={`url(#${id})`} />}
      <path d={d} fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" />
      {t > 0 && <circle cx={last[0]} cy={last[1]} r={sw * 1.7} fill={color} />}
    </svg>
  );
};

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
      ...style,
    }}
  >
    {text}
  </div>
);

/* ------------------------------------------------------------------ */
/*  SCENE 1 — Hook                                                     */
/* ------------------------------------------------------------------ */
const Hook: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();

  const P0 = [-140, 1400];
  const P1 = [560, 780];
  const P2 = [1220, 1240];
  const t = p(f, 6, 58, Easing.inOut(Easing.cubic));
  const x = (1 - t) * (1 - t) * P0[0] + 2 * (1 - t) * t * P1[0] + t * t * P2[0];
  const y = (1 - t) * (1 - t) * P0[1] + 2 * (1 - t) * t * P1[1] + t * t * P2[1];
  const dx = 2 * (1 - t) * (P1[0] - P0[0]) + 2 * t * (P2[0] - P1[0]);
  const dy = 2 * (1 - t) * (P1[1] - P0[1]) + 2 * t * (P2[1] - P1[1]);
  const ang = (Math.atan2(dy, dx) * 180) / Math.PI;
  const planeOpacity = 1 - p(f, 54, 62);

  const coin = spring({frame: f - 62, fps, config: {damping: 9, stiffness: 90, mass: 1}});
  const coinY = -Math.abs(1 - coin) * 1500;
  const coinVisible = f >= 62;
  const spin = (1 - p(f, 62, 104, Easing.out(Easing.cubic))) * Math.PI * 5;
  const ringP = p(f, 70, 110);

  return (
    <>
      <svg width={config.width} height={config.height} style={{position: "absolute", inset: 0, opacity: planeOpacity * 0.35}}>
        <path
          d={`M${P0[0]} ${P0[1]} Q${P1[0]} ${P1[1]} ${P2[0]} ${P2[1]}`}
          fill="none"
          stroke={C.paper}
          strokeWidth={6}
          strokeDasharray="2 22"
          strokeLinecap="round"
        />
      </svg>

      <svg
        width={96}
        height={96}
        viewBox="0 0 24 24"
        style={{
          position: "absolute",
          left: x - 48,
          top: y - 48,
          transform: `rotate(${ang}deg)`,
          opacity: planeOpacity,
        }}
      >
        <path d="M2.01 21 23 12 2.01 3 2 10l15 2-15 2z" fill={C.paper} />
      </svg>

      <Band top={SAFE.y0}>
        <div style={{position: "relative", width: config.width, height: 360}}>
          <Stack>
            <Rise lines={["Would you fly", "a plane with", "zero practice?"]} at={6} out={50} size={104} color={C.paper} />
          </Stack>
          <Stack>
            <Rise
              lines={["So why trade", "your money", "that way?"]}
              colors={[C.paper, C.paper, C.sun]}
              at={58}
              size={104}
            />
          </Stack>
        </div>
      </Band>

      <div
        style={{
          position: "absolute",
          left: config.width / 2 - 130,
          top: 1180 - 130,
          width: 260,
          height: 260,
          visibility: coinVisible ? "visible" : "hidden",
          transform: `translateY(${coinY}px) scaleX(${Math.cos(spin)})`,
        }}
      >
        <div
          style={{
            width: 260,
            height: 260,
            borderRadius: "50%",
            background: C.sun,
            border: "14px solid #F5B700",
            boxSizing: "border-box",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 30px 60px rgba(0,0,0,.28)",
          }}
        >
          <RupeeMark h={130} color={C.ink} stroke={4} />
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          left: config.width / 2 - 130,
          top: 1180 - 130,
          width: 260,
          height: 260,
          borderRadius: "50%",
          border: "4px solid rgba(255,255,255,.5)",
          opacity: f < 70 ? 0 : (1 - ringP) * 0.8,
          transform: `scale(${1 + ringP * 2.6})`,
        }}
      />
    </>
  );
};

/* ------------------------------------------------------------------ */
/*  SCENE 2 — Brand reveal                                             */
/* ------------------------------------------------------------------ */
const Brand: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const logo = spring({frame: f - 8, fps, config: BOUNCY});
  const bar = p(f, 56, 78);
  const sub = p(f, 84, 100);
  const ph = f < 12 ? 0 : ((f - 12) % 54) / 54;
  const pills = ["Free to start", "Open source", "Made in India"];

  return (
    <>
      {[0, 0.5].map((o, i) => {
        const q = f < 12 ? 0 : (((f - 12) / 54 + o) % 1);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: config.width / 2 - 110,
              top: 390 - 110,
              width: 220,
              height: 220,
              borderRadius: "50%",
              border: `4px solid ${C.cobalt}`,
              opacity: f < 12 ? 0 : (1 - q) * 0.35,
              transform: `scale(${1 + q * 1.8})`,
            }}
          />
        );
      })}

      <Band top={290}>
        <div style={{transform: `scale(${logo})`, opacity: p(f, 8, 14)}}>
          <Img src={LOGO} style={{width: 200, height: 200, objectFit: "contain", borderRadius: 48, display: "block"}} />
        </div>
      </Band>

      <Band top={520}>
        <Rise lines={["OptionXi"]} at={22} size={124} color={C.ink} />
      </Band>

      <Band top={700}>
        <Rise lines={["Learn the market", "before you"]} at={38} size={92} color={C.ink} />
        <div style={{position: "relative", padding: "0 24px", marginTop: 2}}>
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: 92 * 0.1,
              bottom: 92 * 0.02,
              background: C.sun,
              borderRadius: 20,
              transformOrigin: "left center",
              transform: `scaleX(${bar})`,
            }}
          />
          <div style={{position: "relative"}}>
            <Rise lines={["risk a rupee."]} at={58} size={92} color={C.ink} />
          </div>
        </div>
      </Band>

      <Band top={1040}>
        <div
          style={{
            fontFamily: UI,
            fontWeight: 600,
            fontSize: 42,
            color: C.mute,
            opacity: sub,
            transform: `translateY(${(1 - sub) * 20}px)`,
          }}
        >
          A practice mode for the stock market.
        </div>
      </Band>

      <Band top={1230}>
        <div style={{display: "flex", gap: 16}}>
          {pills.map((t, i) => {
            const s = spring({frame: f - 96 - i * 6, fps, config: SOFT});
            return (
              <div
                key={t}
                style={{
                  padding: "18px 28px",
                  borderRadius: 999,
                  background: C.white,
                  border: `2px solid ${C.line}`,
                  fontFamily: UI,
                  fontWeight: 700,
                  fontSize: 32,
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
    </>
  );
};

/* ------------------------------------------------------------------ */
/*  SCENE 3 — Practice trade (phone)                                   */
/* ------------------------------------------------------------------ */
const STOCKS = [
  {t: "HDFCBANK", n: "HDFC Bank", p: 1742.1, c: 0.2},
  {t: "WELCORP", n: "Welspun Corp", p: 812.4, c: 2.36},
  {t: "INFY", n: "Infosys", p: 1890.55, c: -0.6},
  {t: "RELIANCE", n: "Reliance Ind.", p: 2948.0, c: 1.4},
  {t: "ITC", n: "ITC Ltd", p: 468.25, c: 0.1},
];
const ROW_TOP = 268;
const ROW_H = 84;

const DETAIL_DATA = [
  0.3, 0.34, 0.28, 0.33, 0.36, 0.31, 0.35, 0.4, 0.37, 0.42, 0.39, 0.44, 0.41, 0.46, 0.43, 0.48, 0.52, 0.5, 0.57, 0.62,
  0.6, 0.68, 0.74, 0.82,
];

const WatchlistScreen: React.FC = () => {
  const f = useCurrentFrame();
  const cash = Math.round(300000 * p(f, 20, 62, Easing.out(Easing.cubic)));
  const hot = p(f, 96, 102);
  return (
    <div style={{position: "absolute", inset: 0, background: C.paper}}>
      <div style={{position: "absolute", left: 24, top: 66, fontSize: 30, fontWeight: 800}}>Watchlist</div>
      <Pill
        text="Virtual mode"
        bg="rgba(42,59,255,.12)"
        color={C.cobalt}
        style={{position: "absolute", right: 22, top: 74}}
      />
      <div
        style={{
          position: "absolute",
          left: 20,
          right: 20,
          top: 118,
          height: 100,
          borderRadius: 24,
          background: C.cobalt,
          color: C.white,
        }}
      >
        <div style={{position: "absolute", left: 22, top: 16, fontSize: 14, fontWeight: 600, opacity: 0.8}}>Virtual cash</div>
        <div style={{position: "absolute", left: 22, top: 38, fontSize: 40, fontWeight: 800, letterSpacing: -1}}>
          ₹{fmtIN(cash)}
        </div>
      </div>
      <div style={{position: "absolute", left: 24, top: 238, fontSize: 14, fontWeight: 700, color: C.mute}}>Your list</div>

      {STOCKS.map((s, i) => {
        const isHot = i === 1;
        const up = s.c >= 0;
        return (
          <div
            key={s.t}
            style={{
              position: "absolute",
              left: 14,
              right: 14,
              top: ROW_TOP + i * ROW_H,
              height: 76,
              borderRadius: 20,
              border: `1.5px solid ${C.line}`,
              background: isHot ? interpolateColors(hot, [0, 1], [C.white, "#E4E8FF"]) : C.white,
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
                background: "rgba(42,59,255,.1)",
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
              <div style={{fontSize: 17, fontWeight: 700, fontVariantNumeric: "tabular-nums"}}>{fmtIN(s.p, 2)}</div>
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
        {["Watchlist", "Trade", "Learn", "Rank"].map((l, i) => (
          <div key={l} style={{display: "flex", flexDirection: "column", alignItems: "center", gap: 6}}>
            <div style={{width: 22, height: 22, borderRadius: 7, background: i === 0 ? C.cobalt : "#CBD1E4"}} />
            <div style={{fontSize: 12, fontWeight: 700, color: i === 0 ? C.cobalt : C.mute}}>{l}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

const DetailScreen: React.FC = () => {
  const f = useCurrentFrame();
  const d = p(f, 100, 124);
  const t = p(f, 112, 156, Easing.linear);
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
      <div style={{position: "absolute", left: 20, top: 56, fontSize: 36, fontWeight: 500, color: C.mute}}>‹</div>
      <div style={{position: "absolute", left: 56, top: 66, fontSize: 20, fontWeight: 800}}>WELCORP</div>
      <Pill text="Virtual" bg="rgba(42,59,255,.12)" color={C.cobalt} style={{position: "absolute", right: 22, top: 68}} />

      <div style={{position: "absolute", left: 24, top: 114, fontSize: 46, fontWeight: 800, letterSpacing: -1}}>₹812.40</div>
      <div style={{position: "absolute", left: 26, top: 174, fontSize: 17, fontWeight: 700, color: C.green}}>▲ +2.36% today</div>

      <div style={{position: "absolute", left: 24, top: 222}}>
        <LineChart data={DETAIL_DATA} w={342} h={210} t={t} color={C.green} id="gd" area />
      </div>

      <div style={{position: "absolute", left: 24, top: 462, display: "flex", gap: 8}}>
        {["1D", "1W", "1M", "1Y"].map((l, i) => (
          <div
            key={l}
            style={{
              padding: "7px 14px",
              borderRadius: 999,
              fontSize: 13,
              fontWeight: 700,
              background: i === 0 ? C.cobalt : "transparent",
              color: i === 0 ? C.white : C.mute,
            }}
          >
            {l}
          </div>
        ))}
      </div>

      <div style={{position: "absolute", left: 24, right: 24, top: 520, display: "flex", justifyContent: "space-between"}}>
        {[
          ["Open", "793.0"],
          ["High", "815.2"],
          ["Volume", "2.4×"],
        ].map(([k, v]) => (
          <div key={k} style={{width: 106}}>
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
          top: 590,
          height: 86,
          borderRadius: 20,
          background: C.white,
          border: `1.5px solid ${C.line}`,
          padding: "16px 18px",
          boxSizing: "border-box",
        }}
      >
        <div style={{fontSize: 12, fontWeight: 700, color: C.mute}}>Today's lesson</div>
        <div style={{fontSize: 19, fontWeight: 800, marginTop: 4}}>Reading a breakout</div>
      </div>

      <div
        style={{
          position: "absolute",
          left: 20,
          top: 704,
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
          top: 704,
          width: 168,
          height: 64,
          borderRadius: 20,
          boxSizing: "border-box",
          border: `2.5px solid ${C.red}`,
          color: C.red,
          fontSize: 20,
          fontWeight: 800,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        Sell
      </div>
    </div>
  );
};

const BuySheet: React.FC = () => {
  const f = useCurrentFrame();
  const b = p(f, 134, 154);
  const done = p(f, 170, 178);
  const glow = f < 152 ? 0 : 0.5 + 0.5 * Math.sin((f - 152) * 0.3);
  return (
    <>
      <div style={{position: "absolute", inset: 0, background: `rgba(5,7,15,${0.38 * b})`}} />
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 430,
          height: 390,
          background: C.white,
          borderRadius: "34px 34px 0 0",
          transform: `translateY(${(1 - b) * 400}px)`,
        }}
      >
        <div style={{position: "absolute", left: "50%", top: 12, width: 44, height: 5, marginLeft: -22, borderRadius: 3, background: C.line}} />
        <div style={{position: "absolute", left: 26, top: 34, fontSize: 24, fontWeight: 800}}>Buy WELCORP</div>
        <div style={{position: "absolute", left: 26, top: 68, fontSize: 13, color: C.mute, fontWeight: 600}}>Market · Virtual</div>

        <div style={{position: "absolute", left: 26, right: 26, top: 104, height: 48, display: "flex", alignItems: "center", justifyContent: "space-between"}}>
          <div style={{fontSize: 16, fontWeight: 600}}>Quantity</div>
          <div
            style={{
              width: 132,
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
            <span style={{color: C.mute}}>−</span>1<span style={{color: C.cobalt}}>+</span>
          </div>
        </div>

        <div style={{position: "absolute", left: 26, right: 26, top: 168, display: "flex", justifyContent: "space-between", fontSize: 16, fontWeight: 600}}>
          <span>Est. cost</span>
          <span style={{fontWeight: 800}}>₹812</span>
        </div>

        <div
          style={{
            position: "absolute",
            left: 20,
            right: 20,
            top: 214,
            height: 68,
            borderRadius: 18,
            background: "rgba(18,183,106,.12)",
            boxShadow: `0 0 0 ${3 * glow}px ${C.sun}`,
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
            top: 312,
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

const Finger: React.FC = () => {
  const f = useCurrentFrame();
  const T = [78, 96, 108, 116, 130, 146, 166, 184];
  const X = [320, 200, 200, 300, 106, 106, 195, 195];
  const Y = [660, 394, 394, 620, 736, 736, 773, 773];
  const x = interpolate(f, T, X, {...clampX, easing: INOUT});
  const y = interpolate(f, T, Y, {...clampX, easing: INOUT});
  const win = (a: number, b: number) => p(f, a, a + 6) * (1 - p(f, b - 6, b));
  const opacity = Math.max(win(82, 110), win(116, 148), win(158, 184));
  const taps = [96, 130, 168];
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

const Practice: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const rise = spring({frame: f - 6, fps, config: PHONE_IN});
  const zero = spring({frame: f - 140, fps, config: BOUNCY});

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
            <Rise lines={["Get ₹3,00,000", "of pretend money."]} at={14} out={70} size={80} color={C.paper} />
          </Stack>
          <Stack>
            <Rise lines={["Pick a stock.", "Tap buy."]} at={76} out={136} size={92} color={C.paper} />
          </Stack>
          <Stack>
            <div style={{display: "flex", flexDirection: "column", alignItems: "center"}}>
              <Rise lines={["Real money at risk:"]} at={140} size={62} weight={700} color={C.paper} />
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  opacity: p(f, 140, 144),
                  transform: `scale(${0.6 + 0.4 * zero})`,
                }}
              >
                <RupeeMark h={150} color={C.sun} stroke={4} />
                <span
                  style={{
                    fontFamily: DISPLAY,
                    fontWeight: 800,
                    fontSize: 210,
                    lineHeight: 1,
                    letterSpacing: -8,
                    color: C.sun,
                  }}
                >
                  0
                </span>
              </div>
            </div>
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
          <WatchlistScreen />
          <DetailScreen />
          <BuySheet />
          <Finger />
        </PhoneShell>
      </div>
    </>
  );
};

/* ------------------------------------------------------------------ */
/*  SCENE 4 — Screener funnel                                          */
/* ------------------------------------------------------------------ */
const COLS = 18;
const ROWS = 17;
const PITCH = 44;
const GX = (config.width - (COLS - 1) * PITCH) / 2;
const GY = 730;
const KILL = [32, 62, 92];
const SURV = new Set([94, 174, 241]);
const hash = (i: number) => {
  const s = Math.sin(i * 12.9898) * 43758.5453;
  return s - Math.floor(s);
};
const levelOf = (i: number) => (SURV.has(i) ? 3 : hash(i) < 0.06 ? 2 : hash(i) < 0.22 ? 1 : 0);

const FILTERS = [
  {t: 0, s: "stocks. Too many to watch."},
  {t: 32, s: "near today's high"},
  {t: 62, s: "with lots of buyers"},
  {t: 92, s: "gaining strength"},
  {t: 120, s: "worth a look."},
];

const Funnel: React.FC = () => {
  const f = useCurrentFrame();
  const val = interpolate(f, [0, 32, 50, 62, 80, 92, 108], [2000, 2000, 412, 412, 96, 96, 3], {
    ...clampX,
    easing: Easing.out(Easing.cubic),
  });
  const n = Math.round(val);
  const numTxt = n >= 2000 ? "2,000+" : fmtIN(n);
  const pulse = Math.max(
    ...KILL.map((t) => {
      const d = f - t - 10;
      return d < 0 || d > 14 ? 0 : Math.sin((d / 14) * Math.PI);
    }),
  );
  const numColor = interpolateColors(p(f, 104, 116), [0, 1], [C.ink, C.cobalt]);

  return (
    <>
      <Band top={SAFE.y0 - 10}>
        <div
          style={{
            fontFamily: DISPLAY,
            fontWeight: 800,
            fontSize: 220,
            lineHeight: 1,
            letterSpacing: -9,
            color: numColor,
            transform: `scale(${1 + 0.05 * pulse})`,
            opacity: p(f, 0, 10),
          }}
        >
          {numTxt}
        </div>
      </Band>

      <div style={{position: "absolute", top: 515, left: 0, width: config.width, height: 70}}>
        {FILTERS.map((l, i) => {
          const next = i < FILTERS.length - 1 ? FILTERS[i + 1].t : 99999;
          const a = p(f, l.t + (i ? 6 : 8), l.t + (i ? 18 : 20));
          const b = i < FILTERS.length - 1 ? p(f, next, next + 8) : 0;
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: 0,
                width: config.width,
                textAlign: "center",
                fontFamily: UI,
                fontWeight: i === FILTERS.length - 1 ? 800 : 700,
                fontSize: 52,
                color: i === FILTERS.length - 1 ? C.cobalt : C.ink,
                opacity: a * (1 - b),
                transform: `translateY(${(1 - a) * 24 - b * 24}px)`,
              }}
            >
              {l.s}
            </div>
          );
        })}
      </div>

      {Array.from({length: COLS * ROWS}, (_, i) => {
        const c = i % COLS;
        const r = Math.floor(i / COLS);
        const L = levelOf(i);
        const intro = p(f, 4 + (c + r) * 0.6, 14 + (c + r) * 0.6);
        const dt = L < 3 ? KILL[L] + hash(i + 7) * 12 : 99999;
        const death = L < 3 ? p(f, dt, dt + 10, Easing.in(Easing.cubic)) : 0;
        const surv = L === 3 ? p(f, 100, 116) : 0;
        const scale = intro * (1 - death) * (1 + surv * 0.9);
        const color = L === 3 ? interpolateColors(surv, [0, 1], [C.ink, C.cobalt]) : C.ink;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: GX + c * PITCH - 10,
              top: GY + r * PITCH - 10 + death * 16,
              width: 20,
              height: 20,
              borderRadius: 10,
              background: color,
              opacity: 0.9 * (1 - death),
              transform: `scale(${scale})`,
            }}
          />
        );
      })}

      {[...SURV].map((i) => {
        const c = i % COLS;
        const r = Math.floor(i / COLS);
        const q = f < 116 ? 0 : ((f - 116) % 40) / 40;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: GX + c * PITCH - 26,
              top: GY + r * PITCH - 26,
              width: 52,
              height: 52,
              borderRadius: "50%",
              border: `3px solid ${C.cobalt}`,
              opacity: f < 116 ? 0 : (1 - q) * 0.8,
              transform: `scale(${1 + q * 1.1})`,
            }}
          />
        );
      })}
    </>
  );
};

/* ------------------------------------------------------------------ */
/*  SCENE 5 — Alerts (phone)                                           */
/* ------------------------------------------------------------------ */
const ALERT_DATA = [
  0.32, 0.36, 0.3, 0.38, 0.42, 0.37, 0.45, 0.5, 0.46, 0.53, 0.49, 0.56, 0.6, 0.57, 0.63, 0.66, 0.64, 0.71, 0.78, 0.84,
];
const LEVEL = 0.68;
const DRAW_A = 16;
const DRAW_B = 70;
const CROSS_F = DRAW_A + (16.571 / 19) * (DRAW_B - DRAW_A);
const CH_W = 342;
const CH_H = 240;

const Alerts: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const rise = spring({frame: f - 6, fps, config: PHONE_IN});
  const crossed = f >= CROSS_F;
  const k = Math.max(0, f - CROSS_F);
  const shake = crossed ? Math.sin(k * 2.4) * 12 * Math.exp(-k / 7) : 0;
  const t = p(f, DRAW_A, DRAW_B, Easing.linear);
  const toggle = p(f, 26, 34);
  const banner = spring({frame: f - CROSS_F - 1, fps, config: {damping: 14, stiffness: 140, mass: 0.8}});
  const arcs = crossed ? Math.max(0, 1 - k / 26) : 0;
  const levelY = CH_H - LEVEL * CH_H;

  return (
    <>
      <div
        style={{
          position: "absolute",
          left: -100,
          top: 640,
          width: 1280,
          height: 1280,
          background: "radial-gradient(closest-side, rgba(255,255,255,.22), rgba(255,255,255,0))",
        }}
      />

      <Band top={SAFE.y0}>
        <div style={{position: "relative", width: config.width, height: 230}}>
          <Stack>
            <Rise lines={["Set a price.", "Skip the staring."]} at={6} out={54} size={84} color={C.paper} />
          </Stack>
          <Stack>
            <Rise lines={["We ping you", "when it crosses."]} at={60} size={84} color={C.paper} colors={[C.paper, C.sun]} />
          </Stack>
        </div>
      </Band>

      {[0, 1].map((side) => (
        <svg
          key={side}
          width={50}
          height={120}
          viewBox="0 0 50 120"
          style={{position: "absolute", left: side === 0 ? 236 : 794, top: 940, opacity: arcs}}
        >
          {[0, 1].map((j) => (
            <path
              key={j}
              d={side === 0 ? `M${40 - j * 16} 10 Q${14 - j * 14} 60 ${40 - j * 16} 110` : `M${10 + j * 16} 10 Q${36 + j * 14} 60 ${10 + j * 16} 110`}
              fill="none"
              stroke={C.paper}
              strokeWidth={6}
              strokeLinecap="round"
              opacity={j === 0 ? 1 : 0.5}
            />
          ))}
        </svg>
      ))}

      <div
        style={{
          position: "absolute",
          left: PHONE_LEFT,
          top: PHONE_TOP,
          transform: `translate(${shake}px, ${(1 - rise) * 1000}px)`,
        }}
      >
        <PhoneShell>
          <div style={{position: "absolute", inset: 0, background: C.paper}}>
            <div style={{position: "absolute", left: 24, top: 66, fontSize: 28, fontWeight: 800}}>RELIANCE</div>
            <Pill text="Virtual" bg="rgba(42,59,255,.12)" color={C.cobalt} style={{position: "absolute", right: 22, top: 72}} />
            <div style={{position: "absolute", left: 24, top: 112, fontSize: 44, fontWeight: 800, letterSpacing: -1}}>
              {crossed ? "₹1,852" : "₹1,840"}
            </div>
            <div
              style={{
                position: "absolute",
                left: 26,
                top: 170,
                fontSize: 16,
                fontWeight: 700,
                color: crossed ? C.green : C.mute,
              }}
            >
              {crossed ? "▲ Above your price" : "Waiting…"}
            </div>

            <div style={{position: "absolute", left: 24, top: 206, width: CH_W, height: CH_H}}>
              {[0.25, 0.5, 0.75].map((g) => (
                <div key={g} style={{position: "absolute", left: 0, right: 0, top: g * CH_H, height: 1, background: C.line}} />
              ))}
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  top: levelY,
                  borderTop: `2.5px dashed ${C.cobalt}`,
                  opacity: p(f, 10, 20),
                }}
              />
              <div
                style={{
                  position: "absolute",
                  right: 0,
                  top: levelY - 32,
                  padding: "4px 10px",
                  borderRadius: 10,
                  background: C.cobalt,
                  color: C.white,
                  fontSize: 13,
                  fontWeight: 800,
                  opacity: p(f, 10, 20),
                }}
              >
                ₹1,850
              </div>
              <LineChart data={ALERT_DATA} w={CH_W} h={CH_H} t={t} color={crossed ? C.green : C.ink} id="ga" sw={4.5} />
            </div>

            <div
              style={{
                position: "absolute",
                left: 20,
                right: 20,
                top: 480,
                height: 96,
                borderRadius: 22,
                background: C.white,
                border: `1.5px solid ${C.line}`,
                display: "flex",
                alignItems: "center",
                padding: "0 20px",
                gap: 14,
                boxSizing: "border-box",
              }}
            >
              <div
                style={{
                  width: 46,
                  height: 46,
                  borderRadius: 23,
                  background: "rgba(42,59,255,.12)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={C.cobalt} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 9a6 6 0 0 1 12 0c0 6 2 7 2 7H4s2-1 2-7" />
                  <path d="M10 20a2 2 0 0 0 4 0" />
                </svg>
              </div>
              <div style={{flex: 1}}>
                <div style={{fontSize: 13, color: C.mute, fontWeight: 600}}>Alert me above</div>
                <div style={{fontSize: 24, fontWeight: 800}}>₹1,850</div>
              </div>
              <div
                style={{
                  width: 58,
                  height: 34,
                  borderRadius: 17,
                  background: interpolateColors(toggle, [0, 1], ["#CBD1E4", C.green]),
                  position: "relative",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: 3,
                    left: 3 + toggle * 24,
                    width: 28,
                    height: 28,
                    borderRadius: 14,
                    background: C.white,
                    boxShadow: "0 2px 6px rgba(0,0,0,.25)",
                  }}
                />
              </div>
            </div>

            <div
              style={{
                position: "absolute",
                left: 20,
                right: 20,
                top: 600,
                borderRadius: 20,
                background: "rgba(42,59,255,.08)",
                padding: "16px 18px",
                boxSizing: "border-box",
              }}
            >
              <div style={{fontSize: 15, fontWeight: 800, color: C.cobalt}}>Breakout</div>
              <div style={{fontSize: 16, fontWeight: 500, color: C.mute, marginTop: 4, lineHeight: 1.35}}>
                Price climbs past a level it couldn't cross before.
              </div>
            </div>

            <div
              style={{
                position: "absolute",
                left: 14,
                right: 14,
                top: 58,
                height: 86,
                zIndex: 30,
                borderRadius: 26,
                background: C.white,
                boxShadow: "0 18px 40px rgba(11,16,32,.28)",
                display: "flex",
                alignItems: "center",
                padding: "0 16px",
                gap: 14,
                boxSizing: "border-box",
                opacity: Math.min(1, banner * 3),
                transform: `translateY(${(1 - banner) * -150}px)`,
              }}
            >
              <Img src={LOGO} style={{width: 50, height: 50, borderRadius: 13, objectFit: "contain"}} />
              <div style={{flex: 1}}>
                <div style={{fontSize: 16, fontWeight: 800}}>Breakout — RELIANCE</div>
                <div style={{fontSize: 14, color: C.mute, fontWeight: 500}}>Crossed ₹1,850 resistance</div>
              </div>
              <div style={{fontSize: 12, color: C.mute, fontWeight: 600, alignSelf: "flex-start", marginTop: 16}}>now</div>
            </div>
          </div>
        </PhoneShell>
      </div>
    </>
  );
};

/* ------------------------------------------------------------------ */
/*  SCENE 6 — Social proof + CTA                                       */
/* ------------------------------------------------------------------ */
const STAR_PATH = "M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3 6.1 20.6l1.3-6.6L2.5 9.4l6.6-.8z";

const Star: React.FC<{fill: number; size: number; id: string; s: number}> = ({fill, size, id, s}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" style={{transform: `scale(${s})`, display: "block"}}>
    <defs>
      <linearGradient id={id}>
        <stop offset={`${fill * 100}%`} stopColor={C.star} />
        <stop offset={`${fill * 100}%`} stopColor="#D5DAEA" />
      </linearGradient>
    </defs>
    <path d={STAR_PATH} fill={`url(#${id})`} />
  </svg>
);

const Cta: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const rating = 4.2 * p(f, 50, 84, Easing.out(Easing.cubic));
  const dl = Math.round(10000 * p(f, 56, 92, Easing.out(Easing.cubic)));
  const badge = spring({frame: f - 96, fps, config: BOUNCY});
  const tapD = f - 138;
  const dip = tapD >= 0 && tapD < 10 ? Math.sin((tapD / 10) * Math.PI) * 0.05 : 0;
  const ringD = f - 138;
  const logo = spring({frame: f - 4, fps, config: BOUNCY});
  const url = p(f, 112, 126);

  return (
    <>
      <Band top={SAFE.y0}>
        <div style={{transform: `scale(${logo})`}}>
          <Img src={LOGO} style={{width: 96, height: 96, borderRadius: 24, objectFit: "contain", display: "block"}} />
        </div>
      </Band>

      <Band top={400}>
        <Rise lines={["Practice first."]} at={10} size={100} color={C.ink} />
        <Rise lines={["Risk later."]} at={20} size={100} color={C.cobalt} />
      </Band>

      <Band top={700}>
        <div style={{display: "flex", alignItems: "center", justifyContent: "center", width: config.width}}>
          <div style={{width: 440, display: "flex", flexDirection: "column", alignItems: "center", gap: 12}}>
            <div style={{fontFamily: DISPLAY, fontWeight: 800, fontSize: 150, lineHeight: 1, letterSpacing: -5}}>
              {rating.toFixed(1)}
            </div>
            <div style={{display: "flex", gap: 6, height: 52, alignItems: "center"}}>
              {[0, 1, 2, 3, 4].map((i) => (
                <Star
                  key={i}
                  id={`st${i}`}
                  size={52}
                  fill={i < 4 ? 1 : 0.2}
                  s={spring({frame: f - 50 - i * 4, fps, config: BOUNCY})}
                />
              ))}
            </div>
            <div style={{fontFamily: UI, fontWeight: 600, fontSize: 34, color: C.mute}}>on Google Play</div>
          </div>

          <div style={{width: 2, height: 250, background: C.line}} />

          <div style={{width: 440, display: "flex", flexDirection: "column", alignItems: "center", gap: 12}}>
            <div style={{fontFamily: DISPLAY, fontWeight: 800, fontSize: 100, lineHeight: 1.5, letterSpacing: -3, whiteSpace: "nowrap"}}>
              {fmtIN(dl)}+
            </div>
            <div style={{height: 52, display: "flex", alignItems: "center", transform: `scale(${spring({frame: f - 56, fps, config: BOUNCY})})`}}>
              <svg width={48} height={48} viewBox="0 0 24 24" fill="none" stroke={C.cobalt} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 4v11" />
                <path d="M7.5 10.5 12 15l4.5-4.5" />
                <path d="M5 19.5h14" />
              </svg>
            </div>
            <div style={{fontFamily: UI, fontWeight: 600, fontSize: 34, color: C.mute}}>downloads</div>
          </div>
        </div>
      </Band>

      <Band top={1090}>
        <div style={{position: "relative", transform: `scale(${(0.6 + 0.4 * badge) * (1 - dip)})`, opacity: p(f, 96, 102)}}>
          <Img src={BADGE} style={{width: 640, height: "auto", display: "block"}} />
          {ringD >= 0 && ringD < 22 && (
            <div
              style={{
                position: "absolute",
                left: "50%",
                top: "50%",
                width: 60 + ringD * 10,
                height: 60 + ringD * 10,
                marginLeft: -(60 + ringD * 10) / 2,
                marginTop: -(60 + ringD * 10) / 2,
                borderRadius: "50%",
                border: `4px solid ${C.cobalt}`,
                opacity: (1 - ringD / 22) * 0.7,
              }}
            />
          )}
        </div>
      </Band>

      <Band top={1390}>
        <div
          style={{
            fontFamily: UI,
            fontWeight: 800,
            fontSize: 42,
            color: C.cobalt,
            opacity: url,
            transform: `translateY(${(1 - url) * 16}px)`,
          }}
        >
          optionxi.com
        </div>
      </Band>

      <Band top={1448}>
        <div style={{fontFamily: UI, fontWeight: 500, fontSize: 24, color: C.mute, opacity: url, textAlign: "center"}}>
          Educational use only · Virtual trading · Not investment advice
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
    {name: "Hook", from: 0, dur: 120, bg: C.cobalt, el: <Hook />},
    {name: "Brand", from: 120, dur: 120, bg: C.paper, origin: [config.width / 2, 1180], el: <Brand />},
    {name: "Practice", from: 240, dur: 210, bg: C.ink, origin: [config.width / 2, 1030], el: <Practice />},
    {name: "Screener", from: 450, dur: 150, bg: C.sun, origin: [config.width / 2, 1480], el: <Funnel />},
    {name: "Alerts", from: 600, dur: 120, bg: C.cobalt, origin: [config.width / 2, 1080], el: <Alerts />},
    {name: "CTA", from: 720, dur: 180, bg: C.paper, origin: [config.width / 2, 700], el: <Cta />},
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