angular.module('bs.app').factory('CurrentContext', function($rootScope, _, $state) {
  var context = {
    name: $state.current.context || '',
    icon: '',
    data: {}
  };
  var contextChangeEvent = 'contextStateChange';

  function broadcastStateChange() {
    $rootScope.$broadcast(contextChangeEvent, context);
  }

  $rootScope.$on('$stateChangeStart', function(event, toState) {
    var newContext = toState.context;
    if (newContext) {
      contextGetterSetter(newContext);
    }
  });

  function contextGetterSetter(newContext) {
    if (!_.isUndefined(newContext) && !_.isEqual(newContext, context)) {
      if (_.isString(newContext)) {
        newContext = { name: newContext };
      }
      context = newContext;
      broadcastStateChange();
    }
    return context;
  }

  return {
    context: contextGetterSetter,
    contextChangeEvent: contextChangeEvent
  }
});