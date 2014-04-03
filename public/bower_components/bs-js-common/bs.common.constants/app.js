(function() {
  var constants = angular.module('bs.common.constants', []);
  function addConstant(name) {
    if (window[name]) {
      constants.constant(name, window[name]);
    }
  }
  addConstant('_');
  addConstant('moment');
})();
