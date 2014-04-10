angular.module('bs.common.models').factory('Post', function($resource, BaseUrl, Cacher, _) {
  var Post = $resource(BaseUrl + '/api/v1/rest/posts/:id', { id: '@_id' });
  Post.prototype.getAuthor = function() {
    return Cacher.userCache.get(this.author);
  };
  Post.prototype.getComments = function() {
    return Cacher.commentCache.where({owningPost: this._id});
  };
  Post.prototype.toggleFavorite = function(_id) {
    if (_.isObject(_id)) {
      _id = _id._id;
    }
    this.favorites = this.favorites || [];
    if (_.contains(this.favorites, _id)) {
      this.favorites = _.remove(this.favorites, _id);
    } else {
      this.favorites.push(_id);
    }
    return this.$save();
  };
  Post.prototype.hasFavorited = function(_id) {
    if (_.isObject(_id)) {
      _id = _id._id;
    }
    return _.contains(this.favorites, _id);
  };
  Post.prototype.getBuckets = function() {
    return Cacher.bucketCache.getAll(this.buckets);
  };
  Post.prototype.getHtml = function() {
    if (!this.content || !this.content.textString) return '<span></span>';

    var html = '<span>' + this.content.textString + '</span>';
    if (_.isEmpty(this.content.linkables)) {
      return html;
    }

    _.each(this.content.linkables.mentions, function(mention) {
      html = html.replace(new RegExp('@' + mention, 'g'), '<a href="/' + mention + '">@' + mention + '</a>');
    });
    _.each(this.content.linkables.hashtags, function(tag) {
      html = html.replace(new RegExp('#' + tag, 'g'), '<a href="/hashtags/' + tag + '">#' + tag + '</a>');
    });
    _.each(this.content.linkables.urls, function(url) {
      var fullUrl = url;
      if (url.indexOf('http://') !== 0 || url.indexOf('https://') !== 0) {
        fullUrl = '//' + url;
      }
      html = html.replace(new RegExp(url, 'g'), '<a href="' + fullUrl + '">' + url + '</a>');
    });
    return html;
  };
  return Post;
});