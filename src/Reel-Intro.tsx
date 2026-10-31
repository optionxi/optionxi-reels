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
import {motion} from "framer-motion";
import {loadFont} from "@remotion/google-fonts/Inter";

/**
 * OptionXi – 30s Instagram Reel (1080x1920, 30fps, 900 frames)
 *
 * Install:  npm i framer-motion @remotion/google-fonts
 *
 * NOTE ON FRAMER MOTION:
 * Framer Motion runs on real time (requestAnimationFrame), which does not stay
 * in sync with Remotion's frame-by-frame rendering. So every motion.* element
 * below is driven by values computed from Remotion's current frame (spring /
 * interpolate) and passed in via `style`. That gives Framer's transform
 * composition + SVG pathLength handling while staying 100% deterministic.
 */

const {fontFamily} = loadFont("normal", {
  weights: ["500", "700", "800"],
  subsets: ["latin"],
});

/* ------------------------------------------------------------------ */
/* Tokens                                                              */
/* ------------------------------------------------------------------ */
const C = {
  bg: "#070d16",
  panel: "#0d1724",
  line: "#223345",
  green: "#23ef83",
  mint: "#9affc5",
  white: "#f4f8fb",
  muted: "#8fa2b5",
  red: "#ff6b81",
  soft: "#a7b7c7",
};
const GREEN_RGB = "35,239,131";

const clamp = {extrapolateLeft: "clamp", extrapolateRight: "clamp"} as const;

/* ------------------------------------------------------------------ */
/* Instagram Reels safe zone (1080 x 1920)                             */
/* top ~250px  : profile / "Reels" header overlay                       */
/* bottom ~430px: caption, audio, buttons overlay                       */
/* sides 72px  : keeps text off the edges / right action rail           */
/* ------------------------------------------------------------------ */
const W = 1080;
const H = 1920;
const SAFE = {top: 250, bottom: 430, side: 72};
const SAFE_BOTTOM_Y = H - SAFE.bottom; // 1490 – nothing important below this line

/* ------------------------------------------------------------------ */
/* Brand assets                                                        */
/* ------------------------------------------------------------------ */
const LOGO = "https://optionxi.com/assets/images/logo_xi.png";
const PLAY_BADGE =
  "https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png";

const STATS = [
  {value: "10K+", label: "Installs", stars: 0},
  {value: "4.2", label: "Rating", stars: 4.2},
];

/* ------------------------------------------------------------------ */
/* Timeline (30fps, 900 frames = 30s)                                  */
/* ------------------------------------------------------------------ */
const T = {
  hook: [0, 70],
  problem: [70, 140],
  meet: [140, 255],
  data: [255, 375],
  order: [375, 490],
  tools: [490, 640],
  results: [640, 720],
  cta: [720, 900],
} as const;

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */
const useSp = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  return (delay = 0, damping = 200, stiffness = 100) =>
    spring({frame: f - delay, fps, config: {damping, stiffness}});
};

const Scene: React.FC<{d: number; children: React.ReactNode}> = ({d, children}) => {
  const f = useCurrentFrame();
  const o = interpolate(f, [0, 10, d - 10, d], [0, 1, 1, 0], clamp);
  return <AbsoluteFill style={{opacity: o}}>{children}</AbsoluteFill>;
};

const S: React.FC<{range: readonly [number, number]; children: React.ReactNode}> = ({
  range,
  children,
}) => (
  <Sequence from={range[0]} durationInFrames={range[1] - range[0]}>
    <Scene d={range[1] - range[0]}>{children}</Scene>
  </Sequence>
);

const fmtIN = (n: number) => "₹" + Math.round(n).toLocaleString("en-IN");

/* ------------------------------------------------------------------ */
/* Text building blocks                                                */
/* ------------------------------------------------------------------ */
type Seg = {t: string; g?: boolean};

const Word: React.FC<{text: string; g?: boolean; size: number; delay: number}> = ({
  text,
  g,
  size,
  delay,
}) => {
  const sp = useSp();
  const s = sp(delay);
  return (
    <motion.span
      style={{
        display: "inline-block",
        margin: `0 ${size * 0.11}px`,
        fontSize: size,
        lineHeight: 1.04,
        fontWeight: 800,
        letterSpacing: -size * 0.045,
        color: g ? C.green : C.white,
        opacity: s,
        y: (1 - s) * 36,
      }}
    >
      {text}
    </motion.span>
  );
};

const Headline: React.FC<{
  lines: Seg[][];
  size?: number;
  delay?: number;
  align?: "left" | "center";
}> = ({lines, size = 84, delay = 0, align = "left"}) => {
  let i = 0;
  return (
    <div style={{textAlign: align, margin: `0 ${-size * 0.11}px`}}>
      {lines.map((line, li) => (
        <div key={li}>
          {line.flatMap((seg) =>
            seg.t.split(" ").map((w) => {
              const k = i++;
              return <Word key={k} text={w} g={seg.g} size={size} delay={delay + k * 4} />;
            }),
          )}
        </div>
      ))}
    </div>
  );
};

const Eyebrow: React.FC<{children: string; delay?: number; align?: "left" | "center"}> = ({
  children,
  delay = 0,
  align = "left",
}) => {
  const sp = useSp();
  const s = sp(delay);
  return (
    <motion.div
      style={{
        fontSize: 24,
        letterSpacing: 5,
        fontWeight: 700,
        color: C.green,
        textTransform: "uppercase",
        opacity: s,
        textAlign: align,
        marginBottom: 20,
        x: (1 - s) * -30,
      }}
    >
      {children}
    </motion.div>
  );
};

