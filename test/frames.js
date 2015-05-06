var test = require("prova");
var serial = require("serially");
var frames = require("../lib/frames");

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

test('listing all open frames', function (t) {
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
