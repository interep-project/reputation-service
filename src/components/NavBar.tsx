import {
  AppBar,
  Box,
  Button,
  createStyles,
  makeStyles,
  Theme,
  Toolbar,
  Typography,
} from "@material-ui/core";
import React from "react";
import { shortenAddress } from "src/utils/frontend/evm";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    title: {
      flexGrow: 1,
    },
    walletDataBox: {
      display: "flex",
      alignItems: "center",
    },
    networkName: {
      fontWeight: "bold",
      marginRight: theme.spacing(2),
    },
    addressButton: {
      fontWeight: "bold",
      textTransform: "lowercase",
    },
  })
);

type Properties = {
  isConnectButtonDisplayed: boolean;
  isConnected: boolean;
  address?: string;
  networkName: string;
  onAddressClick: () => void;
};

export default function NavBar({
  isConnectButtonDisplayed = false,
  isConnected,
  address,
  networkName,
  onAddressClick,
}: Properties): JSX.Element {
  const classes = useStyles();

  return (
    <AppBar position="static" elevation={0} color="inherit">
      <Toolbar>
        <Typography className={classes.title} variant="h6">
          InterRep
        </Typography>
        {isConnectButtonDisplayed && (
          <Box>
            {isConnected && address ? (
              <Box className={classes.walletDataBox}>
                <Typography
                  style={{ fontWeight: "bold" }}
                  className={classes.networkName}
                  color="secondary"
                  variant="body1"
                >
                  {networkName}
                </Typography>
                <Button
                  className={classes.addressButton}
                  onClick={onAddressClick}
                  variant="outlined"
                >
                  {shortenAddress(address)}
                </Button>
              </Box>
            ) : (
              <Button onClick={onAddressClick} variant="outlined">
                Connect
              </Button>
            )}
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
}
