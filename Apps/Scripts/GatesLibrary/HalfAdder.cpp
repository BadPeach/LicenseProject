#include "HalfAdder.h"
void HalfAdder::compute()
{
	bool A = inputs[0];
	bool B = inputs[1];
	sum = A ^ B;
	carry = A && B;
}

bool HalfAdder::getSum() const
{
	return sum;
}

bool HalfAdder::getCarry() const
{
	return carry;
}