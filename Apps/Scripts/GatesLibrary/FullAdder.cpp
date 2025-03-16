#include "FullAdder.h"
void FullAdder::compute()
{
	bool A = inputs[0];
	bool B = inputs[1];
	bool Cin = inputs[2];
	sum = A ^ B ^ Cin;
	carry = (A && B) || (Cin && (A ^ B));
}

bool FullAdder::getSum() const
{
	return sum;
}

bool FullAdder::getCarry() const
{
	return carry;
}