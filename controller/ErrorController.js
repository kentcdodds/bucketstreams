var errorCodeMap = {
  400: 'Bad Request',
  401: 'Unauthorized',
  403: 'Insufficient Privileges'
};

function getErrorJSON(code, message) {
  return {
    code: code || 500,
    error: errorCodeMap[code] || 'Unknown',
    message: message || 'This occurred for unknown reasons...'
  }
}

module.exports = {
  sendErrorJson: function(res, code, message) {
    res.json(code, getErrorJSON(code, message));
  }
};