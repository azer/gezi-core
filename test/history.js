var test = require("prova");
var serial = require("serially");
var history = require("../lib/history");
var urls = require("../lib/urls");
var keywords = require("../lib/keywords");
var reset = require("../").reset;

test('visiting a site', function (t) {
  t.plan(5);

  var now = Date.now();

  serial()
    .run(history.reset)
    .then(history.visit, ['http://en.wikipedia.org/wiki/foo?'])
    .then('record', history.get, ['http://en.wikipedia.org/wiki/foo'])
    .done(function (error, results) {
      t.error(error);

      var id = results.visit[0];
      var record = results.record[0];

      t.ok(record);
      t.equal(record.id, id);
      t.equal(record.url, 'http://en.wikipedia.org/wiki/foo');
      t.ok(record.ts >= now);
    });
});
