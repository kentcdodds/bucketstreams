var TestHelper = require('./../TestHelper');
var dbUri = TestHelper.data.db.uri;
var should = require('chai').should();
var expect = require('chai').expect;
var mongoose = require('mongoose');
var models = require('../../../model').models;
var clearDB = require('mocha-mongoose')(dbUri);
var _ = require('lodash-node');

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
});