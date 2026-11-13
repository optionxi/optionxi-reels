import React from "react";
import {
  Easing,
  Sequence,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  AbsoluteFill,
  Img,
} from "remotion";
import {getSafe, SafeArea, SafeGuide} from "../shared/safe-area";

/* ═══════════════════════════════════════════════════════════════
   OPTIONXI · SCREENER PRO — 30s Reel (1080×1920 @ 30fps)
   Style: soft-UI explainer (warm off-white, floating cards, phone mockup,
   sans + italic-serif accent captions). Captions are the ONLY script text.
   Visuals carry the idea; UI text is kept to numbers / micro labels.

   SCRIPT (voice-over = captions)
   0–3.5s    HOOK    "Nobody has time to check 2,000 stocks."
   3.5–7s    IDEA    "So stop scrolling. Let rules do the work."
   7–12s     RULE    "Pick a value. Pick how to compare. In plain English."
   12–17s    STACK   "Add more rules. Every stock must pass all."
   17–24s    RESULT  "Thousands shrink to a handful, with trend and momentum."
   24–27s    SCAN    "No idea where to start? Tap a scanner."
   27–30s    CTA     "Find the right stocks, in seconds. Meet Screener Pro."
   ═══════════════════════════════════════════════════════════════ */

export const config = {
  durationInFrames: 900,
  fps: 30,
  width: 1080,
  height: 1920,
};
const SAFE = getSafe(config);
const SAFE_H: number = (SAFE as unknown as {h?: number}).h ?? 1500;

/* ─────────── palette (soft-UI explainer skill) ─────────── */
const C = {
  bg: "#F7F5F6",
  screen: "#FBFAFB",
  card: "#FFFFFF",
  line: "#ECE8EA",
  ink: "#1C1A1F",
  sub: "#9A9A9E",
  blue: "#2F6A8C",
  blueBg: "#E6EEF3",
  coral: "#E8765A",
  coralBg: "#FCEBE6",
  rust: "#B2563B",
  gain: "#2E9E6B",
  gainBg: "#E4F4EB",
  loss: "#E5534B",
  grey: "#F1EEF0",
};
const FONT = '"Inter Tight","Inter","Plus Jakarta Sans","SF Pro Display",Arial,sans-serif';
const SERIF = '"Instrument Serif","Playfair Display","Newsreader",Georgia,serif';
const MONO = '"JetBrains Mono","SF Mono",Menlo,monospace';
const SHADOW = "0 36px 70px rgba(28,26,31,0.13), 0 8px 18px rgba(28,26,31,0.07)";
const SOFT = "0 14px 30px rgba(28,26,31,0.08), 0 2px 6px rgba(28,26,31,0.05)";

/* ─────────── helpers ─────────── */
const clamp = {extrapolateLeft: "clamp", extrapolateRight: "clamp"} as const;
const sp = (f: number, fps: number, delay = 0, damping = 14, stiffness = 130) =>
  spring({frame: Math.max(0, f - delay), fps, config: {damping, stiffness, mass: 0.8}});
const rnd = (n: number) => {
  const x = Math.sin(n * 12.9898) * 43758.5453;
  return x - Math.floor(x);
};
const fmt = (n: number) => Math.round(n).toLocaleString("en-US");

