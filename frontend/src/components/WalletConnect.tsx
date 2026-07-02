"use client";

import { useWallet } from "@meshsdk/react";
import { useState, useEffect } from "react";
import { Wallet, LogOut, Loader2, ArrowRight } from "lucide-react";

export default function WalletConnect() {
  const { connect, disconnect, connected, name, connecting, wallet } = useWallet();
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
      } else {
        setAddress(null);
      }
    }
    fetchAddress();
  }, [connected, wallet]);

  const handleConnect = async () => {
    try {
      await connect("lace");
    } catch (error) {
      console.error("Connection failed", error);
    }
  };

  const handleDisconnect = () => {
    disconnect();
    setAddress(null);
  };

  return (
    <div className="bezel-shell w-full max-w-md mx-auto">
      <div className="bezel-core p-8 flex flex-col items-center justify-center text-zinc-100 min-h-[350px]">
        <div className="flex items-center space-x-3 mb-10 w-full justify-between">
          <h2 className="text-2xl font-bold tracking-tight">Access</h2>
          <div className="flex items-center space-x-2 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
            <div className={`w-2 h-2 rounded-full ${connected ? 'bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.8)]' : 'bg-zinc-500'} animate-pulse`} />
            <span className="text-[10px] uppercase tracking-widest font-medium text-zinc-400">{connected ? 'Secured' : 'Offline'}</span>
          </div>
        </div>

        {connected ? (
          <div className="flex flex-col items-center w-full animate-in fade-in zoom-in duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]">
            <div className="mb-8 bg-emerald-500/10 text-emerald-300 font-medium text-xs uppercase tracking-[0.2em] px-4 py-1.5 rounded-full border border-emerald-500/20">
              {name} Connected
            </div>
            
            <div className="mb-12 w-full">
              <p className="text-[10px] text-zinc-500 mb-2 font-medium uppercase tracking-widest pl-1">Wallet Address</p>
              <div className="bg-black/40 p-4 rounded-2xl border border-white/5 font-mono text-xs break-all text-zinc-300 shadow-inner relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite]" />
                {address ? `${address.slice(0, 12)}...${address.slice(-10)}` : <span className="animate-pulse text-zinc-600">Establishing handshake...</span>}
              </div>
            </div>
            
            <button
              onClick={handleDisconnect}
              className="group relative px-6 py-4 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 rounded-full font-medium smooth-spring w-full border border-white/10 flex justify-between items-center active:scale-[0.98]"
            >
              <span className="pl-2">Disconnect</span>
              <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center smooth-spring group-hover:bg-rose-500/20 group-hover:text-rose-400">
                <LogOut size={14} className="smooth-spring group-hover:translate-x-0.5" />
              </div>
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center w-full justify-end flex-grow pb-2">
            <button
              onClick={handleConnect}
              disabled={connecting}
              className="group relative px-6 py-4 bg-white text-black hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-full font-semibold smooth-spring w-full flex justify-between items-center active:scale-[0.98]"
            >
              {connecting ? (
                <div className="flex items-center justify-center w-full space-x-2">
                  <Loader2 size={18} className="animate-spin text-black/50" />
                  <span className="text-black/70">Connecting...</span>
                </div>
              ) : (
                <>
                  <span className="pl-2">Connect Lace</span>
                  <div className="w-8 h-8 rounded-full bg-black/5 flex items-center justify-center smooth-spring group-hover:bg-black/10">
                    <ArrowRight size={16} className="smooth-spring group-hover:translate-x-1" />
                  </div>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
