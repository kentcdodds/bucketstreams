angular.module('bs.common.filters').filter('bsEllipsis', function() {
  return function filter(input, totalChars) {
    if (!input || input.length <= totalChars) {
      return input;
    } else {
      var subString = input.substring(0, totalChars - 3);
      return subString.substring(0, subString.lastIndexOf(' ')) + ' ...';
    }
  }
});