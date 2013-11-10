var TestHelper = require('./../TestHelper');
var dbUri = TestHelper.data.db.uri;
var should = require('chai').should();
var expect = require('chai').expect;
var mongoose = require('mongoose');
var models = require('../../../model').models;
var clearDB = require('mocha-mongoose')(dbUri);
var _ = require('lodash-node');
var async = require('async');

describe('User Model Spec', function() {
  beforeEach(function(done) {
    if (mongoose.connection.db) return done();
    mongoose.connect(dbUri, done);
  });

  it('can be saved', function(done) {
    TestHelper.data.mock.createInstance('user', function(err) {
      if (err) return done(err);
      done();
    });
  });

  it('can be listed', function(done) {
    var numberOfUsers = 2;
    TestHelper.data.mock.createInstance('user', numberOfUsers, function(err) {
      if (err) return done(err);

      models.user.find({}, function(err, docs){
        if (err) return done(err);
        docs.length.should.equal(numberOfUsers);
        done();
      });
    });
  });

  it('can own and contribute to buckets', function(done) {
    var numberOfBucketsOwned = 10;
    var numberOfBucketsJustContributedTo = 5;
    var totalNumberOfBuckets = numberOfBucketsJustContributedTo + numberOfBucketsOwned;
    TestHelper.data.mock.createInstance('user', function(err, mockUser) {
      if (err) return done(err);

      var bucketsOwned = TestHelper.data.mock.getModel('bucket', numberOfBucketsOwned);
      _.each(bucketsOwned, function(b) {
        mockUser.addBucketAsOwner(b);
      });

      var bucketsContributedTo = TestHelper.data.mock.getModel('bucket', numberOfBucketsJustContributedTo);
      _.each(bucketsContributedTo, function(b) {
        mockUser.addBucketAsContributor(b);
      });

      async.every(bucketsOwned.concat(bucketsContributedTo), function(bucket, callback) {
        bucket.save(function(err) {
          callback(!err);
        });
      }, function(success) {
        if (!success) return done(new Error('Not all user buckets saved!'));

        function checkOwnedBuckets(callback) {
          mockUser.getOwnedBuckets(function(err, savedOwnedBuckets) {
            savedOwnedBuckets.length.should.equal(numberOfBucketsOwned);
            callback(null, !!savedOwnedBuckets);
          });
        }

        function checkNonOwnedContributingBuckets(callback) {
          mockUser.getNonOwnedContributingBuckets(function(err, savedContributingBuckets) {
            savedContributingBuckets.length.should.equal(numberOfBucketsJustContributedTo);
            callback(null, !!savedContributingBuckets);
          });
        }

        function checkTotalBuckets(callback) {
          mockUser.getContributingBuckets(function(err, savedTotalBuckets) {
            savedTotalBuckets.length.should.equal(totalNumberOfBuckets);
            callback(null, !!savedTotalBuckets);
          });
        }

        async.parallel([checkOwnedBuckets, checkNonOwnedContributingBuckets, checkTotalBuckets], function(err, results) {
          if (err) return done(err);
          done();
        });

      });
    });
  });
});