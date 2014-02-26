angular.module('bs.services').factory('AlertService', function(toastr, _) {
  toastr.options.closeButton = true;
  function getResponseHandler(type) {
    return function handleResponse(response) {
      AlertService[type](response.data.message);
    }
  }
  var AlertService = {
    warning: function(string) {
      toastr.warning(string);
    },
    success: function(string) {
      toastr.success(string);
    },
    info: function(string) {
      toastr.info(string);
    },
    error: function(string) {
      toastr.error(string);
    },
    clear: function() {
      toastr.clear();
    },
    handleResponse: {}
  };
  _.each(['warning', 'success', 'info', 'error'], function(type) {
    AlertService.handleResponse[type] = function handleResponse(response) {
      AlertService[type](response.data.message);
    }
  });
  return AlertService;
});