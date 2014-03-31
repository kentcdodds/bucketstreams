angular.module('bs.web.app').controller('RulesCtrl', function($scope, $window, $location, $http, AlertService, _, CommonModalService) {
  $scope.connectedAccounts = $scope.currentUser.connectedAccounts;
  $scope.outboundRules = $scope.currentUser.rules;
  var openProvider = $location.search().provider || 'facebook';
  $scope.providers = [
    { icon: 'facebook', name: 'facebook', display: 'Facebook', url: 'http://www.facebook.com/' },
    { icon: 'twitter', name: 'twitter', display: 'Twitter', url: 'https://twitter.com/account/redirect_by_id/' },
//    { icon: 'google-plus', name: 'google', display: 'Google+', url: 'http://plus.google.com/' }
  ];
  _.each($scope.providers, function(provider) {
    provider.isOpen = openProvider === provider.name;
    provider.isConnected = $scope.currentUser.isConnectedTo(provider.name);
    $scope.connectedAccounts[provider.name].rules = $scope.connectedAccounts[provider.name].rules || {};
    if (provider.isConnected) {
      provider.url += $scope.connectedAccounts[provider.name].accountId;
    }
    provider.ruleGroups = [
      {
        type: 'inbound',
        displayType: 'Inbound',
        rules: $scope.connectedAccounts[provider.name].rules.inbound,
        leftIconClass: provider.name + ' color-' + provider.name,
        rightIconClass: 'bitbucket color-bs-blue-0'
      },
      {
        type: 'outbound',
        displayType: 'Outbound',
        rules: $scope.connectedAccounts[provider.name].rules.outbound,
        leftIconClass: 'bitbucket color-bs-blue-0',
        rightIconClass: provider.name + ' color-' + provider.name
      }
    ];
  });

  $scope.disconnect = function(provider) {
    CommonModalService.confirm({
      header: 'Disconnect ' + provider.display,
      message: 'This will not remove any posts on Bucket Streams that were imported from ' + provider.display +
        ' and it wont delete rules associated with ' + provider.display +
        ', but Bucket Streams will no longer be able to import or export posts to or from ' + provider.display + '.',
      yesButton: 'I\'m sure',
      cancelButton: 'Never mind'
    }).result.then(function() {
        provider.isConnected = false;
        $scope.currentUser.disconnectFrom(provider.name).then(function() {
          AlertService.info('Disconnected ' + provider.display);
        }, function error(err) {
          AlertService.error('Problem disconnecting ' + provider.display);
          provider.isConnected = true;
        });
      });
  };


  $scope.connect = function(provider) {
    $window.location.href = '/third-party/' + provider.name + '?destination=' + encodeURIComponent($location.path() + '?provider=' + provider.name);
  };

  function createOrEditRule(rule, provider, type) {
    CommonModalService.createOrEditRule(rule, provider, type, $scope.userBuckets).result.then(function(resultingRule) {
      $scope.currentUser.addOrUpdateRule(provider.name, type, resultingRule).then(function() {
        AlertService.success('Rule saved');
      }, AlertService.handleResponse.error);
    });
  }

  $scope.createRule = function(provider, type) {
    createOrEditRule(null, provider, type);
  };

  $scope.editRule = createOrEditRule;

  $scope.deleteRule = function(rule, provider, type) {
    CommonModalService.confirm({
      header: 'Delete Rule' + (!rule.name ? '' : ': ' + rule.name),
      message: 'This will not delete posts that were imported using this rule, ' +
        'but no more posts will be imported as a result of this rule if deleted.',
      yesButton: 'Delete',
      cancelButton: 'Cancel'
    }).result.then(function() {
        $scope.currentUser.deleteRule(provider.name, type, rule).then(function() {
          AlertService.info('Rule deleted');
        }, AlertService.handleResponse.error);
      });
  };

  $scope.runRulesManually = function() {
    $scope.runningRules = true;
    $http.get('/api/v1/util/run-manual-import').then(function(response) {
      // All of this mess is just to build a user-friendly alert message...
      var posts = response.data.posts;
      var totalTwitter = (posts.twitter || []).length;
      var totalFacebook = (posts.facebook || []).length;
      var tweets = '';
      if (totalTwitter) {
        tweets = '<i class="fa fa-twitter"> ' + totalTwitter + ' tweet' + (totalTwitter > 1 ? 's' : '') + '<br />';
      }
      var facebookPosts = '';
      if (totalFacebook) {
        facebookPosts= '<i class="fa fa-facebook"> ' + totalFacebook + ' post' + (totalFacebook > 1 ? 's' : '') + '<br />';
      }
      var message = 'Done! No posts or tweets to import!';
      var totalPosts = totalTwitter + totalFacebook;
      if (totalPosts) {
        message = 'Done! ' + totalPosts + ' post' + (totalPosts > 1 ? 's' : '') + ' imported!<br />' +
          tweets + facebookPosts;
      }
      AlertService.success(message);
    }, AlertService.handleResponse.error).finally(function(data) {
      $scope.runningRules = false;
    });
  }
});