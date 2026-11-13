/**
 * OptionXi — "Market Mood" reel  (1080x1920, 30fps, 900 frames = 30s)
 *
 * Instagram safe zone from shared/safe-area.tsx.
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
import {getSafe, SafeGuide} from "../shared/safe-area";

export const config = {
  durationInFrames: 900,
  fps: 30,
  width: 1080,
  height: 1920,
};
const SAFE = getSafe(config);

// ───────────────────────── tokens ─────────────────────────
const C = {
  navy: "#0B1020",
  indigo: "#6366F1",
  blue: "#3B82F6",
  green: "#10B981",
  red: "#F43F5E",
  amber: "#EAB308",
  ink: "#0F172A",
  mute: "#64748B",
  bg: "#F4F5FB",
};
const FONT =
  '"Inter", "SF Pro Display", -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';
const LOGO = "https://optionxi.com/assets/images/logo_xi.png";
const BADGE =
  "https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ease = Easing.bezier(0.16, 1, 0.3, 1);
const prog = (f: number, a: number, b: number) =>
  interpolate(f, [a, b], [0, 1], { ...clamp, easing: ease });

// ───────────────────────── building blocks ─────────────────────────
const Background: React.FC = () => {
  const f = useCurrentFrame();
  const blob = (
    x: number,
    y: number,
    size: number,
    color: string,
    ph: number
  ) => (
    <div
      style={{
        position: "absolute",
        left: x + Math.sin(f / 70 + ph) * 60,
        top: y + Math.cos(f / 90 + ph) * 60,
        width: size,
        height: size,
        borderRadius: "50%",
        background: color,
        filter: "blur(140px)",
        opacity: 0.55,
      }}
    />
  );
  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(160deg, ${C.navy} 0%, #151B45 60%, #1E1458 100%)`,
      }}
    >
      {blob(-200, 200, 700, C.indigo, 0)}
      {blob(600, 1100, 800, C.blue, 2)}
      {blob(100, 1500, 500, "#7C3AED", 4)}
    </AbsoluteFill>
  );
};

/** Fades a scene in/out so cuts feel smooth */
const SceneFade: React.FC<{ dur: number; children: React.ReactNode }> = ({
  dur,
  children,
}) => {
  const f = useCurrentFrame();
  const o = Math.min(
    interpolate(f, [0, 10], [0, 1], clamp),
    interpolate(f, [dur - 10, dur], [1, 0], clamp)
  );
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
}> = ({ text, size = 88, hl = {}, delay = 0, weight = 800, color = "#fff" }) => {
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
        letterSpacing: -2,
        color,
        textAlign: "center",
      }}
    >
      {text.split(" ").map((w, i) => {
        const s = spring({
          frame: f - delay - i * 4,
          fps,
          config: { damping: 14, stiffness: 120 },
        });
        const clean = w.replace(/[^\w%]/g, "");
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              opacity: s,
              transform: `translateY(${(1 - s) * 50}px) scale(${0.85 + s * 0.15})`,
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

/** Caption block pinned to the top safe area */
const Cap: React.FC<{
  from: number;
  to: number;
  big: string;
  small?: string;
  hl?: Record<string, string>;
}> = ({ from, to, big, small, hl }) => (
  <Sequence from={from} durationInFrames={to - from} layout="none">
    <CapInner dur={to - from} big={big} small={small} hl={hl} />
  </Sequence>
);
const CapInner: React.FC<{
  dur: number;
  big: string;
  small?: string;
  hl?: Record<string, string>;
}> = ({ dur, big, small, hl }) => {
  const f = useCurrentFrame();
  const out = interpolate(f, [dur - 8, dur], [1, 0], clamp);
  return (
    <div
      style={{
        position: "absolute",
        top: SAFE.y0,
        left: SAFE.left,
        right: SAFE.left,
        height: 260,
        opacity: out,
        transform: `translateY(${(1 - out) * -20}px)`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 18,
      }}
    >
      <Words text={big} hl={hl} />
      {small && (
        <div
          style={{
            fontFamily: FONT,
            fontSize: 40,
            fontWeight: 500,
            color: "rgba(255,255,255,.7)",
            opacity: prog(f, 14, 30),
          }}
        >
          {small}
        </div>
      )}
    </div>
  );
};

// ───────────────────────── phone ─────────────────────────
const PHONE_W = 480;
const PHONE_H = 980;

const Phone: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: f, fps, config: { damping: 16, stiffness: 80 } });
  const y = interpolate(s, [0, 1], [800, 0]);
  const rot = interpolate(s, [0, 1], [10, 0]);
  const float = Math.sin(f / 25) * 6;
  return (
    <div
      style={{
        position: "absolute",
        left: (config.width - PHONE_W) / 2,
        top: 560,
        width: PHONE_W,
        height: PHONE_H,
        padding: 12,
        boxSizing: "border-box",
        borderRadius: 68,
        background: "#0b0b10",
        boxShadow:
          "0 0 0 3px #2a2f45, 0 60px 120px rgba(0,0,0,.55), 0 0 180px rgba(99,102,241,.4)",
        transform: `translateY(${y + float}px) rotate(${rot}deg)`,
      }}
    >
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          borderRadius: 56,
          overflow: "hidden",
          background: C.bg,
          fontFamily: FONT,
          color: C.ink,
        }}
      >
        {children}
        {/* dynamic island */}
        <div
          style={{
            position: "absolute",
            top: 14,
            left: "50%",
            marginLeft: -55,
            width: 110,
            height: 32,
            borderRadius: 20,
            background: "#000",
          }}
        />
      </div>
    </div>
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
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {children}
      </div>
    </div>
  );
};

