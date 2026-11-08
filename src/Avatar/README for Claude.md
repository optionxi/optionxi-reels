Copy all 3 files, 

1- avatar-rig.tsx
2- README for LLM.md
3- reel-style-spec.json

then paste the prompt
```
import React from "react";
import {Composition} from "remotion";
// import YoutubeVideoIntro from "./Youtube-Intro";
import { Reel } from "./Reel-Intro-v3";
// import { Reel } from "./Reel-Market Sentiment";
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



create a remotion file,which i can call like this, as output, first prepare the script and screens, 

tell about 

how optionxi works

1- we run python on cloud, that connects with fyers and upstox api to get the live data
2- we process it, to generate ema sma, other values
3- data is stored in supabase
4 front end is flutter for google playstore, and webapp is in nextjs, wil l connect

the front for both mobile and web is open sourced, 
we also provide custom algo deployment for customers
also auto alerts
market mood prediciton
screeners,
scanners

more analytisc, and ai analyrics of each stock.

that is optionxi. want more context ask?
```