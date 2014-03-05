(function() {
  var app = angular.module('bs.constants', []);
  function addConstant(name) {
    if (window[name]) {
      app.constant(name, window[name]);
    }
  }
  addConstant('_');
  addConstant('toastr');
  addConstant('moment');
  addConstant('genie');
})();