import http    from 'k6/http';
import { check } from 'k6';

const rawVerilog = open('./test_circuit.v');  // 'b' = binary safe, but plain open() works too

const HOST = __ENV.TARGET_HOST || 'http://localhost:3000';

export default function () {
  const payload = {
    file: http.file(rawVerilog, 'test_circuit.v'),
  };

  const res = http.post(`${HOST}/api/CircuitAnalysis/processVerilogFile`, payload);

  check(res, {
    'got 200': (r) => r.status === 200,
  });
}
