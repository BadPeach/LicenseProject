
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using System.Diagnostics;
using System.Text.Json;
using System.Text.Json.Nodes;
using VerilogCircuitAnalyzerLib.Models;

namespace VerilogCircuitAnalyzerLib.Services
{
    public class CircuitAnalysisService
    {

        private string baseDirectory = Path.Combine(Directory.GetCurrentDirectory(), "Temp");
        enum ScriptType {
            PARSER,
            ANALYZER
        };

        public string GetHello()
        {
            return "Hello from CircuitAnalysisService";
        }

        public CircuitASTResponse ProcessVerilogFile(IFormFile file)
        {
            var (fileName, filePath) = SaveParserRequestToFile(file);

            var (outputFile, output, errors) = RunPythonScript(scriptType: ScriptType.PARSER, inputFilePath: filePath);

            return new CircuitASTResponse()
            {
                InputFileName = fileName,
                InputFilePath = filePath,
                ParserScriptErrors = errors,
                ParserScriptOutput = output,
                ParserScriptResponse = ReadJsonFromFile(outputFile),
            };
        }

        public CircuitAnalysisResponse AnalyzeCircuit(CircuitAnalysisRequest request)
        {
            var (fileName, filePath) = SaveAnalyzerRequestToFile(request);
            var (outputFile, output, errors) = RunPythonScript(scriptType: ScriptType.ANALYZER, inputFilePath: filePath);
            string jsonData = File.ReadAllText(outputFile);
            return JsonSerializer.Deserialize<CircuitAnalysisResponse>(jsonData);
        }

        private (string fileName, string filePath) SaveParserRequestToFile(IFormFile file)
        {
            if (file == null || file.Length == 0)
            {
                throw new ArgumentException("No file uploaded.");
            }

            string timestamp = DateTime.Now.ToString("yyyyMMddHHmmssfff");
            string fileName = $"{timestamp}_{Path.GetFileName(file.FileName)}";

            string uploadFolder = Path.Combine(baseDirectory, "ParserScriptUploads");
            if (!Directory.Exists(uploadFolder))
            {
                Directory.CreateDirectory(uploadFolder);
            }

            string filePath = Path.Combine(uploadFolder, fileName);
            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                file.CopyTo(stream);
            }
            
            return (fileName, filePath);
        }

        private (string fileName, string filePath) SaveAnalyzerRequestToFile(CircuitAnalysisRequest request)
        {
            string timestamp = DateTime.Now.ToString("yyyyMMddHHmmssfff");
            string fileName = $"{timestamp}_input.json";

            string uploadFolder = Path.Combine(baseDirectory, "AnalyzerScriptUploads");
            if (!Directory.Exists(uploadFolder))
            {
                Directory.CreateDirectory(uploadFolder);
            }

            string filePath = Path.Combine(uploadFolder, fileName);
            string jsonData = JsonSerializer.Serialize(request);
            File.WriteAllText(filePath, jsonData);

            return (fileName, filePath);
        }


        private string _pyParserOutputFolder = "ParserOutput";
        private string _pyAnalyzerOutputFolder = "AnalyzerOutput";
        private string _pythonParserScriptPath = Environment.GetEnvironmentVariable("PYTHON_PARSER_SCRIPT_PATH");
        private string _pythonAnalyzerScriptPath = Environment.GetEnvironmentVariable("PYTHON_ANALYZER_SCRIPT_PATH");
        private string _pythonPath = Environment.GetEnvironmentVariable("PYTHON_PATH");

        private (string, string, string) RunPythonScript(ScriptType scriptType, string inputFilePath)
        {
            string outputFolder, pythonScriptPath;
            switch (scriptType)
            {
                case ScriptType.PARSER:
                    {
                        outputFolder = _pyParserOutputFolder;
                        pythonScriptPath = _pythonParserScriptPath;
                        break;
                    }
                case ScriptType.ANALYZER:
                    {
                        outputFolder = _pyAnalyzerOutputFolder;
                        pythonScriptPath = _pythonAnalyzerScriptPath;
                        break;
                    }
                default:
                    throw new ArgumentException("Unknown ScriptType");

            }

            var outputFilePath = GetOutputFilePath(inputFilePath, outputFolder);

            var start = new ProcessStartInfo
            {
                FileName = _pythonPath,
                Arguments = $"\"{pythonScriptPath}\" \"{inputFilePath}\" \"{outputFilePath}\"",
                RedirectStandardOutput = true,
                RedirectStandardError = true,
                UseShellExecute = false,
                CreateNoWindow = true,
            };

            using var process = new Process { StartInfo = start };
            process.Start();

            var output = process.StandardOutput.ReadToEnd();
            var errors = process.StandardError.ReadToEnd();

            process.WaitForExit();

            return (outputFilePath, output, errors);
        }

        private static string GetOutputFilePath(string inputFilePath, string outputFolderName, string outputExtension = ".out.json")
        {
            var parentDir = Directory.GetParent(Path.GetDirectoryName(inputFilePath)).FullName;
            var outputDir = Path.Combine(parentDir, outputFolderName);
            Directory.CreateDirectory(outputDir);
            var outputFileName = Path.GetFileName(inputFilePath) + outputExtension;
            return Path.Combine(outputDir, outputFileName);
        }

        private static JsonObject ReadJsonFromFile(string filePath)
        {
            var jsonContent = File.ReadAllText(filePath);
            return JsonNode.Parse(jsonContent).AsObject();
        }
    }
}
