import React from "react";
import {
  AbsoluteFill,
  Easing,
  Freeze,
  Sequence,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {loadFont as loadSans} from "@remotion/google-fonts/InterTight";
import {loadFont as loadSerif} from "@remotion/google-fonts/InstrumentSerif";
import {loadFont as loadMono} from "@remotion/google-fonts/JetBrainsMono";
// ElevenLabs voiceover goes here later:
// import {Audio, staticFile} from "remotion";

/* ============================================================================
   OptionXi: "Built with AI. Now open source." (30 s, 1080x1920, 30 fps)
   Style: soft-UI explainer reel (off-white canvas, floating cards,
   word-by-word captions, one accent word per caption).
   To re-time after the voiceover: edit CAPS (captions) and the Part(...)
   frame numbers in <Reel/>. Everything else follows.
   ============================================================================ */

export const config = {
  durationInFrames: 900,
  fps: 30,
  width: 1080,
  height: 1920,
};

/* ---------- safe area (inlined from ../shared/safe-area) ---------- */
export const DEBUG_SAFE = false; // set true to draw the dashed safe-area box
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
      <div
        style={{
          position: "absolute",
          left: SAFE.left,
          top: SAFE.y0,
          width: SAFE.w,
          height: SAFE.h,
          border: "3px dashed rgba(255,0,120,.85)",
        }}
      />
    </AbsoluteFill>
  );
};

/* ---------- content constants ---------- */
const REPO_WEB = "optionxi-webapp-community";
const REPO_APP = "optionxi-flutter-community";
const STARS = {web: 120, app: 80}; // TODO: placeholder star counts, set the real ones
const EXIT = 8; // frames for blur-fade exits (overlaps the next entrance)

/* ---------- layout (all inside the Instagram safe area) ---------- */
const CAP_TOP = SAFE.y0; // 250
const CAP_H = 250;
const TAG_TOP = CAP_TOP + CAP_H + 30; // 530
const HERO_TOP = TAG_TOP + 100; // 630
const HERO_H = SAFE.y1 - HERO_TOP; // 950

/* ---------- design tokens ---------- */
const C = {
  bg: "#F7F5F6",
  ink: "#1C1A1F",
  rust: "#B2563B",
  blue: "#2F6A8C",
  coral: "#E8765A",
  grey: "#9A9A9E",
  green: "#2E9E6B",
  red: "#D6453D",
  soft: "#F3F0F1",
  tint: "#EEF3F6",
};
const SHADOW = "0 30px 60px rgba(28,26,31,.10), 0 8px 16px rgba(28,26,31,.06)";
const SHADOW_BIG = "0 40px 80px rgba(28,26,31,.16), 0 12px 24px rgba(28,26,31,.08)";

const sans = loadSans("normal", {
  weights: ["500", "600", "700", "800"],
  subsets: ["latin", "latin-ext"],
}).fontFamily;
const serif = loadSerif("italic", {weights: ["400"], subsets: ["latin", "latin-ext"]}).fontFamily;
const mono = loadMono("normal", {weights: ["500"], subsets: ["latin", "latin-ext"]}).fontFamily;

const clamp = {extrapolateLeft: "clamp", extrapolateRight: "clamp"} as const;

/* ---------- motion helpers ---------- */
const useEnter = (delay = 0) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  return spring({frame: f - delay, fps, config: {damping: 13, stiffness: 120, mass: 0.8}});
};

