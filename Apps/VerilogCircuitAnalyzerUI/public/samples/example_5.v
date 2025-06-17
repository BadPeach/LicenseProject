module ASTCircuit (
    A1,
    A2,
    A3,
    A4,
    A5,
    A6,
    A7,
    A8,
    Y
);
    // Inputs
    input A1;
    input A2;
    input A3;
    input A4;
    input A5;
    input A6;
    input A7;
    input A8;
    
    // Output
    output Y;

    // Single AND of all inputs
    assign Y = A1 & A2 & A3 & A4 & A5 & A6 & A7 & A8;
    
endmodule