const Sub: React.FC<{
  children: React.ReactNode;
  delay?: number;
  align?: "left" | "center";
  size?: number;
}> = ({children, delay = 20, align = "left", size = 30}) => {
  const sp = useSp();
  const s = sp(delay);
  return (
    <motion.div
      style={{
        fontSize: size,
        lineHeight: 1.38,
        color: C.soft,
        fontWeight: 500,
        marginTop: 22,
        maxWidth: W - SAFE.side * 2,
        textAlign: align,
        marginLeft: align === "center" ? "auto" : 0,
        marginRight: align === "center" ? "auto" : 0,
        opacity: s,
        y: (1 - s) * 24,
      }}
    >
      {children}
    </motion.div>
  );
};

const Copy: React.FC<{top: number; children: React.ReactNode; align?: "left" | "center"}> = ({
  top,
  children,
  align = "left",
}) => (
  <div style={{position: "absolute", left: SAFE.side, right: SAFE.side, top, textAlign: align}}>
    {children}
  </div>
);

/** Small disclaimer line – sits just above the bottom UI overlay zone */
const Foot: React.FC<{children: string}> = ({children}) => (
  <div
    style={{
      position: "absolute",
      top: SAFE_BOTTOM_Y - 10,
      left: SAFE.side,
      right: SAFE.side,
      fontSize: 22,
      lineHeight: 1.35,
      color: "#74889b",
      textAlign: "center",
      fontWeight: 500,
    }}
  >
    {children}
  </div>
);

/* ------------------------------------------------------------------ */
/* Background + top brand bar                                          */
/* ------------------------------------------------------------------ */
const Background: React.FC = () => {
  const f = useCurrentFrame();
  const drift = Math.sin(f / 90) * 60;
  return (
    <AbsoluteFill
      style={{background: "linear-gradient(160deg, #09111d 0%, #060b13 55%, #080f18 100%)"}}
    >
      <div
        style={{
          position: "absolute",
          width: 900,
          height: 900,
          borderRadius: "50%",
          left: 90 + drift,
          top: 700 - drift,
          background: "rgba(35,239,131,0.10)",
          filter: "blur(130px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 700,
          height: 700,
          borderRadius: "50%",
          right: -150 - drift,
          top: -100,
          background: "rgba(40,110,190,0.14)",
          filter: "blur(120px)",
        }}
      />
      <AbsoluteFill
        style={{
          opacity: 0.16,
          backgroundImage:
            "linear-gradient(rgba(123,160,190,.14) 1px, transparent 1px), linear-gradient(90deg, rgba(123,160,190,.14) 1px, transparent 1px)",
          backgroundSize: "72px 72px",
          backgroundPosition: `0 ${(f * 0.6) % 72}px`,
          WebkitMaskImage:
            "linear-gradient(to bottom, transparent, #000 15%, #000 85%, transparent)",
        }}
      />
    </AbsoluteFill>
  );
};

const Brand: React.FC = () => {
  const sp = useSp();
  const s = sp(0, 14);
  return (
    <motion.div
      style={{
        position: "absolute",
        top: SAFE.top - 10,
        left: SAFE.side,
        right: SAFE.side,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        opacity: s,
        y: (1 - s) * -20,
        zIndex: 30,
      }}
    >
      <div style={{display: "flex", alignItems: "center", gap: 16}}>
        <Img
          src={LOGO}
          style={{
            width: 64,
            height: 64,
            objectFit: "contain",
            filter: `drop-shadow(0 0 22px rgba(${GREEN_RGB},.35))`,
          }}
        />
        <div style={{fontSize: 40, fontWeight: 800, letterSpacing: -1.6}}>
          Option<span style={{color: C.green}}>Xi</span>
        </div>
      </div>
      <div style={{fontSize: 20, letterSpacing: 4, color: "#91a7b9", fontWeight: 700}}>
        VIRTUAL TRADING
      </div>
    </motion.div>
  );
};

/* ------------------------------------------------------------------ */
/* Phone mockup (designed at 560x1080, scaled to fit the safe zone)    */
/* ------------------------------------------------------------------ */
const PW = 560;
const PH = 1080;
const PS = 0.72; // on-canvas size ≈ 403 x 778
const PHONE_TOP = 680; // bottom edge ≈ 1458 (inside safe zone)

const Phone: React.FC<{
  children: React.ReactNode;
  top?: number;
  delay?: number;
  tilt?: number;
}> = ({children, top = PHONE_TOP, delay = 0, tilt = 0}) => {
  const f = useCurrentFrame();
  const sp = useSp();
  const s = sp(delay, 16, 80);
  const y = (1 - s) * 420 + Math.sin(f / 22) * 6;
  const rot = tilt * (1 - s) * 3 + tilt;
  return (
    <motion.div
      style={{
        position: "absolute",
        left: (W - PW) / 2,
        top,
        width: PW,
        height: PH,
        borderRadius: 66,
        border: "4px solid #3a4b5e",
        background: "#050a11",
        boxShadow:
          "0 60px 140px rgba(0,0,0,.65), 0 0 0 12px #101b28, 0 0 100px rgba(35,239,131,.14)",
        overflow: "hidden",
        opacity: s,
        y,
        rotate: rot,
        scale: PS * (0.94 + 0.06 * s),
        originX: 0.5,
        originY: 0,
      }}
    >
      <div
        style={{
          position: "absolute",
          zIndex: 5,
          width: 150,
          height: 28,
          top: 14,
          left: "50%",
          marginLeft: -75,
          borderRadius: 20,
          background: "#02050a",
        }}
      />
      <div
        style={{
          height: "100%",
          padding: "62px 26px 26px",
          background: "radial-gradient(ellipse at 50% 0%, #18352b 0%, transparent 45%), #0a111a",
        }}
      >
        {children}
      </div>
    </motion.div>
  );
};

