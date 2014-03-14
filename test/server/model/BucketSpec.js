var TestHelper = require('./../TestHelper');
var dbUri = TestHelper.data.db.uri;
var should = require('chai').should();
var expect = require('chai').expect;
var mongoose = require('mongoose');
var clearDB = require('mocha-mongoose')(dbUri);
var _ = require('lodash-node');
var async = require('async');

describe('Bucket Model Spec', function() {
  var mockBucket = null;
  beforeEach(function(done) {
    function createMockModel() {
      TestHelper.data.mock.createInstance('bucket', function(err, bucket) {
        mockBucket = bucket;
        done();
      });
    }

    if (!mongoose.connection.db) {
      mongoose.connect(dbUri, createMockModel);
    } else {
      createMockModel();
    }
  });

  it('can have posts added to it and get those posts', function(done) {
    // Noise bucket to ensure that this works with more than a single bucket in the database.
    var numberOfNoiseBuckets = 15;
    var numberOfNoisePosts = 100;
    var numberOfRealPosts = 10;
    TestHelper.data.mock.createInstance('bucket', numberOfNoiseBuckets, function(err) {
      if (err) return done(err);
      
      TestHelper.data.mock.createInstance('post', numberOfNoisePosts, function(err) {
        if (err) return done(err);

        var posts = TestHelper.data.mock.getModel('post', numberOfRealPosts, {
          buckets: [],
          author: mockBucket.owner
        });

        async.every(posts, function(post, callback) {
          mockBucket.addPost(post, function(err) {
            post.buckets.length.should.equal(1);
            post.buckets[0].should.eql(mockBucket._id);
            callback(!err);
          });
        }, function(success) {
          if (!success) return done(new Error('Not all user streams saved!'));
          mockBucket.getPostsAndShares(function(err, posts) {
            if (err) return done(err);
            expect(posts.length).to.equal(numberOfRealPosts);

            // Verify that all the posts exist!
            for (var i = 0; i < posts.length; i++) {
              var matchingPost = _.find(posts, {_id: posts[i]._id});
              expect(matchingPost).to.exist;
            }
            done();
          });
        });
      });
    });
  });
});