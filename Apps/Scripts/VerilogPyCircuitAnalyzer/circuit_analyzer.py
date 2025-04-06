import json
import sys
from copy import deepcopy


class ASTNode:
    def __init__(self, name):
        self.name = name

    def get_delay(self):
        """Returnează delay-ul total al nodului (delay-ul propriu + maximul din subnoduri)."""
        raise NotImplementedError

    def set_input_values(self, values: dict):
        """Inițializează valorile de intrare ale nodurilor terminale."""
        raise NotImplementedError

    def set_delay_values(self, values: dict):
        """Inițializează valorile de delay ale nodurilor """
        raise NotImplementedError

    def evaluate(self):
        """Evaluează circuitul și returnează rezultatul (True/False)."""
        raise NotImplementedError

    def aggregate(self):
        raise NotImplementedError

    def to_dict(self):
        raise NotImplementedError

class InputNode(ASTNode):
    def __init__(self, name):
        super().__init__(name)
        self.value = None

    def get_delay(self):
        return 0.0

    def set_input_values(self, values: dict):
        if self.name in values:
            self.value = values[self.name]
        else:
            raise ValueError(f"Nu s-a furnizat valoare pentru intrarea {self.name}")

    def set_delay_values(self, values: dict):
        return

    def aggregate(self):
        return

    def evaluate(self):
        if self.value is None:
            raise ValueError(f"Valoarea pentru {self.name} nu a fost inițializată.")
        return self.value

    def __repr__(self):
        return f"InputNode({self.name}={self.value})"

    def to_dict(self):
        return self.name

# Nod de bază pentru o poartă (gate)
class GateNode(ASTNode):
    def __init__(self, name):
        super().__init__(name)
        self.children = []
        self.delay_t0 = None
        self.delay_deltaT = None

    def aggregate(self):
        for child in self.children:
            child.aggregate()

        grandchildren_to_inherit = [
            grandchild
            for child in self.children if child.name == self.name
            for grandchild in child.children
        ]
        self.children = [child for child in self.children if child.name != self.name]
        self.children.extend(grandchildren_to_inherit)


    def add_child(self, child: ASTNode):
        self.children.append(child)

    def set_input_values(self, values: dict):
        for child in self.children:
            child.set_input_values(values)

    def set_delay_values(self, values: dict):
        if self.name in values:
            self.delay_t0 = values[self.name]["t0"]
            self.delay_deltaT = values[self.name]["deltaT"]
        else:
            raise ValueError(f"Nu s-a furnizat valoare pentru intrarea {self.name}")

        for child in self.children:
            child.set_delay_values(values)

    def get_delay(self):
        if not self.children:
            raise Exception("Gate node does not have any children.")
        return self.delay_t0 + self.delay_deltaT * (len(self.children) - 1) + max(child.get_delay() for child in self.children)

    def __str__(self):
        return f"{self.__class__.__name__}(name={self.delay_t0}, delay_t0={self.delay_t0}, delay_deltaT={self.delay_deltaT}, children={self.children})"

    def to_dict(self):
        return {self.name: [child.to_dict() for child in self.children]}

class AndGate(GateNode):
    def __init__(self, name):
        super().__init__(name)

    def evaluate(self):
        result = True
        for child in self.children:
            result = result and child.evaluate()
        return result

class OrGate(GateNode):
    def __init__(self, name):
        super().__init__(name)

    def evaluate(self):
        result = False
        for child in self.children:
            result = result or child.evaluate()
        return result

class NotGate(GateNode):
    def __init__(self, name):
        super().__init__(name)

    def evaluate(self):
        if len(self.children) != 1:
            raise ValueError("NotGate trebuie să aibă exact un operand.")
        return not self.children[0].evaluate()

    def aggregate(self):
        self.children[0].aggregate()

    def to_dict(self):
        return {self.name: self.children[0].to_dict()}

class XorGate(GateNode):
    def __init__(self, name):
        super().__init__(name)

    def evaluate(self):
        if len(self.children) != 2:
            raise ValueError("XorGate trebuie să aibă exact 2 operanzi.")
        return self.children[0].evaluate() != self.children[1].evaluate()

def parse_ast(expr):
    """
    Dacă expr este un șir de caractere, creează un InputNode;
    dacă este dict, alege clasa de poartă în funcție de operatorul cheie și recurge pe operanzi.
    """
    if isinstance(expr, str):
        return InputNode(expr)
    elif isinstance(expr, dict):
        if len(expr) != 1:
            raise ValueError("Obiectul JSON trebuie să aibă o singură cheie (operatorul).")
        op = list(expr.keys())[0]
        operands = expr[op]
        if op == "and":
            node = AndGate(op)
        elif op == "or":
            node = OrGate(op)
        elif op == "xor":
            node = XorGate(op)
        elif op == "not":
            node = NotGate(op)
        else:
            raise ValueError(f"Operator necunoscut: {op}")
        if isinstance(operands, list):
            for sub in operands:
                child = parse_ast(sub)
                node.add_child(child)
        else:
            node.add_child(parse_ast(operands))
        return node
    else:
        raise ValueError("Tip de expresie necunoscut.")


# Exemplu de folosire:
if __name__ == '__main__':
    if len(sys.argv) < 3:
        print("Usage: python circuit_analyzer.py")
        sys.exit(1)
    input_filename =  "{}".format(sys.argv[1])
    output_filename = "{}".format(sys.argv[2])

    with open(input_filename) as input_file:
        data = json.load(input_file)

    myCircuit = parse_ast(data["ASTCircuit"])
    myCircuit.set_input_values(data["Inputs"])
    myCircuit.set_delay_values(data["GateDelays"])

    total_delay = myCircuit.get_delay()

    aggregated_circuit = deepcopy(myCircuit)
    aggregated_circuit.aggregate()
    aggregated_circuit_total_delay = aggregated_circuit.get_delay()

    result = {
        "TotalDelay": total_delay,
        "Output": int(myCircuit.evaluate()),
        "SatisfyTimeConstraint": total_delay <= data["TimeConstraint"],
        "OptimizedCircuit": aggregated_circuit.to_dict(),
        "OptimizedTotalDelay": aggregated_circuit_total_delay
    }
    with open(output_filename, 'w') as outfile:
        json.dump(result, outfile, indent=2)