import { useMemo } from "react";
import ActionPanel from "src/components/ActionPanel/ActionPanel";
import NavBar from "src/components/NavBar/NavBar";
import { useWeb3Context } from "src/services/context/Web3Provider";
import { getChainNameFromNetworkId } from "src/utils/frontend/evm";

export default function Home() {
  const { connect, address, connected, networkId } = useWeb3Context();

  const currentNetworkName = useMemo(
    () =>
      (networkId && getChainNameFromNetworkId(networkId)) ||
      "Unsupported network",
    [networkId]
  );

  return (
    <div className="bg-black min-h-full">
      <NavBar
        isConnected={!!connected}
        address={address}
        networkName={currentNetworkName}
        onAddressClick={() => connect && connect()}
      />
      <p>Connected: {connected ? "true" : "false"}</p>
      <p>{address || "Not connected"}</p>
      <button onClick={connect}>Connect</button>
      <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
        <ActionPanel
          title="Connect your wallet to get started"
          onClick={() => connect && connect()}
          buttonText="Connect wallet"
        />
      </div>
    </div>
  );
}
