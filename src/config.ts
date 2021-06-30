export const onboardStyles = `'sha256-b9ziL8IJLxwegMVUIsr1Xonaxx9fkYcSKScBVxty+b8=' 'sha256-BgOP/ML7iRgKpqjhNfXke6AKgTv2KiGYPBitEng05zo=' 'sha256-WEkB3t+nfyfJBFAy7S1VN7AGcsstGkPtH/sEme5McoM=' 'sha256-1q71146AbRaIXMXEynPmTgkuaVhiUlRiha3g3LjARmY=' 'sha256-2HcLdA7hf+eZilVMBcZB4VFlx8PSxhoPt5BZCxc/85s=' 'sha256-WLOC06MT+Dqzsp7Cy382ZCzwQQ4P0EneoLyM/Yao4rw=' 'sha256-47DEQpj8HBSa+/TImW+5JCeuQeRkm5NMpJWZG3hSuFU=' 'sha256-pA817lKKQj1w2GkmEolfMacD1BU4+jNuNTl3cKD16f4=' 'sha256-NYlZ6i82DNnjefyMZyP17TIpq26QW0lg5yF6PDEOpYA=' 'sha256-nDu9nFngbf6yKkK8kNYFmU+5A6Ew5P34jdNXAyYFeFw=' 'sha256-NB1qv9+tZOZ0Iy3B+6Y04eDYY2YS+HLIBGfZ3o57ek0='`;

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
