#include "Multiplexer.h"
void Multiplexer::compute()
{
	int numControlBits = log2(inputs.size() - 1);
	int control = 0;
	for (int i = 0; i < numControlBits; ++i) {
		control |= (inputs[inputs.size() - numControlBits + i] ? 1 : 0) << i;
	}

	output = inputs[control];
}