require('dotenv').config();
const http = require('http');
const fs   = require('fs');
const path = require('path');

// Читаємо змінні оточення
const PORT        = process.env.PORT || 3000;
const logDir      = process.env.LOG_PATH || './logs';
const logFileName = process.env.LOG_FILENAME || 'access.log';
const logFormat   = (process.env.LOG_FORMAT || 'text').toLowerCase();

// Переконаємося, що папка існує
if (!fs.existsSync(logDir)){
  fs.mkdirSync(logDir, { recursive: true });
}

const logFilePath = path.join(logDir, logFileName);

const server = http.createServer((req, res) => {
  // Збираємо інформацію про запит
  const logEntry = {
    timestamp: new Date().toISOString(),
    method:    req.method,
    url:       req.url,
    headers:   req.headers,
    remote:    req.socket.remoteAddress
  };

  let logLine;
  if (logFormat === 'json') {
    logLine = JSON.stringify(logEntry) + '\n';
  } else {
    // Простий текстовий формат
    logLine = `[${logEntry.timestamp}] ${logEntry.remote} "${logEntry.method} ${logEntry.url}"\n`;
  }

  // Додаємо рядок у файл
  fs.appendFile(logFilePath, logLine, err => {
    if (err) console.error('Error writing log:', err);
  });

  // Відповідь клієнту
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Logged your request!\n');
});

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
