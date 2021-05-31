require("ts-node").register({ transpileOnly: true });

const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});

module.exports = withBundleAnalyzer({
  publicRuntimeConfig: {
    // Will be available on both server and client
    // networkId: process.env.NODE_ENV === "development" ? 31337 : 42,
    defaultNetworkByEnv: {
      test: { id: 31337, name: "hardhat" },
      development: { id: 31337, name: "localhost" },
      production: { id: 42, name: "kovan" },
    },
  },
});
