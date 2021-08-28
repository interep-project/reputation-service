import { ethers } from "ethers";
import { signIn, signOut, useSession } from "next-auth/client";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { isBrowser, isMobile } from "react-device-detect";
import ActionSection from "src/components/ActionSection";
import NavBar from "src/components/NavBar";
import { createUserAttestationMessage } from "src/core/signing/createUserAttestationMessage";
import useMyTokens from "src/hooks/useMyTokens";
import { ITokenDocument } from "src/models/tokens/Token.types";
import {
  AccountReputationByAccount,
  BasicReputation,
} from "src/models/web2Accounts/Web2Account.types";
import { useWeb3Context } from "src/services/context/Web3Provider";
import { getBadgeAddressByProvider } from "src/utils/crypto/deployedContracts";
import { getChainNameFromNetworkId } from "src/utils/frontend/evm";
import ReputationBadge from "contracts/artifacts/contracts/ReputationBadge.sol/ReputationBadge.json";
import { getDefaultNetworkId } from "src/utils/crypto/getDefaultNetwork";
import useEncryption from "src/hooks/useEncryption";
import { getChecksummedAddress } from "src/utils/crypto/address";
import Footer from "src/components/Footer";
import { getAccountLinkingInstruction } from "src/utils/frontend/getAccountLinkingInstruction";
import semethid from "semethid";
import {
  Container,
  createStyles,
  List,
  makeStyles,
  Theme,
  Typography,
} from "@material-ui/core";
import { getSemaphoreGroupInstruction } from "src/utils/frontend/getSemaphoreGroupInstruction";
import Badges from "src/components/Badges";

// TODO: create abstraction for calls to API and error handling
const getMyTwitterReputation = async () => {
  let response;
  try {
    response = await fetch(`/api/reputation/twitter/me`);
  } catch (err) {
    console.error(err);
  }

  if (response?.status === 200) {
    return await response.json();
  } else {
    return null;
  }
};

const callCheckLink = async () => {
  const response = await fetch(`/api/linking/checkLink`);

  if (response?.status === 200) {
    return await response.json();
  } else {
    console.error("Can't determine if account is already linked");
    return null;
  }
};

const mintToken = async (tokenId: string) => {
  try {
    const response = await fetch(`/api/tokens/mint`, {
      method: "POST",
      body: JSON.stringify({
        tokenId,
      }),
    });

    if (response?.status === 200) {
      const data = await response.json();
      return data;
    } else if (response?.status === 400) {
      const data = await response.json();
      console.error(`Error: ${data.error}`);
      return;
    } else {
      console.error(`Error while minting token`);
      return;
    }
  } catch (err) {
    console.error(err);
  }
};

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    container: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "column",
      flex: 1,
      paddingBottom: theme.spacing(4),
    },
  })
);

