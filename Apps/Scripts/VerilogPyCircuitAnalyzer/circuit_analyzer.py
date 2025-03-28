import json
import sys


class ASTNode:
    def get_delay(self):
        """Returnează delay-ul total al nodului (delay-ul propriu + maximul din subnoduri)."""
        raise NotImplementedError

    def set_input_values(self, values: dict):
        """Inițializează valorile de intrare ale nodurilor terminale."""
        raise NotImplementedError

    def evaluate(self):
        """Evaluează circuitul și returnează rezultatul (True/False)."""
        raise NotImplementedError

class InputNode(ASTNode):
    def __init__(self, name):
        self.name = name
        self.value = None

    def get_delay(self):
        return 0.0

    def set_input_values(self, values: dict):
        if self.name in values:
            self.value = values[self.name]
        else:
            raise ValueError(f"Nu s-a furnizat valoare pentru intrarea {self.name}")

    def evaluate(self):
        if self.value is None:
            raise ValueError(f"Valoarea pentru {self.name} nu a fost inițializată.")
        return self.value

    def __repr__(self):
        return f"InputNode({self.name}={self.value})"

# Nod de bază pentru o poartă (gate)
class GateNode(ASTNode):
    def __init__(self, delay):
        self.delay = delay
        self.children = []

    def add_child(self, child: ASTNode):
        self.children.append(child)

    def set_input_values(self, values: dict):
        for child in self.children:
            child.set_input_values(values)

    def get_delay(self):
        if not self.children:
            return self.delay
        return self.delay + max(child.get_delay() for child in self.children)

    def __repr__(self):
        return f"{self.__class__.__name__}(delay={self.delay}, children={self.children})"

class AndGate(GateNode):
    def __init__(self, delay=1.0):
        super().__init__(delay)

    def evaluate(self):
        result = True
        for child in self.children:
            result = result and child.evaluate()
        return result

class OrGate(GateNode):
    def __init__(self, delay=1.0):
        super().__init__(delay)

    def evaluate(self):
        result = False
        for child in self.children:
            result = result or child.evaluate()
        return result

class NotGate(GateNode):
    def __init__(self, delay=0.5):
        super().__init__(delay)

    def evaluate(self):
        if len(self.children) != 1:
            raise ValueError("NotGate trebuie să aibă exact un operand.")
        return not self.children[0].evaluate()

class XorGate(GateNode):
    def __init__(self, delay=1.5):
        super().__init__(delay)

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
        if op == "And":
            node = AndGate()
        elif op == "Or":
            node = OrGate()
        elif op == "Xor":
            node = XorGate()
        elif op == "Unot":
            node = NotGate()
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

def parse_circuit(json_data):
    if "expression_tree" not in json_data:
        raise ValueError("JSON-ul nu conține câmpul 'expression_tree'.")
    expr_tree = json_data["expression_tree"]
    output_name, output_expr = next(iter(expr_tree.items()))
    circuit = parse_ast(output_expr)
    return circuit

def test():
    with open("input/example_2.v.json") as input_file:
        data = json.load(input_file)
        myCircuit = parse_circuit(data)
        print("Circuit AST:")
        print(myCircuit)
        print("Total delay:", myCircuit.get_delay())

        input_values = {"a": True, "b": False, "c": True}
        myCircuit.set_input_values(input_values)
        result = myCircuit.evaluate()
        print("Rezultat evaluare circuit:", result)


# Exemplu de folosire:
if __name__ == '__main__':
    if len(sys.argv) < 3:
        print("Usage: python circuit_analyzer.py")
        sys.exit(1)
    input_filename =  "{}".format(sys.argv[1])
    output_filename = "{}".format(sys.argv[2])
    with open(output_filename, 'w') as outfile:
        json.dump({"delay": "dummy", "optimized_circuit": "dummy"}, outfile, indent=2)