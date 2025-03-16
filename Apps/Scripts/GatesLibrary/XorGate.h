#pragma once
#include "Gate.h"
class XorGate :   public Gate
{
public:
	XorGate(double delayTime) : Gate(2, delayTime) {}

	void compute() override;
};

