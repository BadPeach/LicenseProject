import json
import sys
from copy import deepcopy

from core.ast_nodes import InputNode, AndGate, OrGate, XorGate, NotGate
from core.circuit_optimizations import ast_to_sympy, optimize_ast_with_sympy
from core.delay_models import SimpleDelay, LogicalEffort


def parse_ast(expr):
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


def parse_delay_model(delay_data):
    params = delay_data["Params"]
    if delay_data["Model"] == "simple":
        return SimpleDelay(params["GateTableSimple"])
    elif delay_data["Model"] == "logical_effort":
        return LogicalEffort(params["Tau"], params["GateTableLogicalEffort"])
    else:
        raise ValueError("Model necunoscut.")


if __name__ == '__main__':
    if len(sys.argv) < 3:
        print("Usage: python circuit_analyzer.py")
        sys.exit(1)
    input_filename =  "{}".format(sys.argv[1])
    output_filename = "{}".format(sys.argv[2])

    with open(input_filename) as input_file:
        data = json.load(input_file)

    delay_model = parse_delay_model(data["Delays"])
    original_circuit = parse_ast(data["ASTCircuit"])

    original_circuit.set_input_values(data["Inputs"])
    original_circuit.set_delay_model(delay_model)
    total_delay = original_circuit.get_delay()

    optimized_circuit_type = "Original Circuit"
    optimized_total_delay = total_delay

    aggregated_circuit = deepcopy(original_circuit)
    aggregated_circuit.aggregate()
    aggregated_circuit_total_delay = aggregated_circuit.get_delay()
    if aggregated_circuit_total_delay < optimized_total_delay:
        optimized_total_delay = aggregated_circuit_total_delay
        optimized_circuit_type = "Aggregated Tree Circuit"

    balanced_tree_circuit = deepcopy(aggregated_circuit)
    balanced_tree_circuit.balance_tree()
    balanced_tree_circuit_total_delay = balanced_tree_circuit.get_delay()
    if balanced_tree_circuit_total_delay < optimized_total_delay:
        optimized_total_delay = balanced_tree_circuit_total_delay
        optimized_circuit_type = "Balanced Tree Circuit"

    sympy_cnf_optimized_circuit = optimize_ast_with_sympy(original_circuit, form='cnf')
    sympy_cnf_optimized_circuit.set_input_values(data["Inputs"])
    sympy_cnf_optimized_circuit.set_delay_model(delay_model)
    sympy_cnf_optimized_circuit_total_delay = sympy_cnf_optimized_circuit.get_delay()
    if sympy_cnf_optimized_circuit_total_delay < optimized_total_delay:
        optimized_total_delay = sympy_cnf_optimized_circuit_total_delay
        optimized_circuit_type = "Sympy CNF Optimized Circuit"

    sympy_dnf_optimized_circuit = optimize_ast_with_sympy(original_circuit, form='dnf')
    sympy_dnf_optimized_circuit.set_input_values(data["Inputs"])
    sympy_dnf_optimized_circuit.set_delay_model(delay_model)
    sympy_dnf_optimized_circuit_total_delay = sympy_dnf_optimized_circuit.get_delay()
    if sympy_dnf_optimized_circuit_total_delay < optimized_total_delay:
        optimized_total_delay = sympy_dnf_optimized_circuit_total_delay
        optimized_circuit_type = "Sympy DNF Optimized Circuit"

    result = {
        "Options": {
            "OriginalCircuit": {
                "TotalDelay": total_delay,
                "Output": int(original_circuit.evaluate()),
                "SatisfyTimeConstraint": total_delay <= data["TimeConstraint"],
                "ExpressionTree": original_circuit.to_dict()
            },
            "AggregatedTreeCircuit": {
                "TotalDelay": aggregated_circuit_total_delay,
                "Output": int(aggregated_circuit.evaluate()),
                "SatisfyTimeConstraint": aggregated_circuit_total_delay <= data["TimeConstraint"],
                "ExpressionTree": aggregated_circuit.to_dict()
            },
            "BalancedTreeCircuit": {
                "TotalDelay": balanced_tree_circuit_total_delay,
                "Output": int(balanced_tree_circuit.evaluate()),
                "SatisfyTimeConstraint": balanced_tree_circuit_total_delay <= data["TimeConstraint"],
                "ExpressionTree": balanced_tree_circuit.to_dict()
            },
            "SympyCNFOptimizedCircuit": {
                "TotalDelay": sympy_cnf_optimized_circuit_total_delay,
                "Output": int(sympy_cnf_optimized_circuit.evaluate()),
                "SatisfyTimeConstraint": sympy_cnf_optimized_circuit_total_delay <= data["TimeConstraint"],
                "ExpressionTree": sympy_cnf_optimized_circuit.to_dict()
            },
            "SympyDNFOptimizedCircuit": {
                "TotalDelay": sympy_dnf_optimized_circuit_total_delay,
                "Output": int(sympy_dnf_optimized_circuit.evaluate()),
                "SatisfyTimeConstraint": sympy_dnf_optimized_circuit_total_delay <= data["TimeConstraint"],
                "ExpressionTree": sympy_dnf_optimized_circuit.to_dict()
            }
        },
        "OptimizedCircuitType": optimized_circuit_type,
        "OptimizedTotalDelay": optimized_total_delay
    }
    with open(output_filename, 'w') as outfile:
        json.dump(result, outfile, indent=2)