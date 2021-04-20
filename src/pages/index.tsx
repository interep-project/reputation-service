import ActionPanel from "src/components/ActionPanel/ActionPanel";
import { useWeb3Context } from "src/services/context/Web3Provider";

export default function Home() {
  const { connect, address, connected } = useWeb3Context();

  return (
    <div className="bg-gray-100 min-h-full">
      <h1>Home</h1>
      <p>Connected: {connected ? "true" : "false"}</p>
      <p>{address || "Not connected"}</p>
      <button onClick={connect}>Connect</button>
      <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
        <ActionPanel
          title="Connect your wallet to get started"
          onClick={() => null}
          buttonText="Connect wallet"
        />
      </div>
    </div>
  );
}
