import { useEffect, useRef, useState } from "react";

// A pose = shoulder/elbow angles for each arm (degrees, SVG clockwise-positive)
// + whether the index finger shows (0 or 1).
type PoseName = "idle" | "talk" | "point" | "wave";

interface Pose {
  Lsh: number;
  Lel: number;
  Rsh: number;
  Rel: number;
  Lf: number;
  Rf: number;
}

const POSES: Record<PoseName, Pose> = {
  idle: { Lsh: 4, Lel: -3, Rsh: -4, Rel: 3, Lf: 0, Rf: 0 },
  talk: { Lsh: 24, Lel: -40, Rsh: -24, Rel: 40, Lf: 0, Rf: 0 },
  point: { Lsh: 148, Lel: 12, Rsh: -4, Rel: 3, Lf: 1, Rf: 0 },
  wave: { Lsh: 4, Lel: -3, Rsh: -112, Rel: -35, Lf: 0, Rf: 0 },
};

const ORDER: PoseName[] = ["idle", "talk", "point", "wave"];

const BUTTONS: { key: PoseName | "auto"; label: string }[] = [
  { key: "idle", label: "Idle" },
  { key: "talk", label: "Talk" },
  { key: "point", label: "Point up" },
  { key: "wave", label: "Wave" },
  { key: "auto", label: "Auto cycle" },
];

const CSS = `
.avatar-page { --bg:#f9f8f4; --ink:#1c1b22; --accent:#4f7be8;
  box-sizing:border-box; min-height:100vh; display:flex; flex-direction:column; align-items:center; gap:14px; padding:16px;
  background: radial-gradient(ellipse 60% 30% at 50% 100%, #ece8e0 0%, transparent 70%), var(--bg); color:var(--ink);
  font:15px/1.4 system-ui,-apple-system,Segoe UI,sans-serif; }
.avatar-page *, .avatar-page *::before, .avatar-page *::after { box-sizing:border-box; }
.avatar-stage { width:min(92vw,400px); }
.avatar-stage svg { width:100%; height:auto; max-height:74vh; display:block; margin:0 auto; }
.avatar-row { display:flex; flex-wrap:wrap; gap:8px; justify-content:center; }
.avatar-row button { font:600 14px system-ui; padding:9px 14px; border-radius:10px; border:1px solid #c3d3f5; background:#fff; color:var(--ink); cursor:pointer; }
.avatar-row button.on { background:var(--accent); color:#fff; border-color:var(--accent); }
.avatar-row button:focus-visible { outline:2px solid var(--accent); outline-offset:2px; }
.avatar-page small { color:#6b6878; }
`;

