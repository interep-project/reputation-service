import { signIn, signOut, useSession } from "next-auth/client";
import { useMemo } from "react";
import ActionSection from "src/components/ActionSection/ActionSection";
import NavBar from "src/components/NavBar/NavBar";
import { useWeb3Context } from "src/services/context/Web3Provider";
import { getChainNameFromNetworkId } from "src/utils/frontend/evm";

export default function Home() {
  const [session] = useSession();
  const { connect, address, connected, networkId } = useWeb3Context();

  const currentNetworkName = useMemo(
    () =>
      (networkId && getChainNameFromNetworkId(networkId)) ||
      "Unsupported network",
    [networkId]
  );

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
            buttonClassname=" bg-indigo-600 hover:bg-indigo-700"
            text={
              connected
                ? `You are connected with ${address}`
                : "Connect your wallet to get started"
            }
          />
          <ActionSection
            title="Twitter Authentication"
            onClick={() => (hasASession ? signOut() : signIn())}
            buttonText={hasASession ? "LOG OUT" : "SIGN IN"}
            buttonClassname={
              hasASession
                ? " bg-red-700 hover:bg-red-800"
                : " bg-indigo-600 hover:bg-indigo-700"
            }
            text={
              session
                ? `You are connected as ${session?.user?.name}`
                : "Sign in with Twitter"
            }
          />
        </div>
      </div>
    </div>
  );
}
