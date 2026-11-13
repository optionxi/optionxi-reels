import React from "react";
import {AbsoluteFill, useVideoConfig} from "remotion";

export const DEBUG_SAFE = true;
export const SAFE_PORTRAIT  = {top: 250, bottom: 340, side: 60};
export const SAFE_LANDSCAPE = {top: 54,  bottom: 54,  side: 96};

export const getSafe = ({width, height}: {width: number; height: number}) => {
  const s = height > width ? SAFE_PORTRAIT : SAFE_LANDSCAPE;
  return {...s, left: s.side, right: width - s.side,
          y0: s.top, y1: height - s.bottom,
          w: width - s.side * 2, h: height - s.top - s.bottom};
};

export const SafeArea: React.FC<{children?: React.ReactNode}> = ({children}) => {
  const S = getSafe(useVideoConfig());
  return <div style={{position: "absolute", left: S.left, top: S.y0, width: S.w, height: S.h}}>{children}</div>;
};

export const SafeGuide: React.FC = () => {
  const S = getSafe(useVideoConfig());
  if (!DEBUG_SAFE) return null;
  return (
    <AbsoluteFill style={{pointerEvents: "none", zIndex: 999}}>
      <div style={{position: "absolute", left: S.left, top: S.y0, width: S.w, height: S.h,
                   border: "3px dashed rgba(255,0,120,.85)"}} />
    </AbsoluteFill>
  );
};