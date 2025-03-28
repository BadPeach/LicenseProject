using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using VerilogCircuitAnalyzerLib.Services;
using System;
using System.IO;

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
        public string Get()
        {
            return _circuitAnalysisService.GetHello();
        }

        [HttpPost("processVerilogFile")]
        public IActionResult ProcessVerilogFile(IFormFile file)
        {
            try
            {
                var result = _circuitAnalysisService.ProcessVerilogFile(file);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error uploading file");
                return StatusCode(500, "Internal server error");
            }
        }
    }
}
