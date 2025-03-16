#include "AndGate.h"
#include "OrGate.h"
#include "NotGate.h"
#include "XorGate.h"
#include "NandGate.h"
#include "NorGate.h"
#include "XnorGate.h"
#include "BufferGate.h"
#include "MultipleInputAndGate.h"
#include "MultipleInputOrGate.h"
#include "DFlipFlop.h"
#include "Multiplexer.h"
#include "HalfAdder.h"
#include "FullAdder.h"
#include <iostream>
using namespace std;

int test()
{
	AndGate andGate(1.0);
	andGate.setInputs({ true, false });
	andGate.compute();
	cout << "AND Gate output : " << andGate.getOutput() << endl;

	OrGate orGate(0.75);
	orGate.setInputs({ true, true });
	orGate.compute();
	cout << "OR Gate output : " << orGate.getOutput() << endl;

	NotGate notGate(0.2);
	notGate.setInputs({ true });
	notGate.compute();
	cout << "NOT Gate output : " << notGate.getOutput() << endl;

	XorGate xorGate(0.2);
	xorGate.setInputs({ true, true });
	xorGate.compute();
	cout << "XOR Gate output : " << xorGate.getOutput() << endl;

	NandGate nandGate(0.2);
	nandGate.setInputs({ true, true });
	nandGate.compute();
	cout << "NAND Gate output : " << nandGate.getOutput() << endl;

	NorGate norGate(0.2);
	norGate.setInputs({ false, false });
	norGate.compute();
	cout << "NOR Gate output : " << norGate.getOutput() << endl;

	XnorGate xnorGate(0.5);
	xnorGate.setInputs({ false, false });
	xnorGate.compute();
	cout << "XNOR Gate output : " << xnorGate.getOutput() << endl;

	BufferGate bufferGate(0.5);
	bufferGate.setInputs({ false });
	bufferGate.compute();
	cout << "BUFFER Gate output : " << bufferGate.getOutput() << endl;

	MultipleInputAndGate multipleInputAndGate(3, 0.5);
	multipleInputAndGate.setInputs({ false, true, true });
	multipleInputAndGate.compute();
	cout << "Multiple input AND Gate output : " << multipleInputAndGate.getOutput() << endl;

	MultipleInputOrGate multipleInputOrGate(3, 0.5);
	multipleInputOrGate.setInputs({ false, true, true });
	multipleInputOrGate.compute();
	cout << "Multiple input OR Gate output : " << multipleInputOrGate.getOutput() << endl;

	DFlipFlop dFF(0.4);
	dFF.setClock(false);
	dFF.setInputs({ false, true });
	dFF.compute();
	cout << "D Flip-Flop output : " << dFF.getOutput() << endl;
	cout << endl;


	//Multiplexer 
	cout << "Multiplexer :" << "\n";
	Multiplexer mux(4, 1.0);
	bool input0 = false;
	bool input1 = true;
	bool input2 = false;
	bool input3 = true;

	std::vector<std::pair<int, std::vector<bool>>> testCasesM = {
		{0, {false, false}},
		{1, {false, true}},
		{2, {true, false}},
		{3, {true, true}}
	};

	for (const auto& testCase : testCasesM) {
		int expectedControl = testCase.first;
		const vector<bool>& controlSignals = testCase.second;

		vector<bool> allInputs = { input0, input1, input2, input3 };
		allInputs.insert(allInputs.end(), controlSignals.begin(), controlSignals.end());
		mux.setInputs(allInputs);

		mux.compute();

		cout << "Testing control = " << expectedControl << "(";
		for (bool signal : controlSignals) {
			cout << signal;
		}

		cout << "):\n";
		cout << "Input0: " << input0 << ", Input1: " << input1
			<< ", Input2: " << input2 << ", Input3: " << input3 << "\n";
		cout << "Output: " << mux.getOutput() << "\n\n";
	}

	//Halfadder
	HalfAdder halfAdder(0.4);
	halfAdder.setInputs({ true, false });
	halfAdder.compute();
	cout << "HalfAdder output sum & carry : " << halfAdder.getSum() << " & " << halfAdder.getCarry() << endl;


	//FullAdder
	FullAdder fullAdder(0.8);
	fullAdder.setInputs({ true, true, true });
	fullAdder.compute();
	cout << "Fulladder output sum & carry : " << fullAdder.getSum() << " & " << fullAdder.getCarry() << endl;
	return 0;
}

int main()
{
	
}
