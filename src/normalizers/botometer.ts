import { botometerData, botometerScoreData } from "src/types/botometer";

type NormalizedBotometerData = {
  twitterData?: {
    id: number;
    followers_count: number;
    friends_count: number;
    created_at: string;
  };
  botometer: botometerScoreData;
};

export const normalizeBotometerData = (
  botometerData: botometerData
): NormalizedBotometerData => {
  let userData = {};
  const user = botometerData.twitterData?.user;
  if (user) {
    const { id, followers_count, friends_count, created_at } = user;
    userData = {
      twitterData: {
        id,
        followers_count,
        friends_count,
        created_at,
      },
    };
  }

  return {
    ...userData,
    botometer: {
      raw_scores: botometerData.raw_scores,
      display_scores: botometerData.display_scores,
      cap: botometerData.cap,
    },
  };
};
