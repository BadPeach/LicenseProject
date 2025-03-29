import sys
import json
from pyverilog.vparser.parser import parse


def get_identifier_name(node):
    """
    Extrage numele semnalului dintr-un nod (Identifier sau Lvalue).
    """
    if hasattr(node, 'name'):
        return node.name
    elif node.__class__.__name__ == 'Lvalue':
        children = list(node.children())
        if children and hasattr(children[0], 'name'):
            return children[0].name
    return None


def unwrap_rvalue(node):
    """
    Înlătură recursiv orice strat de Rvalue, returnând nodul „real”.
    """
    while node.__class__.__name__ == "Rvalue":
        children = list(node.children())
        if children:
            node = children[0]
        else:
            break
    return node


def convert_expr(node, assignment_map):
    """
    Convertește recursiv un nod AST într-o structură JSON-friendly,
    extinzând (inline) definițiile semnalelor intermediare din assignment_map.
    """
    node = unwrap_rvalue(node)
    node_type = node.__class__.__name__

    if node_type == "Identifier":
        # Dacă semnalul apare în map, se extinde recursiv definiția sa.
        if node.name in assignment_map:
            return convert_expr(assignment_map[node.name], assignment_map)
        else:
            return node.name
    elif node_type == "IntConst":
        return node.value
    elif node_type in ["UnaryOperator", "Unot"]:
        # Tratăm operatorii unari; pentru "Unot" (sau cazul în care operatorul este '~')
        operand = convert_expr(node.right, assignment_map)
        return {"not": operand}
    elif node_type in ["Operator", "BinaryOperator", "And", "Or", "Xor", "Nand", "Nor", "Xnor"]:
        # Dacă nodul are un tip care reprezintă direct operatorul (ex. "And", "Or", etc.)
        if node_type in ["And", "Or", "Xor", "Nand", "Nor", "Xnor"]:
            op = node_type.lower()  # "And" -> "and", etc.
        else:
            # Pentru cazurile în care avem un operator simbolic
            op = node.operator
            if op == '&':
                op = "and"
            elif op == '|':
                op = "or"
            elif op == '^':
                op = "xor"
        left_expr = convert_expr(node.left, assignment_map)
        right_expr = convert_expr(node.right, assignment_map)
        return {op: [left_expr, right_expr]}
    else:
        # Pentru orice alt tip de nod, procesăm recursiv copiii.
        children = list(node.children())
        if children:
            return {node_type: [convert_expr(child, assignment_map) for child in children]}
        else:
            return node_type



def simplify_expr(expr):
    """
    Simplifică expresiile pentru a reduce, de exemplu:
      {"and": [ {"and": ["b", "c"]}, {"or": ["b", "c"]} ]}
    la
      {"and": ["b", "c"]}
    (acesta este un exemplu specific pentru cazul dat).
    """
    if isinstance(expr, dict):
        # Cazul specific pentru operatorul "and" între două subexpresii
        if "and" in expr and isinstance(expr["and"], list) and len(expr["and"]) == 2:
            left, right = expr["and"]
            if (isinstance(left, dict) and "and" in left and
                    isinstance(right, dict) and "or" in right):
                left_ops = left["and"] if isinstance(left["and"], list) else [left["and"]]
                right_ops = right["or"] if isinstance(right["or"], list) else [right["or"]]
                if set(left_ops).issubset(set(right_ops)):
                    return simplify_expr(left)
            if (isinstance(right, dict) and "and" in right and
                    isinstance(left, dict) and "or" in left):
                right_ops = right["and"] if isinstance(right["and"], list) else [right["and"]]
                left_ops = left["or"] if isinstance(left["or"], list) else [left["or"]]
                if set(right_ops).issubset(set(left_ops)):
                    return simplify_expr(right)
        # Recursiv pe toate cheile.
        return {k: simplify_expr(v) for k, v in expr.items()}
    elif isinstance(expr, list):
        return [simplify_expr(item) for item in expr]
    else:
        return expr



def collect_gates(expr):
    gate_counts = {}
    if isinstance(expr, dict):
        for key, value in expr.items():
            if key.lower() in {"and", "or", "not", "xor", "nand", "nor", "xnor"}:
                gate_counts[key] = gate_counts.get(key, 0) + 1
            if isinstance(value, list):
                for item in value:
                    child_counts = collect_gates(item)
                    for k, v in child_counts.items():
                        gate_counts[k] = gate_counts.get(k, 0) + v
            elif isinstance(value, dict):
                child_counts = collect_gates(value)
                for k, v in child_counts.items():
                    gate_counts[k] = gate_counts.get(k, 0) + v
    elif isinstance(expr, list):
        for item in expr:
            child_counts = collect_gates(item)
            for k, v in child_counts.items():
                gate_counts[k] = gate_counts.get(k, 0) + v
    return gate_counts


def parse_verilog_file(filename):
    """
    Parcurge fișierul Verilog, construiește o hartă a atribuțiilor și
    generează arborele de expresii pentru ieșirile modulului.
    """
    ast, _ = parse([filename])
    description = ast.description

    # Presupunem că avem un singur modul în fișier.
    module_def = description.definitions[0]
    module_name = module_def.name

    inputs = []
    outputs = []
    assignments = []  # Lista de tuple: (stânga, dreapta)
    gates = set()

    for item in module_def.items:
        if item.__class__.__name__ == 'Decl':
            for decl in item.list:
                if decl.__class__.__name__ == 'Input':
                    inputs.append(decl.name)
                elif decl.__class__.__name__ == 'Output':
                    outputs.append(decl.name)
        elif item.__class__.__name__ == 'Assign':
            assignments.append((item.left, item.right))

    # Construim o hartă: nume semnal -> nodul AST al expresiei
    assignment_map = {}
    for left, right in assignments:
        left_name = get_identifier_name(left)
        if left_name:
            assignment_map[left_name] = unwrap_rvalue(right)

    # Pentru fiecare ieșire, extindem recursiv definițiile semnalelor intermediare.
    expression_tree = {}
    if len(outputs) != 1:
        raise Exception("Expected only 1 output")
    for out in outputs:
        if out in assignment_map:
            expression_tree = convert_expr(assignment_map[out], assignment_map)
            # expression_tree = simplify_expr(expression_tree)

    # Colectăm gate-urile din arborele expresiilor pentru toate ieșirile.
    total_gate_counts = collect_gates(expression_tree)

    return {
        "module": module_name,
        "inputs": inputs,
        "outputs": outputs,
        "gates": total_gate_counts,
        "expression_tree": expression_tree
    }


if __name__ == '__main__':
    if len(sys.argv) < 3:
        print("Usage: python parser.py <verilog_file>")
        sys.exit(1)
    input_filename =  "{}".format(sys.argv[1])
    output_filename = "{}".format(sys.argv[2])
    parsed_result = parse_verilog_file(input_filename)
    with open(output_filename, 'w') as outfile:
        json.dump(parsed_result, outfile, indent=2)
    print(f"Output written to {output_filename}")
