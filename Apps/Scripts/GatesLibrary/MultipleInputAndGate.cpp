#include "MultipleInputAndGate.h"
void MultipleInputAndGate::compute()
{
	output = true;
	for (bool input : inputs) {
		if (!input) {
			output = false;
			break;
		}
	}
}