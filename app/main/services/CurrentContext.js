angular.module('bs.app').factory('CurrentContext', function($rootScope, _) {
  var context = '';
  var contextChangeEvent = 'contextStateChange';

  function broadcastStateChange(context) {
    $rootScope.$broadcast(contextChangeEvent, context);
  }
  return {
    context: function(newContext) {
      if (!_.isUndefined(newContext)) {
        context = newContext;
        broadcastStateChange(newContext);
      }
      return context;
    },
    contextChangeEvent: contextChangeEvent
  }
});