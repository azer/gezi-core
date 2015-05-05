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

test('listing all open frames', function (t) {
  t.plan(16);

  serial()
    .then(frames.reset)
    .then('pid1', frames.open, ['http://azer.bike'])
    .then('pid2', frames.open, ['http://roadbeats.com'])
    .then('pid3', frames.open, ['https://roadbeats.com?'])
    .then('pid4', frames.open, ['https://en.wikipedia.org'])
    .done(function (error, pids) {
      t.error(error);

      var pid1 = pids.pid1[0];
      var pid2 = pids.pid2[0];
      var pid3 = pids.pid3[0];
      var pid4 = pids.pid4[0];

      t.notEqual(pid1, pid2);
      t.notEqual(pid1, pid4);
      t.notEqual(pid2, pid4);
      t.equal(pid2, pid3);

      frames.all(function (error, list) {
        t.error(error);
        t.equal(list.length, 3);
        t.equal(list[0].id, pid4);
        t.equal(list[1].id, pid3);
        t.equal(list[2].id, pid1);
      });

      frames.touch(pid1, function (error) {
        t.error(error);

        frames.all(function (error, list) {
          t.error(error);
          t.equal(list.length, 3);
          t.equal(list[0].id, pid1);
          t.equal(list[1].id, pid4);
          t.equal(list[2].id, pid3);
        });
      });

    });

});
