const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});

module.exports = withBundleAnalyzer({
  publicRuntimeConfig: {
    // Will be available on both server and client
    networkId: 42,
  },
});
