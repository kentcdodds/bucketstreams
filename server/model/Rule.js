var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;
var ref = require('./ref');

/**
 * Rule:
 *    type: Whether it is an inbound rule (from Twitter to BucketStreams) or an outbound rule (from BucketStreams to Facebook)
 *    constraints: What the post must or must not contain for the rule to apply
 *      hashtags: The post must contain any/all/none of these hashtags (unless the respective list is empty)
 *        For outbound rules, the post must contain these hashtags. For inbound rules the post must contain these hashtags.
 *      buckets: The post must be in any/all/none of these buckets (unless the respective list is empty)
 *        For outbound rules, the post must be in these buckets. For inbound rules the post will go to these buckets.
 *        For inbound rules, any and none are not considered. Only buckets in the all list will be considered.
 */
var schema = new Schema({
  type: String,
  constraints: {
    hashtags: {
      any: [ String ],
      all: [ String ],
      none: [ String ]
    },
    buckets: {
      any: [{type: ObjectId, ref: ref.bucket}],
      all: [{type: ObjectId, ref: ref.bucket}],
      none: [{type: ObjectId, ref: ref.bucket}]
    }
  }
});

module.exports = {
  schema: schema
  // Intentionally no model.
  // This is meant to be embedded.
}