/*
 * The purpose of this is to listen to common events and broadcast them on an 'alert.{{type}}' event
 * The idea is that a platform-specific implementation of a user alert system will listen to the 'alert.{{type}}'
 * event and respond by showing a message to the user. This must be initialized
 */
angular.module('bs.common.services').factory('AlertEventBroadcaster', function($rootScope, RandomWords, _) {

  function getAlertEvent(name, type, message) {
    return {
      name: name,
      type: type,
      message: message
    };
  }
  
  /*
   * This is intended to be received by some sort of alert service to
   * alert the user of the event.
   */
  function broadcast(alertEvent, error) {
    error = error || {};
    error.message = error.message || '';
    var randomWords = RandomWords[alertEvent.type]();
    var message = [randomWords, alertEvent.message, error.message].join(' ');
    $rootScope.$broadcast('alert.' + alertEvent.type, message);
  }

  // It's important that we write out the whole event name
  //   rather than do some fancy things to create it using variable names.
  //   That way we can grep for the event name...
  var alertEvents = [
    // Share events
    getAlertEvent('share.new'),

    getAlertEvent('share.created.start'),
    getAlertEvent('share.created.success', 'success', 'Post shared!'),
    getAlertEvent('share.created.error', 'error', 'There was a problem sharing post.'),

    getAlertEvent('share.removed.start'),
    getAlertEvent('share.removed.success', 'info', 'Share removed!'),
    getAlertEvent('share.removed.error', 'error', 'There was a problem removing the share.'),

    // Post events
    getAlertEvent('post.created.start'),
    getAlertEvent('post.created.success', 'success', 'Post shared!'),
    getAlertEvent('post.created.error', 'error', 'There was a problem sharing post.'),

    getAlertEvent('post.removed.start'),
    getAlertEvent('post.removed.success', 'info', 'Share removed!'),
    getAlertEvent('post.removed.error', 'error', 'There was a problem removing the post.')
  ];

  return {
    broadcast: broadcast,
    getResponseHandler: function(type) {
      return function(response) {
        broadcast({
          message: response.data.message,
          type: type
        });
      }
    },
    initialize: function(extraEvents) {
      _.each(alertEvents.concat(extraEvents), function(alertEvent) {
        $rootScope.$on(alertEvent.name, function(event, obj, error) {
          if (alertEvent.type) {
            broadcast(alertEvent, error);
          }
          console.log(event.name, arguments);
        });
      });
    }
  };
});