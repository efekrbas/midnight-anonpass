import { CompiledContract } from '@midnight-ntwrk/compact-js';
import { createUnprovenDeployTx, submitTxAsync, submitCallTxAsync } from '@midnight-ntwrk/midnight-js-contracts';
import { Contract } from './managed/contract';
import type { ConnectedSession } from './midnight';

export async function deployAgeVerifier(session: ConnectedSession, birthYear: number) {
  try {
    const assetUrl = typeof window !== 'undefined' ? `${window.location.origin}/zk` : '/zk';
    const compiledContract = (CompiledContract as any).make('AgeVerifier', Contract).pipe(
      (CompiledContract as any).withWitnesses({
        birthYear: () => BigInt(birthYear)
      }),
      (CompiledContract as any).withCompiledFileAssets(assetUrl)
    );
    
    console.log("Deploying AgeVerifier Contract to Midnight Preprod...");
    const { sampleSigningKey } = await import('@midnight-ntwrk/ledger-v8');
    const deployTxData = await (createUnprovenDeployTx as any)(
      { zkConfigProvider: session.providers.zkConfigProvider, walletProvider: session.providers.walletProvider },
      { 
        compiledContract, 
        args: [], 
        signingKey: sampleSigningKey() 
      }
    );

    const contractAddress = deployTxData.public.contractAddress;
    await (submitTxAsync as any)(session.providers, { unprovenTx: deployTxData.private.unprovenTx });
    
    // Set private state manually since we used low-level deploy
    await session.providers.privateStateProvider.setContractAddress(contractAddress);
    await session.providers.privateStateProvider.setSigningKey(contractAddress, deployTxData.private.signingKey);

    console.log("Contract deployed successfully!");
    return contractAddress;
  } catch (err: any) {
    console.error("Failed to deploy contract:", err);
    if (typeof err === 'object' && err !== null && Object.keys(err).length === 0) {
      console.error("Error is an empty object, possibly a WASM Exception.");
    }
    throw err;
  }
}

export async function generateAgeProof(
  session: ConnectedSession, 
  contractAddress: string, 
  birthYear: number, 
  currentYear: number
) {
  try {
    const assetUrl = typeof window !== 'undefined' ? `${window.location.origin}/zk` : '/zk';
    const compiledContract = (CompiledContract as any).make('AgeVerifier', Contract).pipe(
      (CompiledContract as any).withWitnesses({
        birthYear: () => BigInt(birthYear)
      }),
      (CompiledContract as any).withCompiledFileAssets(assetUrl)
    );

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