const Callout: React.FC<{
  top: number;
  side: "left" | "right";
  title: string;
  body: string;
  delay: number;
  accent?: string;
}> = ({top, side, title, body, delay, accent = C.green}) => {
  const sp = useSp();
  const s = sp(delay, 15, 100);
  return (
    <motion.div
      style={{
        position: "absolute",
        top,
        [side]: SAFE.side - 20,
        width: 300,
        padding: "20px 22px",
        borderRadius: 24,
        background: "rgba(13,23,36,.94)",
        border: `1px solid ${accent}66`,
        boxShadow: "0 30px 80px rgba(0,0,0,.55)",
        opacity: s,
        x: (1 - s) * (side === "left" ? -160 : 160),
        zIndex: 20,
      }}
    >
      <div style={{fontSize: 27, fontWeight: 800, color: accent, lineHeight: 1.15}}>{title}</div>
      <div style={{fontSize: 21, lineHeight: 1.35, color: "#b4c3d1", marginTop: 8, fontWeight: 500}}>
        {body}
      </div>
    </motion.div>
  );
};

/* ------------------------------------------------------------------ */
/* Phone screen pieces                                                 */
/* ------------------------------------------------------------------ */
const ScreenHead: React.FC<{title: string}> = ({title}) => (
  <div style={{display: "flex", justifyContent: "space-between", alignItems: "center"}}>
    <div style={{display: "flex", alignItems: "center", gap: 10}}>
      <Img src={LOGO} style={{width: 36, height: 36, objectFit: "contain"}} />
      <div style={{fontSize: 30, fontWeight: 800, color: C.white, letterSpacing: -1}}>
        Option<span style={{color: C.green}}>Xi</span>
      </div>
    </div>
    <div style={{fontSize: 20, color: "#a8b9c9", fontWeight: 600}}>{title}</div>
  </div>
);

const Row: React.FC<{
  title: string;
  sub: string;
  right: string;
  rightColor?: string;
  style?: React.CSSProperties;
  s?: number;
}> = ({title, sub, right, rightColor = C.green, style, s = 1}) => (
  <motion.div
    style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "20px 22px",
      borderRadius: 20,
      background: "#111e2b",
      border: `1px solid ${C.line}`,
      marginTop: 14,
      opacity: s,
      x: (1 - s) * 60,
      ...style,
    }}
  >
    <div>
      <div style={{fontSize: 27, fontWeight: 800}}>{title}</div>
      <div style={{fontSize: 19, color: C.muted, marginTop: 5, fontWeight: 500}}>{sub}</div>
    </div>
    <div style={{fontSize: 24, fontWeight: 800, color: rightColor}}>{right}</div>
  </motion.div>
);

const Pill: React.FC<{
  children: React.ReactNode;
  on?: boolean;
  strike?: boolean;
  bad?: boolean;
}> = ({children, on, strike, bad}) => (
  <div
    style={{
      padding: "12px 20px",
      borderRadius: 999,
      fontSize: 20,
      fontWeight: 800,
      background: on ? "rgba(35,239,131,.15)" : bad ? "rgba(255,107,129,.10)" : "#111e2b",
      color: on ? C.green : bad ? C.red : "#9fb3c6",
      border: `1px solid ${on ? "#2a7a52" : bad ? "#58313d" : C.line}`,
      textDecoration: strike ? "line-through" : "none",
      opacity: strike ? 0.75 : 1,
    }}
  >
    {children}
  </div>
);

/* ---------- Screen 1: dashboard ---------- */
const DashboardScreen: React.FC = () => {
  const f = useCurrentFrame();
  const sp = useSp();
  const bal = interpolate(f, [15, 70], [0, 300000], {...clamp, easing: Easing.out(Easing.cubic)});
  return (
    <div>
      <ScreenHead title="Practice mode" />
      <div
        style={{
          marginTop: 26,
          padding: 26,
          borderRadius: 26,
          background: "linear-gradient(135deg,#123126,#0d1c20)",
          border: "1px solid #28543e",
        }}
      >
        <div style={{fontSize: 18, letterSpacing: 2, color: "#8da99c", fontWeight: 700}}>
          VIRTUAL BALANCE
        </div>
        <div style={{fontSize: 62, fontWeight: 800, letterSpacing: -3, marginTop: 10}}>
          {fmtIN(bal)}
        </div>
        <div style={{fontSize: 20, color: C.green, marginTop: 8, fontWeight: 600}}>
          ● No real money at risk
        </div>
      </div>
      <div style={{display: "flex", gap: 10, marginTop: 18}}>
        <Pill on>● Previous-day data</Pill>
      </div>
      <div style={{fontSize: 26, fontWeight: 800, margin: "26px 0 2px"}}>What you can trade</div>
      <Row s={sp(30, 18)} title="NIFTY" sub="Index options" right="Buy / Sell" />
      <Row s={sp(38, 18)} title="BANKNIFTY" sub="Index options" right="Buy / Sell" />
      <Row s={sp(46, 18)} title="Nifty 50 stocks" sub="Stock options" right="Buy / Sell" />
      <motion.div
        style={{
          marginTop: 26,
          padding: 22,
          textAlign: "center",
          borderRadius: 20,
          background: C.green,
          color: "#06120c",
          fontSize: 26,
          fontWeight: 800,
          opacity: sp(56, 18),
          y: (1 - sp(56, 18)) * 30,
        }}
      >
        Start practice ↗
      </motion.div>
    </div>
  );
};

/* ---------- Screen 2: previous-day replay ---------- */
const CANDLES: [number, number, number, number][] = [
  [50, 56, 46, 54],
  [54, 60, 52, 58],
  [58, 62, 54, 55],
  [55, 57, 48, 50],
  [50, 53, 44, 47],
  [47, 55, 45, 53],
  [53, 61, 52, 60],
  [60, 66, 58, 64],
  [64, 68, 59, 61],
  [61, 63, 55, 57],
  [57, 64, 56, 63],
  [63, 70, 62, 68],
  [68, 72, 65, 66],
  [66, 73, 65, 71],
];

