angular.module('bs.common.models').factory('Share', function($resource, BaseUrl, Cacher) {
  var Share = $resource(BaseUrl + '/api/v1/rest/shares/:id', { id: '@_id' });
  Share.prototype.getAuthor = function() {
    return Cacher.userCache.get(this.author);
  };
  Share.prototype.getPost = function() {
    return Cacher.postCache.get(this.sourcePost);
  };
  Share.prototype.getBuckets = function() {
    return Cacher.bucketCache.getAll(this.buckets);
  };
  Share.prototype.getHtml = function() {
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
      if (url.indexOf('http://') !== 0 || url.indexOf('https://') !== 0) {
        url = 'http://' + url;
      }
      html = html.replace(new RegExp(url, 'g'), '<a href="' + url + '">' + url + '</a>');
    });
    return html;
  };
  return Share;
});