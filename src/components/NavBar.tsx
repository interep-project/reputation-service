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
import React from "react";
import { isBrowser } from "react-device-detect";
import { useWeb3Context } from "src/services/context/Web3Provider";
import { getDefaultNetworkId } from "src/utils/crypto/getDefaultNetwork";
import {
  getChainNameFromNetworkId,
  shortenAddress,
} from "src/utils/frontend/evm";

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

export default function NavBar(): JSX.Element {
  const classes = useStyles();
  const { connect, address, connected = false, networkId } = useWeb3Context();
  const router = useRouter();

  return (
    <AppBar position="fixed" elevation={0} color="inherit">
      <Toolbar>
        <Typography className={classes.title} variant="h6">
          InterRep
        </Typography>
        {router.route === "/" && (
          <>
            {isBrowser && connected && address ? (
              <Box className={classes.walletDataBox}>
                <Typography
                  style={{ fontWeight: "bold" }}
                  className={classes.networkName}
                  color="secondary"
                  variant="body1"
                >
                  {networkId && getChainNameFromNetworkId(networkId)}
                </Typography>
                <Typography className={classes.networkName} variant="body1">
                  {networkId !== getDefaultNetworkId() && "(wrong network)"}
                </Typography>
                <Button
                  className={classes.addressButton}
                  onClick={() => connect && connect()}
                  variant="outlined"
                >
                  {shortenAddress(address)}
                </Button>
              </Box>
            ) : (
              <Button onClick={() => connect && connect()} variant="outlined">
                Connect
              </Button>
            )}
          </>
        )}
      </Toolbar>
    </AppBar>
  );
}
