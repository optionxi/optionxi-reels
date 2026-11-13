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


```
creat a remotion, layman terms, aniamtions, text, easy to udnerstand, about the new feature launching in optionxi, volume jumps.

context is, also volume jump history, check how it performed, you can customise the parameters also

soon: alerts when stock jumps 8x or 30x user specified, gets alerted, make it all layman terms, dont overcomplicated, outputul single tsx file, which i can call


```typescriptreact
import React from "react";
import { Composition } from "remotion";

import ReelAppIntroV3, { config as configAppIntroV3 } from "./Reels - App Intro/Reel-Intro-v3";
import ReelAppIntroV2, { config as configAppIntroV2 } from "./Reels - App Intro/Reel-Intro-v2";
import ReelAppIntroV1, { config as configAppIntroV1 } from "./Reels - App Intro/Reel-Intro";
import ReelAvatarHowItWorksV2, { config as configAvatarV2 } from "./Reels - Avatar How it works/Avatar-Reel-How it works V2";
import ReelAvatarHowItWorksV1, { config as configAvatarV1 } from "./Reels - Avatar How it works/Avatar-Reel-How it works";
import ReelMarketSentiment, { config as configMarketSentiment } from "./Reels - App Features/Reel-Market Sentiment";
import ReelStockResearch, { config as configStockResearch } from "./Reels - App Features/Reel-Stock Research";
import ReelScreeners, { config as configScreeners } from "./Reels - App Features/Reel-Screeners";
import YoutubeIntro, { config as configYoutubeIntro } from "./Youtube/Youtube-Intro";

export const RemotionRoot: React.FC = () => (
  <>
    {/* Active reel — shown first in Studio */}
    <Composition id="OptionXiReel" component={ReelAppIntroV3} {...configAppIntroV3} />

    {/* Other reels — keep for reference / quick switching */}
    <Composition id="AppIntroV2"            component={ReelAppIntroV2}         {...configAppIntroV2} />
    <Composition id="AppIntroV1"            component={ReelAppIntroV1}         {...configAppIntroV1} />
    <Composition id="AvatarHowItWorksV2"    component={ReelAvatarHowItWorksV2} {...configAvatarV2} />
    <Composition id="AvatarHowItWorksV1"    component={ReelAvatarHowItWorksV1} {...configAvatarV1} />
    <Composition id="MarketSentiment"       component={ReelMarketSentiment}    {...configMarketSentiment} />
    <Composition id="StockResearch"         component={ReelStockResearch}      {...configStockResearch} />
    <Composition id="Screeners"             component={ReelScreeners}          {...configScreeners} />
    <Composition id="YoutubeIntro"          component={YoutubeIntro}           {...configYoutubeIntro} />
  </>
);

like this

export const config = {
  durationInFrames: 900,
  fps: 30,
  width: 1080,
  height: 1920,
};
const SAFE = getSafe(config);
import {getSafe, SafeGuide} from "../shared/safe-area";
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

with safearea, instagram. think, scrip this, easy. professional style. how to convey the idea. out put the script
```