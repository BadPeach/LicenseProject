#include "NandGate.h"
void NandGate::compute()
{
	output = !(inputs[0] && inputs[1]);
}