"use client";

import WalletConnect from "@/components/WalletConnect";
import AgeVerifier from "@/components/AgeVerifier";
import { motion } from "framer-motion";

export default function Home() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 40, filter: "blur(10px)" },
    visible: { 
      opacity: 1, 
      y: 0, 
      filter: "blur(0px)",
      transition: { duration: 0.8, ease: [0.32, 0.72, 0, 1] as const } 
    }
  };

  return (
    <div className="flex flex-col items-center min-h-[100dvh] pt-32 pb-40 px-6 sm:px-12 w-full text-zinc-100">
      <motion.main 
        className="flex flex-col items-center w-full max-w-6xl z-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants} className="flex flex-col items-center text-center max-w-4xl">
          <div className="rounded-full px-4 py-1.5 text-[11px] uppercase tracking-[0.25em] font-medium bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 mb-8 backdrop-blur-md">
            Cryptographic Identity
          </div>
          <h1 className="text-6xl sm:text-7xl md:text-8xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-white/40 mb-8 leading-[1.1]">
            Prove Everything. <br/> Reveal Nothing.
          </h1>
          <p className="text-xl sm:text-2xl text-zinc-400 font-light max-w-2xl mb-24 leading-relaxed">
            A frictionless zero-knowledge gateway. Authenticate your credentials on Midnight without exposing underlying data.
          </p>
        </motion.div>
        
        <motion.div variants={itemVariants} className="w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-5xl mx-auto">
            <WalletConnect />
            <AgeVerifier />
          </div>
        </motion.div>
      </motion.main>
    </div>
  );
}
