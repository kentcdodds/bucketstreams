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
/*
describe('API', function() {
  var data = require('../../model/data');
  for (var model in data.models) {
    var newItem;
    beforeEach(function(done) {
      newItem = new data.models[model]();
      newItem.save(done);
    });

    afterEach(function(done) {
      newItem.remove(done);
    });
    describe(model, function() {
      it('Should return a ' + model, function(done) {
        request(server).get('/api/' + model).end(function(err, res) {
          expect(res).to.exist;
          expect(res.status).to.equal(200);
          console.log(res.body).to.exist;
          done();
        });
      });
  });
  }
});
  */