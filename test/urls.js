var test = require("prova");
var urls = require("../lib/urls");

test('simplifying urls', function (t) {
  t.plan(4);
  t.equal(urls.simplify('https://google.com/'), 'https://google.com');
  t.equal(urls.simplify('https://google.com/foo/bar?'), 'https://google.com/foo/bar');
  t.equal(urls.simplify('https://google.com?yo'), 'https://google.com?yo');
  t.equal(urls.simplify('https://google.com?yo'), 'https://google.com?yo');
});
