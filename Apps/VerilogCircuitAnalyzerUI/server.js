//Install express server
const express = require('express');
const path = require('path');
var cors = require('cors')

const app = express();
app.use(cors())
// Serve only the static files form the dist directory
app.use(express.static(__dirname + '/dist/verilog-circuit-analyzer-ui/browser'));

const winston = require('winston')
const consoleTransport = new winston.transports.Console({
  format: winston.format.combine(
    winston.format.cli(),
    winston.format.splat()
  )
})

const myWinstonOptions = {
  level: process.env.LOG_LEVEL || 'silly',
  levels: winston.config.npm.levels,
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
  transports: [consoleTransport]
}
const logger = new winston.createLogger(myWinstonOptions)

function logRequest(req, res, next) {
  logger.info(req.url)
  next()
}

app.use(logRequest)

app.get('/', function(req,res) {
  res.sendFile(path.join(__dirname+'/dist/verilog-circuit-analyzer-ui/browser/index.html'));
});

app.get('/demo-circuit-display', function(req,res) {
    res.sendFile(path.join(__dirname+'/dist/verilog-circuit-analyzer-ui/browser/index.html'));
  });

app.get('/circuit-analyzer', function(req,res) {
   res.sendFile(path.join(__dirname+'/dist/verilog-circuit-analyzer-ui/browser/index.html'));
});


// Start the app by listening on the default Heroku port
app.listen(process.env.PORT || 4200, '0.0.0.0',() => {
  logger.info(`
      ################################################
      🛡️  Server listening on port: ${process.env.PORT || 4200} 🛡️
      ################################################
    `);
});
