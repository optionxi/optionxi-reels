import React from 'react';
import {
  AbsoluteFill,
  Audio,
  Easing,
  Img,
  Sequence,
  interpolate,
  random,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

/* ------------------------------------------------------------------ */
/* Root.tsx: width 1080, height 1920, fps 30, durationInFrames 900     */
/* Pure Remotion (spring/interpolate). No GSAP, no hand PNGs.          */
/* Instagram safe zone: x 60-960, y 250-1540 -> <Safe> is 900x1290     */
/* ------------------------------------------------------------------ */
const FPS = 30;

const fontFamily =
  '"Poppins","Inter","SF Pro Display",system-ui,-apple-system,"Segoe UI",Roboto,sans-serif';
const MONO = '"SF Mono",Menlo,Consolas,monospace';

const C = {
  bg: '#07081A',
  white: '#FFFFFF',
  accent: '#8B7BFF',
  accent2: '#5CE1E6',
  gold: '#FFC83D',
  green: '#2EE58A',
  red: '#FF4D5E',
  card: 'rgba(255,255,255,0.06)',
  line: 'rgba(255,255,255,0.12)',
  mute: '#9AA0CC',
  screen: '#0B0D24',
};

/* Scene ranges (frames) */
const T = {
  hook: [0, 75],
  reveal: [75, 150],
  ai: [150, 330],
  ready: [330, 510],
  custom: [510, 720],
  proof: [720, 825],
  cta: [825, 900],
} as const;

/* Phone screen views (global frames). Tap ring fires at each `from`. */
const V = {
  home: [40, 165],
  ai: [165, 345],
  ready: [345, 525],
  build: [525, 720],
} as const;

const LOGO = 'https://optionxi.com/assets/images/logo_xi.png';
const PLAY =
  'https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png';

/* Optional real screenshots (full screen, 380x800) in /public. Empty = built-in UI. */
const SHOTS: Partial<Record<'home' | 'ai' | 'list' | 'custom', string>> = {
  // home: 'shots/home.png', ai: 'shots/ai.png', list: 'shots/list.png', custom: 'shots/custom.png',
};

/* SFX: {src: 'sfx/whoosh.mp3', at: frame} */
const SFX: {src: string; at: number}[] = [];

/* Phone geometry (inside Safe box) */
const PH = {x: 250, y: 330, w: 400, h: 820, bez: 10};
const SW = PH.w - PH.bez * 2; // 380
const SH = PH.h - PH.bez * 2; // 800
const TAB_W = SW / 3;
const TABS = ['AI Picks', 'Screeners', 'Custom'];

/* ------------------------------------------------------------------ */
/* Motion helpers                                                      */
/* ------------------------------------------------------------------ */
const OUT = Easing.bezier(0.16, 1, 0.3, 1);
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

const prog = (f: number, a: number, b: number, easing: (t: number) => number = OUT) =>
  interpolate(f, [a, b], [0, 1], {...clamp, easing});

const pop = (f: number, at: number, cfg: Record<string, number> = {}) =>
  spring({
    frame: Math.max(0, f - at),
    fps: FPS,
    config: {damping: 14, stiffness: 140, mass: 0.8, ...cfg},
  });

const soft = (f: number, at: number) =>
  spring({frame: Math.max(0, f - at), fps: FPS, config: {damping: 200}});

/* exit progress over the last n frames of the current Sequence */
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

/* ------------------------------------------------------------------ */
/* Layout primitives                                                   */
/* ------------------------------------------------------------------ */
const Safe: React.FC<{children?: React.ReactNode}> = ({children}) => (
  <div style={{position: 'absolute', left: 60, top: 250, width: 900, height: 1290}}>{children}</div>
);

/* masked slide-up text reveal */
const Rise: React.FC<{at: number; children: React.ReactNode; style?: React.CSSProperties}> = ({
  at,
  children,
  style,
}) => {
  const frame = useCurrentFrame();
  const p = pop(frame, at, {damping: 18, stiffness: 120});
  return (
    <span style={{display: 'inline-block', overflow: 'hidden', verticalAlign: 'top', paddingBottom: '0.14em', ...style}}>
      <span style={{display: 'inline-block', transform: `translateY(${(1 - p) * 115}%)`}}>{children}</span>
    </span>
  );
};

const Title: React.FC<{n: string; text: string}> = ({n, text}) => {
  const out = useOut(10);
  const words = text.split(' ');
  return (
    <div
      style={{
        position: 'absolute', top: 0, left: 0, width: 900, textAlign: 'center',
        fontSize: 92, fontWeight: 900, letterSpacing: -2, lineHeight: 1.12, opacity: 1 - out,
      }}
    >
      <Rise at={0} style={{marginRight: 22}}>
        <span style={{background: `linear-gradient(135deg, ${C.accent}, ${C.accent2})`, WebkitBackgroundClip: 'text', color: 'transparent'}}>
          {n}
        </span>
      </Rise>
      {words.map((w, i) => (
        <Rise key={w + i} at={3 + i * 3} style={{marginRight: i < words.length - 1 ? 22 : 0}}>
          {w}
        </Rise>
      ))}
    </div>
  );
};

/* caption pill. `from`/`to` are scene-local frames; no `to` = until scene end */
const Cap: React.FC<{from: number; to?: number; mono?: boolean; children: string}> = ({from, to, mono, children}) => {
  const frame = useCurrentFrame();
  const sceneOut = useOut(8);
  const q = to === undefined ? sceneOut : prog(frame, to, to + 8, Easing.in(Easing.quad));
  if (frame < from || (to !== undefined && frame > to + 8)) return null;
  const p = Math.min(pop(frame, from, {damping: 20, stiffness: 160}), 1);
  return (
    <div
      style={{
        position: 'absolute', top: 150, left: 0, width: 900, display: 'flex', justifyContent: 'center',
        transform: `translateY(${(1 - p) * 30 - q * 20}px) scale(${0.94 + 0.06 * p})`, opacity: p * (1 - q),
      }}
    >
      <span
        style={{
          ...glass, fontSize: mono ? 44 : 46, fontWeight: 700, fontFamily: mono ? MONO : undefined,
          color: mono ? C.accent : C.white, padding: '12px 34px', borderRadius: 999,
        }}
      >
        {children}
      </span>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Background (global frame)                                           */
/* ------------------------------------------------------------------ */
const CANDLES = Array.from({length: 22}, (_, i) => ({
  h: 80 + random(`h${i}`) * 260,
  b: 30 + i * 22 + random(`b${i}`) * 80,
  up: random(`u${i}`) > 0.4,
  ph: random(`p${i}`) * 6,
}));

const Background: React.FC = () => {
  const frame = useCurrentFrame();
  const blur = prog(frame, 40, 90);
  return (
    <AbsoluteFill style={{background: C.bg}} hidden>
      {/* drifting orbs */}
      <div
        style={{
          ...fill,
          background: `radial-gradient(760px 760px at ${25 + Math.sin(frame / 70) * 8}% ${18 + Math.cos(frame / 90) * 5}%, ${C.accent}40, transparent 62%),
                       radial-gradient(820px 820px at ${82 + Math.cos(frame / 80) * 6}% ${86 + Math.sin(frame / 60) * 4}%, ${C.accent2}26, transparent 62%)`,
        }}
      />
      {/* scrolling grid */}
      <div
        style={{
          ...fill, opacity: 0.35,
          backgroundImage: `linear-gradient(${C.line} 1px, transparent 1px), linear-gradient(90deg, ${C.line} 1px, transparent 1px)`,
          backgroundSize: '90px 90px', backgroundPosition: `0px ${(frame * 0.8) % 90}px`,
          WebkitMaskImage: 'radial-gradient(ellipse at 50% 45%, #000 20%, transparent 75%)',
          maskImage: 'radial-gradient(ellipse at 50% 45%, #000 20%, transparent 75%)',
        }}
      />
      {/* candles */}
      <div
        style={{
          position: 'absolute', left: 20, bottom: 100, width: 1040, height: 1000,
          opacity: 0.5 - blur * 0.32, filter: `blur(${blur * 12}px)`,
        }}
      >
        {CANDLES.map((c, i) => (
          <div
            key={i}
            style={{
              position: 'absolute', left: i * 47, bottom: c.b, width: 26, height: c.h, borderRadius: 4,
              background: c.up ? C.green : C.red, transformOrigin: 'bottom',
              transform: `scaleY(${0.75 + Math.sin(frame / 14 + c.ph) * 0.25})`,
            }}
          >
            <div style={{position: 'absolute', left: 11, top: -26, bottom: -26, width: 4, background: c.up ? C.green : C.red}} />
          </div>
        ))}
      </div>
      {/* vignette */}
      <div style={{...fill, background: 'radial-gradient(ellipse at 50% 50%, transparent 55%, rgba(0,0,0,0.5))'}} />
    </AbsoluteFill>
  );
};

const Brand: React.FC = () => (
  <div style={{position: 'absolute', left: 60, top: 1496, width: 900, textAlign: 'center', fontSize: 22, fontWeight: 500, color: C.mute, opacity: 0.8}}>
    Educational only. Not investment advice.
  </div>
);

/* ------------------------------------------------------------------ */
/* Phone UI (global frame)                                             */
/* ------------------------------------------------------------------ */
const TapRing: React.FC<{x: number; y: number; at: number; frame: number}> = ({x, y, at, frame}) => {
  const t = frame - at;
  if (t < 0 || t > 18) return null;
  const p = t / 18;
  return (
    <div
      style={{
        position: 'absolute', left: x - 50, top: y - 50, width: 100, height: 100, borderRadius: '50%',
        border: `4px solid ${C.accent}`, background: `${C.accent}33`,
        transform: `scale(${0.2 + p * 1.2})`, opacity: 0.85 * (1 - p), zIndex: 40, pointerEvents: 'none',
      }}
    />
  );
};

const Shot: React.FC<{src: string}> = ({src}) => (
  <Img src={staticFile(src)} style={{...fill, objectFit: 'cover'}} />
);

/* a view slides in from the right at `from`, out to the left at `to` */
const View: React.FC<{from: number; to: number; children: (t: number) => React.ReactNode}> = ({from, to, children}) => {
  const frame = useCurrentFrame();
  if (frame < from || frame > to + 16) return null;
  const inn = soft(frame, from);
  const out = prog(frame, to, to + 16, Easing.in(Easing.cubic));
  return (
    <div style={{...fill, transform: `translateX(${(1 - inn) * 120 - out * 120}px)`, opacity: Math.min(inn * 1.6, 1) * (1 - out)}}>
      {children(frame - from)}
    </div>
  );
};

const Header: React.FC = () => {
  const frame = useCurrentFrame();
  if (SHOTS.home) return null;
  const tabF = interpolate(frame, [345, 362, 525, 542], [0, 1, 1, 2], {...clamp, easing: OUT});
  const show = prog(frame, 160, 172);
  const active = Math.round(tabF);
  return (
    <div style={{position: 'absolute', left: 0, top: 0, width: '100%', height: 160, zIndex: 5, background: `linear-gradient(${C.screen} 70%, transparent)`}}>
      <div style={{position: 'absolute', top: 52, left: 22, display: 'flex', alignItems: 'center', gap: 10, fontSize: 30, fontWeight: 800}}>
        <div style={{width: 30, height: 30, borderRadius: 9, background: `linear-gradient(135deg, ${C.accent}, ${C.accent2})`}} />
        OptionXi
      </div>
      <div style={{position: 'absolute', top: 100, left: 0, width: '100%', display: 'flex', opacity: show}}>
        {TABS.map((t, i) => (
          <div
            key={t}
            style={{
              width: TAB_W, height: 52, display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 21, fontWeight: 700, color: i === active ? C.white : C.mute,
            }}
          >
            {t}
          </div>
        ))}
      </div>
      <div
        style={{
          position: 'absolute', top: 148, height: 4, borderRadius: 4, width: TAB_W - 44,
          left: tabF * TAB_W + 22, opacity: show, background: `linear-gradient(90deg, ${C.accent}, ${C.accent2})`,
          boxShadow: `0 0 16px ${C.accent}`,
        }}
      />
    </div>
  );
};

const HomeView: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <View from={V.home[0]} to={V.home[1]}>
      {() =>
        SHOTS.home ? (
          <Shot src={SHOTS.home} />
        ) : (
          <div style={{position: 'absolute', left: 20, right: 20, top: 186}}>
            <div
              style={{
                height: 170, borderRadius: 26, marginBottom: 18, padding: 24, boxSizing: 'border-box',
                background: `linear-gradient(135deg, ${C.accent}88, #1B2A6B)`,
                transform: `translateY(${(1 - pop(frame, 85)) * 50}px)`, opacity: Math.min(pop(frame, 85), 1),
              }}
            >
              <div style={{fontSize: 34, fontWeight: 900, lineHeight: 1.1}}>Find stocks.<br />Fast.</div>
            </div>
            {TABS.map((t, i) => {
              const p = Math.min(pop(frame, 98 + i * 6), 1);
              return (
                <div
                  key={t}
                  style={{
                    height: 84, borderRadius: 22, background: C.card, border: `1px solid ${C.line}`, marginBottom: 12,
                    display: 'flex', alignItems: 'center', padding: '0 20px', fontSize: 26, fontWeight: 700,
                    transform: `translateY(${(1 - p) * 40}px)`, opacity: p,
                  }}
                >
                  <div style={{width: 40, height: 40, borderRadius: 12, background: `${C.accent}33`, marginRight: 16}} />
                  {t}
                </div>
              );
            })}
          </div>
        )
      }
    </View>
  );
};

const AI_ROWS = [
  ['RELIANCE', '+3.2%', 92],
  ['TCS', '+2.4%', 88],
  ['INFY', '+1.9%', 81],
  ['HDFCBANK', '+1.6%', 76],
] as const;
const CHIPS = ['Volume ✓', 'Breakout ✓', 'Trend ✓'];

const AiView: React.FC = () => (
  <View from={V.ai[0]} to={V.ai[1]}>
    {(t) =>
      SHOTS.ai ? (
        <Shot src={SHOTS.ai} />
      ) : (
        <>
          <div style={{position: 'absolute', left: 20, top: 172, fontSize: 18, fontWeight: 700, color: C.mute, display: 'flex', alignItems: 'center', gap: 8}}>
            <span style={{width: 8, height: 8, borderRadius: 8, background: C.green, opacity: 0.5 + 0.5 * Math.sin(t / 3)}} />
            AI scanned {Math.round(24 * prog(t, 0, 30))} screeners
          </div>
          {AI_ROWS.map(([n, p, score], i) => {
            const cp = Math.min(pop(t, 10 + i * 7), 1.05);
            return (
              <div
                key={n}
                style={{
                  position: 'absolute', left: 12, right: 12, top: 210 + i * 132, height: 122, borderRadius: 22,
                  background: C.card, border: `1px solid ${C.line}`, padding: '16px 18px', boxSizing: 'border-box',
                  transform: `translateY(${(1 - cp) * 60}px) scale(${0.94 + 0.06 * cp})`, opacity: Math.min(cp, 1),
                }}
              >
                <div style={{display: 'flex', justifyContent: 'space-between', fontSize: 27, fontWeight: 800}}>
                  <span>{n}</span>
                  <span style={{color: C.green}}>{p}</span>
                </div>
                <div style={{display: 'flex', gap: 8, marginTop: 14}}>
                  {CHIPS.map((c, j) => {
                    const chp = Math.min(pop(t, 24 + i * 7 + j * 4, {damping: 10}), 1.2);
                    return (
                      <span
                        key={c}
                        style={{
                          display: 'inline-block', fontSize: 15, fontWeight: 700, padding: '6px 10px', borderRadius: 999,
                          background: `${C.accent}26`, color: C.accent, transform: `scale(${chp})`,
                        }}
                      >
                        {c}
                      </span>
                    );
                  })}
                </div>
                <div style={{position: 'absolute', left: 18, right: 18, bottom: 12, height: 5, borderRadius: 5, background: 'rgba(255,255,255,0.08)'}}>
                  <div
                    style={{
                      width: `${score * prog(t, 30 + i * 7, 60 + i * 7)}%`, height: '100%', borderRadius: 5,
                      background: `linear-gradient(90deg, ${C.accent}, ${C.accent2})`,
                    }}
                  />
                </div>
              </div>
            );
          })}
          {/* scan beam */}
          <div
            style={{
              position: 'absolute', left: 0, right: 0, height: 90,
              top: interpolate(t, [0, 40], [140, 760], clamp),
              opacity: interpolate(t, [0, 6, 34, 40], [0, 1, 1, 0], clamp),
              background: `linear-gradient(transparent, ${C.accent}55, transparent)`,
              borderBottom: `2px solid ${C.accent2}`, zIndex: 6,
            }}
          />
        </>
      )
    }
  </View>
);

const RD: [string, number][] = [['High Volume', 24], ['Breakout', 12], ['52W High', 9], ['Gap Up', 17]];
const RES = [['SBIN', '+2.1%'], ['ITC', '+1.4%'], ['LT', '+1.1%']];
const ROW_TOP = 190;
const ROW_H = 86;

const ReadyView: React.FC = () => (
  <View from={V.ready[0]} to={V.ready[1]}>
    {(t) => {
      if (SHOTS.list) return <Shot src={SHOTS.list} />;
      const sel = interpolate(t, [18, 26, 48, 56, 72, 80], [0, 0, 1, 1, 2, 2], {...clamp, easing: OUT});
      const sheet = soft(t, 104);
      return (
        <>
          <div style={{position: 'absolute', left: 12, right: 12, top: ROW_TOP}}>
            {RD.map(([n, c], i) => {
              const rp = Math.min(pop(t, 4 + i * 5), 1);
              const isCnt = i < 3;
              return (
                <div
                  key={n}
                  style={{
                    height: 76, marginBottom: 10, borderRadius: 22, background: C.card, border: `1px solid ${C.line}`,
                    display: 'flex', alignItems: 'center', padding: '0 18px', boxSizing: 'border-box', fontSize: 26, fontWeight: 700,
                    transform: `translateX(${(1 - rp) * 60}px)`, opacity: rp,
                  }}
                >
                  <div style={{width: 36, height: 36, borderRadius: 11, background: `${C.accent}33`, marginRight: 14}} />
                  <span style={{flex: 1}}>{n}</span>
                  <span style={{fontSize: 22, fontWeight: 800, color: C.accent, background: `${C.accent}1F`, padding: '4px 14px', borderRadius: 999, minWidth: 40, textAlign: 'center'}}>
                    {isCnt ? (t < 14 + i * 8 ? '–' : Math.round(c * prog(t, 14 + i * 8, 34 + i * 8))) : c}
                  </span>
                </div>
              );
            })}
          </div>
          <div
            style={{
              position: 'absolute', left: 6, right: 6, top: ROW_TOP - 3 + sel * ROW_H, height: 82, borderRadius: 24,
              border: `3px solid ${C.accent}`, background: `${C.accent}1F`, boxShadow: `0 0 34px ${C.accent}77`,
              opacity: prog(t, 14, 20),
            }}
          />
          {[20, 50, 74].map((a, i) => (
            <TapRing key={a} x={190} y={ROW_TOP + 38 + i * ROW_H} at={a} frame={t} />
          ))}
          <div
            style={{
              position: 'absolute', left: 0, right: 0, bottom: 0, height: 340, zIndex: 4, borderRadius: '34px 34px 0 0',
              background: 'linear-gradient(#1B1F46, #12153A)', borderTop: `3px solid ${C.accent}`, padding: '24px 22px 0',
              boxSizing: 'border-box', transform: `translateY(${(1 - sheet) * 420}px)`,
            }}
          >
            <div style={{width: 50, height: 5, borderRadius: 5, background: C.line, margin: '-8px auto 14px'}} />
            <div style={{fontSize: 24, fontWeight: 800, marginBottom: 10}}>52W High · 9 stocks</div>
            {RES.map(([n, p], i) => {
              const ip = Math.min(pop(t, 114 + i * 6), 1);
              return (
                <div
                  key={n}
                  style={{
                    display: 'flex', justifyContent: 'space-between', fontSize: 24, fontWeight: 700, padding: '14px 0',
                    borderBottom: `1px solid ${C.line}`, transform: `translateY(${(1 - ip) * 24}px)`, opacity: ip,
                  }}
                >
                  <span>{n}</span>
                  <span style={{color: C.green}}>{p}</span>
                </div>
              );
            })}
          </div>
        </>
      );
    }}
  </View>
);

const TYPED = '4 EMA > 20 EMA';

const BuildView: React.FC = () => (
  <View from={V.build[0]} to={V.build[1]}>
    {(t) => {
      if (SHOTS.custom) return <Shot src={SHOTS.custom} />;
      const pill: React.CSSProperties = {
        position: 'absolute', left: 14, right: 14, height: 64, borderRadius: 20, border: `2px solid ${C.accent}`,
        background: `${C.accent}1A`, display: 'flex', alignItems: 'center', padding: '0 20px', boxSizing: 'border-box',
        fontFamily: MONO, fontSize: 26, fontWeight: 700,
      };
      const p1 = Math.min(pop(t, 10), 1);
      const p2 = Math.min(pop(t, 75), 1);
      const runP = Math.min(pop(t, 90), 1);
      const press = t >= 125 && t <= 132 ? 0.92 : 1;
      const shown = TYPED.slice(0, Math.round(TYPED.length * prog(t, 18, 60, Easing.linear)));
      const found = Math.round(3 * prog(t, 136, 156));
      return (
        <>
          <div style={{position: 'absolute', left: 18, top: 172, fontSize: 20, fontWeight: 700, color: C.mute}}>Your rules</div>
          <div style={{...pill, top: 204, transform: `translateY(${(1 - p1) * 30}px)`, opacity: p1}}>
            <span>{shown}</span>
            <span style={{color: C.accent, marginLeft: 2, opacity: Math.floor(t / 8) % 2 === 0 ? 1 : 0}}>|</span>
          </div>
          <div style={{...pill, top: 282, transform: `translateX(${(1 - p2) * 160}px)`, opacity: p2}}>Volume &gt; 2x avg</div>
          <div
            style={{
              position: 'absolute', left: 14, right: 14, top: 370, height: 60, borderRadius: 20,
              background: `linear-gradient(90deg, ${C.accent}, ${C.accent2})`, color: '#0A0B1E',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 900,
              transform: `translateY(${(1 - runP) * 20}px) scale(${press})`, opacity: runP,
              boxShadow: `0 0 ${24 + Math.sin(t / 4) * 10}px ${C.accent}88`,
            }}
          >
            Run
          </div>
          <TapRing x={190} y={400} at={125} frame={t} />
          <div style={{position: 'absolute', left: 18, top: 452, fontSize: 22, fontWeight: 800, color: C.green, opacity: t >= 136 ? 1 : 0}}>
            {found} stocks match
          </div>
          {RES.map(([n, p], i) => {
            const rp = Math.min(pop(t, 140 + i * 6), 1);
            return (
              <div
                key={n}
                style={{
                  position: 'absolute', left: 14, right: 14, top: 492 + i * 64, height: 54, borderRadius: 18, background: C.card,
                  border: `1px solid ${C.line}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '0 18px', boxSizing: 'border-box', fontSize: 24, fontWeight: 700,
                  transform: `translateY(${(1 - rp) * 40}px)`, opacity: rp,
                }}
              >
                <span>{n}</span>
                <span style={{color: C.green}}>{p}</span>
              </div>
            );
          })}
        </>
      );
    }}
  </View>
);

const TabTaps: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <>
      <TapRing x={TAB_W * 0.5} y={126} at={V.ai[0]} frame={frame} />
      <TapRing x={TAB_W * 1.5} y={126} at={V.ready[0]} frame={frame} />
      <TapRing x={TAB_W * 2.5} y={126} at={V.build[0]} frame={frame} />
    </>
  );
};

/* 3D device mockup */
const Device: React.FC<{rotY: number; children: React.ReactNode}> = ({rotY, children}) => (
  <div style={{position: 'relative', width: PH.w, height: PH.h}}>
    {/* ground shadow */}
    <div
      style={{
        position: 'absolute', left: 30, bottom: -60, width: PH.w - 60, height: 60, borderRadius: '50%',
        background: 'rgba(0,0,0,0.55)', filter: 'blur(32px)',
      }}
    />
    {/* side buttons */}
    <div style={{position: 'absolute', left: -4, top: 170, width: 5, height: 60, borderRadius: 3, background: '#2B3170'}} />
    <div style={{position: 'absolute', left: -4, top: 250, width: 5, height: 90, borderRadius: 3, background: '#2B3170'}} />
    <div style={{position: 'absolute', right: -4, top: 220, width: 5, height: 120, borderRadius: 3, background: '#2B3170'}} />
    <div
      style={{
        position: 'absolute', inset: 0, borderRadius: 66, padding: PH.bez, boxSizing: 'border-box',
        background: 'linear-gradient(145deg, #2A3070, #11143A 55%, #242A66)', outline: '2px solid #4A52A0',
        boxShadow: `0 50px 100px rgba(0,0,0,.6), 0 0 140px ${C.accent}33, inset 0 0 0 2px rgba(255,255,255,0.06)`,
      }}
    >
      <div style={{position: 'relative', width: '100%', height: '100%', borderRadius: 56, overflow: 'hidden', background: C.screen}}>
        {children}
        <div style={{position: 'absolute', top: 12, left: '50%', marginLeft: -50, width: 100, height: 28, borderRadius: 14, background: '#000', zIndex: 30}} />
        {/* glass glare */}
        <div
          style={{
            ...fill, zIndex: 31, pointerEvents: 'none',
            background: 'linear-gradient(115deg, transparent 30%, rgba(255,255,255,0.10) 46%, transparent 62%)',
            backgroundSize: '260% 100%', backgroundPosition: `${50 - rotY * 4}% 0`,
          }}
        />
      </div>
    </div>
  </div>
);

const PhoneLayer: React.FC = () => {
  const frame = useCurrentFrame();
  if (frame < 75 || frame >= 750) return null;
  const enter = spring({frame: frame - 75, fps: FPS, config: {damping: 16, stiffness: 70, mass: 1}});
  const exit = prog(frame, 722, 750, Easing.in(Easing.cubic));
  const ease = Easing.inOut(Easing.cubic);
  const rotY = interpolate(frame, [75, 150, 200, 345, 430, 525, 610, 720], [-28, -10, 0, 0, 9, 9, -7, -7], {...clamp, easing: ease});
  const rotX = interpolate(frame, [75, 150], [14, 5], {...clamp, easing: ease});
  const rotZ = interpolate(frame, [75, 150], [-4, 0], {...clamp, easing: ease});
  const scale = interpolate(frame, [75, 150, 525, 610, 720], [0.88, 1, 1, 1.07, 1.07], {...clamp, easing: ease});
  const y = (1 - enter) * 1100 + exit * 1500 + Math.sin(frame / 22) * 8;
  return (
    <div
      style={{
        position: 'absolute', left: PH.x, top: PH.y, width: PH.w, height: PH.h,
        transform: `perspective(1800px) translateY(${y}px) rotateX(${rotX}deg) rotateY(${rotY}deg) rotateZ(${rotZ}deg) scale(${scale})`,
      }}
    >
      <Device rotY={rotY}>
        <Header />
        <HomeView />
        <AiView />
        <ReadyView />
        <BuildView />
        <TabTaps />
      </Device>
    </div>
  );
};

/* floating glass chips around the phone (parallax bob) */
const FloatChip: React.FC<{
  from: number; to: number; x: number; y: number; phase?: number; mono?: boolean; children: React.ReactNode;
}> = ({from, to, x, y, phase = 0, mono, children}) => {
  const frame = useCurrentFrame();
  if (frame < from || frame > to) return null;
  const p = pop(frame, from, {damping: 13, stiffness: 110});
  const q = prog(frame, to - 10, to, Easing.in(Easing.quad));
  const bob = Math.sin((frame + phase) / 16) * 10;
  return (
    <div
      style={{
        ...glass, position: 'absolute', left: x, top: y, padding: '16px 24px', borderRadius: 24,
        fontSize: 30, fontWeight: 800, fontFamily: mono ? MONO : undefined, whiteSpace: 'nowrap', zIndex: 10,
        transform: `translateY(${bob + (1 - p) * 40}px) scale(${p * (1 - q * 0.2)})`, opacity: Math.min(p, 1) * (1 - q),
      }}
    >
      {children}
    </div>
  );
};

const G: React.FC<{children: React.ReactNode}> = ({children}) => <span style={{color: C.green, marginLeft: 12}}>{children}</span>;

const FloatChips: React.FC = () => (
  <>
    <FloatChip from={200} to={335} x={0} y={470}>RELIANCE<G>+3.2%</G></FloatChip>
    <FloatChip from={212} to={335} x={660} y={660} phase={20}>TCS<G>+2.4%</G></FloatChip>
    <FloatChip from={380} to={515} x={0} y={500} phase={8}><span style={{color: C.accent}}>✓</span> Volume</FloatChip>
    <FloatChip from={392} to={515} x={650} y={770} phase={30}><span style={{color: C.accent}}>✓</span> Breakout</FloatChip>
    <FloatChip from={555} to={715} x={0} y={560} phase={14} mono><span style={{color: C.accent}}>4 EMA &gt; 20 EMA</span></FloatChip>
    <FloatChip from={575} to={715} x={620} y={850} phase={40}><span style={{color: C.green}}>3 stocks match</span></FloatChip>
  </>
);

/* ------------------------------------------------------------------ */
/* Scenes (local frame)                                                */
/* ------------------------------------------------------------------ */
const NAMES = ['RELIANCE', 'TCS', 'INFY', 'HDFCBANK', 'SBIN', 'ITC', 'LT', 'WIPRO', 'AXISBANK', 'MARUTI', 'CIPLA', 'ONGC', 'TITAN', 'BHARTI'];

const Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const out = useOut(8);
  const wob = Math.sin(frame * 0.9) * 10 * prog(frame, 25, 60);
  const sub = Math.min(pop(frame, 40, {damping: 18}), 1);
  return (
    <Safe>
      {/* chaos of tickers = "too many" */}
      {NAMES.map((n, i) => {
        const p = Math.min(pop(frame, 4 + i * 3, {damping: 12}), 1);
        const up = random(`n${i}`) > 0.45;
        return (
          <div
            key={n}
            style={{
              ...glass, position: 'absolute', left: random(`x${i}`) * 700, top: 60 + random(`y${i}`) * 1100,
              padding: '10px 18px', borderRadius: 16, fontSize: 24, fontWeight: 700, opacity: 0.4 * p * (1 - out),
              transform: `scale(${p}) translateY(${Math.sin((frame + i * 9) / 10) * 8}px)`, filter: 'blur(1.5px)',
            }}
          >
            {n} <span style={{color: up ? C.green : C.red}}>{up ? '+' : '-'}{(random(`v${i}`) * 4).toFixed(1)}%</span>
          </div>
        );
      })}
      <div style={{position: 'absolute', top: 380, width: 900, textAlign: 'center', opacity: 1 - out, transform: `scale(${1 + out * 0.08})`}}>
        <div style={{fontSize: 140, fontWeight: 900, lineHeight: 1.02, letterSpacing: -4}}>
          <Rise at={0}>Too many</Rise>
          <br />
          <Rise at={6}>stocks</Rise>
          <span style={{display: 'inline-block', transform: `rotate(${wob}deg)`, color: C.red}}>
            <Rise at={12}>?</Rise>
          </span>
        </div>
        <div style={{marginTop: 50, fontSize: 62, fontWeight: 800, color: C.accent, transform: `translateY(${(1 - sub) * 60}px)`, opacity: sub}}>
          Don&apos;t know which to pick?
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
        <div style={{position: 'absolute', left: 380, top: 0, width: 140, height: 140, transform: `scale(${lp}) rotate(${(1 - lp) * -30}deg)`, filter: `drop-shadow(0 0 40px ${C.accent}88)`}}>
          <Img src={LOGO} style={{width: '100%', height: '100%', objectFit: 'contain', borderRadius: 32}} />
        </div>
        <div style={{position: 'absolute', top: 156, width: 900, textAlign: 'center', fontSize: 78, fontWeight: 900, letterSpacing: -1}}>
          <Rise at={10} style={{marginRight: 18}}>OptionXi</Rise>
          <Rise at={14}>Screeners</Rise>
        </div>
        <div style={{position: 'absolute', top: 256, width: 900, textAlign: 'center', fontSize: 42, fontWeight: 700, color: C.accent, opacity: sp, transform: `translateY(${(1 - sp) * 24}px)`}}>
          Find stocks. Fast.
        </div>
      </div>
    </Safe>
  );
};

const AiScene: React.FC = () => (
  <Safe>
    <Title n="1." text="AI Picks" />
    <Cap from={50} to={96}>AI checks 24+ screeners.</Cap>
    <Cap from={100}>Shows only stocks that pass.</Cap>
  </Safe>
);

const ReadyScene: React.FC = () => (
  <Safe>
    <Title n="2." text="Ready Screeners" />
    <Cap from={70}>Big volume? Breakout? One tap.</Cap>
  </Safe>
);

const CustomScene: React.FC = () => (
  <Safe>
    <Title n="3." text="Make Your Own" />
    <Cap from={60} to={126} mono>4 EMA above 20 EMA?</Cap>
    <Cap from={130}>Add any rule you want.</Cap>
  </Safe>
);

const StarSvg: React.FC<{c: string}> = ({c}) => (
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
  c: [C.accent, C.gold, C.accent2, C.white][i % 4],
}));

const ProofScene: React.FC = () => {
  const frame = useCurrentFrame();
  
  // 2 seconds at 30fps = 60 frames
  const DELAY = 20; 
  
  // Ensure things only start animating after the delay
  const f = Math.max(0, frame - DELAY); 

  const rp = Math.min(pop(frame, 14), 1);
  
  // These now use 'f', so they smoothly animate starting exactly at frame 60
  const bp = Math.min(pop(f, 0, {damping: 12}), 1.1);
  const ip = Math.min(pop(f, 0), 1);

  return (
    <Safe>
      <div style={{position: 'absolute', top: 120, left: 0, width: 900, display: 'flex', justifyContent: 'center', gap: 14}}>
        {[0, 1, 2, 3, 4].map((i) => {
          const sp = Math.min(pop(frame, 6 + i * 4, {damping: 9}), 1.2);
          return (
            <div key={i} style={{position: 'relative', width: 100, height: 100, transform: `scale(${sp}) rotate(${(1 - Math.min(sp, 1)) * -40}deg)`}}>
              <StarSvg c="#2A2F5E" />
              <div style={{position: 'absolute', left: 0, top: 0, height: 100, overflow: 'hidden', width: `${(i < 4 ? 100 : 20) * prog(frame, 12 + i * 4, 24 + i * 4)}%`, filter: `drop-shadow(0 0 14px ${C.gold}88)`}}>
                <StarSvg c={C.gold} />
              </div>
            </div>
          );
        })}
      </div>

      <div style={{position: 'absolute', top: 260, width: 900, textAlign: 'center', fontSize: 104, fontWeight: 900, letterSpacing: -2, transform: `translateY(${(1 - rp) * 40}px)`, opacity: rp}}>
        4.2 Rating
      </div>

      {/* The wrapper hides it completely for 2s, then fades it in */}
      <div style={{ opacity: frame >= DELAY ? 1 : 0 }}>
        <div
          style={{
            position: 'absolute', top: 430, width: 900, textAlign: 'center', fontSize: 240, fontWeight: 900, letterSpacing: -6, lineHeight: 1,
            background: `linear-gradient(135deg, ${C.accent}, ${C.accent2})`, WebkitBackgroundClip: 'text', color: 'transparent',
          }}
        >
          {/* Uses 'f' so it animates from 0 to 100 over 32 frames starting at the 2s mark */}
          {Math.round(10 * prog(f, 0, 35, Easing.out(Easing.cubic)))}K+
        </div>

        <div style={{position: 'absolute', top: 700, width: 900, textAlign: 'center', fontSize: 62, fontWeight: 800, transform: `translateY(${(1 - ip) * 40}px)`, opacity: ip}}>
          Installs
        </div>

        <div style={{position: 'absolute', top: 860, left: 190, width: 520, transform: `scale(${bp})`, opacity: Math.min(bp, 1)}}>
          <Img src={PLAY} style={{width: '100%', display: 'block'}} />
        </div>
      </div>

      {frame >= DELAY + 4 &&
        CONF.map((p, i) => {
          const t = prog(f, 4 + i * 0.4, 44 + i * 0.4, Easing.in(Easing.quad));
          return (
            <div
              key={i}
              style={{
                position: 'absolute', left: p.x, top: -40, width: p.w, height: p.w * 1.8, background: p.c, borderRadius: 2,
                transform: `translate(${p.dx * t}px, ${p.dy * t}px) rotate(${p.r * t}deg)`, opacity: 1 - t * 0.9,
              }}
            />
          );
        })}
    </Safe>
  );
};
const Cta: React.FC = () => {
  const frame = useCurrentFrame();
  const lp = pop(frame, 0, {damping: 12});
  const pulse = 1 + Math.sin(frame / 5) * 0.025 * prog(frame, 26, 34);
  const sub = Math.min(pop(frame, 12, {damping: 18}), 1);
  const bio = prog(frame, 20, 30);
  return (
    <Safe>
      <div style={{position: 'absolute', left: 350, top: 110, width: 200, height: 200, transform: `scale(${lp})`, filter: `drop-shadow(0 0 50px ${C.accent}99)`}}>
        <Img src={LOGO} style={{width: '100%', height: '100%', objectFit: 'contain', borderRadius: 44}} />
      </div>
      <div style={{position: 'absolute', top: 350, width: 900, textAlign: 'center', fontSize: 140, fontWeight: 900, letterSpacing: -3}}>
        <Rise at={6}>Try</Rise> <Rise at={9}>it</Rise> <Rise at={12}>free.</Rise>
      </div>
      <div style={{position: 'absolute', top: 530, width: 900, textAlign: 'center', fontSize: 52, fontWeight: 700, color: C.accent, transform: `translateY(${(1 - sub) * 40}px)`, opacity: sub}}>
        Free on Play Store
      </div>
      <div style={{position: 'absolute', top: 620, left: 190, width: 520, transform: `scale(${Math.min(pop(frame, 14, {damping: 12}), 1.1) * pulse})`, opacity: Math.min(pop(frame, 14), 1)}}>
        <Img src={PLAY} style={{width: '100%', display: 'block'}} />
      </div>
      <div style={{position: 'absolute', top: 850, width: 900, textAlign: 'center', fontSize: 50, fontWeight: 800, opacity: bio}}>
        OptionXi — link in caption
      </div>
      <div style={{position: 'absolute', top: 930, width: 900, textAlign: 'center', fontSize: 110, fontWeight: 900, color: C.accent, lineHeight: 1, opacity: bio, transform: `translateY(${Math.sin(frame / 4) * -14}px)`}}>
        ↑
      </div>
    </Safe>
  );
};

/* ------------------------------------------------------------------ */
/* Composition                                                         */
/* ------------------------------------------------------------------ */
const S: React.FC<{range: readonly [number, number]; children: React.ReactNode}> = ({range, children}) => (
  <Sequence from={range[0]} durationInFrames={range[1] - range[0]}>
    {children}
  </Sequence>
);

export const Reel: React.FC = () => (
  <AbsoluteFill
    style={{fontFamily, background: C.bg, color: C.white, overflow: 'hidden'}}
  >
    <Background />
    {/* persistent device + floating chips live on the global timeline */}
    <Safe>
      <PhoneLayer />
      <FloatChips />
    </Safe>
    <S range={T.hook}><Hook /></S>
    <S range={T.reveal}><RevealScene /></S>
    <S range={T.ai}><AiScene /></S>
    <S range={T.ready}><ReadyScene /></S>
    <S range={T.custom}><CustomScene /></S>
    <S range={T.proof}><ProofScene /></S>
    <S range={T.cta}><Cta /></S>
    <Brand />
    {SFX.map((s, i) => (
      <Sequence key={i} from={s.at}>
        <Audio src={staticFile(s.src)} />
      </Sequence>
    ))}
  </AbsoluteFill>
);