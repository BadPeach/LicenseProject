module all_gates_logic (A, B, C, Y);
    input A;
    input B;
    input C;
    output Y;

    // Intermediate wires for each logical gate output
    wire and_out, or_out, xor_out, nor_out, nand_out, not_out;

    // AND gate: result of A AND B
    assign and_out = A & B;

    // OR gate: result of B OR C
    assign or_out = B | C;

    // XOR gate: result of A XOR C
    assign xor_out = A ^ C;

    // NOR gate: result of A NOR B
    assign nor_out = ~(A | B);

    // NAND gate: result of A NAND C
    assign nand_out = ~(A & C);

    // NOT gate: result of NOT B (inverting B)
    assign not_out = ~B;

    // Final output: combining all gate outputs with an AND gate for illustration.
    assign Y = and_out & or_out & xor_out & nor_out & nand_out & not_out;
endmodule
