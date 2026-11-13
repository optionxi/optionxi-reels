import React from "react";
import {
  AbsoluteFill,
  Audio,
  Easing,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {getSafe, SafeGuide} from "../shared/safe-area";

export const config = {
  durationInFrames: 600,
  fps: 30,
  width: 1920,
  height: 1080,
};
const SAFE = getSafe(config);

const S1 = {from: 0, dur: 90};
const S2 = {from: 90, dur: 90};
const S3 = {from: 180, dur: 120};
const S4 = {from: 300, dur: 90};
const S5 = {from: 390, dur: 90};
const S6 = {from: 480, dur: 120};

const C = {
  bg: "#1431C8",
  deep: "#0B1B7A",
  ink: "#0A1240",
  white: "#FFFFFF",
  saffron: "#FF9933",
  up: "#22C55E",
  down: "#FF4D4F",
  soft: "rgba(255,255,255,0.74)",
  screen: "#F6F7FC",
};

const FONT = `"Inter","SF Pro Display","Helvetica Neue",Arial,sans-serif`;

const clamp = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;
const ease = Easing.bezier(0.16, 1, 0.3, 1);

const useProgress = (start: number, dur: number) => {
  const frame = useCurrentFrame();
  return interpolate(frame, [start, start + dur], [0, 1], {...clamp, easing: ease});
};

const Line: React.FC<{
  children: React.ReactNode;
  delay?: number;
  size?: number;
  color?: string;
}> = ({children, delay = 0, size = 112, color = C.white}) => {
  const p = useProgress(delay, 20);
  return (
    <div style={{overflow: "hidden", paddingBottom: 8}}>
      <div
        style={{
          transform: `translateY(${(1 - p) * 110}%)`,
          fontSize: size,
          fontWeight: 800,
          letterSpacing: -3,
          lineHeight: 1.04,
          color,
        }}
      >
        {children}
      </div>
    </div>
  );
};

const Sub: React.FC<{children: React.ReactNode; delay?: number}> = ({children, delay = 24}) => {
  const p = useProgress(delay, 16);
  return (
    <div
      style={{
        marginTop: 28,
        fontSize: 44,
        fontWeight: 500,
        lineHeight: 1.3,
        color: C.soft,
        opacity: p,
        maxWidth: 900,
      }}
    >
      {children}
    </div>
  );
};

const Split: React.FC<{left: React.ReactNode; right: React.ReactNode}> = ({left, right}) => (
  <AbsoluteFill
    style={{flexDirection: "row", alignItems: "center", padding: "0 130px", gap: 70}}
  >
    <div style={{flex: 1.15}}>{left}</div>
    <div style={{flex: 0.85, display: "flex", justifyContent: "center"}}>{right}</div>
  </AbsoluteFill>
);

const Phone: React.FC<{children: React.ReactNode; scale?: number}> = ({children, scale = 1}) => (
  <div
    style={{
      width: 400,
      height: 800,
      borderRadius: 58,
      background: C.ink,
      padding: 14,
      boxShadow: "0 50px 110px rgba(4,8,60,0.55)",
      transform: `scale(${scale})`,
    }}
  >
    <div
      style={{
        width: "100%",
        height: "100%",
        borderRadius: 46,
        background: C.screen,
        overflow: "hidden",
        position: "relative",
        fontFamily: FONT,
        color: C.ink,
      }}
    >
      {children}
    </div>
  </div>
);

const Logo: React.FC<{size?: number}> = ({size = 120}) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: size * 0.28,
      background: C.white,
      color: C.bg,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: size * 0.52,
      fontWeight: 900,
      letterSpacing: -2,
      fontFamily: FONT,
    }}
  >
    Xi
  </div>
);

