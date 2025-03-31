module multi_gate_logic (
    A1, A2, A3, A4, A5, A6, A7, A8,
    O1, O2, O3, O4, O5, O6, O7, O8, O9, O10, O11, O12, O13, O14, O15,
    N,
    Y
);
    input A1;
    input A2;
    input A3;
    input A4;
    input A5;
    input A6;
    input A7;
    input A8;

    input O1;
    input O2;
    input O3;
    input O4;
    input O5;
    input O6;
    input O7;
    input O8;
    input O9;
    input O10;
    input O11;
    input O12;
    input O13;
    input O14;
    input O15;

    input N;
    output Y;

    // Intermediate wires for each gate output
    wire and_out;
    wire or_out;
    wire not_out;

    // 8-input AND gate: high only if all A1-A8 are high
    assign and_out = A1 & A2 & A3 & A4 & A5 & A6 & A7 & A8;

    // 15-input OR gate: high if at least one of O1-O15 is high
    assign or_out = O1 | O2 | O3 | O4 | O5 | O6 | O7 | O8 | O9 | O10 | O11 | O12 | O13 | O14 | O15;

    // NOT gate: inverts the input N
    assign not_out = ~N;

    // Final output: combines the outputs of the AND, OR, and NOT gates
    assign Y = and_out & or_out & not_out;

endmodule
