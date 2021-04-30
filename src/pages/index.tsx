import { signIn, signOut, useSession } from "next-auth/client";
import { useCallback, useEffect, useMemo, useState } from "react";
import ActionSection from "src/components/ActionSection/ActionSection";
import NavBar from "src/components/NavBar/NavBar";
import { createAssociationMessage } from "src/core/linking/signature";
import { AccountReputationByAccount } from "src/models/web2Accounts/Web2Account.types";
import { useWeb3Context } from "src/services/context/Web3Provider";
import { getChainNameFromNetworkId } from "src/utils/frontend/evm";

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

const checkIfMyAccountIsLinked = async () => {
  const response = await fetch(`/api/linking/checkLink`);

  if (response?.status === 200) {
    return await response.json();
  } else {
    console.error("Can't determine if account is already linked");
    return null;
  }
};

// const getDomain = (chainId: number) => ({
//   name: "InterRep",
//   chainId,
// });

export default function Home() {
  const [session] = useSession();
  const hasASession = !!session;

  const { connect, address, connected, networkId, signer } = useWeb3Context();
  const [
    twitterReputation,
    setTwitterReputation,
  ] = useState<AccountReputationByAccount | null>(null);
  const [isCurrentAccountLinked, setIsCurrentAccountLinked] = useState(
    undefined
  );

  const currentNetworkName = useMemo(
    () =>
      (networkId && getChainNameFromNetworkId(networkId)) ||
      "Unsupported network",
    [networkId]
  );
  useEffect(() => {
    if (session) {
      getMyTwitterReputation()
        .then((reputation) => {
          setTwitterReputation(reputation);
        })
        .catch((error) => console.error(error));

      checkIfMyAccountIsLinked()
        .then((response) => {
          response && setIsCurrentAccountLinked(response.isLinkedToAddress);
        })
        .catch((error) => console.error(error));
    }
  }, [session]);

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
    const message = createAssociationMessage({
      address,
      web2AccountId: session.web2AccountId,
    });
    const signature = await signer.signMessage(message);

    await fetch(`/api/linking`, {
      method: "PUT",
      body: JSON.stringify({
        address,
        web2AccountId: session.web2AccountId,
        signature,
      }),
    });
  }, [address, session, signer]);

  return (
    <div className="bg-black min-h-full">
      <NavBar
        isConnected={!!connected}
        address={address}
        networkName={currentNetworkName}
        onAddressClick={() => connect && connect()}
      />
      <div className="max-w-7xl mx-auto mt-10 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto bg-white shadow sm:rounded-lg">
          <ActionSection
            title="Web 3 Authentication"
            onClick={() => connect && connect()}
            buttonText={connected ? "CHANGE WALLET" : "CONNECT WALLET"}
            buttonClassname=" bg-blue-600 hover:bg-blue-700"
            text={
              connected
                ? `You are connected with ${address}`
                : "Connect your wallet to get started"
            }
          />
          {/* Twitter section */}
          <div className="px-4 pb-5 sm:p-6 flex flex-col">
            <h2 className="text-xl mb-3 leading-6 font-medium text-gray-900">
              Web 2 Authentication
            </h2>
            <h3 className="text-base text-blue-500">Twitter</h3>
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
                  onClick={() => (hasASession ? signOut() : signIn())}
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
                <p>{!connected && "Please connect your wallet first"}</p>
                <p>
                  {connected && isCurrentAccountLinked
                    ? "Your account is already linked to an Ethereum address"
                    : "Your account is not linked to any Ethereum address"}
                </p>
              </div>
              <div className="mt-5 sm:mt-0 sm:ml-6 sm:flex-shrink-0 sm:flex sm:items-center">
                <button
                  disabled={!connected || isCurrentAccountLinked}
                  onClick={() => signAssociation()}
                  type="button"
                  className={`inline-flex items-center px-4 py-2 border border-transparent shadow-sm font-medium rounded-md text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:text-sm  bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300`}
                >
                  LINK ADDRESS
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
