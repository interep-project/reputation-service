import type { AppProps } from "next/app";
import PropTypes from "prop-types";
import { Provider as NextAuthProvider } from "next-auth/client";
import { Web3ContextProvider } from "src/services/context/Web3Provider";
import {
  createStyles,
  createTheme,
  makeStyles,
  Paper,
  ThemeProvider,
} from "@material-ui/core";
import "src/styles/globals.css";
import "@fontsource/roboto";
import React from "react";
import Head from "next/head";

const theme = createTheme({
  palette: {
    type: "dark",
    primary: {
      main: "#8DCFE6",
    },
    secondary: {
      main: "#E6BD8D",
    },
    error: {
      main: "#CFBB9B",
    },
  },
});

const useStyles = makeStyles(() =>
  createStyles({
    container: {
      display: "flex",
      flexDirection: "column",
      minHeight: "100vh",
      flex: 1,
    },
  })
);

export default function MyApp({ Component, pageProps }: AppProps): JSX.Element {
  const classes = useStyles();

  React.useEffect(() => {
    // Remove the server-side injected CSS.
    const jssStyles = document.querySelector("#jss-server-side");

    if (jssStyles) {
      jssStyles.parentElement?.removeChild(jssStyles);
    }
  }, []);

  return (
    <React.Fragment>
      <Head>
        <title>InterRep</title>
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width"
        />
      </Head>
      <ThemeProvider theme={theme}>
        <Web3ContextProvider>
          <NextAuthProvider session={pageProps.session}>
            <Paper className={classes.container} elevation={0} square={true}>
              <Component {...pageProps} />
            </Paper>
          </NextAuthProvider>
        </Web3ContextProvider>
      </ThemeProvider>
    </React.Fragment>
  );
}

MyApp.propTypes = {
  Component: PropTypes.elementType.isRequired,
  pageProps: PropTypes.object.isRequired,
};
