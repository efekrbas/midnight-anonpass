pragma circom 2.0.0;

include "node_modules/circomlib/circuits/comparators.circom";

template AgeCheck() {
    // Inputs
    signal input birthYear;
    signal input currentYear;
    
    // Output
    signal output isAdult;

    // Use a 16-bit comparator since years like 2026 fit within 16 bits (max 65535)
    component geq = GreaterEqThan(16);
    
    // We want to prove that: currentYear - birthYear >= 18
    geq.in[0] <== currentYear - birthYear;
    geq.in[1] <== 18;

    isAdult <== geq.out;

    // Constrain the circuit to only succeed if the person is an adult
    // This makes it impossible to generate a valid proof if the age is < 18
    isAdult === 1;
}

// The main component sets currentYear as a public input.
// By default, inputs are private, meaning birthYear will NOT be revealed in the proof.
component main {public [currentYear]} = AgeCheck();
