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
  res.json(code, getErrorJSON(code, message));
}

function send500Error(res, err) {
  if (err) sendErrorJson(res, 500, err.message);
}

module.exports = {
  sendErrorJson: sendErrorJson,
  send500Error: send500Error
};