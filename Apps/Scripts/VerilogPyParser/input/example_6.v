module ASTCircuit (
    a1,
    a2,
    a3,
    o1,
    o2,
    o3,
    a4,
    Y
);
    // Inputs
    input a1;
    input a2;
    input a3;
    input o1;
    input o2;
    input o3;
    input a4;
    
    // Output
    output Y;
    
    // Intermediate wires
    wire or_o1_o2;
    wire and_part;
    wire not_a4;
    wire and_o3_not_a4;
    wire xor_o1_o2;
    wire or_inner;
    wire not_or_inner;
    
    // o1 OR o2
    assign or_o1_o2      = o1 | o2;
    // a1 AND a2 AND a3 AND (o1 OR o2)
    assign and_part      = a1 & a2 & a3 & or_o1_o2;
    
    // NOT a4
    assign not_a4        = ~a4;
    // o3 AND (NOT a4)
    assign and_o3_not_a4 = o3 & not_a4;
    // o1 XOR o2
    assign xor_o1_o2     = o1 ^ o2;
    
    // Combine inner OR: o1 OR o2 OR (o3 & ~a4) OR (o1 ^ o2)
    assign or_inner      = o1 | o2 | and_o3_not_a4 | xor_o1_o2;
    // NOT of the combined OR
    assign not_or_inner  = ~or_inner;
    
    // Final XOR: (a1&a2&a3&(o1|o2)) XOR not(...)
    assign Y             = and_part ^ not_or_inner;
    
endmodule
