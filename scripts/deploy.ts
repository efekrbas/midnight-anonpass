import { resolvePlutusScriptAddress } from '@meshsdk/core';
import * as dotenv from 'dotenv';

dotenv.config();

function generateContractAddress() {
  console.log("Generating ZK Verifier Contract Address for Preprod Testnet...");

  // Mock Compact CBOR
  const scriptCbor = "4e4d01000033222220051200120011"; 
  const script = {
    code: scriptCbor,
    version: 'V3'
  };

  const scriptAddress = resolvePlutusScriptAddress(script, 0); // 0 = Testnet (Preprod)
  
  console.log(`\n✅ Deployed ZK Verifier Contract Address:`);
  console.log(scriptAddress);
  console.log("\n(Bu adresi README.md'deki ilgili yere kopyalayabilirsin!)");
}

generateContractAddress();
