# 
docker network create --driver bridge --subnet 172.16.20.0/24 circuit-analyzer-network
docker network ls
docker network inspect circuit-analyzer-network

# Build the UI image
ng build --configuration=production
docker build -f VerilogCircuitAnalyzerUI/Dockerfile -t circuit-analyzer-ui:v1 VerilogCircuitAnalyzerUI
docker run -d --name circuit-analyzer-ui --network circuit-analyzer-network --ip 172.16.20.10 -p 3000:5000 circuit-analyzer-ui:v1

# Build the API image
docker build -f VerilogCircuitAnalyzerAPI/Dockerfile -t circuit-analyzer-api:v1 .
docker run -d --name circuit-analyzer-api --network circuit-analyzer-network --ip 172.16.20.11 -p 3001:80 circuit-analyzer-api:v1


#Firefox container
docker run -d `
  --name firefox `
  -p 5800:5800 `
  --network circuit-analyzer-network `
  --ip 172.16.20.20 `
  -v "D:\Facultate\LICENTA\LicenseRepository\Apps\Scripts\VerilogPyParser\input:/data:rw" `
  jlesage/firefox
