var ErrorController = (function() {
  var getErrorJSON;
  var errorCodeMap = {
    400: 'Bad Request',
    401: 'Unauthorized',
    403: 'Insufficient Privileges'
  }

  getErrorJSON = function(code, message) {
    return {
      code: code,
      error: errorCodeMap[code],
      message: message
    }
  }

  return {
    sendErrorJson: function(res, code, message) {
      res.json(code, getErrorJSON(code, message));
    }
  };
})();

module.exports = ErrorController;