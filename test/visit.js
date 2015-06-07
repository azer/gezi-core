var test = require("prova");
var reset = require("../").reset;
var visit = require("../lib/visit");
var titles = require('../lib/titles');
var keywords = require('../lib/keywords');

test('visit', function (t) {
  t.plan(4);

  reset(function () {
    visit('http://en.wikipedia.org/wiki/yo?', function (error, rec) {
      t.error(error);

      visit('http://en.wikipedia.org/wiki/YO/#', function (error, copy) {
        t.error(error);
        t.equal(rec.frameId, copy.frameId);
        t.equal(rec.historyId, copy.historyId);
      });
    });
  });
});

test('complete', function (t) {
  t.plan(6);

  var options = {
    url: 'http://wikipedia.bike',
    title: 'wikipedia',
    tags: ['hola', 'wiki', 'gangsters']
  };

  reset(function () {
    visit.complete(options, function (error) {
      t.error(error);

      titles.get(options.url, function (error, title) {
        t.error(error);
        t.ok(title.id);
        t.equal(title.title, options.title);

        keywords.get(options.url, function (error, result) {
          t.error(error);

          result = result.map(function (k) {
            return k.keyword;
          });

          t.deepEqual(result, ['gangsters', 'wiki', 'hola', 'bike',  'wikipedia']);
        });
      });
    });
  });
});
