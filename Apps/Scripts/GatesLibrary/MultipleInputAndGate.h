#pragma once
#include "Gate.h"
class MultipleInputAndGate : public Gate
{
public:
	MultipleInputAndGate(int numInputs, double delayTime) : Gate(numInputs, delayTime) {}

	void compute() override;
}; 

