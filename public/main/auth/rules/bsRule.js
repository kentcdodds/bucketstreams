angular.module('bs.app').directive('bsRule', function(Cacher) {
  return {
    restrict: 'A',
    templateUrl: '/main/auth/rules/bsRule.html',
    scope: {
      rule: '=bsRule',
      onEditClick: '&',
      onDeleteClick: '&'
    },
    link: function(scope, el, attrs) {
      var constraintHashtags = scope.rule.constraints.hashtags;
      scope.hashtags = [];

      var constraintBuckets = scope.rule.constraints.buckets;
      scope.buckets = [];

      function addGroup(array, description, groupList) {
        if (groupList && groupList.length) {
          array.push({description: description, list: groupList});
        }
      }

      addGroup(scope.hashtags, 'All: The post must contain all of these', constraintHashtags.all);
      addGroup(scope.hashtags, 'Any: The post must contain at least one of these', constraintHashtags.any);
      addGroup(scope.hashtags, 'None: The post must not contain any of these', constraintHashtags.none);

      var allBuckets = Cacher.bucketCache.getAll(constraintBuckets.all);
      var anyBuckets = Cacher.bucketCache.getAll(constraintBuckets.any);
      var noneBuckets = Cacher.bucketCache.getAll(constraintBuckets.none);

      if (scope.rule.type === 'outbound') {
        addGroup(scope.buckets, 'All: The post must be in all of these', allBuckets);
        addGroup(scope.buckets, 'Any: The post must be in at least one of these', anyBuckets);
        addGroup(scope.buckets, 'None: The post must not be in any of these', noneBuckets);
      } else {
        addGroup(scope.buckets, 'The post will be shared to these buckets', allBuckets);
      }
    }
  }
});