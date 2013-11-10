var TestHelper = require('./../TestHelper');
var dbUri = TestHelper.data.db.uri;
var should = require('chai').should();
var expect = require('chai').expect;
var mongoose = require('mongoose');
var models = require('../../../model').models;
var clearDB = require('mocha-mongoose')(dbUri);
var _ = require('lodash-node');
var async = require('async');

describe('Stream Model Spec', function() {
  beforeEach(function(done) {
    if (mongoose.connection.db) return done();
    mongoose.connect(dbUri, done);
  });

  it('can be saved', function(done) {
    TestHelper.data.mock.createInstance('stream', function(err) {
      if (err) return done(err);
      done();
    });
  });

  it('can be listed', function(done) {
    var numberOfStreams = 2;
    TestHelper.data.mock.createInstance('stream', numberOfStreams, function(err) {
      if (err) return done(err);

      models.stream.find({}, function(err, docs){
        if (err) return done(err);
        docs.length.should.equal(numberOfStreams);
        done();
      });
    });
  });

  it('can subscribe to buckets', function(done) {
    var numberOfBuckets = 10;
    TestHelper.data.mock.createInstance('stream', function(err, mockStream) {
      if (err) return done(err);

      var buckets = TestHelper.data.mock.getModel('bucket', numberOfBuckets);
      async.every(buckets, function(bucket, callback) {
        bucket.save(function(err) {
          callback(!err);
        });
      }, function(success) {
        if (!success) return done(new Error('Not all user buckets saved!'));

        _.each(buckets, function(b) {
          mockStream.subscribeToBucket(b);
        });

        mockStream.save(function(err) {
          mockStream.getBucketSubscriptions(function(err, bucketSubscriptions) {
            if (err) return done(err);

            bucketSubscriptions.length.should.equal(numberOfBuckets);
            done();
          });
        });
      });
    });
  });
});