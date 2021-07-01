import { ethers } from "ethers";
import { signIn, signOut, useSession } from "next-auth/client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { isBrowser, isMobile } from "react-device-detect";
import ActionSection from "src/components/ActionSection/ActionSection";
import NavBar from "src/components/NavBar/NavBar";
import { createUserAttestationMessage } from "src/core/signing/createUserAttestationMessage";
import useMyTokens from "src/hooks/useMyTokens";
import { ITokenDocument, TokenStatus } from "src/models/tokens/Token.types";
import {
  AccountReputationByAccount,
  BasicReputation,
} from "src/models/web2Accounts/Web2Account.types";
import { useWeb3Context } from "src/services/context/Web3Provider";
import { getBadgeAddressByProvider } from "src/utils/crypto/deployedContracts";
import { getChainNameFromNetworkId } from "src/utils/frontend/evm";

import ReputationBadge from "artifacts/src/contracts/ReputationBadge.sol/ReputationBadge.json";
import { getDefaultNetworkId } from "src/utils/crypto/getDefaultNetwork";
import useEncryption from "src/hooks/useEncryption";
import { getChecksummedAddress } from "src/utils/crypto/address";
import DeployedContractSection from "src/components/DeployedContractSection/DeployedContractSection";
import Spinner from "src/components/Spinner/Spinner";
import { getAccountLinkingInstruction } from "src/utils/frontend/getAccountLinkingInstruction";
import TwitterIcon from "src/components/TwitterIcon";

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

// const getDomain = (chainId: number) => ({
//   name: "InterRep",
//   chainId,
// });

