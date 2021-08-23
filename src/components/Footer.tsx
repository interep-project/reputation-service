import {
  AppBar,
  createStyles,
  Link,
  makeStyles,
  Toolbar,
  Typography,
} from "@material-ui/core";
import React, { useEffect, useState } from "react";
import {
  DeployedContracts as DeployedContractsEnum,
  getDeployedContractAddress,
} from "src/utils/crypto/deployedContracts";
import { getDefaultNetworkId } from "src/utils/crypto/getDefaultNetwork";
import {
  ExplorerDataType,
  getExplorerLink,
} from "src/utils/frontend/getExplorerLink";
import GithubIcon from "@material-ui/icons/GitHub";
import { shortenAddress } from "src/utils/frontend/evm";

const useStyles = makeStyles(() =>
  createStyles({
    footer: {
      top: "auto",
      bottom: 0,
    },
    githubLink: {
      flexGrow: 1,
    },
  })
);

type Properties = {
  properNetwork: boolean;
};

export default function Footer({ properNetwork }: Properties): JSX.Element {
  const classes = useStyles();
  const networkId = getDefaultNetworkId();
  const [twitterContractAddress, setTwitterContractAddress] = useState("");

  useEffect(() => {
    const address = getDeployedContractAddress(
      DeployedContractsEnum.TWITTER_BADGE
    );

    if (address) {
      setTwitterContractAddress(address);
    } else {
      console.error(`Can't get address of deployed Twitter badge`);
    }
  }, []);

  return (
    <AppBar
      className={classes.footer}
      position="fixed"
      elevation={0}
      color="inherit"
    >
      <Toolbar variant="dense">
        <Typography className={classes.githubLink}>
          <Link
            href="https://github.com/InterRep"
            target="_blank"
            rel="noreferrer"
            color="inherit"
          >
            <GithubIcon fontSize="small" />
          </Link>
        </Typography>
        {properNetwork && twitterContractAddress && (
          <Typography>
            Twitter Badge&#39;s address:&nbsp;
            <Link
              href={getExplorerLink(
                networkId,
                twitterContractAddress,
                ExplorerDataType.TOKEN
              )}
              target="_blank"
              rel="noreferrer"
              color="inherit"
            >
              {shortenAddress(twitterContractAddress)}
            </Link>
          </Typography>
        )}
      </Toolbar>
    </AppBar>
  );
}
