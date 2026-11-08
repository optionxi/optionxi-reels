import React from "react";
import {Composition} from "remotion";
import Reel from "./Avatar-Reel-How it works V2";
// import Reel from "./Avatar-Reel-How it works";
// import YoutubeVideoIntro from "./Youtube-Intro";
// import { Reel } from "./Reel-Intro-v3";
// import { Reel } from "./Reel-Market Sentiment";
// import Reel from "./Reel-Intro-v2";
// import { Reel } from "./Reel-Stock Research";
// import { Reel } from "./Reel-Intro";
// import { Reel } from "./Reel-Screeners";

export const RemotionRoot: React.FC = () => (
  <Composition
    id="OptionXiReel"
    component={Reel}
    durationInFrames={1350}
    fps={30}
    width={1080}
    height={1920}
  />
);


// export const RemotionRoot: React.FC = () => (
//   <Composition
//     id="OptionXiReel"
//     component={YoutubeVideoIntro}
//     durationInFrames={600}
//     fps={30}
//     width={1920}
//     height={1080}
//   />
// );
