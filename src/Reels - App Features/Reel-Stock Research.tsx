import React from 'react';
import {
  AbsoluteFill,
  Easing,
  Img,
  Sequence,
  interpolate,
  random,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import {getSafe, SafeArea as Safe, SafeGuide} from "../shared/safe-area";

export const config = {
  durationInFrames: 900,
  fps: 30,
  width: 1080,
  height: 1920,
};
const SAFE = getSafe(config);

const fontFamily =
  '"Poppins","Inter","SF Pro Display",system-ui,-apple-system,"Segoe UI",Roboto,sans-serif';

const C = {
  bg: '#0B0E17',
  white: '#FFFFFF',
  paper: '#F6F3EC',
  accent: '#FF7A1A',
  amber: '#FFC53D',
  green: '#3BD97F',
  red: '#FF5A66',
  mute: '#9AA1B8',
  line: 'rgba(246,243,236,0.14)',
};

const UI = {
  bg: '#FAF8F2',
  ink: '#14171F',
  mute: '#6E7280',
  line: '#E9E4D8',
  blue: '#1F3A93',
  blueBg: '#ECEEF7',
  green: '#16A34A',
  greenBg: '#E3F7EA',
  red: '#E5384F',
  redBg: '#FDE8EB',
  orange: '#FF6B35',
  amber: '#F5A524',
};

const LOGO = 'https://optionxi.com/assets/images/logo_xi.png';
const PLAY =
  'https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png';

const STEP_START = 135;
const STEP_LEN = 95;
const STEPS_END = STEP_START + STEP_LEN * 6;
const T = {
  hook: [0, 75],
  reveal: [75, 135],
  proof: [STEPS_END, 800],
  cta: [800, 900],
} as const;

const STEPS = [
  {n: '1.', title: 'Search', cap: 'Type a name. Find any stock.'},
  {n: '2.', title: 'See details', cap: 'Price, range, quick read.'},
  {n: '3.', title: 'Ask AI', cap: 'Explained in plain words.'},
  {n: '4.', title: 'Set alerts', cap: 'Pinged when high or low breaks.'},
  {n: '5.', title: 'Practice trade', cap: 'Practice money. Live profit.'},
  {n: '6.', title: 'Journal', cap: 'Save it. Learn from it.'},
];

const PH = {x: 210, y: 240, w: 480, h: 980, bez: 12};
const SW = PH.w - PH.bez * 2;
const SH = PH.h - PH.bez * 2;

const OUT = Easing.bezier(0.16, 1, 0.3, 1);
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

const prog = (f: number, a: number, b: number, easing: (t: number) => number = OUT) =>
  interpolate(f, [a, b], [0, 1], {...clamp, easing});

const pop = (f: number, at: number, cfg: Record<string, number> = {}) =>
  spring({
    frame: Math.max(0, f - at),
    fps: config.fps,
    config: {damping: 14, stiffness: 140, mass: 0.8, ...cfg},
  });

const useOut = (n = 8) => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  return prog(frame, durationInFrames - n, durationInFrames, Easing.in(Easing.quad));
};

const fill: React.CSSProperties = {position: 'absolute', left: 0, top: 0, width: '100%', height: '100%'};

const glass: React.CSSProperties = {
  background: 'linear-gradient(160deg, rgba(255,255,255,0.10), rgba(255,255,255,0.04))',
  border: `1px solid ${C.line}`,
  backdropFilter: 'blur(18px)',
  boxShadow: '0 20px 50px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.12)',
};

const card: React.CSSProperties = {
  background: '#fff',
  border: `1.5px solid ${UI.line}`,
  borderRadius: 32,
  boxShadow: '0 6px 20px rgba(20,30,80,0.06)',
};

const inr = (n: number, d = 2) =>
  '₹' + n.toLocaleString('en-IN', {minimumFractionDigits: d, maximumFractionDigits: d});

type Pt = {x: number; y: number};
const toPath = (p: Pt[]) => p.map((q, i) => `${i ? 'L' : 'M'}${q.x.toFixed(1)} ${q.y.toFixed(1)}`).join(' ');
const partial = (p: Pt[], t: number): Pt[] => {
  const k = Math.max(0, Math.min(1, t)) * (p.length - 1);
  const i = Math.floor(k);
  const fr = k - i;
  const out = p.slice(0, i + 1);
  if (i < p.length - 1) {
    out.push({x: p[i].x + (p[i + 1].x - p[i].x) * fr, y: p[i].y + (p[i + 1].y - p[i].y) * fr});
  }
  return out;
};

const ICONS: Record<string, string> = {
  arrow: 'M5 12h14M13 6l6 6-6 6',
  check: 'M5 12.5l4.5 4.5L19 7.5',
  warn: 'M12 7v6M12 17h.01',
  bell: 'M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 01-3.4 0',
  spark: 'M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z',
  cart: 'M3 4h2l2.4 11h10.2L20 7H6.2M9 20h.01M17 20h.01',
  up: 'M3 17l6-6 4 4 8-8M15 7h6v6',
  down: 'M3 7l6 6 4-4 8 8M15 17h6v-6',
  plus: 'M12 5v14M5 12h14',
  book: 'M5 4h11a3 3 0 013 3v13H8a3 3 0 01-3-3V4zM5 17a3 3 0 013-3h11',
};
const Icon: React.FC<{n: string; s?: number; c?: string; w?: number}> = ({n, s = 28, c = 'currentColor', w = 2.4}) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" style={{display: 'block'}}>
    {n === 'search' ? (
      <>
        <circle cx="11" cy="11" r="7" />
        <path d="M20 20l-3.5-3.5" />
      </>
    ) : (
      <path d={ICONS[n]} />
    )}
  </svg>
);

const Rise: React.FC<{at: number; children: React.ReactNode; style?: React.CSSProperties}> = ({at, children, style}) => {
  const frame = useCurrentFrame();
  const p = pop(frame, at, {damping: 18, stiffness: 120});
  return (
    <span style={{display: 'inline-block', overflow: 'hidden', verticalAlign: 'top', paddingBottom: '0.14em', ...style}}>
      <span style={{display: 'inline-block', transform: `translateY(${(1 - p) * 115}%)`}}>{children}</span>
    </span>
  );
};

const Grad: React.FC<{children: React.ReactNode}> = ({children}) => (
  <span style={{color: C.accent}}>{children}</span>
);

const Title: React.FC<{n: string; text: string}> = ({n, text}) => {
  const out = useOut(10);
  const words = text.split(' ');
  return (
    <div style={{position: 'absolute', top: 0, left: 0, width: SAFE.w, textAlign: 'center', fontSize: 88, fontWeight: 900, letterSpacing: -2, lineHeight: 1.12, opacity: 1 - out}}>
      <Rise at={0} style={{marginRight: 22}}>
        <Grad>{n}</Grad>
      </Rise>
      {words.map((w, i) => (
        <Rise key={w + i} at={3 + i * 3} style={{marginRight: i < words.length - 1 ? 22 : 0}}>
          {w}
        </Rise>
      ))}
    </div>
  );
};

