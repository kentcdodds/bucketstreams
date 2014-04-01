angular.module('bs.common.services').factory('CurrentContext', function($rootScope, _, $state) {
  var context = contextGetterSetter($state.current.context);
  var contextChangeEvent = 'contextStateChange';

  function broadcastStateChange() {
    $rootScope.$broadcast(contextChangeEvent, context);
  }

  $rootScope.$on('$stateChangeStart', function(event, toState) {
    contextGetterSetter(toState.context);
  });

  function contextGetterSetter(newContext, icon, data) {
    if (_.isUndefined(newContext)) return context;

    if (_.isString(newContext)) {
      if (!_.isString(icon)) {
        data = icon;
        icon = null;
      }
      newContext = {
        name: newContext,
        icon: icon,
        data: data
      };
    }

    if (!_.isEqual(newContext, context)) {
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