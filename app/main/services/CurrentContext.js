angular.module('bs.app').factory('CurrentContext', function($rootScope, _, $state) {
  var context = $state.current.context || '';
  var contextChangeEvent = 'contextStateChange';

  function broadcastStateChange(context) {
    $rootScope.$broadcast(contextChangeEvent, context);
  }

  $rootScope.$on('$stateChangeStart', function(event, toState) {
    if (toState.context) {
      contextGetterSetter(toState.context);
    }
  });

  function contextGetterSetter(newContext) {
    if (!_.isUndefined(newContext) && newContext !== context) {
      context = newContext;
      broadcastStateChange(newContext);
    }
    return context;
  }

  return {
    context: contextGetterSetter,
    contextChangeEvent: contextChangeEvent
  }
});