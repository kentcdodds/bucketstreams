angular.module('bs.directives').directive('bsValidInput', function(UtilService, _) {
  var setAllToValid = function(ctrl) {
    _.each(ctrl.$error, function(e, key) {
      ctrl.$setValidity(key, true);
    });
  };

  return {
    require: 'ngModel',
    link: function(scope, el, attrs, ctrl) {
      var requestIndex = 0;
      setAllToValid(ctrl);

      var checkUnique = _.debounce(function(model, params, field, value) {
        requestIndex++;
        params = params || {};
        params[field] = value;
        params.requestIndex = requestIndex;
        UtilService.validateModel(model, params).then(function(result) {
          if (~~result.data.requestIndex !== requestIndex) {
            return;
          }
          setAllToValid(ctrl);
          if (!result.data.isValid) {
            _.each(result.data.invalidFields, function(field) {
              ctrl.$setValidity(field.type, false);
            });
          }
        }, function() {
          // In the case of an error with the server, we're going to assume it's fine.
          setAllToValid(ctrl);
        });
      }, 200);

      var parser = function(viewValue) {
        if (!viewValue) {
          setAllToValid(ctrl);
          return undefined;
        }
        var params = scope.$eval(attrs.validationParams);
        checkUnique(attrs.validationModel, params, attrs.bsValidInput, viewValue);
        return viewValue;
      };
      ctrl.$parsers.unshift(parser);
    }
  }
});