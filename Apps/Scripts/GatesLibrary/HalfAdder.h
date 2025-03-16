#pragma once
#include "Gate.h"
class HalfAdder : public Gate
{
public:
	HalfAdder(double delayTime) : Gate(2,delayTime) {}

	void compute() override;
	bool getSum() const;
	bool getCarry() const;

private:
	bool sum;
	bool carry;
};

