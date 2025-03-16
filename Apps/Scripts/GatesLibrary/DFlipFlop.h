#pragma once
#include "Gate.h"
class DFlipFlop : public Gate
{
private:
	bool state;
	bool clock;
public:
	DFlipFlop(double delayTime) : Gate(2, delayTime), state(false), clock(false) {}

	void setClock(bool newClock);
	void compute() override;

};

