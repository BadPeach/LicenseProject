#include "XorGate.h"
void XorGate::compute()
{
	output = inputs[0] != inputs[1];
}