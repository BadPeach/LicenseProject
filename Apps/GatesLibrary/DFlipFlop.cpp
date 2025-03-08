#include "DFlipFlop.h"
void DFlipFlop::compute()
{
	if (clock) {
		state = inputs[0];
	}
	output = state;
}

void DFlipFlop::setClock(bool newClock) {
	clock = newClock;
}
