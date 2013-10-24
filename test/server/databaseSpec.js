var expect = require('expect.js');
var mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_CONNECTION_STRING);
var data = require('../../model/data');

describe('Database', function() {
  var mockUser;
  before(function(done) {
    mockUser = new data.models.user({
      name: 'Test User'
    });
    mockUser.save(function(err, createdUser) {
      expect(err).to.be(null);
      expect(createdUser.name).to.be(mockUser.name);
      done();
    });
  });

  after(function(done) {
    data.models.user.findByIdAndRemove(mockUser.id, function(err, foundUser) {
      expect(err).to.be(null);
      expect(foundUser.id).to.be(mockUser.id);
      done();
    });
  });

  it('Should find user', function(done) {
    data.models.user.findById(mockUser.id, function(err, foundUser) {
      expect(err).to.be(null);
      expect(foundUser.id).to.be(mockUser.id);
      done();
    });
  });

  it('Should create, find, and remove post', function(done) {
    var newPost = new data.models.post({content: 'Test post'});
    newPost.save(function(err, createdPost) {
      expect(err).to.be(null);
      expect(createdPost.id).to.be(newPost.id);
      data.models.post.findByIdAndRemove(createdPost.id, function(err, foundPost) {
        expect(err).to.be(null);
        expect(foundPost.id).to.be(newPost.id);
        done();
      });
    });
  });
});