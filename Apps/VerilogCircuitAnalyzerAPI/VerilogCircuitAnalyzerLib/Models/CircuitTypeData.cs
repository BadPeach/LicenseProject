using System.Text.Json.Nodes;

namespace VerilogCircuitAnalyzerLib.Models
{
    public class CircuitTypeData
    {
        public float TotalDelay {  get; set; }
        public int Output {  get; set; }
        public bool SatisfyTimeConstraint { get; set; }
        public object ExpressionTree {  get; set; }
    }
}
