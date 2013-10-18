var request = require('supertest');
var expect = require('expect.js');
var server = require('../../app');

describe('App', function() {
  it('Should load homepage', function(done) {
    request(server).get('/').end(function(err, res) {
      expect(res).to.exist;
      expect(res.status).to.equal(200);
      expect(res.text).to.contain('<!doctype html>');
      done();
    });
  });
});