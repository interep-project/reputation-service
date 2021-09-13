import {
  Card,
  Container,
  createStyles,
  makeStyles,
  Tab,
  Tabs,
  Theme,
  Typography,
} from "@material-ui/core";
import { Signer } from "ethers";
import { useSession } from "next-auth/client";
import React, { useCallback, useContext, useEffect, useState } from "react";
import { isBrowser, isMobile } from "react-device-detect";
import ReputationBadgeTabPanel from "src/components/ReputationBadgeTabPanel";
import SemaphoreGroupTabPanel from "src/components/SemaphoreGroupTabPanel";
import TabPanelContainer from "src/components/TabPanelContainer";
import Web2LoginTabPanel from "src/components/Web2LoginTabPanel";
import { AccountReputationByAccount } from "src/models/web2Accounts/Web2Account.types";
import { getDefaultNetworkId } from "src/utils/crypto/getDefaultNetwork";
import { getMyTwitterReputation } from "src/utils/frontend/api";
import EthereumWalletContext, {
  EthereumWalletContextType,
} from "src/context/EthereumWalletContext";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    container: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flex: 1,
      paddingBottom: 48,
      paddingTop: 64,
    },
    tabContainer: {
      display: "flex",
      flexDirection: "column",
      width: "100%",
      minHeight: 450,
      backgroundColor: theme.palette.background.default,
    },
    tabButton: {
      textTransform: "capitalize",
    },
  })
);

const defaultNetworkId = getDefaultNetworkId();

export default function Home(): JSX.Element {
  const classes = useStyles();
  const [session] = useSession();
  const [_tabIndex, setTabIndex] = React.useState<number>(0);
  const { _networkId, _address, _signer } = useContext(
    EthereumWalletContext
  ) as EthereumWalletContextType;
  const [
    _twitterReputation,
    setTwitterReputation,
  ] = useState<AccountReputationByAccount | null>(null);

  useEffect(() => {
    (async () => {
      if (session) {
        setTwitterReputation(await getMyTwitterReputation());
      }
    })();
  }, [session]);

  const appIsReady = useCallback(() => {
    return !!(
      session &&
      defaultNetworkId === _networkId &&
      _address &&
      _twitterReputation
    );
  }, [session, _networkId, _address, _twitterReputation]);

  function updateTabIndex(direction: number): void {
    setTabIndex((index: number) => index + direction);
  }

  return (
    <Container className={classes.container} maxWidth="sm">
      {isMobile && (
        <Typography>
          Sorry, mobile and tablet devices are currently not supported. Please
          access InterRep from a desktop browser with the Metamask extension
          installed.
        </Typography>
      )}
      {isBrowser && (
        <Card className={classes.tabContainer}>
          <Tabs
            variant="fullWidth"
            value={_tabIndex}
            onChange={(event, newIndex) => setTabIndex(newIndex)}
          >
            <Tab className={classes.tabButton} label="Web2 Login" />
            <Tab
              className={classes.tabButton}
              label="Semaphore group"
              disabled={!appIsReady()}
            />
            <Tab
              className={classes.tabButton}
              label="Reputation badge"
              disabled={!appIsReady()}
            />
          </Tabs>
          <TabPanelContainer value={_tabIndex} index={0}>
            <Web2LoginTabPanel
              onArrowClick={appIsReady() ? updateTabIndex : undefined}
              reputation={_twitterReputation?.basicReputation as string}
            />
          </TabPanelContainer>
          {appIsReady() && (
            <>
              <TabPanelContainer value={_tabIndex} index={1}>
                <SemaphoreGroupTabPanel
                  onArrowClick={updateTabIndex}
                  reputation={_twitterReputation?.basicReputation as string}
                  signer={_signer as Signer}
                  web2AccountId={session?.web2AccountId as string}
                />
              </TabPanelContainer>
              <TabPanelContainer value={_tabIndex} index={2}>
                <ReputationBadgeTabPanel
                  onArrowClick={updateTabIndex}
                  signer={_signer as Signer}
                  networkId={_networkId as number}
                  address={_address as string}
                  reputation={_twitterReputation?.basicReputation as string}
                  web2AccountId={session?.web2AccountId as string}
                />
              </TabPanelContainer>
            </>
          )}
        </Card>
      )}
    </Container>
  );
}
