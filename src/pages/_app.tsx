import { ChakraProvider } from "@chakra-ui/react"
import "@fontsource/raleway/400.css"
import { Web3ReactProvider } from "@web3-react/core"
import { providers } from "ethers"
import { Provider as NextAuthProvider } from "next-auth/client"
import type { AppProps } from "next/app"
import Head from "next/head"
import React from "react"
import Footer from "src/components/Footer"
import NavBar from "src/components/NavBar"
import Page from "src/components/Page"
import theme from "src/styles"

export default function App({ Component, pageProps }: AppProps): JSX.Element {
    function getLibrary(provider: any) {
        return new providers.Web3Provider(provider)
    }

    return (
        <>
            <Head>
                <title>InterRep</title>
                <meta name="viewport" content="minimum-scale=1, initial-scale=1, width=device-width" />
            </Head>
            <NextAuthProvider session={pageProps.session}>
                <Web3ReactProvider getLibrary={(provider) => getLibrary(provider)}>
                    <ChakraProvider theme={theme}>
                        <NavBar />
                        <Page>
                            <Component {...pageProps} />
                        </Page>
                        <Footer />
                    </ChakraProvider>
                </Web3ReactProvider>
            </NextAuthProvider>
        </>
    )
}
