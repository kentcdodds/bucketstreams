var Util = require('./Util');
var url = require('url');
var ref = require('./ref');
var _ = require('lodash-node');

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;

/**
 * Post:
 *   author: the ID of the user who created it
 *   content: an array that holds all the edits. The last one is the most recent edit.
 *   buckets: Array of buckets in which the post is contained
 */
var schema = new Schema({
  author: {type: ObjectId, ref: ref.user, required: true},
  content: {
    textString: {type: String},
    linkables: {
      hashtags: [ String ],
      urls: [ String ],
      mentions: [ String ]
    },
    multimedia: {
      images: [{
        name: {type: String, default: 'Untitled'},
        url: String
      }]
    }
  },
  sourceData: {
    source: String,
    sourceId: String,
    metadata: {}
  },
  buckets: [{type: ObjectId, ref: ref.bucket, required: true}],
  shares: {type: Number, default: 0},
  favorites: [{type: ObjectId, ref: ref.user, required: false}]
});

Util.addContentField(schema);

Util.addTimestamps(schema);

/**
 * Hijack the parse method so we can remove the linkables.mentions if
 * this came from an outside third party.
 */
var originalParse = schema.methods.parse;
schema.methods.parse = function(force) {
  originalParse.apply(this, arguments);
  // Don't assign mentions from third parties.
  if (this.sourceData && !_.isEmpty(this.sourceData.source)) {
    this.content.linkables.mentions = null;
  }
};

/**
 * This is here if we want to force a parse of mentions.
 * This should be called when something is edited.
 */
schema.methods.forceParseMentions = function() {
  var parse = Util.parseForLinkableContent(this.content.textString);
  this.content.linkables.mentions = parse.mentions;
};

schema.pre('save', function(next) {
  this.isNew && this.parse();
  next();
});

module.exports = {
  schema: schema,
  model: mongoose.model(ref.post, schema)
};