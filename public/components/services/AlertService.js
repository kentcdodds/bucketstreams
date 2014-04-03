angular.module('bs.web.services').factory('AlertService', function($rootScope, toastr, _) {
  toastr.options.closeButton = true;
  var AlertService = {
    warning: function(string) {
      toastr.warning(string || 'Warning! Not sure why...');
    },
    success: function(string) {
      toastr.success(string || 'Success!');
    },
    info: function(string) {
      toastr.info(string || 'Heads up!');
    },
    error: function(string) {
      toastr.error(string || 'Something went wrong...');
    },
    clear: function() {
      toastr.clear();
    },
    handleResponse: {}
  };
  var alertTypes = ['warning', 'success', 'info', 'error'];
  _.each(alertTypes, function(type) {
    AlertService.handleResponse[type] = function(response) {
      AlertService[type](response.data.message);
    };
    $rootScope.$on('alert.' + type, function(event, message) {
      AlertService[type](message);
    });
  });
  return AlertService;
});