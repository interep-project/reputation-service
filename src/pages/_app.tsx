import type { AppProps } from "next/app";
import { Provider as NextAuthProvider } from "next-auth/client";
import { Web3ContextProvider } from "src/services/context/Web3Provider";
import "src/styles/globals.css";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <Web3ContextProvider>
      <NextAuthProvider session={pageProps.session}>
        <Component {...pageProps} />
      </NextAuthProvider>
    </Web3ContextProvider>
  );
}

export default MyApp;