const DataScreen: React.FC = () => {
  const f = useCurrentFrame();
  const sp = useSp();
  const n = interpolate(f, [12, 90], [0, CANDLES.length], {
    ...clamp,
    easing: Easing.inOut(Easing.quad),
  });
  const yy = (v: number) => 290 - v * 3.4;
  const xx = (i: number) => 24 + i * 35;
  const cardS = sp(6, 18);
  return (
    <div>
      <ScreenHead title="Previous-day data" />
      <div style={{display: "flex", gap: 10, marginTop: 24}}>
        <Pill strike bad>
          LIVE
        </Pill>
        <Pill on>YESTERDAY ✓</Pill>
      </div>
      <motion.div
        style={{
          marginTop: 20,
          padding: 20,
          borderRadius: 24,
          background: "#0e1a27",
          border: `1px solid ${C.line}`,
          opacity: cardS,
          y: (1 - cardS) * 30,
        }}
      >
        <div style={{display: "flex", justifyContent: "space-between", fontSize: 20, fontWeight: 700}}>
          <span>NIFTY · yesterday</span>
          <span style={{color: C.green}}>Replay</span>
        </div>
        <svg viewBox="0 0 520 300" width="100%" style={{marginTop: 10}}>
          <g stroke="#26394b" strokeWidth={2}>
            <path d="M10 70H510M10 150H510M10 230H510" />
          </g>
          {CANDLES.map(([o, h, l, c], i) => {
            const vis = Math.max(0, Math.min(1, n - i));
            const up = c >= o;
            const col = up ? C.green : C.red;
            return (
              <g key={i} opacity={vis}>
                <line x1={xx(i)} x2={xx(i)} y1={yy(h)} y2={yy(l)} stroke={col} strokeWidth={3} />
                <rect
                  x={xx(i) - 9}
                  y={yy(Math.max(o, c))}
                  width={18}
                  height={Math.max(4, Math.abs(yy(o) - yy(c)))}
                  rx={3}
                  fill={col}
                />
              </g>
            );
          })}
          <line
            x1={xx(Math.min(n, CANDLES.length - 1)) + 18}
            x2={xx(Math.min(n, CANDLES.length - 1)) + 18}
            y1={20}
            y2={290}
            stroke="#ffffff"
            strokeOpacity={0.3}
            strokeDasharray="6 8"
            strokeWidth={2}
          />
        </svg>
        <div style={{display: "flex", justifyContent: "space-between", fontSize: 18, color: C.muted, fontWeight: 600}}>
          <span>9:15 AM</span>
          <span>3:30 PM</span>
        </div>
      </motion.div>
      <div style={{marginTop: 18, height: 10, borderRadius: 10, background: "#13212f", overflow: "hidden"}}>
        <div
          style={{
            width: `${(n / CANDLES.length) * 100}%`,
            height: "100%",
            background: C.green,
            borderRadius: 10,
          }}
        />
      </div>
      <motion.div
        style={{
          marginTop: 22,
          padding: 22,
          borderRadius: 22,
          background: "#111e2b",
          border: "1px solid #245d42",
          opacity: sp(60, 18),
          y: (1 - sp(60, 18)) * 30,
        }}
      >
        <div style={{fontSize: 26, fontWeight: 800}}>Why yesterday's data?</div>
        <div style={{fontSize: 22, color: C.soft, marginTop: 10, lineHeight: 1.4}}>
          No live-price pressure. Take your time, think, trade and learn.
        </div>
      </motion.div>
    </div>
  );
};

/* ---------- Screen 3: order ticket ---------- */
const OrderScreen: React.FC = () => {
  const f = useCurrentFrame();
  const idx = f < 32 ? 0 : f < 62 ? 1 : 2;
  const contract = ["NIFTY 24,800 CE", "BANKNIFTY 52,000 PE", "RELIANCE"][idx];
  const kind = ["Call option · illustrative", "Put option · illustrative", "Stocks · illustrative"][idx];
  const side = idx === 1 ? "SELL" : "BUY";
  const lots = [1, 2, 1][idx];
  const done = f > 92;
  const pulse = f > 76 && f <= 92 ? 1 + Math.sin((f - 76) * 0.9) * 0.03 : 1;
  const chip = (t: string, on: boolean) => (
    <div
      style={{
        flex: 1,
        textAlign: "center",
        padding: "15px 0",
        borderRadius: 14,
        fontSize: 20,
        fontWeight: 800,
        background: on ? "rgba(35,239,131,.15)" : "#111e2b",
        color: on ? C.green : "#9fb3c6",
        border: `1px solid ${on ? "#2a7a52" : C.line}`,
      }}
    >
      {t}
    </div>
  );
  return (
    <div>
      <ScreenHead title="Virtual order" />
      <div style={{display: "flex", gap: 10, marginTop: 26}}>
        {chip("NIFTY", idx === 0)}
        {chip("BANKNIFTY", idx === 1)}
        {chip("STOCKS", idx === 2)}
      </div>
      <div style={{marginTop: 20, padding: 24, borderRadius: 24, background: "#111e2b", border: `1px solid ${C.line}`}}>
        <div style={{fontSize: 19, color: C.muted, fontWeight: 600}}>Example contract</div>
        <div style={{fontSize: 34, fontWeight: 800, marginTop: 8}}>{contract}</div>
        <div style={{fontSize: 19, color: C.muted, marginTop: 6}}>{kind}</div>
      </div>
      <div style={{display: "flex", gap: 12, marginTop: 20}}>
        {chip("BUY", side === "BUY")}
        {chip("SELL", side === "SELL")}
      </div>
      <div style={{marginTop: 20, padding: 22, borderRadius: 20, background: "#111e2b", border: `1px solid ${C.line}`, display: "flex", justifyContent: "space-between", alignItems: "center"}}>
        <div style={{fontSize: 23, color: "#b4c3d1", fontWeight: 600}}>Lots</div>
        <div style={{fontSize: 40, fontWeight: 800}}>{lots}</div>
      </div>
      <div style={{marginTop: 14, padding: 22, borderRadius: 20, background: "#111e2b", border: `1px solid ${C.line}`, display: "flex", justifyContent: "space-between", alignItems: "center"}}>
        <div style={{fontSize: 23, color: "#b4c3d1", fontWeight: 600}}>Virtual margin</div>
        <div style={{fontSize: 28, fontWeight: 800}}>₹ 18,500</div>
      </div>
      <div
        style={{
          marginTop: 26,
          padding: 24,
          textAlign: "center",
          borderRadius: 20,
          background: done ? "#123a29" : C.green,
          color: done ? C.green : "#06120c",
          border: done ? `1px solid ${C.green}` : "none",
          fontSize: 26,
          fontWeight: 800,
          transform: `scale(${pulse})`,
        }}
      >
        {done ? "Virtual position added ✓" : "Place virtual order"}
      </div>
      <div style={{fontSize: 18, color: "#6b8094", textAlign: "center", marginTop: 16}}>
        No real order is placed. Figures are illustrative.
      </div>
    </div>
  );
};

