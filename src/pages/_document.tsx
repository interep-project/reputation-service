import Document, { Head, Html, Main, NextScript } from "next/document";
import crypto from "crypto";
import { ServerStyleSheets } from "@material-ui/core";
import React from "react";

const cspHashOf = (text: string): string => {
  const hash = crypto.createHash("sha256");
  hash.update(text);
  return `'sha256-${hash.digest("base64")}'`;
};

const onboardStyles = `'sha256-b9ziL8IJLxwegMVUIsr1Xonaxx9fkYcSKScBVxty+b8=' 'sha256-BgOP/ML7iRgKpqjhNfXke6AKgTv2KiGYPBitEng05zo=' 'sha256-WEkB3t+nfyfJBFAy7S1VN7AGcsstGkPtH/sEme5McoM=' 'sha256-1q71146AbRaIXMXEynPmTgkuaVhiUlRiha3g3LjARmY=' 'sha256-2HcLdA7hf+eZilVMBcZB4VFlx8PSxhoPt5BZCxc/85s=' 'sha256-WLOC06MT+Dqzsp7Cy382ZCzwQQ4P0EneoLyM/Yao4rw=' 'sha256-47DEQpj8HBSa+/TImW+5JCeuQeRkm5NMpJWZG3hSuFU=' 'sha256-pA817lKKQj1w2GkmEolfMacD1BU4+jNuNTl3cKD16f4=' 'sha256-NYlZ6i82DNnjefyMZyP17TIpq26QW0lg5yF6PDEOpYA=' 'sha256-nDu9nFngbf6yKkK8kNYFmU+5A6Ew5P34jdNXAyYFeFw=' 'sha256-NB1qv9+tZOZ0Iy3B+6Y04eDYY2YS+HLIBGfZ3o57ek0='`;

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