const sparkPath = (seed: number, up: boolean, w: number, h: number, n = 9) => {
  const vals = Array.from({length: n}, (_, i) =>
    rnd(seed + i * 3.1) * 0.45 + (up ? i / (n - 1) : 1 - i / (n - 1)) * 0.55
  );
  return vals
    .map((v, i) => `${i ? "L" : "M"}${((i / (n - 1)) * w).toFixed(1)},${(h - 2 - v * (h - 4)).toFixed(1)}`)
    .join(" ");
};
const linePath = (arr: number[], w: number, h: number, lo: number, hi: number, padX = 0) =>
  arr
    .map((v, i) => {
      const x = padX + (i / (arr.length - 1)) * (w - padX * 2);
      const y = h - 4 - ((v - lo) / (hi - lo)) * (h - 8);
      return `${i ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

const SYMS = [
  "RELIANCE", "TCS", "INFY", "HDFCBANK", "ICICIBANK", "SBIN", "ITC", "LT",
  "AXISBANK", "WIPRO", "MARUTI", "TITAN", "ONGC", "NTPC", "CIPLA", "DLF",
  "BHEL", "ZOMATO", "IRCTC", "HAL",
];

/* ─────────── icons ─────────── */
const ICONS: Record<string, string> = {
  funnel: "M3 4h18l-7 8v6l-4 2v-8z",
  chart: "M3 17l5-6 4 3 8-9",
  bars: "M5 20V10M12 20V4M19 20v-7",
  check: "M4 12l5 5L20 6",
  bolt: "M13 2L4 14h7l-1 8 9-12h-7z",
  plus: "M12 5v14M5 12h14",
  up: "M6 17L17 6M8 6h9v9",
  down: "M6 7l11 11M17 8v9H8",
  gauge: "M4 16a8 8 0 0116 0M12 16l4-5",
  arrow: "M5 12h14M13 6l6 6-6 6",
};
const Ico: React.FC<{n: string; size?: number; color?: string; sw?: number}> = ({
  n, size = 28, color = C.ink, sw = 2.4,
}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}
    strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
    <path d={ICONS[n]} />
  </svg>
);
const Tile: React.FC<{n: string; size?: number; bg?: string; color?: string}> = ({
  n, size = 52, bg = C.blueBg, color = C.blue,
}) => (
  <div style={{
    width: size, height: size, borderRadius: size * 0.3, background: bg, flexShrink: 0,
    display: "flex", alignItems: "center", justifyContent: "center",
  }}>
    <Ico n={n} size={size * 0.5} color={color} />
  </div>
);
const CheckDot: React.FC<{size?: number}> = ({size = 40}) => (
  <div style={{
    width: size, height: size, borderRadius: size / 2, background: C.gain, flexShrink: 0,
    display: "flex", alignItems: "center", justifyContent: "center",
  }}>
    <Ico n="check" size={size * 0.55} color="#fff" sw={3.4} />
  </div>
);
const Bar: React.FC<{w: number; h?: number; c?: string}> = ({w, h = 14, c = C.grey}) => (
  <div style={{width: w, height: h, borderRadius: h / 2, background: c}} />
);

/* ─────────── motion primitives ─────────── */
const Fade: React.FC<{dur: number; inF?: number; outF?: number; children: React.ReactNode}> = ({
  dur, inF = 6, outF = 0, children,
}) => {
  const f = useCurrentFrame();
  const a = inF ? interpolate(f, [0, inF], [0, 1], clamp) : 1;
  const b = outF ? interpolate(f, [dur - outF, dur], [1, 0], clamp) : 1;
  return <div style={{position: "absolute", inset: 0, opacity: Math.min(a, b)}}>{children}</div>;
};

const Pop: React.FC<{
  x: number; y: number; at?: number; rot?: number; z?: number; children: React.ReactNode;
}> = ({x, y, at = 0, rot = 0, z = 10, children}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = sp(f, fps, at, 11, 160);
  const bob = Math.sin((f + x) / 18) * 7 * Math.min(1, s);
  return (
    <div style={{
      position: "absolute", left: x, top: y, zIndex: z, opacity: Math.min(1, s * 2),
      transform: `translate(-50%,-50%) translateY(${bob}px) rotate(${rot * s}deg) scale(${0.55 + 0.45 * s})`,
    }}>
      {children}
    </div>
  );
};

const Rise: React.FC<{at?: number; dy?: number; style?: React.CSSProperties; children: React.ReactNode}> = ({
  at = 0, dy = 40, style, children,
}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = sp(f, fps, at, 13, 130);
  return (
    <div style={{
      opacity: Math.min(1, s * 1.6),
      transform: `translateY(${(1 - s) * dy}px) scale(${0.93 + 0.07 * s})`,
      ...style,
    }}>
      {children}
    </div>
  );
};

type Pt = {f: number; x: number; y: number};
const Cursor: React.FC<{pts: Pt[]; clicks: number[]; hideAt?: number}> = ({pts, clicks, hideAt}) => {
  const f = useCurrentFrame();
  const ease = {...clamp, easing: Easing.inOut(Easing.cubic)};
  const x = interpolate(f, pts.map((p) => p.f), pts.map((p) => p.x), ease);
  const y = interpolate(f, pts.map((p) => p.f), pts.map((p) => p.y), ease);
  const press = clicks.reduce((m, c) => Math.max(m, interpolate(f, [c - 3, c, c + 8], [0, 1, 0], clamp)), 0);
  const o =
    (hideAt === undefined ? 1 : interpolate(f, [hideAt, hideAt + 8], [1, 0], clamp)) *
    interpolate(f, [0, 8], [0, 1], clamp);
  return (
    <div style={{position: "absolute", left: 0, top: 0, zIndex: 30, opacity: o, pointerEvents: "none"}}>
      {clicks.map((c) => {
        if (f < c || f > c + 16) return null;
        const r = interpolate(f, [c, c + 16], [0, 1], clamp);
        const d = 24 + 80 * r;
        return (
          <div key={c} style={{
            position: "absolute", left: x - d / 2, top: y - d / 2, width: d, height: d,
            borderRadius: "50%", border: `4px solid ${C.blue}`, opacity: 1 - r,
          }} />
        );
      })}
      <svg width={46} height={46} viewBox="0 0 24 24" style={{
        position: "absolute", left: x - 6, top: y - 4,
        transform: `scale(${1 - 0.2 * press})`, transformOrigin: "6px 4px",
        filter: "drop-shadow(0 6px 8px rgba(0,0,0,0.25))",
      }}>
        <path d="M5 3v15l4-4 3 7 3-1.5-3-7h6z" fill="#fff" stroke={C.ink} strokeWidth={1.6} strokeLinejoin="round" />
      </svg>
    </div>
  );
};

/* ─────────── background ─────────── */
const Background: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{backgroundColor: C.bg}}>
      <div style={{
        position: "absolute", width: 1100, height: 1100, borderRadius: "50%",
        left: -450 + Math.sin(f / 90) * 50, top: -250 + Math.cos(f / 110) * 40,
        background: "radial-gradient(circle, rgba(244,231,223,0.95), rgba(244,231,223,0) 65%)",
      }} />
      <div style={{
        position: "absolute", width: 1000, height: 1000, borderRadius: "50%",
        right: -420 + Math.cos(f / 100) * 50, bottom: -250 + Math.sin(f / 80) * 40,
        background: "radial-gradient(circle, rgba(232,118,90,0.14), rgba(232,118,90,0) 65%)",
      }} />
      <div style={{
        position: "absolute", width: 900, height: 900, borderRadius: "50%",
        right: -300, top: 500 + Math.sin(f / 120) * 60,
        background: "radial-gradient(circle, rgba(47,106,140,0.10), rgba(47,106,140,0) 65%)",
      }} />
    </AbsoluteFill>
  );
};

/* ─────────── phone ─────────── */
const PH_W = 440;
const PH_H = 900;
const Phone: React.FC<{children: React.ReactNode}> = ({children}) => (
  <div style={{
    position: "absolute", left: -PH_W / 2, top: -PH_H / 2, width: PH_W, height: PH_H,
    borderRadius: 68, background: C.ink, padding: 14, boxSizing: "border-box",
    boxShadow: `${SHADOW}, inset 0 0 0 2px #3a373e`,
  }}>
    <div style={{
      position: "relative", width: "100%", height: "100%", borderRadius: 55,
      overflow: "hidden", background: C.screen, fontFamily: FONT, color: C.ink,
    }}>
      {children}
      <div style={{
        position: "absolute", top: 12, left: "50%", marginLeft: -59, width: 118, height: 32,
        borderRadius: 16, background: C.ink, zIndex: 40,
      }} />
    </div>
  </div>
);

