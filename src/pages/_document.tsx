import { ColorModeScript } from "@chakra-ui/react"
import Document, { DocumentContext, DocumentInitialProps, Head, Html, Main, NextScript } from "next/document"
import React from "react"
import theme from "src/styles/theme"
import { CSP } from "src/types/csp"

// const cspHashOf = (text: string): string => {
// const hash = crypto.createHash("sha256");
// hash.update(text);
// return `'sha256-${hash.digest("base64")}'`;
// };

// const generateNonce = (): string => {
// return randomBytes(16).toString("base64");
// };

// Return a Content Security Policy string.
// If the website is completely static, it's likely CSP are not necessary.
// https://reesmorris.co.uk/blog/implementing-proper-csp-nextjs-styled-components
// https://csp.withgoogle.com/docs/why-csp.html
const generateCSP = (): string => {
    // Define the directives/values.
    const csp: Partial<Record<CSP, string>> = {
        "default-src": `'self'`,
        "img-src": `'self' data:`,
        "style-src": `'self' 'unsafe-inline'`,
        "script-src": `'self' 'unsafe-inline' 'unsafe-eval'`,
        "connect-src": `'self' *.sentry.io`
    }

    // Convert to string and return.
    return Object.entries(csp).reduce((acc, [key, val]) => `${acc} ${key} ${val};`, "")
}

export default class MyDocument extends Document {
    static async getInitialProps(ctx: DocumentContext): Promise<DocumentInitialProps & { csp: string }> {
        // Render app and page and get the context of the page with collected side effects.
        const csp = generateCSP()
        const initialProps = await Document.getInitialProps(ctx)

        return {
            ...initialProps,
            csp
        }
    }

    render(): JSX.Element {
        const { csp } = this.props as any

        return (
            <Html lang="en">
                <Head>
                    <meta httpEquiv="Content-Security-Policy" content={csp} />
                </Head>
                <body>
                    <ColorModeScript initialColorMode={theme.initialColorMode} />
                    <Main />
                    <NextScript />
                </body>
            </Html>
        )
    }
}
