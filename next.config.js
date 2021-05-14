require("ts-node").register({ transpileOnly: true });

const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});

module.exports = withBundleAnalyzer({
  publicRuntimeConfig: {
    // Will be available on both server and client
    networkId: process.env.NODE_ENV === "development" ? 33137 : 42,
  },
});
