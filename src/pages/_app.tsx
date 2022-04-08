import { ChakraProvider, ColorModeProvider } from "@chakra-ui/react"
import "@fontsource/inter/400.css"
import { Provider as NextAuthProvider } from "next-auth/client"
import type { AppProps } from "next/app"
import Head from "next/head"
import React from "react"
import Footer from "src/components/footer"
import NavBar from "src/components/navbar"
import EthereumWalletContext from "src/context/EthereumWalletContext"
import useEthereumWallet from "src/hooks/useEthereumWallet"
import theme from "src/styles"

export default function App({ Component, pageProps }: AppProps): JSX.Element {
    const ethereumWallet = useEthereumWallet()

    return (
        <EthereumWalletContext.Provider value={ethereumWallet}>
            <Head>
                <title>Interep</title>
                <meta name="viewport" content="minimum-scale=1, initial-scale=1, width=device-width" />
                <link rel="icon" type="image/x-icon" href="/favicon.ico" />
            </Head>
            <NextAuthProvider session={pageProps.session}>
                <ChakraProvider theme={theme}>
                    <ColorModeProvider options={{ initialColorMode: "dark", useSystemColorMode: false }}>
                        <NavBar />
                        <Component {...pageProps} />
                        <Footer />
                    </ColorModeProvider>
                </ChakraProvider>
            </NextAuthProvider>
        </EthereumWalletContext.Provider>
    )
}
