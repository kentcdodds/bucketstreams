angular.module('bs.directives').directive('bsUsernameInput', function(UtilService, _) {
  var regex = /^([a-zA-Z]|_|\d)*$/;
  var validity = {
    taken: 'taken',
    invalid: 'invalid',
    reserved: 'reserved',
    unavailable: 'unavailable',
    'too long': 'tooLong',
    'too short': 'tooShort'
  };

  function setAllToTrue(ctrl) {
    _.each(validity, function(prop, key) {
      ctrl.$setValidity(validity[key], true);
    });
  }

  var checkValidity = _.debounce(function(ctrl, value) {
    UtilService.testValidUsername(value).then(function(result) {
      setAllToTrue(ctrl);
      if (!result.data.isValid) {
        ctrl.$setValidity(validity[result.data.type], result.data.isValid);
      }
    }, function() {
      // In the case of an error with the server, we're going to assume it's fine.
      setAllToTrue(ctrl);
    });
  }, 200);
  return {
    require: 'ngModel',
    link: function(scope, el, attrs, ctrl) {
      setAllToTrue(ctrl);
      var parser = function(viewValue) {
        if (!viewValue) {
          setAllToTrue(ctrl);
          return undefined;
        }
        checkValidity(ctrl, viewValue);
        return viewValue;
      };
      ctrl.$parsers.unshift(parser);
    }
  }
});