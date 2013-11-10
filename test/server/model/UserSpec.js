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

  it('can have buckets', function(done) {
    var numberOfBuckets = 10;
    TestHelper.data.mock.createInstance('user', 1, function(err, mockUser) {
      if (err) return done(err);

      var buckets = TestHelper.data.mock.getModel('bucket', numberOfBuckets);
      for (var bucket in buckets) {
        mockUser.addBucketAsOwner(bucket);
      }

      async.every(buckets, function(bucket, callback) {
        bucket.save(function(err) {
          callback(!err);
        });
      }, function(success) {
        if (!success) return done(new Error("Not all user buckets saved!"));

        mockUser.getContributingBuckets(function(savedBuckets) {
          if (!savedBuckets) return done(err);

          savedBuckets.length.should.equal(numberOfBuckets);
          done();
        });
      });
    });
  });
});