const Pop: React.FC<{
  delay?: number;
  x?: number;
  y?: number;
  style?: React.CSSProperties;
  children: React.ReactNode;
}> = ({delay = 0, x = 0, y = 44, style, children}) => {
  const p = useEnter(delay);
  return (
    <div
      style={{
        opacity: Math.min(1, p * 2.2),
        transform: `translate(${(1 - p) * x}px, ${(1 - p) * y}px) scale(${0.92 + 0.08 * p})`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

const count = (f: number, start: number, dur: number, to: number) =>
  Math.round(
    interpolate(f, [start, start + dur], [0, to], {...clamp, easing: Easing.out(Easing.cubic)})
  );

const typeText = (s: string, f: number, start: number, perChar: number) =>
  s.slice(0, Math.max(0, Math.floor((f - start) / perChar)));

/* ---------- small UI atoms ---------- */
const Card: React.FC<{style?: React.CSSProperties; children?: React.ReactNode}> = ({
  style,
  children,
}) => (
  <div
    style={{
      background: "rgba(255,255,255,.97)",
      borderRadius: 36,
      boxShadow: SHADOW,
      border: "1px solid rgba(255,255,255,.9)",
      boxSizing: "border-box",
      ...style,
    }}
  >
    {children}
  </div>
);

const Tile: React.FC<{bg: string; size?: number; children?: React.ReactNode}> = ({
  bg,
  size = 64,
  children,
}) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: size * 0.3,
      background: bg,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    }}
  >
    {children}
  </div>
);

const Mono: React.FC<{size?: number; color?: string; children: React.ReactNode}> = ({
  size = 18,
  color = C.grey,
  children,
}) => (
  <span
    style={{
      fontFamily: mono,
      fontSize: size,
      letterSpacing: ".1em",
      textTransform: "uppercase",
      color,
    }}
  >
    {children}
  </span>
);

const Pill: React.FC<{bg: string; color: string; size?: number; children: React.ReactNode}> = ({
  bg,
  color,
  size = 22,
  children,
}) => (
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
  return (
    <span
      style={{
        display: "inline-block",
        width: 3,
        height: h,
        marginLeft: 4,
        background: C.blue,
        verticalAlign: "middle",
        opacity: Math.floor(f / 8) % 2 === 0 ? 1 : 0,
      }}
    />
  );
};

const Cursor: React.FC<{from: [number, number]; to: [number, number]; start: number; end: number}> = ({
  from,
  to,
  start,
  end,
}) => {
  const f = useCurrentFrame();
  const e = {...clamp, easing: Easing.inOut(Easing.cubic)};
  const x = interpolate(f, [start, end], [from[0], to[0]], e);
  const y = interpolate(f, [start, end], [from[1], to[1]], e);
  const o = interpolate(f, [start - 6, start, end + 14, end + 22], [0, 1, 1, 0], clamp);
  return (
    <svg
      width={46}
      height={46}
      viewBox="0 0 24 24"
      style={{position: "absolute", left: x, top: y, opacity: o, zIndex: 20, filter: "drop-shadow(0 6px 8px rgba(0,0,0,.25))"}}
    >
      <path d="M3 2l0 18 5-5 4 9 3-1.5-4-9h7z" fill={C.ink} stroke="#fff" strokeWidth={1.4} strokeLinejoin="round" />
    </svg>
  );
};

const Badge: React.FC<{text: string; delay: number; rot?: number; bg?: string}> = ({
  text,
  delay,
  rot = -8,
  bg = C.coral,
}) => {
  const p = useEnter(delay);
  return (
    <div
      style={{
        display: "inline-block",
        background: bg,
        color: "#fff",
        fontFamily: sans,
        fontWeight: 800,
        fontSize: 34,
        letterSpacing: ".04em",
        padding: "14px 30px",
        borderRadius: 18,
        boxShadow: SHADOW_BIG,
        opacity: Math.min(1, p * 3),
        transform: `rotate(${rot - (1 - p) * 22}deg) scale(${0.5 + 0.5 * p})`,
      }}
    >
      {text}
    </div>
  );
};

/* ---------- canvas ---------- */
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
  const t = (f / config.durationInFrames) * Math.PI * 2; // loops cleanly
  return (
    <AbsoluteFill style={{background: C.bg}}>
      <div
        style={{
          position: "absolute",
          width: 1000,
          height: 1000,
          borderRadius: "50%",
          left: -380 + 70 * Math.sin(t),
          top: -300 + 60 * Math.cos(t),
          background: "radial-gradient(circle, #F4E7DF 0%, rgba(244,231,223,0) 65%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 1100,
          height: 1100,
          borderRadius: "50%",
          right: -450 + 60 * Math.cos(t),
          bottom: -380 + 70 * Math.sin(t),
          background: "radial-gradient(circle, #F5EFEE 0%, rgba(245,239,238,0) 65%)",
        }}
      />
      {SPARKS.map(([x, y, s, ph], i) => (
        <svg
          key={i}
          width={s}
          height={s}
          viewBox="0 0 24 24"
          style={{
            position: "absolute",
            left: x,
            top: y,
            opacity: 0.2 + 0.3 * Math.max(0, Math.sin(t * 6 + ph)),
            transform: `scale(${0.8 + 0.2 * Math.sin(t * 6 + ph)})`,
          }}
        >
          <path d="M12 0C13 8 16 11 24 12C16 13 13 16 12 24C11 16 8 13 0 12C8 11 11 8 12 0Z" fill={C.coral} />
        </svg>
      ))}
    </AbsoluteFill>
  );
};

