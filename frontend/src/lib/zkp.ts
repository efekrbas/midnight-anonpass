import { CompiledContract } from '@midnight-ntwrk/compact-js';
import { deployContract, submitCallTx } from '@midnight-ntwrk/midnight-js-contracts';
import { Contract } from './managed/contract';
import type { ConnectedSession } from './midnight';

export async function deployAgeVerifier(session: ConnectedSession, birthYear: number) {
  try {
    const compiledContract = (CompiledContract as any).make('AgeVerifier', Contract).pipe(
      (CompiledContract as any).withWitnesses({
        birthYear: () => BigInt(birthYear)
      }),
      (CompiledContract as any).withCompiledFileAssets('/zk/proveAge')
    );
    
    console.log("Deploying AgeVerifier Contract to Midnight Preprod...");
    const result = await deployContract(session.providers as any, {
      privateStateId: 'AgeVerifierPrivateState',
      initialPrivateState: {},
      compiledContract,
    } as any);
    
    console.log("Contract deployed successfully!");
    return result.deployTxData.public.contractAddress;
  } catch (err) {
    console.error("Failed to deploy contract:", err);
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
    const compiledContract = (CompiledContract as any).make('AgeVerifier', Contract).pipe(
      (CompiledContract as any).withWitnesses({
        birthYear: () => BigInt(birthYear)
      }),
      (CompiledContract as any).withCompiledFileAssets('/zk/proveAge')
    );

    console.log("Submitting ZK Proof to Midnight Network...");
    
    const result = await submitCallTx(session.providers as any, {
      compiledContract,
      contractAddress,
      circuitId: 'proveAge',
      args: [BigInt(currentYear)],
    });
    console.log("Proof submitted and transaction landed on-chain!");
    return { 
      txHash: result.public.txHash,
      blockHeight: result.public.blockHeight 
    };
  } catch (error) {
    console.error("Error generating ZK proof:", error);
    throw error;
  }
}
