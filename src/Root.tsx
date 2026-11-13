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
import ReelVolumeJumps, { config as configVolumeJumps } from "./Reels - App Features/Reel-Stock Volume Jump";

export const RemotionRoot: React.FC = () => (
  <>
    {/* Active reel — shown first in Studio */}
    
    <Composition id="VolumeJumps" component={ReelVolumeJumps} {...configVolumeJumps} />

    {/* Other reels — keep for reference / quick switching */}
    <Composition id="OptionXiReel"          component={ReelAppIntroV3}         {...configAppIntroV3} />
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