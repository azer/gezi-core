var test = require("prova");
var history = require("../lib/history");

test('visiting a site', function (t) {
  t.plan(6);

  history.reset(function (error) {
    t.error(error);

    var now = Date.now();

    history.visit('http://en.wikipedia.org/wiki/foo?', function (error, id) {
      t.error(error);

      // should create a record on history
      history.get('http://en.wikipedia.org/wiki/foo', function (error, record) {
        t.error(error);
        t.equal(record.id, id);
        t.equal(record.url, 'http://en.wikipedia.org/wiki/foo');
        t.ok(record.ts >= now);
      });

    });
  });
});
