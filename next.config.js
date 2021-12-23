// This file sets a custom webpack configuration to use your Next.js app
// with Sentry.
// https://nextjs.org/docs/api-reference/next.config.js/introduction
// https://docs.sentry.io/platforms/javascript/guides/nextjs/
const path = require("path")
require("ts-node").register({ transpileOnly: true })
const { withSentryConfig } = require("@sentry/nextjs")

const securityHeaders = [
    {
        key: "X-Frame-Options",
        value: "DENY"
    },
    {
        key: "X-XSS-Protection",
        value: "1; mode=block"
    },
    {
        key: "Permissions-Policy",
        value: "camera=(), microphone=(), geolocation=(), interest-cohort=()"
    },
    {
        key: "Referrer-Policy",
        value: "strict-origin-when-cross-origin"
    },
    {
        key: "X-Content-Type-Options",
        value: "nosniff"
    }
]

const moduleExports = {
    publicRuntimeConfig: {
        // Will be available on both server and client
        defaultNetwork: process.env.DEFAULT_NETWORK
    },
    poweredByHeader: false,
    eslint: {
        ignoreDuringBuilds: true
    },
    async headers() {
        return [
            {
                // Apply these headers to all routes in your application.
                source: "/(.*)",
                headers: securityHeaders
            }
        ]
    },
    webpack: (config, { isServer }) => {
        if (isServer) {
            return {
                ...config,
                entry() {
                    return config.entry().then((entry) => ({
                        ...entry,
                        tasks: path.resolve(process.cwd(), "src/tasks/index.ts")
                    }))
                }
            }
        } else {
            return config
        }
    }
}

const sentryWebpackPluginOptions = {
    // Additional config options for the Sentry Webpack plugin. Keep in mind that
    // the following options are set automatically, and overriding them is not
    // recommended:
    //   release, url, org, project, authToken, configFile, stripPrefix,
    //   urlPrefix, include, ignore

    silent: true // Suppresses all logs.
    // For all available options, see:
    // https://github.com/getsentry/sentry-webpack-plugin#options.
}

// Make sure adding Sentry options is the last code to run before exporting, to
// ensure that your source maps include changes from all other Webpack plugins.
module.exports = withSentryConfig(moduleExports, sentryWebpackPluginOptions)
