#pragma once
#include "Gate.h"
class BufferGate : public Gate
{
public:
	BufferGate(double delayTime) : Gate(1, delayTime) {}

	void compute() override;
};

