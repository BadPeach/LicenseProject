#include "AndGate.h"

void AndGate::compute() 
{
	output = inputs[0] && inputs[1];
}