type Candle = {o: number; c: number; h: number; l: number};
const CANDLES: Candle[] = [
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

const CandleChart: React.FC = () => {
  const frame = useCurrentFrame();
  const shown = interpolate(frame, [6, 70], [0, CANDLES.length], clamp);
  const W = 760;
  const H = 460;
  const slot = W / CANDLES.length;
  const y = (v: number) => H - 20 - v * 5;
  return (
    <div
      style={{
        width: W + 80,
        padding: 40,
        borderRadius: 36,
        background: C.deep,
        boxShadow: "0 40px 100px rgba(4,8,60,0.5)",
      }}
    >
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        {[0, 1, 2, 3].map((i) => (
          <line
            key={i}
            x1={0}
            x2={W}
            y1={40 + i * 120}
            y2={40 + i * 120}
            stroke="rgba(255,255,255,0.08)"
          />
        ))}
        {CANDLES.map((k, i) => {
          const part = Math.max(0, Math.min(1, shown - i));
          if (part <= 0) return null;
          const cur = k.o + (k.c - k.o) * part;
          const up = k.c >= k.o;
          const col = up ? C.up : C.down;
          const cx = i * slot + slot / 2;
          const top = Math.min(y(k.o), y(cur));
          const h = Math.max(4, Math.abs(y(k.o) - y(cur)));
          return (
            <g key={i} opacity={Math.min(1, part * 2)}>
              <line x1={cx} x2={cx} y1={y(k.h)} y2={y(k.l)} stroke={col} strokeWidth={3} />
              <rect x={cx - 13} y={top} width={26} height={h} rx={4} fill={col} />
            </g>
          );
        })}
      </svg>
    </div>
  );
};

const SceneHook: React.FC = () => (
  <Split
    left={
      <>
        <Line>Your first trade</Line>
        <Line delay={6}>shouldn’t cost</Line>
        <Line delay={12} color={C.saffron}>
          real money.
        </Line>
      </>
    }
    right={<CandleChart />}
  />
);

const SceneVirtual: React.FC = () => {
  const frame = useCurrentFrame();
  const bal = interpolate(frame, [8, 55], [0, 1000000], {...clamp, easing: ease});
  const press = interpolate(frame, [52, 58, 64], [1, 0.94, 1], clamp);
  const done = interpolate(frame, [62, 74], [0, 1], {...clamp, easing: ease});
  return (
    <Split
      left={
        <>
          <Line>Practice with</Line>
          <Line delay={6}>virtual money.</Line>
          <Sub>On real Indian market data. No risk, no pressure.</Sub>
        </>
      }
      right={
        <Phone>
          <div style={{padding: 38}}>
            <div style={{fontSize: 24, fontWeight: 600, opacity: 0.55}}>Virtual balance</div>
            <div style={{fontSize: 56, fontWeight: 800, letterSpacing: -2, marginTop: 6}}>
              ₹{Math.round(bal).toLocaleString("en-IN")}
            </div>
            <div
              style={{
                display: "inline-block",
                marginTop: 18,
                padding: "8px 16px",
                borderRadius: 999,
                background: "#E3E8FF",
                color: C.bg,
                fontSize: 20,
                fontWeight: 700,
              }}
            >
              Practice mode
            </div>
            <div
              style={{
                marginTop: 70,
                height: 84,
                borderRadius: 22,
                background: C.bg,
                color: C.white,
                fontSize: 30,
                fontWeight: 800,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transform: `scale(${press})`,
              }}
            >
              Buy
            </div>
            <div
              style={{
                marginTop: 28,
                padding: 24,
                borderRadius: 22,
                background: C.white,
                boxShadow: "0 10px 30px rgba(10,18,64,0.08)",
                opacity: done,
                transform: `translateX(${(1 - done) * 40}px)`,
              }}
            >
              <div style={{fontSize: 22, fontWeight: 700}}>Position opened</div>
              <div style={{fontSize: 20, opacity: 0.6, marginTop: 6}}>
                Tracked live. Your real money stays untouched.
              </div>
            </div>
          </div>
        </Phone>
      }
    />
  );
};

const Icon: React.FC<{kind: "bell" | "breakout" | "mood"}> = ({kind}) => (
  <svg width={64} height={64} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    {kind === "bell" && (
      <>
        <path d="M6 9a6 6 0 0 1 12 0v4l2 3H4l2-3z" />
        <path d="M10 19a2 2 0 0 0 4 0" />
      </>
    )}
    {kind === "breakout" && (
      <>
        <polyline points="3,17 9,11 13,15 21,6" />
        <polyline points="15,6 21,6 21,12" />
      </>
    )}
    {kind === "mood" && (
      <>
        <path d="M4 16a8 8 0 0 1 16 0" />
        <line x1="12" y1="16" x2="17" y2="10" />
      </>
    )}
  </svg>
);

const FEATURES: {kind: "bell" | "breakout" | "mood"; title: string; text: string}[] = [
  {kind: "bell", title: "Live alerts", text: "Get pinged the moment a stock hits your price."},
  {kind: "breakout", title: "Index breakouts", text: "See when an index breaks out, explained simply."},
  {kind: "mood", title: "Market mood", text: "Know how the market feels in one glance."},
];

const SceneFeatures: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return (
    <AbsoluteFill style={{padding: "120px 130px", justifyContent: "center"}}>
      <Line size={96}>Everything you need to learn,</Line>
      <Line size={96} delay={6} color={C.saffron}>
        in plain language.
      </Line>
      <div style={{display: "flex", gap: 40, marginTop: 70}}>
        {FEATURES.map((f, i) => {
          const s = spring({frame: frame - (24 + i * 10), fps, config: {damping: 200}});
          return (
            <div
              key={f.title}
              style={{
                flex: 1,
                padding: 44,
                borderRadius: 32,
                background: i === 1 ? C.white : "rgba(255,255,255,0.1)",
                color: i === 1 ? C.ink : C.white,
                border: i === 1 ? "none" : "2px solid rgba(255,255,255,0.22)",
                opacity: s,
                transform: `scale(${0.92 + 0.08 * s})`,
              }}
            >
              <div style={{color: i === 1 ? C.bg : C.saffron}}>
                <Icon kind={f.kind} />
              </div>
              <div style={{fontSize: 48, fontWeight: 800, letterSpacing: -1.5, marginTop: 22}}>
                {f.title}
              </div>
              <div style={{fontSize: 30, lineHeight: 1.35, marginTop: 12, opacity: 0.8}}>
                {f.text}
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

const AI_TEXT =
  "Banks led the move, and more buyers than sellers pushed prices up. In simple words: confidence is high today.";

const SceneAI: React.FC = () => {
  const frame = useCurrentFrame();
  const q = interpolate(frame, [8, 20], [0, 1], {...clamp, easing: ease});
  const a = interpolate(frame, [26, 36], [0, 1], {...clamp, easing: ease});
  const chars = Math.floor(interpolate(frame, [30, 82], [0, AI_TEXT.length], clamp));
  return (
    <Split
      left={
        <>
          <Line>AI that explains</Line>
          <Line delay={6} color={C.saffron}>
            every move.
          </Line>
          <Sub>Ask why. Get an answer you actually understand.</Sub>
        </>
      }
      right={
        <Phone>
          <div style={{padding: 34, display: "flex", flexDirection: "column", gap: 22}}>
            <div
              style={{
                alignSelf: "flex-end",
                maxWidth: 300,
                padding: "18px 22px",
                borderRadius: "26px 26px 6px 26px",
                background: C.bg,
                color: C.white,
                fontSize: 26,
                fontWeight: 600,
                opacity: q,
              }}
            >
              Why is the market up today?
            </div>
            <div
              style={{
                maxWidth: 330,
                padding: "20px 24px",
                borderRadius: "26px 26px 26px 6px",
                background: C.white,
                boxShadow: "0 10px 30px rgba(10,18,64,0.08)",
                fontSize: 24,
                lineHeight: 1.4,
                opacity: a,
                minHeight: 120,
              }}
            >
              {AI_TEXT.slice(0, chars)}
            </div>
          </div>
        </Phone>
      }
    />
  );
};

const BROKERS = ["Fyers", "Upstox", "Zerodha"];

const SceneOpen: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const tag = useProgress(4, 16);
  return (
    <AbsoluteFill style={{padding: "0 130px", justifyContent: "center"}}>
      <div
        style={{
          alignSelf: "flex-start",
          padding: "12px 26px",
          borderRadius: 999,
          background: C.white,
          color: C.bg,
          fontSize: 32,
          fontWeight: 800,
          opacity: tag,
          marginBottom: 36,
        }}
      >
        {"</>"} Open source on GitHub
      </div>
      <Line size={130}>Free. Forever.</Line>
      <Sub delay={18}>Connect your broker only when you’re confident.</Sub>
      <div style={{display: "flex", gap: 28, marginTop: 60}}>
        {BROKERS.map((b, i) => {
          const s = spring({frame: frame - (40 + i * 8), fps, config: {damping: 200}});
          return (
            <div
              key={b}
              style={{
                padding: "26px 50px",
                borderRadius: 24,
                border: "2px solid rgba(255,255,255,0.35)",
                background: "rgba(255,255,255,0.1)",
                color: C.white,
                fontSize: 40,
                fontWeight: 700,
                opacity: s,
                transform: `translateX(${(1 - s) * -60}px)`,
              }}
            >
              {b}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

const SceneCTA: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const logo = spring({frame, fps, config: {damping: 14, stiffness: 120}});
  const count = interpolate(frame, [14, 62], [0, 10000], {...clamp, easing: ease});
  const btn = spring({frame: frame - 50, fps, config: {damping: 200}});
  return (
    <AbsoluteFill style={{alignItems: "center", justifyContent: "center"}}>
      <div style={{transform: `scale(${logo})`}}>
        <Logo size={150} />
      </div>
      <div style={{fontSize: 96, fontWeight: 900, letterSpacing: -3, color: C.white, marginTop: 30}}>
        OptionXi
      </div>
      <div style={{fontSize: 150, fontWeight: 900, letterSpacing: -5, color: C.saffron, lineHeight: 1.05}}>
        {Math.round(count).toLocaleString("en-IN")}+
      </div>
      <div style={{fontSize: 44, fontWeight: 600, color: C.soft}}>traders have already installed it</div>
      <div
        style={{
          marginTop: 56,
          padding: "26px 64px",
          borderRadius: 24,
          background: C.saffron,
          color: C.ink,
          fontSize: 44,
          fontWeight: 800,
          opacity: btn,
          transform: `translateY(${(1 - btn) * 30}px)`,
        }}
      >
        Download on Google Play
      </div>
    </AbsoluteFill>
  );
};

const BOUNDARIES = [S2.from, S3.from, S4.from, S5.from, S6.from];

const Wipes: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <>
      {BOUNDARIES.map((b) => {
        if (frame < b - 8 || frame > b + 8) return null;
        const x = interpolate(frame, [b - 8, b + 8], [-100, 100], {...clamp, easing: Easing.inOut(Easing.cubic)});
        return (
          <AbsoluteFill
            key={b}
            style={{background: C.saffron, transform: `translateX(${x}%)`}}
          />
        );
      })}
    </>
  );
};

const Backdrop: React.FC = () => (
  <AbsoluteFill
    style={{
      background: C.bg,
      backgroundImage:
        "linear-gradient(rgba(255,255,255,0.05) 2px, transparent 2px), linear-gradient(90deg, rgba(255,255,255,0.05) 2px, transparent 2px)",
      backgroundSize: "120px 120px",
    }}
  />
);

export const Reel: React.FC<{voiceover?: boolean}> = ({voiceover = false}) => (
  <AbsoluteFill style={{fontFamily: FONT}}>
    <Backdrop />

    <Sequence from={S1.from} durationInFrames={S1.dur}>
      <SceneHook />
    </Sequence>
    <Sequence from={S2.from} durationInFrames={S2.dur}>
      <SceneVirtual />
    </Sequence>
    <Sequence from={S3.from} durationInFrames={S3.dur}>
      <SceneFeatures />
    </Sequence>
    <Sequence from={S4.from} durationInFrames={S4.dur}>
      <SceneAI />
    </Sequence>
    <Sequence from={S5.from} durationInFrames={S5.dur}>
      <SceneOpen />
    </Sequence>
    <Sequence from={S6.from} durationInFrames={S6.dur}>
      <SceneCTA />
    </Sequence>

    <Wipes />

    {voiceover ? <Audio src={staticFile("optionxi-youtube-vo.mp3")} /> : null}
    <SafeGuide />
  </AbsoluteFill>
);

export const YoutubeVideoIntro = Reel;
export default Reel;