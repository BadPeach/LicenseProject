#include "XnorGate.h"
void XnorGate::compute()
{
	output = (inputs[0] == inputs[1]);
}