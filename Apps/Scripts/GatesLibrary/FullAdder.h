#pragma once
#include "Gate.h"
class FullAdder : public Gate
{
public:
	FullAdder(double delayTime) : Gate(3, delayTime) {}

	void compute() override;
	bool getSum() const;
	bool getCarry() const;

private:
	bool sum;
	bool carry;
};

