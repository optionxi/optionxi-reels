import React from "react";
import {Composition} from "remotion";
import { Reel } from "./Reel-Market Sentiment";
// import Reel from "./Reel-Intro-v2";
// import { Reel } from "./Reel-Stock Research";
// import { Reel } from "./Reel-Intro";
// import { Reel } from "./Reel-Screeners";

export const RemotionRoot: React.FC = () => (
  <Composition
    id="OptionXiReel"
    component={Reel}
    durationInFrames={900}
    fps={30}
    width={1080}
    height={1920}
  />
);