const StatusBar: React.FC<{ time: string }> = ({ time }) => (
  <div
    style={{
      height: 56,
      display: "flex",
      alignItems: "center",
      padding: "6px 34px 0",
      fontSize: 18,
      fontWeight: 700,
    }}
  >
    {time}
  </div>
);

// ───────────────────────── SCENE 1 · intro ─────────────────────────
const Intro: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({ frame: f, fps, config: { damping: 9, stiffness: 110 } });
  const shrink = prog(f, 34, 62);
  const logoSize = interpolate(shrink, [0, 1], [320, 130]);
  const logoY = interpolate(shrink, [0, 1], [880, 420]);
  const stage = f < 60 ? -1 : f < 82 ? 0 : f < 104 ? 1 : 2;
  const stageStart = [60, 82, 104][Math.max(0, stage)];
  const label = ["UP ↗", "DOWN ↘", "?"][Math.max(0, stage)];
  const word = stage < 0 ? "" : label;
  const wordColor = [C.blue, C.red, "#E2E8F0"][Math.max(0, stage)];
  const wordPop = spring({
    frame: f - stageStart,
    fps,
    config: { damping: 10, stiffness: 200 },
  });
  return (
    <SceneFade dur={130}>
      {[0, 1, 2].map((i) => {
        const p = prog(f, 4 + i * 8, 44 + i * 8);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: config.width / 2 - 400 * p,
              top: 880 - 400 * p,
              width: 800 * p,
              height: 800 * p,
              marginTop: 0,
              borderRadius: "50%",
              border: `3px solid rgba(129,140,248,${0.6 * (1 - p)})`,
            }}
          />
        );
      })}
      <Img
        src={LOGO}
        style={{
          position: "absolute",
          left: config.width / 2 - logoSize / 2,
          top: logoY - logoSize / 2,
          width: logoSize,
          height: logoSize,
          objectFit: "contain",
          transform: `scale(${pop})`,
          filter: "drop-shadow(0 20px 60px rgba(99,102,241,.7))",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 620,
          left: SAFE.left,
          right: SAFE.left,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 10,
        }}
      >
        <Sequence from={44} layout="none">
          <Words text="Is the market going" size={78} />
        </Sequence>
        <div
          style={{
            height: 190,
            fontFamily: FONT,
            fontSize: 170,
            fontWeight: 900,
            letterSpacing: -6,
            color: wordColor,
            transform: `scale(${0.7 + wordPop * 0.3})`,
            textShadow: `0 0 60px ${wordColor}88`,
          }}
        >
          {word}
        </div>
        <Sequence from={96} layout="none">
          <Words
            text="OptionXi reads it for you."
            size={64}
            weight={700}
            hl={{ OptionXi: "#A5B4FC" }}
          />
        </Sequence>
      </div>
    </SceneFade>
  );
};

// ───────────────────────── SCENE 2 · sentiment ─────────────────────────
const NIFTY_DOTS = Array.from({ length: 12 }, (_, i) => (i === 7 ? "down" : "up"));
const BANK_DOTS = Array.from({ length: 12 }, (_, i) =>
  i === 2 || i === 8 ? "up" : "down"
);

