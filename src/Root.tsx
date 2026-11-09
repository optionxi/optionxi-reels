import React from "react";
import {Composition} from "remotion";
// import Reel, { config } from "./Reels - Avatar How it works/Avatar-Reel-How it works";
// import Reel, { config } from "./Reels - Avatar How it works/Avatar-Reel-How it works V2";

// import Reel from "./Avatar-Reel-How it works V2";
// import YoutubeVideoIntro from "./Youtube-Intro";
import Reel, { config } from "./Reels - App Intro/Reel-Intro-v3";
// import { Reel } from "./Reel-Market Sentiment";
// import Reel from "./Reel-Intro-v2";
// import { Reel } from "./Reel-Stock Research";
// import { Reel } from "./Reel-Intro";
// import { Reel } from "./Reel-Screeners";


export const RemotionRoot: React.FC = () => (
  <Composition id="OptionXiReel" component={Reel} {...config} />
);

