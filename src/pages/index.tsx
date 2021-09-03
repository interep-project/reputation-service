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
import React, { useEffect, useState } from "react";
import { isBrowser, isMobile } from "react-device-detect";
import NavBar from "src/components/NavBar";
import ReputationBadgesTabPanel from "src/components/ReputationBadgesTabPanel";
import SemaphoreGroupsTabPanel from "src/components/SemaphoreGroupsTabPanel";
import TabPanelContainer from "src/components/TabPanelContainer";
import Web2AccountsTabPanel from "src/components/Web2AccountsTabPanel";
import { AccountReputationByAccount } from "src/models/web2Accounts/Web2Account.types";
import { useWeb3Context } from "src/services/context/Web3Provider";
import { getDefaultNetworkId } from "src/utils/crypto/getDefaultNetwork";
import { getMyTwitterReputation } from "src/utils/frontend/api";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    container: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flex: 1,
      paddingBottom: theme.spacing(4),
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
  const {
    connect,
    address,
    connected = false,
    networkId,
    signer,
  } = useWeb3Context();
  const [
    _twitterReputation,
    setTwitterReputation,
  ] = useState<AccountReputationByAccount | null>(null);

  useEffect(() => {
    (async () => {
      if (networkId && networkId !== defaultNetworkId) {
        // @ts-ignore: ignore
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: `0x${defaultNetworkId.toString(16)}` }],
        });
      }
    })();
  }, [networkId]);

  useEffect(() => {
    (async () => {
      if (session) {
        setTwitterReputation(await getMyTwitterReputation());
      }
    })();
  }, [session]);

  function appIsReady(): boolean {
    return !!(session && defaultNetworkId === networkId && _twitterReputation);
  }

  function updateTabIndex(direction: number): void {
    setTabIndex((index: number) => index + direction);
  }

  return (
    <>
      <NavBar
        isConnected={!!connected}
        address={address}
        networkId={networkId as number}
        onAddressClick={() => connect && connect()}
      />
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
              <Tab className={classes.tabButton} label="Web2 Accounts" />
              <Tab
                className={classes.tabButton}
                label="Semaphore groups"
                disabled={!appIsReady()}
              />
              <Tab
                className={classes.tabButton}
                label="Reputation badges"
                disabled={!appIsReady()}
              />
            </Tabs>
            <TabPanelContainer value={_tabIndex} index={0}>
              <Web2AccountsTabPanel
                onArrowClick={appIsReady() ? updateTabIndex : undefined}
                reputation={_twitterReputation?.basicReputation as string}
              />
            </TabPanelContainer>
            {appIsReady() && (
              <>
                <TabPanelContainer value={_tabIndex} index={1}>
                  <SemaphoreGroupsTabPanel
                    onArrowClick={updateTabIndex}
                    reputation={_twitterReputation?.basicReputation as string}
                    web2AccountId={session?.web2AccountId as string}
                  />
                </TabPanelContainer>
                <TabPanelContainer value={_tabIndex} index={2}>
                  <ReputationBadgesTabPanel
                    onArrowClick={updateTabIndex}
                    signer={signer as Signer}
                    networkId={networkId as number}
                    address={address as string}
                    reputation={_twitterReputation?.basicReputation as string}
                    web2AccountId={session?.web2AccountId as string}
                  />
                </TabPanelContainer>
              </>
            )}
          </Card>
        )}
      </Container>
    </>
  );
}
