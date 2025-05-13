from core.delay_models import DelayModel


class ASTNode:
    def __init__(self, name):
        self.name = name

    def get_delay(self):
        """Returnează delay-ul total al nodului (delay-ul propriu + maximul din subnoduri)."""
        raise NotImplementedError

    def set_input_values(self, values: dict):
        """Inițializează valorile de intrare ale nodurilor terminale."""
        raise NotImplementedError

    def set_delay_model(self, values: dict):
        """Inițializează valorile de delay ale nodurilor """
        raise NotImplementedError

    def evaluate(self):
        """Evaluează circuitul și returnează rezultatul (True/False)."""
        raise NotImplementedError

    def aggregate(self):
        raise NotImplementedError

    def balance_tree(self):
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

    def set_delay_model(self, model: DelayModel):
        return

    def aggregate(self):
        return

    def balance_tree(self):
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
    def __init__(self, name, delay_model:DelayModel = None):
        super().__init__(name)
        self.children = []
        self.delay_model = delay_model

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

    def balance_tree(self):
        for child in self.children:
            child.balance_tree()

        total_children_count = len(self.children)
        if total_children_count <= 3:
            return

        new_children = []
        processed_children_count = 0
        while processed_children_count < total_children_count:
            if (total_children_count - processed_children_count) == 3:
                group = self.children[processed_children_count:processed_children_count + 3]
                processed_children_count += 3
            else:
                group = self.children[processed_children_count:processed_children_count + 2]
                processed_children_count += 2

            if len(group) == 1:
                new_children.append(group[0])
            else:
                new_gate = type(self)(self.name, self.delay_model)
                new_gate.children = group
                new_children.append(new_gate)

        self.children = new_children
        if len(self.children) > 3:
            self.balance_tree()


    def add_child(self, child: ASTNode):
        self.children.append(child)

    def set_input_values(self, values: dict):
        for child in self.children:
            child.set_input_values(values)

    def set_delay_model(self, delay_model: DelayModel):
        self.delay_model = delay_model

        for child in self.children:
            child.set_delay_model(self.delay_model)

    def get_delay(self):
        if not self.children:
            raise Exception("Gate node does not have any children.")
        my_delay = self.delay_model.gate_delay(self.name, len(self.children))

        return my_delay + max(child.get_delay() for child in self.children)

    def __str__(self):
        return f"{self.__class__.__name__}(name={self.delay_t0}, delay_t0={self.delay_t0}, delay_deltaT={self.delay_deltaT}, children={self.children})"

    def to_dict(self):
        return {self.name: [child.to_dict() for child in self.children]}

class AndGate(GateNode):
    def __init__(self, name, delay_model:DelayModel = None):
        super().__init__(name, delay_model)

    def evaluate(self):
        result = True
        for child in self.children:
            result = result and child.evaluate()
        return result

class OrGate(GateNode):
    def __init__(self, name, delay_model: DelayModel = None):
        super().__init__(name, delay_model)

    def evaluate(self):
        result = False
        for child in self.children:
            result = result or child.evaluate()
        return result

class NotGate(GateNode):
    def __init__(self, name, delay_model: DelayModel = None):
        super().__init__(name, delay_model)

    def evaluate(self):
        if len(self.children) != 1:
            raise ValueError("NotGate trebuie să aibă exact un operand.")
        return not self.children[0].evaluate()

    def aggregate(self):
        self.children[0].aggregate()

    def balance_tree(self):
        self.children[0].balance_tree()

    def to_dict(self):
        return {self.name: self.children[0].to_dict()}

class XorGate(GateNode):
    def __init__(self, name, delay_model: DelayModel = None):
        super().__init__(name, delay_model)

    def evaluate(self):
        if len(self.children) != 2:
            raise ValueError("XorGate trebuie să aibă exact 2 operanzi.")
        return self.children[0].evaluate() != self.children[1].evaluate()
