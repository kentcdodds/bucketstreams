(function() {
  var app = angular.module('bs.web.constants', []);
  function addConstant(name) {
    if (window[name]) {
      app.constant(name, window[name]);
    }
  }
  addConstant('toastr');
  addConstant('genie');
  app.constant('BASE_URL', '/');
})();