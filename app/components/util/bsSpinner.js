angular.module('bs.directives').directive('bsSpinner', function(_) {
  return {
    restrict: 'EA',
    scope: {
      bsSpinner: '='
    },
    transclude: true,
    template: function(el, attr) {
      switch (attr.size) {
        case 'small':
          attr.textSize = 'xxsmall';
          attr.iconSize = 'large';
          break;
        case 'medium':
          attr.textSize = 'xxlarge';
          attr.iconSize = 'medium-4x';
          break;
        case 'large':
          attr.textSize = 'medium-2x';
          attr.iconSize = 'xxlarge-5x';
          break;
      }
      var textSize = _.isUndefined(attr.textSize) ? '' : 'font-size-' + attr.textSize;
      var iconSize = _.isUndefined(attr.iconSize) ? '' : 'font-size-' + attr.iconSize;
      var display = 'display-inline';

      if (/bottom|top/.test(attr.textPosition)) {
        display = 'display-block';
      }

      var span = _.isUndefined(attr.spinnerText) ? '' : '<span class="spinner-text ' + textSize + ' ' + display + '">' + attr.spinnerText + '</span>';
      var icon = ' <i class="fa fa-spinner fa-spin ' + iconSize + '"></i> ';
      var first = span;
      var second = icon;
      if (/bottom|right/.test(attr.textPosition)) {
        first = icon;
        second = span;
      }
      var ngShow = _.isEmpty(attr.bsSpinner) ? '' : ' ng-show="bsSpinner"';
      return '<div' + ngShow + ' class="loading-spinner text-align-center">' + first + second + '<div ng-transclude></div></div>';
    }
  };
});
