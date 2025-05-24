from sympy import Symbol, And, Or, Not, Xor, simplify_logic
from sympy.logic.boolalg import BooleanFunction

from core.ast_nodes import InputNode, AndGate, OrGate, NotGate, XorGate


def ast_to_sympy(node):
    if isinstance(node, InputNode):
        return Symbol(node.name)

    children = node.children
    if isinstance(node, AndGate):
        return And(*[ast_to_sympy(c) for c in children])
    if isinstance(node, OrGate):
        return Or(*[ast_to_sympy(c) for c in children])
    if isinstance(node, NotGate):
        return Not(ast_to_sympy(children[0]))
    if isinstance(node, XorGate):
        return Xor(ast_to_sympy(children[0]), ast_to_sympy(children[1]))

    raise ValueError(f"Unsupported AST node type: {type(node)}")


def sympy_to_ast(expr):
    if expr.is_Symbol:
        return InputNode(str(expr))

    func = type(expr)
    args = expr.args

    if func is And:
        node = AndGate('and')
        for arg in args:
            node.add_child(sympy_to_ast(arg))
        return node

    if func is Or:
        node = OrGate('or')
        for arg in args:
            node.add_child(sympy_to_ast(arg))
        return node

    if func is Not:
        node = NotGate('not')
        node.add_child(sympy_to_ast(args[0]))
        return node

    if func is Xor:
        node = XorGate('xor')
        a1, a2 = args
        node.add_child(sympy_to_ast(a1))
        node.add_child(sympy_to_ast(a2))
        return node

    if isinstance(expr, BooleanFunction):
        if len(args) == 1:
            return sympy_to_ast(args[0])

    raise ValueError(f"Unsupported SymPy expression: {expr}")


def optimize_ast_with_sympy(ast_root, form='cnf'):
    sym_expr = ast_to_sympy(ast_root)
    simplified = simplify_logic(sym_expr, form=form, force=False)
    optimized_root = sympy_to_ast(simplified)
    return optimized_root