const Cap: React.FC<{from: number; children: string}> = ({from, children}) => {
  const frame = useCurrentFrame();
  const q = useOut(8);
  if (frame < from) return null;
  const p = Math.min(pop(frame, from, {damping: 20, stiffness: 160}), 1);
  return (
    <div style={{position: 'absolute', top: 128, left: 0, width: SAFE.w, display: 'flex', justifyContent: 'center', transform: `translateY(${(1 - p) * 30 - q * 20}px)`, opacity: p * (1 - q)}}>
      <span style={{...glass, fontSize: 38, fontWeight: 700, color: C.white, padding: '10px 32px', borderRadius: 999}}>{children}</span>
    </div>
  );
};

const Background: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{background: C.bg}}>
      <div
        style={{
          ...fill,
          background: `radial-gradient(760px 760px at ${25 + Math.sin(frame / 70) * 8}% ${18 + Math.cos(frame / 90) * 5}%, ${C.accent}26, transparent 62%),
                       radial-gradient(820px 820px at ${82 + Math.cos(frame / 80) * 6}% ${86 + Math.sin(frame / 60) * 4}%, ${C.amber}14, transparent 62%)`,
        }}
      />
      <div
        style={{
          ...fill,
          opacity: 0.3,
          backgroundImage: `linear-gradient(${C.line} 1px, transparent 1px), linear-gradient(90deg, ${C.line} 1px, transparent 1px)`,
          backgroundSize: '90px 90px',
          backgroundPosition: `0px ${(frame * 0.8) % 90}px`,
          WebkitMaskImage: 'radial-gradient(ellipse at 50% 45%, #000 20%, transparent 75%)',
          maskImage: 'radial-gradient(ellipse at 50% 45%, #000 20%, transparent 75%)',
        }}
      />
    </AbsoluteFill>
  );
};

/* ================================================================== */
/* PHONE                                                               */
/* ================================================================== */
const Phone: React.FC<{children?: React.ReactNode}> = ({children}) => (
  <div
    style={{
      position: 'absolute', left: PH.x, top: PH.y, width: PH.w, height: PH.h, borderRadius: 76, padding: PH.bez,
      background: 'linear-gradient(160deg,#2A2F55,#0A0C1E)',
      boxShadow: `0 40px 90px rgba(0,0,0,.55), 0 0 0 2px rgba(255,255,255,.10), 0 0 120px ${C.accent}30`,
    }}
  >
    <div style={{position: 'relative', width: SW, height: SH, borderRadius: 64, overflow: 'hidden', background: UI.bg, fontFamily}}>
      {children}
      <div style={{position: 'absolute', top: 22, left: 40, fontSize: 20, fontWeight: 800, color: UI.ink, zIndex: 20}}>9:41</div>
      <div style={{position: 'absolute', top: 14, left: '50%', marginLeft: -62, width: 124, height: 34, borderRadius: 17, background: '#000', zIndex: 20}} />
    </div>
  </div>
);

const ScreenWrap: React.FC<{children: React.ReactNode}> = ({children}) => {
  const f = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const a = prog(f, 0, 8);
  const b = prog(f, durationInFrames - 8, durationInFrames, Easing.in(Easing.quad));
  return <div style={{...fill, opacity: a * (1 - b), transform: `translateY(${(1 - a) * 20 - b * 16}px)`}}>{children}</div>;
};

const Tap: React.FC<{at: number; x: number; y: number}> = ({at, x, y}) => {
  const f = useCurrentFrame();
  const appear = prog(f, at - 14, at - 3);
  const press = prog(f, at, at + 3) - prog(f, at + 3, at + 9);
  const ring = prog(f, at + 1, at + 22);
  const gone = prog(f, at + 14, at + 24);
  const fx = x + (1 - appear) * 70;
  const fy = y + (1 - appear) * 110;
  return (
    <div style={{...fill, pointerEvents: 'none', zIndex: 30}}>
      {f >= at && (
        <div
          style={{
            position: 'absolute', left: x, top: y, width: 30 + ring * 120, height: 30 + ring * 120, marginLeft: -(15 + ring * 60), marginTop: -(15 + ring * 60),
            borderRadius: '50%', border: `5px solid ${UI.blue}`, opacity: (1 - ring) * 0.8,
          }}
        />
      )}
      <div
        style={{
          position: 'absolute', left: fx - 32, top: fy - 32, width: 64, height: 64, borderRadius: '50%',
          background: 'rgba(25,30,70,0.30)', border: '4px solid #fff', boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
          transform: `scale(${1 - 0.2 * press})`, opacity: appear * (1 - gone),
        }}
      />
    </div>
  );
};

const Pill: React.FC<{bg: string; color: string; children: React.ReactNode; style?: React.CSSProperties}> = ({bg, color, children, style}) => (
  <span style={{display: 'inline-flex', alignItems: 'center', gap: 6, background: bg, color, fontWeight: 800, borderRadius: 999, padding: '6px 16px', fontSize: 22, ...style}}>
    {children}
  </span>
);

