angular.module('bs.web.directives').directive('bsNewPostTextarea', function(_) {
  return {
    require: 'ngModel',
    link: function(scope, element, attrs, ctrl) {
      var el = element[0];

      function selectText(start, end) {
        if (el.setSelectionRange) {
          el.setSelectionRange(start, end);
        } else if (el.createTextRange) {
          var range = el.createTextRange();
          range.collapse(true);
          range.moveEnd('character', end);
          range.moveStart('character', start);
          range.select();
        } else if (el.selectionStart) {
          el.selectionStart = start;
          e.selectionEnd = end;
        }
      }

      function insert(originalString, index, insertString) {
        return originalString.substring(0, index) + insertString + originalString.substring(index, originalString.length);
      }

      function getMatchingBucket(text) {
        return _.filter(scope.buckets, function(bucket) {
          return !bucket.isMain && !bucket.selected() && bucket.name.toLowerCase().indexOf(text.toLowerCase()) == 0;
        });
      }

      element.on('keydown', function(event) {
        switch (event.keyCode) {
          case 13:
            var val = element.val();
            var ticIndex = val.indexOf('`');
            if (ticIndex === -1) {
              return;
            }
            var selectionEnd = element.prop('selectionEnd');
            var textBetween = val.substring(ticIndex + 1, selectionEnd);
            var matchingBuckets = getMatchingBucket(textBetween);
            if (matchingBuckets.length) {
              var bucket = _.sortBy(matchingBuckets, 'name')[0];
              bucket.selected(true);
              var firstPart = val.substring(0, ticIndex);
              var secondPart = val.substring(selectionEnd, val.length);
              element.val(firstPart + secondPart);
              ctrl.$setViewValue(firstPart + secondPart);
              scope.$apply();
              event.preventDefault();
            }
            break;
        }
      });

      function parser(viewValue) {
        var val = element.val();
        if (!val || val.indexOf('`') < 0) return viewValue;
        var ticIndex = val.indexOf('`');
        var cursorPosition = element.prop('selectionStart');
        var textBetween = val.substring(ticIndex + 1, cursorPosition);
        var matchingBuckets = getMatchingBucket(textBetween);
        if (matchingBuckets.length) {
          var bucketName = _.sortBy(matchingBuckets, 'name')[0].name;
          var remaining = bucketName.substring(cursorPosition - ticIndex - 1);
          element.val(insert(element.val(), cursorPosition, remaining));
          selectText(cursorPosition, cursorPosition + remaining.length);
        }
        return viewValue;
      }

      ctrl.$parsers.unshift(parser);
    }
  };
});