using System.Text.Json.Nodes;

namespace VerilogCircuitAnalyzerLib.Models
{
    public class CircuitAnalysisRequest
    {
        public JsonObject ASTCircuit { get; set; }
        public JsonObject Delays { get; set; }
        public double TimeConstraint { get; set; }
        public Dictionary<string, int> Inputs { get; set; }
    }
}
