import Document, { Head, Html, Main, NextScript } from "next/document";
import crypto from "crypto";
import { onboardStyles } from "src/config";
import { ServerStyleSheets } from "@material-ui/core";
import React from "react";

const cspHashOf = (text: string): string => {
  const hash = crypto.createHash("sha256");
  hash.update(text);
  return `'sha256-${hash.digest("base64")}'`;
};

export default class MyDocument extends Document {
  render() {
    const nonce = crypto.randomBytes(8).toString("base64");

    let csp = `default-src 'self'; img-src 'self' data:; style-src 'self' 'nonce-${nonce}' ${onboardStyles}; script-src 'self' ${cspHashOf(
      NextScript.getInlineScriptSource(this.props)
    )}; `;

    if (process.env.NODE_ENV !== "production") {
      csp = `style-src 'self' 'unsafe-inline'; font-src 'self' data:; default-src 'self'; script-src 'unsafe-eval' 'self' ${cspHashOf(
        NextScript.getInlineScriptSource(this.props)
      )}; `;
    }

    csp += `connect-src 'self' *.sentry.io;`;

    return (
      <Html>
        <Head nonce={nonce}>
          <meta httpEquiv="Content-Security-Policy" content={csp} />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

MyDocument.getInitialProps = async (ctx) => {
  const sheets = new ServerStyleSheets();
  const originalRenderPage = ctx.renderPage;

  ctx.renderPage = () =>
    originalRenderPage({
      enhanceApp: (App) => (props) => sheets.collect(<App {...props} />),
    });

  const initialProps = await Document.getInitialProps(ctx);

  return {
    ...initialProps,
    styles: [
      ...React.Children.toArray(initialProps.styles),
      sheets.getStyleElement(),
    ],
  };
};
