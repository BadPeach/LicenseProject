#pragma once
#include "Gate.h"
class AndGate : public Gate
{
public:
    AndGate(double delayTime) : Gate(2, delayTime) {}

    void compute() override;
};

