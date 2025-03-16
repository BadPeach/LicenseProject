#pragma once
#include "Gate.h"
class OrGate : public Gate
{
public:
	OrGate(double delayTime) : Gate(2, delayTime) {}

	void compute() override;
};

