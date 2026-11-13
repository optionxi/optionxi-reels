/**
 * OptionXi — "Volume Jumps" · Hook-first Instagram Reel (v2, from scratch)
 * 1080×1920 · 30 fps · 810 frames (27 s)
 *
 * ALGORITHM-DRIVEN STRUCTURE
 *  0–2.5 s   HOOK        dark pattern-interrupt, OPEN LOOP: volume explodes, price stays flat, "6.2×" teased
 *  2.5–5 s   ANSWER      "It's called a volume jump." (resolves the hook fast = keeps them watching)
 *  5–8 s     WHY         crowd rushes in first, price moves LAST (the value of the feature)
 *  8–11 s    DIRECTION   buyers rushing in vs sellers rushing out
 *  11–14 s   IN THE APP  live Volume Jumps card, refreshes every minute
 *  14–17 s   ALERTS      pick 8× / 15× / 30× → instant notification  (the "wow" feature)
 *  17–22 s   HISTORY     replay any past day, strict/relaxed sensitivity
 *  22–25 s   CTA         "Find it in the OptionXi app" + Play Store badge + link in bio
 *  25–27 s   LOOP        "Every big move starts with volume."  → cuts straight back into the hook
 *
 * A new visual/caption every ~2–3 s (retention), word-by-word captions (works muted),
 * everything inside the safe area (top 8–22% captions, bottom 20% empty for IG UI).
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
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

export const config = {durationInFrames: 810, fps: 30, width: 1080, height: 1920};

/* ---------------------------- tokens ---------------------------- */
const C = {
  bg: "#F7F5F6",
  ink: "#14121A",
  rust: "#B2563B",
  blue: "#2F6A8C",
  coral: "#FF6B4A",
  green: "#12B76A",
  red: "#E5484D",
  mute: "#9A9A9E",
  line: "#ECE8EA",
  white: "#FFFFFF",
};
const SANS = '"Plus Jakarta Sans", "Noto Sans", system-ui, sans-serif';
const SERIF = '"Instrument Serif", Georgia, serif';
const MONO = '"JetBrains Mono", Menlo, monospace';
const LOGO = "https://optionxi.com/assets/images/logo_xi.png";
const BADGE = "https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png";
const W = 880;

/* ---------------------------- helpers ---------------------------- */
const clampX = {extrapolateLeft: "clamp", extrapolateRight: "clamp"} as const;
const OUT = Easing.bezier(0.16, 1, 0.3, 1);
const INOUT = Easing.bezier(0.7, 0, 0.2, 1);
const p = (f: number, a: number, b: number, e: (t: number) => number = OUT) =>
  interpolate(f, [a, b], [0, 1], {...clampX, easing: e});
const SOFT = {damping: 18, stiffness: 120, mass: 0.9};
const BOUNCY = {damping: 10, stiffness: 140, mass: 0.8};
const hash = (i: number) => {
  const s = Math.sin(i * 12.9898) * 43758.5453;
  return s - Math.floor(s);
};
const fmtIN = (n: number, d = 0) => n.toLocaleString("en-IN", {minimumFractionDigits: d, maximumFractionDigits: d});
const card: React.CSSProperties = {
  background: C.white,
  borderRadius: 40,
  border: "1.5px solid rgba(255,255,255,.9)",
  boxShadow: "0 40px 70px rgba(20,18,26,.10), 0 8px 16px rgba(20,18,26,.06)",
};

/* ---------------------------- fonts ---------------------------- */
const FONT_CSS =
  "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700;800&family=Instrument+Serif:ital@1&family=JetBrains+Mono:wght@500;700&display=block";
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
    link.onload = () =>
      Promise.all([
        document.fonts.load('800 80px "Plus Jakarta Sans"'),
        document.fonts.load('italic 80px "Instrument Serif"'),
        document.fonts.load('700 20px "JetBrains Mono"'),
      ])
        .then(done)
        .catch(done);
    link.onerror = done;
    document.head.appendChild(link);
    return () => link.remove();
  }, [handle]);
};

/* ---------------------------- canvas ---------------------------- */
const Canvas: React.FC = () => {
  const f = useCurrentFrame();
  const a = Math.sin(f / 90) * 60;
  const b = Math.cos(f / 110) * 60;
  return (
    <AbsoluteFill
      style={{
        background: C.bg,
        backgroundImage: `radial-gradient(closest-side at ${200 + a}px ${260 + b}px, #F4E7DF 0%, rgba(244,231,223,0) 100%),
          radial-gradient(closest-side at ${900 - b}px ${1500 + a}px, #F5EFEE 0%, rgba(245,239,238,0) 100%)`,
      }}
    />
  );
};

