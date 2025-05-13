class DelayModel:
    def gate_delay(self, gate_type: str, fan_in: int, fan_out: int = 1):
        raise NotImplementedError

class SimpleDelay(DelayModel):
    def __init__(self, table):
        self.table = table

    def gate_delay(self, gate, n, fan_out=1):
        t0, deltaT = self.table[gate]["t0"], self.table[gate]["deltaT"]
        return t0 + deltaT * (n - 1)

class LogicalEffort(DelayModel):
    _BASE_GP = {
        'nand': lambda n: ((n + 2) / 3.0, n),
        'nor': lambda n: ((2 * n + 1) / 3.0, n),
        'not': lambda n=1: (1.0, 1.0),
        'and': lambda n: ((n + 2) / 3.0, n + 1),  # nand + inv
        'or': lambda n: ((2 * n + 1) / 3.0, n + 1),  # nor  + inv
        'xor': lambda n: (4.0, 4.0) if n == 2 else (6.0, n + 2)
    }

    def __init__(self, tau_ps, overrides=None):
        self.tau = tau_ps
        self.over = overrides or {}

    def _gp(self, gate, n):
        if gate in self.over:  # user override
            o = self.over[gate]
            return o['g'], o['p']
        return self._BASE_GP[gate](n)

    def gate_delay(self, gate, n, fan_out=1):
        g, p = self._gp(gate, n)
        h = fan_out
        return self.tau * (p + g * h)