// TODO: split this huge component
export default function Home() {
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
  const [isMintingInProgress, setIsMintingInProgress] = useState(false);
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
  }, [networkId, setIsOnProperNetwork]);

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

  // const signTypedData = async () => {
  //   if (!networkId || !signer) return;
  //   const domain = getDomain(networkId);
  //   const types = {
  //     Main: [
  //       { name: "recipient", type: "address" },
  //       { name: "reputable", type: "bool" },
  //       { name: "provider", type: "string" },
  //     ],
  //   };
  //   const value = {
  //     recipient: address,
  //     reputable: true,
  //     provider: "twitter",
  //   };
  //   return await signer._signTypedData(domain, types, value);
  // };

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
          console.log(`userSignature`, userSignature);
        } catch (err) {
          console.error(err);
          setAccountLinkingMessage(
            "Your signature is needed to register your intent to link the accounts"
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
            `Sorry there was an error while linking your accounts`
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
      setIsMintingInProgress(true);
      mintToken(tokenId).then((data) => {
        if (data) {
          console.log(`data`, data);
        }
        setIsMintingInProgress(false);
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
        const badge = new ethers.Contract(
          getBadgeAddressByProvider(web2Provider),
          ReputationBadge.abi
        );

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
    <div className="bg-black min-h-full">
      <NavBar
        isConnectButtonDisplayed={isBrowser}
        isConnected={!!connected}
        address={address}
        networkName={currentNetworkName}
        onAddressClick={() => connect && connect()}
      />
      <div className="max-w-7xl mx-auto mt-10 px-4 sm:px-6 lg:px-8">
        {isMobile && (
          <p className="text-xl text-white">
            Sorry, mobile and tablet devices are currently not supported. Please
            access InterRep from a desktop browser with the Metamask extension
            installed.
          </p>
        )}
        {isBrowser && isOnProperNetwork && (
          <>
            <div className="max-w-2xl mx-auto bg-white shadow sm:rounded-lg">
              <ActionSection
                title="Ethereum Address"
                onClick={() => connect && connect()}
                isButtonDisplayed={!connected}
                buttonText={"CONNECT WALLET"}
                buttonClassname=" bg-blue-600 hover:bg-blue-700"
                textChildren={
                  <>
                    {connected ? (
                      <p>
                        You are connected with{" "}
                        <span className="font-semibold">{address}</span>
                      </p>
                    ) : (
                      <p>Connect your wallet to get started</p>
                    )}
                  </>
                }
              />
              {/* Twitter section */}
              <div className="px-4 pb-5 sm:p-6 flex flex-col">
                <h2 className="text-xl mb-3 leading-6 font-medium text-gray-900">
                  Twitter Account
                </h2>
                <div className="sm:flex sm:items-center sm:justify-between">
                  <div className="max-w-xl text-base text-gray-700">
                    <p>
                      {session
                        ? `You are connected as ${session?.user?.name}`
                        : "Sign in with Twitter"}
                    </p>
                  </div>
                  <div className="mt-5 sm:mt-0 sm:ml-6 sm:flex-shrink-0 sm:flex sm:items-center">
                    <button
                      onClick={() =>
                        hasASession ? signOut() : signIn("twitter")
                      }
                      type="button"
                      className={`inline-flex items-center px-4 py-2 border border-transparent shadow-sm font-medium rounded-md text-white  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:text-sm ${
                        hasASession
                          ? " bg-red-700 hover:bg-red-800"
                          : " bg-blue-600 hover:bg-blue-700"
                      }`}
                    >
                      {hasASession ? "LOG OUT" : "SIGN IN"}
                    </button>
                  </div>
                </div>
                {twitterReputation?.basicReputation ? (
                  <p className="text-base text-gray-700">
                    Twitter reputation: {twitterReputation.basicReputation}
                  </p>
                ) : null}
              </div>
              <div className="px-4 pb-5 sm:p-6 flex flex-col">
                <h2 className="text-xl mb-3 leading-6 font-medium text-gray-900">
                  Account Linking
                </h2>
                <div className="sm:flex sm:items-center sm:justify-between">
                  <div className="max-w-xl text-base text-gray-700">
                    <p>
                      {getAccountLinkingInstruction({
                        connected,
                        hasASession,
                        isCurrentAccountLinked,
                        hasEnoughReputation:
                          twitterReputation?.basicReputation ===
                          BasicReputation.CONFIRMED,
                      })}
                    </p>
                    <p>{accountLinkingMessage}</p>
                  </div>
                  <div className="mt-5 sm:mt-0 sm:ml-6 sm:flex-shrink-0 sm:flex sm:items-center">
                    <button
                      disabled={
                        !connected ||
                        twitterReputation?.basicReputation !==
                          BasicReputation.CONFIRMED ||
                        isCurrentAccountLinked
                      }
                      onClick={() => signAssociation()}
                      type="button"
                      className={`inline-flex items-center px-4 py-2 border border-transparent shadow-sm font-medium rounded-md text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:text-sm  bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300`}
                    >
                      LINK ACCOUNTS
                    </button>
                  </div>
                </div>
              </div>
              <div className="px-4 pb-5 sm:p-6 flex flex-col">
                <h2 className="text-xl mb-3 leading-6 font-medium text-gray-900">
                  Badges
                </h2>
                {!connected && <p>Please connect your wallet first.</p>}
                <TwitterIcon
                  className={`w-6 fill-current ${
                    tokens.length > 0 ? "text-twitter-blue" : "text-gray-300"
                  }`}
                />
                {tokens.length > 0 &&
                  tokens.map((token) => (
                    <div
                      key={token.decimalId}
                      className="sm:flex sm:items-center sm:justify-between my-4"
                    >
                      <div className="max-w-xl text-base text-gray-700">
                        <div className="text-xs">
                          <p>id: {token.decimalId}</p>
                          <p>status: {token.status}</p>
                        </div>
                      </div>
                      <div className="mt-5 sm:mt-0 sm:mx-auto sm:flex-shrink-0 sm:flex sm:items-center">
                        {token.status === TokenStatus.NOT_MINTED && (
                          <button
                            disabled={
                              token.status !== TokenStatus.NOT_MINTED ||
                              isMintingInProgress
                            }
                            onClick={() => {
                              mintTokenAndRefetch(token._id);
                            }}
                            type="button"
                            className={`inline-flex items-center px-4 py-2 border border-transparent shadow-sm font-medium rounded-md text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:text-sm  bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-default`}
                          >
                            {isMintingInProgress && <Spinner />}
                            MINT
                          </button>
                        )}
                        {token.status === TokenStatus.MINTED && (
                          <button
                            disabled={token.status !== TokenStatus.MINTED}
                            onClick={() =>
                              burnToken(token.web2Provider, token.decimalId)
                            }
                            type="button"
                            className={`inline-flex items-center px-4 py-2 border border-transparent shadow-sm font-medium rounded-md text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:text-sm  bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300`}
                          >
                            BURN
                          </button>
                        )}
                        {token.status === TokenStatus.BURNED && (
                          <button
                            onClick={() => unlinkAccounts(token)}
                            type="button"
                            className={`inline-flex items-center px-4 py-2 border border-transparent shadow-sm font-medium rounded-md text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:text-sm  bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300`}
                          >
                            UNLINK ACCOUNTS
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
            <DeployedContractSection />
          </>
        )}
      </div>
    </div>
  );
}
