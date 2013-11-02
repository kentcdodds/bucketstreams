var dbURI = require('./../TestHelper').db.uri;
var should = require('chai').should();
var expect = require('chai').expect;
var mongoose = require('mongoose');
var models = require('../../../model').models;
var Bucket = models.bucket;
var User = models.user;
var clearDB = require('mocha-mongoose')(dbURI);

describe('Bucket Model Spec', function() {
  beforeEach(function(done) {
    if (mongoose.connection.db) return done();
    mongoose.connect(dbURI, done);
  });

  it('Can be saved', function(done) {
    var mockUser = new User({
      name: 'Test User 1',
      handle: 'testuer1'
    });
    mockUser.handle = 'testuser1';
    expect(mockUser._doc._id).to.exist;
    console.log(mockUser);
    console.log(mockUser._doc._id);
    console.log(mockUser.name);
    var mockBucket = new Bucket({
      owner: mockUser._id,
      name: 'Test Bucket',
      visibility: [],
      contributors: [mockUser._id]
    });
    mockBucket.save(function(err) {
      console.log(err);
      expect(err).to.not.exist;
      done();
    });
  });

  it.skip('can be listed', function(done) {
    new Dummy({a: 1}).save(function(err, model){
      if (err) return done(err);

      new Dummy({a: 2}).save(function(err, model){
        if (err) return done(err);

        Dummy.find({}, function(err, docs){
          if (err) return done(err);

          // without clearing the DB between specs, this would be 3
          docs.length.should.equal(2);
          done();
        });
      });
    });
  });

  it.skip("can clear the DB on demand", function(done) {
    new Dummy({a: 5}).save(function(err, model){
      if (err) return done(err);

      clearDB(function(err){
        if (err) return done(err);

        Dummy.find({}, function(err, docs){
          if (err) return done(err);

          console.log(docs);

          docs.length.should.equal(0);
          done();
        });
      });
    });
  });
});