using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Nodes;
using System.Threading.Tasks;

namespace VerilogCircuitAnalyzerLib.Models
{
    public class CircuitASTResponse
    {
        public String InputFileName { get; set; }
        public String InputFilePath { get; set; }

        public String ParserScriptOutput { get; set; }
        public String ParserScriptErrors { get; set; }
        public JsonObject ParserScriptResponse { get; set; }
    }
}
