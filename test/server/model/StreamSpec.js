var TestHelper = require('./../TestHelper');
var dbUri = TestHelper.data.db.uri;
var should = require('chai').should();
var expect = require('chai').expect;
var mongoose = require('mongoose');
var clearDB = require('mocha-mongoose')(dbUri);
var _ = require('lodash-node');
var async = require('async');

describe('Stream Model Spec', function() {
  var mockStream = null;
  beforeEach(function(done) {
    function createMockModel() {
      TestHelper.data.mock.createInstance('stream', function(err, stream) {
        mockStream = stream;
        done();
      });
    }

    if (!mongoose.connection.db) {
      mongoose.connect(dbUri, createMockModel);
    } else {
      createMockModel();
    }
  });

  it('can subscribe to buckets', function(done) {
    var numberOfBuckets = 10;

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