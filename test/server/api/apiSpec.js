var server = require('../../../app');
var request = require('supertest');

var TestHelper = require('./../TestHelper');
var dbUri = TestHelper.data.db.uri;
var mongoose = require('mongoose');
var clearDB = require('mocha-mongoose')(dbUri);
var should = require('chai').should();
var expect = require('chai').expect;
var _ = require('lodash-node');
var async = require('async');

describe.only('API', function() {

  var mockUser = null;
  beforeEach(function(done) {
    function createMockModel() {
      TestHelper.data.mock.createInstance('user', function(err, user) {
        mockUser = user;
        done();
      });
    }

    if (!mongoose.connection.db) {
      mongoose.connect(dbUri, createMockModel);
    } else {
      createMockModel();
    }
  });


  it('should return unauthenticated error without authentication', function(done) {
    request(server).get('/api/v1/users/' + mockUser.id).end(function(err, res) {
      if (err) return done(err);
      res.status.should.equal(401);
      done();
    });
  });
});