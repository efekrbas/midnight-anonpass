import { CompiledContract } from '@midnight-ntwrk/compact-js';
import { createUnprovenDeployTx, submitTxAsync, submitCallTxAsync } from '@midnight-ntwrk/midnight-js-contracts';
import { Contract } from './managed/contract';
import type { ConnectedSession } from './midnight';

let baseCompiledContract: any = null;
function getBaseCompiledContract() {
  if (!baseCompiledContract) {
    const assetUrl = typeof window !== 'undefined' ? `${window.location.origin}/zk` : '/zk';
    baseCompiledContract = (CompiledContract as any).make('AgeVerifier', Contract).pipe(
      (CompiledContract as any).withCompiledFileAssets(assetUrl)
    );
  }
  return baseCompiledContract;
}

export async function deployAgeVerifier(session: ConnectedSession, birthYear: number) {
  let compiledContract;
  
  try {
    const withWitnessesFn = (CompiledContract as any).withWitnesses({
      birthYear: (context: any) => [context.privateState, BigInt(birthYear)]
    });
    compiledContract = withWitnessesFn(getBaseCompiledContract());
  } catch (err) {
    throw new Error(`Step 1 (Compile) failed: ${String(err)}`);
  }
  
  let sampleSigningKey;
  try {
    const ledger = await import('@midnight-ntwrk/ledger-v8');
    sampleSigningKey = ledger.sampleSigningKey;
  } catch (err) {
    throw new Error(`Step 2 (Ledger Import) failed: ${String(err)}`);
  }

  let deployTxData;
  try {
    deployTxData = await (createUnprovenDeployTx as any)(
      session.providers,
      { 
        compiledContract, 
        args: [], 
        signingKey: sampleSigningKey() 
      }
    );
  } catch (err: any) {
    console.error("createUnprovenDeployTx error:", err);
    throw new Error(`Step 3 (createUnprovenDeployTx) failed: ${err?.message || err?.name || String(err)} - Check ZK Asset URLs or Lace permissions`);
  }

  const contractAddress = deployTxData.public.contractAddress;

  let provenTx;
  try {
    console.log("Step 4.1: Proving Tx via Wallet ZK Prover...");
    provenTx = await session.providers.proofProvider.proveTx(deployTxData.private.unprovenTx, undefined);
  } catch (err: any) {
    console.error("proveTx error:", err);
    throw new Error(`Step 4.1 (Prove Tx) failed: ${err?.message || err?.name || String(err)} - Lace ZK Prover crashed. Try refreshing or check ZK assets.`);
  }

  let balancedTx;
  try {
    console.log("Step 4.2: Balancing Tx (Wallet Popup expected)...");
    balancedTx = await session.providers.walletProvider.balanceTx(provenTx);
  } catch (err: any) {
    console.error("balanceTx error:", err);
    if (err.cause?.failure) {
      console.error("FIBER FAILURE DETAILS:", JSON.stringify(err.cause.failure, null, 2));
    } else {
      console.error("ERROR CAUSE:", err.cause);
    }
    throw new Error(`Step 4.2 (Balance Tx) failed: ${err?.message || err?.name || String(err)} - Check console for FIBER FAILURE DETAILS.`);
  }

  try {
    console.log("Step 4.3: Submitting Tx to Network...");
    await session.providers.midnightProvider.submitTx(balancedTx);
  } catch (err: any) {
    console.error("submitTx error:", err);
    throw new Error(`Step 4.3 (Submit Tx) failed: ${err?.message || err?.name || String(err)} - Blockchain rejected transaction.`);
  }

  try {
    await session.providers.privateStateProvider.setContractAddress(contractAddress);
    await session.providers.privateStateProvider.setSigningKey(contractAddress, deployTxData.private.signingKey);
    await session.providers.privateStateProvider.set('AgeVerifierPrivateState', {});
  } catch (err: any) {
    throw new Error(`Step 5 (Private State) failed: ${err?.message || err?.name || String(err)}`);
  }

  try {
    console.log("Step 6: Waiting for indexer to sync new contract...");
    const { waitForContractDeployment } = await import('./midnight');
    await waitForContractDeployment(session.providers.publicDataProvider, contractAddress);
    console.log("Indexer synced! Contract is ready.");
  } catch (err: any) {
    console.error("Indexer wait error:", err);
    throw new Error(`Step 6 (Indexer Sync) failed: ${err?.message || err?.name || String(err)}`);
  }

  return contractAddress;
}

export async function generateAgeProof(
  session: ConnectedSession, 
  contractAddress: string, 
  birthYear: number, 
  currentYear: number
) {
  try {
    const withWitnessesFn = (CompiledContract as any).withWitnesses({
      birthYear: (context: any) => [context.privateState, BigInt(birthYear)]
    });
    const compiledContract = withWitnessesFn(getBaseCompiledContract());

    console.log("Submitting ZK Proof to Midnight Network...");
    
    const result = await (submitCallTxAsync as any)(session.providers, {
      compiledContract,
      contractAddress,
      circuitId: 'proveAge',
      args: [BigInt(currentYear)],
    });
    
    console.log("Proof submitted and transaction landed on-chain!");
    return { 
      txHash: result.txId || 'unknown',
      blockHeight: 0 
    };
  } catch (error) {
    console.error("Error generating ZK proof:", error);
    throw error;
  }
}
