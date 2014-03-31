(function() {
  var constants = angular.module('bs.common.constants', []);
  function addConstant(name) {
    if (window[name]) {
      constants.constant(name, window[name]);
    }
  }
  addConstant('_');
  addConstant('moment');

  angular.module('bs.common', [
    'bs.common.directives',
    'bs.common.filters',
    'bs.common.models',
    'bs.common.services',
    'bs.common.constants'
  ]);
})();
