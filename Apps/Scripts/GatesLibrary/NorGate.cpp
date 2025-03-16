#include "NorGate.h"
void NorGate::compute()
{
	output = !(inputs[0] || inputs[1]);
}