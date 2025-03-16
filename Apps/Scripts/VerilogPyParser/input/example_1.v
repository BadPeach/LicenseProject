module simple_logic (A, B, C, Y);
    input A;
    input B;
    input C;
    output Y;

    wire w1, w2, w3, w1_inv;

    // Poarta AND între A și B
    assign w1 = A & B;

    // Poarta OR între B și C
    assign w2 = B | C;

    // Poarta XOR între A și C
    assign w3 = A ^ C;

    // Poarta NOT aplicată pe w1
    assign w1_inv = ~w1;

    // Poarta AND finală pentru ieșire
    assign Y = w1_inv & w2 & w3;
endmodule
