"use client";

import { useState, useEffect } from "react";
import { generateAgeProof, deployAgeVerifier } from "../lib/zkp";
import { ShieldCheck, Loader2, Sparkles, UploadCloud, CheckCircle2 } from "lucide-react";
import { useWallet } from "../contexts/WalletContext";

export default function AgeVerifier() {
  const { session, isConnected } = useWallet();
  const [birthYear, setBirthYear] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [deploying, setDeploying] = useState(false);
  const [proofResult, setProofResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [contractAddress, setContractAddress] = useState<string>("");

  useEffect(() => {
    const saved = localStorage.getItem('midnight_contract_address');
    if (saved) setContractAddress(saved);
  }, []);

  const handleDeploy = async () => {
    if (!session || !isConnected) return;
    setDeploying(true);
    setError(null);
    try {
      const address = await deployAgeVerifier(session, 1990);
      setContractAddress(address);
      localStorage.setItem('midnight_contract_address', address);
    } catch (err: any) {
      const msg = err.message || String(err);
      if (msg.includes("User rejected")) {
        setError("Deployment cancelled in wallet.");
      } else {
        setError("Deployment failed. Make sure you have DUST on Preprod.");
      }
    } finally {
      setDeploying(false);
    }
  };

  const handleProveAge = async () => {
    if (!session || !isConnected) {
      setError("Please connect your wallet first.");
      return;
    }
    if (!contractAddress) {
      setError("Please deploy the contract first!");
      return;
    }

    setLoading(true);
    setError(null);
    setProofResult(null);

    const yearNum = parseInt(birthYear);
    if (isNaN(yearNum) || yearNum < 1900 || yearNum > new Date().getFullYear()) {
      setError("Please enter a valid birth year.");
      setLoading(false);
      return;
    }

    try {
      const currentYear = new Date().getFullYear();
      const result = await generateAgeProof(session, contractAddress, yearNum, currentYear);
      setProofResult(result);
    } catch (err: any) {
      const msg = err.message || String(err);
      if (msg.includes("18 years old")) {
        setError("ZK Circuit rejected: You must be at least 18 years old.");
      } else if (msg.includes("User rejected")) {
        setError("Transaction cancelled in wallet.");
      } else {
        setError("Failed to generate ZK proof. Check your connection or balance.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bezel-shell w-full max-w-md mx-auto">
      <div className="bezel-core p-8 flex flex-col items-center justify-center text-zinc-100 min-h-[350px]">
        <div className="flex items-center space-x-3 mb-10 w-full justify-between">
          <h2 className="text-2xl font-bold tracking-tight">Identity</h2>
          <div className="flex items-center space-x-2 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
            <ShieldCheck size={14} className="text-emerald-400" />
            <span className="text-[10px] uppercase tracking-widest font-medium text-zinc-400">ZK Proof</span>
          </div>
        </div>

        {contractAddress ? (
          <div className="w-full mb-6 p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl flex items-start space-x-3">
            <CheckCircle2 size={18} className="text-emerald-500 mt-0.5 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-[10px] uppercase tracking-widest text-emerald-500/80 mb-1 font-semibold">Contract Deployed</p>
              <p className="font-mono text-xs text-zinc-300 truncate">{contractAddress}</p>
            </div>
          </div>
        ) : (
          <button
            onClick={handleDeploy}
            disabled={deploying || !isConnected}
            className="w-full mb-6 py-4 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 text-white rounded-2xl font-medium flex items-center justify-center space-x-3 border border-white/10 transition-colors shadow-sm"
          >
            {deploying ? <Loader2 size={16} className="animate-spin text-zinc-400" /> : <UploadCloud size={16} className="text-zinc-400" />}
            <span className="tracking-wide">{deploying ? "Deploying via Lace..." : "Deploy ZK Contract"}</span>
          </button>
        )}

        <div className="w-full mb-6 relative group">
          <label className="block text-[10px] font-medium uppercase tracking-widest text-zinc-500 mb-2 pl-1">Birth Year (Kept Private)</label>
          <div className="relative">
            <input 
              type="number" 
              value={birthYear}
              onChange={(e) => setBirthYear(e.target.value)}
              placeholder="1995"
              className="w-full bg-black/40 border border-white/5 p-4 rounded-2xl outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all font-mono text-center text-xl tracking-widest shadow-inner placeholder:text-zinc-700"
            />
            <div className="absolute inset-0 rounded-2xl pointer-events-none border border-white/5 group-hover:border-white/10 transition-colors" />
          </div>
        </div>

        <button
          onClick={handleProveAge}
          disabled={loading || !birthYear || !isConnected || !contractAddress}
          className="group relative px-6 py-4 bg-emerald-500 hover:bg-emerald-400 disabled:bg-zinc-800 disabled:text-zinc-500 text-black rounded-full font-semibold smooth-spring w-full flex justify-between items-center active:scale-[0.98]"
        >
          {loading ? (
             <div className="flex items-center justify-center w-full space-x-2">
               <Loader2 size={18} className="animate-spin text-black/50" />
               <span className="text-black/70">Proving...</span>
             </div>
          ) : (
            <>
              <span className="pl-2 tracking-wide">{isConnected ? "Verify Age" : "Connect Wallet First"}</span>
              <div className="w-8 h-8 rounded-full bg-black/10 flex items-center justify-center smooth-spring group-hover:bg-black/20">
                <Sparkles size={16} className="smooth-spring group-hover:scale-110 group-hover:rotate-12" />
              </div>
            </>
          )}
        </button>

        {error && (
          <div className="mt-6 w-full p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-400 text-xs font-medium text-center animate-in fade-in zoom-in duration-300">
            {error}
          </div>
        )}

        {proofResult && (
          <div className="mt-8 w-full text-left animate-in fade-in slide-in-from-bottom-4 duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]">
            <div className="flex items-center justify-between mb-3">
               <p className="text-[10px] text-zinc-500 font-medium uppercase tracking-widest pl-1">Cryptographic Proof</p>
               <div className="flex items-center space-x-1 text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-md border border-emerald-500/20">
                 <ShieldCheck size={10} />
                 <span className="text-[9px] uppercase tracking-wider font-bold">Verified On-Chain</span>
               </div>
            </div>
            
            <div className="bg-black/40 p-5 rounded-2xl border border-white/5 shadow-inner">
               <div className="flex flex-col space-y-4">
                  <div>
                    <span className="text-[10px] uppercase tracking-widest text-zinc-500 block mb-1">Transaction Hash</span>
                    <span className="font-mono text-sm text-emerald-300 break-all block">{proofResult.txHash}</span>
                  </div>
               </div>
            </div>
            
            <div className="mt-4 flex items-center justify-center space-x-2 bg-emerald-500/5 px-3 py-2.5 rounded-xl border border-emerald-500/10">
              <ShieldCheck size={14} className="text-emerald-500" />
              <p className="text-[10px] text-emerald-400/80 font-medium tracking-wide">Underlying data is cryptographically obscured.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
