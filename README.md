# Midnight AnonPass

## Project Links & Demo (Submission Checklist)
- **Live Demo Link:** [https://midnight-anonpass-demo.vercel.app](https://midnight-anonpass-demo.vercel.app) *(Placeholder)*
- **Demo Video:** [Watch Demo Video](./demovideo.mp4)
- **Preprod Contract Address:** `addr_test1wp8l7eylksmjas7ypzm0q35dwnjdxxvsfn0z0lflqzgs55stpd682` *(Deployed via `scripts/deploy.ts`)*
- **Privacy Claim:** Documented below (Users verify age without revealing birth year).

## Project Overview
Midnight AnonPass is a decentralized application (dApp) built on the Midnight blockchain. It leverages Zero-Knowledge Proofs (ZKPs) to enable users to verify their identity, credentials, or specific attributes without revealing the underlying sensitive data. This ensures maximum privacy while maintaining trust and compliance.

## Privacy Claim
By utilizing advanced Zero-Knowledge (ZK) circuits, Midnight AnonPass guarantees that no sensitive user data is exposed on-chain or off-chain during the verification process. Specifically, the application proves that a user is over 18 years old using a Circom circuit without ever revealing the exact birth year in the generated proof. The proofs generated allow smart contracts to validate specific claims deterministically, ensuring that privacy is maintained as a fundamental right.

## Tech Stack
- **Frontend**: React (Next.js), Tailwind CSS
- **Zero-Knowledge Circuits**: Circom / SnarkJS (and MeshJS)
- **Smart Contracts**: Compact (for Midnight)
- **Off-Chain / Wallet Integration**: Mesh SDK

## Directory Structure
- `/frontend`: Next.js application containing the UI and off-chain interaction logic.
- `/circuits`: Zero-Knowledge circuits (e.g., written in Circom) and trusted setup files.
- `/contracts`: On-chain smart contracts.
- `/scripts`: Deployment, compilation, and general utility scripts.

## Deployment Info

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- Midnight Wallet (e.g., Lace, Nightly)
- [Circom](https://docs.circom.io/) installed globally for circuit compilation

### Setup Instructions
*(These instructions will be expanded as the project matures)*

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd midnight-anonpass
   ```

2. **Frontend Setup:**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

3. **Circuit Compilation:**
   Navigate to the `/circuits` directory and follow the instructions (to be added) to compile the circuits and generate the proving and verifying keys.

4. **Smart Contract Deployment:**
   Navigate to `/contracts` and run the necessary build scripts to compile the contracts for the Midnight blockchain.