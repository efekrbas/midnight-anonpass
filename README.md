# Midnight AnonPass 🛡️

> Zero-Knowledge Age Verification on the Midnight Network — prove you're 18+ without revealing your birth year.

## Project Links & Demo
- **Live Demo:** [https://midnight-anonpass.vercel.app](https://midnight-anonpass.vercel.app)
- **Network:** Midnight Preprod
- **Privacy Claim:** Users verify age on-chain without revealing their birth year. The ZK circuit mathematically proves `currentYear - birthYear >= 18` while the birth year remains hidden inside the proof — never disclosed to the blockchain or any third party.

### Demo Video

<video controls width="100%">
  <source src="./demovideo.mp4" type="video/mp4">
  Your browser does not support the video tag.
</video>


## How It Works

```
┌─────────────┐    ┌──────────────────┐    ┌──────────────────┐
│  User enters │───▶│  ZK Proof Server  │───▶│  Midnight Chain  │
│  birth year  │    │  (Docker, local)  │    │  (Preprod)       │
│  (private)   │    │  Generates proof  │    │  Verifies proof  │
└─────────────┘    └──────────────────┘    └──────────────────┘
       │                                            │
       │         Birth year NEVER leaves            │
       │         the user's machine                 │
       │                                            ▼
       │                                   ┌──────────────────┐
       └──────────────────────────────────▶│  ✅ "User is 18+" │
                                           │  recorded on-chain│
                                           └──────────────────┘
```

1. **User** enters their birth year in the frontend (kept completely private).
2. **Compact Contract** (`age_verifier.compact`) defines a ZK circuit `proveAge` that asserts `currentYear - birthYear >= 18`.
3. **Local Proof Server** (Docker) generates a cryptographic proof without exposing the birth year.
4. **Lace Wallet** signs and submits the proven transaction to the Midnight Preprod network.
5. **On-chain**, only the verification count increments — the birth year is never stored or disclosed.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Smart Contract** | Compact (`age_verifier.compact`) |
| **ZK Proofs** | Midnight ZK Prover (Docker Proof Server) |
| **Frontend** | Next.js 16, React, TypeScript |
| **Wallet** | Lace Browser Extension (Midnight Preprod) |
| **SDK** | `@midnight-ntwrk/compact-js`, `midnight-js-contracts`, `midnight-js-types`, `ledger-v8` |
| **Styling** | Vanilla CSS (Glassmorphism, dark theme) |

## Directory Structure

```
cardano-anonpass/
├── contracts/
│   └── age_verifier.compact          # Compact smart contract (ZK circuit)
├── frontend/
│   ├── public/zk/                    # Compiled ZK assets (keys, WASM)
│   ├── src/
│   │   ├── app/                      # Next.js app router pages
│   │   ├── components/
│   │   │   ├── AgeVerifier.tsx       # Deploy & Verify UI component
│   │   │   └── WalletConnect.tsx     # Lace wallet connection
│   │   ├── contexts/
│   │   │   └── WalletContext.tsx      # Session & wallet state management
│   │   └── lib/
│   │       ├── midnight.ts           # Provider setup (Proof, Wallet, Indexer)
│   │       ├── zkp.ts               # Deploy & proof generation logic
│   │       └── managed/contract/     # Compiled contract artifacts
│   └── package.json
├── scripts/
│   └── deploy.ts                     # CLI deployment script
└── README.md
```

## Prerequisites

- **Node.js** v18+
- **Docker Desktop** (for the local ZK Proof Server)
- **Lace Wallet** browser extension configured for **Midnight Preprod**
- **tNIGHT tokens** from the [Midnight Preprod Faucet](https://midnight-tnight-preprod.nethermind.dev)
- **tDUST** generated from tNIGHT in Lace (for transaction fees)

## Setup Instructions

### 1. Clone & Install

```bash
git clone https://github.com/AnonPass/cardano-anonpass.git
cd cardano-anonpass/frontend
npm install
```

### 2. Start the Local Proof Server

The ZK Proof Server runs inside Docker and handles proof generation locally (avoids CORS issues with the remote server):

```bash
docker run -d -p 6300:6300 --name midnight-proof-server \
  midnightntwrk/proof-server:8.0.3 midnight-proof-server -v
```

### 3. Start the Frontend

```bash
cd frontend
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Connect Wallet & Get Tokens

1. Open Lace wallet → ensure it's on **Midnight Preprod** network.
2. Get tNIGHT from the [faucet](https://midnight-tnight-preprod.nethermind.dev) using your **Unshielded** address.
3. In Lace, generate **DUST** from your tNIGHT (click the DUST icon next to Send/Receive).
4. Connect your wallet on the site.

### 5. Deploy & Verify

1. Click **"Deploy ZK Contract"** — Lace will ask you to sign the deployment transaction.
2. Wait for the indexer to sync (~15-30 seconds).
3. Enter a birth year and click **"Verify Age"** — the proof is generated locally and verified on-chain.

## Smart Contract

The Compact contract (`contracts/age_verifier.compact`) is minimal and privacy-preserving:

```compact
pragma language_version >= 0.22;

export ledger verificationsCount: Uint<64>;

witness birthYear(): Uint<32>;

constructor() {
  verificationsCount = 0;
}

export circuit proveAge(currentYear: Uint<32>): [] {
  const by = birthYear();
  assert(currentYear >= by, "Current year must be >= birth year");
  assert(currentYear - by >= 18, "Must be at least 18 years old");
  verificationsCount = disclose((verificationsCount + 1) as Uint<64>);
}
```

**Key privacy properties:**
- `birthYear()` is a **witness** — it's provided privately by the user and never appears on-chain.
- Only `verificationsCount` is publicly disclosed via `disclose()`.
- The ZK circuit proves the age assertion without revealing the birth year.

## Architecture Notes

- **Low-level SDK pattern:** Uses `createUnprovenDeployTx` + manual `proveTx` → `balanceTx` → `submitTx` instead of the high-level `deployContract()` which hangs on Preprod.
- **Local Proof Server:** Runs `midnightntwrk/proof-server:8.0.3` via Docker to avoid CORS issues with the remote proof server.
- **Indexer polling:** After deploy, the app polls the indexer until the contract state is available before allowing proof submission.

## Troubleshooting

| Problem | Cause | Solution |
|---------|-------|----------|
| `tDUST Tank Empty` | No DUST for transaction fees | Get tNIGHT from faucet, then generate DUST in Lace |
| `Insufficient Funds: could not balance dust` | DUST balance too low | Generate more DUST in Lace wallet |
| `CORS error on /prove` | Using remote proof server | Start local Docker proof server on port 6300 |
| `No public state found` | Indexer hasn't synced yet | Wait 15-30 seconds after deploy |
| `Error executing circuit 'proveAge'` | User is under 18 | Enter a birth year that makes you 18+ |

## License

MIT