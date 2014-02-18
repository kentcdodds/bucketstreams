angular.module('bs.models').factory('Post', function($resource, User, UtilService) {
  var Post = $resource('/api/v1/posts/:id', { id: '@_id' });
  Post.prototype.getAuthor = function() {
    if (!this.authorObj) {
      this.authorObj = User.get({id: this.author});
    }
    return this.authorObj;
  };

  Post.prototype.getText = function() {
    return UtilService.getGrandchild(this, 'content.0.textString') || '';
  };

  Post.prototype.addContent = function(contentString) {
    var content = {
      textString: contentString
    };
    if (this.hasContent) {
    this.content = [];
  }
  this.content.unshift(content);
  };

  Post.prototype.hasContent = function() {
    return UtilService.testHasPosterity(this, 'content.0');
  };

  return Post;
});