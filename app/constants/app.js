(function() {
  var app = angular.module('bs.constants', []);
  app.constant('_', _);
  app.constant('toastr', toastr);
  toastr.options.closeButton = true;
})();