
using Microsoft.AspNetCore.Http;
using System.Diagnostics;
using System.Text.Json.Nodes;
using VerilogCircuitAnalyzerLib.Models;

namespace VerilogCircuitAnalyzerLib.Services
{
    public class CircuitAnalysisService
    {
        enum ScriptType {
            PARSER,
            ANALYZER
        };

        public string GetHello()
        {
            return "Hello from CircuitAnalysisService";
        }

        public CircuitAnalysisResponse ProcessVerilogFile(IFormFile file)
        {
            var (fileName, filePath) = SaveUploadedFile(file);

            var (outputFile1, output1, errors1) = RunPythonScript(scriptType: ScriptType.PARSER, inputFilePath: filePath);
           // var (outputFile2, output2, errors2) = RunPythonScript(scriptType: ScriptType.ANALYZER, inputFilePath: outputFile1);

            return new CircuitAnalysisResponse()
            {
                InputFileName = fileName,
                InputFilePath = filePath,
                ParserScriptErrors = errors1,
                ParserScriptOutput = output1,
                ParserScriptResponse = ReadJsonFromFile(outputFile1),
            };
        }

        private (string fileName, string filePath) SaveUploadedFile(IFormFile file)
        {
            if (file == null || file.Length == 0)
            {
                throw new ArgumentException("No file uploaded.");
            }

            string timestamp = DateTime.Now.ToString("yyyyMMddHHmmssfff");
            string fileName = $"{timestamp}_{Path.GetFileName(file.FileName)}";

            string uploadFolder = Path.Combine(Directory.GetCurrentDirectory(), "Uploads");
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


        private string _pyParserOutputFolder = "ParserOutput";
        private string _pyAnalyzerOutputFolder = "AnalyzerOutput";
        private string _pythonParserScriptPath = @"D:\Facultate\LICENTA\LicenseRepository\Apps\Scripts\VerilogPyParser\parser.py";
        private string _pythonAnalyzerScriptPath = @"D:\Facultate\LICENTA\LicenseRepository\Apps\Scripts\VerilogPyCircuitAnalyzer\circuit_analyzer.py";
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

            var pythonExePath = @"C:\Users\baril\AppData\Local\Microsoft\WindowsApps\PythonSoftwareFoundation.Python.3.12_qbz5n2kfra8p0\python.exe"; // or @"C:\Python311\python.exe"
            var outputFilePath = GetOutputFilePath(inputFilePath, outputFolder);

            var start = new ProcessStartInfo
            {
                FileName = pythonExePath,
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

        private static string GetOutputFilePath(string inputFilePath, string outputFolderName, string outputExtension = ".json")
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
