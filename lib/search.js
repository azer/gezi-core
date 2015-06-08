var parallel = require("parallelly");
var keywords = require("./keywords");

module.exports = search;

function search (keywordList, callback) {
  if (keywordList.length == 0) {
    return callback(undefined, []);
  }

  var results = [];
  var search = parallel();

  var i = -1;
  var len = keywordList.length;
  while (++i < len) {
    search.add('results-' + i, keywords.search, [keywordList[i]]);
  }

  search.done(function (errors, results) {
    if (errors) return callback(errors[0]);

    var key;
    for (key in results) {
      results.push.apply(results, results[key][0]);
    }

    results.sort(function (a, b) {
      if (a.ts < b.ts) return 1;
      if (a.ts > b.ts) return -1;
      return 0;
    });

    callback(undefined, refine(results));
  });
}

function refine (results, callback) {
  var refined = [];

  var i = -1;
  var len = results.length;
  while (++i < len) {
    if (refined.indexOf(results[i].url) > -1) continue;
    refined.push(results[i].url);
  }

  return refined;
}
