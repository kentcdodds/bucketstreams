angular.module('bs.directives').directive('bsValidInput', function(UtilService, _) {
  var setAllToValid = function(ctrl) {
    _.each(ctrl.$error, function(e, key) {
      ctrl.$setValidity(key, true);
    });
  };
  var checkUnique = _.debounce(function(ctrl, model, params, field, value) {
    params = params || {};
    params[field] = value;
    UtilService.validateModel(model, params).then(function(result) {
      setAllToValid(ctrl);
      if (!result.data.isValid) {
        console.log(result);
        _.each(result.data.invalidFields, function(field) {
          ctrl.$setValidity(field.type, false);
        });
      }
    }, function() {
      // In the case of an error with the server, we're going to assume it's fine.
      setAllToValid(ctrl);
    });
  }, 200);
  return {
    require: 'ngModel',
    link: function(scope, el, attrs, ctrl) {
      setAllToValid(ctrl);
      var parser = function(viewValue) {
        if (!viewValue) {
          setAllToValid(ctrl);
          return undefined;
        }
        var params = scope.$eval(attrs.validationParams);
        checkUnique(ctrl, attrs.validationModel, params, attrs.bsValidInput, viewValue);
        return viewValue;
      };
      ctrl.$parsers.unshift(parser);
    }
  }
});