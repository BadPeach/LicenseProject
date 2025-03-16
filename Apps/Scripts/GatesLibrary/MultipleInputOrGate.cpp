#include "MultipleInputOrGate.h"
void MultipleInputOrGate::compute()
{
	output = false;
	for (bool input : inputs) {
		if (input) {
			output = true;
			break;
		}
	}
}