#pragma once
#include "Gate.h"
class NotGate : public Gate
{
public:
	NotGate(double delayTime) : Gate(1, delayTime) {} 

	void compute() override;
};