/* ---------------------------- captions ---------------------------- */
type Kind = "serif" | "blue" | "pill";
type Cap = {at: number; end: number; lines: string[]; acc: [number, Kind]};
const CAPS: Cap[] = [
  {at: 0, end: 58, lines: ["Every big move", "starts with this."], acc: [5, "serif"]},
  {at: 76, end: 152, lines: ["It's called a", "volume jump."], acc: [4, "serif"]},
  {at: 152, end: 240, lines: ["A sudden rush of", "people trading."], acc: [4, "serif"]},
  {at: 240, end: 330, lines: ["Buyers or sellers?", "The app shows you."], acc: [0, "blue"]},
  {at: 330, end: 420, lines: ["See them live", "on your home screen."], acc: [2, "serif"]},
  {at: 420, end: 520, lines: ["Set an alert.", "Get pinged instantly."], acc: [2, "pill"]},
  {at: 520, end: 600, lines: ["Or replay any", "past day."], acc: [1, "serif"]},
  {at: 600, end: 670, lines: ["Strict or relaxed?", "Your call."], acc: [4, "serif"]},
  {at: 670, end: 750, lines: ["Find it in the", "OptionXi app."], acc: [4, "pill"]},
  {at: 750, end: 810, lines: ["Every big move", "starts with volume."], acc: [5, "serif"]},
];

const Captions: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <>
      {CAPS.map((c, ci) => {
        if (f < c.at - 1 || f > c.end + 14) return null;
        const last = ci === CAPS.length - 1;
        const out = last ? 0 : p(f, c.end, c.end + 12, INOUT);
        const dark = ci === 0;
        let k = 0;
        return (
          <div
            key={ci}
            style={{
              position: "absolute",
              top: 150,
              left: 0,
              width: 1080,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              fontFamily: SANS,
              fontWeight: 800,
              fontSize: dark ? 108 : 98,
              lineHeight: 1.1,
              letterSpacing: -2,
              color: dark ? C.white : C.ink,
              opacity: 1 - out,
              filter: `blur(${out * 8}px)`,
            }}
          >
            {c.lines.map((line, li) => (
              <div key={li} style={{display: "flex", gap: 24, whiteSpace: "nowrap"}}>
                {line.split(" ").map((w, wi) => {
                  const idx = k++;
                  const t = p(f, c.at + idx * 5, c.at + idx * 5 + 9);
                  const isAcc = idx === c.acc[0];
                  const st: React.CSSProperties = {
                    display: "inline-block",
                    opacity: t,
                    transform: `translateY(${(1 - t) * 18}px)`,
                    filter: `blur(${(1 - t) * 6}px)`,
                  };
                  if (isAcc && c.acc[1] === "serif")
                    Object.assign(st, {fontFamily: SERIF, fontStyle: "italic", fontWeight: 400, color: dark ? C.coral : C.rust, fontSize: 118});
                  if (isAcc && c.acc[1] === "blue") Object.assign(st, {color: C.blue});
                  if (isAcc && c.acc[1] === "pill")
                    Object.assign(st, {color: C.blue, background: "rgba(47,106,140,.12)", borderRadius: 26, padding: "0 22px"});
                  return (
                    <span key={wi} style={st}>
                      {w}
                    </span>
                  );
                })}
              </div>
            ))}
          </div>
        );
      })}
    </>
  );
};

/* ---------------------------- hero shell ---------------------------- */
const Hero: React.FC<{from: number; dur: number; top?: number; keep?: boolean; children: React.ReactNode}> = ({
  from,
  dur,
  top = 480,
  keep,
  children,
}) => (
  <Sequence from={from} durationInFrames={dur + (keep ? 0 : 12)}>
    <Shell dur={dur} top={top} keep={keep}>
      {children}
    </Shell>
  </Sequence>
);
const Shell: React.FC<{dur: number; top: number; keep?: boolean; children: React.ReactNode}> = ({dur, top, keep, children}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const inP = spring({frame: f, fps, config: SOFT});
  const out = keep ? 0 : p(f, dur, dur + 12, INOUT);
  return (
    <div
      style={{
        position: "absolute",
        left: (1080 - W) / 2,
        top,
        width: W,
        opacity: Math.min(1, inP * 2) * (1 - out),
        transform: `translateY(${(1 - inP) * 50}px) scale(${(0.92 + 0.08 * inP) * (1 - 0.04 * out)})`,
        filter: `blur(${out * 10}px)`,
      }}
    >
      {children}
    </div>
  );
};

const Label: React.FC<{t: string; style?: React.CSSProperties}> = ({t, style}) => (
  <div style={{fontFamily: MONO, fontSize: 20, letterSpacing: 3, color: C.mute, fontWeight: 700, ...style}}>{t}</div>
);

