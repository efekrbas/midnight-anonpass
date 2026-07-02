"use client";

import { useWallet } from "@meshsdk/react";
import { useState, useEffect } from "react";

export default function WalletConnect() {
  const { connect, connected, name, connecting, wallet } = useWallet();
  const [address, setAddress] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAddress() {
      if (connected && wallet) {
        try {
          const addr = await wallet.getChangeAddress();
          setAddress(addr);
        } catch (error) {
          console.error("Failed to fetch address", error);
        }
      }
    }
    fetchAddress();
  }, [connected, wallet]);

  return (
    <div>
      <h2>Cardano Wallet</h2>
      {connected ? (
        <div>
          <p>Connected with {name}</p>
          <p>Address: {address || "Fetching..."}</p>
        </div>
      ) : (
        <button onClick={() => connect("lace")} disabled={connecting}>
          {connecting ? "Connecting..." : "Connect Lace Wallet"}
        </button>
      )}
    </div>
  );
}
