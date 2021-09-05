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
import { useRouter } from "next/router";
import React, { useContext } from "react";
import { isBrowser } from "react-device-detect";
import { isDefaultNetworkId } from "src/utils/crypto/getDefaultNetwork";
import {
  getChainNameFromNetworkId,
  shortenAddress,
} from "src/utils/frontend/evm";
import EthereumWalletContext, {
  EthereumWalletContextType,
} from "src/services/context/EthereumWalletContext";

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
    },
  })
);

export default function NavBar(): JSX.Element {
  const classes = useStyles();
  const { connect, check, _networkId, _address } = useContext(
    EthereumWalletContext
  ) as EthereumWalletContextType;
  const router = useRouter();

  return (
    <AppBar position="fixed" elevation={0} color="inherit">
      <Toolbar>
        <Typography className={classes.title} variant="h6">
          InterRep
        </Typography>
        {router.route === "/" && (
          <>
            {isBrowser && _address && _networkId ? (
              <Box className={classes.walletDataBox}>
                <Typography
                  style={{ fontWeight: "bold" }}
                  className={classes.networkName}
                  color="secondary"
                  variant="body1"
                >
                  {_networkId && getChainNameFromNetworkId(_networkId)}
                </Typography>
                <Typography className={classes.networkName} variant="body1">
                  {!isDefaultNetworkId(_networkId) && "(wrong network)"}
                </Typography>
                <Button
                  className={classes.addressButton}
                  onClick={() =>
                    isDefaultNetworkId(_networkId) ? connect() : check()
                  }
                  variant="outlined"
                >
                  {isDefaultNetworkId(_networkId)
                    ? shortenAddress(_address)
                    : "Switch"}
                </Button>
              </Box>
            ) : (
              <Button onClick={connect} variant="outlined">
                Connect
              </Button>
            )}
          </>
        )}
      </Toolbar>
    </AppBar>
  );
}