const SpikeTile: React.FC<{size: number}> = ({size}) => {
  const f = useCurrentFrame();
  const up = p((f % 90) / 90, 0.15, 0.45, Easing.out(Easing.back(2)));
  const bars = [0.35, 0.5, 0.4, 0.45, 0.38];
  return (
    <div style={{width: size, height: size, borderRadius: size * 0.28, background: "rgba(47,106,140,.12)", padding: size * 0.18, boxSizing: "border-box", display: "flex", alignItems: "flex-end", gap: size * 0.03}}>
      {bars.map((b, i) => (
        <div key={i} style={{flex: 1, height: `${(i === 2 ? b + (1 - b) * up : b) * 100}%`, borderRadius: size * 0.04, background: i === 2 && up > 0.5 ? C.coral : "rgba(47,106,140,.5)"}} />
      ))}
    </div>
  );
};

const Cursor: React.FC<{x: number; y: number; opacity: number; tapAt?: number}> = ({x, y, opacity, tapAt}) => {
  const f = useCurrentFrame();
  const d = tapAt === undefined ? -1 : f - tapAt;
  return (
    <>
      {d >= 0 && d < 16 && (
        <div style={{position: "absolute", left: x - (30 + d * 4), top: y - (30 + d * 4), width: 60 + d * 8, height: 60 + d * 8, borderRadius: "50%", border: `3px solid ${C.coral}`, opacity: (1 - d / 16) * 0.8, zIndex: 9}} />
      )}
      <div style={{position: "absolute", left: x - 28, top: y - 28, width: 56, height: 56, borderRadius: "50%", background: "rgba(20,18,26,.28)", border: "3px solid rgba(255,255,255,.95)", boxSizing: "border-box", opacity, transform: `scale(${d >= 0 && d < 8 ? 0.8 : 1})`, zIndex: 10}} />
    </>
  );
};

/* ---------------------------- rows (mirror the app's cards) ---------------------------- */
type Row = {t: string; r: number; up: boolean; sub: string; price: number; pct: number};
const fmtPct = (n: number) => `${n >= 0 ? "+" : ""}${n.toFixed(1)}%`;
const RowView: React.FC<{d: Row; top: number; h?: number; opacity?: number; tint?: number}> = ({d, top, h = 140, opacity = 1, tint = 0}) => {
  const col = d.up ? C.green : C.red;
  return (
    <div style={{position: "absolute", left: 0, right: 0, top, height: h, padding: "0 34px", boxSizing: "border-box", display: "flex", alignItems: "center", gap: 24, opacity, background: `rgba(18,183,106,${0.14 * tint})`, fontFamily: SANS}}>
      <div style={{width: 82, height: 82, borderRadius: 24, background: `${col}22`, color: col, fontWeight: 800, fontSize: 42, display: "flex", alignItems: "center", justifyContent: "center"}}>{d.t[0]}</div>
      <div style={{flex: 1}}>
        <div style={{display: "flex", alignItems: "center", gap: 14}}>
          <span style={{fontWeight: 800, fontSize: 38, color: C.ink}}>{d.t}</span>
          <span style={{fontWeight: 800, fontSize: 27, color: col, background: `${col}22`, borderRadius: 12, padding: "3px 12px"}}>
            {d.up ? "↑" : "↓"} {d.r.toFixed(1)}×
          </span>
        </div>
        <div style={{fontFamily: MONO, fontSize: 22, color: C.mute, marginTop: 6}}>{d.sub}</div>
      </div>
      <div style={{textAlign: "right"}}>
        <div style={{fontWeight: 800, fontSize: 36, color: C.ink}}>₹{fmtIN(d.price, 2)}</div>
        <div style={{fontWeight: 800, fontSize: 30, color: col}}>{fmtPct(d.pct)}</div>
      </div>
    </div>
  );
};

