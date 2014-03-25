var _ = require('lodash-node');

var urlRegex = /((http|https|ftp)\:\/\/)?[a-zA-Z0-9\-\.]+\.[a-zA-Z]{2,3}(:[a-zA-Z0-9]*)?\/?([a-zA-Z0-9\-\._\?\,\'\/\\\+&amp;%\$#\=~])*/gi;
var hashtagRegex = /#\w+/gi;
var mentionRegex = /@([a-zA-Z]|_|\d){3,16}/gi;


var Util = {
  addTimestamps: function(schema) {
    schema.add({
      created: Date,
      modified: Date
    });
    schema.pre('save', function (next) {
      var now = new Date();
      this.created = this.created || now;
      this.modified = now;
      next();
    });
  },
  fieldIsUnique: function(id, model, field, value, query, callback) {
    if (!_.isEmpty(value)) {
      var escapedValue = value.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
      var unique = {};
      unique[field] = new RegExp('^' + escapedValue + '$', 'i');
      if (query) {
        unique = {
          $and: [
            query,
            unique
          ]
        };
      }
      model.find(unique, '_id', function(err, results) {
        if (err) return callback(false);
        if (results.length === 0) {
          callback(true);
        } else if (results.length === 1) {
          callback(id === results[0])
        } else {
          callback(false);
        }
      });
    } else {
      callback(true);
    }
  },
  parseForLinkableContent: function(content) {
    return {
      urls: content.match(urlRegex),
      hashtags: (content.match(hashtagRegex) || []).map(function(tag) {
        return tag.substring(1);
      }),
      mentions: (content.match(mentionRegex) || []).map(function(mention) {
        return mention.substring(1);
      })
    };
  },
  addContentField: function(schema) {
    schema.add({
      content: {
        textString: {type: String, required: true},
        linkables: {
          hashtags: [ String ],
          urls: [ String ],
          mentions: [ String ]
        }
      }
    });

    schema.methods.isParsed = function() {
      return !this.content && !this.content.linkables &&
        _.isEmpty(this.content.linkables.urls) &&
        _.isEmpty(this.content.linkables.hashtags) &&
        _.isEmpty(this.content.linkables.mentions);
    };

    schema.methods.parse = function(force) {
      if (!force && this.isParsed()) {
        return;
      }
      this.content = this.content || {};
      this.content.textString = this.content.textString || '';
      this.content.linkables = this.content.linkables || {};

      var parsed = Util.parseForLinkableContent(this.content.textString);
      this.content.linkables.urls = parsed.urls;
      this.content.linkables.hashtags = parsed.hashtags;
      this.content.linkables.mentions = parsed.mentions;
    };

    schema.pre('save', function(next) {
      this.parse();
      next();
    });

  }
};
module.exports = Util;