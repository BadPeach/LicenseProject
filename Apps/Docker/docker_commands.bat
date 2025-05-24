docker network create --driver bridge --subnet 172.16.20.0/24 circuit-analyzer-network
docker network ls
docker network inspect circuit-analyzer-network

# Build the UI image
ng build --configuration=production
docker build -f VerilogCircuitAnalyzerUI/Dockerfile -t circuit-analyzer-ui:v1 VerilogCircuitAnalyzerUI

docker run -d --name circuit-analyzer --network circuit-analyzer-network --ip 172.16.20.10 -p 3000:5000 circuit-analyzer-ui:v1
