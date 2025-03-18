
using Microsoft.AspNetCore.Http;

namespace VerilogCircuitAnalyzerLib.Services
{
    public class CircuitAnalysisService
    {
        public string GetHello()
        {
            return "Hello from CircuitAnalysisService";
        }

        public (string fileName, string filePath) SaveUploadedFile(IFormFile file)
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
    }
}