const SentimentScreen: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const SWITCH = 235;
  const bank = f >= SWITCH;
  const toRed = prog(f, SWITCH, SWITCH + 18);
  const pct = interpolate(f, [110, 160, 225, 265], [0, 71, 71, 46], clamp);
  const pill = prog(f, SWITCH - 12, SWITCH + 2);
  const reading = f > 150;
  const dotsDone = Math.min(12, Math.max(0, Math.floor((f - 40) / 5)));
  const upCount = (bank ? BANK_DOTS : NIFTY_DOTS).filter(
    (d, i) => d === "up" && (bank || i < dotsDone)
  ).length;
  const downCount = (bank ? BANK_DOTS : NIFTY_DOTS).filter(
    (d, i) => d === "down" && (bank || i < dotsDone)
  ).length;

  return (
    <>
      <StatusBar time={bank ? "8:29" : "8:31"} />
      <div style={{ padding: "6px 22px" }}>
        <div style={{ fontSize: 34, fontWeight: 800, letterSpacing: -1 }}>Market mood</div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 16, color: C.mute }}>
          <span
            style={{
              width: 10,
              height: 10,
              borderRadius: 5,
              background: C.green,
              opacity: 0.5 + 0.5 * Math.sin(f / 6),
            }}
          />
          Live, updates by itself
        </div>

        <div
          style={{
            position: "relative",
            marginTop: 16,
            display: "flex",
            background: "#fff",
            borderRadius: 20,
            padding: 5,
            boxSizing: "border-box",
            border: "1px solid #E5E7F2",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 5,
              left: 5 + pill * 200,
              width: 200,
              height: 46,
              borderRadius: 16,
              background: C.indigo,
            }}
          />
          {["Nifty 50", "Bank Nifty"].map((t, i) => (
            <div
              key={t}
              style={{
                flex: 1,
                zIndex: 1,
                height: 46,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 19,
                fontWeight: 700,
                color: (i === 0 ? pill < 0.5 : pill >= 0.5) ? "#fff" : C.mute,
              }}
            >
              {t}
            </div>
          ))}
        </div>

        <div
          style={{
            position: "relative",
            marginTop: 18,
            height: 250,
            borderRadius: 30,
            overflow: "hidden",
            color: "#fff",
            boxShadow: "0 20px 50px rgba(59,130,246,.3)",
          }}
        >
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg,#3B82F6,#5B6CF6)" }} />
          <div
            style={{
              position: "absolute",
              inset: 0,
              opacity: toRed,
              background: "linear-gradient(135deg,#7A1F33,#4A2358)",
            }}
          />
          <div style={{ position: "relative", padding: 22 }}>
            <div style={{ fontSize: 15, opacity: 0.7 }}>Latest read</div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10 }}>
              <div style={{ width: 230 }}>
                <div style={{ fontSize: 31, fontWeight: 800, lineHeight: 1.1, letterSpacing: -0.5 }}>
                  {!reading ? "Reading the market…" : bank ? "↘ Likely going down" : "↗ Likely going up"}
                </div>
                <div style={{ fontSize: 17, opacity: 0.85, marginTop: 10, lineHeight: 1.3 }}>
                  {!reading
                    ? "12 gauges are voting"
                    : bank
                    ? "Sellers lead. 10 of 12 say down."
                    : "Buyers lead. 11 of 12 say up."}
                </div>
              </div>
              <div style={{ textAlign: "center" }}>
                <Ring pct={pct} size={128} stroke={13} color="#fff" track="rgba(255,255,255,.25)">
                  <span style={{ fontSize: 34, fontWeight: 800 }}>{Math.round(pct)}%</span>
                </Ring>
                <div style={{ fontSize: 13, marginTop: 6, opacity: 0.85 }}>
                  {pct < 5 ? "…" : bank ? "Low confidence" : "High confidence"}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div
          style={{
            marginTop: 18,
            background: "#fff",
            borderRadius: 28,
            padding: 20,
            border: "1px solid #E8EAF4",
          }}
        >
          <div style={{ fontSize: 21, fontWeight: 800 }}>How the gauges voted</div>
          <div style={{ display: "flex", gap: 14, fontSize: 15, fontWeight: 700, margin: "10px 0 14px" }}>
            <span style={{ color: C.blue }}>● {upCount} up</span>
            <span style={{ color: C.red }}>● {downCount} down</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: 10 }}>
            {(bank ? BANK_DOTS : NIFTY_DOTS).map((d, i) => {
              const startF = bank ? SWITCH + 4 + i * 2 : 40 + i * 5;
              const s = spring({ frame: f - startF, fps, config: { damping: 8, stiffness: 160 } });
              return (
                <div
                  key={i}
                  style={{
                    height: 52,
                    borderRadius: 16,
                    background: d === "up" ? C.blue : C.red,
                    opacity: Math.min(1, s),
                    transform: `scale(${0.3 + 0.7 * Math.min(1.15, s)})`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff",
                    fontSize: 24,
                    fontWeight: 800,
                  }}
                >
                  {d === "up" ? "↑" : "↓"}
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
          {["Short-term", "Long-term"].map((t) => (
            <div
              key={t}
              style={{
                flex: 1,
                padding: "14px 16px",
                borderRadius: 20,
                background: bank ? "#FFF0F3" : "#EEF4FF",
                border: `1px solid ${bank ? "#FBC9D3" : "#CFE0FF"}`,
              }}
            >
              <div style={{ fontSize: 24, fontWeight: 800, color: bank ? C.red : C.blue }}>
                {bank ? "Down" : "Up"}
              </div>
              <div style={{ fontSize: 14, color: C.mute }}>{t} trend</div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

const Sentiment: React.FC = () => (
  <SceneFade dur={300}>
    <Cap from={6} to={104} big="12 signals. One vote each." hl={{ vote: "#93C5FD" }} />
    <Cap from={108} to={218} big="Together = a probability" small="How sure are we? The ring shows it." hl={{ probability: "#6EE7B7" }} />
    <Cap from={222} to={298} big="Nifty 50 + Bank Nifty" small="Each gets its own read." hl={{ Nifty: "#A5B4FC", Bank: "#FDA4AF" }} />
    <Phone>
      <SentimentScreen />
    </Phone>
  </SceneFade>
);

// ───────────────────────── SCENE 3 · alerts ─────────────────────────
const N = 34;
const MARK = 27;
const candles = (() => {
  const out: { o: number; c: number; h: number; l: number }[] = [];
  let prev = 22790;
  for (let i = 0; i < N; i++) {
    const target =
      22790 + i * 4.2 + 45 * Math.sin(i / 3.1) + (i > 24 ? (i - 24) * 14 : 0);
    const c = target + ((i * 37) % 17) - 8;
    const wick = 10 + ((i * 53) % 13);
    out.push({ o: prev, c, h: Math.max(prev, c) + wick, l: Math.min(prev, c) - wick });
    prev = c;
  }
  return out;
})();
const MIN = Math.min(...candles.map((c) => c.l)) - 10;
const MAX = Math.max(...candles.map((c) => c.h)) + 30;
const CH_W = 380;
const CH_H = 330;
const yOf = (p: number) => CH_H - ((p - MIN) / (MAX - MIN)) * CH_H;
const DRAW_START = 22;
const DRAW_END = 200;
const MARK_F = DRAW_START + (MARK / N) * (DRAW_END - DRAW_START);

const AlertsScreen: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const count = interpolate(f, [DRAW_START, DRAW_END], [0, N], clamp);
  const chance = interpolate(f, [DRAW_START, MARK_F, DRAW_END], [48, 70.74, 71.4], clamp);
  const crossed = f >= MARK_F;
  const bannerS = spring({ frame: f - MARK_F - 4, fps, config: { damping: 12, stiffness: 120 } });
  const markS = spring({ frame: f - MARK_F, fps, config: { damping: 7, stiffness: 180 } });
  const toggle = prog(f, 8, 24);
  const step = CH_W / N;
  const ripple = prog(f, MARK_F, MARK_F + 40);

  return (
    <>
      <StatusBar time="8:34" />
      <div style={{ padding: "6px 22px" }}>
        <div style={{ fontSize: 34, fontWeight: 800, letterSpacing: -1 }}>Market chart</div>
        <div style={{ fontSize: 16, color: C.mute }}>Nifty 50 · Today</div>

        <div
          style={{
            marginTop: 16,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "#fff",
            border: "1px solid #E8EAF4",
            borderRadius: 22,
            padding: "14px 18px",
          }}
        >
          <div>
            <div style={{ fontSize: 20, fontWeight: 800 }}>🔔 Auto alerts</div>
            <div style={{ fontSize: 14, color: C.mute }}>When chance is above 70%</div>
          </div>
          <div
            style={{
              width: 64,
              height: 36,
              borderRadius: 18,
              background: toggle > 0.5 ? C.green : "#CBD5E1",
              position: "relative",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: 4,
                left: 4 + toggle * 28,
                width: 28,
                height: 28,
                borderRadius: 14,
                background: "#fff",
              }}
            />
          </div>
        </div>

        <div
          style={{
            marginTop: 14,
            background: "#fff",
            border: "1px solid #E8EAF4",
            borderRadius: 22,
            padding: "14px 18px",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
            <div style={{ fontSize: 17, fontWeight: 700, color: C.mute }}>Chance of going up</div>
            <div style={{ fontSize: 34, fontWeight: 900, color: crossed ? C.green : C.amber }}>
              {Math.round(chance)}%
            </div>
          </div>
          <div style={{ position: "relative", height: 16, borderRadius: 8, background: "#EEF0F8", marginTop: 8 }}>
            <div
              style={{
                width: `${chance}%`,
                height: "100%",
                borderRadius: 8,
                background: crossed ? C.green : C.amber,
              }}
            />
            <div style={{ position: "absolute", left: "70%", top: -6, width: 3, height: 28, background: C.ink, borderRadius: 2 }} />
            <div style={{ position: "absolute", left: "70%", top: 24, transform: "translateX(-50%)", fontSize: 12, fontWeight: 800 }}>
              70%
            </div>
          </div>
        </div>

        <div
          style={{
            marginTop: 30,
            background: "#fff",
            border: "1px solid #E8EAF4",
            borderRadius: 26,
            padding: "14px 16px",
          }}
        >
          <div style={{ display: "flex", gap: 16, padding: "0 0 8px", fontSize: 14, color: C.mute, fontWeight: 600 }}>
            <span><b style={{ color: C.blue }}>▲</b> Up move</span>
            <span><b style={{ color: C.red }}>▼</b> Down move</span>
          </div>
          <svg width="100%" viewBox={`0 -30 ${CH_W} ${CH_H + 40}`} style={{ display: "block", overflow: "visible" }}>
            {[0, 1, 2, 3].map((i) => (
              <line key={i} x1={0} x2={CH_W} y1={(i * CH_H) / 3} y2={(i * CH_H) / 3} stroke="#EEF0F8" />
            ))}
            {candles.map((cd, i) => {
              const vis = Math.max(0, Math.min(1, count - i));
              if (vis <= 0) return null;
              const up = cd.c >= cd.o;
              const col = up ? C.blue : C.red;
              const x = i * step + step / 2;
              const top = yOf(Math.max(cd.o, cd.c));
              const h = Math.max(3, Math.abs(yOf(cd.o) - yOf(cd.c)));
              return (
                <g key={i} opacity={vis}>
                  <line x1={x} x2={x} y1={yOf(cd.h)} y2={yOf(cd.l)} stroke={col} strokeWidth={2} />
                  <rect x={x - step * 0.3} y={top} width={step * 0.6} height={h * vis} rx={2} fill={col} />
                </g>
              );
            })}
            {crossed && (
              <g>
                <circle
                  cx={MARK * step + step / 2}
                  cy={yOf(candles[MARK].h) - 18}
                  r={10 + ripple * 50}
                  fill="none"
                  stroke={C.blue}
                  strokeWidth={3}
                  opacity={1 - ripple}
                />
                <g
                  transform={`translate(${MARK * step + step / 2}, ${yOf(candles[MARK].h) - 18}) scale(${markS})`}
                >
                  <polygon points="0,-16 15,12 -15,12" fill="#fff" stroke="#000" strokeWidth={3} />
                </g>
              </g>
            )}
          </svg>
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          top: 56,
          left: 14,
          right: 14,
          transform: `translateY(${(1 - Math.min(1.1, bannerS)) * -220}px)`,
          background: "rgba(255,255,255,.97)",
          borderRadius: 28,
          padding: "16px 18px",
          display: "flex",
          alignItems: "center",
          gap: 14,
          boxShadow: "0 24px 60px rgba(15,23,42,.35)",
          border: `2px solid ${C.green}`,
        }}
      >
        <Img src={LOGO} style={{ width: 54, height: 54, objectFit: "contain", borderRadius: 14 }} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, color: C.mute, fontWeight: 700 }}>OPTIONXI · now</div>
          <div style={{ fontSize: 19, fontWeight: 800, lineHeight: 1.2 }}>Bullish trend · 70.74% chance</div>
        </div>
      </div>
    </>
  );
};

const Alerts: React.FC = () => (
  <SceneFade dur={270}>
    <Cap from={6} to={150} big="Watching price, live" small="Chance of going up keeps updating." hl={{ live: "#6EE7B7" }} />
    <Cap from={156} to={268} big="Above 70%? Instant alert." small="No staring at charts." hl={{ "70%": "#6EE7B7", Instant: "#93C5FD" }} />
    <Phone>
      <AlertsScreen />
    </Phone>
  </SceneFade>
);

// ───────────────────────── SCENE 4 · CTA ─────────────────────────
const Outro: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const logoS = spring({ frame: f, fps, config: { damping: 9, stiffness: 100 } });
  const starFill = prog(f, 30, 80) * (4.2 / 5);
  const installs = Math.round(prog(f, 40, 90) * 10);
  const badgeS = spring({ frame: f - 70, fps, config: { damping: 12 } });
  const glow = 0.6 + 0.4 * Math.sin(f / 8);
  return (
    <SceneFade dur={200}>
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
          color: "#fff",
        }}
      >
        <Img
          src={LOGO}
          style={{
            width: 200,
            height: 200,
            objectFit: "contain",
            transform: `scale(${logoS}) rotate(${(1 - logoS) * -30}deg)`,
            filter: `drop-shadow(0 20px ${60 * glow}px rgba(99,102,241,.9))`,
          }}
        />
        <div style={{ marginTop: 24 }}>
          <Sequence from={14} layout="none">
            <Words text="Know the mood." size={92} />
          </Sequence>
        </div>
        <div style={{ marginTop: 4 }}>
          <Sequence from={30} layout="none">
            <Words text="Catch the move." size={92} hl={{ move: "#6EE7B7" }} />
          </Sequence>
        </div>

        <div style={{ display: "flex", gap: 28, marginTop: 70, opacity: prog(f, 28, 44) }}>
          <div
            style={{
              width: 390,
              padding: "26px 0",
              borderRadius: 32,
              background: "rgba(255,255,255,.09)",
              border: "1px solid rgba(255,255,255,.18)",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 76, fontWeight: 900, lineHeight: 1 }}>
              {(starFill * 5).toFixed(1)}
            </div>
            <div style={{ position: "relative", display: "inline-block", fontSize: 44, letterSpacing: 4, marginTop: 8 }}>
              <span style={{ color: "rgba(255,255,255,.25)" }}>★★★★★</span>
              <span
                style={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  width: `${(starFill / 1) * 100 * (5 / 5)}%`,
                  overflow: "hidden",
                  whiteSpace: "nowrap",
                  color: C.amber,
                }}
              >
                ★★★★★
              </span>
            </div>
            <div style={{ fontSize: 24, opacity: 0.7, marginTop: 4 }}>Play Store rating</div>
          </div>
          <div
            style={{
              width: 390,
              padding: "26px 0",
              borderRadius: 32,
              background: "rgba(255,255,255,.09)",
              border: "1px solid rgba(255,255,255,.18)",
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            <div style={{ fontSize: 76, fontWeight: 900, lineHeight: 1 }}>{installs}K+</div>
            <div style={{ fontSize: 24, opacity: 0.7, marginTop: 8, minHeight: 44 }}>Installs</div>
          </div>
        </div>

        <div
          style={{
            marginTop: 70,
            opacity: Math.min(1, badgeS),
            transform: `translateY(${(1 - Math.min(1, badgeS)) * 60}px) scale(${0.9 + 0.1 * Math.min(1, badgeS)})`,
          }}
        >
          <Img src={BADGE} style={{ width: 560 }} />
        </div>
        <div style={{ marginTop: 26, fontSize: 30, fontWeight: 600, color: "#A5B4FC", opacity: prog(f, 90, 110) }}>
          Search “OptionXi” on Google Play
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          bottom: SAFE.bottom + 10,
          left: SAFE.left,
          right: SAFE.left,
          textAlign: "center",
          fontFamily: FONT,
          fontSize: 22,
          color: "rgba(255,255,255,.5)",
          opacity: prog(f, 110, 130),
        }}
      >
        A guide, not investment advice. Markets can surprise.
      </div>
    </SceneFade>
  );
};

// ───────────────────────── root ─────────────────────────
export const Reel: React.FC = () => (
  <AbsoluteFill style={{ background: C.navy }}>
    <Background />
    <Sequence from={0} durationInFrames={130}>
      <Intro />
    </Sequence>
    <Sequence from={130} durationInFrames={300}>
      <Sentiment />
    </Sequence>
    <Sequence from={430} durationInFrames={270}>
      <Alerts />
    </Sequence>
    <Sequence from={700} durationInFrames={200}>
      <Outro />
    </Sequence>
    <SafeGuide />
  </AbsoluteFill>
);

export default Reel;