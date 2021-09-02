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
import React, { useEffect, useMemo, useState } from "react";
import { isBrowser, isMobile } from "react-device-detect";
import Footer from "src/components/Footer";
import NavBar from "src/components/NavBar";
import ReputationBadgesTabPanel from "src/components/ReputationBadgesTabPanel";
import SemaphoreGroupsTabPanel from "src/components/SemaphoreGroupsTabPanel";
import TabPanelContainer from "src/components/TabPanelContainer";
import Web2AccountsTabPanel from "src/components/Web2AccountsTabPanel";
import { AccountReputationByAccount } from "src/models/web2Accounts/Web2Account.types";
import { useWeb3Context } from "src/services/context/Web3Provider";
import { getDefaultNetworkId } from "src/utils/crypto/getDefaultNetwork";
import { getMyTwitterReputation } from "src/utils/frontend/api";
import { getChainNameFromNetworkId } from "src/utils/frontend/evm";

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

export default function Home(): JSX.Element {
  const classes = useStyles();
  const [session] = useSession();
  const {
    connect,
    address,
    connected = false,
    networkId,
    signer,
  } = useWeb3Context();
  const [
    twitterReputation,
    setTwitterReputation,
  ] = useState<AccountReputationByAccount | null>(null);
  const [isOnProperNetwork, setIsOnProperNetwork] = useState<boolean | null>(
    null
  );
  const [_tabIndex, setTabIndex] = React.useState(0);

  useEffect(() => {
    const expectedNetworkId = getDefaultNetworkId();

    if (networkId && networkId !== expectedNetworkId) {
      setIsOnProperNetwork(false);
      alert(
        `Please switch to ${getChainNameFromNetworkId(
          expectedNetworkId
        )} network`
      );
    } else if (networkId && networkId === expectedNetworkId) {
      // user switched from wrong to right network, force-reload the page
      if (isOnProperNetwork === false) {
        window.location.reload();
      } else if (isOnProperNetwork === null) {
        setIsOnProperNetwork(true);
      }
    }
  }, [networkId, isOnProperNetwork]);

  const currentNetworkName = useMemo(
    () =>
      (networkId && getChainNameFromNetworkId(networkId)) ||
      "Unsupported network",
    [networkId]
  );

  useEffect(() => {
    (async () => {
      if (session) {
        setTwitterReputation(await getMyTwitterReputation());
      }
    })();
  }, [session]);

  return (
    <>
      <NavBar
        isConnectButtonDisplayed={isBrowser}
        isConnected={!!connected}
        address={address}
        networkName={currentNetworkName}
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
                disabled={!session || !connected}
              />
              <Tab
                className={classes.tabButton}
                label="Reputation badges"
                disabled={!session || !connected}
              />
            </Tabs>
            <TabPanelContainer value={_tabIndex} index={0}>
              <Web2AccountsTabPanel
                onArrowClick={(direction) =>
                  setTabIndex((index) => index + direction)
                }
              />
            </TabPanelContainer>
            {session && connected && twitterReputation && (
              <>
                <TabPanelContainer value={_tabIndex} index={1}>
                  <SemaphoreGroupsTabPanel
                    onArrowClick={(direction) =>
                      setTabIndex((index) => index + direction)
                    }
                    reputation={twitterReputation.basicReputation as string}
                    web2AccountId={session.web2AccountId}
                  />
                </TabPanelContainer>
                <TabPanelContainer value={_tabIndex} index={2}>
                  <ReputationBadgesTabPanel
                    onArrowClick={(direction) =>
                      setTabIndex((index) => index + direction)
                    }
                    signer={signer as Signer}
                    networkId={networkId as number}
                    address={address as string}
                    reputation={twitterReputation.basicReputation as string}
                    web2AccountId={session.web2AccountId}
                  />
                </TabPanelContainer>
              </>
            )}
          </Card>
        )}
      </Container>
      <Footer properNetwork={!!isOnProperNetwork} />
    </>
  );
}