/* ============ HOOK (0–80): dark pattern interrupt, open loop ============ */
const HOOK_BARS = [0.22, 0.3, 0.25, 0.33, 0.27, 0.3, 0.24, 0.3, 0.26, 0.31, 0.25];
const Hook: React.FC = () => {
  const f = useCurrentFrame();
  if (f > 82) return null;
  const r = (1 - p(f, 56, 80, INOUT)) * 2400;
  const spike = p(f, 24, 46, Easing.out(Easing.back(1.5)));
  const sc = Math.max(0, Math.min(1, spike));
  const reveal = p(f, 44, 52);
  const base = 1480;
  const maxH = 760;
  const pulse = 1 + 0.06 * Math.sin(f / 2.5);
  return (
    <AbsoluteFill style={{background: C.ink, clipPath: `circle(${r}px at 540px 1050px)`}}>
      <AbsoluteFill style={{backgroundImage: "radial-gradient(closest-side at 50% 62%, rgba(255,107,74,.28), rgba(255,107,74,0))"}} />
      {/* price stays flat */}
      <div style={{position: "absolute", left: 100, right: 100, top: 760, height: 3, background: "rgba(255,255,255,.35)", opacity: p(f, 4, 14)}} />
      <div style={{position: "absolute", left: 100, top: 700, fontFamily: MONO, fontWeight: 700, fontSize: 26, letterSpacing: 3, color: "rgba(255,255,255,.55)", opacity: p(f, 6, 16)}}>
        PRICE · STILL FLAT
      </div>
      {/* volume bars */}
      {HOOK_BARS.map((b, i) => {
        const isS = i === 7;
        const rise = p(f, 2 + i * 1.5, 18 + i * 1.5);
        const h = (isS ? b + (1 - b) * sc : b) * maxH * rise;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: 119 + i * 78,
              width: 62,
              height: h,
              top: base - h,
              borderRadius: 14,
              background: isS ? C.coral : "rgba(255,255,255,.22)",
              boxShadow: isS ? `0 0 ${60 * sc}px ${C.coral}` : "none",
            }}
          />
        );
      })}
      <div style={{position: "absolute", left: 119 + 7 * 78 - 90, width: 242, top: base - maxH - 150, textAlign: "center", fontFamily: SANS, fontWeight: 800, color: reveal < 0.5 ? C.white : C.coral, fontSize: reveal < 0.5 ? 150 : 130, letterSpacing: -4, opacity: p(f, 30, 38), transform: `scale(${(reveal < 0.5 ? 1 : 1 + 0.1 * (1 - reveal)) * pulse})`}}>
        {reveal < 0.5 ? "?" : "6.2×"}
      </div>
      <div style={{position: "absolute", left: 100, top: base + 30, fontFamily: MONO, fontWeight: 700, fontSize: 26, letterSpacing: 3, color: "rgba(255,255,255,.55)"}}>VOLUME</div>
    </AbsoluteFill>
  );
};

