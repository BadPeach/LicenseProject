#pragma once
#include "Gate.h"
class NorGate : public Gate
{
public:
	NorGate(double delayTime) : Gate(2, delayTime) {}

	void compute() override;
};

