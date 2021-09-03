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
import { isBrowser } from "react-device-detect";
import React from "react";
import {
  getChainNameFromNetworkId,
  shortenAddress,
} from "src/utils/frontend/evm";
import { getDefaultNetworkId } from "src/utils/crypto/getDefaultNetwork";

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
      marginRight: theme.spacing(1),
    },
    addressButton: {
      fontWeight: "bold",
      textTransform: "lowercase",
    },
  })
);

type Properties = {
  isConnected: boolean;
  networkId: number;
  address?: string;
  onAddressClick: () => void;
};

export default function NavBar({
  isConnected,
  networkId,
  address,
  onAddressClick,
}: Properties): JSX.Element {
  const classes = useStyles();

  return (
    <AppBar position="static" elevation={0} color="inherit">
      <Toolbar>
        <Typography className={classes.title} variant="h6">
          InterRep
        </Typography>
        {isBrowser && isConnected && address ? (
          <Box className={classes.walletDataBox}>
            <Typography
              style={{ fontWeight: "bold" }}
              className={classes.networkName}
              color="secondary"
              variant="body1"
            >
              {getChainNameFromNetworkId(networkId)}
            </Typography>
            <Typography className={classes.networkName} variant="body1">
              {networkId !== getDefaultNetworkId() && "(wrong network)"}
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
      </Toolbar>
    </AppBar>
  );
}
