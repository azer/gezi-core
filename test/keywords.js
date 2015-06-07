var test = require("prova");
var keywords = require("../lib/keywords");

test('saving keyword & url pairs', function (t) {
  t.plan(7);

  keywords.reset(function (error) {
    t.error(error);

    var url = 'http://en.wikipedia.org/wiki/Gezi';
    var options = {
      'title': 'Taksim Gezi Park - Wikipedia, the free encyclopedia',
      'tags': ['square', 'riot', 'revolution']
    };

    keywords.save(url, options, function (error) {
      t.error(error);

      keywords.get(url, function (error, result) {
        t.error(error);

        result = result.map(function (k) {
          return k.keyword;
        });

        t.deepEqual(result, ["revolution", "riot", "square", "encyclopedia", "free", "park", "taksim", "gezi", "wiki", "wikipedia", "en"]);

        options.tags = options.tags.slice(2);
        options.tags.push('protests');

        keywords.save(url, options, function (error) {
          t.error(error);

          keywords.get(url, function (error, result) {
            t.error(error);

            result = result.map(function (k) {
              return k.keyword;
            });

            t.deepEqual(result, ["protests", "revolution", "encyclopedia", "free", "park", "taksim", "gezi", "wiki", "wikipedia", "en", "riot", "square"]);
          });

        });
      });
    });
  });
});

test('searching keywords', function (t) {
  t.plan(4);

  var data = [
    {
      'url': 'http://diving.com',
      'title': 'Diving Center',
      'tags': ['underwater', 'diving', 'scuba']
    },
    {
      'url': 'http://google.com?q=scuba',
      'title': 'Results for "scuba"'
    }
  ];

  keywords.save(data[0].url, data[0], function (error) {
    t.error(error);

    keywords.save(data[1].url, data[1], function (error) {
      t.error(error);

      keywords.search('scuba', function (error, results) {
        t.error(error);

        results = results.map(function (r) {
          return r.url;
        });

        t.deepEqual(results, ['http://google.com?q=scuba', 'http://diving.com']);
      });
    });
  });

});
