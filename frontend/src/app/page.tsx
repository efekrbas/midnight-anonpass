import WalletConnect from "@/components/WalletConnect";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-zinc-50 dark:bg-black">
      <main className="flex flex-col items-center gap-8">
        <h1 className="text-4xl font-bold tracking-tight text-center">
          Cardano AnonPass
        </h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-400 text-center max-w-xl">
          Connect your Lace wallet to securely verify your credentials without revealing sensitive data.
        </p>
        <WalletConnect />
      </main>
    </div>
  );
}
