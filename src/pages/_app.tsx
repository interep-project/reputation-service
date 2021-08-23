import type { AppProps } from "next/app";
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

const theme = createTheme({
  palette: {
    type: "dark",
    primary: {
      main: "#8DCFE6",
    },
    secondary: {
      main: "#E6BD8D",
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

  return (
    <ThemeProvider theme={theme}>
      <Web3ContextProvider>
        <NextAuthProvider session={pageProps.session}>
          <Paper className={classes.container} elevation={0} square={true}>
            <Component {...pageProps} />
          </Paper>
        </NextAuthProvider>
      </Web3ContextProvider>
    </ThemeProvider>
  );
}