/* ============ HERO · Bars (76–152): the answer ============ */
const BARS = [0.34, 0.42, 0.36, 0.46, 0.4, 0.38, 0.44, 0.35, 0.41, 0.37, 0.43, 0.39];
const CH = 440;
const Bars: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const spike = p(f, 20, 46, Easing.out(Easing.back(1.4)));
  const sc = Math.max(0, Math.min(1, spike));
  const stamp = spring({frame: f - 44, fps, config: BOUNCY});
  return (
    <div style={{...card, padding: "36px 40px 32px", fontFamily: SANS, position: "relative"}}>
      <div style={{display: "flex", justifyContent: "space-between", alignItems: "baseline"}}>
        <span style={{fontWeight: 800, fontSize: 42}}>RELIANCE</span>
        <Label t="TODAY · 5-MIN BARS" />
      </div>
      <div style={{position: "relative", height: CH + 100, marginTop: 10}}>
        <div style={{position: "absolute", left: 0, right: 0, bottom: CH * 0.52, borderTop: `3px dashed ${C.mute}88`}} />
        <Label t="NORMAL" style={{position: "absolute", left: 0, bottom: CH * 0.52 + 12}} />
        <div style={{position: "absolute", left: 0, right: 0, bottom: 0, height: CH, display: "flex", alignItems: "flex-end", gap: 12}}>
          {BARS.map((b, i) => {
            const rise = p(f, i * 1.5, 16 + i * 1.5);
            const isS = i === 8;
            const h = (isS ? b + (0.95 - b) * sc : b) * rise;
            return (
              <div key={i} style={{flex: 1, position: "relative", height: "100%"}}>
                <div style={{position: "absolute", bottom: 0, left: 0, right: 0, height: h * CH, borderRadius: 12, background: isS && sc > 0.3 ? C.coral : "#CFD6DD"}} />
                {isS && (
                  <div style={{position: "absolute", bottom: h * CH + 12, left: "50%", transform: "translateX(-50%)", fontWeight: 800, fontSize: 64, letterSpacing: -2, color: C.coral, opacity: sc, whiteSpace: "nowrap"}}>
                    {(1 + 5.2 * sc).toFixed(1)}×
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <div style={{position: "absolute", left: 4, top: 10, padding: "12px 26px", borderRadius: 16, background: C.coral, color: C.white, fontWeight: 800, fontSize: 34, letterSpacing: 1, opacity: Math.min(1, stamp * 2), transform: `rotate(-9deg) scale(${stamp})`, boxShadow: "0 18px 30px rgba(255,107,74,.4)"}}>
          VOLUME JUMP
        </div>
      </div>
    </div>
  );
};

/* ============ HERO · Crowd first, price last (152–240) ============ */
const FLAT = Array.from({length: 29}, (_, i) => `${i === 0 ? "M" : "L"}${(i / 28) * 540} ${110 + Math.sin(i * 1.7) * 6}`).join(" ");
const Crowd: React.FC = () => {
  const f = useCurrentFrame();
  const draw = p(f, 2, 24);
  const rise = p(f, 58, 84);
  const people = Math.round(interpolate(f, [30, 70], [340, 12480], {...clampX, easing: OUT}));
  return (
    <div style={{...card, height: 720, padding: 40, boxSizing: "border-box", fontFamily: SANS, position: "relative"}}>
      <div style={{display: "flex", alignItems: "center", gap: 20}}>
        <div style={{width: 72, height: 72, borderRadius: 22, background: "rgba(47,106,140,.12)", color: C.blue, fontWeight: 800, fontSize: 38, display: "flex", alignItems: "center", justifyContent: "center"}}>R</div>
        <div style={{fontWeight: 800, fontSize: 42}}>RELIANCE</div>
        <div style={{marginLeft: "auto", fontFamily: MONO, fontSize: 20, color: C.mute, background: C.bg, borderRadius: 999, padding: "8px 16px"}}>Illustrative</div>
      </div>
      <div style={{display: "flex", alignItems: "baseline", gap: 18, marginTop: 26}}>
        <div style={{fontWeight: 800, fontSize: 76, letterSpacing: -2}}>₹{fmtIN(2948 + rise * 70.4, 2)}</div>
        <div style={{fontWeight: 800, fontSize: 34, color: C.green, opacity: rise}}>↑ {fmtPct(rise * 2.4)}</div>
      </div>
      <svg width={800} height={200} viewBox="0 0 800 200">
        <path d={FLAT} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - draw} fill="none" stroke={C.blue} strokeWidth={6} strokeLinecap="round" />
        <path d="M540 110 C 600 110, 640 60, 800 24" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - rise} fill="none" stroke={C.green} strokeWidth={6} strokeLinecap="round" />
      </svg>
      <div style={{position: "absolute", left: 40, right: 40, bottom: 120, opacity: p(f, 28, 40)}}>
        <Label t="PEOPLE TRADING NOW" />
        <div style={{fontWeight: 800, fontSize: 84, letterSpacing: -2, color: C.blue}}>{fmtIN(people)}</div>
      </div>
      <div style={{position: "absolute", left: 40, right: 40, bottom: 34, display: "flex", gap: 14, fontWeight: 700, fontSize: 28}}>
        <span style={{padding: "10px 20px", borderRadius: 999, background: "rgba(255,107,74,.15)", color: C.coral, opacity: p(f, 34, 44)}}>1 · Crowd arrives</span>
        <span style={{padding: "10px 20px", borderRadius: 999, background: "rgba(18,183,106,.15)", color: C.green, opacity: p(f, 60, 70)}}>2 · Price follows</span>
      </div>
      {Array.from({length: 56}, (_, i) => {
        const a = hash(i + 3) * Math.PI * 2;
        const d0 = 4 + hash(i + 40) * 20;
        const t = p(f, d0, d0 + 26, Easing.out(Easing.cubic));
        const sx = 440 + Math.cos(a) * 1000;
        const sy = 360 + Math.sin(a) * 800;
        const ex = 80 + hash(i + 21) * 720;
        const ey = 300 + hash(i + 9) * 260;
        const s = 20 + hash(i + 70) * 12;
        return <div key={i} style={{position: "absolute", left: sx + (ex - sx) * t - s / 2, top: sy + (ey - sy) * t - s / 2, width: s, height: s, borderRadius: s, background: [C.coral, C.blue, C.rust][i % 3], opacity: Math.min(1, t * 5) * (1 - p(f, 28, 40))}} />;
      })}
    </div>
  );
};

/* ============ HERO · Direction (240–330) ============ */
const UP: Row = {t: "RELIANCE", r: 6.2, up: true, sub: "10:42 AM", price: 2948, pct: 2.4};
const DN: Row = {t: "TATASTEEL", r: 7.8, up: false, sub: "11:15 AM", price: 138.2, pct: -1.9};
const Direction: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const a = spring({frame: f - 4, fps, config: BOUNCY});
  const b = spring({frame: f - 40, fps, config: BOUNCY});
  const Tag = ({t, col, s, top}: {t: string; col: string; s: number; top: number}) => (
    <div style={{position: "absolute", left: 8, top, padding: "10px 26px", borderRadius: 999, background: col, color: C.white, fontFamily: MONO, fontWeight: 700, fontSize: 26, letterSpacing: 2, opacity: Math.min(1, s), transform: `translateX(${(1 - Math.min(1, s)) * -60}px)`}}>{t}</div>
  );
  return (
    <div style={{position: "relative", height: 700}}>
      <Tag t="↑ BUYERS RUSHING IN" col={C.green} s={a} top={0} />
      <div style={{...card, position: "absolute", left: 0, right: 0, top: 80, height: 170, overflow: "hidden", opacity: Math.min(1, a * 2), transform: `translateY(${(1 - a) * 100}px)`}}>
        <RowView d={UP} top={15} />
      </div>
      <Tag t="↓ SELLERS RUSHING OUT" col={C.red} s={b} top={330} />
      <div style={{...card, position: "absolute", left: 0, right: 0, top: 410, height: 170, overflow: "hidden", opacity: Math.min(1, b * 2), transform: `translateY(${(1 - b) * 100}px)`}}>
        <RowView d={DN} top={15} />
      </div>
      <div style={{position: "absolute", left: 0, right: 0, top: 620, textAlign: "center", fontFamily: SANS, fontWeight: 600, fontSize: 38, color: C.mute, opacity: p(f, 62, 78)}}>Bigger × = bigger rush</div>
    </div>
  );
};

/* ============ HERO · Live feed (330–420) ============ */
const FEED: Row[] = [
  {t: "RELIANCE", r: 6.2, up: true, sub: "2:11 PM · just now", price: 2948, pct: 2.4},
  {t: "ICICIBANK", r: 5.4, up: true, sub: "2:05 PM · 3 min ago", price: 1312.4, pct: 1.8},
  {t: "SBIN", r: 6.9, up: false, sub: "1:58 PM · 10 min ago", price: 812.15, pct: -1.4},
];
const AppFeed: React.FC = () => {
  const f = useCurrentFrame();
  const tap = f >= 62;
  return (
    <div style={{position: "relative", fontFamily: SANS}}>
      <div style={{...card, height: 560, position: "relative"}}>
        <div style={{position: "absolute", left: 34, top: 28}}><SpikeTile size={76} /></div>
        <div style={{position: "absolute", left: 130, top: 26, fontWeight: 800, fontSize: 40}}>Volume Jumps</div>
        <div style={{position: "absolute", left: 130, top: 78, display: "flex", alignItems: "center", gap: 10, fontFamily: MONO, fontSize: 22, color: C.mute}}>
          <div style={{width: 12, height: 12, borderRadius: 6, background: C.green, boxShadow: `0 0 ${10 + 6 * Math.sin(f / 5)}px ${C.green}`}} /> LIVE
        </div>
        <div style={{position: "absolute", right: 30, top: 38, fontWeight: 800, fontSize: 30, color: C.blue, padding: "10px 20px", borderRadius: 16, background: tap ? "rgba(47,106,140,.14)" : "transparent"}}>View all</div>
        <div style={{position: "absolute", left: 0, right: 0, top: 128, height: 1.5, background: C.line}} />
        <div style={{position: "absolute", left: 0, right: 0, top: 140, height: 420, overflow: "hidden", borderRadius: "0 0 40px 40px"}}>
          {FEED.map((d, i) => {
            const s = p(f, 4 + i * 8, 22 + i * 8);
            return <RowView key={d.t} d={d} top={i * 140 + (1 - s) * 40} opacity={s} tint={i === 0 ? 1 - p(f, 36, 64) : 0} />;
          })}
        </div>
        <Cursor x={interpolate(f, [28, 58], [600, 760], {...clampX, easing: INOUT})} y={interpolate(f, [28, 58], [520, 62], {...clampX, easing: INOUT})} opacity={p(f, 24, 32) * (1 - p(f, 74, 82))} tapAt={62} />
      </div>
      <div style={{marginTop: 36, textAlign: "center", fontFamily: MONO, fontWeight: 700, fontSize: 26, letterSpacing: 2, color: C.mute, opacity: p(f, 40, 56)}}>↻ UPDATES EVERY MINUTE</div>
    </div>
  );
};

/* ============ HERO · Alerts (420–520) ============ */
const Alerts: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const sel = f < 24 ? 0 : 2;
  const pop = spring({frame: f - 24, fps, config: BOUNCY});
  const n = spring({frame: f - 46, fps, config: {damping: 14, stiffness: 140, mass: 0.8}});
  const k = Math.max(0, f - 46);
  const ring = f >= 46 ? Math.sin(k * 1.6) * 20 * Math.exp(-k / 9) : 0;
  const push = (top: number, title: string, sub: string, s: number) => (
    <div style={{...card, position: "absolute", left: 0, right: 0, top, padding: "26px 30px", display: "flex", alignItems: "center", gap: 24, opacity: Math.min(1, s * 3), transform: `translateY(${(1 - s) * -160}px)`, boxShadow: "0 30px 60px rgba(20,18,26,.16)"}}>
      <Img src={LOGO} style={{width: 90, height: 90, borderRadius: 24, objectFit: "contain"}} />
      <div style={{flex: 1}}>
        <div style={{display: "flex", justifyContent: "space-between", fontFamily: MONO, fontSize: 22, color: C.mute, fontWeight: 700}}><span>OPTIONXI</span><span>now</span></div>
        <div style={{fontWeight: 800, fontSize: 34, marginTop: 4, whiteSpace: "nowrap"}}>{title}</div>
        <div style={{fontWeight: 600, fontSize: 28, color: C.mute}}>{sub}</div>
      </div>
    </div>
  );
  return (
    <div style={{fontFamily: SANS, position: "relative", height: 760}}>
      <div style={{...card, padding: 40}}>
        <div style={{display: "flex", alignItems: "center", gap: 20}}>
          <div style={{width: 76, height: 76, borderRadius: 24, background: "rgba(47,106,140,.12)", display: "flex", alignItems: "center", justifyContent: "center", transform: `rotate(${ring}deg)`}}>
            <svg width={40} height={40} viewBox="0 0 24 24" fill="none" stroke={C.blue} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round"><path d="M6 9a6 6 0 0 1 12 0c0 6 2 7 2 7H4s2-1 2-7" /><path d="M10 20a2 2 0 0 0 4 0" /></svg>
          </div>
          <div style={{fontWeight: 800, fontSize: 38}}>Alert me when volume hits</div>
        </div>
        <div style={{display: "flex", gap: 18, marginTop: 30}}>
          {[8, 15, 30].map((c, i) => {
            const on = sel === i;
            return (
              <div key={c} style={{flex: 1, height: 120, borderRadius: 30, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 62, letterSpacing: -2, background: on ? C.blue : C.bg, color: on ? C.white : C.mute, transform: `scale(${on ? 0.9 + 0.1 * (i === 2 ? pop : 1) : 1})`}}>{c}×</div>
            );
          })}
        </div>
        <div style={{marginTop: 20, textAlign: "center", fontWeight: 600, fontSize: 28, color: C.mute}}>or type any number you like</div>
      </div>
      {push(400, "TATAMOTORS jumped 30× volume", "↑ Up 4.1% · tap to view", n)}
    </div>
  );
};

/* ============ HERO · Replay (520–600) ============ */
const DAY1: Row[] = [
  {t: "WELCORP", r: 7.4, up: true, sub: "Spotted at 9:48 AM", price: 812.4, pct: 2.4},
  {t: "RELIANCE", r: 6.2, up: true, sub: "Spotted at 10:42 AM", price: 2948, pct: 1.4},
];
const DAY2: Row[] = [
  {t: "INFY", r: 5.8, up: true, sub: "Spotted at 10:05 AM", price: 1884, pct: 2.1},
  {t: "HDFCBANK", r: 6.6, up: false, sub: "Spotted at 12:30 PM", price: 1621.5, pct: -1.2},
];
const Replay: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const sw = p(f, 28, 38);
  const pop = spring({frame: f - 28, fps, config: BOUNCY});
  return (
    <div style={{fontFamily: SANS, position: "relative", height: 660}}>
      <div style={{...card, height: 120, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 44px", fontWeight: 800, fontSize: 40}}>
        <span style={{color: C.blue, fontSize: 56}}>‹</span>
        <span>{sw < 0.5 ? "Thu, 12 Nov 2026" : "Wed, 11 Nov 2026"}</span>
        <span style={{color: C.mute, fontSize: 56}}>›</span>
      </div>
      <div style={{display: "flex", alignItems: "baseline", gap: 14, marginTop: 36, marginLeft: 12}}>
        <span style={{fontWeight: 800, fontSize: 96, letterSpacing: -3, color: C.blue, display: "inline-block", transform: `scale(${0.8 + 0.2 * pop})`, transformOrigin: "0 100%"}}>{sw < 0.5 ? 12 : 9}</span>
        <span style={{fontWeight: 700, fontSize: 40}}>stocks had a rush</span>
      </div>
      <div style={{...card, position: "absolute", left: 0, right: 0, top: 290, height: 300, overflow: "hidden"}}>
        {DAY1.map((d, i) => <RowView key={d.t} d={d} top={10 + i * 140} opacity={1 - sw} />)}
        {DAY2.map((d, i) => <RowView key={d.t} d={d} top={10 + i * 140} opacity={sw} />)}
      </div>
      <Cursor x={interpolate(f, [6, 24], [420, 62], {...clampX, easing: INOUT})} y={60} opacity={p(f, 4, 10) * (1 - p(f, 44, 52))} tapAt={26} />
    </div>
  );
};

/* ============ HERO · Sensitivity (600–670) ============ */
const RELAXED: Row[] = [DAY1[0], DAY1[1], {t: "SBIN", r: 6.9, up: false, sub: "Spotted at 11:20 AM", price: 812.15, pct: -1.4}];
const STRICT: Row[] = [DAY1[0], {t: "SBIN", r: 8.3, up: false, sub: "Spotted at 11:20 AM", price: 812.15, pct: -1.4}];
const Sens: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const m = p(f, 14, 34, INOUT);
  const pop = spring({frame: f - 32, fps, config: BOUNCY});
  const sw = W - 80;
  return (
    <div style={{fontFamily: SANS, position: "relative", height: 700}}>
      <div style={{display: "flex", alignItems: "baseline", gap: 14, marginLeft: 12}}>
        <span style={{fontWeight: 800, fontSize: 110, letterSpacing: -3, color: C.blue, display: "inline-block", transform: `scale(${0.8 + 0.2 * (m > 0.5 ? pop : 1)})`, transformOrigin: "0 100%"}}>{m < 0.5 ? 12 : 5}</span>
        <span style={{fontWeight: 700, fontSize: 40}}>stocks had a rush</span>
      </div>
      <div style={{...card, position: "absolute", left: 0, right: 0, top: 150, height: 300, overflow: "hidden"}}>
        {RELAXED.map((d, i) => <RowView key={"r" + i} d={d} top={8 + i * 94} h={94} opacity={1 - m} />)}
        {STRICT.map((d, i) => <RowView key={"s" + i} d={d} top={8 + i * 140} opacity={m} />)}
      </div>
      <div style={{...card, position: "absolute", left: 0, right: 0, top: 490, padding: 40, boxSizing: "border-box"}}>
        <Label t="SENSITIVITY" />
        <div style={{position: "relative", height: 100, marginTop: 14, borderRadius: 999, background: C.bg, border: `1.5px solid ${C.line}`}}>
          <div style={{position: "absolute", top: 6, left: 6 + m * (sw - 12) * (2 / 3), width: (sw - 12) / 3, height: 88, borderRadius: 999, background: C.blue}} />
          {["Relaxed", "Standard", "Strict"].map((s, i) => (
            <div key={s} style={{position: "absolute", left: (i * sw) / 3, width: sw / 3, height: 100, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 32, color: Math.round(m * 2) === i ? C.white : C.mute}}>{s}</div>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ============ HERO · CTA (670–810): app card → badge → link in bio ============ */
const Cta: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const icon = spring({frame: f - 4, fps, config: BOUNCY});
  const ring = (f % 45) / 45;
  const pills = ["Live feed", "Instant alerts", "Replay any day"];
  const badge = spring({frame: f - 40, fps, config: BOUNCY});
  const bio = spring({frame: f - 70, fps, config: BOUNCY});
  const url = p(f, 90, 104);
  return (
    <div style={{fontFamily: SANS, position: "relative", height: 780, textAlign: "center"}}>
      <div style={{position: "relative", width: 220, height: 220, margin: "0 auto", transform: `scale(${icon})`}}>
        <div style={{position: "absolute", inset: -ring * 90, borderRadius: 64 + ring * 40, border: `4px solid ${C.coral}`, opacity: 1 - ring}} />
        <div style={{...card, width: 220, height: 220, borderRadius: 64, display: "flex", alignItems: "center", justifyContent: "center"}}>
          <SpikeTile size={140} />
        </div>
      </div>
      <div style={{marginTop: 36, fontWeight: 800, fontSize: 56, letterSpacing: -1, opacity: p(f, 10, 22)}}>Volume Jumps</div>
      <div style={{display: "flex", gap: 14, justifyContent: "center", marginTop: 30}}>
        {pills.map((t, i) => {
          const s = spring({frame: f - 20 - i * 6, fps, config: SOFT});
          return (
            <div key={t} style={{padding: "16px 26px", borderRadius: 999, background: i === 1 ? C.coral : C.white, color: i === 1 ? C.white : C.ink, fontWeight: 700, fontSize: 30, boxShadow: "0 10px 24px rgba(20,18,26,.08)", opacity: s, transform: `translateY(${(1 - s) * 40}px)`, whiteSpace: "nowrap"}}>{t}</div>
          );
        })}
      </div>
      <div style={{marginTop: 56, transform: `scale(${0.6 + 0.4 * badge})`, opacity: p(f, 40, 48)}}>
        <Img src={BADGE} style={{width: 620, height: "auto"}} />
      </div>
      <div style={{marginTop: 40, display: "inline-block", padding: "16px 34px", borderRadius: 999, background: "rgba(47,106,140,.12)", color: C.blue, fontWeight: 800, fontSize: 38, transform: `scale(${bio})`, opacity: Math.min(1, bio * 2)}}>
        Link in bio ↑
      </div>
      <div style={{marginTop: 30, fontFamily: MONO, fontWeight: 700, fontSize: 42, color: C.blue, opacity: url}}>optionxi.com</div>
      <div style={{marginTop: 18, fontSize: 24, color: C.mute, opacity: url}}>Educational use only · Not investment advice</div>
    </div>
  );
};

/* ---------------------------- root ---------------------------- */
export const Reel: React.FC = () => {
  useFonts();
  return (
    <AbsoluteFill style={{fontFamily: SANS}}>
      <Canvas />
      <Hero from={76} dur={76}><Bars /></Hero>
      <Hero from={152} dur={88} top={470}><Crowd /></Hero>
      <Hero from={240} dur={90} top={490}><Direction /></Hero>
      <Hero from={330} dur={90} top={480}><AppFeed /></Hero>
      <Hero from={420} dur={100} top={470}><Alerts /></Hero>
      <Hero from={520} dur={80} top={480}><Replay /></Hero>
      <Hero from={600} dur={70} top={470}><Sens /></Hero>
      <Hero from={670} dur={140} top={470} keep><Cta /></Hero>
      <Hook />
      <Captions />
    </AbsoluteFill>
  );
};

export default Reel;