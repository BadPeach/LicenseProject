module my_circuit(a, b, c, y);
    input a;
    input b;
    input c;
    output y;

    wire not_a;
    wire and_1;
    wire and_2;
    wire or_3;
    wire and_4;

    assign not_a = ~a;
    assign and_1 = not_a & b;
    assign and_2 = b & c;
    assign or_3  = b | c;
    assign and_4 = and_2 & or_3;
    assign y = and_1 | and_4;
endmodule
