import React from "react";
import { Easing, useCurrentFrame, useVideoConfig } from "remotion";

/**
 * AvatarRig (Warrior) — same rig as the presenter version, new original art.
 * Kept ids/pivots: #upper, #armL/#foreL, #armR/#foreR, #fingerL/#fingerR, #head
 * Shoulder pivots: L (142,210)  R (258,210); elbow pivot = (0,72) in arm space.
 * Deterministic: everything is a pure function of useCurrentFrame().
 */

export type PoseName = "idle" | "talk" | "point" | "wave";

interface Pose { Lsh: number; Lel: number; Rsh: number; Rel: number; Lf: number; Rf: number }

export const POSES: Record<PoseName, Pose> = {
  idle:  { Lsh: 4,   Lel: -3,  Rsh: -4,   Rel: 3,   Lf: 0, Rf: 0 },
  talk:  { Lsh: 24,  Lel: -40, Rsh: -24,  Rel: 40,  Lf: 0, Rf: 0 },
  point: { Lsh: 148, Lel: 12,  Rsh: -4,   Rel: 3,   Lf: 1, Rf: 0 },
  wave:  { Lsh: 4,   Lel: -3,  Rsh: -112, Rel: -35, Lf: 0, Rf: 0 },
};

export interface PoseKey { frame: number; pose: PoseName }

interface Props {
  timeline: PoseKey[];
  transitionFrames?: number;
}

const resolvePose = (frame: number, timeline: PoseKey[], dur: number) => {
  let idx = 0;
  for (let i = 0; i < timeline.length; i++) if (timeline[i].frame <= frame) idx = i;
  const to = timeline[idx];
  const from = timeline[Math.max(0, idx - 1)];
  const raw = idx === 0 ? 1 : Math.min(1, Math.max(0, (frame - to.frame) / dur));
  const t = Easing.out(Easing.cubic)(raw);
  const a = POSES[from.pose], b = POSES[to.pose];
  const c = {} as Pose;
  (Object.keys(a) as (keyof Pose)[]).forEach((k) => { c[k] = a[k] + (b[k] - a[k]) * t; });
  const waveW = to.pose === "wave" ? t : from.pose === "wave" ? 1 - t : 0;
  return { c, waveW };
};

// palette
const SKIN = "#a87350";
const SKIN_D = "#87583d";
const CLOTH = "#394154";
const CLOTH_D = "#292f3e";
const RED = "#a34449";
const RED_D = "#813238";
const HAIR = "#2a2522";
const HAIR_H = "#4a403b";

