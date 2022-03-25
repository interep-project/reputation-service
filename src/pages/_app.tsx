import { ChakraProvider } from "@chakra-ui/react"
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
            </Head>
            <NextAuthProvider session={pageProps.session}>
                <ChakraProvider theme={theme}>
                    <NavBar />
                    <Component {...pageProps} />
                    <Footer />
                </ChakraProvider>
            </NextAuthProvider>
        </EthereumWalletContext.Provider>
    )
}
