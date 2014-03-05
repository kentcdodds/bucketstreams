angular.module('bs.app').factory('bsGenie', function(genie, $window) {
  var appContext = 'bs';
  genie.context(appContext);
  var bsGenie = {
    getUxDataForIcon: function(icon) {
      return {
        uxGenie: {
          iIcon: 'fa fa-' + icon
        }
      }
    },
    initializeGenie: function() {
      genie({
        id: 'submit-feedback',
        context: appContext,
        magicWords: 'Submit Feedback',
        data: bsGenie.getUxDataForIcon('bullhorn'),
        action: function() {
          $window.open('https://bitbucket.org/kentcdodds/bucketstreams/issues/new');
        }
      });
    }
  };
  return bsGenie;
});