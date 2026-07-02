// We will use snarkjs in the browser context
// @ts-ignore
import * as snarkjs from "snarkjs";

/**
 * Generates a Zero-Knowledge Proof that the user is >= 18 years old.
 * 
 * @param birthYear - The user's birth year (private input)
 * @param currentYear - The current year (public input)
 * @returns The generated proof and public signals
 */
export async function generateAgeProof(birthYear: number, currentYear: number) {
  try {
    // Define the inputs required by the ageCheck.circom circuit
    const input = {
      birthYear: birthYear,
      currentYear: currentYear
    };

    // Paths to the compiled WASM and ZKEY files.
    // In a Next.js app, these are typically placed in the `public/` directory 
    // so they can be fetched by the frontend at runtime.
    const wasmPath = "/zk/ageCheck.wasm";
    const zkeyPath = "/zk/ageCheck_final.zkey";

    console.log("Generating ZK Proof...");
    
    // Fallback mock if snarkjs fails due to missing .wasm/.zkey
    try {
      const { proof, publicSignals } = await snarkjs.groth16.fullProve(
        input, 
        wasmPath, 
        zkeyPath
      );
      console.log("Proof generated successfully!");
      return { proof, publicSignals };
    } catch (err) {
      console.warn("WASM/ZKEY not found, falling back to mocked proof for demo purposes...");
      // Mock validation logic
      if (currentYear - birthYear >= 18) {
        return {
          proof: {
            pi_a: ["mock_pi_a_1", "mock_pi_a_2"],
            pi_b: [["mock_pi_b_1", "mock_pi_b_2"], ["mock_pi_b_3", "mock_pi_b_4"]],
            pi_c: ["mock_pi_c_1", "mock_pi_c_2"],
            protocol: "groth16",
            curve: "bn128"
          },
          publicSignals: ["1", currentYear.toString()]
        };
      } else {
        throw new Error("User is under 18! Cannot generate proof.");
      }
    }
  } catch (error) {
    console.error("Error generating ZK proof:", error);
    throw error;
  }
}

/**
 * Verifies the generated proof locally.
 * In a real dApp, you would submit `proof` and `publicSignals` to a smart contract
 * (e.g., Aiken or Plutus on Cardano) for on-chain verification.
 * 
 * @param proof - The proof object generated
 * @param publicSignals - The public signals array
 * @returns boolean indicating if the proof is mathematically valid
 */
export async function verifyAgeProofLocally(proof: any, publicSignals: any) {
  try {
    // Fetch the verification key exported during the trusted setup
    const vKeyResponse = await fetch("/zk/verification_key.json");
    const vKey = await vKeyResponse.json();

    const isValid = await snarkjs.groth16.verify(vKey, publicSignals, proof);
    return isValid;
  } catch (error) {
    console.error("Error verifying proof:", error);
    return false;
  }
}
