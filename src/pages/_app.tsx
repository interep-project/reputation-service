import type { AppProps } from "next/app";
import { Provider } from "next-auth/client";
import "src/styles/globals.css";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <Provider session={pageProps.session}>
      <Component {...pageProps} />
    </Provider>
  );
}

export default MyApp;
