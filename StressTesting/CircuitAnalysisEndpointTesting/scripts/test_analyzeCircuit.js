import http from 'k6/http';
import { check } from 'k6';

const payload = JSON.stringify({
  "Delays": {
    "Model": "logical_effort",
    "Params": {
      "Tau": 5,
      "GateTableLogicalEffort": {
        "xor": { "override": false },
        "and": { "override": false },
        "or": { "override": false },
        "not": { "override": false }
      }
    }
  },
  "Inputs": {
    "a1": 0, "a2": 0, "a3": 0,
    "o1": 0, "o2": 0, "o3": 0,
    "a4": 0
  },
  "TimeConstraint": 30,
  "ASTCircuit": {
    "xor": [
      {
        "and": [
          { "and": [ { "and": ["a1", "a2"] }, "a3" ] },
          { "or": ["o1", "o2"] }
        ]
      },
      {
        "not": {
          "or": [
            {
              "or": [
                { "or": ["o1", "o2"] },
                { "and": ["o3", { "not": "a4" }] }
              ]
            },
            { "xor": ["o1", "o2"] }
          ]
        }
      }
    ]
  }
});

const params = {
  headers: { 'Content-Type': 'application/json' },
};

const HOST = __ENV.TARGET_HOST;

export default function () {
  const res = http.post(`${HOST}/api/CircuitAnalysis/analyzeCircuit`, payload, params);
  check(res, { 'status is 200': (r) => r.status === 200 });
}
