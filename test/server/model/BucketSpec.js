var TestHelper = require('./../TestHelper');
var dbUri = TestHelper.data.db.uri;
var should = require('chai').should();
var expect = require('chai').expect;
var mongoose = require('mongoose');
var models = require('../../../model').models;
var clearDB = require('mocha-mongoose')(dbUri);
var _ = require('lodash-node');

describe('Bucket Model Spec', function() {
  beforeEach(function(done) {
    if (mongoose.connection.db) return done();
    mongoose.connect(dbUri, done);
  });

  it('can be saved', function(done) {
    TestHelper.data.mock.createInstance('bucket', function(err) {
      if (err) return done(err);
      done();
    });
  });

  it('can be listed', function(done) {
    var numberOfBuckets = 2;
    TestHelper.data.mock.createInstance('bucket', numberOfBuckets, function(err) {
      if (err) return done(err);

      models.bucket.find({}, function(err, docs){
        if (err) return done(err);
        docs.length.should.equal(numberOfBuckets);
        done();
      });
    });
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

        TestHelper.data.mock.createInstance('bucket', function(err, mockBucket) {
          TestHelper.data.mock.createInstance('post', numberOfRealPosts, {
            authorId: mockBucket.owner,
            buckets: []
          }, function() {
            var i = 0;
            var args = _.last(arguments, arguments.length - 1); // chop off the first argument (error).

            var addPostToBucketAndSave = function(post, callback) {
              mockBucket.addPost(post);
              post.save(function(err) {
                if (err) return done(err);

                post.buckets.length.should.equal(1);
                post.buckets[0].should.eql(mockBucket._id);

                i++;

                if (i < args.length) {
                  addPostToBucketAndSave(args[i], callback);
                } else {
                  callback();
                }
              });
            };

            addPostToBucketAndSave(args[i], function() {
              mockBucket.getPosts(function(err, posts) {
                if (err) return done(err);
                expect(posts.length).to.equal(numberOfRealPosts);

                // Verify that all the posts exist!
                for (i = 0; i < args.length; i++) {
                  var matchingPost = _.find(posts, {_id: args[i]._id});
                  expect(matchingPost).to.exist;
                }
                done();
              });
            });
          });
        });
      });
    });
  });
});