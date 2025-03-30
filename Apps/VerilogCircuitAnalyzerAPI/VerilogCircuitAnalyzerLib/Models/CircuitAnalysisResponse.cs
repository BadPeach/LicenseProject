using System.Text.Json.Nodes;

namespace VerilogCircuitAnalyzerLib.Models
{
    public class CircuitAnalysisResponse
    {
        public double TotalDelay { get; set; }
        public int Output { get; set; }
        public bool SatisfyTimeConstraint { get; set; }


        public JsonObject OptimizedCircuit { get; set; }
        public double OptimizedTotalDelay { get; set; }
    }
}
