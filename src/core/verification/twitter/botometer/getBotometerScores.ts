import { getBotScore } from "src/services/botometer";

const getBotometerScores = async (username: string) => {
  if (!username) {
    return null;
  }

  let botometerResponse = null;
  try {
    botometerResponse = await getBotScore(username);
  } catch (err) {
    console.error(err);
    return null;
  }

  if (!botometerResponse?.raw_scores || !botometerResponse?.display_scores) {
    return null;
  }

  return {
    raw_scores: botometerResponse.raw_scores,
    display_scores: botometerResponse.display_scores,
    cap: botometerResponse.cap,
  };
};

export default getBotometerScores;
