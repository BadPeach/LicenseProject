FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY VerilogCircuitAnalyzerAPI/ .
WORKDIR /src/VerilogCircuitAnalyzerAPI
RUN dotnet publish VerilogCircuitAnalyzerAPI.csproj \
    -c Release \
    -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app

RUN apt-get update \
 && apt-get install -y --no-install-recommends \
      python3 \
      python3-venv \
      python3-pip \
      iverilog \
 && rm -rf /var/lib/apt/lists/*
 RUN python3 -m venv /opt/venv \
 && /opt/venv/bin/pip install --upgrade pip \
 && /opt/venv/bin/pip install --no-cache-dir \
      sympy~=1.14.0 \
      pyverilog~=1.3.0

COPY --from=build /app/publish .
RUN mkdir -p Scripts
COPY Scripts/ Scripts/

ENV ASPNETCORE_URLS=http://+:80
ENV PYTHON_PARSER_SCRIPT_PATH=/app/Scripts/VerilogPyParser/parser.py
ENV PYTHON_ANALYZER_SCRIPT_PATH=/app/Scripts/VerilogPyCircuitAnalyzer/circuit_analyzer.py
ENV PYTHON_PATH=/opt/venv/bin/python

EXPOSE 80

ENTRYPOINT ["dotnet", "VerilogCircuitAnalyzerAPI.dll"]
