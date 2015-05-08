var test = require("prova");
var serial = require("serially");
var frames = require("../lib/frames");
var urls = require("../lib/urls");
var keywords = require("../lib/keywords");

test('opening new frames', function (t) {
  t.plan(14);

  frames.reset(function (error) {
    t.error(error);

    frames.open('http://en.wikipedia.org/wiki/foobar?', function (error, frameId) {
      t.error(error);
      t.ok(frameId);
      t.equal(typeof frameId, 'number');

      frames.open('http://en.wikipedia.org/wiki/qux', function (error, newFrameId) {
        t.error(error);
        t.ok(newFrameId);
        t.equal(typeof newFrameId, 'number');
        t.notEqual(frameId, newFrameId);

        frames.get(newFrameId, function (error, frame) {
          t.error(error);
          t.equal(frame.id, newFrameId);
          t.ok(frame.ts > Date.now() - 250);
        });
      });

      frames.get(frameId, function (error, frame) {
        t.error(error);
        t.equal(frame.id, frameId);
        t.ok(frame.ts > Date.now() - 250);
      });

    });
  });
});

test('getting frames by url', function (t) {
  t.plan(5);

  frames.getByUrl('http://en.wikipedia.org/wiki/foobar', function (error, frame){
    t.error(error);

    frames.get(frame.id, function (error, copy) {
      t.error(error);
      t.equal(frame.id, copy.id);
      t.equal(frame.url, copy.url);
      t.equal(frame.ts, copy.ts);
    });
  });
});

test('touching a frame', function (t) {
  t.plan(5);

  frames.open('http://en.wikipedia.org/wiki/touch', function (error, frameId){
    t.error(error);

    frames.get(frameId, function (error, frame) {
      t.error(error);

      setTimeout(function () {

        frames.touch(frameId, function (error) {
          t.error(error);

          frames.get(frameId, function (error, touched) {
            t.error(error);
            t.ok(frame.ts < touched.ts);
          });
        });

      }, 250);
    });
  });
});

test('opening an already opened url', function (t) {
  t.plan(3);

  frames.open('http://en.wikipedia.org/wiki/open', function (error, frameId) {
    t.error(error);

    frames.open('en.wikipedia.org/wiki/open?', function (error, existingFrameId) {
      t.error(error);
      t.equal(frameId, existingFrameId);
    });
  });
});

test('killing a frame', function (t) {
  t.plan(4);

  frames.open('http://en.wikipedia.org/wiki/open', function (error, frameId) {
    t.error(error);

    frames.kill(frameId, function (error) {
      t.error(error);

      frames.open('en.wikipedia.org/wiki/open', function (error, newFrameId) {
        t.error(error);
        t.notEqual(frameId, newFrameId);
      });
    });
  });
});

test('navigating', function (t) {
  t.plan(14);

  serial()
    .run(frames.reset)
    .then('id1', frames.open, ['http://roadbeats.com'])
    .then('id2', frames.open, ['http://roadbeats.com/hasankeyf'])
    .done(function (errors, ids) {
      t.error(errors);

      var id1 = ids.id1[0];
      var id2 = ids.id2[0];

      frames.navigate(id2, 'http://roadbeats.com/yo', function (error, sameId) {
        t.error(error);
        t.equal(id2, sameId);

        frames.get(id2, function (error, frame) {
          t.error(error);
          t.equal(frame.id, id2);
          t.equal(frame.url, 'roadbeats.com/yo');
        });

        frames.navigate(id2, 'http://roadbeats.com?', function (error, newId) {
          t.error(error);
          t.equal(newId, id1);

          frames.get(newId, function (error, frame) {
            t.error(error);
            t.equal(frame.id, newId);
            t.equal(frame.url, 'roadbeats.com');
          });

          frames.all(function (error, list) {
            t.error(error);
            t.equal(list.length, 1);
            t.equal(list[0].id, id1);
          });

        });
      });
    });
});

