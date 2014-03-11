angular.module('bs.app').factory('bsGenie', function(genie, $state, User, AlertService) {
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

    genie({
      id: 'go-home',
      context: appContext,
      magicWords: 'Home',
      data: getUxDataForIcon('home'),
      action: function() {
        $state.go('root.route');
      }
    });

    (function createOptionsWish() {
      var subContext = 'genie-options';
      var optionsData = {
        uxGenie: {
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

    (function createPeopleSearchWish() {
      var subContext = 'people-search';
      var searchData = {
        uxGenie: {
          iIcon: 'fa fa-search',
          subContext: subContext,
          getWishes: function(input, callback) {
            User.query({genie: input}, function(users) {
              var wishes = [];
              _.each(users, function(user) {
                wishes.push({
                  id: 'user-' + user._id,
                  context: subContext,
                  magicWords: [user.name.first, user.name.last, user.username],
                  action: function(wish) {
                    $state.go('home.userPage', {username: wish.data.user.username});
                  },
                  data: {
                    uxGenie: {
                      imgIcon: user.getProfilePicture()
                    },
                    user: user
                  }
                });
              });
              callback(wishes);
            }, function(err) {
              callback();
              AlertService.error(err.message);
            });
          }
        }
      };
      genie({
        id: 'people-search',
        context: appContext,
        magicWords: 'Find People:',
        data: searchData
      });
    })();
  }

  return {
    appContext: appContext,
    getUxDataForIcon: getUxDataForIcon,
    initializeGenie: initializeGenie
  };
});