#include "Gate.h"
void Gate::setInputs(const vector<bool>& newInputs)
{
	if (newInputs.size() == inputs.size()) {
		inputs = newInputs;
	}
	else {
		cerr << "Error : Number of inputs does not match gate requierements. \n";
	}
}

bool Gate::getOutput() const
{
	return output;
}

double Gate::getDelay() const
{
	return delay;
}