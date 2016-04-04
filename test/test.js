/**
 * Created by ferron on 4/4/16.
 */

var should = require('chai').should();
var expect = require('chai').expect;


var redis = require("redis");
var msgpack = require('msgpack5')();

describe('Redis Serialization', function () {
  var client;

  describe('without json key', function () {

    beforeEach(function (done) {
      client = require("../lib/index")(redis.createClient(), {
        serializer: function (args) {
          return msgpack.encode(args).toString('hex');
        },
        deserializer: function (args) {
          return msgpack.decode(new Buffer(args, 'hex'));
        }
      });
      done();
    });

    afterEach(function (done) {
      client.quit(function () {
        done();
      });
    });

    it('client gets and set string key', function (done) {
      var key = "test-key-asdf", val = {foo: "bar1"};
      client.set(key, val, function (err) {
        if (err) done(err);
        client.get(key, function (err, data) {
          if (err) done(err);
          expect(data).to.deep.equal(val);
          done();
        })
      });
    });

    it('client gets and sets string key even if it is an object when not using jsonKey', function (done) {
      var key = {a: "test-key-asdf"}, val = {foo: "bar2"};
      client.set(key, val, function (err) {
        if (err) done(err);
        client.get('[object Object]', function (err, data) {
          if (err) done(err);
          expect(data).to.deep.equal(val);
          done();
        })
      });
    });
  });
  describe('with json key', function () {
    beforeEach(function (done) {
      client = require("../lib/index")(redis.createClient(), {
        serializer: function (args) {
          return msgpack.encode(args).toString('hex');
        },
        deserializer: function (args) {
          return msgpack.decode(new Buffer(args, 'hex'));
        },
        jsonKey: true
      });
      done();
    });

    afterEach(function (done) {
      client.quit(function () {
        done();
      });
    });

    it('client gets and sets string key even if it is an object when using jsonKey', function (done) {
      var key = {a: "test-key-asdf"}, val = {foo: "bar2"};
      client.set(key, val, function (err) {
        if (err) done(err);
        client.get(key, function (err, data) {
          if (err) done(err);
          expect(data).to.deep.equal(val);
          done();
        })
      });
    });

  });
});
