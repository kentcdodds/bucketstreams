angular.module('bs.services').factory('AlertService', function(toastr) {
  toastr.options.closeButton = true;
  return {
    warning: function(string) {
      toastr.warning(string);
    },
    success: function(string) {
      toastr.success(string);
    },
    error: function(string) {
      toastr.error(string);
    },
    clear: function() {
      toastr.clear();
    }
  }
});