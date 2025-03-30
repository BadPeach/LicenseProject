using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Nodes;
using System.Threading.Tasks;

namespace VerilogCircuitAnalyzerLib.Models
{
    public class GateDelay
    {
        public double t0 { get; set; }
        public double deltaT { get; set; }
    }
}
