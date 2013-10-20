var expect = require('expect.js');
var mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_CONNECTION_STRING);
var models = require('../../model/models');

describe('Database', function() {
  var newUser;
  before(function(done) {
    newUser = new models.User({name: 'Test User'});
    newUser.save(function(err, createdUser) {
      expect(err).to.be(null);
      expect(createdUser.name).to.be(newUser.name);
      done();
    });
  });

  after(function(done) {
    models.User.findByIdAndRemove(newUser.id, function(err, foundUser) {
      expect(err).to.be(null);
      expect(foundUser.id).to.be(newUser.id);
      done();
    });
  });

  it('Should find user', function(done) {
    models.User.findById(newUser.id, function(err, foundUser) {
      expect(err).to.be(null);
      expect(foundUser.id).to.be(newUser.id);
      done();
    });
  });

  it('Should create, find, and remove post', function(done) {
    var newPost = new models.Post({content: 'Test post'});
    newPost.save(function(err, createdPost) {
      expect(err).to.be(null);
      expect(createdPost.id).to.be(newPost.id);
      models.Post.findByIdAndRemove(createdPost.id, function(err, foundPost) {
        expect(err).to.be(null);
        expect(foundPost.id).to.be(newPost.id);
        done();
      });
    });
  });
});