#include "OrGate.h"
void OrGate::compute()
{
	output = inputs[0] || inputs[1];
}