test('getting all open frames', function (t) {
  t.plan(16);

  serial()
    .run(frames.reset)
    .then('id1', frames.open, ['http://azer.bike'])
    .then('id2', frames.open, ['http://roadbeats.com'])
    .then('id3', frames.open, ['https://roadbeats.com?'])
    .then('id4', frames.open, ['https://en.wikipedia.org'])
    .done(function (error, ids) {
      t.error(error);

      var id1 = ids.id1[0];
      var id2 = ids.id2[0];
      var id3 = ids.id3[0];
      var id4 = ids.id4[0];

      t.notEqual(id1, id2);
      t.notEqual(id1, id4);
      t.notEqual(id2, id4);
      t.equal(id2, id3);

      frames.all(function (error, list) {
        t.error(error);
        t.equal(list.length, 3);
        t.equal(list[0].id, id4);
        t.equal(list[1].id, id3);
        t.equal(list[2].id, id1);
      });

      frames.touch(id1, function (error) {
        t.error(error);

        frames.all(function (error, list) {
          t.error(error);
          t.equal(list.length, 3);
          t.equal(list[0].id, id1);
          t.equal(list[1].id, id4);
          t.equal(list[2].id, id3);
        });
      });

    });
});

test('listing frames with titles and keywords', function (t) {
  t.plan(16);

  var roadbeats = {
    'title': 'Road Beats',
    'tags': ['journey', 'travel', 'hasankeyf'],
    'url': 'http://roadbeats.com'
  };

  var wikipedia = {
    'title': 'Wikipedia, the free encyclopedia',
    'tags': ['wiki', 'information', 'english'],
    'url': 'http://wikipedia.org'
  };

  var gezi = {
    'title': 'Gezi Web Browser',
    'tags': ['software', 'surf', 'www'],
    'url': 'http://gezi.org'
  };

  serial()
    .run(frames.reset)
    .then(frames.open, [roadbeats.url])
    .then(urls.save, [roadbeats.url, roadbeats])
    .then(keywords.save, [roadbeats.url, roadbeats])
    .then(frames.open, [wikipedia.url])
    .then(urls.save, [wikipedia.url, wikipedia])
    .then(keywords.save, [wikipedia.url, wikipedia])
    .then(frames.open, [gezi.url])
    .then(urls.save, [gezi.url, gezi])
    .then(keywords.save, [gezi.url, gezi])
    .then(frames.list)
    .then('gezi+wiki', frames.list, [['gezi', 'wiki']])
    .then('surf+travel', frames.list, [['surf', 'travel']])
    .then('hasankeyf', frames.list, [['hasankeyf']])
    .done(function (errors, results) {
      t.error(errors);

      var all = results.list[0];
      t.equal(all.length, 3);
      t.equal(all[0].title, gezi.title);
      t.deepEqual(all[0].keywords, ['gezi', 'web', 'browser', 'software', 'surf', 'www']);
      t.equal(all[1].title, wikipedia.title);
      t.deepEqual(all[1].keywords, ['wikipedia', 'free', 'encyclopedia', 'wiki', 'information', 'english']);
      t.equal(all[2].title, roadbeats.title);
      t.deepEqual(all[2].keywords, ['roadbeats', 'road', 'beats', 'journey', 'travel', 'hasankeyf']);

      var geziwiki = results['gezi+wiki'][0];
      t.equal(geziwiki.length, 2);
      t.equal(geziwiki[0].title, gezi.title);
      t.equal(geziwiki[1].title, wikipedia.title);

      var surftravel = results['surf+travel'][0];
      t.equal(surftravel.length, 2);
      t.equal(surftravel[0].title, gezi.title);
      t.equal(surftravel[1].title, roadbeats.title);

      var hasankeyf = results['hasankeyf'][0];
      t.equal(hasankeyf.length, 1);
      t.equal(hasankeyf[0].title, roadbeats.title);
    });
});