export default function Home(): JSX.Element {
  const classes = useStyles();
  const [session] = useSession();
  const hasASession = !!session;

  const {
    connect,
    address,
    connected = false,
    networkId,
    signer,
  } = useWeb3Context();
  const { getPublicKey, decrypt } = useEncryption();
  const [
    twitterReputation,
    setTwitterReputation,
  ] = useState<AccountReputationByAccount | null>(null);
  const [isCurrentAccountLinked, setIsCurrentAccountLinked] = useState(
    undefined
  );
  const [accountLinkingMessage, setAccountLinkingMessage] = useState("");
  const [semaphoreGroupMessage, setSemaphoreGroupMessage] = useState("");
  const [isOnProperNetwork, setIsOnProperNetwork] = useState<boolean | null>(
    null
  );

  const { tokens, refetchTokens } = useMyTokens(address);

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

  const checkIfMyAccountIsLinked = () => {
    callCheckLink()
      .then((response) => {
        response && setIsCurrentAccountLinked(response.isLinkedToAddress);
      })
      .catch((error) => console.error(error));
  };

  useEffect(() => {
    if (session) {
      getMyTwitterReputation()
        .then((reputation) => {
          setTwitterReputation(reputation);
        })
        .catch((error) => console.error(error));

      checkIfMyAccountIsLinked();
    }
  }, [session, accountLinkingMessage]);

  const createIdentityCommitment = useCallback(async () => {
    if (!signer || !address) {
      console.error("Can't sign without a signer");
      return;
    }
    if (!session?.web2AccountId) {
      console.error("Unknown Web 2 account");
      return;
    }

    setSemaphoreGroupMessage("Creating your Semaphore identity...");

    const checksummedAddress = getChecksummedAddress(address);

    if (!checksummedAddress) {
      console.error("Invalid address");
      return;
    }

    if (!twitterReputation?.basicReputation) {
      console.error("No Twitter reputation criteria");
      return;
    }

    const groupId = `TWITTER_${twitterReputation?.basicReputation}`;
    const identityCommitment = (await semethid(groupId)).toString();

    setSemaphoreGroupMessage(`Adding your Semaphore identity to the group.`);

    try {
      const res = await fetch(`/api/groups/${groupId}`, {
        method: "PUT",
        body: JSON.stringify({
          identityCommitment,
          web2AccountId: session.web2AccountId,
        }),
      });

      const payload = await res.json();

      if (payload.status === "ok") {
        setSemaphoreGroupMessage("Success!");
      } else if (payload?.error) {
        setSemaphoreGroupMessage(`Error: ${payload.error}`);
      } else {
        setSemaphoreGroupMessage(
          `Sorry there was an error while adding your Semaphore identity.`
        );
      }
    } catch (error) {
      console.error(error);
      setSemaphoreGroupMessage(JSON.stringify(error.message));
    }
  }, [address, session, signer, twitterReputation]);

  const signAssociation = useCallback(async () => {
    if (!signer || !address) {
      console.error("Can't sign without a signer");
      return;
    }
    if (!session?.web2AccountId) {
      console.error("Unknown Web 2 account");
      return;
    }
    setAccountLinkingMessage(`Linking in progress...`);
    const checksummedAddress = getChecksummedAddress(address);

    if (!checksummedAddress) {
      console.error("Invalid address");
      return;
    }

    getPublicKey()
      .then((pubKey) => {
        if (!pubKey) throw new Error("Public key is needed to link accounts");
        setAccountLinkingMessage(
          "Please confirm that you wish to link your accounts by opening Metamask and signing the message."
        );
        return pubKey;
      })
      .then(async (pubKey) => {
        let userSignature;

        try {
          const message = createUserAttestationMessage({
            checksummedAddress,
            web2AccountId: session.web2AccountId,
          });

          userSignature = await signer.signMessage(message);

          if (!userSignature)
            throw new Error(
              "Your signature is needed to register your intent to link the accounts"
            );
        } catch (err) {
          console.error(err);

          setAccountLinkingMessage(
            "Your signature is needed to register your intent to link the accounts."
          );
        }
        return { pubKey, userSignature };
      })
      .then(({ pubKey, userSignature }) => {
        return fetch(`/api/linking`, {
          method: "PUT",
          body: JSON.stringify({
            chainId: networkId,
            address,
            web2AccountId: session.web2AccountId,
            userSignature,
            userPublicKey: pubKey,
          }),
        });
      })
      .then((res) => res.json())
      .then((payload) => {
        if (payload.status === "ok") {
          setAccountLinkingMessage("Success!");
        } else if (payload?.error) {
          setAccountLinkingMessage(`Error: ${payload.error}`);
        } else {
          setAccountLinkingMessage(
            `Sorry there was an error while linking your accounts.`
          );
        }
      })
      .catch((err) => {
        console.error(err);
        setAccountLinkingMessage(JSON.stringify(err.message));
      })
      .finally(() => refetchTokens());
  }, [address, refetchTokens, session, signer, networkId, getPublicKey]);

  const mintTokenAndRefetch = useCallback(
    (tokenId) => {
      mintToken(tokenId).then((data) => {
        if (data) {
          console.log(`data`, data);
        }
        refetchTokens();
      });
    },
    [refetchTokens]
  );

  const burnToken = useCallback(
    async (web2Provider, tokenId) => {
      if (!signer) {
        console.error("No signer");
        return;
      }
      try {
        const badgeAddress = getBadgeAddressByProvider(web2Provider);
        if (!badgeAddress) {
          throw new Error("Cannot retrieve the badge's address");
        }
        const badge = new ethers.Contract(badgeAddress, ReputationBadge.abi);

        const tx = await badge.connect(signer).burn(tokenId);
        await tx.wait();
      } catch (err) {
        console.error(err);
        return;
      } finally {
        refetchTokens();
      }
    },
    // networkId is added as dep so the the callback & badge instance is different if network changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [refetchTokens, signer, networkId]
  );

  const unlinkAccounts = async (token: ITokenDocument) => {
    if (!token.encryptedAttestation) {
      console.error("Error: token has no encrypted attestation");
      return;
    }

    try {
      const decryptedAttestation = await decrypt(token.encryptedAttestation);
      console.log(`decryptedAttestation`, decryptedAttestation);

      await fetch(`/api/linking/unlink`, {
        method: "POST",
        body: JSON.stringify({
          decryptedAttestation,
        }),
      });
    } catch (error) {
      console.error(error);
    } finally {
      await checkIfMyAccountIsLinked();
      await refetchTokens();
    }
  };

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
          <>
            <List component="nav">
              <ActionSection
                title="Twitter account"
                description={
                  session
                    ? `You are connected as ${session?.user?.name}${
                        twitterReputation?.basicReputation
                          ? ` and your reputation is ${twitterReputation?.basicReputation}`
                          : ""
                      }.`
                    : "Sign in with Twitter to join a Semaphore group or to link your Twitter/Ethereum accounts."
                }
                buttonText={hasASession ? "Sign out" : "Sign in"}
                onClick={() => (hasASession ? signOut() : signIn("twitter"))}
                divider
              />
              <ActionSection
                title="Semaphore group"
                description={getSemaphoreGroupInstruction({
                  connected,
                  hasASession,
                  twitterReputation: twitterReputation?.basicReputation,
                })}
                feedbackMessage={semaphoreGroupMessage}
                buttonText={"Join"}
                buttonDisabled={
                  !connected || !twitterReputation?.basicReputation
                }
                onClick={() => createIdentityCommitment()}
                divider
              />
              <ActionSection
                title="Account linking"
                description={getAccountLinkingInstruction({
                  connected,
                  hasASession,
                  isCurrentAccountLinked,
                  hasEnoughReputation:
                    twitterReputation?.basicReputation ===
                    BasicReputation.CONFIRMED,
                })}
                feedbackMessage={accountLinkingMessage}
                buttonText="Link"
                buttonDisabled={
                  !connected ||
                  twitterReputation?.basicReputation !==
                    BasicReputation.CONFIRMED ||
                  isCurrentAccountLinked
                }
                onClick={() => signAssociation()}
              />
            </List>
            <Badges
              tokens={tokens}
              mintFunction={mintTokenAndRefetch}
              burnFunction={burnToken}
              unlinkFunction={unlinkAccounts}
            />
          </>
        )}
      </Container>
      <Footer properNetwork={!!isOnProperNetwork} />
    </>
  );
}
