#pragma once
#include "Gate.h"
class Multiplexer : public Gate
{
public:
	Multiplexer(int numInputs, double delayTime) : Gate(numInputs + log2(numInputs), delayTime) {} 

	void compute() override;
};

