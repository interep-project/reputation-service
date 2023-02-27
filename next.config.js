// This file sets a custom webpack configuration to use your Next.js app.
// https://nextjs.org/docs/api-reference/next.config.js/introduction
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

const nextConfig = {
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
    }
}

module.exports = nextConfig
