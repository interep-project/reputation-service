import { ChakraProvider } from "@chakra-ui/react"
import "@fontsource/raleway/400.css"
import { Provider as NextAuthProvider } from "next-auth/client"
import type { AppProps } from "next/app"
import Head from "next/head"
import React from "react"
import Footer from "src/components/Footer"
import NavBar from "src/components/NavBar"
import Page from "src/components/Page"
import EthereumWalletContext from "src/context/EthereumWalletContext"
import useEthereumWallet from "src/hooks/useEthreumWallet"
import theme from "src/styles"

export default function MyApp({ Component, pageProps }: AppProps): JSX.Element {
    const ethereumWallet = useEthereumWallet()

    return (
        <>
            <Head>
                <title>InterRep</title>
                <meta name="viewport" content="minimum-scale=1, initial-scale=1, width=device-width" />
            </Head>
            <NextAuthProvider session={pageProps.session}>
                <EthereumWalletContext.Provider value={ethereumWallet}>
                    <ChakraProvider theme={theme}>
                        <NavBar />
                        <Page>
                            <Component {...pageProps} />
                        </Page>
                        <Footer />
                    </ChakraProvider>
                </EthereumWalletContext.Provider>
            </NextAuthProvider>
        </>
    )
}
