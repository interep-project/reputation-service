import { signIn, signOut, useSession } from "next-auth/client";
import { useEffect, useMemo, useState } from "react";
import ActionSection from "src/components/ActionSection/ActionSection";
import NavBar from "src/components/NavBar/NavBar";
import { IUserDocument } from "src/models/users/User.types";
import { useWeb3Context } from "src/services/context/Web3Provider";
import { getChainNameFromNetworkId } from "src/utils/frontend/evm";

const getMyTwitterUser = async () => {
  let response;
  try {
    response = await fetch(`/api/reputation/twitter/`);
  } catch (err) {
    console.error(err);
  }
  console.log(`response`, response);
  if (response?.status === 200) {
    return await response.json();
  } else {
    return null;
  }
};

export default function Home() {
  const [session] = useSession();
  const { connect, address, connected, networkId } = useWeb3Context();
  const [twitterUser, settwitterUser] = useState<
    IUserDocument["twitter"] | null
  >(null);

  const currentNetworkName = useMemo(
    () =>
      (networkId && getChainNameFromNetworkId(networkId)) ||
      "Unsupported network",
    [networkId]
  );

  useEffect(() => {
    getMyTwitterUser()
      .then((user) => {
        console.log(`user`, user);
        settwitterUser(user);
      })
      .catch((error) => console.error(error));
  }, [session]);

  const hasASession = !!session;

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
            {twitterUser?.reputation ? (
              <p className="text-base text-gray-700">
                Twitter reputation: {twitterUser.reputation}
              </p>
            ) : null}
          </div>
          <div className="px-4 pb-5 sm:p-6 flex flex-col">
            <h2 className="text-xl mb-3 leading-6 font-medium text-gray-900">
              Account Linking
            </h2>
            <div className="sm:flex sm:items-center sm:justify-between">
              <div className="max-w-xl text-base text-gray-700">
                <p>Your account is not linked to any Ethereum address</p>
              </div>
              <div className="mt-5 sm:mt-0 sm:ml-6 sm:flex-shrink-0 sm:flex sm:items-center">
                <button
                  onClick={() => null}
                  type="button"
                  className={`inline-flex items-center px-4 py-2 border border-transparent shadow-sm font-medium rounded-md text-white  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:text-sm  bg-blue-600 hover:bg-blue-700`}
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
