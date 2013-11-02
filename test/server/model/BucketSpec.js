var dbURI = require('./../TestHelper').db.uri;
var should = require('chai').should();
var mongoose = require('mongoose');
var Bucket = require(__dirname + '/model/setup').models.bucket;
var clearDB = require('mocha-mongoose')(dbURI);

describe("Example spec for a model", function() {
  beforeEach(function(done) {
    if (mongoose.connection.db) return done();
    mongoose.connect(dbURI, done);
  });

  it("can be saved", function(done) {
    var mockUser = new User({
      name: 'Test User 1',
      handle: 'testuer1'
    });
    new Bucket({
      owner: mockUser.id,
      name: 'Test Bucket',
      visibility: [],
      contributors: [mockUser.id]
    }).save(done);
  });

  it.skip("can be listed", function(done) {
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