const Logo: React.FC<{l: string; col: string; s?: number}> = ({l, col, s = 64}) => (
  <div style={{width: s, height: s, borderRadius: s / 2, background: col, color: '#fff', fontWeight: 900, fontSize: s * 0.45, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>
    {l}
  </div>
);

/* ---------------- 1. SEARCH ---------------- */
const RES = [
  {s: 'TATASTEEL', n: 'Tata Steel Ltd', p: 162.4, c: 2.4, col: '#1F3A93'},
  {s: 'TATAMOTORS', n: 'Tata Motors Ltd', p: 785.3, c: -0.6, col: '#FF6B35'},
  {s: 'TATAPOWER', n: 'Tata Power Co', p: 398.1, c: 1.1, col: '#16A34A'},
  {s: 'TATACONSUM', n: 'Tata Consumer', p: 1084.6, c: 0.4, col: '#8B5CF6'},
  {s: 'TATAELXSI', n: 'Tata Elxsi', p: 5612, c: -1.3, col: '#E5384F'},
];

const SearchScreen: React.FC = () => {
  const f = useCurrentFrame();
  const n = Math.floor(prog(f, 8, 28, Easing.linear) * 4.999);
  const typed = 'TATA'.slice(0, n);
  const caret = Math.floor(f / 8) % 2 === 0 && f < 60;
  const picked = f >= 64;
  return (
    <div style={{...fill, background: UI.bg, padding: '76px 28px 0'}}>
      <div style={{height: 72, borderRadius: 36, background: '#fff', border: `2px solid ${UI.line}`, display: 'flex', alignItems: 'center', padding: '0 8px 0 24px', gap: 14, color: UI.mute}}>
        <Icon n="search" s={30} />
        <div style={{flex: 1, fontSize: 30, fontWeight: 800, color: typed ? UI.ink : UI.mute}}>
          {typed || 'Search stocks'}
          {caret && <span style={{color: UI.blue}}>|</span>}
        </div>
        <div style={{width: 56, height: 56, borderRadius: 28, background: UI.ink, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <Icon n="arrow" s={28} />
        </div>
      </div>
      <div style={{marginTop: 24}}>
        {RES.map((r, i) => {
          const p = f < 30 ? 0 : Math.min(pop(f, 30 + i * 4, {damping: 16}), 1);
          const sel = i === 0 && picked;
          return (
            <div
              key={r.s}
              style={{
                ...card, height: 108, marginBottom: 14, padding: '0 22px', display: 'flex', alignItems: 'center', gap: 18,
                opacity: p, transform: `translateY(${(1 - p) * 40}px)`,
                border: sel ? `3px solid ${UI.blue}` : card.border, background: sel ? UI.blueBg : '#fff',
              }}
            >
              <Logo l={r.s[4]} col={r.col} />
              <div style={{flex: 1}}>
                <div style={{fontSize: 28, fontWeight: 900, color: UI.ink}}>{r.s}</div>
                <div style={{fontSize: 20, color: UI.mute, fontWeight: 600}}>{r.n}</div>
              </div>
              <div style={{textAlign: 'right'}}>
                <div style={{fontSize: 26, fontWeight: 800, color: UI.ink}}>{inr(r.p, 1)}</div>
                <div style={{fontSize: 20, fontWeight: 800, color: r.c >= 0 ? UI.green : UI.red}}>
                  {r.c >= 0 ? '+' : ''}
                  {r.c}%
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <Tap at={62} x={228} y={226} />
    </div>
  );
};

/* ---------------- 2. DETAILS ---------------- */
const SPARK = Array.from({length: 28}, (_, i): Pt => {
  const t = i / 27;
  return {x: t * 344, y: 110 * (0.8 - 0.65 * t + (random(`sp${i}`) - 0.5) * 0.22)};
});

const DetailsScreen: React.FC = () => {
  const f = useCurrentFrame();
  const price = 150 + 12.4 * prog(f, 6, 30);
  const t = prog(f, 8, 36, Easing.linear);
  const head = partial(SPARK, t);
  const dotP = prog(f, 34, 58);
  const rows = [
    {ok: true, t: 'Price is up today'},
    {ok: false, t: 'Buying ran hot, may cool'},
    {ok: true, t: 'Above its 20-day average'},
  ];
  return (
    <div style={{...fill, background: UI.bg, padding: '76px 28px 0'}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 16, height: 64}}>
        <Logo l="T" col="#1F3A93" />
        <div>
          <div style={{fontSize: 30, fontWeight: 900, color: UI.ink}}>TATASTEEL</div>
          <div style={{fontSize: 20, fontWeight: 600, color: UI.mute}}>Tata Steel Ltd · NSE</div>
        </div>
      </div>
      <div style={{...card, marginTop: 24, padding: 28}}>
        <div style={{fontSize: 74, lineHeight: '80px', fontWeight: 900, color: UI.ink, letterSpacing: -2}}>{inr(price)}</div>
        <div style={{display: 'flex', alignItems: 'center', gap: 12, marginTop: 10, height: 40}}>
          <Pill bg={UI.greenBg} color={UI.green}>
            <Icon n="up" s={20} w={3} /> +2.4%
          </Pill>
          <span style={{fontSize: 22, color: UI.mute, fontWeight: 600}}>Higher than yesterday</span>
        </div>
        <svg width={344} height={110} style={{display: 'block', marginTop: 14, overflow: 'visible'}}>
          <defs>
            <linearGradient id="spk" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={UI.green} stopOpacity={0.28} />
              <stop offset="100%" stopColor={UI.green} stopOpacity={0} />
            </linearGradient>
          </defs>
          <path d={`${toPath(head)} L${head[head.length - 1].x} 110 L0 110 Z`} fill="url(#spk)" />
          <path d={toPath(head)} fill="none" stroke={UI.green} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" />
          <circle cx={head[head.length - 1].x} cy={head[head.length - 1].y} r={9} fill="#fff" stroke={UI.green} strokeWidth={5} />
        </svg>
        <div style={{marginTop: 18, fontSize: 22, fontWeight: 700, color: UI.mute}}>Today's range</div>
        <div style={{position: 'relative', height: 14, marginTop: 14, borderRadius: 7, background: UI.line}}>
          <div style={{position: 'absolute', left: 0, top: 0, height: 14, borderRadius: 7, width: `${78 * dotP}%`, background: UI.green, opacity: 0.6}} />
          <div style={{position: 'absolute', top: -7, left: `calc(${78 * dotP}% - 14px)`, width: 28, height: 28, borderRadius: 14, background: '#fff', border: `6px solid ${UI.green}`}} />
        </div>
        <div style={{display: 'flex', justifyContent: 'space-between', marginTop: 14, fontSize: 22, fontWeight: 800, color: UI.ink}}>
          <span>Low {inr(158.1)}</span>
          <span>High {inr(163.9)}</span>
        </div>
      </div>
      <div style={{...card, marginTop: 18, padding: '22px 28px'}}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
          <span style={{fontSize: 30, fontWeight: 900, color: UI.ink}}>Quick read</span>
          <span style={{opacity: prog(f, 44, 52)}}>
            <Pill bg={UI.greenBg} color={UI.green}>Leaning positive</Pill>
          </span>
        </div>
        {rows.map((r, i) => {
          const p = f < 46 ? 0 : Math.min(pop(f, 46 + i * 7, {damping: 12}), 1.1);
          return (
            <div key={r.t} style={{display: 'flex', alignItems: 'center', gap: 14, height: 56, opacity: Math.min(p, 1), transform: `translateX(${(1 - Math.min(p, 1)) * 30}px)`}}>
              <div style={{width: 36, height: 36, borderRadius: 18, background: r.ok ? UI.green : UI.amber, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${p})`}}>
                <Icon n={r.ok ? 'check' : 'warn'} s={22} w={3.2} />
              </div>
              <span style={{fontSize: 24, fontWeight: 600, color: UI.ink}}>{r.t}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ---------------- 3. AI ---------------- */
const AIScreen: React.FC = () => {
  const f = useCurrentFrame();
  const sp = spring({frame: Math.max(0, f - 12), fps: config.fps, config: {damping: 9, stiffness: 70, mass: 1}});
  const angle = -90 + 148 * sp + (sp > 0.9 ? Math.sin(f / 3) * 1.6 : 0);
  const txt = prog(f, 40, 52);
  const reasons = [
    {i: 'up', t: 'Near its 30-day high'},
    {i: 'check', t: '4 chart scanners positive'},
    {i: 'spark', t: 'Strong buying volume'},
  ];
  return (
    <div style={{...fill, background: UI.bg, padding: '76px 28px 0'}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 14, height: 64}}>
        <div style={{width: 56, height: 56, borderRadius: 28, background: UI.ink, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <Icon n="spark" s={30} w={2.6} />
        </div>
        <span style={{fontSize: 38, fontWeight: 900, color: UI.ink}}>Ask AI</span>
      </div>
      <div style={{marginTop: 22, padding: 28, borderRadius: 36, background: '#EAF7F1', border: '2px solid #BFE5D2'}}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 24, fontWeight: 700, color: UI.mute}}>
          <span>TATASTEEL</span>
          <span style={{display: 'flex', gap: 10, alignItems: 'center'}}>
            <b style={{color: UI.ink}}>{inr(162.4)}</b>
            <Pill bg="#CDEFDD" color={UI.green} style={{fontSize: 20, padding: '4px 12px'}}>+2.4%</Pill>
          </span>
        </div>
        <svg width={344} height={196} viewBox="0 0 344 196" style={{display: 'block', marginTop: 8}}>
          <defs>
            <linearGradient id="gauge" gradientUnits="userSpaceOnUse" x1="42" y1="0" x2="302" y2="0">
              <stop offset="0%" stopColor="#E5484D" />
              <stop offset="50%" stopColor="#F5A524" />
              <stop offset="100%" stopColor="#16A34A" />
            </linearGradient>
          </defs>
          <path d="M42 172 A130 130 0 0 1 302 172" fill="none" stroke="url(#gauge)" strokeWidth={26} strokeLinecap="round" />
          <g transform={`rotate(${angle} 172 172)`}>
            <line x1={172} y1={172} x2={172} y2={74} stroke={UI.ink} strokeWidth={9} strokeLinecap="round" />
          </g>
          <circle cx={172} cy={172} r={16} fill={UI.ink} />
          <circle cx={172} cy={172} r={6} fill="#fff" />
        </svg>
        <div style={{display: 'flex', justifyContent: 'space-between', fontSize: 22, fontWeight: 800, marginTop: -2}}>
          <span style={{color: UI.red}}>Falling</span>
          <span style={{color: UI.green}}>Rising</span>
        </div>
        <div style={{textAlign: 'center', marginTop: 16, opacity: txt, transform: `translateY(${(1 - txt) * 20}px)`}}>
          <div style={{fontSize: 38, fontWeight: 900, color: UI.ink, lineHeight: 1.1}}>Looks strong for buyers</div>
          <div style={{fontSize: 22, color: UI.mute, fontWeight: 600, marginTop: 8}}>The AI is fairly sure</div>
        </div>
      </div>
      <div style={{fontSize: 28, fontWeight: 900, color: UI.ink, margin: '24px 4px 12px', opacity: prog(f, 50, 58)}}>Why it looks this way</div>
      {reasons.map((r, i) => {
        const p = f < 54 ? 0 : Math.min(pop(f, 54 + i * 7, {damping: 14}), 1);
        return (
          <div key={r.t} style={{...card, height: 80, marginBottom: 12, padding: '0 20px', display: 'flex', alignItems: 'center', gap: 16, opacity: p, transform: `translateY(${(1 - p) * 30}px)`, borderRadius: 26}}>
            <div style={{width: 48, height: 48, borderRadius: 14, background: UI.greenBg, color: UI.green, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
              <Icon n={r.i} s={26} w={2.8} />
            </div>
            <span style={{fontSize: 26, fontWeight: 800, color: UI.ink}}>{r.t}</span>
          </div>
        );
      })}
    </div>
  );
};

/* ---------------- 4. ALERTS ---------------- */
const AW = 344;
const AH = 330;
const HY = 95;
const LY = 288;
const AN = 48;
const APTS = Array.from({length: AN}, (_, i): Pt => {
  const t = i / (AN - 1);
  return {x: t * AW, y: AH * (0.74 - 0.6 * Math.pow(t, 1.25)) + (random(`al${i}`) - 0.5) * 14};
});
const TC = (() => {
  const k = APTS.findIndex((p) => p.y <= HY);
  return (k < 0 ? AN - 1 : k) / (AN - 1);
})();
const A_START = 16;
const A_LEN = 50;
const BREAK_F = Math.ceil(A_START + A_LEN * TC);

const AlertsScreen: React.FC = () => {
  const f = useCurrentFrame();
  const t = prog(f, A_START, A_START + A_LEN, Easing.linear);
  const head = partial(APTS, t);
  const h = head[head.length - 1];
  const lines = prog(f, 4, 16);
  const broke = f >= BREAK_F;
  const bp = broke ? Math.min(pop(f, BREAK_F, {damping: 13}), 1) : 0;
  const flash = broke ? Math.max(0, 1 - (f - BREAK_F) / 14) : 0;
  const ring = broke ? prog(f, BREAK_F, BREAK_F + 18) : 0;
  const shake = broke ? Math.sin((f - BREAK_F) * 1.6) * 16 * Math.max(0, 1 - (f - BREAK_F) / 26) : 0;
  const shownPrice = 158 + 4.4 * t;
  return (
    <div style={{...fill, background: UI.bg, padding: '76px 28px 0'}}>
      <div style={{height: 64}}>
        <div style={{fontSize: 42, fontWeight: 900, color: UI.ink, lineHeight: 1}}>Alerts</div>
        <div style={{fontSize: 22, fontWeight: 600, color: UI.mute, marginTop: 6}}>Watching 1 stock</div>
      </div>
      <div style={{...card, marginTop: 22, padding: '22px 28px 20px'}}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 28, fontWeight: 900, color: UI.ink}}>
          <span>TATASTEEL</span>
          <span>{inr(shownPrice)}</span>
        </div>
        <svg width={AW} height={AH} style={{display: 'block', marginTop: 8, overflow: 'visible'}}>
          <line x1={0} y1={HY} x2={AW * lines} y2={HY} stroke={UI.green} strokeWidth={4 + flash * 6} strokeDasharray="10 8" strokeLinecap="round" />
          <line x1={0} y1={LY} x2={AW * lines} y2={LY} stroke={UI.red} strokeWidth={4} strokeDasharray="10 8" strokeLinecap="round" />
          <g opacity={lines}>
            <text x={0} y={HY - 12} fontSize={21} fontWeight={800} fill={UI.green}>Alert if above ₹165</text>
            <text x={0} y={LY + 28} fontSize={21} fontWeight={800} fill={UI.red}>Alert if below ₹155</text>
          </g>
          <path d={toPath(head)} fill="none" stroke={UI.blue} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" />
          {broke && <circle cx={h.x} cy={h.y} r={14 + ring * 50} fill="none" stroke={UI.green} strokeWidth={5} opacity={1 - ring} />}
          <circle cx={h.x} cy={h.y} r={10} fill="#fff" stroke={broke ? UI.green : UI.blue} strokeWidth={6} />
        </svg>
      </div>
      {[
        {t: 'Crosses today\'s high', col: UI.green},
        {t: 'Drops below today\'s low', col: UI.red},
      ].map((r, i) => {
        const hit = i === 0 && broke;
        const p = Math.min(pop(f, 26 + i * 6, {damping: 16}), 1);
        return (
          <div key={r.t} style={{...card, height: 88, marginTop: 14, padding: '0 22px', display: 'flex', alignItems: 'center', gap: 16, borderRadius: 26, borderLeft: `10px solid ${r.col}`, opacity: p, transform: `translateY(${(1 - p) * 30}px)`}}>
            <div style={{flex: 1}}>
              <div style={{fontSize: 26, fontWeight: 900, color: UI.ink}}>{r.t}</div>
              <div style={{fontSize: 21, fontWeight: 800, color: hit ? UI.green : UI.blue, marginTop: 2}}>{hit ? 'Target hit' : 'Checking now...'}</div>
            </div>
            {hit && (
              <div style={{width: 44, height: 44, borderRadius: 22, background: UI.green, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${bp})`}}>
                <Icon n="check" s={26} w={3.2} />
              </div>
            )}
          </div>
        );
      })}
      {broke && (
        <div style={{position: 'absolute', left: 20, right: 20, top: 60, zIndex: 25, transform: `translateY(${(1 - bp) * -170}px)`}}>
          <div style={{background: 'rgba(255,255,255,0.97)', borderRadius: 30, padding: '18px 22px', display: 'flex', alignItems: 'center', gap: 16, boxShadow: '0 20px 50px rgba(10,20,60,0.30)', border: `1.5px solid ${UI.line}`}}>
            <div style={{width: 62, height: 62, borderRadius: 18, background: UI.orange, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `rotate(${shake}deg)`}}>
              <Icon n="bell" s={34} w={2.6} />
            </div>
            <div>
              <div style={{fontSize: 25, fontWeight: 900, color: UI.ink}}>TATASTEEL crossed the high</div>
              <div style={{fontSize: 20, fontWeight: 600, color: UI.mute}}>OptionXi · just now</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* ---------------- 5. BASKET ---------------- */
const BasketScreen: React.FC = () => {
  const f = useCurrentFrame();
  const added = f >= 18;
  const p = added ? Math.min(pop(f, 18, {damping: 16}), 1) : 0;
  const lf = Math.max(0, f - 18);
  const price = 162.4 + Math.sin(lf / 4) * 0.28 + lf * 0.012;
  const running = (price - 158) * 10;
  const booked = 568;
  const overall = (booked + running) * prog(f, 18, 44);
  const pct = Math.max(0, Math.min(1, (price - 152) / 18));
  const press = prog(f, 14, 16) - prog(f, 16, 21);
  const pulse = 0.5 + 0.5 * Math.sin(f / 4);
  return (
    <div style={{...fill, background: UI.bg, padding: '76px 28px 0'}}>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: 56}}>
        <span style={{fontSize: 38, fontWeight: 900, color: UI.ink}}>Live portfolio</span>
        {added && (
          <span style={{display: 'flex', alignItems: 'center', gap: 8, fontSize: 22, fontWeight: 900, color: UI.red}}>
            <span style={{width: 14, height: 14, borderRadius: 7, background: UI.red, opacity: 0.4 + 0.6 * pulse}} /> LIVE
          </span>
        )}
      </div>
      {!added && (
        <div style={{position: 'absolute', left: 0, right: 0, top: 300, textAlign: 'center', opacity: 1 - prog(f, 14, 20), color: UI.mute}}>
          <div style={{display: 'flex', justifyContent: 'center', marginBottom: 18}}>
            <Icon n="cart" s={96} w={1.6} />
          </div>
          <div style={{fontSize: 30, fontWeight: 800}}>Basket is empty</div>
        </div>
      )}
      {added && (
        <div style={{opacity: p, transform: `translateY(${(1 - p) * 60}px)`}}>
          <div style={{marginTop: 18, padding: 28, borderRadius: 36, background: UI.greenBg, border: '2px solid #9ED9B8'}}>
            <div style={{fontSize: 22, fontWeight: 700, color: UI.mute}}>Overall profit / loss</div>
            <div style={{fontSize: 70, fontWeight: 900, color: UI.green, letterSpacing: -2, lineHeight: '84px'}}>+{inr(overall)}</div>
            <div style={{display: 'flex', gap: 12, marginTop: 6}}>
              <Pill bg="rgba(255,255,255,0.65)" color={UI.green} style={{fontSize: 20}}>Running +{inr(running)}</Pill>
              <Pill bg="rgba(255,255,255,0.65)" color={UI.green} style={{fontSize: 20}}>Booked +{inr(booked, 0)}</Pill>
            </div>
          </div>
          <div style={{...card, marginTop: 18, padding: 26}}>
            <div style={{display: 'flex', alignItems: 'center', gap: 14}}>
              <Logo l="T" col="#1F3A93" s={56} />
              <div style={{flex: 1}}>
                <div style={{fontSize: 28, fontWeight: 900, color: UI.ink}}>TATASTEEL</div>
                <Pill bg={UI.greenBg} color={UI.green} style={{fontSize: 18, padding: '2px 12px'}}>Bought · 10 shares</Pill>
              </div>
              <div style={{textAlign: 'right'}}>
                <div style={{fontSize: 18, color: UI.mute, fontWeight: 600}}>Price now</div>
                <div style={{fontSize: 32, fontWeight: 900, color: UI.ink}}>{inr(price)}</div>
              </div>
            </div>
            <div style={{marginTop: 18, padding: '14px 20px', borderRadius: 24, background: UI.greenBg, display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
              <div>
                <div style={{fontSize: 20, fontWeight: 700, color: UI.green}}>You're up</div>
                <div style={{fontSize: 46, fontWeight: 900, color: UI.green, lineHeight: 1.1}}>{inr(running)}</div>
              </div>
              <Pill bg="#C9EEDA" color={UI.green}>+{((price / 158 - 1) * 100).toFixed(1)}%</Pill>
            </div>
            <div style={{marginTop: 22, fontSize: 18, letterSpacing: 2, fontWeight: 800, color: UI.mute}}>YOUR PLAN</div>
            <div style={{position: 'relative', height: 14, borderRadius: 7, marginTop: 14, background: `linear-gradient(90deg,${UI.red},#E7D7F5,${UI.green})`, opacity: 0.85}}>
              <div style={{position: 'absolute', top: -8, left: `calc(${pct * 100}% - 15px)`, width: 30, height: 30, borderRadius: 15, background: '#fff', border: `7px solid ${UI.blue}`}} />
            </div>
            <div style={{display: 'flex', justifyContent: 'space-between', marginTop: 14, fontSize: 21, fontWeight: 800}}>
              <span style={{color: UI.red}}>Safety exit {inr(152)}</span>
              <span style={{color: UI.green}}>Goal {inr(170)}</span>
            </div>
          </div>
        </div>
      )}
      <div
        style={{
          position: 'absolute', left: 28, right: 28, bottom: 28, height: 96, borderRadius: 32, background: added ? UI.green : UI.blue, color: '#fff',
          display: 'flex', alignItems: 'center', gap: 16, padding: '0 24px', transform: `scale(${1 - 0.04 * press})`, boxShadow: `0 14px 30px ${added ? UI.green : UI.blue}55`,
        }}
      >
        <div style={{width: 56, height: 56, borderRadius: 16, background: 'rgba(255,255,255,0.22)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <Icon n={added ? 'check' : 'plus'} s={30} w={3} />
        </div>
        <div>
          <div style={{fontSize: 28, fontWeight: 900}}>{added ? 'Added to basket' : 'Add to virtual basket'}</div>
          <div style={{fontSize: 20, fontWeight: 600, opacity: 0.85}}>Practice only · no real money</div>
        </div>
      </div>
      <Tap at={14} x={228} y={880} />
    </div>
  );
};

/* ---------------- 6. JOURNAL ---------------- */
const WINS = [5, 12, 19];
const NEW_CELL = 24;
const NOTE = 'Broke the high. I waited. Exited at goal.';

const JournalScreen: React.FC = () => {
  const f = useCurrentFrame();
  const flight = prog(f, 22, 44, Easing.in(Easing.cubic));
  const landed = f >= 44;
  const toast = pop(f, 2, {damping: 16});
  const toastOut = prog(f, 44, 48);
  const lp = landed ? prog(f, 44, 56) : 0;
  const wins = prog(f, 44, 60);
  const booked = 568 + 44 * wins;
  const typed = NOTE.slice(0, Math.floor(prog(f, 58, 90, Easing.linear) * NOTE.length));
  const btnPulse = 1 + Math.sin(f / 4) * 0.03 * prog(f, 70, 80);
  return (
    <div style={{...fill, background: UI.bg}}>
      <div style={{position: 'absolute', left: 28, top: 76, fontSize: 36, fontWeight: 900, color: UI.ink}}>Your trading report</div>
      <div style={{position: 'absolute', left: 28, top: 138, width: 400, height: 190, borderRadius: 36, background: UI.greenBg, border: '2px solid #9ED9B8', padding: '22px 28px'}}>
        <div style={{fontSize: 21, fontWeight: 700, color: UI.mute}}>Booked profit · last 30 days</div>
        <div style={{fontSize: 68, fontWeight: 900, color: UI.green, letterSpacing: -2, lineHeight: '84px'}}>+{inr(booked, 0)}</div>
        <div style={{height: 12, borderRadius: 6, background: UI.green, width: `${100 * prog(f, 4, 24)}%`}} />
        <div style={{fontSize: 20, fontWeight: 800, color: UI.green, marginTop: 8}}>{landed ? '4' : '3'} made money · 0 lost</div>
      </div>
      <div style={{...card, position: 'absolute', left: 28, top: 346, width: 400, height: 344}}>
        <div style={{position: 'absolute', left: 26, top: 22, right: 26, display: 'flex', justifyContent: 'space-between', fontSize: 26, fontWeight: 900, color: UI.ink}}>
          <span>Your trading days</span>
          <span style={{display: 'flex', gap: 8, alignItems: 'center', fontSize: 18, color: UI.mute, fontWeight: 700}}>
            <span style={{width: 12, height: 12, borderRadius: 6, background: UI.green}} /> Profit
          </span>
        </div>
        <div style={{position: 'absolute', left: 29, top: 76, width: 342, height: 242}}>
          {Array.from({length: 35}, (_, i) => {
            const col = i % 7;
            const row = Math.floor(i / 7);
            const base = Math.min(pop(f, 4 + (row + col) * 1.2, {damping: 14}), 1);
            const isWin = WINS.includes(i);
            const isNew = i === NEW_CELL;
            let bg = '#E8EBF3';
            if (isWin) bg = '#A9E5C1';
            if (isNew && landed) bg = UI.green;
            return (
              <div
                key={i}
                style={{
                  position: 'absolute', left: col * 50, top: row * 50, width: 42, height: 42, borderRadius: 11, background: bg,
                  transform: `scale(${base * (isNew && landed ? 1 + 0.25 * Math.sin(Math.min(1, lp) * Math.PI) : 1)})`,
                }}
              />
            );
          })}
          {landed && <div style={{position: 'absolute', left: 3 * 50 + 21 - (20 + lp * 50), top: 3 * 50 + 21 - (20 + lp * 50), width: 40 + lp * 100, height: 40 + lp * 100, borderRadius: '50%', border: `4px solid ${UI.green}`, opacity: 1 - lp}} />}
        </div>
      </div>
      <div style={{...card, position: 'absolute', left: 28, top: 708, width: 400, height: 200, padding: '20px 26px', opacity: prog(f, 50, 60), transform: `translateY(${(1 - prog(f, 50, 60)) * 30}px)`}}>
        <div style={{fontSize: 20, fontWeight: 800, color: UI.mute}}>Why I took this trade</div>
        <div style={{fontSize: 27, fontWeight: 800, color: UI.ink, marginTop: 8, lineHeight: 1.25, minHeight: 68}}>{typed}</div>
        <div style={{position: 'absolute', right: 22, bottom: 16, transform: `scale(${btnPulse})`}}>
          <span style={{display: 'inline-flex', alignItems: 'center', gap: 8, background: UI.ink, color: '#fff', fontWeight: 900, fontSize: 24, padding: '10px 22px', borderRadius: 999}}>
            <Icon n="spark" s={24} w={2.6} /> Add journal
          </span>
        </div>
      </div>
      {f < 50 && (
        <div
          style={{
            position: 'absolute', left: 228 - 150, top: 62 + (593 - 62) * flight, width: 300, zIndex: 25,
            transform: `translateY(${(1 - toast) * -120}px) scale(${1 - 0.85 * flight})`, opacity: (1 - toastOut) * Math.min(toast, 1),
          }}
        >
          <div style={{background: UI.ink, color: '#fff', borderRadius: 999, padding: '12px 22px', display: 'flex', alignItems: 'center', gap: 12, fontSize: 24, fontWeight: 800, boxShadow: '0 16px 40px rgba(10,20,60,0.35)'}}>
            <span style={{width: 34, height: 34, borderRadius: 17, background: UI.green, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
              <Icon n="check" s={20} w={3.4} />
            </span>
            Exited +{inr(44, 0)}
          </div>
        </div>
      )}
    </div>
  );
};

const SCREENS = [SearchScreen, DetailsScreen, AIScreen, AlertsScreen, BasketScreen, JournalScreen];

const PhoneLayer: React.FC = () => {
  const frame = useCurrentFrame();
  if (frame < STEP_START - 10 || frame > STEPS_END) return null;
  const inP = pop(frame, STEP_START - 8, {damping: 16, stiffness: 110});
  const outP = prog(frame, STEPS_END - 12, STEPS_END, Easing.in(Easing.cubic));
  const float = Math.sin(frame / 22) * 6;
  return (
    <div
      style={{
        ...fill,
        opacity: (1 - outP) * Math.min(1, inP * 1.5),
        transform: `translateY(${(1 - inP) * 900 - outP * 220 + float}px) scale(${0.92 + 0.08 * Math.min(inP, 1)}) rotate(${(1 - Math.min(inP, 1)) * -6}deg)`,
        transformOrigin: '50% 60%',
      }}
    >
      <Phone>
        {SCREENS.map((Screen, i) => (
          <Sequence key={i} from={STEP_START + i * STEP_LEN} durationInFrames={STEP_LEN}>
            <ScreenWrap>
              <Screen />
            </ScreenWrap>
          </Sequence>
        ))}
      </Phone>
    </div>
  );
};

const StepDots: React.FC = () => {
  const frame = useCurrentFrame();
  if (frame < STEP_START || frame > STEPS_END) return null;
  const active = Math.min(5, Math.floor((frame - STEP_START) / STEP_LEN));
  const op = prog(frame, STEP_START, STEP_START + 10) * (1 - prog(frame, STEPS_END - 10, STEPS_END));
  return (
    <div style={{position: 'absolute', left: 0, top: 1250, width: SAFE.w, display: 'flex', justifyContent: 'center', gap: 14, opacity: op}}>
      {STEPS.map((_, i) => (
        <div key={i} style={{width: i === active ? 56 : 16, height: 16, borderRadius: 8, background: i === active ? C.accent : 'rgba(246,243,236,0.22)'}} />
      ))}
    </div>
  );
};

/* ================================================================== */
/* SCENES                                                              */
/* ================================================================== */
const NAMES = ['RELIANCE', 'TCS', 'INFY', 'HDFCBANK', 'SBIN', 'ITC', 'LT', 'WIPRO', 'AXISBANK', 'MARUTI', 'CIPLA', 'ONGC'];
const MESS = Array.from({length: 36}, (_, i): Pt => ({x: (i / 35) * 900, y: 250 + (random(`ms${i}`) - 0.5) * 460 + Math.sin(i * 1.7) * 60}));

const Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const out = useOut(8);
  const sub = Math.min(pop(frame, 38, {damping: 18}), 1);
  const line = partial(MESS, prog(frame, 0, 40, Easing.linear));
  return (
    <Safe>
      <svg width={SAFE.w} height={500} style={{position: 'absolute', left: 0, top: 650, opacity: 0.5 * (1 - out)}}>
        <path d={toPath(line)} fill="none" stroke={C.red} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {NAMES.map((n, i) => {
        const p = Math.min(pop(frame, 2 + i * 2, {damping: 12}), 1);
        const up = random(`n${i}`) > 0.45;
        return (
          <div
            key={n}
            style={{
              ...glass, position: 'absolute', left: random(`x${i}`) * 700, top: 40 + random(`y${i}`) * 1100, padding: '10px 18px', borderRadius: 16,
              fontSize: 24, fontWeight: 700, opacity: 0.4 * p * (1 - out), transform: `scale(${p}) translateY(${Math.sin((frame + i * 9) / 10) * 8}px)`, filter: 'blur(1.5px)',
            }}
          >
            {n} <span style={{color: up ? C.green : C.red}}>{up ? '+' : '-'}{(random(`v${i}`) * 4).toFixed(1)}%</span>
          </div>
        );
      })}
      <div style={{position: 'absolute', top: 360, width: SAFE.w, textAlign: 'center', opacity: 1 - out, transform: `scale(${1 + out * 0.08})`}}>
        <div style={{fontSize: 130, fontWeight: 900, lineHeight: 1.04, letterSpacing: -4}}>
          <Rise at={0}>Stock research</Rise>
          <br />
          <Rise at={6} style={{color: C.red}}>feels messy.</Rise>
        </div>
        <div style={{marginTop: 50, fontSize: 60, fontWeight: 800, transform: `translateY(${(1 - sub) * 60}px)`, opacity: sub}}>
          <Grad>Let&apos;s make it simple.</Grad>
        </div>
      </div>
    </Safe>
  );
};

const RevealScene: React.FC = () => {
  const frame = useCurrentFrame();
  const out = useOut(8);
  const lp = pop(frame, 0, {damping: 12, stiffness: 120});
  const sp = prog(frame, 22, 38);
  return (
    <Safe>
      <div style={{opacity: 1 - out}}>
        <div style={{position: 'absolute', left: (SAFE.w - 200) / 2, top: 150, width: 200, height: 200, transform: `scale(${lp}) rotate(${(1 - lp) * -30}deg)`, filter: `drop-shadow(0 0 40px ${C.accent}66)`}}>
          <Img
            src={LOGO}
            style={{width: '100%', height: '100%', objectFit: 'contain', borderRadius: 44}}
          />
        </div>
        <div style={{position: 'absolute', top: 390, width: SAFE.w, textAlign: 'center', fontSize: 116, fontWeight: 900, letterSpacing: -2}}>
          <Rise at={8}>OptionXi</Rise>
        </div>
        <div style={{position: 'absolute', top: 550, width: SAFE.w, textAlign: 'center', fontSize: 50, fontWeight: 700, opacity: sp, transform: `translateY(${(1 - sp) * 24}px)`}}>
          <Grad>Research. Practice. Track.</Grad>
        </div>
      </div>
    </Safe>
  );
};

const StepScene: React.FC<{i: number}> = ({i}) => (
  <Safe>
    <Title n={STEPS[i].n} text={STEPS[i].title} />
    <Cap from={16}>{STEPS[i].cap}</Cap>
  </Safe>
);

const Star: React.FC<{c: string}> = ({c}) => (
  <svg width={100} height={100} viewBox="0 0 24 24" style={{display: 'block'}}>
    <path fill={c} d="M12 2l2.9 6.9 7.1.6-5.4 4.7 1.7 7.2L12 17.8 5.7 21.4l1.7-7.2L2 9.5l7.1-.6z" />
  </svg>
);

const CONF = Array.from({length: 40}, (_, i) => ({
  x: random(`cx${i}`) * 900,
  r: random(`cr${i}`) * 720 - 360,
  dx: (random(`cd${i}`) - 0.5) * 220,
  dy: 900 + random(`cy${i}`) * 500,
  w: 10 + random(`cw${i}`) * 10,
  c: [C.accent, C.amber, C.green, C.paper][i % 4],
}));

const ProofScene: React.FC = () => {
  const frame = useCurrentFrame();
  const out = useOut(8);
  const rp = Math.min(pop(frame, 14), 1);
  const f = Math.max(0, frame - 20);
  const bp = Math.min(pop(f, 0, {damping: 12}), 1.1);
  const ip = Math.min(pop(f, 0), 1);
  return (
    <Safe>
      <div style={{opacity: 1 - out}}>
        <div style={{position: 'absolute', top: 120, left: 0, width: SAFE.w, display: 'flex', justifyContent: 'center', gap: 14}}>
          {[0, 1, 2, 3, 4].map((i) => {
            const sp = Math.min(pop(frame, 6 + i * 4, {damping: 9}), 1.2);
            return (
              <div key={i} style={{position: 'relative', width: 100, height: 100, transform: `scale(${sp}) rotate(${(1 - Math.min(sp, 1)) * -40}deg)`}}>
                <Star c="#2A2F5E" />
                <div style={{position: 'absolute', left: 0, top: 0, height: 100, overflow: 'hidden', width: `${(i < 4 ? 100 : 20) * prog(frame, 12 + i * 4, 24 + i * 4)}%`, filter: `drop-shadow(0 0 14px ${C.amber}88)`}}>
                  <Star c={C.amber} />
                </div>
              </div>
            );
          })}
        </div>
        <div style={{position: 'absolute', top: 260, width: SAFE.w, textAlign: 'center', fontSize: 104, fontWeight: 900, letterSpacing: -2, transform: `translateY(${(1 - rp) * 40}px)`, opacity: rp}}>
          4.2 Rating
        </div>
        <div style={{opacity: frame >= 20 ? 1 : 0}}>
          <div style={{position: 'absolute', top: 430, width: SAFE.w, textAlign: 'center', fontSize: 240, fontWeight: 900, letterSpacing: -6, lineHeight: 1, color: C.amber}}>
            {Math.round(10 * prog(f, 0, 35, Easing.out(Easing.cubic)))}K+
          </div>
          <div style={{position: 'absolute', top: 700, width: SAFE.w, textAlign: 'center', fontSize: 62, fontWeight: 800, transform: `translateY(${(1 - ip) * 40}px)`, opacity: ip}}>Installs</div>
          <div style={{position: 'absolute', top: 860, left: (SAFE.w - 520) / 2, width: 520, transform: `scale(${bp})`, opacity: Math.min(bp, 1)}}>
            <Img src={PLAY} style={{width: '100%', display: 'block'}} />
          </div>
        </div>
        {frame >= 24 &&
          CONF.map((p, i) => {
            const t = prog(f, 4 + i * 0.4, 44 + i * 0.4, Easing.in(Easing.quad));
            return (
              <div key={i} style={{position: 'absolute', left: p.x, top: -40, width: p.w, height: p.w * 1.8, background: p.c, borderRadius: 2, transform: `translate(${p.dx * t}px, ${p.dy * t}px) rotate(${p.r * t}deg)`, opacity: 1 - t * 0.9}} />
            );
          })}
      </div>
    </Safe>
  );
};

const Cta: React.FC = () => {
  const frame = useCurrentFrame();
  const lp = pop(frame, 0, {damping: 12});
  const pulse = 1 + Math.sin(frame / 5) * 0.025 * prog(frame, 26, 34);
  const sub = Math.min(pop(frame, 12, {damping: 18}), 1);
  const note = prog(frame, 24, 34);
  return (
    <Safe>
      <div style={{position: 'absolute', left: (SAFE.w - 200) / 2, top: 110, width: 200, height: 200, transform: `scale(${lp})`, filter: `drop-shadow(0 0 50px ${C.accent}77)`}}>
        <Img src={LOGO} style={{width: '100%', height: '100%', objectFit: 'contain', borderRadius: 44}} />
      </div>
      <div style={{position: 'absolute', top: 350, width: SAFE.w, textAlign: 'center', fontSize: 130, fontWeight: 900, letterSpacing: -3}}>
        <Rise at={6}>Try</Rise> <Rise at={9}>it</Rise> <Rise at={12}>now.</Rise>
      </div>
      <div style={{position: 'absolute', top: 530, width: SAFE.w, textAlign: 'center', fontSize: 52, fontWeight: 700, transform: `translateY(${(1 - sub) * 40}px)`, opacity: sub}}>
        <Grad>Practice before you invest.</Grad>
      </div>
      <div style={{position: 'absolute', top: 640, left: (SAFE.w - 520) / 2, width: 520, transform: `scale(${Math.min(pop(frame, 14, {damping: 12}), 1.1) * pulse})`, opacity: Math.min(pop(frame, 14), 1)}}>
        <Img src={PLAY} style={{width: '100%', display: 'block'}} />
      </div>
      <div style={{position: 'absolute', top: 880, width: SAFE.w, textAlign: 'center', fontSize: 50, fontWeight: 800, opacity: note}}>Link in caption</div>
      <div style={{position: 'absolute', top: 1010, left: 50, width: SAFE.w - 100, textAlign: 'center', fontSize: 26, fontWeight: 600, color: C.mute, opacity: note}}>
        Virtual trading with practice money. Not investment advice.
      </div>
    </Safe>
  );
};

const S: React.FC<{from: number; to: number; children: React.ReactNode}> = ({from, to, children}) => (
  <Sequence from={from} durationInFrames={to - from}>
    {children}
  </Sequence>
);

export const Reel: React.FC = () => (
  <AbsoluteFill
    style={{fontFamily, background: C.bg, color: C.white, overflow: 'hidden'}}
  >
    <Background />
    <Safe>
      <PhoneLayer />
      <StepDots />
    </Safe>
    <S from={T.hook[0]} to={T.hook[1]}><Hook /></S>
    <S from={T.reveal[0]} to={T.reveal[1]}><RevealScene /></S>
    {STEPS.map((_, i) => (
      <S key={i} from={STEP_START + i * STEP_LEN} to={STEP_START + (i + 1) * STEP_LEN}>
        <StepScene i={i} />
      </S>
    ))}
    <S from={T.proof[0]} to={T.proof[1]}><ProofScene /></S>
    <S from={T.cta[0]} to={T.cta[1]}><Cta /></S>
    <SafeGuide />
  </AbsoluteFill>
);

export default Reel;