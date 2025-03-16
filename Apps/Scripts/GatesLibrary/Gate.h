#pragma once
#include <iostream>
#include <vector>

using namespace std;

class Gate
{
protected:
	std::vector<bool> inputs;
	bool output;
	double delay;

public:
	Gate(int numInputs, double delayTime) : inputs(numInputs, false), 
		                                    output(false), 
		                                    delay(delayTime) {}
	
	void setInputs(const vector<bool>& newInputs);
	bool getOutput() const;
	virtual void compute() = 0;
	double getDelay() const;

};

//d la bistbile
//10-12 porti logice, cele simple, sa fac cu 3-4 intrari (implementat deja pentru portile AND & OR 
//de implementat demultiplexor, encoder, decoder, altceva?
