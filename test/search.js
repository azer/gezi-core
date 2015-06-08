var test = require("prova");
var serial = require("serially");
var visit = require("../lib/visit");
var search = require("../lib/search");
var reset = require("../").reset;
var roadbeats, wikipedia, gezi;

test('searching history', function (t) {
  t.plan(21);

  dump(function (error) {
    search(['english', 'beats', 'road', 'wiki'], function (error, results) {
      t.error(error);
      t.equal(results.length, 2);
      t.equal(results[0], wikipedia.url);
      t.equal(results[1], roadbeats.url);
    });

    search(['www'], function (error, results) {
      t.error(error);
      t.equal(results.length, 1);
      t.equal(results[0], gezi.url);
    });

    search(['oa', 'road', 'www'], function (error, results) {
      t.error(error);
      t.equal(results.length, 2);
      t.equal(results[0], gezi.url);
      t.equal(results[1], roadbeats.url);
    });

    search(['çığ'], function (error, results) {
      t.error(error);
      t.equal(results.length, 1);
      t.equal(results[0], roadbeats.url);
    });

    search(['öşü'], function (error, results) {
      t.error(error);
      t.equal(results.length, 1);
      t.equal(results[0], wikipedia.url);
    });

    search(['yo'], function (error, results) {
      t.error(error);
      t.equal(results.length, 0);
    });

    search([], function (error, results) {
      t.error(error);
      t.equal(results.length, 0);
    });
  });
});

function dump (callback) {
  reset(function () {
    roadbeats = {
      'title': 'Road Beats',
      'tags': ['journey', 'travel', 'hasankeyf', "çığ"],
      'url': 'http://roadbeats.com'
    };

    wikipedia = {
      'title': 'Wikipedia, the free encyclopedia - öşü',
      'tags': ['wiki', 'information', 'english'],
      'url': 'http://wikipedia.org'
    };

    gezi = {
      'title': 'Gezi Web Browser',
      'tags': ['software', 'surf', 'www'],
      'url': 'http://gezi.org'
    };

    serial()
      .run(visit, [roadbeats.url])
      .then(visit.complete, [roadbeats])
      .then(visit, [wikipedia.url])
      .then(visit.complete, [wikipedia])
      .then(visit, [gezi.url])
      .then(visit.complete, [gezi])
      .done(callback);
  });
}
