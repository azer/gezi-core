var test = require("prova");
var titles = require("../lib/titles");

test('save', function (t) {
  t.plan(4);

  var url = 'https://en.wikipedia.org/wiki/gezi?';
  var title = 'Taksim Gezi Park - Wikipedia, the free encyclopedia';

  titles.reset(function (error) {
    t.error(error);
    titles.save(url, title, function (error) {
      t.error(error);

      titles.get('https://en.wikipedia.org/wiki/Gezi', function (error, record) {
        t.error(error);
        t.equal(record.title, title);
      });
    });
  });
});

test('avoiding duplicate titles', function (t) {
  t.plan(5);

  titles.get('https://en.wikipedia.org/wiki/gezi', function (error, record) {
    t.error(error);

    titles.save('https://en.wikipedia.org/wiki/gezi/?#', 'yo', function (error) {
      t.error(error);

      titles.get('https://en.wikipedia.org/wiki/Gezi/#', function (error, copy) {
        t.error(error);
        t.equal(record.id, copy.id);
        t.equal(copy.title, 'yo');
      });
    });
  });
});
