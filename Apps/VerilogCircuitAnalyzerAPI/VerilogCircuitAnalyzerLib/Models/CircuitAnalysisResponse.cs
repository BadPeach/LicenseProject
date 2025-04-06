using System.Text.Json.Nodes;

namespace VerilogCircuitAnalyzerLib.Models
{
    public class CircuitAnalysisResponse
    {
        public Dictionary<String, CircuitTypeData> Options { get; set; }
        public string OptimizedCircuitType { get; set; }
        public double OptimizedTotalDelay { get; set; }
    }
}
