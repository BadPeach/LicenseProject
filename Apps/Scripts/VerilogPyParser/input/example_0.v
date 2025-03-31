module ASTCircuit (a, b, Y);
    input a;
    input b;
    output Y;

    // Intermediate wires for gate outputs
    wire or_out;
    wire not_a;

    // OR gate: a OR b
    assign or_out = a | b;

    // NOT gate: NOT a
    assign not_a = ~a;

    // AND gate: (a OR b) AND (NOT a)
    assign Y = or_out & not_a;
endmodule