/* ---------- Screen 4: tools ---------- */
const IconResearch = ({c}: {c: string}) => (
  <svg viewBox="0 0 24 24" width={34} height={34} fill="none" stroke={c} strokeWidth={2.4} strokeLinecap="round">
    <circle cx={10.5} cy={10.5} r={6.5} />
    <path d="M15.5 15.5 21 21" />
  </svg>
);
const IconAI = ({c}: {c: string}) => (
  <svg viewBox="0 0 24 24" width={34} height={34} fill={c}>
    <path d="M12 2l2.2 6.3L20.5 10l-6.3 1.7L12 18l-2.2-6.3L3.5 10l6.3-1.7L12 2z" />
    <path d="M19 15l.9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9L19 15z" />
  </svg>
);
const IconFilter = ({c}: {c: string}) => (
  <svg viewBox="0 0 24 24" width={34} height={34} fill="none" stroke={c} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 5h18l-7 8v6l-4-2v-4L3 5z" />
  </svg>
);

const ToolsScreen: React.FC = () => {
  const f = useCurrentFrame();
  const sp = useSp();
  const a = f < 55 ? 0 : f < 100 ? 1 : 2;
  const tools = [
    {t: "Research tools", b: "Charts, news & company info", Icon: IconResearch},
    {t: "AI predictions", b: "AI views to learn from", Icon: IconAI},
    {t: "Stock screeners", b: "Filter stocks your way", Icon: IconFilter},
  ];
  const prevOp = [
    interpolate(f, [0, 12, 50, 60], [0, 1, 1, 0], clamp),
    interpolate(f, [50, 60, 95, 105], [0, 1, 1, 0], clamp),
    interpolate(f, [95, 105, 150], [0, 1, 1], clamp),
  ];
  return (
    <div>
      <ScreenHead title="Tools" />
      {tools.map(({t, b, Icon}, i) => {
        const on = a === i;
        const s = sp(8 + i * 8, 18);
        return (
          <motion.div
            key={t}
            style={{
              marginTop: i === 0 ? 24 : 14,
              display: "flex",
              alignItems: "center",
              gap: 18,
              padding: "18px 20px",
              borderRadius: 22,
              background: on ? "linear-gradient(135deg,#123126,#0d1c20)" : "#111e2b",
              border: `1px solid ${on ? C.green : C.line}`,
              opacity: s,
              x: (1 - s) * 60,
              scale: on ? 1.02 : 1,
            }}
          >
            <div
              style={{
                width: 62,
                height: 62,
                borderRadius: 18,
                display: "grid",
                placeItems: "center",
                background: on ? "rgba(35,239,131,.18)" : "#0d1724",
              }}
            >
              <Icon c={on ? C.green : "#9fb3c6"} />
            </div>
            <div>
              <div style={{fontSize: 28, fontWeight: 800}}>{t}</div>
              <div style={{fontSize: 20, color: C.muted, marginTop: 4, fontWeight: 500}}>{b}</div>
            </div>
          </motion.div>
        );
      })}

      {/* preview panel – crossfades with the highlighted tool */}
      <div style={{position: "relative", height: 300, marginTop: 22}}>
        <div style={{position: "absolute", inset: 0, opacity: prevOp[0]}}>
          <div style={{padding: 22, borderRadius: 22, background: "#0e1a27", border: `1px solid ${C.line}`}}>
            <div style={{fontSize: 20, fontWeight: 700}}>Price chart · illustrative</div>
            <svg viewBox="0 0 480 130" width="100%" style={{marginTop: 8}}>
              <motion.path
                d="M5 105 C60 95 80 115 130 78 S210 85 250 55 S330 70 370 38 S440 40 475 15"
                stroke={C.green}
                strokeWidth={6}
                fill="none"
                strokeLinecap="round"
                initial={false}
                style={{pathLength: interpolate(f, [8, 45], [0, 1], clamp)}}
              />
            </svg>
            <div style={{display: "flex", gap: 10, marginTop: 6}}>
              <Pill>Charts</Pill>
              <Pill>News</Pill>
              <Pill>Fundamentals</Pill>
            </div>
          </div>
        </div>

        <div style={{position: "absolute", inset: 0, opacity: prevOp[1]}}>
          <div style={{padding: 22, borderRadius: 22, background: "#0e1a27", border: "1px solid #28543e"}}>
            <div style={{fontSize: 20, fontWeight: 700, color: C.green}}>AI view · illustrative</div>
            {[
              ["Trend bias", "Upward"],
              ["Confidence", "Medium"],
              ["Use it to", "Learn & compare"],
            ].map(([k, v]) => (
              <div key={k} style={{display: "flex", justifyContent: "space-between", marginTop: 16, fontSize: 24}}>
                <span style={{color: C.muted, fontWeight: 600}}>{k}</span>
                <span style={{fontWeight: 800}}>{v}</span>
              </div>
            ))}
            <div style={{fontSize: 18, color: "#6b8094", marginTop: 18}}>
              Predictions can be wrong. Not financial advice.
            </div>
          </div>
        </div>

        <div style={{position: "absolute", inset: 0, opacity: prevOp[2]}}>
          <div style={{padding: 22, borderRadius: 22, background: "#0e1a27", border: `1px solid ${C.line}`}}>
            <div style={{fontSize: 20, fontWeight: 700}}>Your filters</div>
            <div style={{display: "flex", gap: 10, flexWrap: "wrap", marginTop: 14}}>
              <Pill on>PE below 25</Pill>
              <Pill on>Large cap</Pill>
              <Pill on>Volume rising</Pill>
            </div>
            <div style={{marginTop: 22, fontSize: 42, fontWeight: 800, color: C.green, letterSpacing: -1.5}}>
              12 stocks match
            </div>
            <div style={{fontSize: 19, color: C.muted, marginTop: 6}}>Illustrative example</div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ---------- Screen 5: results / review ---------- */
const ResultsScreen: React.FC = () => {
  const f = useCurrentFrame();
  const sp = useSp();
  const draw = interpolate(f, [10, 55], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
  const pop = (d: number) => {
    const s = sp(d, 18);
    return {opacity: s, y: (1 - s) * 40};
  };
  return (
    <div>
      <ScreenHead title="Practice portfolio" />
      <div style={{marginTop: 26, padding: 24, borderRadius: 26, background: "#0e1a27", border: `1px solid ${C.line}`}}>
        <div style={{fontSize: 19, color: C.muted, fontWeight: 600}}>Simulated P&amp;L · illustrative</div>
        <svg viewBox="0 0 520 190" width="100%" style={{marginTop: 10}}>
          <motion.path
            d="M10 160 C80 150 100 175 160 120 S250 130 300 90 S380 105 430 55 S490 60 510 25"
            stroke={C.green}
            strokeWidth={6}
            fill="none"
            strokeLinecap="round"
            initial={false}
            style={{pathLength: draw}}
          />
        </svg>
      </div>
      <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginTop: 16}}>
        <motion.div style={{padding: 20, borderRadius: 22, background: "#0d1926", border: "1px solid #245d42", ...pop(26)}}>
          <div style={{fontSize: 16, letterSpacing: 2, color: C.muted, fontWeight: 700}}>TRADE A</div>
          <div style={{fontSize: 44, fontWeight: 800, color: C.green, marginTop: 12, letterSpacing: -1.5}}>+₹820</div>
          <div style={{fontSize: 18, color: C.muted, marginTop: 6}}>Illustrative gain</div>
        </motion.div>
        <motion.div style={{padding: 20, borderRadius: 22, background: "#0d1926", border: "1px solid #58313d", ...pop(34)}}>
          <div style={{fontSize: 16, letterSpacing: 2, color: C.muted, fontWeight: 700}}>TRADE B</div>
          <div style={{fontSize: 44, fontWeight: 800, color: "#ff8191", marginTop: 12, letterSpacing: -1.5}}>−₹460</div>
          <div style={{fontSize: 18, color: C.muted, marginTop: 6}}>Illustrative loss</div>
        </motion.div>
      </div>
      <motion.div style={{marginTop: 16, padding: 22, borderRadius: 22, background: "#111e2b", border: `1px solid ${C.line}`, ...pop(44)}}>
        <div style={{fontSize: 25, fontWeight: 800}}>Trade review</div>
        <div style={{fontSize: 21, color: C.soft, marginTop: 10, lineHeight: 1.4}}>
          What was my plan? What happened? What will I change next time?
        </div>
      </motion.div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Scenes                                                              */
/* ------------------------------------------------------------------ */
const CHROME_TOP = SAFE.top + 90; // first y where copy may start (below brand bar)

const Hook: React.FC = () => {
  const f = useCurrentFrame();
  const draw = interpolate(f, [10, 60], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
  return (
    <AbsoluteFill>
      <Copy top={CHROME_TOP}>
        <Eyebrow>Options, made simple</Eyebrow>
        <Headline
          lines={[[{t: "Learn options"}], [{t: "without the"}], [{t: "risk.", g: true}]]}
          size={112}
        />
        <Sub delay={22}>Practice with virtual money first.</Sub>
      </Copy>
      <svg
        viewBox="0 0 1080 420"
        style={{position: "absolute", left: 0, top: 1040, width: W, height: 420}}
        fill="none"
      >
        <motion.path
          d="M0 330 C100 300 130 350 220 270 S340 300 430 220 S570 260 650 190 S770 220 850 120 S970 160 1080 60"
          stroke={C.green}
          strokeWidth={7}
          strokeLinecap="round"
          initial={false}
          style={{pathLength: draw}}
        />
        {[105, 275, 445, 615, 785].map((x, i) => (
          <g
            key={x}
            stroke={C.green}
            strokeWidth={6}
            strokeLinecap="round"
            opacity={interpolate(f, [20 + i * 6, 34 + i * 6], [0, 0.8], clamp)}
          >
            <path d={`M${x} ${260 - i * 45}V${360 - i * 45}`} />
          </g>
        ))}
      </svg>
    </AbsoluteFill>
  );
};

const Problem: React.FC = () => {
  const sp = useSp();
  const cards = [
    ["Real money", "Learning on a live account can get expensive, fast."],
    ["Real pressure", "Fear and FOMO make beginners rush."],
    ["Real jargon", "Strike, premium, expiry — it's a lot at once."],
  ];
  return (
    <AbsoluteFill>
      <Copy top={CHROME_TOP}>
        <Eyebrow>Start smart</Eyebrow>
        <Headline
          lines={[[{t: "Don't risk"}], [{t: "real money"}], [{t: "to learn.", g: true}]]}
          size={100}
        />
      </Copy>
      <div
        style={{
          position: "absolute",
          left: SAFE.side,
          right: SAFE.side,
          top: 860,
          display: "flex",
          flexDirection: "column",
          gap: 18,
        }}
      >
        {cards.map(([a, b], i) => {
          const s = sp(22 + i * 9, 18);
          return (
            <motion.div
              key={a}
              style={{
                padding: "26px 32px",
                borderRadius: 26,
                background: "rgba(13,23,36,.9)",
                border: `1px solid ${C.line}`,
                opacity: s,
                x: (1 - s) * 120,
              }}
            >
              <div style={{fontSize: 32, fontWeight: 800, color: i === 0 ? "#ff8191" : C.white}}>{a}</div>
              <div style={{fontSize: 25, color: C.soft, marginTop: 8, fontWeight: 500}}>{b}</div>
            </motion.div>
          );
        })}
      </div>
      <Foot>Practice first. Trade smarter later.</Foot>
    </AbsoluteFill>
  );
};

const Meet: React.FC = () => (
  <AbsoluteFill>
    <Copy top={CHROME_TOP - 20}>
      <Eyebrow>Meet OptionXi</Eyebrow>
      <Headline lines={[[{t: "Practice trading"}], [{t: "with virtual"}, {t: "money.", g: true}]]} size={78} />
      <Sub delay={24} size={28}>
        Start with ₹3,00,000 of virtual cash. No real money, ever.
      </Sub>
    </Copy>
    <Phone delay={10} tilt={-2}>
      <DashboardScreen />
    </Phone>
    <Callout top={820} side="left" title="₹3,00,000" body="Virtual starting cash" delay={50} />
    <Callout top={1120} side="right" title="Nifty · BankNifty" body="+ Nifty 50 stock options" delay={66} />
    <Foot>Illustrative interface. Virtual balance can't be withdrawn.</Foot>
  </AbsoluteFill>
);

const DataScene: React.FC = () => (
  <AbsoluteFill>
    <Copy top={CHROME_TOP - 20}>
      <Eyebrow>How it works</Eyebrow>
      <Headline lines={[[{t: "Yesterday's market."}], [{t: "Today's"}, {t: "practice.", g: true}]]} size={78} />
      <Sub delay={24} size={28}>
        Not live prices. You trade on the previous day's data — so you can take your time and learn why prices moved.
      </Sub>
    </Copy>
    <Phone top={PHONE_TOP + 30} delay={8} tilt={2}>
      <DataScreen />
    </Phone>
    <Callout top={880} side="left" title="Not live" body="No rush, no stress" delay={40} accent={C.red} />
    <Callout top={1180} side="right" title="Previous day" body="Replay a full market day" delay={62} />
    <Foot>Practice uses previous-day data, not live market prices.</Foot>
  </AbsoluteFill>
);

const Order: React.FC = () => (
  <AbsoluteFill>
    <Copy top={CHROME_TOP - 20}>
      <Eyebrow>Buy &amp; sell options</Eyebrow>
      <Headline lines={[[{t: "Trade Nifty,"}], [{t: "BankNifty &"}, {t: "stocks.", g: true}]]} size={78} />
      <Sub delay={24} size={28}>
        Pick a contract, set the lots, place a virtual order. Same steps, zero risk.
      </Sub>
    </Copy>
    <Phone top={PHONE_TOP + 30} delay={8} tilt={-2}>
      <OrderScreen />
    </Phone>
    <Callout top={900} side="left" title="Buy or sell" body="Calls and puts, both ways" delay={40} />
    <Callout top={1200} side="right" title="Nifty 50 stocks" body="Stock options too" delay={62} />
    <Foot>Example figures are illustrative, not a recommendation.</Foot>
  </AbsoluteFill>
);

const Tools: React.FC = () => (
  <AbsoluteFill>
    <Copy top={CHROME_TOP - 20}>
      <Eyebrow>Tools to learn faster</Eyebrow>
      <Headline lines={[[{t: "Research stocks"}], [{t: "like a"}, {t: "pro.", g: true}]]} size={78} />
      <Sub delay={24} size={28}>
        Research tools, AI predictions and screeners — all in one app.
      </Sub>
    </Copy>
    <Phone top={PHONE_TOP + 30} delay={8} tilt={2}>
      <ToolsScreen />
    </Phone>
    <Callout top={900} side="left" title="Screeners" body="Filter stocks by your rules" delay={104} />
    <Callout top={1200} side="right" title="AI predictions" body="A learning aid, not advice" delay={58} />
    <Foot>AI predictions can be wrong. For learning only.</Foot>
  </AbsoluteFill>
);

const Results: React.FC = () => (
  <AbsoluteFill>
    <Copy top={CHROME_TOP - 20}>
      <Eyebrow>Learn by doing</Eyebrow>
      <Headline
        lines={[[{t: "Test it."}], [{t: "Review it."}], [{t: "Learn from it.", g: true}]]}
        size={78}
      />
    </Copy>
    <Phone top={PHONE_TOP + 20} delay={6} tilt={-2}>
      <ResultsScreen />
    </Phone>
    <Callout top={1000} side="left" title="Win or lose" body="Both teach something" delay={30} accent="#ff8191" />
    <Foot>Simulated results don't predict real trading performance.</Foot>
  </AbsoluteFill>
);

/* ------------------------------------------------------------------ */
/* CTA                                                                 */
/* ------------------------------------------------------------------ */
const STAR_SIZE = 26;

const Star: React.FC<{color: string}> = ({color}) => (
  <svg viewBox="0 0 24 24" width={STAR_SIZE} height={STAR_SIZE} style={{display: "block"}}>
    <path
      d="M12 2.5l2.9 6.06 6.6.86-4.86 4.5 1.2 6.58L12 17.9l-5.84 3.1 1.2-6.58L2.5 9.42l6.6-.86L12 2.5z"
      fill={color}
    />
  </svg>
);

const StarRow: React.FC<{value: number; shimmer: number}> = ({value, shimmer}) => (
  <div style={{display: "flex", gap: 4}}>
    {[1, 2, 3, 4, 5].map((n) => {
      const fill = Math.max(0, Math.min(1, value - (n - 1)));
      return (
        <div key={n} style={{position: "relative", width: STAR_SIZE, height: STAR_SIZE, lineHeight: 0}}>
          <Star color="rgba(255,255,255,.18)" />
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              height: "100%",
              width: `${fill * 100}%`,
              overflow: "hidden",
              opacity: 0.85 + shimmer * 0.15,
              filter: "drop-shadow(0 0 10px rgba(255,196,0,.45))",
            }}
          >
            <Star color="#FFC400" />
          </div>
        </div>
      );
    })}
  </div>
);

const Rise: React.FC<{p: number; d?: number; children: React.ReactNode; style?: React.CSSProperties}> = ({
  p,
  d = 36,
  children,
  style,
}) => (
  <motion.div style={{opacity: Math.min(1, Math.max(0, p)), y: (1 - p) * d, ...style}}>
    {children}
  </motion.div>
);

export const Cta: React.FC = () => {
  const f = useCurrentFrame();
  const sp = useSp();

  const mark = sp(0, 12);
  const sub = sp(26);
  const stats = sp(34);
  const btn = sp(42, 14);
  const legal = sp(60, 20);

  const glow = 0.3 + Math.sin(f / 9) * 0.08;
  const shimmer = 0.6 + Math.sin(f / 7) * 0.4;

  return (
    <AbsoluteFill>
      <div
        style={{
          position: "absolute",
          top: 300,
          left: "50%",
          width: 760,
          height: 760,
          marginLeft: -380,
          borderRadius: "50%",
          background: `radial-gradient(circle, rgba(${GREEN_RGB},${glow}) 0%, rgba(${GREEN_RGB},0) 65%)`,
          filter: "blur(50px)",
          transform: `scale(${0.95 + Math.sin(f / 14) * 0.05})`,
        }}
      />

      {/* centred column kept inside the safe zone */}
      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: `${SAFE.top + 60}px ${SAFE.side}px ${SAFE.bottom + 100}px`,
          gap: 36,
          textAlign: "center",
        }}
      >
        <motion.div style={{width: 180, height: 180, opacity: Math.min(1, mark), scale: mark}}>
          <Img
            src={LOGO}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
              filter: `drop-shadow(0 24px 70px rgba(${GREEN_RGB},.45))`,
            }}
          />
        </motion.div>

        <div style={{display: "flex", flexDirection: "column", alignItems: "center", gap: 10}}>
          <Headline
            lines={[
              [{t: "Learn the market"}],
              [{t: "before you risk"}],
              [{t: "a rupee.", g: true}],
            ]}
            size={90}
            align="center"
            delay={10}
          />
          <Rise
            p={sub}
            d={24}
            style={{
              fontSize: 28,
              lineHeight: 1.4,
              fontWeight: 500,
              color: C.soft,
              maxWidth: 800,
              marginTop: 14,
            }}
          >
            Free to download. Practice with virtual money on previous-day data.
          </Rise>
        </div>

        <Rise
          p={stats}
          d={30}
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            width: "100%",
            maxWidth: 620,
            padding: "24px 0",
            borderRadius: 30,
            background: "rgba(255,255,255,.04)",
            border: `1px solid rgba(${GREEN_RGB},.22)`,
            boxShadow: "0 20px 60px rgba(0,0,0,.35), inset 0 1px 0 rgba(255,255,255,.06)",
          }}
        >
          {STATS.map((s, i) => (
            <div
              key={s.label}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                borderLeft: i > 0 ? "1px solid rgba(255,255,255,.1)" : "none",
              }}
            >
              <div
                style={{
                  fontSize: 52,
                  fontWeight: 800,
                  lineHeight: 1,
                  letterSpacing: -1,
                  color: C.green,
                  textShadow: `0 0 28px rgba(${GREEN_RGB},.35)`,
                }}
              >
                {s.value}
              </div>
              <div style={{height: 26, display: "flex", alignItems: "center"}}>
                {s.stars ? <StarRow value={s.stars} shimmer={shimmer} /> : null}
              </div>
              <div style={{fontSize: 20, letterSpacing: 3, textTransform: "uppercase", color: "#8fa3b8", fontWeight: 600}}>
                {s.label}
              </div>
            </div>
          ))}
        </Rise>

        <motion.div
          style={{
            opacity: Math.min(1, btn),
            y: (1 - btn) * 50,
            scale: 0.96 + 0.04 * btn,
            lineHeight: 0,
          }}
        >
          <Img
            src={PLAY_BADGE}
            style={{
              height: 120,
              width: "auto",
              display: "block",
              filter: `drop-shadow(0 18px 50px rgba(${GREEN_RGB},.28))`,
            }}
          />
        </motion.div>
      </AbsoluteFill>

      <div
        style={{
          position: "absolute",
          top: SAFE_BOTTOM_Y - 40,
          left: 0,
          right: 0,
          padding: `0 ${SAFE.side + 20}px`,
          textAlign: "center",
          fontSize: 20,
          lineHeight: 1.45,
          color: "#74889b",
          opacity: Math.min(1, Math.max(0, legal)),
        }}
      >
        For education and simulation only. Uses previous-day data, not live prices. Virtual results do not
        guarantee real-world outcomes. Not financial advice.
      </div>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */
/* Composition                                                         */
/* ------------------------------------------------------------------ */
export const Reel: React.FC = () => (
  <AbsoluteFill style={{fontFamily, background: C.bg, color: C.white}}>
    <Background />
    <Brand />
    <S range={T.hook}><Hook /></S>
    <S range={T.problem}><Problem /></S>
    <S range={T.meet}><Meet /></S>
    <S range={T.data}><DataScene /></S>
    <S range={T.order}><Order /></S>
    <S range={T.tools}><Tools /></S>
    <S range={T.results}><Results /></S>
    <S range={T.cta}><Cta /></S>
  </AbsoluteFill>
);
