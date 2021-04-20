import { useWeb3Context } from "src/services/context/Web3Provider";

export default function Home() {
  const { connect, address, connected } = useWeb3Context();

  return (
    <div>
      <h1>Home</h1>
      <p>Connected: {connected ? "true" : "false"}</p>
      <p>{address || "Not connected"}</p>
      <button onClick={connect}>Connect</button>
    </div>
  );
}
