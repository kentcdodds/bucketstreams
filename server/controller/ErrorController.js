var logger = require('winston');
var errorCodeMap = {
  400: 'Bad Request',
  401: 'Unauthorized',
  403: 'Insufficient Privileges',
  500: 'Internal Server Error'
};

function getErrorJSON(code, message) {
  return {
    code: code || 500,
    error: errorCodeMap[code] || 'Unknown',
    message: message || 'This occurred for unknown reasons...'
  }
}

function sendErrorJson(res, code, message) {
  logger.warn(message);
  res.json(code, getErrorJSON(code, message));
}

module.exports = {
  sendErrorJson: sendErrorJson
};