export default function Avatar() {
  const [pose, setPose] = useState<PoseName>("idle");
  const [auto, setAuto] = useState(false);

  // SVG parts that get animated imperatively every frame
  const armL = useRef<SVGGElement>(null);
  const foreL = useRef<SVGGElement>(null);
  const armR = useRef<SVGGElement>(null);
  const foreR = useRef<SVGGElement>(null);
  const fingerL = useRef<SVGRectElement>(null);
  const fingerR = useRef<SVGRectElement>(null);
  const upper = useRef<SVGGElement>(null);
  const head = useRef<SVGGElement>(null);

  // Animation state lives in refs so the rAF loop never causes re-renders
  const cur = useRef<Pose>({ ...POSES.idle });
  const target = useRef<Pose>({ ...POSES.idle });
  const poseName = useRef<PoseName>("idle");

  // Ease toward whichever pose is selected
  useEffect(() => {
    poseName.current = pose;
    target.current = { ...POSES[pose] };
  }, [pose]);

  // Auto cycle through the poses
  useEffect(() => {
    if (!auto) return;
    let i = ORDER.indexOf(poseName.current);
    const id = window.setInterval(() => {
      i = (i + 1) % ORDER.length;
      setPose(ORDER[i]);
    }, 2200);
    return () => window.clearInterval(id);
  }, [auto]);

  // Animation loop
  useEffect(() => {
    const t0 = performance.now();
    let raf = 0;

    const tick = (now: number) => {
      const time = (now - t0) / 1000;
      const c = cur.current;
      const t = target.current;
      (Object.keys(c) as (keyof Pose)[]).forEach((k) => {
        c[k] += (t[k] - c[k]) * 0.12;
      });

      const wob = poseName.current === "wave" ? Math.sin(time * 9) * 14 : 0;
      armL.current?.setAttribute("transform", `translate(142 210) rotate(${c.Lsh})`);
      foreL.current?.setAttribute("transform", `translate(0 72) rotate(${c.Lel})`);
      armR.current?.setAttribute("transform", `translate(258 210) rotate(${c.Rsh})`);
      foreR.current?.setAttribute("transform", `translate(0 72) rotate(${c.Rel + wob})`);
      fingerL.current?.setAttribute("opacity", c.Lf.toFixed(2));
      fingerR.current?.setAttribute("opacity", c.Rf.toFixed(2));

      const bob = Math.sin(time * 2.2) * 1.6;
      upper.current?.setAttribute("transform", `translate(0 ${bob.toFixed(2)})`);
      head.current?.setAttribute(
        "transform",
        `rotate(${(Math.sin(time * 1.4) * 1.2).toFixed(2)} 200 165)`
      );

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const onButton = (key: PoseName | "auto") => {
    if (key === "auto") {
      setAuto((a) => !a);
    } else {
      setAuto(false);
      setPose(key);
    }
  };

  return (
    <div className="avatar-page">
      <style>{CSS}</style>

      <div className="avatar-stage">
        <svg
          viewBox="0 0 400 600"
          xmlns="http://www.w3.org/2000/svg"
          role="img"
          aria-label="Flat cartoon presenter avatar with curly hair, beard and glasses"
        >
          {/* ground shadow */}
          <ellipse cx="200" cy="590" rx="115" ry="8" fill="#000" opacity=".07" />

          {/* LEGS + SHOES (static) */}
          <g id="legs">
            <path d="M150 348 L252 348 L250 558 L208 558 L201 398 L194 558 L152 558 Z" fill="#33496e" />
            <path d="M152 548 L194 548 L194 560 L152 560 Z" fill="#263a5c" />
            <path d="M208 548 L250 548 L250 560 L208 560 Z" fill="#263a5c" />
            {/* sneakers */}
            <g fill="#fbf9f6" stroke="#d3cfc9" strokeWidth="3" strokeLinejoin="round">
              <path d="M142 574 Q142 558 170 561 L194 567 Q198 580 194 586 L146 586 Q140 584 142 574 Z" />
              <path d="M258 574 Q258 558 230 561 L206 567 Q202 580 206 586 L254 586 Q260 584 258 574 Z" />
            </g>
            <g fill="none" stroke="#d3cfc9" strokeWidth="2.5" strokeLinecap="round">
              <path d="M162 566 q8 3 14 8" />
              <path d="M168 562 q8 3 14 8" />
              <path d="M238 566 q-8 3 -14 8" />
              <path d="M232 562 q-8 3 -14 8" />
            </g>
          </g>

          {/* UPPER BODY (bobs) */}
          <g ref={upper} id="upper">
            {/* shirt torso */}
            <path
              d="M146 200 Q200 184 254 200 Q258 206 258 222 L260 362 Q200 372 140 362 L142 222 Q142 206 146 200 Z"
              fill="#c3dafc"
            />
            <path d="M142 358 Q200 368 260 358" fill="none" stroke="#a9c6f5" strokeWidth="3" strokeLinecap="round" />
            {/* placket + buttons */}
            <path d="M201 226 L201 364" stroke="#8fb0ea" strokeWidth="3" fill="none" strokeLinecap="round" />
            <g fill="#8fb0ea">
              <circle cx="201" cy="252" r="3.6" />
              <circle cx="201" cy="282" r="3.6" />
              <circle cx="201" cy="312" r="3.6" />
              <circle cx="201" cy="340" r="3.6" />
            </g>
            {/* chest pocket (viewer's right) */}
            <path
              d="M217 246 L243 246 L243 276 L230 284 L217 276 Z"
              fill="#c3dafc"
              stroke="#8fb0ea"
              strokeWidth="3"
              strokeLinejoin="round"
            />

            {/* LEFT arm (viewer's left). Forearm first so the sleeve cuff overlaps it. */}
            <g ref={armL} id="armL" transform="translate(142 210)">
              <g ref={foreL} id="foreL" transform="translate(0 72)">
                <rect x="-8" y="-2" width="16" height="64" rx="8" fill="#e5a672" />
                <g id="handL" transform="translate(0 66)">
                  <rect ref={fingerL} id="fingerL" x="-3.5" y="6" width="7" height="25" rx="3.5" fill="#e5a672" opacity="0" />
                  <circle r="11" fill="#e5a672" />
                  <circle cx="6" cy="4" r="5" fill="#e5a672" />
                </g>
              </g>
              <rect x="-12" y="-6" width="24" height="84" rx="12" fill="#c3dafc" stroke="#a9c6f5" strokeWidth="2" />
              <rect x="-14" y="58" width="28" height="20" rx="9" fill="#b9d3fb" stroke="#8fb0ea" strokeWidth="2.5" />
              <circle r="15" fill="#c3dafc" />
            </g>

            {/* RIGHT arm (viewer's right, wears the watch) */}
            <g ref={armR} id="armR" transform="translate(258 210)">
              <g ref={foreR} id="foreR" transform="translate(0 72)">
                <rect x="-8" y="-2" width="16" height="64" rx="8" fill="#e5a672" />
                <rect x="-9" y="40" width="18" height="9" rx="3" fill="#6a5a50" />
                <circle cx="0" cy="44.5" r="6.5" fill="#fff" stroke="#7a7470" strokeWidth="3" />
                <g id="handR" transform="translate(0 66)">
                  <rect ref={fingerR} id="fingerR" x="-3.5" y="6" width="7" height="25" rx="3.5" fill="#e5a672" opacity="0" />
                  <circle r="11" fill="#e5a672" />
                  <circle cx="-6" cy="4" r="5" fill="#e5a672" />
                </g>
              </g>
              <rect x="-12" y="-6" width="24" height="84" rx="12" fill="#c3dafc" stroke="#a9c6f5" strokeWidth="2" />
              <rect x="-14" y="58" width="28" height="20" rx="9" fill="#b9d3fb" stroke="#8fb0ea" strokeWidth="2.5" />
              <circle r="15" fill="#c3dafc" />
            </g>

            {/* NECK + V of skin */}
            <rect x="185" y="150" width="30" height="48" rx="10" fill="#d0905c" />
            <path d="M187 192 L215 192 L201 228 Z" fill="#d0905c" />
            {/* collar flaps */}
            <g fill="#c3dafc" stroke="#8fb0ea" strokeWidth="3" strokeLinejoin="round">
              <path d="M186 190 L166 206 L184 224 L201 228 L194 206 Z" />
              <path d="M216 190 L236 206 L218 224 L201 228 L208 206 Z" />
            </g>

            {/* HEAD */}
            <g ref={head} id="head">
              {/* ears */}
              <ellipse cx="152" cy="120" rx="8" ry="14" fill="#e5a672" />
              <ellipse cx="248" cy="120" rx="8" ry="14" fill="#e5a672" />
              <path d="M152 114 q-3 6 0 12" stroke="#c98a58" strokeWidth="2.5" fill="none" strokeLinecap="round" />
              <path d="M248 114 q3 6 0 12" stroke="#c98a58" strokeWidth="2.5" fill="none" strokeLinecap="round" />
              {/* face */}
              <path
                d="M152 106 C152 68 176 55 200 55 C224 55 248 68 248 106 C248 146 226 172 200 172 C174 172 152 146 152 106 Z"
                fill="#e5a672"
              />
              {/* soft cheek blush */}
              <ellipse cx="170" cy="140" rx="11" ry="7" fill="#e58a6a" opacity=".35" />
              <ellipse cx="230" cy="140" rx="11" ry="7" fill="#e58a6a" opacity=".35" />

              {/* curly hair */}
              <g fill="#2a2522">
                <ellipse cx="200" cy="86" rx="50" ry="26" />
                <circle cx="148" cy="92" r="15" />
                <circle cx="151" cy="77" r="15" />
                <circle cx="160" cy="64" r="16" />
                <circle cx="174" cy="54" r="16" />
                <circle cx="191" cy="49" r="16" />
                <circle cx="209" cy="49" r="16" />
                <circle cx="226" cy="54" r="16" />
                <circle cx="240" cy="64" r="16" />
                <circle cx="249" cy="77" r="15" />
                <circle cx="252" cy="92" r="15" />
                <circle cx="172" cy="72" r="16" />
                <circle cx="200" cy="66" r="17" />
                <circle cx="228" cy="72" r="16" />
                <circle cx="154" cy="108" r="9" />
                <circle cx="246" cy="108" r="9" />
                <circle cx="168" cy="88" r="11" />
                <circle cx="188" cy="86" r="11" />
                <circle cx="212" cy="86" r="11" />
                <circle cx="232" cy="88" r="11" />
              </g>
              <g fill="none" stroke="#4a403b" strokeWidth="2.5" strokeLinecap="round">
                <path d="M158 62 q7 -6 13 0" />
                <path d="M182 50 q8 -6 14 0" />
                <path d="M208 52 q8 -6 14 0" />
                <path d="M232 60 q8 -5 13 2" />
                <path d="M146 86 q5 -6 11 0" />
                <path d="M244 86 q5 -6 11 1" />
                <path d="M174 74 q7 -5 12 0" />
                <path d="M216 74 q7 -5 12 1" />
              </g>

              {/* beard */}
              <path
                d="M152 112 C150 160 170 188 200 188 C230 188 250 160 248 112 C245 130 236 142 224 146 L176 146 C164 142 155 130 152 112 Z"
                fill="#2a2220"
              />
              {/* smile (lips + teeth), then mustache on top */}
              <path d="M187 157 Q200 171 213 157 Q200 163 187 157 Z" fill="#b8584a" />
              <path d="M191 158 Q200 165 209 158 Q200 161 191 158 Z" fill="#fff" />
              <path d="M170 152 Q185 140 200 148 Q215 140 230 152 Q216 158 200 154 Q184 158 170 152 Z" fill="#2a2220" />
              {/* nose */}
              <path d="M198 118 Q196 134 193 140" stroke="#c98a58" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity=".8" />
              <path d="M189 142 Q191 134 200 134 Q209 134 211 142 Q211 148 200 148 Q189 148 189 142 Z" fill="#d99a66" />
              <path d="M190 144 Q200 150 210 144" stroke="#b87a4c" strokeWidth="2.5" fill="none" strokeLinecap="round" />
              <g fill="#a8643c">
                <ellipse cx="195" cy="145" rx="1.8" ry="1.2" />
                <ellipse cx="205" cy="145" rx="1.8" ry="1.2" />
              </g>

              {/* brows + eyes */}
              <path d="M162 105 Q176 94 194 101 Q178 98 162 105 Z" fill="#2a2522" stroke="#2a2522" strokeWidth="4" strokeLinejoin="round" />
              <path d="M238 105 Q224 94 206 101 Q222 98 238 105 Z" fill="#2a2522" stroke="#2a2522" strokeWidth="4" strokeLinejoin="round" />
              <g fill="#fff">
                <ellipse cx="180" cy="124.5" rx="7" ry="5.8" />
                <ellipse cx="220" cy="124.5" rx="7" ry="5.8" />
              </g>
              <g fill="#4a2e1c">
                <circle cx="181" cy="124.5" r="5" />
                <circle cx="221" cy="124.5" r="5" />
              </g>
              <g fill="#120b08">
                <circle cx="181" cy="124.5" r="2.6" />
                <circle cx="221" cy="124.5" r="2.6" />
              </g>
              <g fill="#fff">
                <circle cx="182.8" cy="122.6" r="1.6" />
                <circle cx="222.8" cy="122.6" r="1.6" />
              </g>
              <g fill="none" stroke="#2a1a12" strokeWidth="2" strokeLinecap="round">
                <path d="M171 121 Q180 114 189 121" />
                <path d="M211 121 Q220 114 229 121" />
              </g>

              {/* olive glasses with amber tint */}
              <g strokeLinejoin="round">
                <rect x="164" y="113" width="32" height="23" rx="9" fill="#c79868" fillOpacity=".38" stroke="#5d6244" strokeWidth="3.5" />
                <rect x="204" y="113" width="32" height="23" rx="9" fill="#c79868" fillOpacity=".38" stroke="#5d6244" strokeWidth="3.5" />
                <path d="M169 132 Q180 136 191 132 M209 132 Q220 136 231 132" fill="none" stroke="#e8c4ac" strokeWidth="1.8" strokeLinecap="round" />
                <path d="M196 121 Q200 117 204 121" fill="none" stroke="#5d6244" strokeWidth="3.5" />
                <path d="M164 120 L153 118 M236 120 L247 118" fill="none" stroke="#5d6244" strokeWidth="3.5" strokeLinecap="round" />
              </g>
            </g>
          </g>
        </svg>
      </div>

      <div className="avatar-row">
        {BUTTONS.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            className={key === "auto" ? (auto ? "on" : "") : pose === key ? "on" : ""}
            onClick={() => onButton(key)}
          >
            {label}
          </button>
        ))}
      </div>
      <small>Every part is a separate SVG group, so each arm rotates at the shoulder and elbow.</small>
    </div>
  );
}