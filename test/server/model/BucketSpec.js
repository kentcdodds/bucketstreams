var TestHelper = require('./../TestHelper');
var dbUri = TestHelper.db.uri;
var should = require('chai').should();
var expect = require('chai').expect;
var mongoose = require('mongoose');
var models = require('../../../model').models;
var clearDB = require('mocha-mongoose')(dbUri);

describe('Bucket Model Spec', function() {
  beforeEach(function(done) {
    if (mongoose.connection.db) return done();
    mongoose.connect(dbUri, done);
  });

  it('can be saved', function(done) {
    TestHelper.getMock.bucket().save(function(err) {
      if (err) return done(err);
      done();
    });
  });

  it('can be listed', function(done) {
    TestHelper.getMock.bucket().save(function(err, model){
      if (err) return done(err);

      TestHelper.getMock.bucket().save(function(err, model){
        if (err) return done(err);

        models.bucket.find({}, function(err, docs){
          if (err) return done(err);
          docs.length.should.equal(2);
          done();
        });
      });
    });
  });
  it('can have posts added to it', function(done) {
    var mockBucket = TestHelper.getMock.bucket();

    mockBucket.save(function(err) {
      var post1 = TestHelper.getMock.post({
        authorId: mockBucket.owner,
        buckets: []
      });
      var post2 = TestHelper.getMock.post({
        authorId: mockBucket.owner,
        buckets: []
      });
      mockBucket.addPost(post1);
      mockBucket.addPost(post2);
      post1.save(function(err) {
        if (err) return done(err);
        post1.buckets.length.should.equal(1);
        post1.buckets[0].should.eql(mockBucket._id);

        post2.save(function(err) {
          if (err) return done(err);
          post2.buckets.length.should.equal(1);
          post2.buckets[0].should.eql(mockBucket._id);

          done();
        });
      });
    });
  })
});