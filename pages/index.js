import { useWeb3 } from "@3rdweb/hooks";

export default function Home() {
  const { connectWallet, address, error, provider } = useWeb3();
  console.log("👋 Address:", address);

  // User is not connected, show connect wallet button
  if (!address) {
    return (
      <div className="landing">
        <h1>Welcome to Recipe DAO</h1>
        <button onClick={() => connectWallet("injected")} className="btn-hero">
          Connect your wallet
        </button>
      </div>
    );
  }

  return (
    <div className="landing">
      <h1>👀 wallet connected, now what!</h1>
    </div>
  );
}