/* ---------- captions: word-by-word, one accent word each ----------
   *word* = italic serif accent, ~word~ = blue sans accent, | = line break */
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

const CapInner: React.FC<{text: string; dur: number; step?: number; instant?: number}> = ({
  text,
  dur,
  step = 4,
  instant = 0,
}) => {
  const f = useCurrentFrame();
  const lines = parse(text);
  const maxLen = Math.max(...lines.map((l) => l.map((w) => w.t).join(" ").length));
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
        color: C.ink,
        textAlign: "center",
        opacity: out,
        filter: `blur(${(1 - out) * 12}px)`,
      }}
    >
      {lines.map((ws, li) => (
        <div key={li} style={{display: "flex", gap: size * 0.26, justifyContent: "center", whiteSpace: "nowrap"}}>
          {ws.map((w, wi) => {
            const i = n++;
            const p =
              i < instant
                ? 1
                : interpolate(f, [i * step, i * step + 9], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
            const accent: React.CSSProperties =
              w.k === "serif"
                ? {fontFamily: serif, fontStyle: "italic", fontWeight: 400, color: C.rust, fontSize: size * 1.14, letterSpacing: 0}
                : w.k === "blue"
                ? {color: C.blue}
                : {};
            return (
              <span
                key={wi}
                style={{
                  display: "inline-block",
                  opacity: p,
                  transform: `translateY(${(1 - p) * 16}px)`,
                  filter: `blur(${(1 - p) * 6}px)`,
                  ...accent,
                }}
              >
                {w.t}
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
};

type CapDef = {at: number; dur: number; text: string; step?: number; instant?: number};

// Absolute frames. Retime these after the ElevenLabs audio is in.
const CAPS: CapDef[] = [
  // Hook (0-90)
  {at: 0, dur: 48, text: "I built a full|stock app with *AI.*", instant: 3},
  {at: 48, dur: 42, text: "Then I|*open-sourced* it."},
  // Process (90-240)
  {at: 90, dur: 50, text: "Almost all of the code|was written with *AI.*", step: 3},
  {at: 140, dur: 38, text: "I *directed* it,|tested everything,"},
  {at: 178, dur: 30, text: "and *fixed*|what broke."},
  {at: 208, dur: 32, text: "It now has|10,000 ~installs.~"},
  // Proof (240-450)
  {at: 240, dur: 58, text: "The *full* web app|and the Flutter app", step: 3},
  {at: 298, dur: 44, text: "are *open* source."},
  {at: 342, dur: 46, text: "Read how it's *built,*"},
  {at: 388, dur: 62, text: "*Fork* it, ship|your own."},
  // Stack (450-630)
  {at: 450, dur: 36, text: "Built *solo.*"},
  {at: 486, dur: 46, text: "Flutter for *mobile,*"},
  {at: 532, dur: 40, text: "~Next.js~ for web,"},
  {at: 572, dur: 58, text: "*Supabase*|underneath."},
  // Why (630-780)
  {at: 630, dur: 48, text: "Learn the market|with *virtual* money,"},
  {at: 678, dur: 38, text: "before risking|a *rupee.*"},
  {at: 716, dur: 64, text: "Fork it. Break it.|Make it *better.*"},
  // CTA (780-900)
  {at: 780, dur: 50, text: "Comment ~REPO~"},
  {at: 830, dur: 50, text: "and I'll send|you the link."},
];

const CapBlock: React.FC<CapDef> = ({at, dur, ...rest}) => (
  <Sequence from={at} durationInFrames={dur + EXIT}>
    <CapInner dur={dur} {...rest} />
  </Sequence>
);

/* ---------- scene plumbing ---------- */
const Fade: React.FC<{dur: number; children: React.ReactNode}> = ({dur, children}) => {
  const f = useCurrentFrame();
  const o = interpolate(f, [dur, dur + EXIT], [1, 0], clamp);
  return <AbsoluteFill style={{opacity: o, filter: `blur(${(1 - o) * 10}px)`}}>{children}</AbsoluteFill>;
};

const Part: React.FC<{from: number; dur: number; children: React.ReactNode}> = ({from, dur, children}) => (
  <Sequence from={from} durationInFrames={dur + EXIT}>
    <Fade dur={dur}>{children}</Fade>
  </Sequence>
);

const Zone: React.FC<{children: React.ReactNode}> = ({children}) => (
  <div
    style={{
      position: "absolute",
      left: SAFE.left,
      top: HERO_TOP,
      width: SAFE.w,
      height: HERO_H,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    {children}
  </div>
);

// On-screen text from the script, shown as a pill under the caption.
const Tag: React.FC<{text: string}> = ({text}) => (
  <div
    style={{
      position: "absolute",
      left: SAFE.left,
      width: SAFE.w,
      top: TAG_TOP,
      display: "flex",
      justifyContent: "center",
    }}
  >
    <Pop delay={6} y={24}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          background: "#fff",
          boxShadow: SHADOW,
          borderRadius: 999,
          padding: "18px 36px",
          fontFamily: sans,
          fontWeight: 600,
          fontSize: 30,
          color: C.ink,
        }}
      >
        <span style={{width: 14, height: 14, borderRadius: 7, background: C.coral}} />
        {text}
      </div>
    </Pop>
  </div>
);

/* ---------- phone mockup + drawn screens (no screenshots) ---------- */
const PW = 340;
const PH = 690;

const Phone: React.FC<{scale?: number; children: React.ReactNode}> = ({scale = 1, children}) => (
  <div style={{width: PW * scale, height: PH * scale}}>
    <div
      style={{
        width: PW,
        height: PH,
        transform: `scale(${scale})`,
        transformOrigin: "top left",
        background: C.ink,
        borderRadius: 52,
        padding: 9,
        boxSizing: "border-box",
        boxShadow: SHADOW_BIG,
      }}
    >
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          background: "#F6F7F9",
          borderRadius: 43,
          overflow: "hidden",
          fontFamily: sans,
        }}
      >
        {children}
        <div
          style={{
            position: "absolute",
            top: 10,
            left: "50%",
            marginLeft: -45,
            width: 90,
            height: 24,
            borderRadius: 12,
            background: C.ink,
          }}
        />
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
        <div
          style={{
            background: "#fff",
            borderRadius: 18,
            padding: "12px 14px",
            marginBottom: 10,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
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
    <div
      style={{
        background: "#fff",
        borderRadius: 18,
        padding: "13px 14px",
        marginBottom: 10,
        opacity: Math.min(1, p * 2),
        transform: `translateY(${(1 - p) * 20}px)`,
      }}
    >
      <div style={{display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8}}>
        <div style={{fontSize: 15, fontWeight: 700, color: C.ink}}>{sym}</div>
        <Pill bg={bull ? "#E4F4EC" : "#FBE9E7"} color={bull ? C.green : C.red} size={11}>
          {bull ? "Bullish" : "Bearish"}
        </Pill>
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
    <div
      style={{
        position: "absolute",
        top: 44,
        left: 12,
        right: 12,
        zIndex: 5,
        background: "#fff",
        borderRadius: 22,
        boxShadow: SHADOW_BIG,
        padding: "12px 14px",
        display: "flex",
        alignItems: "center",
        gap: 12,
        transform: `translateY(${(1 - p) * -140}px)`,
        opacity: Math.min(1, p * 3),
      }}
    >
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
const RepoCard: React.FC<{
  name: string;
  lang: string;
  langColor: string;
  w: number;
  fs: number;
  tile?: number;
  stars?: number;
  delay?: number;
}> = ({name, lang, langColor, w, fs, tile = 60, stars, delay = 0}) => (
  <Pop delay={delay}>
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
  </Pop>
);

const StarsCard: React.FC<{delay?: number}> = ({delay = 0}) => {
  const f = useCurrentFrame();
  const p = interpolate(f, [0, 80], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
  return (
    <Pop delay={delay}>
      <Card style={{width: 560, padding: 28}}>
        <div style={{display: "flex", alignItems: "center", justifyContent: "space-between"}}>
          <Mono>GitHub stars</Mono>
          <StarIcon s={34} c={C.coral} />
        </div>
        <div style={{fontWeight: 800, fontSize: 96, color: C.ink, letterSpacing: "-0.03em", lineHeight: 1.05}}>
          {Math.round(p * STARS.web)}
        </div>
        <svg width={504} height={90} viewBox="0 0 504 90" style={{marginTop: 6}}>
          <path
            d="M0 82 C80 80 140 72 200 56 S330 40 400 22 S480 8 504 4"
            fill="none"
            stroke={C.blue}
            strokeWidth={6}
            strokeLinecap="round"
            pathLength={1}
            strokeDasharray={1}
            strokeDashoffset={1 - p}
          />
        </svg>
      </Card>
    </Pop>
  );
};

/* ============================ SCENE HEROES ============================ */

// 1. HOOK: repo card + stars ticking, phone slides in beside it
const Hero1: React.FC = () => (
  <Zone>
    <div style={{display: "flex", alignItems: "center", gap: 28}}>
      <div style={{display: "flex", flexDirection: "column", gap: 26}}>
        <RepoCard name={REPO_WEB} lang="TypeScript" langColor={C.blue} w={560} fs={29} delay={-40} />
        <StarsCard delay={-40} />
      </div>
      <Pop delay={12} x={140} y={0}>
        <Phone scale={0.85}>
          <StocksScreen d={26} />
        </Phone>
      </Pop>
    </div>
  </Zone>
);

// 2. PROCESS: a prompt becomes a working screen (no bug scene)
const PromptCard: React.FC = () => {
  const f = useCurrentFrame();
  const shown = typeText("Build a virtual trading screen for NSE stocks", f, 6, 0.9);
  const press = interpolate(f, [52, 55, 60], [1, 0.94, 1], clamp);
  const built = f >= 55;
  return (
    <Pop delay={0}>
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
        <div
          style={{
            position: "absolute",
            right: 32,
            bottom: 28,
            width: 190,
            height: 64,
            borderRadius: 20,
            background: built ? C.ink : C.blue,
            color: "#fff",
            fontWeight: 700,
            fontSize: 28,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transform: `scale(${press})`,
          }}
        >
          {built ? "Built" : "Build"}
        </div>
        <Cursor from={[860, 330]} to={[775, 185]} start={34} end={52} />
      </Card>
    </Pop>
  );
};

const Chip: React.FC<{label: string; delay: number}> = ({label, delay}) => (
  <Pop delay={delay} x={40} y={0}>
    <Card style={{width: 380, padding: "20px 26px", display: "flex", alignItems: "center", gap: 18, borderRadius: 30}}>
      <Tile bg={C.blue} size={56}>
        <CheckIcon />
      </Tile>
      <div style={{fontWeight: 700, fontSize: 38, color: C.ink}}>{label}</div>
    </Card>
  </Pop>
);

const InstallsCard: React.FC<{delay: number}> = ({delay}) => {
  const f = useCurrentFrame();
  const n = count(f, delay + 4, 26, 10000);
  return (
    <Pop delay={delay}>
      <Card style={{width: 380, padding: 30}}>
        <Mono>Google Play</Mono>
        <div style={{fontWeight: 800, fontSize: 74, color: C.ink, letterSpacing: "-0.03em", margin: "6px 0 0"}}>
          {n.toLocaleString("en-US")}+
        </div>
        <div style={{fontWeight: 600, fontSize: 30, color: C.grey}}>installs</div>
      </Card>
    </Pop>
  );
};

const Hero2: React.FC = () => {
  const f = useCurrentFrame();
  const chipsOut = interpolate(f, [112, 120], [1, 0], clamp);
  return (
    <Zone>
      <div style={{display: "flex", flexDirection: "column", alignItems: "center", gap: 34}}>
        <PromptCard />
        <div style={{display: "flex", alignItems: "center", gap: 44}}>
          <Pop delay={58} y={60}>
            <Phone scale={0.78}>
              <StocksScreen d={66} />
            </Phone>
          </Pop>
          <div style={{position: "relative", width: 380, height: PH * 0.78}}>
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                gap: 22,
                opacity: chipsOut,
              }}
            >
              <Chip label="Directed" delay={52} />
              <Chip label="Tested" delay={64} />
              <Chip label="Fixed" delay={92} />
            </div>
            <div style={{position: "absolute", inset: 0, display: "flex", alignItems: "center"}}>
              <InstallsCard delay={118} />
            </div>
          </div>
        </div>
      </div>
    </Zone>
  );
};

// 3a. PROOF: two repos, both open
const Hero3A: React.FC = () => (
  <Zone>
    <div style={{position: "relative", display: "flex", flexDirection: "column", gap: 34}}>
      <RepoCard name={REPO_WEB} lang="TypeScript" langColor={C.blue} w={880} fs={42} tile={84} stars={STARS.web} delay={4} />
      <RepoCard name={REPO_APP} lang="Dart" langColor={C.coral} w={880} fs={42} tile={84} stars={STARS.app} delay={22} />
      <div style={{position: "absolute", top: -34, right: -14, zIndex: 5}}>
        <Badge text="Open source" delay={44} rot={8} />
      </div>
    </div>
  </Zone>
);

const Callout: React.FC<{title: string; sub: string; delay: number; bg: string}> = ({title, sub, delay, bg}) => (
  <Pop delay={delay} y={30}>
    <Card style={{width: 270, padding: "22px 24px", borderRadius: 30}}>
      <Tile bg={bg} size={52} />
      <div style={{fontWeight: 800, fontSize: 32, color: C.ink, marginTop: 14}}>{title}</div>
      <div style={{fontWeight: 500, fontSize: 22, color: C.grey}}>{sub}</div>
    </Card>
  </Pop>
);

// 3b. PROOF: scanner + alert notification running in the app
const Hero3B: React.FC = () => (
  <Zone>
    <div style={{position: "relative"}}>
      <Pop y={60}>
        <Phone>
          <ScannerScreen d={12} />
          <AlertBanner delay={60} />
        </Phone>
      </Pop>
      <div style={{position: "absolute", left: -300, top: 190}}>
        <Callout title="Scanner" sub="Volume Jump" delay={14} bg={C.blue} />
      </div>
      <div style={{position: "absolute", right: -300, top: 70}}>
        <Callout title="Alert" sub="Sent to phone" delay={62} bg={C.coral} />
      </div>
    </div>
  </Zone>
);

// 4. STACK: three layers, one by one
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
      <div style={{width: 230, height: 140, borderRadius: 16, border: `2px solid #E3DFE1`, overflow: "hidden", background: "#fff"}}>
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
        <div
          key={r}
          style={{
            height: 36,
            borderRadius: 10,
            background: C.soft,
            marginBottom: 10,
            display: "flex",
            gap: 8,
            padding: 9,
            boxSizing: "border-box",
            opacity: Math.min(1, p * 3 - r * 0.4),
          }}
        >
          {[0.3, 0.45, 0.25].map((w, i) => (
            <div key={i} style={{width: `${w * 100}%`, borderRadius: 5, background: "#DAD5D8"}} />
          ))}
        </div>
      ))}
    </div>
  );
};

const StackCard: React.FC<{
  kind: "mobile" | "web" | "db";
  name: string;
  sub: string;
  bg: string;
  delay: number;
}> = ({kind, name, sub, bg, delay}) => (
  <Pop delay={delay}>
    <Card style={{width: 880, height: 214, padding: "0 40px", display: "flex", alignItems: "center", gap: 30}}>
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
  </Pop>
);

const Hero4: React.FC = () => (
  <Zone>
    <div style={{display: "flex", flexDirection: "column", alignItems: "center", gap: 26}}>
      <div style={{height: 90, display: "flex", alignItems: "center"}}>
        <Badge text="1 developer" delay={4} rot={-6} />
      </div>
      <StackCard kind="mobile" name="Flutter" sub="Mobile app" bg={C.blue} delay={36} />
      <StackCard kind="web" name="Next.js" sub="Web app" bg={C.ink} delay={82} />
      <StackCard kind="db" name="Supabase" sub="Database" bg={C.coral} delay={122} />
    </div>
  </Zone>
);

// 5a. WHY: virtual trade placed
const Hero5A: React.FC = () => {
  const f = useCurrentFrame();
  const press = interpolate(f, [44, 47, 52], [1, 0.95, 1], clamp);
  const placed = f >= 47;
  const draw = interpolate(f, [6, 40], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
  return (
    <Zone>
      <div style={{display: "flex", flexDirection: "column", gap: 28, alignItems: "center"}}>
        <Pop>
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
              <path
                d="M0 140 C60 130 100 150 160 120 S260 90 320 100 S430 60 500 70 S620 30 700 40 S780 20 808 14"
                fill="none"
                stroke={C.ink}
                strokeWidth={5}
                strokeLinecap="round"
                pathLength={1}
                strokeDasharray={1}
                strokeDashoffset={1 - draw}
              />
            </svg>
            <div style={{height: 56, marginTop: 24, display: "flex", alignItems: "center", justifyContent: "space-between"}}>
              <Mono size={20}>Quantity</Mono>
              <div style={{background: C.soft, borderRadius: 18, padding: "10px 36px", fontWeight: 800, fontSize: 32, color: C.ink}}>10</div>
            </div>
            <div
              style={{
                height: 84,
                marginTop: 24,
                borderRadius: 26,
                background: placed ? C.ink : C.blue,
                color: "#fff",
                fontWeight: 700,
                fontSize: 36,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transform: `scale(${press})`,
              }}
            >
              {placed ? "Order placed" : "Buy · virtual"}
            </div>
            <Cursor from={[760, 560]} to={[450, 455]} start={24} end={42} />
          </Card>
        </Pop>
        <Pop delay={48} y={40}>
          <Card style={{padding: "22px 36px", borderRadius: 30, display: "flex", alignItems: "center", gap: 18}}>
            <Tile bg={C.blue} size={52}>
              <CheckIcon s={28} />
            </Tile>
            <div style={{fontWeight: 700, fontSize: 32, color: C.ink}}>Virtual order placed</div>
            <Mono size={16}>no real money</Mono>
          </Card>
        </Pop>
      </div>
    </Zone>
  );
};

// 5b. WHY: leaderboard rank updates
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
  const t = spring({frame: f - 26, fps, config: {damping: 15, stiffness: 90, mass: 0.9}});
  return (
    <Zone>
      <Pop>
        <Card style={{width: 880, padding: 32}}>
          <div style={{height: 84, display: "flex", alignItems: "center", justifyContent: "space-between"}}>
            <div>
              <div style={{fontWeight: 800, fontSize: 44, color: C.ink}}>Leaderboard</div>
              <Mono size={16}>Virtual trading · this week</Mono>
            </div>
            <Pop delay={48} y={20}>
              <Pill bg="#E4F4EC" color={C.green} size={26}>
                <UpIcon s={22} /> 3 places
              </Pill>
            </Pop>
          </div>
          <div style={{position: "relative", height: ROW_H * 6}}>
            {LB.map((r) => {
              const y = interpolate(t, [0, 1], [r.s0 * ROW_H, r.s1 * ROW_H]);
              const you = r.n === "You";
              const rank = Math.round(y / ROW_H) + 5;
              const val = you ? 3.4 + (r.v - 3.4) * Math.min(1, Math.max(0, t)) : r.v;
              return (
                <div
                  key={r.n}
                  style={{
                    position: "absolute",
                    top: y,
                    left: 0,
                    right: 0,
                    height: 94,
                    borderRadius: 26,
                    background: you ? C.tint : "#fff",
                    border: you ? `2px solid ${C.blue}` : "2px solid transparent",
                    boxSizing: "border-box",
                    display: "flex",
                    alignItems: "center",
                    gap: 20,
                    padding: "0 26px",
                    zIndex: you ? 3 : 1,
                  }}
                >
                  <div style={{fontFamily: mono, fontSize: 28, color: C.grey, width: 64}}>#{rank}</div>
                  <div style={{width: 54, height: 54, borderRadius: 27, background: r.c}} />
                  <div style={{flex: 1, fontWeight: 700, fontSize: 36, color: C.ink}}>{r.n}</div>
                  <div style={{fontWeight: 800, fontSize: 34, color: C.green}}>+{val.toFixed(1)}%</div>
                </div>
              );
            })}
          </div>
        </Card>
      </Pop>
    </Zone>
  );
};

// 6a. CTA: comment REPO
const Hero6A: React.FC = () => {
  const f = useCurrentFrame();
  const typed = typeText("REPO", f, 4, 3);
  const press = interpolate(f, [24, 27, 31], [1, 0.9, 1], clamp);
  const posted = f >= 27;
  return (
    <Zone>
      <Pop>
        <Card style={{width: 880, padding: 36}}>
          <Mono size={18}>Comments</Mono>
          <div style={{display: "flex", alignItems: "center", gap: 20, marginTop: 20}}>
            <div style={{width: 64, height: 64, borderRadius: 32, background: "#E5E1E3"}} />
            <div
              style={{
                flex: 1,
                height: 76,
                borderRadius: 38,
                background: C.soft,
                padding: "0 30px",
                display: "flex",
                alignItems: "center",
                fontWeight: 700,
                fontSize: 36,
                color: C.ink,
              }}
            >
              {posted ? "" : typed}
              {!posted && <Caret />}
              {!posted && typed === "" && <span style={{color: C.grey, fontWeight: 500}}>Add a comment…</span>}
            </div>
            <div
              style={{
                fontWeight: 800,
                fontSize: 34,
                color: C.blue,
                opacity: typed.length === 4 ? 1 : 0.35,
                transform: `scale(${press})`,
              }}
            >
              Post
            </div>
          </div>
          <Pop delay={28} y={24}>
            <div style={{display: "flex", alignItems: "center", gap: 20, marginTop: 34}}>
              <div style={{width: 64, height: 64, borderRadius: 32, background: "#E5E1E3"}} />
              <div>
                <Mono size={16}>you</Mono>
                <div style={{fontWeight: 800, fontSize: 38, color: C.ink}}>REPO</div>
              </div>
            </div>
          </Pop>
          <Pop delay={36} y={24}>
            <div style={{display: "flex", alignItems: "center", gap: 20, marginTop: 24, marginLeft: 60}}>
              <Tile bg={C.ink} size={56}>
                <span style={{fontFamily: mono, color: "#fff", fontSize: 22}}>{"</>"}</span>
              </Tile>
              <div style={{fontWeight: 600, fontSize: 32, color: C.ink}}>Link sent</div>
              <CheckIcon s={30} c={C.green} />
            </div>
          </Pop>
        </Card>
      </Pop>
    </Zone>
  );
};

// 6b. CTA: repo names large, then Play Store proof
const Hero6B: React.FC = () => (
  <Zone>
    <div style={{display: "flex", flexDirection: "column", gap: 30, alignItems: "center"}}>
      <Pop>
        <Card style={{width: 880, padding: "44px 44px"}}>
          <Mono size={18}>Open source · GitHub</Mono>
          {[REPO_WEB, REPO_APP].map((r, i) => (
            <div key={r} style={{marginTop: i === 0 ? 22 : 30}}>
              <div style={{fontFamily: mono, fontSize: 24, color: C.grey}}>optionxi /</div>
              <div style={{fontWeight: 800, fontSize: 50, color: C.ink, letterSpacing: "-0.02em"}}>{r}</div>
            </div>
          ))}
        </Card>
      </Pop>
      <Pop delay={18}>
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
      </Pop>
    </div>
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
        <CapInner text={CAPS[0].text} dur={CAPS[0].dur} instant={CAPS[0].instant} />
      </Freeze>
    </AbsoluteFill>
  );
};

/* ================================ REEL ================================ */
const TAGS: {from: number; dur: number; text: string}[] = [
  {from: 0, dur: 90, text: HOOK_TAG},
  {from: 90, dur: 150, text: "Not a 10-person team. Just AI."},
  {from: 240, dur: 210, text: "Web app + Flutter app: open source"},
  {from: 450, dur: 180, text: "Flutter · Next.js · Supabase"},
  {from: 630, dur: 150, text: "Learn the market before you risk a rupee"},
  {from: 780, dur: 120, text: "Comment “REPO” for the link"},
];

export const Reel: React.FC = () => (
  <AbsoluteFill style={{fontFamily: sans}}>
    <Canvas />
    {/* <Audio src={staticFile("optionxi-open-source-vo.mp3")} /> */}

    {TAGS.map((t) => (
      <Part key={t.from} from={t.from} dur={t.dur}>
        <Tag text={t.text} />
      </Part>
    ))}

    <Part from={0} dur={90}><Hero1 /></Part>
    <Part from={90} dur={150}><Hero2 /></Part>
    <Part from={240} dur={94}><Hero3A /></Part>
    <Part from={334} dur={116}><Hero3B /></Part>
    <Part from={450} dur={180}><Hero4 /></Part>
    <Part from={630} dur={82}><Hero5A /></Part>
    <Part from={712} dur={68}><Hero5B /></Part>
    <Part from={780} dur={52}><Hero6A /></Part>
    <Part from={832} dur={68}><Hero6B /></Part>

    {CAPS.map((c) => (
      <CapBlock key={c.at} {...c} />
    ))}

    <Sequence from={880} durationInFrames={20}>
      <LoopIn />
    </Sequence>

    <SafeGuide />
  </AbsoluteFill>
);

export default Reel;