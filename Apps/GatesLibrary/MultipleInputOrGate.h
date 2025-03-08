#pragma once
#include "Gate.h"
class MultipleInputOrGate : public Gate
{
public:
	MultipleInputOrGate(int numInputs, double delayTime) : Gate(numInputs, delayTime)  {}

	void compute() override;
};

