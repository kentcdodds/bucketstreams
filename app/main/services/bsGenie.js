angular.module('bs.app').factory('bsGenie', function(genie) {
  var appContext = 'bs';
  genie.context(appContext);

  function getUxDataForIcon(icon) {
    return {
      uxGenie: {
        iIcon: 'fa fa-' + icon
      }
    }
  }

  function initializeGenie() {
    (function createOptionsWish() {
      var subContext = 'genie-options';
      var optionsData = {
        uxGenie:{
          iIcon: 'fa fa-cog',
          subContext: subContext
        }
      };
      genie({
        id: 'genie-options',
        context: appContext,
        magicWords: 'Genie Options:',
        data: optionsData
      });

      genie({
        id: 'clear-genie-memory',
        context: subContext,
        magicWords: 'Clear Genie\'s Memory',
        data: getUxDataForIcon('times'),
        action: function() {
          genie.options({
            enteredMagicWords: {}
          });
        }
      });
    })();
  }

  return {
    appContext: appContext,
    getUxDataForIcon: getUxDataForIcon,
    initializeGenie: initializeGenie
  };
});