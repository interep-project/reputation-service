export const SupportedChainId = {
  HARDHAT: 31337,
  LOCALHOST: 31337,
  KOVAN: 42,
};

export const defaultNetworkByEnv = {
  test: { id: SupportedChainId.HARDHAT, name: "hardhat" },
  development: { id: SupportedChainId.LOCALHOST, name: "localhost" },
  production: { id: SupportedChainId.KOVAN, name: "kovan" },
};

export default {
  MONGO_URL: process.env.MONGO_URL,
  TWITTER_CONSUMER_KEY: process.env.TWITTER_CONSUMER_KEY,
  TWITTER_CONSUMER_SECRET: process.env.TWITTER_CONSUMER_SECRET,
  TWITTER_ACCESS_TOKEN: process.env.TWITTER_ACCESS_TOKEN,
  TWITTER_ACCESS_TOKEN_SECRET: process.env.TWITTER_ACCESS_TOKEN_SECRET,
  RAPIDAPI_KEY: process.env.RAPIDAPI_KEY,
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
  JWT_SIGNING_PRIVATE_KEY: process.env.JWT_SIGNING_PRIVATE_KEY,
  JWT_SECRET: process.env.JWT_SECRET,
};
