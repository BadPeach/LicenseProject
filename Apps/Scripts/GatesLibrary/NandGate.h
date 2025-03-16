#pragma once
#include "Gate.h"
class NandGate : public Gate
{
public:
	NandGate(double delayTime) : Gate(2, delayTime) {}

	void compute() override;
};

