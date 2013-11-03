var request = require('supertest');
var should = require('chai').should();
var expect = require('chai').expect;
var server = require('../../app');

describe('App', function() {
  it('Should load homepage', function(done) {
    request(server).get('/').end(function(err, res) {
      expect(res).to.exist;
      res.status.should.equal(200);
      res.text.should.contain('<!doctype html>');
      done();
    });
  });
});