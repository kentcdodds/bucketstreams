angular.module('bs.directives').directive('bsUsernameInput', function(UtilService, _) {
  var regex = /^([a-zA-Z]|_|\d)*$/;
  var validity = {
    unique: 'unique',
    valid: 'valid',
    length: 'length'
  };
  var checkUniqueness = _.debounce(function(ctrl, value) {
    UtilService.testUniqueness('user', 'username', value).then(function(result) {
      ctrl.$setValidity(validity.unique, result.data.isUnique);
    }, function() {
      // In the case of an error with the server, we're going to assume it's fine.
      ctrl.$setValidity(validity.unique, false);
    });
  }, 200);
  return {
    require: 'ngModel',
    link: function(scope, el, attrs, ctrl) {
      function setAllToTrue() {
        ctrl.$setValidity(validity.unique, true);
        ctrl.$setValidity(validity.valid, true);
        ctrl.$setValidity(validity.length, true);
      }
      setAllToTrue();
      var parser = function(viewValue) {
        if (!viewValue) {
          setAllToTrue();
          return undefined;
        }
        checkUniqueness(ctrl, viewValue);

        var valid = regex.test(viewValue);
        ctrl.$setValidity(validity.valid, valid);


        var length = (viewValue || '').length;
        var validLength = length >= 3 && length <= 16;
        ctrl.$setValidity(validity.length, validLength);
        return viewValue;
      };
      ctrl.$parsers.unshift(parser);
    }
  }
});