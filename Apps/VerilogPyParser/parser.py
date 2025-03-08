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
    elif node_type == "UnaryOperator":
        op = node.operator
        operand = convert_expr(node.right, assignment_map)
        if op == '~':
            return {"not": operand}
        else:
            return {op: operand}
    elif node_type in ["Operator", "BinaryOperator"]:
        op = node.operator
        left_expr = convert_expr(node.left, assignment_map)
        right_expr = convert_expr(node.right, assignment_map)
        if op == '&':
            return {"and": [left_expr, right_expr]}
        elif op == '|':
            return {"or": [left_expr, right_expr]}
        elif op == '^':
            return {"xor": [left_expr, right_expr]}
        else:
            return {op: [left_expr, right_expr]}
    else:
        # Fără conversii la string – se procesează toți copii ca subnoduri.
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
    for out in outputs:
        if out in assignment_map:
            expr_tree = convert_expr(assignment_map[out], assignment_map)
            expr_tree = simplify_expr(expr_tree)
            expression_tree[out] = expr_tree

    return {
        "module": module_name,
        "inputs": inputs,
        "outputs": outputs,
        "expression_tree": expression_tree
    }


if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Usage: python parser.py <verilog_file>")
        sys.exit(1)
    input_filename =  "input/{}".format(sys.argv[1])
    output_filename = "output/{}.json".format(sys.argv[1])
    parsed_result = parse_verilog_file(input_filename)
    with open(output_filename, 'w') as outfile:
        json.dump(parsed_result, outfile, indent=2)
    print(f"Output written to {output_filename}")
