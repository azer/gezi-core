var test = require("prova");
var serial = require("serially");
var visit = require("../lib/visit");
var frames = require("../lib/frames");
var history = require("../lib/history");
var reset = require("../").reset;
var roadbeats, wikipedia, gezi;

test('listing all frames', function (t) {
  t.plan(9);

  dump(function (error) {
    t.error(error);

    frames.list(function (error, all) {
      t.error(error);

      t.equal(all.length, 3);
      t.equal(all[0].title, gezi.title);
      t.deepEqual(all[0].keywords, ['www', 'surf', 'software', 'browser', 'web', 'gezi']);
      t.equal(all[1].title, wikipedia.title);
      t.deepEqual(all[1].keywords, ['english', 'information', 'wiki', 'encyclopedia', 'free',  'wikipedia']);
      t.equal(all[2].title, roadbeats.title);
      t.deepEqual(all[2].keywords, ['hasankeyf', 'travel', 'journey', 'beats', 'road', 'roadbeats']);
    });

  });
});

test('filtering frames by keywords', function (t) {
  t.plan(8);

  dump(function (error) {
    frames.list(['gezi', 'wiki'], function (error, results) {
      t.equal(results.length, 2);
      t.equal(results[0].title, gezi.title);
      t.equal(results[1].title, wikipedia.title);
    });

    frames.list(['surf', 'travel'], function (error, results) {
      t.equal(results.length, 2);
      t.equal(results[0].title, gezi.title);
      t.equal(results[1].title, roadbeats.title);
    });

    frames.list(['hasankeyf'], function (error, results) {
      t.equal(results.length, 1);
      t.equal(results[0].title, roadbeats.title);
    });
  });
});

test('searching history', function (t) {
  t.plan(15);

  dump(function (error) {
    history.search(['english', 'beats', 'road', 'wiki'], function (error, results) {
      t.error(error);
      t.equal(results.length, 2);
      t.equal(results[0], wikipedia.url);
      t.equal(results[1], roadbeats.url);
    });

    history.search(['www'], function (error, results) {
      t.error(error);
      t.equal(results.length, 1);
      t.equal(results[0], gezi.url);
    });

    history.search(['road', 'road', 'www'], function (error, results) {
      t.error(error);
      t.equal(results.length, 2);
      t.equal(results[0], gezi.url);
      t.equal(results[1], roadbeats.url);
    });

    history.search(['yo'], function (error, results) {
      t.error(error);
      t.equal(results.length, 0);
    });

    history.search([], function (error, results) {
      t.error(error);
      t.equal(results.length, 0);
    });
  });
});

function dump (callback) {
  reset(function () {
    roadbeats = {
      'title': 'Road Beats',
      'tags': ['journey', 'travel', 'hasankeyf'],
      'url': 'http://roadbeats.com'
    };

    wikipedia = {
      'title': 'Wikipedia, the free encyclopedia',
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
