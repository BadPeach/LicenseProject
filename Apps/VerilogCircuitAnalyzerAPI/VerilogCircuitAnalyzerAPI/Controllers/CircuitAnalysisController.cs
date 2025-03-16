using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using VerilogCircuitAnalyzerLib.Services;

namespace VerilogCircuitAnalyzerAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CircuitAnalysisController : ControllerBase
    {
        private readonly ILogger<CircuitAnalysisController> _logger;
        private readonly CircuitAnalysisService _circuitAnalysisService = new CircuitAnalysisService();

        public CircuitAnalysisController(ILogger<CircuitAnalysisController> logger)
        {
            _logger = logger;
        }

        [HttpGet(Name = "Hello")]
        public String Get()
        {
           return _circuitAnalysisService.getHello();
        }
    }
}
