#pragma once
#include "Gate.h"
class XnorGate : public Gate
{
public:
	XnorGate(double delayTime) : Gate(2, delayTime) {}

	void compute() override;
};