export const AvatarRig: React.FC<Props> = ({ timeline, transitionFrames = 14 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const time = frame / fps;

  const { c, waveW } = resolvePose(frame, timeline, transitionFrames);
  const wob = Math.sin(time * 9) * 14 * waveW;
  const bob = Math.sin(time * 2.2) * 1.6;
  const headRot = Math.sin(time * 1.4) * 1.2;
  const hairSway = Math.sin(time * 1.1) * 2;

  return (
    <svg
      viewBox="0 0 400 600"
      style={{ width: "100%", height: "100%", display: "block" }}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Flat cartoon avatar, athletic build, curly hair, dark skin, beard, glasses, navy suit with red tie"
    >
      {/* ground shadow */}
      <ellipse cx="200" cy="590" rx="115" ry="8" fill="#000" opacity=".08" />

      {/* LEGS + SHOES (static) — suit trousers */}
      <g id="legs">
        <path d="M150 350 L252 350 L250 556 L206 556 L201 410 L194 556 L152 556 Z" fill={CLOTH} />
        <path d="M201 410 L201 360" stroke={CLOTH_D} strokeWidth="2" opacity=".6" />
        <path d="M172 380 L172 550 M229 380 L229 550" stroke={CLOTH_D} strokeWidth="2" opacity=".35" />
        {/* dress shoes */}
        <g fill="#14161e" stroke="#0b0c11" strokeWidth="2.5" strokeLinejoin="round">
          <path d="M146 574 Q146 556 172 558 L194 562 Q198 578 194 586 L150 586 Q144 584 146 574 Z" />
          <path d="M254 574 Q254 556 228 558 L206 562 Q202 578 206 586 L250 586 Q256 584 254 574 Z" />
        </g>
        <g stroke="#3a3f52" strokeWidth="2" fill="none" strokeLinecap="round">
          <path d="M154 584 H192 M208 584 H246" />
        </g>
      </g>

      {/* UPPER BODY (bobs) */}
      <g id="upper" transform={`translate(0 ${bob.toFixed(2)})`}>
        {/* suit jacket — athletic V-taper */}
        <path
          d="M146 200 Q200 184 254 200 Q267 206 266 228 L254 300 L250 372 Q200 384 150 372 L146 300 L134 228 Q133 206 146 200 Z"
          fill={CLOTH}
        />
        <path d="M150 366 Q200 378 250 366" fill="none" stroke={CLOTH_D} strokeWidth="3" strokeLinecap="round" />
        {/* shirt V */}
        <path d="M184 190 L216 190 L201 298 Z" fill="#f2f0ee" />
        {/* lapels */}
        <g fill={CLOTH_D} stroke="#171a25" strokeWidth="2.5" strokeLinejoin="round">
          <path d="M184 190 L160 206 L172 262 L196 300 L201 298 L190 236 Z" />
          <path d="M216 190 L240 206 L228 262 L206 300 L201 298 L212 236 Z" />
        </g>
        {/* tie */}
        <path d="M193 196 L207 196 L205 208 L195 208 Z" fill={RED} stroke={RED_D} strokeWidth="2" strokeLinejoin="round" />
        <path d="M195 208 L205 208 L210 280 L201 292 L192 280 Z" fill={RED} stroke={RED_D} strokeWidth="2" strokeLinejoin="round" />
        {/* jacket buttons + pocket square */}
        <g fill="#14161e">
          <circle cx="201" cy="326" r="3.6" />
          <circle cx="201" cy="350" r="3.6" />
        </g>
        <path d="M226 258 L246 254 L246 266 L226 268 Z" fill={RED} />
        <path d="M222 268 L250 266" stroke={CLOTH_D} strokeWidth="2" />

        {/* LEFT arm (viewer's left). Forearm first so the sleeve overlaps it. */}
        <g id="armL" transform={`translate(142 210) rotate(${c.Lsh})`}>
          <g id="foreL" transform={`translate(0 72) rotate(${c.Lel})`}>
            <rect x="-11" y="-2" width="22" height="58" rx="10" fill={CLOTH} stroke={CLOTH_D} strokeWidth="2" />
            <rect x="-9" y="48" width="18" height="10" rx="3" fill="#f2f0ee" />
            <g id="handL" transform="translate(0 66)">
              <rect id="fingerL" x="-3.5" y="6" width="7" height="25" rx="3.5" fill={SKIN} opacity={c.Lf} />
              <circle r="11" fill={SKIN} />
              <circle cx="6" cy="4" r="5" fill={SKIN} />
            </g>
          </g>
          <rect x="-14" y="-6" width="28" height="84" rx="13" fill={CLOTH} stroke={CLOTH_D} strokeWidth="2" />
          <ellipse cx="0" cy="26" rx="16" ry="22" fill={CLOTH} stroke={CLOTH_D} strokeWidth="2" />
          <circle r="17" fill={CLOTH} />
        </g>

        {/* RIGHT arm (viewer's right, wears a watch) */}
        <g id="armR" transform={`translate(258 210) rotate(${c.Rsh})`}>
          <g id="foreR" transform={`translate(0 72) rotate(${c.Rel + wob})`}>
            <rect x="-11" y="-2" width="22" height="58" rx="10" fill={CLOTH} stroke={CLOTH_D} strokeWidth="2" />
            <rect x="-9" y="48" width="18" height="10" rx="3" fill="#f2f0ee" />
            <rect x="-9" y="52" width="18" height="6" rx="2" fill="#6a5a50" />
            <circle cx="0" cy="55" r="5" fill="#fff" stroke="#7a7470" strokeWidth="2.5" />
            <g id="handR" transform="translate(0 66)">
              <rect id="fingerR" x="-3.5" y="6" width="7" height="25" rx="3.5" fill={SKIN} opacity={c.Rf} />
              <circle r="11" fill={SKIN} />
              <circle cx="-6" cy="4" r="5" fill={SKIN} />
            </g>
          </g>
          <rect x="-14" y="-6" width="28" height="84" rx="13" fill={CLOTH} stroke={CLOTH_D} strokeWidth="2" />
          <ellipse cx="0" cy="26" rx="16" ry="22" fill={CLOTH} stroke={CLOTH_D} strokeWidth="2" />
          <circle r="17" fill={CLOTH} />
        </g>

        {/* NECK + collar */}
        <rect x="185" y="150" width="30" height="46" rx="10" fill={SKIN_D} />
        <g fill="#f2f0ee" stroke="#d6d3d0" strokeWidth="2.5" strokeLinejoin="round">
          <path d="M186 188 L170 202 L190 214 L201 200 Z" />
          <path d="M216 188 L232 202 L212 214 L201 200 Z" />
        </g>

        {/* HEAD */}
        <g id="head" transform={`rotate(${headRot.toFixed(2)} 200 165)`}>
          {/* ears */}
          <ellipse cx="152" cy="122" rx="8" ry="14" fill={SKIN} />
          <ellipse cx="248" cy="122" rx="8" ry="14" fill={SKIN} />
          <path d="M152 116 q-3 6 0 12" stroke={SKIN_D} strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <path d="M248 116 q3 6 0 12" stroke={SKIN_D} strokeWidth="2.5" fill="none" strokeLinecap="round" />
          {/* face */}
          <path
            d="M152 106 C152 68 176 56 200 56 C224 56 248 68 248 106 C248 146 226 172 200 172 C174 172 152 146 152 106 Z"
            fill={SKIN}
          />
          {/* cheek blush + light stubble */}
          <ellipse cx="171" cy="141" rx="11" ry="6" fill="#c47a58" opacity=".3" />
          <ellipse cx="229" cy="141" rx="11" ry="6" fill="#c47a58" opacity=".3" />

          {/* curly hair */}
          <g fill={HAIR}>
            <ellipse cx="200" cy="84" rx="50" ry="24" />
            <circle cx="150" cy="94" r="14" />
            <circle cx="152" cy="78" r="15" />
            <circle cx="161" cy="64" r="16" />
            <circle cx="175" cy="53" r="16" />
            <circle cx="192" cy="47" r="16" />
            <circle cx="210" cy="47" r="16" />
            <circle cx="227" cy="53" r="16" />
            <circle cx="240" cy="64" r="16" />
            <circle cx="248" cy="78" r="15" />
            <circle cx="250" cy="94" r="14" />
            <circle cx="172" cy="70" r="16" />
            <circle cx="200" cy="64" r="17" />
            <circle cx="228" cy="70" r="16" />
            <circle cx="155" cy="108" r="8" />
            <circle cx="245" cy="108" r="8" />
            <circle cx="170" cy="86" r="11" />
            <circle cx="190" cy="84" r="11" />
            <circle cx="210" cy="84" r="11" />
            <circle cx="230" cy="86" r="11" />
          </g>
          <g fill="none" stroke={HAIR_H} strokeWidth="2.5" strokeLinecap="round">
            <path d="M158 62 q7 -6 13 0" />
            <path d="M182 49 q8 -6 14 0" />
            <path d="M208 50 q8 -6 14 0" />
            <path d="M232 58 q8 -5 13 2" />
            <path d="M146 86 q5 -6 11 0" />
            <path d="M244 86 q5 -6 11 1" />
            <path d="M174 72 q7 -5 12 0" />
            <path d="M216 72 q7 -5 12 1" />
            <path d="M196 62 q6 -5 12 0" />
          </g>

          {/* brows */}
          <path d="M162 107 Q176 98 195 104 Q178 103 162 107 Z" fill={HAIR} stroke={HAIR} strokeWidth="3.5" strokeLinejoin="round" />
          <path d="M238 107 Q224 98 205 104 Q222 103 238 107 Z" fill={HAIR} stroke={HAIR} strokeWidth="3.5" strokeLinejoin="round" />

          {/* eyes (both visible) */}
          <g fill="#fff">
            <ellipse cx="180" cy="124.5" rx="7.5" ry="5.8" />
            <ellipse cx="220" cy="124.5" rx="7.5" ry="5.8" />
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
            <circle cx="182.8" cy="122.6" r="1.5" />
            <circle cx="222.8" cy="122.6" r="1.5" />
          </g>
          <g fill="none" stroke="#2a1a12" strokeWidth="2" strokeLinecap="round">
            <path d="M171 121 Q180 114 189 121" />
            <path d="M211 121 Q220 114 229 121" />
          </g>


          {/* beard, smile (lips + teeth), mustache on top */}
          <path
            d="M152 112 C150 160 170 188 200 188 C230 188 250 160 248 112 C245 130 236 142 224 146 L176 146 C164 142 155 130 152 112 Z"
            fill={HAIR}
          />
          <path d="M187 157 Q200 171 213 157 Q200 163 187 157 Z" fill="#b8584a" />
          <path d="M191 158 Q200 165 209 158 Q200 161 191 158 Z" fill="#fff" />
          <path d="M170 152 Q185 140 200 148 Q215 140 230 152 Q216 158 200 154 Q184 158 170 152 Z" fill={HAIR} />

          {/* nose */}
          <path d="M199 122 Q197 138 193 143" stroke={SKIN_D} strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <path d="M189 142 Q191 134 200 134 Q209 134 211 142 Q211 147 200 147 Q189 147 189 142 Z" fill="#d99a66" />
          <path d="M191 144 Q200 149 209 144" stroke={SKIN_D} strokeWidth="2.5" fill="none" strokeLinecap="round" />

          {/* modern thin black glasses */}
          <g strokeLinejoin="round">
            <rect x="163" y="112" width="34" height="25" rx="10" fill="#c79868" fillOpacity=".15" stroke="#5d6244" strokeWidth="3" />
            <rect x="203" y="112" width="34" height="25" rx="10" fill="#c79868" fillOpacity=".15" stroke="#5d6244" strokeWidth="3" />
            <path d="M197 121 Q200 117 203 121" fill="none" stroke="#5d6244" strokeWidth="3" />
            <path d="M163 120 L153 118 M237 120 L247 118" fill="none" stroke="#5d6244" strokeWidth="3" strokeLinecap="round" />
            <path d="M169 118 L177 114" stroke="#fff" strokeWidth="2" strokeLinecap="round" opacity=".6" />
            <path d="M209 118 L217 114" stroke="#fff" strokeWidth="2" strokeLinecap="round" opacity=".6" />
          </g>
        </g>
      </g>
    </svg>
  );
};