const AppBar: React.FC = () => (
  <div style={{
    position: "absolute", left: 24, right: 24, top: 54, height: 44,
    display: "flex", alignItems: "center", justifyContent: "space-between",
  }}>
    <div style={{display: "flex", alignItems: "center", gap: 12}}>
      <div style={{
        width: 40, height: 40, borderRadius: 12, background: C.ink, color: "#fff",
        fontWeight: 900, fontSize: 19, display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        X<span style={{color: C.coral}}>i</span>
      </div>
      <div style={{fontWeight: 800, fontSize: 24}}>Screener</div>
    </div>
    <div style={{
      width: 40, height: 40, borderRadius: 20, background: C.blueBg,
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <Ico n="funnel" size={22} color={C.blue} />
    </div>
  </div>
);

/* ─────────── reusable UI pieces ─────────── */
const RuleCard: React.FC<{
  y: number; a: string; op: string; b: string; s: number; checked: boolean;
}> = ({y, a, op, b, s, checked}) => (
  <div style={{
    position: "absolute", left: 24, top: y, width: 364, height: 88, boxSizing: "border-box",
    borderRadius: 26, background: C.card, boxShadow: SOFT,
    border: `2px solid ${checked ? C.gain : C.line}`,
    display: "flex", alignItems: "center", padding: "0 18px", gap: 12,
    opacity: Math.min(1, s * 1.6), transform: `translateY(${(1 - s) * 40}px) scale(${0.94 + 0.06 * s})`,
  }}>
    <Tile n={a} size={52} />
    <div style={{
      width: 44, height: 44, borderRadius: 14, background: C.grey, fontFamily: MONO,
      fontWeight: 800, fontSize: 26, display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      {op}
    </div>
    {b.startsWith("#") ? (
      <div style={{
        height: 52, minWidth: 52, borderRadius: 16, background: C.coralBg, color: C.rust,
        fontFamily: MONO, fontWeight: 800, fontSize: 26, padding: "0 14px",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        {b.slice(1)}
      </div>
    ) : (
      <Tile n={b} size={52} bg={C.coralBg} color={C.coral} />
    )}
    <div style={{flex: 1}} />
    <div style={{opacity: checked ? 1 : 0, transform: `scale(${checked ? 1 : 0.4})`}}>
      <CheckDot size={40} />
    </div>
  </div>
);

const DashedAdd: React.FC<{y: number; h?: number; pulse?: boolean}> = ({y, h = 88, pulse = true}) => {
  const f = useCurrentFrame();
  const p = 0.5 + 0.5 * Math.sin(f / 4);
  return (
    <div style={{
      position: "absolute", left: 24, top: y, width: 364, height: h, boxSizing: "border-box",
      borderRadius: 26, border: "3px dashed rgba(47,106,140,0.4)", background: "rgba(47,106,140,0.05)",
      display: "flex", alignItems: "center", justifyContent: "center",
      boxShadow: pulse ? `0 0 0 ${8 * p}px rgba(47,106,140,0.10)` : "none",
    }}>
      <Ico n="plus" size={34} color={C.blue} />
    </div>
  );
};

/* ═══════════════ SCREEN 1 — endless scroll ═══════════════ */
const ScrollScreen: React.FC = () => {
  const f = useCurrentFrame();
  const total = 20 * 100;
  const blur = interpolate(f, [0, 40], [1, 3.5], clamp);
  return (
    <div style={{position: "absolute", inset: 0, filter: `blur(${blur}px)`}}>
      {Array.from({length: 20}).map((_, i) => {
        const y = ((((i * 100 - f * 26) % total) + total) % total) - 100;
        const up = rnd(i + 1) > 0.45;
        const pct = (rnd(i + 7) * 4 + 0.1).toFixed(2);
        return (
          <div key={i} style={{
            position: "absolute", left: 24, top: y, width: 364, height: 84, boxSizing: "border-box",
            borderRadius: 24, background: C.card, boxShadow: SOFT, display: "flex",
            alignItems: "center", padding: "0 18px", gap: 12,
          }}>
            <div style={{width: 46, height: 46, borderRadius: 23, background: i % 2 ? C.blueBg : C.coralBg}} />
            <div style={{fontWeight: 800, fontSize: 21, flex: 1}}>{SYMS[i % SYMS.length]}</div>
            <svg width={70} height={30} viewBox="0 0 70 30">
              <path d={sparkPath(i * 5, up, 70, 30)} fill="none" stroke={up ? C.gain : C.loss}
                strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div style={{fontFamily: MONO, fontWeight: 700, fontSize: 18, color: up ? C.gain : C.loss, width: 66, textAlign: "right"}}>
              {up ? "+" : "-"}{pct}
            </div>
          </div>
        );
      })}
    </div>
  );
};

const CountCard: React.FC = () => {
  const f = useCurrentFrame();
  const n = interpolate(f, [4, 44], [0, 2000], {...clamp, easing: Easing.out(Easing.cubic)});
  return (
    <div style={{
      width: 560, height: 260, background: C.card, borderRadius: 52, boxShadow: SHADOW,
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      fontFamily: FONT,
    }}>
      <div style={{fontSize: 120, fontWeight: 900, letterSpacing: -4, lineHeight: 1, whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums"}}>
        {fmt(n)}<span style={{color: C.coral}}>+</span>
      </div>
      <div style={{fontFamily: MONO, fontSize: 22, letterSpacing: 7, color: C.sub, marginTop: 12}}>STOCKS</div>
    </div>
  );
};
const PctChip: React.FC<{v: string; up: boolean}> = ({v, up}) => (
  <div style={{
    background: C.card, borderRadius: 999, padding: "12px 26px", fontFamily: MONO,
    fontSize: 34, fontWeight: 700, color: up ? C.gain : C.loss, boxShadow: SOFT,
  }}>
    {v}
  </div>
);
const HookFx: React.FC = () => (
  <>
    <Pop x={0} y={30} at={4} z={20}><CountCard /></Pop>
    <Pop x={-215} y={-310} at={14} rot={-6}><PctChip v="-2.1%" up={false} /></Pop>
    <Pop x={225} y={-170} at={20} rot={6}><PctChip v="+3.4%" up /></Pop>
    <Pop x={-225} y={290} at={26} rot={5}><PctChip v="+0.8%" up /></Pop>
    <Pop x={215} y={330} at={32} rot={-5}><PctChip v="-1.2%" up={false} /></Pop>
  </>
);

/* ═══════════════ SCREEN 2 — rules, not scrolling ═══════════════ */
const StartScreen: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = sp(f, fps, 40, 12, 170);
  return (
    <>
      <AppBar />
      {f < 40 ? <DashedAdd y={130} h={88} /> : <RuleCard y={130} a="chart" op=">" b="chart" s={s} checked={f >= 56} />}
      <div style={{opacity: interpolate(f, [56, 70], [0, 1], clamp)}}>
        <DashedAdd y={242} h={88} pulse={false} />
      </div>
      {[0, 1, 2].map((i) => (
        <div key={i} style={{
          position: "absolute", left: 24, top: 400 + i * 104, width: 364, height: 88, borderRadius: 26,
          background: C.card, opacity: 0.55, display: "flex", alignItems: "center", padding: "0 20px", gap: 14,
          boxSizing: "border-box", boxShadow: SOFT,
        }}>
          <div style={{width: 46, height: 46, borderRadius: 23, background: C.grey}} />
          <div style={{display: "flex", flexDirection: "column", gap: 10}}>
            <Bar w={150 - i * 20} h={14} />
            <Bar w={90} h={12} />
          </div>
        </div>
      ))}
      <Cursor pts={[{f: 0, x: 330, y: 640}, {f: 34, x: 206, y: 176}]} clicks={[40]} hideAt={62} />
    </>
  );
};

const FunnelFx: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const pop = sp(f, fps, 4, 12, 150);
  const cx = 225;
  const top = -250;
  const chipCols = [C.blueBg, C.coralBg, C.grey];
  const outs = [{s: "TATAPOWER", p: "+3.4"}, {s: "SBIN", p: "+2.2"}, {s: "LT", p: "+1.8"}];
  return (
    <div style={{position: "absolute", left: 0, top: 0}}>
      <svg width={300} height={240} viewBox="0 0 300 240" style={{
        position: "absolute", left: cx - 150, top, opacity: pop,
        filter: "drop-shadow(0 26px 30px rgba(28,26,31,0.14))",
      }}>
        <path d="M10 10H290L182 130V208Q182 226 164 226H136Q118 226 118 208V130Z" fill="#fff"
          stroke={C.blue} strokeWidth={5} strokeLinejoin="round" />
      </svg>
      {Array.from({length: 10}).map((_, i) => {
        const p = ((f * 2.6 + i * 41) % 130) / 130;
        const x = cx + (rnd(i + 3) - 0.5) * 260 * (1 - 0.85 * p * p);
        const y = top - 170 + p * 200;
        const o = interpolate(p, [0, 0.1, 0.85, 1], [0, 1, 1, 0], clamp) * pop;
        return (
          <div key={i} style={{
            position: "absolute", left: x - 32, top: y, width: 64, height: 28, borderRadius: 10,
            background: chipCols[i % 3], opacity: o, border: `2px solid ${C.line}`,
          }} />
        );
      })}
      {outs.map((o, i) => {
        const s = sp(f, fps, 60 + i * 9, 11, 170);
        return (
          <div key={o.s} style={{
            position: "absolute", left: cx - 80, top: top + 262 + i * 58, width: 160, height: 46,
            borderRadius: 16, background: C.gainBg, border: `2.5px solid ${C.gain}`,
            display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 14px",
            boxSizing: "border-box", fontFamily: FONT, fontWeight: 800, fontSize: 19,
            opacity: s, transform: `translateY(${(1 - s) * -30}px) scale(${0.85 + 0.15 * s})`,
            boxShadow: SOFT,
          }}>
            <span>{o.s}</span>
            <span style={{color: C.gain, fontFamily: MONO, fontSize: 18}}>{o.p}</span>
          </div>
        );
      })}
    </div>
  );
};

/* ═══════════════ SCREEN 3 — build a rule ═══════════════ */
const Slot: React.FC<{
  y: number; at: number; icon: string; value: string; tint: string; col: string;
}> = ({y, at, icon, value, tint, col}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const filled = f >= at;
  const active = !filled && f >= at - 26;
  const s = sp(f, fps, at, 12, 170);
  const pulse = 0.5 + 0.5 * Math.sin(f / 4);
  const menu = f >= at - 24 && f < at;
  const sel = f >= at - 12;
  return (
    <>
      <div style={{
        position: "absolute", left: 24, top: y, width: 364, height: 88, borderRadius: 26,
        boxSizing: "border-box", display: "flex", alignItems: "center", padding: "0 22px", gap: 16,
        background: filled ? C.card : "rgba(47,106,140,0.06)",
        border: filled ? `2px solid ${C.line}` : `3px dashed ${active ? C.blue : "rgba(47,106,140,0.35)"}`,
        boxShadow: filled ? SOFT : active ? `0 0 0 ${8 * pulse}px rgba(47,106,140,0.14)` : "none",
      }}>
        {filled ? (
          <>
            <Tile n={icon} size={52} bg={tint} color={col} />
            <div style={{fontSize: 32, fontWeight: 800, flex: 1, transform: `scale(${0.9 + 0.1 * s})`, transformOrigin: "left center"}}>
              {value}
            </div>
            <CheckDot size={40} />
          </>
        ) : (
          <div style={{margin: "0 auto"}}><Ico n="plus" size={34} color={C.blue} /></div>
        )}
      </div>
      {menu && (
        <div style={{
          position: "absolute", left: 24, top: y + 94, width: 364, boxSizing: "border-box", padding: 10,
          borderRadius: 24, background: C.card, boxShadow: SHADOW, zIndex: 25,
          display: "flex", flexDirection: "column", gap: 6,
          opacity: interpolate(f, [at - 24, at - 18], [0, 1], clamp),
        }}>
          {[0, 1, 2].map((r) => (
            <div key={r} style={{
              height: 46, borderRadius: 16, display: "flex", alignItems: "center", padding: "0 16px",
              background: r === 1 && sel ? C.blueBg : "transparent",
              fontWeight: 800, fontSize: 25, color: C.blue,
            }}>
              {r === 1 ? value : <Bar w={r === 0 ? 150 : 110} h={13} />}
            </div>
          ))}
        </div>
      )}
    </>
  );
};

const PRICE = [150, 156, 140, 130, 136, 118, 106, 110, 92, 82, 70];
const MA = [150, 148, 146, 143, 140, 136, 131, 127, 122, 118, 114];

const BuildScreen: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const maDraw = interpolate(f, [100, 114], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
  const prDraw = interpolate(f, [116, 142], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
  const dot = sp(f, fps, 142, 10, 200);
  const runPress = interpolate(f, [111, 114, 122], [0, 1, 0], clamp);
  const slots = [
    {y: 130, at: 26, icon: "chart", value: "Price", tint: C.blueBg, col: C.blue},
    {y: 242, at: 62, icon: "up", value: "is above", tint: C.grey, col: C.ink},
    {y: 354, at: 98, icon: "chart", value: "50-day line", tint: C.coralBg, col: C.coral},
  ];
  const pts: Pt[] = [
    {f: 0, x: 330, y: 760},
    ...slots.flatMap((s) => [
      {f: s.at - 24, x: 300, y: s.y + 44},
      {f: s.at - 6, x: 210, y: s.y + 182},
    ]),
    {f: 108, x: 206, y: 816},
  ];
  const W = 364, H = 270;
  const px = (i: number) => 24 + (i / 10) * (W - 48);
  const lastX = px(10);
  const lastY = H - 4 - ((PRICE[10] - 60) / (160 - 60)) * (H - 8);
  return (
    <>
      <AppBar />
      {slots.map((s) => <Slot key={s.y} {...s} />)}
      <div style={{
        position: "absolute", left: 24, top: 480, width: W, height: H, borderRadius: 30,
        background: C.card, boxShadow: SOFT, border: `2px solid ${C.line}`, boxSizing: "border-box",
      }}>
        <svg width={W - 4} height={H - 4} viewBox={`0 0 ${W} ${H}`}>
          {[70, 135, 200].map((gy) => (
            <line key={gy} x1={20} x2={W - 20} y1={gy} y2={gy} stroke={C.line} strokeWidth={2} />
          ))}
          <path d={linePath(MA, W, H, 60, 160, 24)} fill="none" stroke={C.coral} strokeWidth={6}
            strokeLinecap="round" strokeLinejoin="round" pathLength={1}
            strokeDasharray={1} strokeDashoffset={1 - maDraw} />
          <path d={linePath(PRICE, W, H, 60, 160, 24)} fill="none" stroke={C.blue} strokeWidth={7}
            strokeLinecap="round" strokeLinejoin="round" pathLength={1}
            strokeDasharray={1} strokeDashoffset={1 - prDraw} />
          {f >= 142 && (
            <>
              <circle cx={lastX} cy={lastY} r={22 * dot} fill="rgba(46,158,107,0.2)" />
              <circle cx={lastX} cy={lastY} r={10} fill={C.gain} />
            </>
          )}
        </svg>
      </div>
      <div style={{
        position: "absolute", left: 24, top: 784, width: 364, height: 64, borderRadius: 32,
        background: C.blue, display: "flex", alignItems: "center", justifyContent: "center", gap: 12,
        transform: `scale(${1 - 0.05 * runPress})`, boxShadow: "0 12px 24px rgba(47,106,140,0.3)",
        color: "#fff", fontWeight: 800, fontSize: 28,
      }}>
        Run <Ico n="arrow" size={28} color="#fff" sw={3} />
      </div>
      <Cursor pts={pts} clicks={[26, 62, 98, 114]} hideAt={130} />
    </>
  );
};

const BuildFx: React.FC = () => (
  <Pop x={215} y={190} at={140} rot={6}>
    <div style={{
      width: 120, height: 120, borderRadius: 40, background: C.gain, boxShadow: SHADOW,
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <Ico n="check" size={64} color="#fff" sw={3.4} />
    </div>
  </Pop>
);

/* ═══════════════ SCREEN 4 — stack rules ═══════════════ */
const RULES = [
  {y: 300, a: "chart", op: ">", b: "chart", at: 14},
  {y: 404, a: "bars", op: ">", b: "bars", at: 54},
  {y: 508, a: "gauge", op: ">", b: "#55", at: 94},
];

const StackScreen: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const v = interpolate(f, [0, 36, 52, 76, 92, 116, 132], [2184, 2184, 640, 640, 187, 187, 12],
    {...clamp, easing: Easing.inOut(Easing.cubic)});
  const done = f >= 132;
  const barW = Math.max(1.5, (v / 2184) * 100);
  const added = RULES.filter((r) => f >= r.at).length;
  return (
    <>
      <AppBar />
      <div style={{position: "absolute", left: 24, top: 112, width: 364}}>
        <div style={{display: "flex", alignItems: "baseline", gap: 14}}>
          <div style={{
            fontSize: 112, fontWeight: 900, letterSpacing: -4, lineHeight: 1,
            color: done ? C.gain : C.ink,
          }}>
            {fmt(v)}
          </div>
          <div style={{fontFamily: MONO, fontSize: 20, letterSpacing: 5, color: C.sub}}>LEFT</div>
        </div>
        <div style={{marginTop: 18, height: 16, borderRadius: 8, background: C.grey, overflow: "hidden"}}>
          <div style={{width: `${barW}%`, height: "100%", borderRadius: 8, background: done ? C.gain : C.blue}} />
        </div>
      </div>
      {RULES.map((r) => (
        <RuleCard key={r.y} y={r.y} a={r.a} op={r.op} b={r.b}
          s={sp(f, fps, r.at, 12, 150)} checked={f >= r.at + 22} />
      ))}
      {added < 3 && <DashedAdd y={300 + added * 104} />}
      <Cursor
        pts={[{f: 0, x: 330, y: 700}, {f: 10, x: 200, y: 344}, {f: 50, x: 200, y: 448}, {f: 90, x: 200, y: 552}]}
        clicks={[12, 52, 92]} hideAt={118}
      />
    </>
  );
};

const StackFx: React.FC = () => (
  <Pop x={190} y={-330} at={100} rot={9}>
    <div style={{
      background: C.coral, color: "#fff", borderRadius: 26, padding: "16px 28px",
      fontFamily: FONT, fontWeight: 900, fontSize: 36, letterSpacing: 1,
      boxShadow: "0 24px 40px rgba(232,118,90,0.4)", display: "flex", alignItems: "center", gap: 12,
    }}>
      PASS ALL <Ico n="check" size={34} color="#fff" sw={3.6} />
    </div>
  </Pop>
);

/* ═══════════════ SCREEN 5 — results ═══════════════ */
const RESULTS = [
  {sym: "TATAPOWER", ini: "TP", price: "₹412.35", pct: "3.4", series: [380, 384, 382, 391, 396, 399, 404, 412], rsi: "61", y: 156, at: 10},
  {sym: "SBIN", ini: "SB", price: "₹842.10", pct: "2.2", series: [801, 806, 811, 808, 819, 826, 833, 842], rsi: "58", y: 370, at: 40},
  {sym: "LT", ini: "LT", price: "₹3,612", pct: "1.8", series: [3480, 3495, 3488, 3520, 3545, 3560, 3588, 3612], rsi: "64", y: 584, at: 70},
];

const ResCard: React.FC<(typeof RESULTS)[number]> = ({sym, ini, price, pct, series, rsi, y, at}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = sp(f, fps, at, 13, 120);
  const lo = Math.min(...series), hi = Math.max(...series);
  const d = series
    .map((v, i) => `${i ? "L" : "M"}${((i / 7) * 100).toFixed(1)},${(28 - ((v - lo) / (hi - lo)) * 26).toFixed(1)}`)
    .join(" ");
  const draw = interpolate(f - at, [10, 36], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
  const chips = [
    {t: `RSI ${rsi}`, n: "gauge", bg: C.blueBg, c: C.blue},
    {t: "50D", n: "up", bg: C.gainBg, c: C.gain},
    {t: "Vol", n: "bars", bg: C.coralBg, c: C.coral},
  ];
  return (
    <div style={{
      position: "absolute", left: 24, top: y, width: 364, height: 200, boxSizing: "border-box",
      borderRadius: 30, background: C.card, boxShadow: SOFT, border: `2px solid ${C.line}`,
      padding: "18px 20px", opacity: Math.min(1, s * 1.6),
      transform: `translateY(${(1 - s) * 60}px) scale(${0.94 + 0.06 * s})`,
    }}>
      <div style={{display: "flex", alignItems: "center", gap: 12}}>
        <div style={{
          width: 52, height: 52, borderRadius: 26, background: C.grey, fontWeight: 800, fontSize: 19,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          {ini}
        </div>
        <div style={{flex: 1, fontWeight: 800, fontSize: 25}}>{sym}</div>
        <div style={{textAlign: "right"}}>
          <div style={{fontWeight: 800, fontSize: 25, lineHeight: 1.1}}>{price}</div>
          <div style={{fontFamily: MONO, fontWeight: 700, fontSize: 18, color: C.gain}}>▲ {pct}%</div>
        </div>
      </div>
      <svg viewBox="0 0 100 30" preserveAspectRatio="none" style={{width: "100%", height: 54, marginTop: 10}}>
        <path d={`${d} L100,30 L0,30Z`} fill={C.gain} opacity={0.1 * draw} />
        <path d={d} fill="none" stroke={C.gain} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round"
          vectorEffect="non-scaling-stroke" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - draw} />
      </svg>
      <div style={{display: "flex", gap: 8, marginTop: 10}}>
        {chips.map((c) => (
          <div key={c.t} style={{
            background: c.bg, color: c.c, borderRadius: 14, padding: "5px 12px", display: "flex",
            alignItems: "center", gap: 6, fontFamily: MONO, fontWeight: 800, fontSize: 17,
          }}>
            <Ico n={c.n} size={17} color={c.c} sw={3} />
            {c.t}
          </div>
        ))}
      </div>
    </div>
  );
};

const ResultScreen: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  return (
    <>
      <AppBar />
      <div style={{position: "absolute", left: 24, top: 118, display: "flex", gap: 8}}>
        {Array.from({length: 12}).map((_, i) => {
          const s = sp(f, fps, 2 + i * 2, 11, 200);
          return <div key={i} style={{width: 22, height: 22, borderRadius: 11, background: C.gain, transform: `scale(${s})`}} />;
        })}
      </div>
      {RESULTS.map((r) => <ResCard key={r.sym} {...r} />)}
      <div style={{
        position: "absolute", left: 0, right: 0, top: 812, textAlign: "center",
        fontFamily: MONO, fontSize: 15, color: C.sub, letterSpacing: 1,
      }}>
        ILLUSTRATIVE DATA
      </div>
    </>
  );
};

const GaugeCard: React.FC<{at: number}> = ({at}) => {
  const f = useCurrentFrame();
  const g = interpolate(f - at, [4, 30], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
  const val = 61;
  const ang = -90 + (val / 100) * 180 * g;
  return (
    <div style={{
      width: 240, height: 210, borderRadius: 38, background: C.card, boxShadow: SHADOW,
      display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 22, boxSizing: "border-box",
      fontFamily: FONT,
    }}>
      <svg width={200} height={112} viewBox="0 0 200 112">
        <path d="M20 100A80 80 0 0 1 180 100" fill="none" stroke={C.line} strokeWidth={18} strokeLinecap="round" />
        <path d="M20 100A80 80 0 0 1 180 100" fill="none" stroke={C.blue} strokeWidth={18} strokeLinecap="round"
          pathLength={1} strokeDasharray={`${(val / 100) * g} 1`} />
        <line x1={100} y1={100} x2={100} y2={44} stroke={C.ink} strokeWidth={6} strokeLinecap="round"
          transform={`rotate(${ang} 100 100)`} />
        <circle cx={100} cy={100} r={9} fill={C.ink} />
      </svg>
      <div style={{fontSize: 48, fontWeight: 900, lineHeight: 1, marginTop: 6}}>{Math.round(val * g)}</div>
      <div style={{fontFamily: MONO, fontSize: 17, letterSpacing: 5, color: C.sub, marginTop: 6}}>RSI</div>
    </div>
  );
};

const TrendCard: React.FC<{at: number}> = ({at}) => {
  const f = useCurrentFrame();
  const d = interpolate(f - at, [4, 30], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
  return (
    <div style={{
      width: 240, height: 190, borderRadius: 38, background: C.card, boxShadow: SHADOW,
      position: "relative", boxSizing: "border-box", padding: 20,
    }}>
      <svg width={200} height={110} viewBox="0 0 200 110">
        <path d={linePath(MA, 200, 110, 60, 160, 6)} fill="none" stroke={C.coral} strokeWidth={5}
          strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - d} />
        <path d={linePath(PRICE, 200, 110, 60, 160, 6)} fill="none" stroke={C.blue} strokeWidth={6}
          strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - d} />
      </svg>
      <div style={{position: "absolute", right: 18, bottom: 16}}><CheckDot size={46} /></div>
      <div style={{position: "absolute", left: 20, bottom: 24, display: "flex", gap: 8}}>
        <div style={{width: 26, height: 8, borderRadius: 4, background: C.blue}} />
        <div style={{width: 26, height: 8, borderRadius: 4, background: C.coral}} />
      </div>
    </div>
  );
};

const VolCard: React.FC<{at: number}> = ({at}) => {
  const f = useCurrentFrame();
  const hs = [0.35, 0.45, 0.4, 0.55, 0.5, 1];
  return (
    <div style={{
      width: 240, height: 190, borderRadius: 38, background: C.card, boxShadow: SHADOW,
      display: "flex", alignItems: "flex-end", justifyContent: "center", gap: 12,
      padding: "28px 24px", boxSizing: "border-box",
    }}>
      {hs.map((h, i) => {
        const g = interpolate(f - at, [2 + i * 3, 16 + i * 3], [0, 1], {...clamp, easing: Easing.out(Easing.back(1.6))});
        return (
          <div key={i} style={{
            width: 24, height: 130 * h * g, borderRadius: 9,
            background: i === 5 ? C.coral : C.grey,
          }} />
        );
      })}
    </div>
  );
};

const ResultFx: React.FC = () => (
  <>
    <Pop x={255} y={40} at={68} rot={5}><TrendCard at={68} /></Pop>      {/* 578 */}
    <Pop x={-255} y={-170} at={130} rot={-5}><GaugeCard at={130} /></Pop> {/* 640 */}
    <Pop x={-255} y={270} at={182} rot={-4}><VolCard at={182} /></Pop>   {/* 692 */}
  </>
);

/* ═══════════════ SCREEN 6 — ready-made scanners ═══════════════ */
const TILES = [
  {x: 24, y: 130, icon: "up", col: C.blue, bg: C.blueBg, up: true, at: 6},
  {x: 214, y: 130, icon: "down", col: C.coral, bg: C.coralBg, up: false, at: 12},
  {x: 24, y: 320, icon: "chart", col: C.gain, bg: C.gainBg, up: true, at: 18},
  {x: 214, y: 320, icon: "bars", col: C.rust, bg: C.coralBg, up: true, at: 24},
];
const ROWS = [
  {s: "TATAPOWER", p: "+3.4"},
  {s: "SBIN", p: "+2.2"},
  {s: "LT", p: "+1.8"},
];

const ScanScreen: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const hit = f >= 40;
  const prog = interpolate(f, [42, 64], [0, 1], clamp);
  return (
    <>
      <AppBar />
      {TILES.map((t, i) => {
        const on = i === 0 && hit;
        return (
          <Rise key={i} at={t.at} dy={50} style={{position: "absolute", left: t.x, top: t.y, width: 174, height: 174}}>
            <div style={{
              width: "100%", height: "100%", boxSizing: "border-box", borderRadius: 30, padding: 18,
              background: on ? C.blueBg : C.card, border: `3px solid ${on ? C.blue : C.line}`, boxShadow: SOFT,
              display: "flex", flexDirection: "column", justifyContent: "space-between",
            }}>
              <Tile n={t.icon} size={64} bg={t.bg} color={t.col} />
              <svg width={130} height={36} viewBox="0 0 130 36">
                <path d={sparkPath(i * 11 + 2, t.up, 130, 36)} fill="none" stroke={t.col} strokeWidth={4}
                  strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {on && (
                <div style={{height: 8, borderRadius: 4, background: "rgba(47,106,140,0.2)", overflow: "hidden", marginTop: -4}}>
                  <div style={{width: `${prog * 100}%`, height: "100%", background: C.blue}} />
                </div>
              )}
            </div>
          </Rise>
        );
      })}
      {ROWS.map((r, i) => {
        const s = sp(f, fps, 62 + i * 8, 12, 160);
        return (
          <div key={r.s} style={{
            position: "absolute", left: 24, top: 520 + i * 82, width: 364, height: 70, boxSizing: "border-box",
            borderRadius: 24, background: C.card, border: `2px solid ${C.gain}`, boxShadow: SOFT,
            display: "flex", alignItems: "center", padding: "0 20px", gap: 14,
            opacity: Math.min(1, s * 1.6), transform: `translateY(${(1 - s) * 30}px)`,
          }}>
            <CheckDot size={34} />
            <div style={{flex: 1, fontWeight: 800, fontSize: 24}}>{r.s}</div>
            <div style={{fontFamily: MONO, fontWeight: 800, fontSize: 21, color: C.gain}}>{r.p}%</div>
          </div>
        );
      })}
      <Cursor pts={[{f: 0, x: 330, y: 730}, {f: 34, x: 110, y: 217}]} clicks={[40]} hideAt={60} />
    </>
  );
};

const ScanFx: React.FC = () => (
  <Pop x={200} y={-320} at={34} rot={10}>
    <div style={{
      background: C.blue, color: "#fff", borderRadius: 26, padding: "14px 26px", fontFamily: FONT,
      fontWeight: 900, fontSize: 34, letterSpacing: 1, display: "flex", alignItems: "center", gap: 10,
      boxShadow: "0 24px 40px rgba(47,106,140,0.35)",
    }}>
      <Ico n="bolt" size={32} color="#fff" sw={3} /> 1 TAP
    </div>
  </Pop>
);

/* ═══════════════ SCENE 7 — CTA ═══════════════ */
const Cta: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const logo = sp(f, fps, 0, 10, 140);
  const word = sp(f, fps, 10, 12, 130);
  const btn = sp(f, fps, 28, 12, 160);
  const pulse = 1 + 0.025 * Math.sin(f / 5);
  const orbit = [
    {n: "funnel", c: C.blue}, {n: "chart", c: C.gain}, {n: "gauge", c: C.coral},
    {n: "bars", c: C.rust}, {n: "check", c: C.gain}, {n: "bolt", c: C.blue},
  ];
  return (
    <div style={{position: "absolute", left: 0, top: 0, fontFamily: FONT}}>
      {orbit.map((o, i) => {
        const ang = (i / 6) * Math.PI * 2 + f * 0.016 - Math.PI / 2;
        const x = Math.cos(ang) * 320;
        const y = -130 + Math.sin(ang) * 170;
        const s = sp(f, fps, 6 + i * 4, 10, 150);
        return (
          <div key={i} style={{
            position: "absolute", left: x, top: y, width: 100, height: 100, borderRadius: 32,
            background: C.card, boxShadow: SHADOW, opacity: Math.min(1, s * 1.6),
            transform: `translate(-50%,-50%) scale(${0.5 + 0.5 * s})`,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Ico n={o.n} size={50} color={o.c} sw={2.6} />
          </div>
        );
      })}
      <div style={{
        position: "absolute", left: 0, top: -130, width: 190, height: 190,
        background: "transparent",
        display: "flex", alignItems: "center", justifyContent: "center",
        transform: `translate(-50%,-50%) scale(${0.5 + 0.5 * logo})`, opacity: Math.min(1, logo * 1.6),
      }}>
        <Img
          src="https://optionxi.com/assets/images/logo_xi.png"
          style={{width: 190, height: 190, objectFit: "contain"}}
        />
      </div>
      <div style={{
        position: "absolute", left: 0, top: 150, whiteSpace: "nowrap", fontSize: 104, fontWeight: 900,
        letterSpacing: -4, opacity: Math.min(1, word * 1.6),
        transform: `translate(-50%,-50%) translateY(${(1 - word) * 30}px)`,
      }}>
        Option<span style={{fontFamily: SERIF, fontStyle: "italic", fontWeight: 400, color: C.rust}}>Xi</span>
      </div>
      <div style={{
        position: "absolute", left: 0, top: 320, whiteSpace: "nowrap", background: C.blue, color: "#fff",
        borderRadius: 999, padding: "26px 52px", fontSize: 44, fontWeight: 800, display: "flex",
        alignItems: "center", gap: 16, boxShadow: "0 24px 44px rgba(47,106,140,0.35)",
        opacity: Math.min(1, btn * 1.6), transform: `translate(-50%,-50%) scale(${(0.8 + 0.2 * btn) * pulse})`,
      }}>
        Try Screener Pro <Ico n="arrow" size={40} color="#fff" sw={3} />
      </div>
      <div style={{
        position: "absolute", left: 0, top: 405, whiteSpace: "nowrap", fontFamily: MONO, fontSize: 17,
        letterSpacing: 1, color: C.sub, transform: "translate(-50%,-50%)", opacity: btn,
      }}>
        ILLUSTRATIVE DATA · NOT INVESTMENT ADVICE
      </div>
    </div>
  );
};

/* ═══════════════ CAPTIONS (only text layer) ═══════════════
   *word = italic serif accent · ~word = blue sans accent pill */
const CAPS = [
  {s: 0, e: 50, t: "Over *2,000* stocks."},
  {s: 50, e: 105, t: "Nobody has *time.*"},
  {s: 105, e: 150, t: "So stop *scrolling.*"},
  {s: 150, e: 210, t: "Let *rules* do the work."},
  {s: 210, e: 260, t: "Pick a *value.*"},
  {s: 260, e: 310, t: "Pick how to *compare.*"},
  {s: 310, e: 360, t: "In plain ~English."},
  {s: 360, e: 430, t: "Add more *rules.*"},
  {s: 430, e: 510, t: "Every stock must pass ~all."},
  {s: 510, e: 575, t: "Thousands become *twelve.*"},
  {s: 575, e: 635, t: "Each one *trending.*"},
  {s: 635, e: 690, t: "*Momentum* building."},
  {s: 690, e: 720, t: "Volume ~rising."},
  {s: 720, e: 760, t: "Where to *start?*"},
  {s: 760, e: 810, t: "Tap a ~scanner."},
  { s: 810, e: 900, t: "Right *stocks,* in ~seconds." },
];
const EXIT = 7;

const CapBlock: React.FC<{c: (typeof CAPS)[number]; f: number}> = ({c, f}) => {
  const lf = f - c.s;
  const dur = c.e - c.s;
  const words = c.t.split(" ");
  const step = Math.min(7, (dur * 0.5) / words.length);
  const ex = f >= c.e ? interpolate(f, [c.e, c.e + EXIT], [0, 1], clamp) : 0;
  return (
    <div style={{
      position: "absolute", left: 0, right: 0, top: 10, textAlign: "center", fontFamily: FONT,
      fontSize: 100, fontWeight: 800, letterSpacing: -3, lineHeight: 1.08, color: C.ink,
      opacity: 1 - ex, filter: `blur(${ex * 9}px)`, padding: "0 20px", boxSizing: "border-box",
    }}>
      {words.map((raw, i) => {
        const mode = raw[0] === "*" ? "serif" : raw[0] === "~" ? "blue" : "plain";
        const w = raw.replace(/^[*~]/, "").replace(/\*$/, "");
        const st = i * step;
        const p = interpolate(lf, [st, st + 9], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
        const base: React.CSSProperties = {
          display: "inline-block", marginRight: "0.26em", opacity: p,
          transform: `translateY(${(1 - p) * 20}px)`, filter: `blur(${(1 - p) * 6}px)`,
        };
        if (mode === "serif") {
          return (
            <span key={i} style={{...base, fontFamily: SERIF, fontStyle: "italic", fontWeight: 400, color: C.rust, fontSize: "1.14em", letterSpacing: -1}}>
              {w}
            </span>
          );
        }
        if (mode === "blue") {
          return (
            <span key={i} style={{...base, color: C.blue, background: "rgba(47,106,140,0.12)", borderRadius: 22, padding: "0 16px"}}>
              {w}
            </span>
          );
        }
        return <span key={i} style={base}>{w}</span>;
      })}
    </div>
  );
};

const Captions: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <SafeArea>
      {CAPS.filter((c) => f >= c.s && f < c.e + EXIT).map((c) => (
        <CapBlock key={c.s} c={c} f={f} />
      ))}
    </SafeArea>
  );
};

/* ═══════════════ PHONE RIG (persistent across beats) ═══════════════ */
const PhoneRig: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const enter = sp(f, fps, 0, 14, 90);
  const K = [0, 105, 210, 360, 510, 720, 810];
  const ease = {...clamp, easing: Easing.inOut(Easing.sin)};
  const ry = interpolate(f, K, [-16, 10, -8, 9, -10, 8, 0], ease);
  const rz = interpolate(f, K, [3, -2, 2, -2, 2, -1, 0], ease);
  const out = interpolate(f, [806, 830], [1, 0], clamp);
  const bob = Math.sin(f / 22) * 8;
  return (
    <div style={{
      position: "absolute", left: 0, top: 0, opacity: out * Math.min(1, enter * 1.5),
      transform: `translateY(${(1 - enter) * 160 + bob}px) perspective(2200px) rotateY(${ry}deg) rotateZ(${rz}deg) scale(${0.9 + 0.1 * enter - 0.06 * (1 - out)})`,
    }}>
      <Phone>
        <Sequence from={0} durationInFrames={111} layout="none">
          <Fade dur={111} inF={0}><ScrollScreen /></Fade>
        </Sequence>
        <Sequence from={105} durationInFrames={111} layout="none">
          <Fade dur={111}><StartScreen /></Fade>
        </Sequence>
        <Sequence from={210} durationInFrames={156} layout="none">
          <Fade dur={156}><BuildScreen /></Fade>
        </Sequence>
        <Sequence from={360} durationInFrames={156} layout="none">
          <Fade dur={156}><StackScreen /></Fade>
        </Sequence>
        <Sequence from={510} durationInFrames={216} layout="none">
          <Fade dur={216}><ResultScreen /></Fade>
        </Sequence>
        <Sequence from={720} durationInFrames={96} layout="none">
          <Fade dur={96}><ScanScreen /></Fade>
        </Sequence>
      </Phone>
    </div>
  );
};

const Fx: React.FC<{from: number; dur: number; children: React.ReactNode}> = ({from, dur, children}) => (
  <Sequence from={from} durationInFrames={dur} layout="none">
    <Fade dur={dur} inF={0} outF={8}>{children}</Fade>
  </Sequence>
);

/* ═══════════════ ROOT ═══════════════ */
const HERO_TOP = 300;
const HH = SAFE_H - HERO_TOP - 30;
const SCALE = Math.min(1.2, HH / 940);

const ReelScreenerPro: React.FC = () => (
  <AbsoluteFill style={{backgroundColor: C.bg}}>
    <Background />

    <SafeArea>
      <div style={{position: "absolute", left: 0, right: 0, top: HERO_TOP, bottom: 30}}>
        <div style={{
          position: "absolute", left: "50%", top: "50%", width: 0, height: 0,
          transform: `scale(${SCALE})`,
        }}>
          <PhoneRig />
          <Fx from={0} dur={105}><HookFx /></Fx>
          <Fx from={105} dur={105}><FunnelFx /></Fx>
          <Fx from={210} dur={150}><BuildFx /></Fx>
          <Fx from={360} dur={150}><StackFx /></Fx>
          <Fx from={510} dur={210}><ResultFx /></Fx>
          <Fx from={720} dur={90}><ScanFx /></Fx>
          <Sequence from={810} durationInFrames={90} layout="none">
            <Cta />
          </Sequence>
        </div>
      </div>
    </SafeArea>

    <Captions />
    {/* <SafeGuide /> */}
  </AbsoluteFill>
);

export default ReelScreenerPro;