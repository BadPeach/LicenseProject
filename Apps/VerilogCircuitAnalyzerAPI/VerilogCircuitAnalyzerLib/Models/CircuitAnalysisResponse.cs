using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Nodes;
using System.Threading.Tasks;

namespace VerilogCircuitAnalyzerLib.Models
{
    public class CircuitAnalysisResponse
    {
        public String InputFileName { get; set; }
        public String InputFilePath { get; set; }

        public String ParserScriptOutput { get; set; }
        public String ParserScriptErrors { get; set; }
        public JsonObject ParserScriptResponse { get; set; }

        public String AnalyzerScriptOutput { get; set; }
        public String AnalyzerScriptErrors { get; set; }
        public JsonObject AnalyzerScriptResponse { get; set; }

    }
}
